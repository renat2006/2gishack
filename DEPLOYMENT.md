# Руководство по деплою

## Подготовка к production

### 1. Создание иконок PWA

Вам нужно создать иконки следующих размеров в папке `public/icons/`:
- 72x72 px
- 96x96 px
- 128x128 px
- 144x144 px
- 152x152 px
- 192x192 px
- 384x384 px
- 512x512 px

Используйте инструменты:
- [PWA Asset Generator](https://github.com/elegantapp/pwa-asset-generator)
- [RealFaviconGenerator](https://realfavicongenerator.net/)

### 2. Настройка переменных окружения

Создайте файл `.env.production`:

```bash
NEXT_PUBLIC_API_URL=https://your-api-domain.com
NEXT_PUBLIC_APP_NAME=2GIS Hack PWA
NEXT_PUBLIC_APP_VERSION=1.0.0
```

### 3. Обновление манифеста

Отредактируйте `public/manifest.json`:
- Установите правильное имя приложения
- Обновите URL в `start_url` и `scope`
- Добавьте screenshots для Google Play Store

### 4. Сборка production

```bash
npm run build
npm start
```

### 5. Тестирование PWA

Используйте Chrome DevTools:
1. Откройте Application → Manifest
2. Проверьте Service Workers
3. Проверьте Cache Storage
4. Lighthouse → Progressive Web App

## Деплой на Vercel

```bash
npm install -g vercel
vercel login
vercel
```

Или через GitHub:
1. Push в репозиторий
2. Импортируйте проект на vercel.com
3. Настройте переменные окружения
4. Deploy

## Деплой на другие платформы

### Netlify

```bash
npm run build
```

Настройте `netlify.toml`:

```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

### Docker

Создайте `Dockerfile`:

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## Оптимизация после деплоя

### 1. CDN для статики
- Настройте CDN для `/public` и `/_next/static`

### 2. Monitoring
- Добавьте Sentry для отслеживания ошибок
- Настройте Google Analytics или аналоги

### 3. Performance
- Проверьте Core Web Vitals
- Используйте `npm run analyze` для проверки размера бандла

### 4. Security Headers
- Настроены в `vercel.json`
- Проверьте на [securityheaders.com](https://securityheaders.com/)

## Обновление PWA

1. Обновите версию в `package.json`
2. Соберите и задеплойте
3. Пользователи получат уведомление об обновлении
4. Service Worker обновится автоматически

## Чек-лист перед деплоем

- [ ] Все иконки созданы
- [ ] Manifest.json заполнен
- [ ] Переменные окружения настроены
- [ ] Production build работает локально
- [ ] Lighthouse score > 90 для PWA
- [ ] Оффлайн режим работает
- [ ] Security headers настроены
- [ ] Analytics подключен (опционально)


