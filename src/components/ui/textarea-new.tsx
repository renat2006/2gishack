'use client';

import React from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { cn } from '@/lib/utils';

export interface TextareaNewProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'style'> {
  variant?: 'default' | 'modern' | 'glass';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  leftIcon?: React.ReactNode;
  rightActions?: React.ReactNode;
  minRows?: number;
  maxRows?: number;
}

const TextareaNew = React.forwardRef<HTMLTextAreaElement, TextareaNewProps>(
  (
    {
      className,
      variant = 'modern',
      size = 'md',
      leftIcon,
      rightActions,
      minRows = 1,
      maxRows = 6,
      ...restProps
    },
    ref
  ) => {
    // Исключаем style из пропсов для TextareaAutosize
    const props = restProps;
    const baseClasses = 'group relative w-full resize-none transition-all duration-300 ease-out';

    const variantClasses = {
      default:
        'rounded-lg border border-zinc-200 bg-white shadow-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white',
      modern: cn(
        'rounded-xl border border-zinc-200 bg-white/90 backdrop-blur-sm',
        'shadow-sm transition-all duration-200',
        'hover:border-zinc-300 hover:shadow-md hover:bg-white',
        'focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:bg-white',
        'dark:border-zinc-700 dark:bg-zinc-900/90',
        'dark:hover:border-zinc-600 dark:hover:bg-zinc-900',
        'dark:focus:border-primary-400 dark:focus:ring-primary-400/20 dark:focus:bg-zinc-900'
      ),
      glass: cn(
        'rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm',
        'shadow-md transition-all duration-300',
        'hover:bg-white/20 hover:shadow-lg',
        'focus:bg-white/30 focus:ring-2 focus:ring-white/30',
        'dark:border-zinc-700/30 dark:bg-zinc-900/20',
        'dark:hover:bg-zinc-900/30 dark:focus:bg-zinc-900/40'
      ),
    };

    const sizeClasses = {
      sm: 'py-2 text-sm min-h-[36px]',
      md: 'py-3 text-base min-h-[44px]',
      lg: 'py-4 text-base leading-relaxed min-h-[52px]',
      xl: 'py-4 text-lg leading-relaxed min-h-[60px]',
    };

    // Вычисляем отступы в зависимости от наличия иконок
    const getPaddingClasses = () => {
      let paddingClasses = sizeClasses[size];

      // Убираем стандартные px классы
      paddingClasses = paddingClasses.replace(/px-\d+/, '');

      if (leftIcon && rightActions) {
        paddingClasses += ' pl-16 pr-20';
      } else if (leftIcon) {
        paddingClasses += ' pl-16 pr-4';
      } else if (rightActions) {
        paddingClasses += ' pl-4 pr-20';
      } else {
        paddingClasses += ' px-4';
      }

      return paddingClasses;
    };

    return (
      <div className="relative group">
        <TextareaAutosize
          ref={ref}
          className={cn(
            baseClasses,
            variantClasses[variant],
            getPaddingClasses(),
            'placeholder:text-zinc-400 dark:placeholder:text-zinc-500',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'text-left align-top',
            className
          )}
          minRows={minRows}
          maxRows={maxRows}
          {...props}
        />

        {/* Левая иконка */}
        {leftIcon && (
          <div className="absolute left-4 top-4 w-6 h-6 flex items-center justify-center pointer-events-none">
            {leftIcon}
          </div>
        )}

        {/* Правые действия */}
        {rightActions && (
          <div className="absolute right-4 top-4 flex items-center gap-1.5">{rightActions}</div>
        )}
      </div>
    );
  }
);

TextareaNew.displayName = 'TextareaNew';

export { TextareaNew };
