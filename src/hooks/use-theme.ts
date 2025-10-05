'use client';
import { useEffect, useState } from 'react';

export function useTheme() {
  const [theme, setTheme] = useState<'dark' | 'light'>('light');

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => setTheme(mediaQuery.matches ? 'dark' : 'light');
    handleChange();
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return theme;
}
