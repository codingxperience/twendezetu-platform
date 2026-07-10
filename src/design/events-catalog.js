// Single source of truth for the event catalog shared by the home shelves,
// My Twende feed, the per-event detail pages, and their social/OG metadata.
// Every event carries a stable slug + canonical href so shared links resolve
// to that event's own page (and preview with its own image + title).

export const EVENT_CATS = ['Nyama choma', 'Music + DJs', 'Community', 'Weddings', 'Faith', 'Sports'];

const ORGANIZERS = {
  'Nyama choma': 'Grill Masters Collective',
  'Music + DJs': 'Twende Live',
  'Community': 'Umoja Community Network',
  'Weddings': 'Harusi Planners Guild',
  'Faith': 'Faith Gatherings Network',
  'Sports': 'Diaspora Sports League',
};

const START_TIMES = ['2:00 PM', '4:00 PM', '6:00 PM', '7:00 PM', '9:00 PM', '11:00 AM'];

// The four flagship / real events, with bespoke copy.
const FEATURED = [
  {
    slug: 'nyama-choma-festival-2026',
    cat: 'Nyama choma',
    img: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=1100&q=80',
    title: 'NYTC Nyama Choma Festival',
    city: 'Lincoln Park · Jersey City, NJ',
    venue: 'Lincoln Park, Communipaw Ave side · Jersey City, NJ 07304',
    date: 'SAT · 8 AUG',
    time: '2:00 PM EDT',
    price: 'FREE',
    going: 214,
    badge: 'FEATURED',
    organizer: 'UONGOZI · NYTC',
    blurb: 'Nanenane on the Communipaw Ave side — grill masters fire up at 2:30 PM, games for every rika, live bongo flava and amapiano into the evening.',
    description: 'The NYTC Nyama Choma Festival returns for Nanenane on the Communipaw Ave side of Lincoln Park. Grill masters fire up at 2:30 PM, with games for every rika, community services, vendors, and live bongo flava and amapiano into the evening. Free entry, all ages.',
  },
  {
    slug: 'swahili-heritage-festival-2026',
    cat: 'Community',
    img: '/assets/events/swahili-heritage-festival.jpeg',
    title: 'Swahili Heritage Festival 2026',
    city: 'Africatown · Philadelphia, PA',
    venue: 'Africatown, 5800 Oxford Ave · Philadelphia, PA 19143',
    date: 'SUN · 26 JUL',
    time: '3:00 PM',
    price: 'FREE',
    going: 182,
    badge: 'HERITAGE',
    organizer: 'Tanzania Embassy, Washington D.C.',
    blurb: 'The Embassy of the United Republic of Tanzania proudly presents Tamasha la Urithi wa Kiswahili — “Kiswahili kwa Ushirikiano, Amani na Ustawi.” Music and culture with DJ Luke, 3–5 PM at Africatown, 5800 Oxford Ave.',
    description: 'Ubalozi wa Jamhuri ya Muungano wa Tanzania, Washington D.C., kwa fahari unawakaribisha katika Tamasha la Urithi wa Kiswahili 2026. Kaulimbiu: “Kiswahili kwa Ushirikiano, Amani na Ustawi.” Jiunge nasi kusherehekea utajiri wa lugha ya Kiswahili, utamaduni wa Tanzania, na urithi wa Afrika Mashariki kupitia muziki, utamaduni na mshikamano wa jamii — burudani ya muziki na DJ Luke. Jumapili, Julai 26, 2026 · Saa 9:00 Alasiri – Saa 11:00 Jioni · Africatown, 5800 Oxford Avenue, Philadelphia, PA 19143.',
  },
  {
    slug: 'afrogroove-night',
    cat: 'Music + DJs',
    img: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80',
    title: 'Afrogroove Night',
    city: 'Brooklyn, NY',
    venue: 'Brooklyn, NY',
    date: 'FRI · 14 AUG',
    time: '9:00 PM EDT',
    price: 'FROM $20',
    going: 96,
    badge: 'TICKETS',
    organizer: 'Afrogroove Collective',
    blurb: 'A diaspora dancefloor — afrobeat, amapiano and gengetone sets till late.',
    description: 'A diaspora dancefloor in Brooklyn — afrobeat, amapiano and gengetone sets till late. Early-bird tickets save 20% online before 1 Aug; the QR ticket lands in My Twende and your email. 18+ only.',
  },
  {
    slug: 'diaspora-connect-mixer',
    cat: 'Community',
    img: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&q=80',
    title: 'Diaspora Connect Mixer',
    city: 'Newark, NJ',
    venue: 'Newark, NJ',
    date: 'FRI · 21 AUG',
    time: '6:00 PM EDT',
    price: 'FREE',
    going: 74,
    badge: 'NEW',
    organizer: 'Diaspora Connect',
    blurb: 'Meet neighbours, mentors and new arrivals over chai and conversation.',
    description: 'Meet neighbours, mentors and new arrivals over chai and conversation. A relaxed evening for the Newark diaspora community to connect, share leads, and welcome newcomers. Free — RSVP to save your spot.',
  },
];

// Distinct, live-verified Unsplash photo IDs — one per generated event, no repeats within or across categories.
const CATALOG_IMAGES = {
  'Nyama choma': ['1555939594-58d7cb561ad1', '1544025162-d76694265947', '1600891964092-4316c288032e', '1432139555190-58524dae6a55', '1558030006-450675393462', '1529692236671-f1f6cf9683ba', '1565299624946-b28f40a0ae38', '1504674900247-0877df9cc836', '1512058564366-18510be2db19', '1466637574441-749b8f19452f', '1540189549336-e6e99c3679fe', '1476224203421-9ac39bcb3327', '1607013251379-e6eecfffe234', '1519708227418-c8fd9a32b7a2', '1571091718767-18b5b1457add', '1606787366850-de6330128bfc', '1552332386-f8dd00dc2f85', '1414235077428-338989a2e8c0', '1533777857889-4be7c70b33f7', '1546069901-ba9599a7e63c', '1498837167922-ddd27525d352', '1504754524776-8f4f37790ca0', '1559847844-5315695dadae'],
  'Music + DJs': ['1429962714451-bb934ecdc4ec', '1493225457124-a3eb161ffa5f', '1516280440614-37939bbacd81', '1501386761578-eac5c94b800a', '1459749411175-04bf5292ceea', '1514525253161-7a46d19cd819', '1470229722913-7c0e2dbbafd3', '1493676304819-0d7a8d026dcf', '1506157786151-b8491531f063', '1533174072545-7a4b6ad7a6c3', '1524368535928-5b5e00ddc76b', '1540039155733-5bb30b53aa14', '1511671782779-c97d3d27a1d4', '1508973379184-7517410fb0bc', '1531058020387-3be344556be6', '1516450360452-9312f5e86fc7', '1549834125-82d3c48159a3', '1544785349-c4a5301826fd', '1465847899084-d164df4dedc6', '1470229538611-16ba8c7ffbd7', '1454922915609-78549ad709bb'],
  'Community': ['1528605248644-14dd04022da1', '1511578314322-379afb476865', '1523580494863-6f3031224c94', '1517457373958-b7bdd4587205', '1509099836639-18ba1795216d', '1531206715517-5c0ba140b2b8', '1552664730-d307ca884978', '1488521787991-ed7bbaae773c', '1526976668912-1a811878dd37', '1517486808906-6ca8b3f04846', '1543269865-cbf427effbad', '1529156069898-49953e39b3ac', '1511632765486-a01980e01a18', '1573497019940-1c28c88b4f3e', '1560439514-4e9645039924', '1571019613454-1cb2f99b2d8b', '1491438590914-bc09fcaaf77a', '1523240795612-9a054b0db644', '1528901166007-3784c7dd3653', '1542744173-8e7e53415bb0', '1522202176988-66273c2fd55f', '1600880292203-757bb62b4baf', '1521737604893-d14cc237f11d', '1515169067868-5387ec356754'],
  'Weddings': ['1519741497674-611481863552', '1465495976277-4387d4b0b4c6', '1511285560929-80b456fea0bc', '1606216794074-735e91aa2c92', '1522673607200-164d1b6ce486', '1519225421980-715cb0215aed', '1464366400600-7168b8af9bc3', '1583939003579-730e3918a45a', '1460364157752-926555421a7e', '1594736797933-d0501ba2fe65', '1525258946800-98cfd641d0de', '1519671482749-fd09be7ccebf', '1478146059778-26028b07395a', '1591604466107-ec97de577aff', '1523438885200-e635ba2c371e', '1537633552985-df8429e8048b', '1509927083803-4bd519298ac4', '1469371670807-013ccf25f16a', '1550005809-91ad75fb315f', '1502635385003-ee1e6a1a742d', '1583939411023-14783179e581'],
  'Faith': ['1438232992991-995b7058bbb3', '1507692049790-de58290a4334', '1519491050282-cf00c82424b4', '1445019980597-93fa8acb246c', '1490127252417-7c393f993ee4', '1477414348463-c0eb7f1359b6', '1438032005730-c779502df39b', '1508963493744-76fce69379c0', '1529070538774-1843cb3265df', '1544427920-c49ccfb85579', '1502086223501-7ea6ecd79368', '1510590337019-5ef8d3d32116', '1473177104440-ffee2f376098', '1507842217343-583bb7270b66', '1524230572899-a752b3835840', '1520175480921-4edfa2983e0f', '1519681393784-d120267933ba', '1438761681033-6461ffad8d80', '1494790108377-be9c29b29330', '1531123897727-8f129e1688ce', '1544005313-94ddf0286df2', '1500648767791-00dcc994a43e'],
  'Sports': ['1517649763962-0c623066013b', '1543351611-58f69d7c1781', '1461896836934-ffe607ba8211', '1526232761682-d26e03ac148e', '1552667466-07770ae110d0', '1579952363873-27f3bade9f55', '1517927033932-b3d18e61fb3a', '1530549387789-4c1017266635', '1546519638-68e109498ffc', '1431324155629-1a6deb1dec8d', '1552674605-db6ffd4facb5', '1534438327276-14e5300c3a48', '1531415074968-036ba1b575da', '1552508744-1696d4464960', '1487466365202-1afdb86c764e', '1540747913346-19e32dc3e97e', '1524178232363-1fb2b075b655'],
};
const CATALOG_CITIES = ['Nairobi, KE', 'Kampala, UG', 'Dar es Salaam, TZ', 'Kigali, RW', 'Mombasa, KE', 'Jinja, UG', 'Arusha, TZ', 'Brooklyn, NY', 'Newark, NJ', 'Hartford, CT', 'Boston, MA', 'Dallas, TX'];
const CATALOG_DATES = ['FRI · 5 SEP', 'SAT · 6 SEP', 'SUN · 7 SEP', 'SAT · 13 SEP', 'FRI · 19 SEP', 'SAT · 20 SEP', 'SUN · 21 SEP', 'SAT · 27 SEP', 'FRI · 3 OCT', 'SAT · 4 OCT', 'SUN · 12 OCT', 'SAT · 18 OCT', 'SAT · 25 OCT', 'FRI · 31 OCT'];
const CATALOG_TITLES = {
  'Nyama choma': ['Nyama Choma Sundowner', 'Mishkaki Night Market', 'Grill & Chill Cookout', 'Choma Fest', 'Kuku & Ugali Fair', 'Diaspora BBQ Reunion', 'Weekend Braai', 'Village Roast Festival'],
  'Music + DJs': ['Bongo Flava Live', 'Amapiano Rooftop', 'Gengetone Takeover', 'Afrobeat Night', 'Rhumba Legends', 'Taarab Evening', 'Benga Revival', 'DJ Clash Live'],
  'Community': ['Umoja Cultural Day', 'Diaspora Connect Mixer', 'Swahili Language Meetup', 'Ubuntu Family Day', 'Newcomers Welcome', 'Elders Appreciation', 'Youth Mentorship Fair', 'Neighbourhood Harambee'],
  'Weddings': ['Harusi Expo', 'Bridal Showcase', 'Send-off Planning Fair', 'Ruracio Celebration', 'Engagement Soirée', 'Wedding Vendors Market', 'Kesho Bridal Fair', 'Traditional Wedding Day'],
  'Faith': ['Gospel Sunday Picnic', 'Praise & Worship Night', 'Kesha Overnight', 'Youth Revival', 'Interfaith Gathering', 'Thanksgiving Service', 'Choir Festival', 'Prayer Breakfast'],
  'Sports': ['Community 5K Run', 'Diaspora Football Cup', 'Netball Tournament', 'Athletics Meet', 'Boda Riders Rally', 'Marathon Fundraiser', 'Basketball Jam', 'Cricket Sunday'],
};
const CATALOG_PRICES = ['FREE', 'FROM $15', 'KES 500', 'UGX 20,000', 'TZS 10,000', 'RWF 5,000', 'FROM $25'];

function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function buildCatalog() {
  const events = FEATURED.map((event) => ({
    ...event,
    href: `/events/${event.slug}`,
    generated: false,
  }));
  const usedSlugs = new Set(events.map((event) => event.slug));

  EVENT_CATS.forEach((cat, ci) => {
    const imgs = CATALOG_IMAGES[cat];
    const titles = CATALOG_TITLES[cat];
    imgs.forEach((imgId, i) => {
      const title = titles[i % titles.length] + (i >= titles.length ? ` ${Math.floor(i / titles.length) + 1}` : '');
      let slug = slugify(title);
      while (usedSlugs.has(slug)) slug += `-${ci}${i}`;
      usedSlugs.add(slug);
      const city = CATALOG_CITIES[(i + ci * 2) % CATALOG_CITIES.length];
      const date = CATALOG_DATES[(i + ci) % CATALOG_DATES.length];
      const price = CATALOG_PRICES[(i + ci) % CATALOG_PRICES.length];
      const organizer = ORGANIZERS[cat];
      const time = START_TIMES[(i + ci) % START_TIMES.length];
      const priceText = price === 'FREE' ? 'Free entry — RSVP to save your spot' : `Tickets ${price.toLowerCase()}`;
      events.push({
        slug,
        href: `/events/${slug}`,
        generated: true,
        cat,
        img: `https://images.unsplash.com/photo-${imgId}?w=600&q=80`,
        title,
        city,
        venue: city,
        date,
        time,
        price,
        going: 24 + ((i * 37 + ci * 53) % 380),
        badge: i === 1 ? 'NEW' : false,
        organizer,
        blurb: `${organizer} brings ${title} to ${city}.`,
        description: `${title} — a ${cat.toLowerCase()} gathering hosted by ${organizer} in ${city} on ${date} at ${time}. ${priceText}. Tickets and reminders land in My Twende and your email, with a QR at the door.`,
      });
    });
  });
  return events;
}

export const EVENT_CATALOG = buildCatalog();

export function findEventBySlug(slug) {
  return EVENT_CATALOG.find((event) => event.slug === slug) || null;
}

export function eventsByCategory(cat) {
  return EVENT_CATALOG.filter((event) => event.cat === cat);
}
