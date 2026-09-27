// Demo provider content for the seed. prisma/seed.mjs turns each entry into a
// Provider listing with an owner account, structured rates and reviews.

export const PROVIDER_CATS = ['MUSIC & DJS', 'CATERING & CHEFS', 'TENTS & EQUIPMENT', 'TRANSPORT & DRIVERS', 'PHOTOGRAPHY', 'DECOR & MC'];

const SEED = [
  { name: 'DJ Zawadi', cat: 'MUSIC & DJS', rating: '5.0', jobs: 27, city: 'KAMPALA', desc: 'Amapiano + bongo sets, own decks and PA. Travels with the pool.', rate: 'UGX 350K/set', img: 'https://images.unsplash.com/photo-1516873240891-4bf014598ab4?w=600&q=80', verified: true },
  { name: 'Mama T Events Co.', cat: 'TENTS & EQUIPMENT', rating: '5.0', jobs: 38, city: 'JERSEY CITY', desc: 'Canopies, chairs, serving tables. NYTC member discount.', rate: 'FROM $490', img: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=600&q=80', verified: true },
  { name: 'Chef Halima', cat: 'CATERING & CHEFS', rating: '4.9', jobs: 54, city: 'DAR ES SALAAM', desc: 'Pilau, biryani, nyama choma for 20–500 guests. Halal certified.', rate: 'TZS 15K/plate', img: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=600&q=80', verified: true },
  { name: 'Jersey Party Rentals', cat: 'TENTS & EQUIPMENT', rating: '4.8', jobs: 112, city: 'NEWARK, NJ', desc: 'Full event rental fleet, insured, park-permit compliant.', rate: 'FROM $180', img: 'https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=600&q=80', verified: true },
  { name: 'Simba Sounds', cat: 'MUSIC & DJS', rating: '4.7', jobs: 43, city: 'NAIROBI', desc: 'PA hire + live band coordination. Gospel to gengetone.', rate: 'KES 25K/day', img: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&q=80', verified: false },
  { name: 'Lensa ya Kigali', cat: 'PHOTOGRAPHY', rating: '5.0', jobs: 31, city: 'KIGALI', desc: 'Weddings and community events. Same-week photo delivery.', rate: 'RWF 150K/day', img: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=600&q=80', verified: true },
];

const NAMES = {
  'MUSIC & DJS': ['DJ Nia', 'Bongo Beats Crew', 'Amapiano Kings', 'Live Wire Band', 'Sound of Serengeti', 'DJ Kesho', 'Rhumba Republic', 'Gospel Groove'],
  'CATERING & CHEFS': ['Chef Baraka', 'Mama Ntilie Kitchen', 'Pilau Palace', 'Swahili Plates', 'Nyama Bros', 'Coastal Bites', 'Ugali Express', 'Harusi Caterers'],
  'TENTS & EQUIPMENT': ['Twiga Tents', 'Canopy Co.', 'Furaha Rentals', 'Event Hire EA', 'Shamba Structures', 'Party Plus', 'Karibu Canopies', 'Stage & Sound'],
  'TRANSPORT & DRIVERS': ['Safari 4x4', 'Executive Rides', 'Msafara Convoys', 'Coast Coaches', 'Kili Movers', 'Airport Express', 'Convoy Kings', 'Village Rides'],
  'PHOTOGRAPHY': ['Pixel Pori', 'Moments EA', 'Frame & Focus', 'Harusi Lens', 'Diaspora Studios', 'Golden Hour', 'Storyboard KE', 'Click Kampala'],
  'DECOR & MC': ['Zawadi Decor', 'MC Tumaini', 'Ribbon & Bloom', 'Grand Events MC', 'Petals & Drapes', 'Karibu Hosts', 'Elegance Decor', 'Stage Presence'],
};
const CITIES = ['NAIROBI', 'KAMPALA', 'DAR ES SALAAM', 'KIGALI', 'MOMBASA', 'JINJA', 'ARUSHA', 'JERSEY CITY', 'NEWARK, NJ', 'BROOKLYN, NY'];

// Everything generated for a listing comes from its own category, so a
// transport company never reads like a caterer. Rates are in US dollars and
// the seed converts them to the provider's local currency.
const BY_CATEGORY = {
  'MUSIC & DJS': {
    descs: ['Bongo flava, amapiano and rhumba sets with own decks and PA.', 'Live band for harusi and harambee nights, sound check included.', 'Gospel and worship sets for church events and send-offs.', 'MC and DJ in one booking, bilingual Kiswahili and English.', 'Outdoor PA for cookouts up to 400 guests.'],
    imgs: ['photo-1516873240891-4bf014598ab4', 'photo-1470225620780-dba8ba36b745'],
    rate: [220, 'set'],
  },
  'CATERING & CHEFS': {
    descs: ['Pilau, biryani and nyama choma for 20 to 500 guests. Halal kitchen.', 'Coastal Swahili menus: samaki wa kupaka, viazi karai, mahamri.', 'Ugali, sukuma and choma buffets with serving staff.', 'Wedding cakes and dessert tables to order.', 'Street-food stalls for festivals: mishkaki, chips mayai, mandazi.'],
    imgs: ['photo-1556910103-1c02745aae4d'],
    rate: [6, 'plate'],
  },
  'TENTS & EQUIPMENT': {
    descs: ['Canopies, chairs and serving tables, delivered and set up.', 'Stage, lighting and generator hire for outdoor events.', 'Marquees for up to 300 guests, insured.', 'Tables, linen and crockery by the dozen.', 'Portable toilets and handwash stations for festivals.'],
    imgs: ['photo-1519167758481-83f550bb49b3', 'photo-1478146896981-b80fe463b330'],
    rate: [180, 'day'],
  },
  'TRANSPORT & DRIVERS': {
    descs: ['4x4 hire with driver for up-country trips.', 'Airport transfers at any hour, flight tracked.', 'Wedding convoys: decorated lead car plus guest cars.', 'Minibuses for church groups and school trips.', 'Chauffeured saloon cars for guests visiting from abroad.'],
    imgs: ['photo-1533473359331-0135ef1b58bf', 'photo-1449965408869-eaa3f722e40d'],
    rate: [110, 'day'],
  },
  'PHOTOGRAPHY': {
    descs: ['Weddings and introductions, edited gallery within a week.', 'Event photo and video, drone shots where permitted.', 'Portraits and family sessions for visiting relatives.', 'Graduation and send-off coverage, prints on the day.', 'Documentary coverage for community events.'],
    imgs: ['photo-1502920917128-1aa500764cbd', 'photo-1519741497674-611481863552'],
    rate: [150, 'day'],
  },
  'DECOR & MC': {
    descs: ['Kitenge and flower decor for harusi and send-offs.', 'Bilingual MC for weddings, fundraisers and galas.', 'Balloon arches and backdrop walls for photos.', 'Table styling and centrepieces, set up and cleared.', 'Programme planning and MC for harambees.'],
    imgs: ['photo-1519741497674-611481863552', 'photo-1519167758481-83f550bb49b3'],
    rate: [200, null],
  },
};

// A base rate in dollars, varied a little between providers.
function rateFor([usd, unit], index) {
  const amount = Math.round(usd * (0.8 + (index % 5) * 0.1));
  return unit ? `$${amount}/${unit}` : `FROM $${amount}`;
}

function slugify(value) {
  return String(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function enrich(provider) {
  const description = `${provider.name} offers ${provider.cat.toLowerCase()} in ${provider.city}. ${provider.desc} Rated ★${provider.rating} across ${provider.jobs} completed jobs on Twendezetu. Typical rate: ${provider.rate}.`;
  return { ...provider, description, blurb: provider.desc, href: `/providers/${provider.slug}` };
}

function buildCatalog() {
  const providers = [];
  const usedSlugs = new Set();
  const push = (provider) => {
    let slug = slugify(provider.name);
    while (usedSlugs.has(slug)) slug += '-x';
    usedSlugs.add(slug);
    providers.push(enrich({ ...provider, slug }));
  };
  SEED.forEach(push);
  PROVIDER_CATS.forEach((cat, ci) => {
    const names = NAMES[cat];
    for (let i = 0; i < 5; i += 1) {
      push({
        name: names[i % names.length] + (i >= names.length ? ` ${i + 1}` : ''),
        cat,
        rating: (4.5 + ((i + ci) % 5) * 0.1).toFixed(1),
        jobs: 12 + ((i * 17 + ci * 23) % 120),
        city: CITIES[(i * 2 + ci) % CITIES.length],
        desc: BY_CATEGORY[cat].descs[i % BY_CATEGORY[cat].descs.length],
        rate: rateFor(BY_CATEGORY[cat].rate, i),
        img: `https://images.unsplash.com/${BY_CATEGORY[cat].imgs[i % BY_CATEGORY[cat].imgs.length]}?w=600&q=80`,
        verified: (i + ci) % 3 === 0,
      });
    }
  });
  return providers;
}

export const PROVIDER_CATALOG = buildCatalog();
