'use client';

import { useState } from 'react';

export function Photo({ src, alt = '', ratio = '4/3', style, fit = 'cover', children }) {
  const [errored, setErrored] = useState(false);
  return (
    <div className="tz-photo" style={{ aspectRatio: ratio, width: '100%', ...style }}>
      {src && !errored && (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onError={() => setErrored(true)}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: fit }}
        />
      )}
      {(!src || errored) && (
        <div style={{ position: 'relative', zIndex: 1, color: 'var(--tz-stone-500)', fontFamily: 'var(--tz-mono)', fontSize: 12 }}>
          {alt || 'Image'}
        </div>
      )}
      {children && <div style={{ position: 'absolute', inset: 0, zIndex: 2 }}>{children}</div>}
    </div>
  );
}
