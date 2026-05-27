// Static reference data the UI consumes directly (categories, region tiles).
// All vendor data now lives in the database — see prisma/seed.mjs.

export const CATEGORIES = [
  { key: 'venues',    label: 'Venues',                icon: 'crown',   count: 412 },
  { key: 'catering',  label: 'Catering',              icon: 'food',    count: 286 },
  { key: 'photo',     label: 'Photography',           icon: 'cam',     count: 198 },
  { key: 'decor',     label: 'Décor & florists',      icon: 'flower',  count: 154 },
  { key: 'djs',       label: 'DJs & entertainment',   icon: 'music',   count: 127 },
  { key: 'mcs',       label: 'MCs & planners',        icon: 'mic',     count: 96  },
  { key: 'packages',  label: 'Curated packages',      icon: 'sparkle', count: 48  },
  { key: 'transport', label: 'Transport',             icon: 'car',     count: 64  },
];

export const REGIONS = [
  { city: 'Nairobi',          country: 'Kenya',    venues: 142, img: 'https://images.unsplash.com/photo-1612531385446-f7e6d131e1d0?w=800&q=80' },
  { city: 'Kampala',          country: 'Uganda',   venues: 124, img: 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=800&q=80' },
  { city: 'Mombasa',          country: 'Kenya',    venues: 68,  img: 'https://images.unsplash.com/photo-1589554484424-c8a99c69d44a?w=800&q=80' },
  { city: 'Entebbe',          country: 'Uganda',   venues: 52,  img: 'https://images.unsplash.com/photo-1601907831055-c6c20f10ad5a?w=800&q=80' },
  { city: 'Dar es Salaam',    country: 'Tanzania', venues: 71,  img: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&q=80' },
  { city: 'Jinja',            country: 'Uganda',   venues: 38,  img: 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?w=800&q=80' },
  { city: 'Arusha & Zanzibar',country: 'Tanzania', venues: 49,  img: 'https://images.unsplash.com/photo-1589197331516-4d84b72ebde3?w=800&q=80' },
  { city: 'Kigali',           country: 'Rwanda',   venues: 38,  img: 'https://images.unsplash.com/photo-1612392061787-2d078b3e573f?w=800&q=80' },
];
