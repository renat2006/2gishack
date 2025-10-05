import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { title, lon, lat, id } = await request.json();

    if (!title || !lon || !lat) {
      return NextResponse.json({ error: 'Недостаточно данных для поиска' }, { status: 400 });
    }

    const apiKey = process.env.NEXT_PUBLIC_2GIS_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'API ключ 2ГИС не настроен' }, { status: 500 });
    }

    // Поиск объекта в 2ГИС по координатам и названию
    const searchUrl = `https://catalog.api.2gis.com/3.0/items/geosearch?q=${encodeURIComponent(title)}&point=${lon},${lat}&radius=200&key=${apiKey}&fields=items.point,items.name,items.address_name,items.rubrics,items.contact_groups,items.schedule,items.rating,items.reviews,items.photos,items.attributes,items.context`;

    const response = await fetch(searchUrl);
    if (!response.ok) {
      throw new Error(`Ошибка 2ГИС API: ${response.status}`);
    }

    const result = await response.json();
    console.warn('Ответ от 2ГИС API:', result);

    const items = result.result?.items || [];
    console.warn('Найденные объекты:', items.length);

    if (items.length === 0) {
      console.warn('Объект не найден в 2ГИС');
      return NextResponse.json({
        error: 'Объект не найден в 2ГИС',
        fallback: {
          name: title,
          address: 'Адрес не найден',
          rating: null,
          website: null,
        },
      });
    }

    // Берём первый найденный объект
    const item = items[0];

    // Извлекаем контакты
    const contacts = item.contact_groups || [];
    const phones = contacts.find((c: any) => c.type === 'phone')?.contacts || [];
    const websites = contacts.find((c: any) => c.type === 'website')?.contacts || [];
    const emails = contacts.find((c: any) => c.type === 'email')?.contacts || [];

    // Извлекаем расписание
    const schedule = item.schedule || {};
    const scheduleText = schedule.text || 'Расписание не указано';

    // Извлекаем рейтинг и отзывы
    const rating = item.rating || {};
    const reviews = item.reviews || {};

    // Извлекаем фотографии
    const photos = item.photos || [];
    const mainPhoto = photos.find((p: any) => p.type === 'main') || photos[0];

    // Извлекаем атрибуты
    const attributes = item.attributes || [];

    const detailedInfo = {
      // Основная информация
      name: item.name || title,
      address: item.address_name || 'Адрес не указан',
      description: item.context?.description || '',

      // Контакты
      contacts: {
        phones: phones.map((p: any) => p.value),
        websites: websites.map((w: any) => w.value),
        emails: emails.map((e: any) => e.value),
      },

      // Расписание
      schedule: {
        text: scheduleText,
        raw: schedule,
      },

      // Рейтинг и отзывы
      rating: {
        value: rating.value || null,
        count: rating.count || 0,
        reviews: reviews.count || 0,
      },

      // Фотографии
      photos: photos.map((p: any) => ({
        image_url: p.url,
        type: p.type,
        width: p.width,
        height: p.height,
      })),
      mainPhoto: mainPhoto
        ? {
            image_url: mainPhoto.url,
            width: mainPhoto.width,
            height: mainPhoto.height,
          }
        : null,

      // Рубрики
      rubrics: item.rubrics || [],

      // Атрибуты
      attributes: attributes.map((attr: any) => ({
        name: attr.name,
        value: attr.value,
        type: attr.type,
      })),

      // Координаты
      coordinates: {
        lon: item.point?.lon || lon,
        lat: item.point?.lat || lat,
      },

      // Метаданные
      metadata: {
        id: item.id || id,
        source: '2gis',
        lastUpdated: new Date().toISOString(),
      },
    };

    console.warn('Отправляем подробную информацию:', detailedInfo);
    return NextResponse.json(detailedInfo);
  } catch (error) {
    console.error('Ошибка получения данных из 2ГИС:', error);
    return NextResponse.json(
      {
        error: 'Ошибка получения данных из 2ГИС',
        details: error instanceof Error ? error.message : 'Неизвестная ошибка',
      },
      { status: 500 }
    );
  }
}
