# Возможности PWA

## ✅ Реализованные функции

### 1. Установка приложения
- Промпт установки на устройство
- Определение статуса установки
- Поддержка iOS и Android
- Возможность отложить установку

### 2. Оффлайн режим
- Полная поддержка работы без интернета
- Кэширование всех статических ресурсов
- Fallback на оффлайн страницу
- Умное управление кэшем

### 3. Обновления
- Автоматическое обнаружение обновлений
- Промпт для обновления приложения
- Skip waiting для быстрых обновлений
- Очистка старых кэшей

### 4. Сетевые функции
- Индикатор статуса сети (онлайн/оффлайн)
- Определение медленного соединения
- Адаптация под скорость сети
- Retry механизм

### 5. Кэширование
Настроены стратегии кэширования для:

#### Cache First (долгоживущие ресурсы)
- Шрифты Google Fonts
- Аудио файлы
- Видео файлы

#### Stale While Revalidate (часто обновляемые)
- CSS стили Google Fonts
- JavaScript файлы
- CSS файлы
- Изображения
- Next.js Image Optimization

#### Network First (динамический контент)
- Страницы приложения
- JSON данные
- Данные API с fallback

#### Network Only (всегда свежие данные)
- API эндпоинты

### 6. Производительность
- Code splitting на уровне страниц
- Lazy loading компонентов
- Оптимизация изображений (AVIF, WebP)
- Минификация и сжатие
- Bundle analyzer
- Tree shaking

### 7. Безопасность
- Security headers
- CSP (Content Security Policy) ready
- XSS защита
- Clickjacking защита
- HTTPS-only в production

### 8. Мобильная оптимизация
- Mobile-first дизайн
- Touch-friendly интерфейс
- Адаптивная верстка
- Viewport оптимизация
- Status bar стилизация

## 🚀 Готово к добавлению

### Push уведомления
Базовая структура готова в `public/sw-custom.js`:
- Push событие обработано
- Notification click обработан
- Нужно добавить backend для отправки

### Периодическая синхронизация
```typescript
// Добавьте в service worker
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'sync-data') {
    event.waitUntil(syncData());
  }
});
```

### Background Sync
```typescript
// Добавьте в service worker
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-messages') {
    event.waitUntil(syncMessages());
  }
});
```

### Web Share API
```typescript
if (navigator.share) {
  await navigator.share({
    title: 'Заголовок',
    text: 'Текст',
    url: window.location.href,
  });
}
```

### Shortcuts (быстрые действия)
Добавьте в `manifest.json`:
```json
"shortcuts": [
  {
    "name": "Открыть карту",
    "short_name": "Карта",
    "description": "Быстрый доступ к карте",
    "url": "/map",
    "icons": [{ "src": "/icons/map-icon.png", "sizes": "192x192" }]
  }
]
```

## 📊 Метрики производительности

### Core Web Vitals
Отслеживание готово в `src/utils/performance.ts`:
- LCP (Largest Contentful Paint)
- FID (First Input Delay)
- CLS (Cumulative Layout Shift)

### Custom метрики
- Navigation Timing
- Resource Timing
- Performance Marks
- Performance Measures

## 🔧 Настройка для вашего проекта

### 1. Обновите манифест
`public/manifest.json` - измените название, описание, цвета

### 2. Создайте иконки
```bash
node scripts/generate-icons.js  # Создает placeholder
# Затем замените на настоящие иконки
```

### 3. Настройте кэширование
`next.config.mjs` - измените стратегии кэширования под ваши нужды

### 4. Добавьте analytics
```typescript
// src/lib/analytics.ts
export const trackEvent = (event: string, data?: unknown) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', event, data);
  }
};
```

### 5. Настройте push уведомления
Нужен VAPID ключ и backend для отправки:
```bash
npm install web-push
```

## 🎨 Кастомизация UI

### Цветовая схема
`src/styles/globals.css` - CSS переменные:
- `--color-primary`
- `--color-background`
- `--color-surface`
- и др.

### Темная тема
Автоматически поддерживается через `prefers-color-scheme`

### Компоненты
Все PWA компоненты можно кастомизировать:
- `src/components/install-prompt.tsx`
- `src/components/network-status.tsx`
- `src/components/update-prompt.tsx`

## 📱 Тестирование на устройствах

### iOS (Safari)
- Установка через "Добавить на экран домой"
- Проверьте apple-touch-icon
- Проверьте viewport-fit=cover

### Android (Chrome)
- Автоматический промпт установки
- Проверьте manifest.json
- Проверьте maskable иконки

### Desktop (Chrome, Edge)
- Кнопка установки в адресной строке
- Standalone режим
- Интеграция с OS

## 🐛 Отладка

### Chrome DevTools
- Application → Manifest
- Application → Service Workers
- Application → Cache Storage
- Network → Offline режим

### Lighthouse
```bash
npm run build && npm start
# Затем откройте DevTools → Lighthouse
```

### Логи
Используйте `src/utils/logger.ts` для debug логов


