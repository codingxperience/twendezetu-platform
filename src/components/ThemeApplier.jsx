'use client';

import { useEffect } from 'react';
import { useStore } from '@/store';

export function ThemeApplier() {
  const theme = useStore((s) => s.theme);
  useEffect(() => {
    document.documentElement.dataset.theme = theme === 'savanna' ? '' : theme;
  }, [theme]);
  return null;
}
