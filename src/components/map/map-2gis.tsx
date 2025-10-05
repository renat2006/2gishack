'use client';

import { useEffect, useRef, useState } from 'react';

interface Map2GISProps {
  className?: string;
  center?: [number, number];
  zoom?: number;
}

interface MarkerData {
  lon: number;
  lat: number;
  title?: string;
  address?: string;
  score?: number;
  website?: string;
  id?: string;
  distance?: number;
}

export function Map2GIS({
  className = '',
  center = [
    Number(process.env.NEXT_PUBLIC_MAP_CENTER_LNG) || 37.6173,
    Number(process.env.NEXT_PUBLIC_MAP_CENTER_LAT) || 55.7558,
  ],
  zoom = Number(process.env.NEXT_PUBLIC_MAP_ZOOM) || 12,
}: Map2GISProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const markersRef = useRef<any[]>([]);
  const routeRef = useRef<any | null>(null);
  const mapRef = useRef<any | null>(null);
  const mapglAPIRef = useRef<any | null>(null);

  useEffect(() => {
    let map: any | null = null;

    const initMap = async () => {
      const apiKey = process.env.NEXT_PUBLIC_2GIS_API_KEY;

      if (!apiKey || apiKey === 'your_api_key_here') {
        setError('API ключ не настроен. Добавьте NEXT_PUBLIC_2GIS_API_KEY в .env.local');
        setIsLoading(false);
        return;
      }

      if (!mapContainer.current) {
        setIsLoading(false);
        return;
      }

      try {
        const { load } = await import('@2gis/mapgl');
        const mapglAPI = await load();

        const isDark =
          window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        const lightStyle = process.env.NEXT_PUBLIC_2GIS_STYLE_LIGHT;
        const darkStyle = process.env.NEXT_PUBLIC_2GIS_STYLE_DARK;

        map = new mapglAPI.Map(mapContainer.current, {
          center,
          zoom,
          key: apiKey,
          style: (isDark ? darkStyle : lightStyle) || undefined,
        });

        mapRef.current = map;
        mapglAPIRef.current = mapglAPI;

        let mq: MediaQueryList | null = null;
        let handler: ((e: MediaQueryListEvent) => void) | null = null;
        if (window.matchMedia) {
          mq = window.matchMedia('(prefers-color-scheme: dark)');
          handler = (e: MediaQueryListEvent) => {
            try {
              map && map.setStyle && map.setStyle(e.matches ? darkStyle : lightStyle);
            } catch {
              // Игнорируем ошибки
            }
          };
          mq.addEventListener?.('change', handler);
        }

        // Функция для получения подробной информации из 2ГИС API
        const _getDetailedInfo = async (data: MarkerData) => {
          try {
            // Поиск объекта в 2ГИС по координатам
            const searchUrl = `https://catalog.api.2gis.com/3.0/items/geosearch?q=${encodeURIComponent(data.title || '')}&point=${data.lon},${data.lat}&radius=100&key=${process.env.NEXT_PUBLIC_2GIS_API_KEY}&fields=items.point,items.name,items.address_name,items.rubrics,items.contact_groups,items.schedule,items.rating,items.reviews,items.photos,items.attributes`;

            const response = await fetch(searchUrl);
            if (!response.ok) throw new Error('Ошибка поиска в 2ГИС');

            const result = await response.json();
            const item = result.result?.items?.[0];

            if (item) {
              return {
                name: item.name || data.title,
                address: item.address_name || data.address,
                rubrics: item.rubrics || [],
                contacts: item.contact_groups || [],
                schedule: item.schedule || {},
                rating: item.rating || data.score,
                reviews: item.reviews || {},
                photos: item.photos || [],
                attributes: item.attributes || {},
              };
            }
          } catch (err) {
            console.error('Ошибка получения данных из 2ГИС:', err);
          }

          return {
            name: data.title,
            address: data.address,
            rating: data.score,
            website: data.website,
            distance: data.distance,
          };
        };

        // Хелпер для создания HTML попапа в стиле 2ГИС
        const createPopupHTML = (data: MarkerData) => {
          return `
          <div style="
            background: #ffffff;
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08);
            padding: 0;
            min-width: 280px;
            max-width: 320px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            position: relative;
            overflow: hidden;
          ">
            <!-- Заголовок в стиле 2ГИС -->
            <div style="
              background: #f8f9fa;
              border-bottom: 1px solid #e5e7eb;
              padding: 16px;
              display: flex;
              align-items: center;
              gap: 12px;
            ">
              <div style="
                width: 36px;
                height: 36px;
                border-radius: 8px;
                background: #00a85a;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: 600;
                font-size: 14px;
                flex-shrink: 0;
              ">
                ${data.score ? data.score.toFixed(1) : '★'}
              </div>
              <div style="flex: 1; min-width: 0;">
                <div style="
                  font-weight: 600;
                  font-size: 16px;
                  color: #1f2937;
                  margin-bottom: 4px;
                  line-height: 1.3;
                ">
                  ${data.title || 'Жилой комплекс'}
                </div>
                ${
                  data.address
                    ? `
                  <div style="
                    font-size: 13px;
                    color: #6b7280;
                    line-height: 1.4;
                  ">
                    ${data.address}
                  </div>
                `
                    : ''
                }
              </div>
            </div>
            
            <!-- Контент -->
            <div style="padding: 16px;">
              <!-- Информационные блоки в стиле 2ГИС -->
              <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px;">
                ${
                  data.score
                    ? `
                  <div style="
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                    background: #f0fdf4;
                    color: #166534;
                    padding: 6px 10px;
                    border-radius: 6px;
                    font-size: 12px;
                    font-weight: 500;
                    border: 1px solid #bbf7d0;
                  ">
                    <span style="font-size: 12px;">★</span>
                    <span>${data.score.toFixed(1)}</span>
                  </div>
                `
                    : ''
                }
                
                ${
                  data.distance
                    ? `
                  <div style="
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                    background: #f0f9ff;
                    color: #1e40af;
                    padding: 6px 10px;
                    border-radius: 6px;
                    font-size: 12px;
                    font-weight: 500;
                    border: 1px solid #bfdbfe;
                  ">
                    <span style="font-size: 12px;">🚶</span>
                    <span>${(data.distance / 1000).toFixed(1)} км</span>
                  </div>
                `
                    : ''
                }
              </div>
              
              <!-- Кнопки в стиле 2ГИС -->
              <div style="display: flex; gap: 8px;">
                ${
                  data.website
                    ? `
                  <a href="${data.website}" target="_blank" rel="noopener noreferrer" 
                     style="
                       flex: 1;
                       display: inline-flex; 
                       align-items: center; 
                       justify-content: center;
                       gap: 6px; 
                       font-size: 13px; 
                       color: #00a85a; 
                       text-decoration: none; 
                       font-weight: 500; 
                       padding: 10px 12px;
                       background: #f0fdf4;
                       border: 1px solid #bbf7d0;
                       border-radius: 8px;
                       transition: all 0.15s;
                     "
                     onmouseover="this.style.background='#dcfce7'; this.style.borderColor='#86efac'"
                     onmouseout="this.style.background='#f0fdf4'; this.style.borderColor='#bbf7d0'"
                  >
                    <span style="font-size: 12px;">🌐</span>
                    <span>Сайт</span>
                  </a>
                `
                    : ''
                }
                
                <button 
                  onclick="
                    console.log('Клик по кнопке Подробнее:', '${data.id || ''}');
                    // Загружаем подробную информацию из 2ГИС
                    fetch('/api/2gis/details', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        title: '${data.title || ''}',
                        lon: ${data.lon},
                        lat: ${data.lat},
                        id: '${data.id || ''}'
                      })
                    })
                    .then(res => res.json())
                    .then(details => {
                      console.log('Подробная информация:', details);
                      // Показываем модальное окно с подробной информацией
                      window.dispatchEvent(new CustomEvent('map:show-details', { 
                        detail: { 
                          id: '${data.id || ''}',
                          data: details,
                          original: ${JSON.stringify(data)}
                        } 
                      }));
                    })
                    .catch(err => {
                      console.error('Ошибка загрузки подробной информации:', err);
                      // Fallback - просто фокусируемся на маркере
                      window.dispatchEvent(new CustomEvent('map:focus-place', { detail: { id: '${data.id || ''}' } }));
                    });
                  "
                  style="
                    flex: 1;
                    padding: 10px 12px; 
                    background: #00a85a;
                    border: none; 
                    border-radius: 8px; 
                    color: white; 
                    font-size: 13px; 
                    font-weight: 500; 
                    cursor: pointer; 
                    transition: all 0.15s;
                  "
                  onmouseover="this.style.background='#00bf6f'"
                  onmouseout="this.style.background='#00a85a'"
                >
                  Подробнее
                </button>
              </div>
            </div>
          </div>
        `;
        };

        // Обработчик клика по карте для закрытия попапов
        const handleMapClick = () => {
          try {
            markersRef.current.forEach((m: any) => {
              if (m.popup) {
                try {
                  m.popup.destroy();
                } catch {
                  // Игнорируем ошибки
                }
                m.isPopupVisible = false;
              }
            });
          } catch (err) {
            console.error('Ошибка закрытия попапов:', err);
          }
        };

        // Слушаем события для маркеров с анимациями
        const addMarkersHandler = (e: any) => {
          try {
            markersRef.current.forEach((m) => m && m.destroy && m.destroy());
            markersRef.current = [];

            const points: MarkerData[] = e.detail?.points || [];
            if (!points.length) return;

            // Анимированное добавление маркеров в стиле 2ГИС
            points.forEach((p, index) => {
              setTimeout(() => {
                // Создаём красивый HTML маркер в стиле 2ГИС
                const markerElement = document.createElement('div');
                markerElement.style.cssText = `
                  width: 36px;
                  height: 36px;
                  background: linear-gradient(135deg, #00a85a 0%, #00bf6f 100%);
                  border: 3px solid #ffffff;
                  border-radius: 50%;
                  box-shadow: 0 3px 12px rgba(0, 168, 90, 0.3), 0 1px 3px rgba(0, 0, 0, 0.1);
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  color: white;
                  font-weight: 700;
                  font-size: 12px;
                  cursor: pointer;
                  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                  position: relative;
                  z-index: 10;
                `;

                // Добавляем номер или рейтинг
                markerElement.textContent = p.score ? p.score.toFixed(1) : (index + 1).toString();

                // Hover эффект
                markerElement.addEventListener('mouseenter', () => {
                  markerElement.style.transform = 'scale(1.15)';
                  markerElement.style.boxShadow =
                    '0 6px 20px rgba(0, 168, 90, 0.4), 0 2px 6px rgba(0, 0, 0, 0.15)';
                });

                markerElement.addEventListener('mouseleave', () => {
                  markerElement.style.transform = 'scale(1)';
                  markerElement.style.boxShadow =
                    '0 3px 12px rgba(0, 168, 90, 0.3), 0 1px 3px rgba(0, 0, 0, 0.1)';
                });

                // Анимация появления
                markerElement.style.transform = 'scale(0)';
                markerElement.style.opacity = '0';

                // Создаём HTML маркер
                const marker = new mapglAPI.HtmlMarker(map!, {
                  coordinates: [p.lon, p.lat],
                  html: markerElement,
                  anchor: [0.5, 0.5],
                });

                // Анимация появления с bounce
                setTimeout(() => {
                  markerElement.style.transition =
                    'all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
                  markerElement.style.transform = 'scale(1)';
                  markerElement.style.opacity = '1';
                }, 50);

                let popup: any = null;
                let isPopupVisible = false;

                // Обработчик клика на маркер с анимацией
                markerElement.addEventListener('click', (e) => {
                  e.stopPropagation();

                  // Визуальная обратная связь
                  markerElement.style.transform = 'scale(0.9)';
                  setTimeout(() => {
                    markerElement.style.transform = 'scale(1.1)';
                    setTimeout(() => {
                      markerElement.style.transform = 'scale(1)';
                    }, 100);
                  }, 100);

                  // Вызываем обработчик клика
                  handleMarkerClick(p, marker, popup, isPopupVisible);
                });

                // Функция обработки клика по маркеру
                const handleMarkerClick = (
                  markerData: MarkerData,
                  marker: any,
                  currentPopup: any,
                  currentIsPopupVisible: boolean
                ) => {
                  try {
                    console.log('Клик по маркеру:', markerData.title);

                    // Закрываем все другие попапы
                    markersRef.current.forEach((m: any) => {
                      if (m.popup && m.popup !== currentPopup) {
                        try {
                          m.popup.destroy();
                        } catch {
                          // Игнорируем ошибки
                        }
                        m.isPopupVisible = false;
                      }
                    });

                    // Переключаем текущий попап
                    if (currentIsPopupVisible && currentPopup) {
                      try {
                        currentPopup.destroy();
                        popup = null;
                        isPopupVisible = false;
                        console.log('Попап закрыт');
                      } catch {
                        // Игнорируем ошибки
                      }
                    } else {
                      // Создаём новый попап с данными из 2ГИС
                      try {
                        popup = new mapglAPI.HtmlMarker(map!, {
                          coordinates: [markerData.lon, markerData.lat],
                          html: createPopupHTML(markerData),
                          anchor: [0, -40],
                        });
                        isPopupVisible = true;
                        console.log('Попап создан:', markerData.title);

                        // Плавное центрирование карты
                        if (map && map.setCenter) {
                          map.setCenter([markerData.lon, markerData.lat], { duration: 300 });
                          if (map.setZoom) map.setZoom(16, { duration: 300 });
                        }
                      } catch (popupErr) {
                        console.error('Ошибка создания попапа:', popupErr);
                      }
                    }
                  } catch (err) {
                    console.error('Ошибка клика на маркер:', err);
                  }
                };

                markersRef.current.push({ marker, popup, isPopupVisible });
              }, index * 100);
            });

            // Подгон карты на точки
            setTimeout(
              () => {
                try {
                  if (points.length >= 1 && map && map.setCenter) {
                    // Центрируем по первой точке
                    map.setCenter([points[0].lon, points[0].lat]);

                    // Зум зависит от количества точек
                    const targetZoom = points.length === 1 ? 15 : 13;
                    if (map.setZoom) {
                      map.setZoom(targetZoom, { duration: 800 });
                    }
                  }
                } catch (boundsErr) {
                  console.error('Ошибка позиционирования карты:', boundsErr);
                }
              },
              points.length * 100 + 200
            );
          } catch (err) {
            console.error('Ошибка добавления маркеров:', err);
          }
        };

        // Маршрут с анимацией
        const drawRouteHandler = (e: any) => {
          try {
            const coords: Array<[number, number]> = e.detail?.coordinates || [];
            const routeInfo = e.detail?.routeInfo;
            console.log('Рисуем маршрут с координатами:', coords);
            console.log('Информация о маршруте:', routeInfo);

            if (!coords.length) {
              console.warn('Нет координат для маршрута');
              return;
            }

            if (routeRef.current && routeRef.current.destroy) {
              routeRef.current.destroy();
            }

            // Выбираем цвет в зависимости от типа маршрута
            const routeColor = routeInfo?.traffic ? '#ff6b35' : '#00a85a'; // Оранжевый для пробок, зеленый для свободного
            const routeWidth = routeInfo?.highways ? 8 : 6; // Толще для автомагистралей

            const polyline = new mapglAPI.Polyline(map!, {
              coordinates: coords,
              color: routeColor,
              width: routeWidth,
            });
            routeRef.current = polyline;

            console.log('Маршрут создан, начинаем анимацию');

            // Маршрут создан и отображается
            console.log('Маршрут отображен на карте');

            // Подгон под маршрут
            try {
              if (coords.length >= 1 && coords[0] && map && map.setCenter) {
                // Центрируем на первую точку маршрута
                map.setCenter(coords[0]);

                // Зум зависит от длины маршрута
                const targetZoom = coords.length === 1 ? 15 : 12;
                if (map.setZoom) {
                  map.setZoom(targetZoom, { duration: 1000 });
                }
              }
            } catch (boundsErr) {
              console.error('Ошибка подгонки маршрута:', boundsErr);
            }
          } catch (err) {
            console.error('Ошибка рисования маршрута:', err);
          }
        };

        // Фокус на маркере
        const focusMarkerHandler = (e: any) => {
          try {
            const { lon, lat, zoom = 16 } = e.detail || {};
            if (typeof lon === 'number' && typeof lat === 'number') {
              map.setCenter([lon, lat]);
              map.setZoom(zoom, { duration: 600 });
            }
          } catch (err) {
            console.error('Ошибка фокуса на маркере:', err);
          }
        };

        // Очистка карты
        const clearMapHandler = () => {
          try {
            console.log('Очищаем карту...');

            // Удаляем все маркеры
            markersRef.current.forEach((m: any) => {
              if (m.marker && m.marker.destroy) {
                m.marker.destroy();
              }
              if (m.popup && m.popup.destroy) {
                m.popup.destroy();
              }
            });
            markersRef.current = [];

            // Удаляем маршрут
            if (routeRef.current && routeRef.current.destroy) {
              routeRef.current.destroy();
              routeRef.current = null;
            }

            console.log('Карта очищена');
          } catch (err) {
            console.error('Ошибка очистки карты:', err);
          }
        };

        // Обработчик показа подробной информации
        const showDetailsHandler = (e: any) => {
          try {
            const { id, data, original } = e.detail;
            console.log('Показываем подробную информацию для:', id, data);

            // Создаём модальное окно в стиле 2ГИС
            const modal = document.createElement('div');
            modal.style.cssText = `
              position: fixed;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              background: rgba(0, 0, 0, 0.4);
              display: flex;
              align-items: center;
              justify-content: center;
              z-index: 1000;
              padding: 16px;
              backdrop-filter: blur(4px);
            `;

            const modalContent = document.createElement('div');
            modalContent.style.cssText = `
              background: #ffffff;
              border-radius: 12px;
              padding: 0;
              max-width: 400px;
              width: 100%;
              max-height: 80vh;
              overflow: hidden;
              box-shadow: 0 16px 32px rgba(0, 0, 0, 0.1), 0 4px 8px rgba(0, 0, 0, 0.06);
              border: 1px solid rgba(0, 0, 0, 0.08);
            `;

            modalContent.innerHTML = `
              <!-- Заголовок модального окна -->
              <div style="
                background: #f8f9fa;
                border-bottom: 1px solid #e5e7eb;
                padding: 16px 20px;
                display: flex;
                justify-content: space-between;
                align-items: center;
              ">
                <div style="display: flex; align-items: center; gap: 10px;">
                  <div style="
                    width: 32px;
                    height: 32px;
                    border-radius: 6px;
                    background: #00a85a;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-weight: 600;
                    font-size: 14px;
                  ">
                    ${data.rating?.value ? data.rating.value.toFixed(1) : '★'}
                  </div>
                  <div>
                    <h2 style="
                      margin: 0;
                      color: #1f2937;
                      font-size: 16px;
                      font-weight: 600;
                      line-height: 1.3;
                    ">${data.name || original.title}</h2>
                    ${
                      data.address
                        ? `
                      <p style="
                        margin: 2px 0 0 0;
                        color: #6b7280;
                        font-size: 13px;
                        line-height: 1.4;
                      ">${data.address}</p>
                    `
                        : ''
                    }
                  </div>
                </div>
                <button onclick="this.closest('.modal').remove()" style="
                  background: none;
                  border: none;
                  width: 28px;
                  height: 28px;
                  border-radius: 4px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  cursor: pointer;
                  color: #6b7280;
                  font-size: 18px;
                  transition: all 0.2s;
                " onmouseover="this.style.background='#f3f4f6'; this.style.color='#374151'" onmouseout="this.style.background='none'; this.style.color='#6b7280'">
                  ×
                </button>
              </div>
              
              <!-- Контент модального окна -->
              <div style="padding: 20px; max-height: 50vh; overflow-y: auto;">
                ${
                  data.contacts?.phones?.length
                    ? `
                  <div style="margin-bottom: 16px;">
                    <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 6px;">
                      <span style="color: #00a85a; font-size: 12px;">📞</span>
                      <strong style="color: #374151; font-size: 13px; font-weight: 600;">Телефоны</strong>
                    </div>
                    ${data.contacts.phones
                      .map(
                        (phone: string) => `
                      <a href="tel:${phone}" style="
                        color: #00a85a;
                        text-decoration: none;
                        display: block;
                        margin-bottom: 2px;
                        font-size: 13px;
                        padding: 2px 0;
                        transition: color 0.2s;
                      " onmouseover="this.style.color='#00bf6f'" onmouseout="this.style.color='#00a85a'">${phone}</a>
                    `
                      )
                      .join('')}
                  </div>
                `
                    : ''
                }
                
                ${
                  data.contacts?.websites?.length
                    ? `
                  <div style="margin-bottom: 16px;">
                    <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 6px;">
                      <span style="color: #00a85a; font-size: 12px;">🌐</span>
                      <strong style="color: #374151; font-size: 13px; font-weight: 600;">Сайты</strong>
                    </div>
                    ${data.contacts.websites
                      .map(
                        (website: string) => `
                      <a href="${website}" target="_blank" rel="noopener noreferrer" style="
                        color: #00a85a;
                        text-decoration: none;
                        display: block;
                        margin-bottom: 2px;
                        font-size: 13px;
                        padding: 2px 0;
                        transition: color 0.2s;
                      " onmouseover="this.style.color='#00bf6f'" onmouseout="this.style.color='#00a85a'">${website}</a>
                    `
                      )
                      .join('')}
                  </div>
                `
                    : ''
                }
                
                ${
                  data.rating?.value
                    ? `
                  <div style="margin-bottom: 16px;">
                    <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 6px;">
                      <span style="color: #00a85a; font-size: 12px;">⭐</span>
                      <strong style="color: #374151; font-size: 13px; font-weight: 600;">Рейтинг</strong>
                    </div>
                    <p style="margin: 0; color: #6b7280; font-size: 13px; line-height: 1.4;">
                      ${data.rating.value} из 5 (${data.rating.count || 0} оценок)
                      ${data.rating.reviews ? `, ${data.rating.reviews} отзывов` : ''}
                    </p>
                  </div>
                `
                    : ''
                }
                
                ${
                  data.schedule?.text
                    ? `
                  <div style="margin-bottom: 16px;">
                    <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 6px;">
                      <span style="color: #00a85a; font-size: 12px;">🕒</span>
                      <strong style="color: #374151; font-size: 13px; font-weight: 600;">Режим работы</strong>
                    </div>
                    <p style="margin: 0; color: #6b7280; font-size: 13px; line-height: 1.4;">${data.schedule.text}</p>
                  </div>
                `
                    : ''
                }
              </div>
              
              <!-- Кнопки -->
              <div style="
                border-top: 1px solid #e5e7eb;
                padding: 16px 20px;
                display: flex;
                gap: 10px;
              ">
                <button onclick="
                  window.dispatchEvent(new CustomEvent('map:focus-place', { detail: { id: '${id}' } }));
                  this.closest('.modal').remove();
                " style="
                  flex: 1;
                  padding: 10px 14px;
                  background: #00a85a;
                  color: white;
                  border: none;
                  border-radius: 6px;
                  font-weight: 500;
                  font-size: 13px;
                  cursor: pointer;
                  transition: all 0.2s;
                " onmouseover="this.style.background='#00bf6f'" onmouseout="this.style.background='#00a85a'">
                  Показать на карте
                </button>
                <button onclick="this.closest('.modal').remove()" style="
                  flex: 1;
                  padding: 10px 14px;
                  background: #f3f4f6;
                  color: #374151;
                  border: none;
                  border-radius: 6px;
                  font-weight: 500;
                  font-size: 13px;
                  cursor: pointer;
                  transition: all 0.2s;
                " onmouseover="this.style.background='#e5e7eb'" onmouseout="this.style.background='#f3f4f6'">
                  Закрыть
                </button>
              </div>
            `;

            modal.className = 'modal';
            modal.appendChild(modalContent);
            document.body.appendChild(modal);

            // Закрытие по клику на фон
            modal.addEventListener('click', (e) => {
              if (e.target === modal) {
                modal.remove();
              }
            });
          } catch (err) {
            console.error('Ошибка показа подробной информации:', err);
          }
        };

        window.addEventListener('map:add-markers', addMarkersHandler as EventListener);
        window.addEventListener('map:draw-route', drawRouteHandler as EventListener);
        window.addEventListener('map:focus-marker', focusMarkerHandler as EventListener);
        window.addEventListener('map:show-details', showDetailsHandler as EventListener);
        window.addEventListener('map:clear', clearMapHandler as EventListener);

        // Добавляем обработчик клика по карте для закрытия попапов
        if (map) {
          (map as any).on('click', handleMapClick);
        }

        setIsLoading(false);
      } catch (err) {
        setError(
          `Ошибка загрузки карты: ${err instanceof Error ? err.message : 'Неизвестная ошибка'}`
        );
        setIsLoading(false);
      }
    };

    initMap();

    return () => {
      try {
        if (window.matchMedia) {
          const mq = window.matchMedia('(prefers-color-scheme: dark)');
          if (mq.removeEventListener) {
            mq.removeEventListener('change', () => {});
          }
        }
      } catch {}
      if (map) {
        map.destroy();
      }
    };
  }, [center, zoom]);

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 ${className}`}>
        <div className="max-w-md rounded-lg bg-white p-6 text-center shadow-lg">
          <div className="mb-4 text-4xl">🗺️</div>
          <h3 className="mb-2 text-lg font-semibold text-red-600">Ошибка загрузки карты</h3>
          <p className="text-sm text-gray-600">{error}</p>
          <div className="mt-4 rounded-md bg-gray-50 p-3 text-left">
            <p className="mb-1 text-xs font-medium text-gray-700">Как исправить:</p>
            <ol className="list-inside list-decimal space-y-1 text-xs text-gray-600">
              <li>Получите API ключ на https://dev.2gis.com/</li>
              <li>Добавьте его в файл .env.local</li>
              <li>Перезапустите dev сервер</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 ${className}`}>
        <div className="text-center">
          <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
          <p className="text-sm text-gray-600">Загрузка карты 2GIS...</p>
        </div>
      </div>
    );
  }

  return <div ref={mapContainer} className={className} />;
}
