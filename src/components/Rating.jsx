'use client';

import { Icon } from './Icon';

export function Rating({ value = 4.9, count }) {
  return (
    <span className="tz-star" aria-label={`Rated ${value.toFixed(1)} out of 5${count ? `, ${count} reviews` : ''}`}>
      <Icon name="star" size={13} color="var(--tz-saffron-500)" />
      <span>{value.toFixed(1)}</span>
      {count != null && (
        <span style={{ color: 'var(--tz-stone-500)', fontWeight: 400 }}>({count.toLocaleString()})</span>
      )}
    </span>
  );
}
