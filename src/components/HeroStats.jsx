export function HeroStats({ vendors, avg }) {
  return (
    <div style={{ marginTop: 36, display: 'flex', gap: 32, alignItems: 'center', flexWrap: 'wrap' }}>
      {[
        [`${vendors}+`, 'Curated vendors'],
        ['8', 'Cities · 4 countries'],
        [avg, 'Average rating'],
      ].map(([v, l]) => (
        <div key={l}>
          <div style={{ fontFamily: 'var(--tz-serif)', fontSize: 28, color: 'var(--tz-ink)' }}>{v}</div>
          <div className="tz-meta" style={{ marginTop: 2 }}>{l}</div>
        </div>
      ))}
    </div>
  );
}
