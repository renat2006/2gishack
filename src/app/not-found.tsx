import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md border-primary-500/20">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 text-6xl">🗺️</div>
          <CardTitle className="text-primary-500">Страница не найдена</CardTitle>
          <CardDescription>К сожалению, запрашиваемая страница не существует</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-sm text-gray-600">
            Возможно, вы перешли по устаревшей ссылке или ввели неверный адрес
          </p>
        </CardContent>
        <CardFooter className="flex flex-col gap-2 sm:flex-row">
          <Button asChild className="flex-1">
            <Link href="/">На главную</Link>
          </Button>
          <Button asChild variant="outline" className="flex-1">
            <Link href="/offline">Оффлайн режим</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
