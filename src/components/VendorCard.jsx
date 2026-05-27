'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Photo } from './Photo';
import { Rating } from './Rating';
import { Icon } from './Icon';
import { useStore } from '@/store';
import { useMe, useFavorites } from '@/lib/swr';
import { api } from '@/lib/api-client';
import { fmtCurrency } from '@/lib/currency';

export function VendorCard({ v }) {
  const currency = useStore((s) => s.currency);
  const showToast = useStore((s) => s.showToast);
  const { user } = useMe();
  const { favorites, refresh } = useFavorites();
  const [pending, setPending] = useState(false);

  const isFav = favorites.some((f) => f.id === v.id);

  const onFav = async (e) => {
    e.preventDefault(); e.stopPropagation();
    if (!user) { showToast('Sign in to save favorites', 'error'); return; }
    setPending(true);
    try {
      const r = await api.post('/api/favorites', { vendorId: v.id });
      await refresh();
      showToast(r.saved ? `Saved ${v.name}` : 'Removed from saved');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setPending(false);
    }
  };

  return (
    <Link href={`/vendors/${v.slug}`} style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column' }}>
      <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', aspectRatio: '4/3' }}>
        <Photo src={v.coverImage} alt={v.name} ratio="auto" style={{ height: '100%', aspectRatio: 'unset' }} />
        {v.tags?.[0] && (
          <span style={{ position: 'absolute', top: 12, left: 12, background: 'rgba(255,255,255,0.92)', color: 'var(--tz-ink)', fontSize: 11.5, fontWeight: 500, padding: '5px 10px', borderRadius: 999 }}>
            {v.tags[0]}
          </span>
        )}
        <button
          onClick={onFav}
          disabled={pending}
          aria-label={isFav ? 'Remove from saved' : 'Save to favorites'}
          aria-pressed={isFav}
          style={{
            position: 'absolute', top: 12, right: 12, width: 34, height: 34, borderRadius: '50%',
            background: 'rgba(255,255,255,0.92)', border: 0, cursor: pending ? 'wait' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: isFav ? 'var(--tz-clay)' : 'var(--tz-ink)',
          }}
        >
          <Icon name="heart" size={15} />
        </button>
      </div>
      <div style={{ paddingTop: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 }}>
          <h3 className="tz-h4" style={{ fontSize: 16, fontWeight: 600 }}>{v.name}</h3>
          <Rating value={v.rating} count={v.reviewsCount} />
        </div>
        <div className="tz-meta" style={{ marginTop: 4 }}>{v.type} · {v.city}, {v.country}</div>
        <div style={{ marginTop: 10, fontSize: 14 }}>
          <span style={{ fontWeight: 600 }}>{fmtCurrency(v.basePrice, currency)}</span>
          <span style={{ color: 'var(--tz-stone-500)' }}> {v.unit || 'from'}</span>
        </div>
      </div>
    </Link>
  );
}
