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

interface NearbyObject {
  name: string;
  distance: number;
  coords: [number, number];
}

interface ComplexWithObjects {
  id: string;
  name: string;
  lon: number;
  lat: number;
  score_data: {
    entities: {
      [key: string]: {
        nearest_objects: NearbyObject[];
      };
    };
  };
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

                const popup: any = null;
                const isPopupVisible = false;

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
                  _marker: any,
                  _currentPopup: any,
                  _currentIsPopupVisible: boolean
                ) => {
                  try {
                    console.warn('Клик по маркеру:', markerData.title);

                    // Закрываем все попапы
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

                    // Плавное центрирование карты
                    if (map && map.setCenter) {
                      map.setCenter([markerData.lon, markerData.lat], { duration: 300 });
                      if (map.setZoom) map.setZoom(16, { duration: 300 });
                    }

                    // Открываем модальное окно вместо попапа
                    console.warn('Открываем модальное окно для:', markerData.title);

                    // Загружаем подробную информацию из 2ГИС
                    fetch('/api/2gis/details', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        title: markerData.title || '',
                        lon: markerData.lon,
                        lat: markerData.lat,
                        id: markerData.id || '',
                      }),
                    })
                      .then((res) => res.json())
                      .then((details) => {
                        console.warn('Подробная информация:', details);
                        // Показываем модальное окно с подробной информацией
                        window.dispatchEvent(
                          new CustomEvent('map:show-details', {
                            detail: {
                              id: markerData.id || '',
                              data: details,
                              original: markerData,
                            },
                          })
                        );
                      })
                      .catch((err) => {
                        console.error('Ошибка загрузки подробной информации:', err);
                        // Fallback - показываем модальное окно с базовой информацией
                        window.dispatchEvent(
                          new CustomEvent('map:show-details', {
                            detail: {
                              id: markerData.id || '',
                              data: {
                                name: markerData.title,
                                address: markerData.address,
                                rating: markerData.score ? { value: markerData.score } : null,
                              },
                              original: markerData,
                            },
                          })
                        );
                      });
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
            console.warn('Рисуем маршрут с координатами:', coords);
            console.warn('Информация о маршруте:', routeInfo);

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

            console.warn('Маршрут создан, начинаем анимацию');

            // Маршрут создан и отображается
            console.warn('Маршрут отображен на карте');

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
            console.warn('Очищаем карту...');

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

            console.warn('Карта очищена');
          } catch (err) {
            console.error('Ошибка очистки карты:', err);
          }
        };

        // Обработчик отображения ближайших объектов к ЖК
        const showNearbyObjectsHandler = (e: any) => {
          try {
            const { complexes } = e.detail;
            console.warn('🔍 Отображаем ближайшие объекты для комплексов:', complexes);
            console.warn('📊 Количество комплексов:', complexes.length);
            console.warn('🗺️ MapGL API доступен:', !!mapglAPIRef.current);
            console.warn('🗺️ Map доступна:', !!map);

            // Проверяем доступность API
            if (!mapglAPIRef.current || !map) {
              console.error('❌ MapGL API или карта не инициализированы');
              return;
            }

            // Очищаем предыдущие маркеры объектов
            markersRef.current.forEach((marker) => {
              if (marker.type === 'nearby_object' && marker.marker && marker.marker.destroy) {
                marker.marker.destroy();
              }
            });
            markersRef.current = markersRef.current.filter(
              (marker) => marker.type !== 'nearby_object'
            );

            // Добавляем маркеры для каждого ЖК и его ближайших объектов
            complexes.forEach((complex: ComplexWithObjects, complexIndex: number) => {
              console.warn(`🏢 Обрабатываем ЖК ${complexIndex + 1}:`, complex.name);
              console.warn('📍 Координаты ЖК:', complex.lon, complex.lat);
              console.warn('📈 Score data:', complex.score_data);
              // Добавляем маркер ЖК
              const complexMarkerElement = document.createElement('div');
              complexMarkerElement.style.cssText = `
                background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
                border: 3px solid #ffffff;
                border-radius: 50%;
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
                animation: pulse 2s infinite;
              `;
              complexMarkerElement.innerHTML = `
                <div style="
                  width: 8px;
                  height: 8px;
                  background: #ffffff;
                  border-radius: 50%;
                "></div>
                <style>
                  @keyframes pulse {
                    0% { transform: scale(1); box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4); }
                    50% { transform: scale(1.1); box-shadow: 0 6px 16px rgba(59, 130, 246, 0.6); }
                    100% { transform: scale(1); box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4); }
                  }
                </style>
              `;

              const complexMarker = new mapglAPIRef.current.HtmlMarker(map, {
                coordinates: [complex.lon, complex.lat],
                html: complexMarkerElement,
                anchor: [0.5, 0.5],
              });

              markersRef.current.push({
                marker: complexMarker,
                type: 'complex',
                data: complex,
              });

              // Добавляем маркеры ближайших объектов
              console.warn(
                '🔍 Entities в score_data:',
                Object.keys(complex.score_data.entities || {})
              );

              if (!complex.score_data || !complex.score_data.entities) {
                console.warn('⚠️ Нет данных о ближайших объектах для ЖК:', complex.name);
                return;
              }

              Object.values(complex.score_data.entities).forEach((entity, entityIndex) => {
                console.warn(`🎯 Обрабатываем entity ${entityIndex + 1}:`, entity);
                console.warn(
                  '📦 Количество ближайших объектов:',
                  entity.nearest_objects?.length || 0
                );

                if (!entity.nearest_objects || entity.nearest_objects.length === 0) {
                  console.warn('⚠️ Нет ближайших объектов для entity:', entity);
                  return;
                }

                entity.nearest_objects.forEach((object: NearbyObject, index: number) => {
                  console.warn(
                    `📍 Объект ${index + 1}:`,
                    object.name,
                    'на расстоянии',
                    object.distance,
                    'м'
                  );
                  const distance = Math.round(object.distance);
                  const isClosest = index === 0;

                  try {
                    const objectMarkerElement = document.createElement('div');
                    objectMarkerElement.style.cssText = `
                      background: rgba(255, 255, 255, 0.95);
                      backdrop-filter: blur(12px);
                      border: 1px solid rgba(255, 255, 255, 0.3);
                      border-radius: 8px;
                      padding: 6px 8px;
                      display: flex;
                      align-items: center;
                      gap: 6px;
                      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                      min-width: 80px;
                      max-width: 120px;
                      cursor: pointer;
                      transition: all 0.2s ease;
                      animation: ${isClosest ? 'pulse 2s infinite' : 'fadeIn 0.4s ease-out'};
                      position: relative;
                      overflow: hidden;
                    `;
                    objectMarkerElement.innerHTML = `
                      <div style="
                        width: 20px;
                        height: 20px;
                        background: ${
                          isClosest
                            ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                            : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                        };
                        border-radius: 4px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 10px;
                        color: white;
                        flex-shrink: 0;
                        box-shadow: 0 1px 3px ${
                          isClosest ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'
                        };
                      ">
                        ${isClosest ? '🏪' : '🏬'}
                      </div>
                      <div style="
                        flex: 1;
                        min-width: 0;
                        display: flex;
                        flex-direction: column;
                        gap: 1px;
                      ">
                        <div style="
                          font-size: 11px;
                          font-weight: 600;
                          color: #1f2937;
                          line-height: 1.1;
                          white-space: nowrap;
                          overflow: hidden;
                          text-overflow: ellipsis;
                        ">
                          ${object.name}
                        </div>
                        <div style="
                          font-size: 9px;
                          color: #6b7280;
                          display: flex;
                          align-items: center;
                          gap: 3px;
                        ">
                          <span style="
                            background: ${
                              isClosest ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)'
                            };
                            color: ${isClosest ? '#059669' : '#d97706'};
                            padding: 1px 4px;
                            border-radius: 3px;
                            font-size: 8px;
                            font-weight: 600;
                          ">${distance}м</span>
                        </div>
                      </div>
                      
                      <style>
                        @keyframes pulse {
                          0%, 100% { transform: scale(1); }
                          50% { transform: scale(1.05); }
                        }
                        @keyframes fadeIn {
                          from { 
                            opacity: 0; 
                            transform: translateY(8px) scale(0.95); 
                          }
                          to { 
                            opacity: 1; 
                            transform: translateY(0) scale(1); 
                          }
                        }
                      </style>
                    `;

                    const objectMarker = new mapglAPIRef.current.HtmlMarker(map, {
                      coordinates: object.coords,
                      html: objectMarkerElement,
                      anchor: [0.5, 0.5],
                    });

                    // Добавляем компактные hover эффекты
                    objectMarkerElement.addEventListener('mouseenter', () => {
                      objectMarkerElement.style.transform = 'translateY(-2px) scale(1.05)';
                      objectMarkerElement.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                      objectMarkerElement.style.background = 'rgba(255, 255, 255, 1)';
                    });

                    objectMarkerElement.addEventListener('mouseleave', () => {
                      objectMarkerElement.style.transform = 'translateY(0) scale(1)';
                      objectMarkerElement.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
                      objectMarkerElement.style.background = 'rgba(255, 255, 255, 0.95)';
                    });

                    // Добавляем обработчик клика на объект
                    objectMarkerElement.addEventListener('click', (e) => {
                      e.stopPropagation();
                      console.warn('Клик по объекту:', object.name);
                      // Показываем информацию об объекте
                      window.dispatchEvent(
                        new CustomEvent('map:show-details', {
                          detail: {
                            id: object.name,
                            data: {
                              name: object.name,
                              address: `Расстояние: ${distance}м от ЖК "${complex.name}"`,
                              rating: null,
                            },
                            original: {
                              title: object.name,
                              address: `Расстояние: ${distance}м`,
                              lon: object.coords[0],
                              lat: object.coords[1],
                            },
                          },
                        })
                      );
                    });

                    markersRef.current.push({
                      marker: objectMarker,
                      type: 'nearby_object',
                      data: object,
                      complex: complex,
                    });
                  } catch (markerError) {
                    console.error('❌ Ошибка создания маркера объекта:', object.name, markerError);
                  }
                });
              });
            });

            // Центрируем карту на первом ЖК
            if (complexes.length > 0) {
              const firstComplex = complexes[0];
              if (map && map.setCenter) {
                map.setCenter([firstComplex.lon, firstComplex.lat], { duration: 500 });
                if (map.setZoom) map.setZoom(14, { duration: 500 });
              }
            }
          } catch (err) {
            console.error('Ошибка отображения ближайших объектов:', err);
          }
        };

        // Обработчик показа подробной информации с SweetAlert2
        const showDetailsHandler = async (e: any) => {
          try {
            const { id, data, original } = e.detail;
            console.warn('Показываем подробную информацию для:', id, data);

            // Импортируем SweetAlert2 динамически
            const Swal = (await import('sweetalert2')).default;

            // Создаем HTML контент для модального окна в темной теме
            const createModalContent = (data: any, original: any) => {
              console.warn('Данные из API:', data);
              console.warn('Оригинальные данные:', original);

              let content = `
                <div style="text-align: left; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #f3f4f6;">
                  <div style="margin-bottom: 20px;">
                    ${data.address ? `<p style="margin: 0 0 8px 0; color: #d1d5db; font-size: 14px;">${data.address}</p>` : ''}
                  </div>
              `;

              // Изображение
              if (data.photos?.length > 0) {
                content += `
                  <div style="margin-bottom: 20px;">
                    <img src="${data.photos[0].image_url}" alt="${data.name || original.title}" 
                         style="width: 100%; height: 200px; object-fit: cover; border-radius: 12px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);">
                  </div>
                `;
              }

              // Телефоны
              if (data.contacts?.phones?.length) {
                content += `
                  <div style="margin-bottom: 16px;">
                    <h4 style="margin: 0 0 8px 0; color: #ffffff; font-size: 14px; font-weight: 600;">📞 Телефоны</h4>
                    ${data.contacts.phones
                      .map(
                        (phone: string) =>
                          `<a href="tel:${phone}" style="display: block; color: #10b981; text-decoration: none; margin-bottom: 4px; font-size: 14px; padding: 4px 0;">${phone}</a>`
                      )
                      .join('')}
                  </div>
                `;
              }

              // Сайты
              if (data.contacts?.websites?.length) {
                content += `
                  <div style="margin-bottom: 16px;">
                    <h4 style="margin: 0 0 8px 0; color: #ffffff; font-size: 14px; font-weight: 600;">🌐 Сайты</h4>
                    ${data.contacts.websites
                      .map(
                        (website: string) =>
                          `<a href="${website}" target="_blank" rel="noopener noreferrer" style="display: block; color: #3b82f6; text-decoration: none; margin-bottom: 4px; font-size: 14px; padding: 4px 0;">${website}</a>`
                      )
                      .join('')}
                  </div>
                `;
              }

              // Рейтинг
              if (data.rating?.value) {
                content += `
                  <div style="margin-bottom: 16px;">
                    <h4 style="margin: 0 0 8px 0; color: #ffffff; font-size: 14px; font-weight: 600;">⭐ Рейтинг</h4>
                    <p style="margin: 0; color: #d1d5db; font-size: 14px;">
                      ${data.rating.value} из 5 (${data.rating.count || 0} оценок)
                      ${data.rating.reviews ? `, ${data.rating.reviews} отзывов` : ''}
                    </p>
                  </div>
                `;
              }

              // Режим работы
              if (data.schedule?.text) {
                content += `
                  <div style="margin-bottom: 16px;">
                    <h4 style="margin: 0 0 8px 0; color: #ffffff; font-size: 14px; font-weight: 600;">🕒 Режим работы</h4>
                    <p style="margin: 0; color: #d1d5db; font-size: 14px;">${data.schedule.text}</p>
                    </div>
                `;
              }

              // Дополнительная информация
              if (data.description) {
                content += `
                  <div style="margin-bottom: 16px;">
                    <h4 style="margin: 0 0 8px 0; color: #ffffff; font-size: 14px; font-weight: 600;">📝 Описание</h4>
                    <p style="margin: 0; color: #d1d5db; font-size: 14px; line-height: 1.5;">${data.description}</p>
                  </div>
                `;
              }

              // Если нет данных из API, показываем базовую информацию
              if (!data.contacts && !data.rating && !data.schedule && !data.photos) {
                content += `
                  <div style="margin-bottom: 16px; padding: 16px; background: rgba(255, 255, 255, 0.05); border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.1);">
                    <p style="margin: 0; color: #d1d5db; font-size: 14px; text-align: center;">
                      Подробная информация недоступна
                    </p>
              </div>
            `;
              }

              content += `</div>`;
              return content;
            };

            // Показываем модальное окно с SweetAlert2 в темной теме
            await Swal.fire({
              title: data.name || original.title,
              html: createModalContent(data, original),
              width: '520px',
              padding: '24px',
              background: '#1a1a1a',
              color: '#f3f4f6',
              showConfirmButton: true,
              confirmButtonText: 'Показать на карте',
              confirmButtonColor: '#10b981',
              showCancelButton: true,
              cancelButtonText: 'Закрыть',
              cancelButtonColor: '#6b7280',
              customClass: {
                popup: 'swal2-popup-dark',
                title: 'swal2-title-dark',
                htmlContainer: 'swal2-html-dark',
                confirmButton: 'swal2-confirm-dark',
                cancelButton: 'swal2-cancel-dark',
              },
              didOpen: () => {
                // Добавляем кастомные стили для темной темы
                const style = document.createElement('style');
                style.textContent = `
                  .swal2-popup-dark {
                    background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%) !important;
                    border-radius: 20px !important;
                    box-shadow: 0 32px 64px rgba(0, 0, 0, 0.4), 0 16px 32px rgba(0, 0, 0, 0.2) !important;
                    border: 1px solid rgba(255, 255, 255, 0.1) !important;
                  }
                  .swal2-title-dark {
                    font-size: 20px !important;
                    font-weight: 700 !important;
                    color: #ffffff !important;
                    margin-bottom: 16px !important;
                    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3) !important;
                  }
                  .swal2-html-dark {
                    font-size: 14px !important;
                    line-height: 1.5 !important;
                    color: #f3f4f6 !important;
                  }
                  .swal2-confirm-dark {
                    background: linear-gradient(135deg, #10b981 0%, #059669 100%) !important;
                    border: none !important;
                    border-radius: 12px !important;
                    font-weight: 600 !important;
                    padding: 14px 24px !important;
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
                    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3) !important;
                  }
                  .swal2-confirm-dark:hover {
                    transform: translateY(-2px) !important;
                    box-shadow: 0 8px 20px rgba(16, 185, 129, 0.4) !important;
                    background: linear-gradient(135deg, #059669 0%, #047857 100%) !important;
                  }
                  .swal2-cancel-dark {
                    background: rgba(255, 255, 255, 0.1) !important;
                    color: #f3f4f6 !important;
                    border: 1px solid rgba(255, 255, 255, 0.2) !important;
                    border-radius: 12px !important;
                    font-weight: 600 !important;
                    padding: 14px 24px !important;
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
                    backdrop-filter: blur(10px) !important;
                  }
                  .swal2-cancel-dark:hover {
                    background: rgba(255, 255, 255, 0.2) !important;
                    border-color: rgba(255, 255, 255, 0.3) !important;
                    transform: translateY(-2px) !important;
                  }
                `;
                document.head.appendChild(style);
              },
            }).then((result) => {
              if (result.isConfirmed) {
                // Показать на карте
                window.dispatchEvent(new CustomEvent('map:focus-place', { detail: { id: id } }));
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
        window.addEventListener(
          'map:show-nearby-objects',
          showNearbyObjectsHandler as EventListener
        );
        console.warn('🎯 Обработчик map:show-nearby-objects зарегистрирован');
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
