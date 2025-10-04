# Руководство для разработчиков

## Начало работы

### Установка зависимостей

```bash
npm install
```

### Запуск dev-сервера

```bash
npm run dev
```

Приложение будет доступно на `http://localhost:3000`

## Структура проекта

```
src/
├── app/              # Next.js App Router
│   ├── layout.tsx    # Корневой layout с PWA метаданными
│   ├── page.tsx      # Главная страница
│   └── offline/      # Оффлайн страница
│
├── components/       # React компоненты
│   ├── install-prompt.tsx      # Промпт установки PWA
│   ├── network-status.tsx      # Индикатор статуса сети
│   ├── update-prompt.tsx       # Промпт обновления SW
│   ├── pwa-wrapper.tsx         # Обертка для PWA функций
│   └── index.ts                # Экспорты
│
├── hooks/            # Custom React hooks
│   ├── use-install-prompt.ts   # Хук для установки PWA
│   ├── use-network-status.ts   # Хук для статуса сети
│   └── use-service-worker.ts   # Хук для SW
│
├── lib/              # Библиотеки и утилиты
│   ├── cache-manager.ts        # Управление кэшем
│   └── config.ts               # Конфигурация приложения
│
├── types/            # TypeScript типы
│   ├── pwa.ts                  # Типы для PWA
│   └── index.ts                # Общие типы
│
├── utils/            # Вспомогательные функции
│   ├── logger.ts               # Логирование
│   ├── storage.ts              # Работа с Storage API
│   ├── performance.ts          # Мониторинг производительности
│   └── index.ts                # Экспорты
│
└── styles/           # CSS стили
    ├── globals.css             # Глобальные стили
    ├── install-prompt.css      # Стили промпта установки
    ├── network-status.css      # Стили индикатора сети
    └── update-prompt.css       # Стили промпта обновления
```

## Соглашения о коде

### TypeScript

- Используйте строгую типизацию
- Избегайте `any`, используйте `unknown` если тип неизвестен
- Экспортируйте типы из соответствующих файлов

### Компоненты

- Используйте функциональные компоненты
- Применяйте `'use client'` для клиентских компонентов
- Разделяйте логику и представление
- Именуйте файлы в kebab-case

### Стили

- Mobile-first подход
- Используйте CSS переменные из `globals.css`
- Создавайте отдельные CSS файлы для компонентов
- Применяйте responsive дизайн

### Commits

Используйте conventional commits:

```
feat: добавить новую функцию
fix: исправить баг
docs: обновить документацию
style: форматирование кода
refactor: рефакторинг без изменения функциональности
perf: улучшение производительности
test: добавить тесты
chore: обновить конфигурацию
```

## Тестирование

### Тестирование PWA функций

1. **Установка**:
   - Откройте в Chrome
   - Проверьте появление промпта установки
   - Установите приложение

2. **Оффлайн режим**:
   - Откройте DevTools → Network
   - Выберите "Offline"
   - Обновите страницу
   - Проверьте работу оффлайн страницы

3. **Service Worker**:
   - DevTools → Application → Service Workers
   - Проверьте регистрацию
   - Проверьте кэширование

4. **Cache Storage**:
   - DevTools → Application → Cache Storage
   - Проверьте наличие кэшей

### Lighthouse

```bash
npm run build
npm start
```

Откройте DevTools → Lighthouse и запустите проверку PWA

## Полезные команды

```bash
npm run dev          # Запуск в режиме разработки
npm run build        # Production сборка
npm start            # Запуск production сервера
npm run lint         # Проверка кода
npm run type-check   # Проверка типов TypeScript
npm run analyze      # Анализ размера бандла
```

## Отладка

### Service Worker

В Chrome DevTools:
- Application → Service Workers
- Включите "Update on reload" при разработке
- Используйте "Unregister" для сброса

### Cache

```javascript
// В консоли браузера
caches.keys().then(console.log)
caches.delete('cache-name')
```

### Network

- Network → Throttling для тестирования медленной сети
- Offline режим для тестирования оффлайн функций

## Производительность

### Оптимизация

- Используйте `next/image` для изображений
- Применяйте code splitting
- Оптимизируйте шрифты через `next/font`
- Минимизируйте bundle size

### Мониторинг

- Проверяйте Core Web Vitals
- Используйте Performance API
- Анализируйте bundle через `npm run analyze`

## Проблемы и решения

### Service Worker не обновляется

```javascript
// Принудительное обновление
navigator.serviceWorker.getRegistration().then(reg => {
  reg?.update();
});
```

### Кэш не очищается

```javascript
// Очистка всех кэшей
caches.keys().then(keys => {
  keys.forEach(key => caches.delete(key));
});
```

## Ресурсы

- [Next.js Docs](https://nextjs.org/docs)
- [PWA Docs](https://web.dev/progressive-web-apps/)
- [next-pwa](https://github.com/shadowwalker/next-pwa)
- [Workbox](https://developers.google.com/web/tools/workbox)


