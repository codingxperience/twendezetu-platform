// Seeds the database with the Kenya/Uganda-balanced vendor catalogue and
// the four demo accounts referenced in the README. Idempotent: re-running
// is safe — it upserts rather than duplicating.

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const db = new PrismaClient();

const VENDORS = [
  {
    slug: 'sarova-garden',
    name: 'The Sarova Garden',
    type: 'Heritage venue · Garden',
    category: 'venues',
    city: 'Nairobi',
    country: 'Kenya',
    description: 'A six-acre garden of native fever trees and bougainvillea on the leafy edge of Nairobi. Three ceremony lawns, a covered marquee for the reception, and a heritage stone barn for after-parties. Run by Wanjiru and her daughters since 1968.',
    rating: 4.94, reviewsCount: 412, basePrice: 280000, capacity: '120-340',
    tags: 'Outdoor,Heritage,Wedding',
    highlights: 'Acacia lawn ceremony,In-house catering,Bridal suite',
    hostName: 'Mama Wanjiru K.', hostYears: 6, superhost: true,
    coverImage: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=1200&q=80',
      'https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=1200&q=80',
      'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=1200&q=80',
      'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1200&q=80',
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&q=80',
    ].join(','),
    ownerEmail: 'mama@demo.tz',
    packages: [
      { name: 'The Acacia',    subtitle: 'Garden ceremony + marquee · 120 guests',                  price: 280000, includes: 'Lawn ceremony setup,Welcome drinks,Site visits ×2' },
      { name: 'The Jacaranda', subtitle: 'Full-day takeover + stone barn after-party · 180 guests', price: 420000, includes: 'All Acacia inclusions,Stone barn till midnight,Bridal suite overnight', featured: true },
      { name: 'The Heritage',  subtitle: 'Two-day stay + 240-guest reception · catering included',  price: 720000, includes: 'Two-night stay,Pan-African 4-course menu,Dedicated coordinator' },
    ],
  },
  {
    slug: 'kazuri-kitchen',
    name: 'Kazuri Kitchen',
    type: 'Caterer · Pan-African menu',
    category: 'catering',
    city: 'Nairobi', country: 'Kenya',
    description: 'Pan-African catering with live cooking stations. Specialising in nyama choma, coastal pilau, and contemporary plant-based menus for weddings and corporate events across Nairobi and Mombasa.',
    rating: 4.88, reviewsCount: 326, basePrice: 4800, unit: 'per guest',
    tags: 'Pan-African,Halal,Vegan',
    highlights: 'Live cooking stations,Nyama choma master,Coastal swahili menu',
    hostName: 'Chef Otieno', hostYears: 5, superhost: true,
    coverImage: 'https://images.unsplash.com/photo-1555244162-803834f70033?w=1200&q=80',
    gallery: 'https://images.unsplash.com/photo-1555244162-803834f70033?w=1200&q=80,https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&q=80',
    packages: [
      { name: 'Classic Spread',   subtitle: '3-course buffet for 100–200', price: 480000, includes: 'Starters,2 mains,Dessert' },
      { name: 'Premium Stations', subtitle: 'Live stations for 150–300',   price: 850000, includes: 'Nyama choma station,Pilau station,Bar service', featured: true },
    ],
  },
  {
    slug: 'mwalimu-studios',
    name: 'Mwalimu Studios',
    type: 'Photography & film',
    category: 'photo',
    city: 'Kampala', country: 'Uganda',
    description: 'Kampala-based documentary photo and film team. Cinematic weddings, corporate launches, and editorial portraits across Uganda, Rwanda, and Kenya.',
    rating: 4.97, reviewsCount: 187, basePrice: 145000,
    tags: 'Cinematic,Documentary',
    highlights: 'Two photographers,4K cinematic film,Same-day reel',
    hostName: 'Aisha L.', hostYears: 4, superhost: true,
    coverImage: 'https://images.unsplash.com/photo-1554080353-a576cf803bda?w=1200&q=80',
    gallery: 'https://images.unsplash.com/photo-1554080353-a576cf803bda?w=1200&q=80,https://images.unsplash.com/photo-1606800052052-a08af7148866?w=1200&q=80',
    ownerEmail: 'aisha@demo.tz',
    packages: [
      { name: 'Half-day coverage', subtitle: '4 hours · 2 photographers',  price: 145000, includes: '400 edited photos,Online gallery' },
      { name: 'Full-day + film',   subtitle: '10 hours · photo + 4K film', price: 320000, includes: '1000 edited photos,5-min film,Same-day reel', featured: true },
    ],
  },
  {
    slug: 'lake-victoria-pavilion',
    name: 'Lake Victoria Pavilion',
    type: 'Lakefront venue',
    category: 'venues',
    city: 'Entebbe', country: 'Uganda',
    description: 'A waterfront pavilion on the shores of Lake Victoria, 40 minutes from Kampala. Botanical-garden ceremonies, sunset cocktail decks, and the option of a vintage motor-boat arrival for the bridal party.',
    rating: 4.92, reviewsCount: 218, basePrice: 320000, capacity: '80-280',
    tags: 'Lakefront,Outdoor,Sunset ceremonies',
    highlights: 'Lake Victoria sunsets,Botanical gardens,Boat arrivals',
    hostName: 'David S.', hostYears: 8, superhost: true,
    coverImage: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=1200&q=80',
    gallery: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=1200&q=80,https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&q=80',
    packages: [
      { name: 'Sunset Ceremony',  subtitle: '3-hour ceremony + cocktails · 120 guests', price: 320000, includes: 'Garden setup,Cocktail deck,Sunset slot' },
      { name: 'Lakefront All-Day',subtitle: 'Full takeover + reception · 200 guests',  price: 540000, includes: 'Ceremony + reception,Botanical gardens,Boat arrival', featured: true },
    ],
  },
  {
    slug: 'kampala-rhythms',
    name: 'Kampala Rhythms',
    type: 'Live band + DJ',
    category: 'djs',
    city: 'Kampala', country: 'Uganda',
    description: 'Kampala-based live band and DJ collective. Afrobeats, Bongo Flava, classic Kadongo Kamu, and modern Lugaflow — read the room, light the room, play the room.',
    rating: 4.89, reviewsCount: 142, basePrice: 220000,
    tags: 'Afrobeats,Live band,Kadongo Kamu',
    highlights: '8h live set,Lighting + sound,Afrobeats + traditional',
    hostName: 'James M.', hostYears: 6, superhost: false,
    coverImage: 'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=1200&q=80',
    gallery: 'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=1200&q=80,https://images.unsplash.com/photo-1493676304819-0d7a8d026dcf?w=1200&q=80',
    packages: [
      { name: 'DJ set',    subtitle: '6h · sound + lighting',  price: 220000, includes: '6h DJ,Sound rig,Lighting' },
      { name: 'Band + DJ', subtitle: 'Live band 3h + DJ 5h',   price: 480000, includes: 'Live band,DJ,Sound + lighting', featured: true },
    ],
  },
  {
    slug: 'pearl-decor',
    name: 'Pearl of Africa Décor',
    type: 'Décor & florals',
    category: 'decor',
    city: 'Kampala', country: 'Uganda',
    description: 'Kampala-based décor studio blending traditional Buganda motifs with modern hospitality design. Tropical florals sourced from local growers in Mukono and Wakiso.',
    rating: 4.91, reviewsCount: 174, basePrice: 180000,
    tags: 'Traditional,Modern,Florals',
    highlights: 'Tablescapes,Backdrops,Fresh tropical florals',
    hostName: 'Sarah N.', hostYears: 5, superhost: true,
    coverImage: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&q=80',
    gallery: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&q=80',
    packages: [
      { name: 'Core décor', subtitle: 'Backdrop + 12 tables', price: 180000, includes: 'Backdrop,Tablescapes,Florals' },
      { name: 'Luxe décor', subtitle: 'Full venue dressing',  price: 380000, includes: 'Ceremony,Reception,Bridal suite', featured: true },
    ],
  },
  {
    slug: 'amani-decor',
    name: 'Amani Décor House',
    type: 'Décor & florals',
    category: 'decor',
    city: 'Nairobi', country: 'Kenya',
    description: 'Nairobi décor studio with a signature modern aesthetic. Fresh florals from the highlands, lighting design, and bespoke installations for weddings and corporate galas.',
    rating: 4.91, reviewsCount: 241, basePrice: 220000,
    tags: 'Modern,Floral,Lighting',
    highlights: 'Tablescapes,Backdrops,Fresh seasonal florals',
    hostName: 'Wambui K.', hostYears: 7, superhost: true,
    coverImage: 'https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=1200&q=80',
    gallery: 'https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=1200&q=80',
    packages: [
      { name: 'Standard',  subtitle: '10 tables + backdrop', price: 220000, includes: 'Tablescapes,Backdrop,Florals' },
      { name: 'Signature', subtitle: 'Full venue + lighting',price: 460000, includes: 'Décor,Florals,Lighting design', featured: true },
    ],
  },
  {
    slug: 'coast-pavilion',
    name: 'Diani Coast Pavilion',
    type: 'Beachfront venue',
    category: 'venues',
    city: 'Mombasa', country: 'Kenya',
    description: 'A white-sand beach venue on the Diani coast. Coral-stone pavilion, palm-fringed reception lawn, and a private stretch of beach for sunset ceremonies and barefoot vows.',
    rating: 4.95, reviewsCount: 187, basePrice: 380000, capacity: '60-180',
    tags: 'Beachfront,Sunset,Destination',
    highlights: 'White-sand beach,Coral pavilion,Sunset ceremonies',
    hostName: 'Khalid A.', hostYears: 9, superhost: true,
    coverImage: 'https://images.unsplash.com/photo-1589554484424-c8a99c69d44a?w=1200&q=80',
    gallery: 'https://images.unsplash.com/photo-1589554484424-c8a99c69d44a?w=1200&q=80',
    packages: [
      { name: 'Beach Ceremony', subtitle: 'Beachfront + cocktail · 100 guests', price: 380000, includes: 'Beach setup,Cocktail deck,Sunset slot' },
      { name: 'Coast All-Day',  subtitle: 'Ceremony + pavilion · 150 guests',   price: 620000, includes: 'Ceremony,Pavilion reception,Beach access', featured: true },
    ],
  },
  {
    slug: 'mama-grace-plans',
    name: 'Mama Grace Plans',
    type: 'Wedding planner & MC',
    category: 'mcs',
    city: 'Kigali', country: 'Rwanda',
    description: 'Kigali-based wedding planner and trilingual MC. Full-service planning, vendor coordination, and a calm bilingual presence on the day.',
    rating: 4.99, reviewsCount: 96, basePrice: 320000,
    tags: 'Planner,Bilingual MC',
    highlights: 'Full planning,EN/FR/KIN MC,Vendor management',
    hostName: 'Grace I.', hostYears: 10, superhost: true,
    coverImage: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1200&q=80',
    gallery: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1200&q=80',
    packages: [
      { name: 'MC only',       subtitle: 'Day-of MC · bilingual', price: 320000, includes: 'Run sheet,Bilingual MC,8h coverage' },
      { name: 'Full planning', subtitle: '6-month engagement',    price: 980000, includes: 'Vendor management,Site visits ×3,Day-of MC', featured: true },
    ],
  },
  {
    slug: 'dj-stylez',
    name: 'DJ Stylez x Band Bantu',
    type: 'DJ + live band',
    category: 'djs',
    city: 'Dar es Salaam', country: 'Tanzania',
    description: 'Dar es Salaam DJ + 7-piece live band. Specialising in Bongo Flava, Afrobeats, and classic Swahili Taarab for the older guests.',
    rating: 4.85, reviewsCount: 158, basePrice: 180000,
    tags: 'Afrobeats,Bongo Flava,Live band',
    highlights: '8h live set,Lighting rig,Sax + percussion',
    hostName: 'Stylez', hostYears: 7, superhost: false,
    coverImage: 'https://images.unsplash.com/photo-1493676304819-0d7a8d026dcf?w=1200&q=80',
    gallery: 'https://images.unsplash.com/photo-1493676304819-0d7a8d026dcf?w=1200&q=80',
    packages: [
      { name: 'DJ set',    subtitle: '8h DJ',              price: 180000, includes: '8h DJ,Sound,Lighting' },
      { name: 'Band + DJ', subtitle: 'Band 3h + DJ 5h',    price: 420000, includes: 'Live band,DJ,Full sound', featured: true },
    ],
  },
];

const DEMO_USERS = [
  { email: 'wanjiku@demo.tz', name: 'Wanjiku Kariuki',     city: 'Nairobi',       role: 'customer', password: 'demo1234' },
  { email: 'david@demo.tz',   name: 'David Ssemwogerere',  city: 'Kampala',       role: 'customer', password: 'demo1234' },
  { email: 'aisha@demo.tz',   name: 'Aisha L.',            city: 'Kampala',       role: 'vendor',   password: 'demo1234' },
  { email: 'mama@demo.tz',    name: 'Mama Wanjiru K.',     city: 'Nairobi',       role: 'vendor',   password: 'demo1234' },
];

async function main() {
  console.log('— Seeding users…');
  for (const u of DEMO_USERS) {
    const passwordHash = await bcrypt.hash(u.password, 10);
    await db.user.upsert({
      where: { email: u.email },
      update: { name: u.name, city: u.city, role: u.role, passwordHash },
      create: { email: u.email, name: u.name, city: u.city, role: u.role, passwordHash },
    });
  }

  console.log('— Seeding vendors and packages…');
  for (const v of VENDORS) {
    const { packages, ownerEmail, ...rest } = v;
    let ownerId;
    if (ownerEmail) {
      const owner = await db.user.findUnique({ where: { email: ownerEmail } });
      ownerId = owner?.id;
    }
    const vendor = await db.vendor.upsert({
      where: { slug: rest.slug },
      update: { ...rest, ownerId },
      create: { ...rest, ownerId },
    });
    await db.package.deleteMany({ where: { vendorId: vendor.id } });
    await db.package.createMany({
      data: packages.map((p, i) => ({
        vendorId: vendor.id,
        name: p.name,
        subtitle: p.subtitle,
        price: p.price,
        includes: p.includes,
        featured: p.featured || false,
        sortOrder: i,
      })),
    });
  }

  console.log('— Seeding inquiries…');
  const sarova = await db.vendor.findUnique({ where: { slug: 'sarova-garden' } });
  const mwalimu = await db.vendor.findUnique({ where: { slug: 'mwalimu-studios' } });
  await db.inquiry.deleteMany({});
  if (sarova) {
    await db.inquiry.createMany({
      data: [
        { vendorId: sarova.id,  customerName: 'Aisha & Khalid',  event: 'Wedding · 220 guests',     eventDate: new Date('2026-11-15'), status: 'new' },
        { vendorId: sarova.id,  customerName: 'Equity Bank',     event: 'Annual gala · 340 guests', eventDate: new Date('2026-12-04'), status: 'new' },
        { vendorId: sarova.id,  customerName: 'Daniel R.',       event: 'Birthday · 80 guests',     eventDate: new Date('2026-09-20'), status: 'replied' },
        { vendorId: sarova.id,  customerName: 'Mwende family',   event: 'Memorial · 150 guests',    eventDate: new Date('2026-09-28'), status: 'won' },
      ],
    });
  }
  if (mwalimu) {
    await db.inquiry.createMany({
      data: [
        { vendorId: mwalimu.id, customerName: 'Uganda Coffee Co.', event: 'Conference launch · 180 guests', eventDate: new Date('2026-10-10'), status: 'replied' },
        { vendorId: mwalimu.id, customerName: 'Faridah & Joel',    event: 'Engagement · 120 guests',        eventDate: new Date('2026-11-22'), status: 'new' },
      ],
    });
  }

  console.log('✓ Seed complete.');
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => db.$disconnect());
