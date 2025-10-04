# 🚀 Быстрый старт

## Установка

```bash
npm install
```

При установке автоматически сгенерируются placeholder иконки.

## Запуск

```bash
npm run dev
```

Откройте http://localhost:3000

## Первые шаги

### 1. Проверка PWA функций

В Chrome DevTools:
- **Application → Manifest** - проверьте манифест
- **Application → Service Workers** - должен быть зарегистрирован
- **Network → Offline** - проверьте оффлайн режим

### 2. Тестирование установки

На мобильном устройстве или в Chrome Desktop:
- Должен появиться промпт "Установить приложение"
- После установки приложение работает standalone

### 3. Кастомизация

#### Изменить название и цвета
```bash
# Отредактируйте файлы:
public/manifest.json          # Название, описание, цвета
src/styles/globals.css        # CSS переменные
src/app/layout.tsx            # Метаданные
```

#### Создать настоящие иконки

**Вариант 1: Автоматически**
```bash
npm install -g pwa-asset-generator
pwa-asset-generator your-logo.png public/icons -m public/manifest.json
```

**Вариант 2: Онлайн**
1. Перейдите на https://realfavicongenerator.net/
2. Загрузите ваш логотип
3. Скачайте иконки
4. Распакуйте в `public/icons/`

#### Добавить свой контент

```bash
# Создайте новые страницы:
src/app/map/page.tsx          # Страница карты
src/app/profile/page.tsx      # Профиль пользователя

# Создайте компоненты:
src/components/map.tsx        # Компонент карты
src/components/header.tsx     # Шапка сайта
```

## Production сборка

```bash
npm run build
npm start
```

### Проверка качества

```bash
# Lighthouse
npm run build && npm start
# Затем в Chrome DevTools → Lighthouse → Generate report

# Анализ размера бандла
npm run analyze
```

## Деплой

### Vercel (рекомендуется)
```bash
npm install -g vercel
vercel login
vercel
```

### Docker
```bash
docker build -t 2gishack-pwa .
docker run -p 3000:3000 2gishack-pwa
```

### Другие платформы
См. [DEPLOYMENT.md](DEPLOYMENT.md)

## Частые проблемы

### Service Worker не регистрируется
- Проверьте, что используете HTTPS (в production)
- Очистите кэш браузера
- Перезапустите dev-сервер

### Промпт установки не появляется
- PWA уже установлено
- Браузер не поддерживает (используйте Chrome/Edge)
- Не все требования manifest выполнены

### Оффлайн режим не работает
- Подождите несколько секунд после первой загрузки
- Проверьте регистрацию SW в DevTools
- Очистите и обновите кэш

## Следующие шаги

1. **Добавьте ваш контент**
   - Замените placeholder контент на реальный
   - Создайте нужные страницы
   - Добавьте компоненты

2. **Настройте стили**
   - Измените цветовую схему
   - Добавьте свои шрифты
   - Кастомизируйте компоненты

3. **Подключите API**
   - Создайте API routes в `src/app/api/`
   - Добавьте клиенты для внешних API
   - Настройте кэширование API запросов

4. **Добавьте функции**
   - Push уведомления
   - Геолокация
   - Камера
   - И другие Web APIs

5. **Оптимизируйте**
   - Проверьте Core Web Vitals
   - Оптимизируйте изображения
   - Настройте CDN
   - Добавьте мониторинг

## Документация

- [README.md](README.md) - Общее описание
- [CONTRIBUTING.md](CONTRIBUTING.md) - Руководство для разработчиков
- [DEPLOYMENT.md](DEPLOYMENT.md) - Деплой и production
- [PWA_FEATURES.md](PWA_FEATURES.md) - PWA возможности

## Помощь

Если возникли проблемы:
1. Проверьте DevTools Console на ошибки
2. Проверьте Service Worker регистрацию
3. Очистите кэш и перезапустите
4. Проверьте Network вкладку в DevTools

## Чек-лист готовности

- [ ] Установка и запуск работают
- [ ] PWA устанавливается на устройство
- [ ] Оффлайн режим работает
- [ ] Иконки созданы (не placeholder)
- [ ] Манифест заполнен реальными данными
- [ ] Lighthouse PWA score > 90
- [ ] Production сборка работает
- [ ] Готово к деплою

---

**Удачи в разработке! 🚀**


