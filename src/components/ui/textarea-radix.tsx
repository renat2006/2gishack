'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface TextareaRadixProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  variant?: 'default' | 'modern' | 'glass';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  minRows?: number;
  maxRows?: number;
}

const TextareaRadix = React.forwardRef<HTMLTextAreaElement, TextareaRadixProps>(
  ({ className, variant = 'modern', size = 'md', minRows = 1, maxRows = 6, ...props }, ref) => {
    const variantClasses = {
      default:
        'rounded-lg p-10 border border-zinc-200 bg-white shadow-sm focus-within:border-primary-500 focus-within:ring-1 focus-within:ring-primary-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white',
      modern: cn(
        'rounded-xl border border-zinc-200 bg-white/90 backdrop-blur-sm',
        'shadow-sm transition-all duration-200',
        'hover:border-zinc-300 hover:shadow-md hover:bg-white',
        'focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500/20 focus-within:bg-white',
        'dark:border-zinc-700 dark:bg-zinc-900/90',
        'dark:hover:border-zinc-600 dark:hover:bg-zinc-900',
        'dark:focus-within:border-primary-400 dark:focus-within:ring-primary-400/20 dark:focus-within:bg-zinc-900'
      ),
      glass: cn(
        'rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm',
        'shadow-md transition-all duration-300',
        'hover:bg-white/20 hover:shadow-lg',
        'focus-within:bg-white/30 focus-within:ring-2 focus-within:ring-white/30',
        'dark:border-zinc-700/30 dark:bg-zinc-900/20',
        'dark:hover:bg-zinc-900/30 dark:focus-within:bg-zinc-900/40'
      ),
    };

    const sizeClasses = {
      sm: 'px-3 py-2 text-sm min-h-[36px]',
      md: 'px-4 py-3 text-base min-h-[44px]',
      lg: 'px-4 py-4 text-base leading-relaxed min-h-[52px]',
      xl: 'px-4 py-4 text-lg leading-relaxed min-h-[60px]',
    };

    return (
      <div
        className={cn(
          'group relative w-full',
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
      >
        <textarea
          ref={ref}
          className={cn(
            'w-full resize-none bg-transparent border-none outline-none',
            'placeholder:text-zinc-400 dark:placeholder:text-zinc-500',
            'disabled:cursor-not-allowed disabled:opacity-50',
            '',
            'p-10'
          )}
          rows={minRows}
          style={{
            minHeight:
              size === 'sm' ? '36px' : size === 'md' ? '44px' : size === 'lg' ? '52px' : '60px',
            maxHeight: `${maxRows * 1.5}rem`,
          }}
          {...props}
        />
      </div>
    );
  }
);

TextareaRadix.displayName = 'TextareaRadix';

export { TextareaRadix };
