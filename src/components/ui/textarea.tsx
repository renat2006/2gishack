'use client';

import React from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { cn } from '@/lib/utils';

export interface TextareaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'style'> {
  variant?: 'default' | 'modern' | 'glass';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  minRows?: number;
  maxRows?: number;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, variant = 'modern', size = 'md', minRows = 1, maxRows = 6, ...restProps }, ref) => {
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
        'dark:focus:border-primary-400 dark:focus:ring-primary-400/20 dark:focus:bg-zinc-900',
        'text-left align-top'
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
      sm: 'px-3 py-2 text-sm',
      md: 'px-4 py-3 text-base',
      lg: 'px-5 py-4 text-base leading-relaxed',
      xl: 'px-5 py-4 text-lg leading-relaxed',
    };

    return (
      <TextareaAutosize
        className={cn(
          baseClasses,
          variantClasses[variant],
          sizeClasses[size],
          'placeholder:text-zinc-400 dark:placeholder:text-zinc-500',
          'disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        ref={ref}
        minRows={minRows}
        maxRows={maxRows}
        {...props}
      />
    );
  }
);

Textarea.displayName = 'Textarea';

export { Textarea };
