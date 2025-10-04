# 2GIS UI Components (shadcn/ui)

Переиспользуемые UI компоненты в стиле 2GIS на базе shadcn/ui.

## 🎨 Цветовая палитра 2GIS

### Основные цвета

- **Primary (Зеленый)**: `#00BF6F` - основной бренд-цвет 2GIS
- **Secondary (Синий)**: `#004B87` - дополнительный цвет
- **Accent (Оранжевый)**: `#FF6B00` - акцентный цвет

### Использование в коде

```tsx
import { Button, Card, Input } from '@/components/ui';

// Primary кнопка (зеленая)
<Button variant="default">Найти</Button>

// Secondary кнопка (синяя)
<Button variant="secondary">Маршрут</Button>

// Accent кнопка (оранжевая)
<Button variant="accent">Добавить</Button>
```

## 📦 Доступные компоненты

### Button

Кнопка с различными вариантами стилей.

```tsx
import { Button } from '@/components/ui/button';

// Варианты
<Button variant="default">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="accent">Accent</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>
<Button variant="destructive">Delete</Button>

// Размеры
<Button size="sm">Маленькая</Button>
<Button size="default">Обычная</Button>
<Button size="lg">Большая</Button>
<Button size="icon">🔍</Button>
```

**Props:**

- `variant`: `'default' | 'secondary' | 'accent' | 'destructive' | 'outline' | 'ghost' | 'link'`
- `size`: `'default' | 'sm' | 'lg' | 'icon'`
- `asChild`: boolean - использовать как Slot компонент

### Card

Карточка для группировки контента.

```tsx
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';

<Card>
  <CardHeader>
    <CardTitle>Заголовок</CardTitle>
    <CardDescription>Описание карточки</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Содержимое карточки</p>
  </CardContent>
  <CardFooter>
    <Button>Действие</Button>
  </CardFooter>
</Card>;
```

**Кастомизация:**

```tsx
// Карточка с границей в цвете 2GIS
<Card className="border-primary/20 hover:shadow-lg">
  {/* content */}
</Card>

// Заголовок в цвете 2GIS
<CardTitle className="text-primary">Поиск мест</CardTitle>
```

### Input

Поле ввода.

```tsx
import { Input } from '@/components/ui/input';

<Input placeholder="Введите адрес..." />
<Input type="email" placeholder="Email..." />
<Input type="password" placeholder="Пароль..." />
<Input disabled placeholder="Заблокировано" />
```

## 🎨 Кастомизация

### Использование цветов 2GIS

```tsx
// Текст в цвете primary
<h1 className="text-primary">Заголовок</h1>

// Фон primary с белым текстом
<div className="bg-primary text-primary-foreground">
  Содержимое
</div>

// Бордер в цвете secondary
<div className="border-2 border-secondary">
  Контент
</div>

// Hover эффект с accent цветом
<button className="hover:bg-accent hover:text-accent-foreground">
  Кнопка
</button>
```

### Создание кастомных компонентов

```tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function TwoGisSearchCard({ className, ...props }) {
  return (
    <Card className={cn('border-primary/20', className)} {...props}>
      <CardHeader>
        <CardTitle className="text-primary">Поиск 2GIS</CardTitle>
      </CardHeader>
      <CardContent>{/* Ваш контент */}</CardContent>
    </Card>
  );
}
```

## 🔧 Добавление новых компонентов

Для добавления новых shadcn компонентов:

```bash
# Например, добавить Select
npx shadcn@latest add select

# Или Dialog
npx shadcn@latest add dialog

# Посмотреть список доступных компонентов
npx shadcn@latest add
```

## 📚 Полезные утилиты

### cn() - объединение классов

```tsx
import { cn } from '@/lib/utils';

// Объединяет классы и разрешает конфликты Tailwind
<div className={cn('text-base', 'text-primary', className)}>
  Content
</div>

// Условные классы
<div className={cn(
  'rounded-lg border',
  isActive && 'border-primary',
  isDisabled && 'opacity-50'
)}>
  Content
</div>
```

## 🎯 Примеры использования

См. файл `/src/components/examples/2gis-card-example.tsx` для полных примеров.

## 📖 Дополнительная документация

- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Radix UI Documentation](https://www.radix-ui.com/docs/primitives)
