import * as React from 'react';

import { cn } from '@/lib/utils';

type InputProps = React.ComponentProps<'input'> & {
  leftSection?: React.ReactNode;
  rightSection?: React.ReactNode;
};

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', leftSection, rightSection, ...props }, ref) => {
    return (
      <div
        className={cn(
          // container
          'group relative w-full',
          className
        )}
      >
        {/* glow ring on focus */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300 group-focus-within:opacity-100"
          style={{
            boxShadow: '0 0 0 2px rgba(0,0,0,0.02), 0 0 0 6px rgba(0,191,111,0.08)',
          }}
        />

        {leftSection ? (
          <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500">
            {leftSection}
          </div>
        ) : null}

        <input
          type={type}
          ref={ref}
          className={cn(
            // base
            'h-14 w-full rounded-xl border bg-white/80 px-4 text-base text-zinc-900 shadow-sm outline-none transition-all duration-300 placeholder:text-zinc-400 backdrop-blur supports-[backdrop-filter]:bg-white/60 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:cursor-not-allowed disabled:opacity-50',
            // borders and hover
            'border-zinc-200 hover:border-zinc-300 focus:border-primary-500/50',
            // dark theme
            'dark:border-zinc-800 dark:bg-zinc-900/80 dark:text-white dark:placeholder:text-zinc-500 dark:hover:border-zinc-700 dark:focus:border-primary-500/50',
            leftSection ? 'pl-12' : 'pl-4',
            rightSection ? 'pr-12' : 'pr-4'
          )}
          {...props}
        />

        {rightSection ? (
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {rightSection}
          </div>
        ) : null}
      </div>
    );
  }
);
Input.displayName = 'Input';

export { Input };
