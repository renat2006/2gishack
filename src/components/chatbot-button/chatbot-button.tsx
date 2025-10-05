'use client';

import {
  ChatCircle,
  MagnifyingGlass,
  PaperPlaneRight,
  X,
} from '@phosphor-icons/react/dist/ssr';
import React, { useState, useEffect } from 'react';
import * as Tooltip from '@radix-ui/react-tooltip';
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
import { Input } from '@/components/ui/input';
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
      apiClient.createDialog().then((res) => {
        setDialogId(res.dialog_id);
        LocalStorage.set('chat_dialog_id', res.dialog_id);
      }).catch(() => {});
    }
  }, []);

  const sendChatMessage = React.useCallback(async () => {
    const q = input.trim();
    if (!q) return;

    setIsLoading(true);
    setError(null);
    
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
                codeText: getGeolocationErrorText(error.code)
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
        console.log('✅ Геолокация получена:', userLocation);
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
            text: `Геолокация недоступна: ${errorText}. Поиск будет выполнен без учёта вашего местоположения.` 
          }
        ]);
      }
    }

    try {
      // 1) Классифицируем запрос
      let queryClass: 'search_residential_complex' | 'build_route' | 'general_question' = 'general_question';
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
          if (ws.route && (ws.route as Record<string, unknown>).route && ((ws.route as Record<string, unknown>).route as Record<string, unknown>).waypoints) {
            const waypoints = ((ws.route as Record<string, unknown>).route as Record<string, unknown>).waypoints as Array<Record<string, unknown>>;
            
            if (waypoints.length >= 2) {
              // Используем 2ГИС Routing API для автомобильного маршрута
              const fromPoint = (waypoints[0].projected_point || waypoints[0].original_point) as Record<string, number>;
              const toPoint = (waypoints[waypoints.length - 1].projected_point || waypoints[waypoints.length - 1].original_point) as Record<string, number>;
              
              console.log('Строим автомобильный маршрут от:', fromPoint, 'до:', toPoint);
              
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
                    'Accept': 'application/json'
                  },
                  body: JSON.stringify({
                    points: [
                      {
                        lat: fromPoint.lat,
                        lon: fromPoint.lon
                      },
                      {
                        lat: toPoint.lat,
                        lon: toPoint.lon
                      }
                    ],
                    transport: 'car'
                  })
                });
                
                if (routingResponse.ok) {
                  const routeData = await routingResponse.json();
                  console.log('Данные автомобильного маршрута от 2ГИС:', routeData);
                  
                  // Обрабатываем ответ от 2ГИС API согласно реальной структуре
                  if (routeData.result && Array.isArray(routeData.result) && routeData.result.length > 0) {
                    const route = routeData.result[0]; // Берем первый маршрут
                    
                    // Добавляем маркеры точек
                    const points = waypoints.map((wp: Record<string, unknown>, index: number) => {
                      const point = (wp.projected_point || wp.original_point) as Record<string, number>;
                      const address = ws.addresses?.[index];
                      return {
                        lon: point.lon,
                        lat: point.lat,
                        title: address?.name || `Точка ${index + 1}`,
                        address: address?.address || 'Адрес не указан',
                      };
                    });
                    
                    if (points.length) {
                      window.dispatchEvent(new CustomEvent('map:add-markers', { detail: { points } }));
                    }
                    
                    // Извлекаем координаты маршрута из maneuvers согласно реальной структуре API 2ГИС
                    let coordinates: Array<[number, number]> = [];
                    
                    if (route.maneuvers && route.maneuvers.length > 0) {
                      // Извлекаем координаты из maneuvers
                      route.maneuvers.forEach((maneuver: any) => {
                        if (maneuver.outcoming_path && maneuver.outcoming_path.geometry) {
                          maneuver.outcoming_path.geometry.forEach((geometry: any) => {
                            if (geometry.selection) {
                              // Парсим LINESTRING из WKT формата
                              const linestring = geometry.selection;
                              if (linestring.startsWith('LINESTRING(')) {
                                const coordsStr = linestring.replace('LINESTRING(', '').replace(')', '');
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
                    
                    console.log('Извлеченные координаты маршрута:', coordinates);
                    
                    // Рисуем автомобильный маршрут
                    if (coordinates.length > 1) {
                      const routeInfo = {
                        totalDistance: route.total_distance,
                        totalDuration: route.total_duration,
                        algorithm: route.algorithm,
                        reliability: route.reliability
                      };
                      
                      window.dispatchEvent(new CustomEvent('map:draw-route', { 
                        detail: { 
                          coordinates: coordinates,
                          routeInfo: routeInfo
                        } 
                      }));
                      
                      // Показываем информацию о маршруте
                      const distance = route.ui_total_distance ? `${route.ui_total_distance.value} ${route.ui_total_distance.unit}` : 'неизвестно';
                      const duration = route.ui_total_duration || 'неизвестно';
                      
                      setMessages((prev) => [
                        ...prev,
                        { 
                          id: `route-${Date.now()}`, 
                          role: 'assistant', 
                          kind: 'text', 
                          text: `Автомобильный маршрут построен через 2ГИС!\nРасстояние: ${distance}\nВремя: ${duration}\nАлгоритм: ${route.algorithm || 'стандартный'}` 
                        }
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
             } catch {}
      }

      // (build_route уже обработан выше) 
    } catch (e) {
      const err = e instanceof Error ? e.message : 'Ошибка запроса';
      setMessages((prev) => [...prev, { id: `err-${Date.now()}`, role: 'assistant', kind: 'text', text: `Ошибка: ${err}` }]);
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
          className="fixed bottom-5 right-5 z-50 h-14 w-14 shadow-md"
        >
          <ChatCircle size={24} weight="fill" />
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="flex items-center justify-between border-b border-zinc-200 pb-3 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-500 text-white">
              <ChatCircle size={20} weight="fill" />
            </div>
            <div>
              <DrawerTitle className="text-base font-semibold leading-none text-zinc-900 dark:text-white">
                Поиск жилья
              </DrawerTitle>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                Умный помощник по ЖК
              </p>
            </div>
          </div>
          <DrawerClose asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Закрыть"
              className="h-9 w-9 flex-shrink-0"
            >
              <X size={20} weight="bold" />
            </Button>
          </DrawerClose>
        </div>

        {/* Поле ввода + сабмит через useChat (headless) */}
        <form onSubmit={onSubmit} className="contents">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Спроси ассистента..."
          leftSection={
            <MagnifyingGlass
              size={20}
              weight="bold"
              className="text-zinc-400 dark:text-zinc-500"
            />
          }
          rightSection={
            <div className="flex items-center gap-1.5">
                {input && (
                <Tooltip.Provider delayDuration={150}>
                  <Tooltip.Root>
                    <Tooltip.Trigger asChild>
              <Button
                variant="ghost"
                size="icon"
                          onClick={() => setInput('')}
                className="h-9 w-9"
                        aria-label="Очистить"
                          type="button"
              >
                <X size={18} weight="bold" />
              </Button>
                    </Tooltip.Trigger>
                    <Tooltip.Portal>
                      <Tooltip.Content
                        side="top"
                        align="center"
                        sideOffset={6}
                        className="rounded-md bg-zinc-900 px-2.5 py-1.5 text-xs text-white shadow-md dark:bg-zinc-800"
                      >
                        Очистить
                      </Tooltip.Content>
                    </Tooltip.Portal>
                  </Tooltip.Root>
                </Tooltip.Provider>
              )}
              <Tooltip.Provider delayDuration={150}>
                <Tooltip.Root>
                  <Tooltip.Trigger asChild>
            <Button
              size="icon"
                        disabled={isLoading}
                        aria-label="Отправить"
                        className={"h-10 w-10 " + (isLoading ? "animate-pulse" : "")}
                        type="submit"
                      >
                        {isLoading ? (
                        <div className="grid place-items-center">
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        </div>
              ) : (
                <PaperPlaneRight size={16} weight="fill" />
              )}
            </Button>
                  </Tooltip.Trigger>
                  <Tooltip.Portal>
                    <Tooltip.Content
                      side="top"
                      align="end"
                      sideOffset={6}
                      className="rounded-md bg-zinc-900 px-2.5 py-1.5 text-xs text-white shadow-md dark:bg-zinc-800"
                    >
                        Отправить
                    </Tooltip.Content>
                  </Tooltip.Portal>
                </Tooltip.Root>
              </Tooltip.Provider>
          </div>
          }
        />
        </form>
        
        <div className="relative min-h-[60svh] pt-3">
          <div className="flex max-h-[65svh] flex-col gap-2 overflow-y-auto px-2 py-1 scrollbar-hide">
            {uiMessages.map((m) => (
              <MessageBubble key={m.id} message={m} />
            ))}
            {isLoading && (
              <div className="flex items-center gap-2 px-0.5 py-2">
                <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary-500" />
                <span className="text-xs text-zinc-500 dark:text-zinc-400">Ассистент печатает...</span>
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
      </DrawerContent>
    </Drawer>
  );
}
