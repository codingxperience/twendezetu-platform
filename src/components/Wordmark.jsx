'use client';

export function Wordmark({ size = 22, color, as = 'span' }) {
  const Tag = as;
  return (
    <Tag className="tz-wordmark" style={{ fontSize: size, color: color || 'var(--tz-ink)' }}>
      twendezetu<span className="tz-wordmark__dot" />
    </Tag>
  );
}
