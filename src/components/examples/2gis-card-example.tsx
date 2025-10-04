'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

/**
 * Пример компонента в стиле 2GIS
 * Демонстрирует использование shadcn/ui компонентов с кастомизацией
 */
export function TwoGisCardExample() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {/* Основная карточка */}
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle className="text-primary">Поиск мест</CardTitle>
          <CardDescription>Найдите нужное место на карте 2GIS</CardDescription>
        </CardHeader>
        <CardContent>
          <Input placeholder="Введите адрес или название..." />
        </CardContent>
        <CardFooter className="gap-2">
          <Button variant="default" className="flex-1">
            Найти
          </Button>
          <Button variant="outline" className="flex-1">
            Очистить
          </Button>
        </CardFooter>
      </Card>

      {/* Карточка с вторичным цветом */}
      <Card className="border-secondary/20 hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle className="text-secondary">Маршруты</CardTitle>
          <CardDescription>Постройте оптимальный маршрут</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input placeholder="Откуда..." />
          <Input placeholder="Куда..." />
        </CardContent>
        <CardFooter>
          <Button variant="secondary" className="w-full">
            Построить маршрут
          </Button>
        </CardFooter>
      </Card>

      {/* Карточка с акцентным цветом */}
      <Card className="border-accent/20 hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle className="text-accent">Избранное</CardTitle>
          <CardDescription>Сохраните важные места</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">У вас пока нет сохраненных мест</p>
        </CardContent>
        <CardFooter className="gap-2">
          <Button variant="accent" className="flex-1">
            Добавить место
          </Button>
          <Button variant="ghost" className="flex-1">
            Просмотр
          </Button>
        </CardFooter>
      </Card>

      {/* Пример с разными размерами кнопок */}
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>Примеры кнопок</CardTitle>
          <CardDescription>Разные варианты и размеры кнопок в стиле 2GIS</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button size="sm" variant="default">
            Маленькая
          </Button>
          <Button size="default" variant="default">
            Обычная
          </Button>
          <Button size="lg" variant="default">
            Большая
          </Button>

          <Button variant="secondary">Вторичная</Button>
          <Button variant="accent">Акцент</Button>
          <Button variant="outline">Контур</Button>
          <Button variant="ghost">Призрак</Button>
          <Button variant="link">Ссылка</Button>
          <Button variant="destructive">Удалить</Button>
        </CardContent>
      </Card>
    </div>
  );
}
