'use client';

import { ChatCircle, PaperPlaneRight, X } from '@phosphor-icons/react/dist/ssr';
import React, { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { LocalStorage } from '@/utils/storage';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { TextareaReady } from '@/components/ui/textarea-ready';
// import { Separator } from '@/components/ui/separator';
// import { motion } from 'framer-motion';
import { MessageBubble } from './message-bubble';
import { ChatMessage } from '@/types';

// Headless чат на базе Vercel AI SDK. Вся верстка остаётся кастомной.

// Функция для получения текстового описания ошибки геолокации
function getGeolocationErrorText(code: number): string {
  switch (code) {
    case 1:
      return 'Пользователь отклонил запрос на геолокацию';
    case 2:
      return 'Позиция недоступна (проблемы с сетью или GPS)';
    case 3:
      return 'Превышено время ожидания геолокации';
    default:
      return 'Неизвестная ошибка геолокации';
  }
}

export function ChatbotButton() {
  const chatEndRef = React.useRef<HTMLDivElement>(null);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dialogId, setDialogId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      role: 'assistant',
      kind: 'text',
      text: 'Привет! Я помогу найти жилые комплексы. Например: «Хочу жить рядом с метро и парком».',
    },
  ]);

  const uiMessages = messages;

  // Автопрокрутка к последнему сообщению
  React.useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [uiMessages, isLoading]);

  useEffect(() => {
    const storedId = LocalStorage.get<string>('chat_dialog_id');
    if (storedId) {
      setDialogId(storedId);
    } else {
      apiClient
        .createDialog()
        .then((res) => {
          setDialogId(res.dialog_id);
          LocalStorage.set('chat_dialog_id', res.dialog_id);
        })
        .catch(() => {});
    }
  }, []);

  const sendChatMessage = React.useCallback(async () => {
    const q = input.trim();
    if (!q) return;

    setIsLoading(true);
    setError(null);

    // Очищаем input сразу после отправки
    setInput('');

    // Очищаем карту перед новым запросом
    window.dispatchEvent(new CustomEvent('map:clear'));

    const userMsg: ChatMessage = { id: `u-${Date.now()}`, role: 'user', kind: 'text', text: q };
    setMessages((prev) => [...prev, userMsg]);

    let userLocation: [number, number] | null = null;
    try {
      if (typeof navigator !== 'undefined' && navigator.geolocation) {
        const pos = await new Promise<GeolocationPosition>((res, rej) => {
          navigator.geolocation.getCurrentPosition(
            res,
            (error) => {
              console.warn('⚠️ Ошибка геолокации:', {
                code: error.code,
                message: error.message,
                codeText: getGeolocationErrorText(error.code),
              });
              rej(error);
            },
            {
              enableHighAccuracy: false,
              timeout: 15000,
              maximumAge: 300000, // 5 минут
            }
          );
        });
        userLocation = [pos.coords.longitude, pos.coords.latitude];
        console.warn('✅ Геолокация получена:', userLocation);
      } else {
        console.warn('⚠️ Геолокация не поддерживается браузером');
      }
    } catch (err) {
      console.warn('⚠️ Не удалось получить геолокацию:', err);
      // Показываем пользователю информативное сообщение
      if (err instanceof GeolocationPositionError) {
        const errorText = getGeolocationErrorText(err.code);
        console.warn(`Геолокация недоступна: ${errorText}`);

        // Добавляем информативное сообщение в чат
        setMessages((prev) => [
          ...prev,
          {
            id: `geo-warn-${Date.now()}`,
            role: 'assistant',
            kind: 'text',
            text: `Геолокация недоступна: ${errorText}. Поиск будет выполнен без учёта вашего местоположения.`,
          },
        ]);
      }
    }

    try {
      // 1) Классифицируем запрос
      let queryClass: 'search_residential_complex' | 'build_route' | 'general_question' =
        'general_question';
      try {
        const cls = await apiClient.classifyQuery(q);
        queryClass = cls.query_class;
      } catch {}

      // 2) Если нужно строить маршрут — используем 2ГИС Routing API
      if (queryClass === 'build_route') {
        try {
          // Сначала получаем адреса через webSearch
          const ws = await apiClient.webSearch({
            query: q,
            lon: userLocation ? userLocation[0] : 0,
            lat: userLocation ? userLocation[1] : 0,
          });

          // Текст-ответ ассистента (если есть)
          if (ws.message) {
            setMessages((prev) => [
              ...prev,
              { id: `ws-${Date.now()}`, role: 'assistant', kind: 'text', text: ws.message },
            ]);
          }

          // Извлекаем координаты из waypoints для построения автомобильного маршрута
          if (ws.route && (ws.route as any).route && ((ws.route as any).route as any).waypoints) {
            const waypoints = ((ws.route as any).route as any).waypoints as Array<any>;

            if (waypoints.length >= 2) {
              // Используем 2ГИС Routing API для автомобильного маршрута
              // Преобразуем все waypoints в формат для API
              const points = waypoints.map((waypoint: any) => {
                const point = waypoint.projected_point || waypoint.original_point;
                return {
                  lat: point.lat,
                  lon: point.lon,
                };
              });

              console.warn('Строим автомобильный маршрут через точки:', points);
              console.warn('Количество промежуточных точек:', points.length);

              try {
                // Используем прямой API 2ГИС согласно документации
                const apiKey = process.env.NEXT_PUBLIC_2GIS_API_KEY;
                if (!apiKey) {
                  throw new Error('API ключ 2ГИС не настроен');
                }

                const routingUrl = `https://routing.api.2gis.com/routing/7.0.0/global?key=${apiKey}`;

                const routingResponse = await fetch(routingUrl, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                  },
                  body: JSON.stringify({
                    points: points,
                    transport: 'car',
                  }),
                });

                if (routingResponse.ok) {
                  const routeData = await routingResponse.json();
                  console.warn('Данные автомобильного маршрута от 2ГИС:', routeData);

                  // Обрабатываем ответ от 2ГИС API согласно реальной структуре
                  if (
                    routeData.result &&
                    Array.isArray(routeData.result) &&
                    routeData.result.length > 0
                  ) {
                    const route = routeData.result[0]; // Берем первый маршрут

                    // Добавляем маркеры точек
                    const points = waypoints.map((wp: any, index: number) => {
                      const point = (wp.projected_point || wp.original_point) as any;
                      const address = ws.addresses?.[index];
                      return {
                        lon: point.lon,
                        lat: point.lat,
                        title: address?.name || `Точка ${index + 1}`,
                        address: address?.address || 'Адрес не указан',
                      };
                    });

                    if (points.length) {
                      window.dispatchEvent(
                        new CustomEvent('map:add-markers', { detail: { points } })
                      );
                    }

                    // Извлекаем координаты маршрута из maneuvers согласно реальной структуре API 2ГИС
                    const coordinates: Array<[number, number]> = [];

                    if (route.maneuvers && route.maneuvers.length > 0) {
                      // Извлекаем координаты из maneuvers
                      route.maneuvers.forEach((maneuver: any) => {
                        if (maneuver.outcoming_path && maneuver.outcoming_path.geometry) {
                          maneuver.outcoming_path.geometry.forEach((geometry: any) => {
                            if (geometry.selection) {
                              // Парсим LINESTRING из WKT формата
                              const linestring = geometry.selection;
                              if (linestring.startsWith('LINESTRING(')) {
                                const coordsStr = linestring
                                  .replace('LINESTRING(', '')
                                  .replace(')', '');
                                const coordPairs = coordsStr.split(',');
                                coordPairs.forEach((pair: string) => {
                                  const [lon, lat] = pair.trim().split(' ').map(Number);
                                  if (!isNaN(lon) && !isNaN(lat)) {
                                    coordinates.push([lon, lat]);
                                  }
                                });
                              }
                            }
                          });
                        }
                      });
                    }

                    console.warn('Извлеченные координаты маршрута:', coordinates);

                    // Рисуем автомобильный маршрут
                    if (coordinates.length > 1) {
                      const routeInfo = {
                        totalDistance: route.total_distance,
                        totalDuration: route.total_duration,
                        algorithm: route.algorithm,
                        reliability: route.reliability,
                      };

                      window.dispatchEvent(
                        new CustomEvent('map:draw-route', {
                          detail: {
                            coordinates: coordinates,
                            routeInfo: routeInfo,
                          },
                        })
                      );

                      // Показываем информацию о маршруте
                      const distance = route.ui_total_distance
                        ? `${route.ui_total_distance.value} ${route.ui_total_distance.unit}`
                        : 'неизвестно';
                      const duration = route.ui_total_duration || 'неизвестно';

                      setMessages((prev) => [
                        ...prev,
                        {
                          id: `route-${Date.now()}`,
                          role: 'assistant',
                          kind: 'text',
                          text: `Автомобильный маршрут построен через 2ГИС!\nРасстояние: ${distance}\nВремя: ${duration}\nАлгоритм: ${route.algorithm || 'стандартный'}`,
                        },
                      ]);
                    } else {
                      throw new Error('Не удалось извлечь координаты маршрута');
                    }
                  } else {
                    throw new Error('Маршрут не найден в ответе 2ГИС');
                  }
                } else {
                  const errorText = await routingResponse.text();
                  console.error('Ошибка 2ГИС Routing API:', routingResponse.status, errorText);
                  throw new Error(`Ошибка 2ГИС API: ${routingResponse.status} - ${errorText}`);
                }
              } catch (routingErr) {
                console.error('Ошибка 2ГИС Routing API:', routingErr);
                throw routingErr;
              }
            } else {
              throw new Error('Недостаточно точек для построения маршрута');
            }
          } else {
            throw new Error('Не удалось получить точки маршрута');
          }
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'Ошибка webSearch';
          setMessages((prev) => [
            ...prev,
            { id: `ws-err-${Date.now()}`, role: 'assistant', kind: 'text', text: `Ошибка: ${msg}` },
          ]);
        }

        return; // не ищем ЖК, завершаем обработку
      }

      // 3) Отправляем в чат (YandexGPT + авторанжирование)
      const response = await apiClient.sendMessage({
        message: q,
        dialog_id: dialogId,
        user_location: userLocation,
        max_distance: 5000,
        auto_rank: true,
      });

      if (response.dialog_id && response.dialog_id !== dialogId) {
        setDialogId(response.dialog_id);
        LocalStorage.set('chat_dialog_id', response.dialog_id);
      }

      const assistMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        kind: 'text',
        text: response.response,
      };

      setMessages((prev) => [...prev, assistMsg]);

      if (response.ranked_complexes && response.ranked_complexes.length > 0) {
        const complexesMsg: ChatMessage = {
          id: `c-${Date.now()}`,
          role: 'assistant',
          kind: 'module',
          module: {
            type: 'complexes',
            items: response.ranked_complexes.map((c: any) => ({
              id: c.id || c._id,
              name: c.name,
              address: c.address,
              website: c.website,
              lon: c.lon,
              lat: c.lat,
              score: c.score,
              distance: c.distance,
            })),
            entities: response.entities,
          },
        };
        setMessages((prev) => [...prev, complexesMsg]);
        // добавим маркеры на карту с полными данными
        try {
          const points = response.ranked_complexes
            .filter((c: any) => typeof c.lon === 'number' && typeof c.lat === 'number')
            .map((c: any) => ({
              lon: c.lon,
              lat: c.lat,
              title: c.name,
              address: c.address,
              score: c.score,
              website: c.website,
              id: c.id || c._id,
              distance: c.distance,
            }));
          window.dispatchEvent(new CustomEvent('map:add-markers', { detail: { points } }));

          // Отображаем ближайшие объекты для каждого ЖК
          const complexesWithObjects = response.ranked_complexes.map((c: any) => ({
            id: c.id || c._id,
            name: c.name,
            lon: c.lon,
            lat: c.lat,
            score_data: c.score_data || { entities: {} },
          }));

          console.warn('🚀 Отправляем данные о ближайших объектах:', complexesWithObjects);
          console.warn('📊 Первый комплекс score_data:', complexesWithObjects[0]?.score_data);

          window.dispatchEvent(
            new CustomEvent('map:show-nearby-objects', {
              detail: { complexes: complexesWithObjects },
            })
          );
        } catch {}
      }

      // (build_route уже обработан выше)
    } catch (e) {
      const err = e instanceof Error ? e.message : 'Ошибка запроса';
      setMessages((prev) => [
        ...prev,
        { id: `err-${Date.now()}`, role: 'assistant', kind: 'text', text: `Ошибка: ${err}` },
      ]);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [input, dialogId]);

  const onSubmit = React.useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      void sendChatMessage();
    },
    [sendChatMessage]
  );

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button
          size="icon"
          aria-label="Открыть ассистента"
          className="fixed bottom-5 right-5 z-50 h-14 w-14 shadow-2xl shadow-primary-500/25 bg-gradient-to-br from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 transition-all duration-300 hover:scale-110 hover:shadow-3xl hover:shadow-primary-500/40 active:scale-95 group"
        >
          <ChatCircle
            size={24}
            weight="fill"
            className="transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12"
          />

          {/* Светящийся эффект */}
          <div className="absolute inset-0 rounded-full bg-primary-400/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Пульсирующий эффект */}
          <div className="absolute inset-0 rounded-full border-2 border-primary-300/50 animate-ping opacity-0 group-hover:opacity-100" />
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="flex items-center justify-between border-b border-zinc-200/60 pb-4 dark:border-zinc-800/60 bg-gradient-to-r from-white/90 to-zinc-50/90 dark:from-zinc-900/90 dark:to-zinc-800/90 backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 text-white shadow-xl shadow-primary-500/30 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-primary-500/40">
                <ChatCircle size={26} weight="fill" className="transition-transform duration-300" />
              </div>

              {/* Светящийся эффект */}
              <div className="absolute inset-0 rounded-2xl bg-primary-400/30 blur-lg opacity-0 transition-opacity duration-300 hover:opacity-100" />

              {/* Пульсирующий эффект */}
              <div className="absolute inset-0 rounded-2xl border-2 border-primary-300/50 animate-ping opacity-0 hover:opacity-100" />
            </div>

            <div>
              <DrawerTitle className="text-xl font-bold leading-none text-zinc-900 dark:text-white bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 dark:from-primary-400 dark:via-primary-300 dark:to-primary-200 bg-clip-text text-transparent">
                Gispy
              </DrawerTitle>
              <p className="mt-1.5 text-sm text-zinc-600 dark:text-zinc-300 font-medium">
                Ассистент по недвижимости и маршрутам
              </p>
            </div>
          </div>

          <DrawerClose asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Закрыть"
              className="h-10 w-10 flex-shrink-0 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all duration-200 hover:scale-110 active:scale-95 hover:rotate-90"
            >
              <X size={18} weight="bold" />
            </Button>
          </DrawerClose>
        </div>

        <div className="flex flex-col flex-1 min-h-0">
          {/* Область сообщений с фиксированной высотой */}
          <div className="flex-1 min-h-0 pt-6 bg-gradient-to-b from-transparent via-zinc-50/30 to-zinc-100/50 dark:via-zinc-900/30 dark:to-zinc-800/50">
            <div className="flex flex-col gap-3 overflow-y-auto px-3 py-2 scrollbar-hide h-full">
              {uiMessages.map((m) => (
                <MessageBubble key={m.id} message={m} />
              ))}
              {isLoading && (
                <div className="flex items-center gap-3 px-3 py-2 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
                  <div className="flex gap-1">
                    <div className="h-1.5 w-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <div className="h-1.5 w-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <div className="h-1.5 w-1.5 bg-zinc-400 rounded-full animate-bounce" />
                  </div>
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">Поиск...</span>
                </div>
              )}
              {error && (
                <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                  {String(error)}
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
          </div>

          {/* Поле ввода - жестко прижато к низу */}
          <div className="flex-shrink-0 border-t border-zinc-200/60 dark:border-zinc-800/60 bg-gradient-to-r from-white/95 to-zinc-50/95 dark:from-zinc-900/95 dark:to-zinc-800/95 backdrop-blur-xl p-3 pb-safe">
            <form onSubmit={onSubmit} className="w-full">
              <div className="flex items-end gap-3">
                {/* Поле ввода */}
                <div className="flex-1">
                  <TextareaReady
                    value={input}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      setInput(e.target.value)
                    }
                    placeholder="Спроси ассистента о жилье, районах, ценах..."
                    variant="modern"
                    size="lg"
                    disabled={isLoading}
                    minRows={1}
                    maxRows={4}
                  />
                </div>

                {/* Кнопки управления - оптимизированы для мобильных */}
                <div className="flex items-center gap-2 bg-white/90 dark:bg-zinc-800/90 rounded-xl p-2 backdrop-blur-sm border border-zinc-200/50 dark:border-zinc-700/50 flex-shrink-0">
                  {input.trim() && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setInput('')}
                      className="h-9 w-9 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all duration-200 hover:scale-105 rounded-lg touch-manipulation"
                      aria-label="Очистить"
                      type="button"
                    >
                      <X size={18} weight="bold" />
                    </Button>
                  )}

                  <Button
                    type="submit"
                    size="icon"
                    disabled={!input.trim() || isLoading}
                    className="h-9 w-9 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 active:scale-95 rounded-lg shadow-md touch-manipulation"
                    aria-label="Отправить сообщение"
                  >
                    {isLoading ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                      <PaperPlaneRight size={18} weight="bold" />
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
