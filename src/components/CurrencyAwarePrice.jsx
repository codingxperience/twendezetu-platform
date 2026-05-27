'use client';

import { useStore, useHydrated } from '@/store';
import { fmtCurrency } from '@/lib/currency';

export function CurrencyAwarePrice({ kes }) {
  const currency = useStore((s) => s.currency);
  const hydrated = useHydrated();
  return <span>{hydrated ? fmtCurrency(kes, currency) : fmtCurrency(kes, 'KES')}</span>;
}
