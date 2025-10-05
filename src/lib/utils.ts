import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Объединяет классы с помощью clsx и tailwind-merge
 * Позволяет условно применять классы и избегает конфликтов Tailwind
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
