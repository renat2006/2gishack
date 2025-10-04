# Руководство по CI/CD

## 🚀 Обзор

Проект настроен с полным CI/CD пайплайном, включающим:
- ✅ Прекоммит хуки (Husky + lint-staged)
- ✅ Проверка сообщений коммитов (Commitlint)
- ✅ GitHub Actions workflows
- ✅ Автоматический деплой на Vercel
- ✅ Security сканирование (CodeQL)
- ✅ Dependabot для обновлений

## 📋 Прекоммит хуки

### Настроенные хуки

**pre-commit** - запускается перед каждым коммитом:
- ESLint автофикс
- Prettier форматирование
- Проверка типов TypeScript

**commit-msg** - проверяет формат сообщения коммита:
```
<type>: <subject>

Типы:
- feat: новая функция
- fix: исправление бага
- docs: документация
- style: форматирование
- refactor: рефакторинг
- perf: производительность
- test: тесты
- build: сборка
- ci: CI/CD
- chore: прочее
```

**pre-push** - запускается перед push:
- Type check
- Lint проверка

### Примеры коммитов

✅ Правильно:
```bash
git commit -m "feat: добавить кнопку установки PWA"
git commit -m "fix: исправить ошибку в service worker"
git commit -m "docs: обновить README"
```

❌ Неправильно:
```bash
git commit -m "добавил функцию"  # нет типа
git commit -m "FIX: баг"         # type должен быть lowercase
```

### Обход хуков (не рекомендуется)

```bash
git commit --no-verify -m "сообщение"
git push --no-verify
```

## 🔄 GitHub Actions Workflows

### 1. CI Pipeline (`.github/workflows/ci.yml`)

**Триггеры:**
- Push в main/develop
- Pull Request в main/develop

**Jobs:**

**Lint & Format Check**
- ESLint проверка
- Prettier проверка форматирования

**TypeScript Check**
- Проверка типов

**Build**
- Сборка приложения
- Загрузка артефактов

**Lighthouse CI** (только для PR)
- Проверка производительности
- PWA audit
- Accessibility audit

### 2. Deploy Pipeline (`.github/workflows/deploy.yml`)

**Триггеры:**
- Push в main
- Manual trigger

**Steps:**
1. Lint проверка
2. Type check
3. Build
4. Deploy на Vercel Production

### 3. Preview Deployment (`.github/workflows/preview.yml`)

**Триггеры:**
- Pull Request в main

**Features:**
- Создает preview деплой
- Комментирует PR с URL превью

### 4. Security Scan (`.github/workflows/codeql.yml`)

**Триггеры:**
- Push в main
- Pull Request в main
- Еженедельно по понедельникам

**Проверки:**
- JavaScript/TypeScript анализ
- Security vulnerabilities
- Code quality issues

## 🔐 Настройка секретов

### GitHub Secrets

Необходимо добавить в GitHub Settings → Secrets:

```bash
VERCEL_TOKEN          # Vercel authentication token
VERCEL_ORG_ID         # Vercel organization ID
VERCEL_PROJECT_ID     # Vercel project ID
NEXT_PUBLIC_API_URL   # API endpoint (если нужен)
```

### Получение Vercel токенов

1. **VERCEL_TOKEN:**
   ```bash
   # Установите Vercel CLI
   npm i -g vercel
   
   # Залогиньтесь
   vercel login
   
   # Создайте токен
   vercel tokens create
   ```

2. **VERCEL_ORG_ID и VERCEL_PROJECT_ID:**
   ```bash
   # Запустите в корне проекта
   vercel link
   
   # Токены будут в .vercel/project.json
   cat .vercel/project.json
   ```

## 📦 Dependabot

Автоматически создает PR для обновления зависимостей:
- npm пакеты - еженедельно
- GitHub Actions - еженедельно

Настроено в `.github/dependabot.yml`

## 🛠 Локальное использование

### Установка

```bash
npm install
# Автоматически настроит husky
```

### Полезные команды

```bash
# Проверка кода
npm run lint           # ESLint
npm run lint:fix       # ESLint с автофиксом
npm run format         # Prettier форматирование
npm run format:check   # Проверка форматирования
npm run type-check     # TypeScript проверка

# Сборка
npm run build          # Production сборка
npm run analyze        # Анализ размера бандла

# Разработка
npm run dev            # Dev сервер
npm start              # Production сервер
```

### Тестирование workflow локально

Используйте [act](https://github.com/nektos/act):

```bash
# Установите act
brew install act  # macOS
# или скачайте с GitHub

# Запустите workflow
act push  # Симуляция push
act pull_request  # Симуляция PR
```

## 🚨 Troubleshooting

### Хуки не работают

```bash
# Переустановите husky
rm -rf .husky
npm run prepare
chmod +x .husky/*
```

### CI падает с ошибкой типов

```bash
# Проверьте локально
npm run type-check

# Обновите типы
npm update @types/node @types/react @types/react-dom
```

### Vercel деплой не работает

1. Проверьте, что все секреты добавлены
2. Проверьте права доступа GitHub App
3. Проверьте логи в GitHub Actions

### Lint ошибки

```bash
# Автофикс
npm run lint:fix

# Если не помогло, проверьте .eslintrc.json
```

## 📊 Статусы и бейджи

Добавьте в README.md:

```markdown
![CI](https://github.com/renat2006/2gishack/workflows/CI%20Pipeline/badge.svg)
![Deploy](https://github.com/renat2006/2gishack/workflows/Deploy%20to%20Vercel/badge.svg)
[![CodeQL](https://github.com/renat2006/2gishack/workflows/CodeQL%20Security%20Scan/badge.svg)](https://github.com/renat2006/2gishack/security/code-scanning)
```

## 🎯 Best Practices

### Коммиты

1. Используйте conventional commits
2. Пишите понятные commit messages
3. Один коммит = одно логическое изменение
4. Не коммитьте commented code

### Pull Requests

1. Заполняйте PR template
2. Привязывайте к issues
3. Запрашивайте review
4. Проверяйте Lighthouse результаты

### Деплой

1. Всегда проверяйте preview перед мерджем
2. Мониторьте Vercel Analytics
3. Проверяйте Core Web Vitals
4. Тестируйте на реальных устройствах

## 🔄 Workflow процесс

1. **Создать ветку:**
   ```bash
   git checkout -b feature/new-feature
   ```

2. **Разработка:**
   ```bash
   # Пишите код
   npm run dev
   ```

3. **Коммит:**
   ```bash
   git add .
   git commit -m "feat: описание изменений"
   # Автоматически запустятся pre-commit хуки
   ```

4. **Push:**
   ```bash
   git push origin feature/new-feature
   # Автоматически запустятся pre-push хуки
   ```

5. **Создать PR:**
   - На GitHub создайте Pull Request
   - Заполните template
   - Дождитесь CI проверок
   - Проверьте preview деплой

6. **Review & Merge:**
   - Получите approve
   - Merge в main
   - Автоматический деплой на production

## 📚 Дополнительные ресурсы

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Husky Documentation](https://typicode.github.io/husky/)
- [GitHub Actions](https://docs.github.com/en/actions)
- [Vercel Deployment](https://vercel.com/docs)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)

