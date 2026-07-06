const CURRENCIES = ['USD', 'KES', 'UGX', 'TZS', 'RWF'];

const initialState = {
  home: { currency: 'USD' },
  event: { rsvped: false, copied: false },
  create: {
    step: 1,
    kind: 'need',
    copied: false,
    toggles: { reveal: false, offers: true, digest: true, comments: false },
  },
  checkout: {
    qty: { early: 2, ga: 0, vip: 0 },
    method: 'online',
    currency: 'USD',
    promoValue: 'NANE20',
    promoApplied: false,
  },
  signin: { mode: 'register', role: 'advertiser' },
  myTwende: {
    tab: 'upcoming',
    copied: false,
    prefs: { rsvp: true, offers: true, friends: true, digest: false },
  },
  messages: { active: 0, accepted: false },
  wallet: {},
  provider: { copied: false },
  providerDashboard: {
    bellOpen: false,
    prefs: { leads: true, messages: true, digest: false, reviews: true },
  },
  mobile: {},
};

function clone(value) {
  return JSON.parse(JSON.stringify(value ?? {}));
}

function setLater(setPageState, value, delay = 1800) {
  setPageState((state) => ({ ...state, ...value }));
  window.setTimeout(() => {
    const reset = Object.fromEntries(Object.keys(value).map((key) => [key, false]));
    setPageState((state) => ({ ...state, ...reset }));
  }, delay);
}

function copyText(text) {
  try {
    navigator.clipboard.writeText(text);
  } catch (_error) {
    // Clipboard permission is optional; the visible copied state still confirms the interaction.
  }
}

function cycleCurrency(current) {
  return CURRENCIES[(CURRENCIES.indexOf(current) + 1) % CURRENCIES.length];
}

function moneyFormatter(currency) {
  const rates = { USD: 1, KES: 129, UGX: 3720, TZS: 2680, RWF: 1420 };
  const symbols = { USD: '$', KES: 'KES ', UGX: 'UGX ', TZS: 'TZS ', RWF: 'RWF ' };

  return (usd) => {
    const amount = usd * rates[currency];
    return symbols[currency] + (currency === 'USD' ? amount.toFixed(2) : Math.round(amount).toLocaleString());
  };
}

function homeValues(state, setPageState) {
  return {
    currency: state.currency,
    cycleCurrency: () => setPageState((current) => ({ ...current, currency: cycleCurrency(current.currency) })),
    cityLabel: 'NEW JERSEY / NEW YORK',
    eventCount: 24,
    services: [
      {
        href: 'Twendezetu Home.dc.html',
        img: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1400&q=80',
        kicker: 'WITH SPECIAL CARE',
        title: 'Weddings & harusi',
        desc: 'Venues, convoys, caterers and photographers who shoot like family.',
      },
      {
        href: 'Event Nyama Choma.dc.html',
        img: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=1400&q=80',
        kicker: 'THAT WON’T BE FORGOTTEN',
        title: 'Community & cookouts',
        desc: 'Nyama choma festivals, harambees, faith gatherings — every rika.',
      },
      {
        href: 'Twendezetu Home.dc.html',
        img: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1400&q=80',
        kicker: 'FIND YOUR VIBE',
        title: 'Music & DJs',
        desc: 'Bongo flava, amapiano, gospel — book the set or sell the tickets.',
      },
      {
        href: 'Create Event.dc.html',
        img: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=1400&q=80',
        kicker: 'MASKED & MATCHED',
        title: 'The needs board',
        desc: 'Drivers, tents, chefs, escorts — post the need, compare the offers.',
      },
    ],
    process: [
      { num: '01', title: 'Post', desc: 'An event or a need — free, in minutes. Your contacts are masked from day one.' },
      { num: '02', title: 'Share', desc: 'Every post gets a link built for WhatsApp and Facebook. Your circle spreads it for you.' },
      { num: '03', title: 'Match', desc: 'Providers in that city get notified and respond with offers, in-platform.' },
      { num: '04', title: 'Gather', desc: 'RSVP and tickets sync to calendars with reminders — 7 days, 1 day, 2 hours before.' },
      { num: '05', title: 'Settle', desc: 'Pay online, at the door, or pool points across borders. Fees only when money moves.' },
    ],
    categories: [
      { label: 'All (24)', bg: '#1F3A38', fg: '#F7F1E6' },
      { label: 'Nyama choma', bg: '#F7F1E6', fg: '#14201F' },
      { label: 'Music + DJs', bg: '#F7F1E6', fg: '#14201F' },
      { label: 'Community', bg: '#F7F1E6', fg: '#14201F' },
      { label: 'Weddings', bg: '#F7F1E6', fg: '#14201F' },
      { label: 'Faith', bg: '#F7F1E6', fg: '#14201F' },
      { label: 'Sports', bg: '#F7F1E6', fg: '#14201F' },
      { label: 'Needs board', bg: '#D97A3B', fg: '#14201F' },
    ],
    events: [
      {
        href: 'Event Nyama Choma.dc.html',
        img: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=600&q=80',
        title: 'NYTC Nyama Choma Festival',
        city: 'Lincoln Park · Jersey City, NJ',
        date: 'SAT · 8 AUG',
        price: 'FREE',
        going: 214,
        badge: 'FEATURED',
      },
      {
        href: 'Checkout.dc.html',
        img: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&q=80',
        title: 'Afrogroove Night',
        city: 'Brooklyn, NY',
        date: 'FRI · 14 AUG',
        price: 'FROM $20',
        going: 96,
        badge: 'TICKETS',
      },
      {
        href: '#',
        img: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=600&q=80',
        title: 'Umoja Cultural Day',
        city: 'Kampala, UG',
        date: 'SAT · 15 AUG',
        price: 'UGX 25,000',
        going: 310,
        badge: false,
      },
      {
        href: '#',
        img: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&q=80',
        title: 'Swahili Food Fair',
        city: 'Nairobi, KE',
        date: 'SUN · 16 AUG',
        price: 'KES 500',
        going: 152,
        badge: false,
      },
      {
        href: '#',
        img: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=600&q=80',
        title: 'Diaspora Connect Mixer',
        city: 'Newark, NJ',
        date: 'FRI · 21 AUG',
        price: 'FREE',
        going: 74,
        badge: 'NEW',
      },
      {
        href: '#',
        img: 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=600&q=80',
        title: 'Harusi Expo',
        city: 'Dar es Salaam, TZ',
        date: 'SAT · 22 AUG',
        price: 'TZS 10,000',
        going: 188,
        badge: false,
      },
      {
        href: '#',
        img: 'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=600&q=80',
        title: 'Kigali Open-Air Sessions',
        city: 'Kigali, RW',
        date: 'SAT · 29 AUG',
        price: 'RWF 5,000',
        going: 120,
        badge: false,
      },
      {
        href: '#',
        img: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600&q=80',
        title: 'Sunday Family Picnic',
        city: 'Hartford, CT',
        date: 'SUN · 30 AUG',
        price: 'FREE',
        going: 58,
        badge: false,
      },
    ],
    needs: [
      { num: '01', title: 'Driver + 4x4 needed', meta: 'Kampala → Jinja · 12–14 Sep · budget UGX 400K', offers: 6 },
      { num: '02', title: 'DJ for a cookout', meta: 'Jinja · 20 Sep · afrobeat + amapiano', offers: 4 },
      { num: '03', title: '3 canopy tents + chairs', meta: 'Jersey City, NJ · 8 Aug · NYTC festival', offers: 9 },
    ],
  };
}

function eventValues(state, setPageState) {
  return {
    rsvped: state.rsvped,
    rsvpLabel: state.rsvped ? '✓ You are going' : 'RSVP — I am going',
    rsvpBg: state.rsvped ? '#1F3A38' : '#D97A3B',
    rsvpFg: state.rsvped ? '#F7F1E6' : '#1F3A38',
    toggleRsvp: () => setPageState((current) => ({ ...current, rsvped: !current.rsvped })),
    copyLabel: state.copied ? '✓ COPIED' : 'COPY',
    copyLink: () => {
      copyText('https://twende.to/nyama-nanenane');
      setLater(setPageState, { copied: true });
    },
    schedule: [
      { time: '2:00 PM', title: 'Gates + karibu', desc: 'Saa nane mchana — find NYTC on the Communipaw Ave side', tag: 'ALL' },
      { time: '2:30 PM', title: 'Uchomaji wa nyama', desc: 'The grill masters begin — nyama choma, mishkaki, kuku', tag: 'FOOD' },
      { time: '3:30 PM', title: 'Michezo ya kila rika', desc: 'Games for every age — kids races, tug of war, bao', tag: 'GAMES' },
      { time: '5:00 PM', title: 'Burudani + DJ', desc: 'Live entertainment, bongo flava & amapiano sets', tag: 'MUSIC' },
      { time: '7:00 PM', title: 'Connection hour', desc: 'Community services, vendors, meet the leadership', tag: 'COMMUNITY' },
    ],
    similar: [
      {
        img: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&q=80',
        title: 'Afrogroove Night',
        city: 'Brooklyn, NY',
        date: 'FRI · 14 AUG',
      },
      {
        img: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=600&q=80',
        title: 'Diaspora Connect Mixer',
        city: 'Newark, NJ',
        date: 'FRI · 21 AUG',
      },
      {
        img: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600&q=80',
        title: 'Sunday Family Picnic',
        city: 'Hartford, CT',
        date: 'SUN · 30 AUG',
      },
    ],
  };
}

function createValues(state, setPageState) {
  const stepDefs = [
    [1, 'Type of post'],
    [2, 'Details'],
    [3, 'Privacy & alerts'],
    [4, 'Publish & share'],
  ];
  const toggle = (key) => {
    setPageState((current) => ({
      ...current,
      toggles: { ...current.toggles, [key]: !current.toggles[key] },
    }));
  };
  const mkToggle = (key, title, desc) => ({
    title,
    desc,
    bg: state.toggles[key] ? '#D97A3B' : '#EFE7D6',
    knobLeft: state.toggles[key] ? '30px' : '2px',
    toggle: () => toggle(key),
  });

  return {
    kind: state.kind,
    isStep1: state.step === 1,
    isStep2: state.step === 2,
    isStep3: state.step === 3,
    isStep4: state.step === 4,
    next: () => setPageState((current) => ({ ...current, step: Math.min(4, current.step + 1) })),
    back: () => setPageState((current) => ({ ...current, step: Math.max(1, current.step - 1) })),
    restart: () => setPageState((current) => ({ ...current, step: 1 })),
    steps: stepDefs.map(([num, label]) => ({
      num,
      label,
      go: () => setPageState((current) => ({ ...current, step: num })),
      bg: state.step === num ? '#1F3A38' : state.step > num ? '#D97A3B' : '#F7F1E6',
      fg: state.step === num ? '#F7F1E6' : '#1F3A38',
      weight: state.step === num ? 700 : 500,
      labelColor: state.step === num ? '#14201F' : '#6E6155',
    })),
    pickEvent: () => setPageState((current) => ({ ...current, kind: 'event' })),
    pickNeed: () => setPageState((current) => ({ ...current, kind: 'need' })),
    eventCardBg: state.kind === 'event' ? '#1F3A38' : '#FFFDF8',
    eventCardFg: state.kind === 'event' ? '#F7F1E6' : '#14201F',
    eventCardShadow: state.kind === 'event' ? '6px 6px 0 #D97A3B' : 'none',
    needCardBg: state.kind === 'need' ? '#1F3A38' : '#FFFDF8',
    needCardFg: state.kind === 'need' ? '#F7F1E6' : '#14201F',
    needCardShadow: state.kind === 'need' ? '6px 6px 0 #D97A3B' : 'none',
    privacyRows: [
      mkToggle('reveal', 'Reveal my contacts after I accept an offer', 'Until then, all messages go through the platform. Recommended: off.'),
      mkToggle('offers', 'Notify me when providers respond', 'Email + in-app. This is how you win — leave it on.'),
      mkToggle('digest', 'Weekly digest instead of instant alerts', 'Bundle non-urgent notifications so they never become a nuisance.'),
      mkToggle('comments', 'Allow public comments on this post', 'Anyone with the link can comment. You can turn this off anytime.'),
    ],
    copyLabel: state.copied ? '✓ COPIED' : 'COPY',
    copyLink: () => {
      copyText('https://twende.to/n/driver-kla-jinja');
      setLater(setPageState, { copied: true });
    },
  };
}

function checkoutValues(state, setPageState) {
  const prices = { early: 20, ga: 25, vip: 45 };
  const fmt = moneyFormatter(state.currency);
  const subtotal = state.qty.early * prices.early + state.qty.ga * prices.ga + state.qty.vip * prices.vip;
  const fee = subtotal * 0.05;
  const promo = state.promoApplied && subtotal >= 50 ? 20 : 0;
  const total = Math.max(0, subtotal + fee - promo);
  const altCurrency = state.currency === 'USD' ? 'KES' : 'USD';
  const altFmt = moneyFormatter(altCurrency);
  const setQty = (key, delta) => () => {
    setPageState((current) => ({
      ...current,
      qty: {
        ...current.qty,
        [key]: Math.max(0, Math.min(10, current.qty[key] + delta)),
      },
    }));
  };
  const mkTier = (id, name, tag, desc, was, soldOut) => ({
    name,
    tag,
    desc,
    was,
    soldOut,
    available: !soldOut,
    price: fmt(prices[id] ?? 0),
    qty: state.qty[id] ?? 0,
    plus: setQty(id, 1),
    minus: setQty(id, -1),
    opacity: soldOut ? 0.45 : 1,
  });
  const mkMethod = (id, title, desc) => ({
    title,
    desc,
    pick: () => setPageState((current) => ({ ...current, method: id })),
    bg: state.method === id ? '#1F3A38' : '#FFFDF8',
    fg: state.method === id ? '#F7F1E6' : '#14201F',
    shadow: state.method === id ? '4px 4px 0 #D97A3B' : 'none',
  });
  const lines = [];
  if (state.qty.early) lines.push({ label: `Early bird × ${state.qty.early}`, amount: fmt(state.qty.early * prices.early) });
  if (state.qty.ga) lines.push({ label: `General × ${state.qty.ga}`, amount: fmt(state.qty.ga * prices.ga) });
  if (state.qty.vip) lines.push({ label: `VIP lounge × ${state.qty.vip}`, amount: fmt(state.qty.vip * prices.vip) });
  if (!lines.length) lines.push({ label: 'No tickets selected', amount: '—' });

  return {
    tiers: [
      mkTier('early', 'Early bird', 'SAVE 20%', 'Pay online before 1 Aug · limited allocation', fmt(25), false),
      mkTier('ga', 'General admission', false, 'Entry 9 PM – 3 AM · all areas', false, false),
      mkTier('vip', 'VIP lounge', false, 'Lounge + bar access · free welcome drink', false, false),
      {
        name: 'Door price',
        tag: false,
        desc: 'Cash or card at the gate, if not sold out',
        was: false,
        price: fmt(25),
        soldOut: true,
        available: false,
        qty: 0,
        plus: () => {},
        minus: () => {},
        opacity: 0.45,
      },
    ],
    methods: [
      mkMethod('online', 'Pay online', 'Card or mobile money. Instant QR ticket + early-bird price.'),
      mkMethod('points', 'Twende points', 'Use your wallet, or let family abroad pay for you.'),
      mkMethod('door', 'Pay at door', 'Reserve free, pay the door price on arrival.'),
    ],
    lines,
    feePct: '5%',
    feeAmount: fmt(fee),
    promoApplied: state.promoApplied,
    promoAmount: fmt(promo),
    promoValue: state.promoValue,
    promoInput: (event) => setPageState((current) => ({ ...current, promoValue: event.target.value })),
    applyPromo: () =>
      setPageState((current) => ({
        ...current,
        promoApplied: current.promoValue.trim().toUpperCase() === 'NANE20',
      })),
    total: fmt(total),
    totalAlt: altFmt(total),
    currency: state.currency,
    cycleCurrency: () => setPageState((current) => ({ ...current, currency: cycleCurrency(current.currency) })),
    payLabel:
      state.method === 'door'
        ? 'Reserve — pay at door →'
        : state.method === 'points'
          ? 'Pay with points →'
          : `Pay ${fmt(total)} →`,
  };
}

function signinValues(state, setPageState) {
  const mkRole = (id, title, desc, tag) => ({
    title,
    desc,
    tag,
    pick: () => setPageState((current) => ({ ...current, role: id })),
    bg: state.role === id ? '#1F3A38' : '#FFFDF8',
    fg: state.role === id ? '#F7F1E6' : '#14201F',
    shadow: state.role === id ? '4px 4px 0 #D97A3B' : 'none',
  });
  const destinations = { user: 'My Twende.dc.html', advertiser: 'Create Event.dc.html', provider: 'Provider Dashboard.dc.html' };

  return {
    isRegister: state.mode === 'register',
    setSignIn: () => setPageState((current) => ({ ...current, mode: 'signin' })),
    setRegister: () => setPageState((current) => ({ ...current, mode: 'register' })),
    signInBg: state.mode === 'signin' ? '#1F3A38' : '#F7F1E6',
    signInFg: state.mode === 'signin' ? '#F7F1E6' : '#14201F',
    registerBg: state.mode === 'register' ? '#1F3A38' : '#F7F1E6',
    registerFg: state.mode === 'register' ? '#F7F1E6' : '#14201F',
    roleCards: [
      mkRole('user', 'User / guest', 'Browse, RSVP, save events, reminders, refer friends.', 'FREE'),
      mkRole('advertiser', 'Advertiser / event maker', 'Post events & needs, sell tickets, share links everywhere.', 'FREE TO POST'),
      mkRole('provider', 'Provider', 'Offer services — drivers, DJs, tents, catering. 12-month listing.', 'MEMBERSHIP'),
    ],
    ctaLabel: state.mode === 'register' ? 'Create account →' : 'Sign in →',
    ctaHref: state.mode === 'register' ? destinations[state.role] : 'My Twende.dc.html',
  };
}

function myTwendeValues(state, setPageState) {
  const mkTab = (id, label) => ({
    label,
    go: () => setPageState((current) => ({ ...current, tab: id })),
    bg: state.tab === id ? '#1F3A38' : '#F7F1E6',
    fg: state.tab === id ? '#F7F1E6' : '#14201F',
  });
  const mkPref = (key, label) => ({
    label,
    bg: state.prefs[key] ? '#D97A3B' : '#EFE7D6',
    knobLeft: state.prefs[key] ? '26px' : '2px',
    toggle: () =>
      setPageState((current) => ({
        ...current,
        prefs: { ...current.prefs, [key]: !current.prefs[key] },
      })),
  });

  return {
    tabs: [mkTab('upcoming', 'Upcoming'), mkTab('saved', 'Saved'), mkTab('inbox', 'Inbox'), mkTab('calendar', 'Calendar')],
    showUpcoming: state.tab === 'upcoming',
    showSaved: state.tab === 'saved',
    showInbox: state.tab === 'inbox',
    showCalendar: state.tab === 'calendar',
    upcoming: [
      {
        img: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=400&q=80',
        title: 'NYTC Nyama Choma Festival',
        city: 'Lincoln Park · Jersey City, NJ',
        date: 'SAT · 8 AUG · 2:00 PM',
        badge: 'GOING',
        badgeBg: '#D97A3B',
        href: 'Event Nyama Choma.dc.html',
        reminders: '7d · 1d · 2h before',
      },
      {
        img: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=400&q=80',
        title: 'Diaspora Connect Mixer',
        city: 'Newark, NJ',
        date: 'FRI · 21 AUG · 7:00 PM',
        badge: 'INTERESTED',
        badgeBg: '#F7F1E6',
        href: 'Twendezetu Home.dc.html',
        reminders: '1d before',
      },
    ],
    offers: [
      {
        name: 'Jersey Party Rentals',
        rating: '4.8',
        jobs: 112,
        note: '3× 20ft canopies, 60 chairs, delivery + setup by noon.',
        price: '$540',
      },
      {
        name: 'Mama T Events Co.',
        rating: '5.0',
        jobs: 38,
        note: 'Tents + chairs + 2 serving tables. NYTC member discount.',
        price: '$490',
      },
    ],
    saved: [
      {
        img: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&q=80',
        title: 'Afrogroove Night',
        city: 'Brooklyn, NY',
        date: 'FRI · 14 AUG',
        href: 'Twendezetu Home.dc.html',
      },
      {
        img: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=500&q=80',
        title: 'Umoja Cultural Day',
        city: 'Kampala, UG',
        date: 'SAT · 15 AUG',
        href: 'Twendezetu Home.dc.html',
      },
      {
        img: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500&q=80',
        title: 'Swahili Food Fair',
        city: 'Nairobi, KE',
        date: 'SUN · 16 AUG',
        href: 'Twendezetu Home.dc.html',
      },
      {
        img: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=500&q=80',
        title: 'Sunday Family Picnic',
        city: 'Hartford, CT',
        date: 'SUN · 30 AUG',
        href: 'Twendezetu Home.dc.html',
      },
    ],
    inbox: [
      {
        icon: '📩',
        from: 'Mama T Events Co.',
        body: 'New offer on "3 canopy tents + chairs" — $490 with member discount.',
        time: '2 HR AGO',
        bg: '#FBEED8',
      },
      {
        icon: '💬',
        from: 'UONGOZI — NYTC',
        body: 'Karibu! Parking details for Lincoln Park have been posted on the event page.',
        time: 'YESTERDAY',
        bg: '#FFFDF8',
      },
      {
        icon: '🎉',
        from: 'Twendezetu',
        body: 'Your friend Joel joined from your referral link. Asante kwa kualika!',
        time: '2 DAYS AGO',
        bg: '#FFFDF8',
      },
    ],
    month: [
      { num: '03', bg: '#FFFDF8', fg: '#14201F', label: false },
      { num: '04', bg: '#FFFDF8', fg: '#14201F', label: false },
      { num: '05', bg: '#FFFDF8', fg: '#14201F', label: false },
      { num: '06', bg: '#FFFDF8', fg: '#14201F', label: false },
      { num: '07', bg: '#FFFDF8', fg: '#14201F', label: false },
      { num: '08', bg: '#D97A3B', fg: '#1F3A38', label: 'NYAMA CHOMA 2PM' },
      { num: '09', bg: '#FFFDF8', fg: '#14201F', label: false },
      { num: '10', bg: '#FFFDF8', fg: '#14201F', label: false },
      { num: '11', bg: '#FFFDF8', fg: '#14201F', label: false },
      { num: '12', bg: '#FFFDF8', fg: '#14201F', label: false },
      { num: '13', bg: '#FFFDF8', fg: '#14201F', label: false },
      { num: '14', bg: '#FFFDF8', fg: '#14201F', label: false },
      { num: '15', bg: '#FFFDF8', fg: '#14201F', label: false },
      { num: '16', bg: '#FFFDF8', fg: '#14201F', label: false },
      { num: '17', bg: '#FFFDF8', fg: '#14201F', label: false },
      { num: '18', bg: '#1F3A38', fg: '#F7F1E6', label: 'TENTS NEED CLOSES' },
      { num: '19', bg: '#FFFDF8', fg: '#14201F', label: false },
      { num: '20', bg: '#FFFDF8', fg: '#14201F', label: false },
      { num: '21', bg: '#D97A3B', fg: '#1F3A38', label: 'MIXER 7PM' },
      { num: '22', bg: '#FFFDF8', fg: '#14201F', label: false },
      { num: '23', bg: '#FFFDF8', fg: '#14201F', label: false },
    ],
    prefs: [
      mkPref('rsvp', 'Event reminders (7d · 1d · 2h)'),
      mkPref('offers', 'Offers on my needs (instant)'),
      mkPref('friends', 'Friend RSVPs & referrals'),
      mkPref('digest', 'Weekly digest instead of instant'),
    ],
    copyLabel: state.copied ? '✓' : 'COPY',
    copyRef: () => {
      copyText('https://twende.to/r/amina');
      setLater(setPageState, { copied: true });
    },
  };
}

function messagesValues(state, setPageState) {
  const defs = [
    { name: 'Kato 4x4 & Tours', re: 'RE: DRIVER + 4X4 · KLA → JINJA', preview: 'Formal offer: UGX 760K, fuel included…', time: 'TUE' },
    { name: 'Jersey Party Rentals', re: 'RE: 3 CANOPY TENTS + CHAIRS', preview: 'We can deliver by noon on the 8th…', time: 'MON' },
    { name: 'UONGOZI — NYTC', re: 'NYAMA CHOMA FESTIVAL · UPDATES', preview: 'Karibu! Parking details for Lincoln Park…', time: 'SUN' },
    { name: 'DJ Zawadi', re: 'RE: DJ FOR A COOKOUT · JINJA', preview: 'Amapiano + bongo set, 4 hours…', time: 'SAT' },
  ];

  return {
    threads: defs.map((thread, index) => ({
      ...thread,
      open: () => setPageState((current) => ({ ...current, active: index })),
      bg: state.active === index ? '#1F3A38' : '#FFFDF8',
      fg: state.active === index ? '#F7F1E6' : '#14201F',
      metaColor: state.active === index ? '#E8A472' : '#A85A23',
      previewColor: state.active === index ? 'rgba(247,241,230,0.75)' : '#6E6155',
    })),
    accepted: state.accepted,
    acceptLabel: state.accepted ? '✓ ACCEPTED' : 'ACCEPT — UGX 760K',
    acceptOffer: () => setPageState((current) => ({ ...current, accepted: true })),
  };
}

function walletValues() {
  return {
    activity: [
      { icon: '↓', title: 'Top-up from card', meta: 'YESTERDAY · $10.00 → 1,000 PTS', amount: '+1,000', color: '#4a7c4a' },
      { icon: '🎟', title: 'Afrogroove Night — early bird', meta: '3 AUG · TICKET #TW-8841', amount: '−400', color: '#B8463A' },
      { icon: '🤝', title: 'From Joel M. (Hartford, CT)', meta: '1 AUG · "kwa mafuta ya safari"', amount: '+500', color: '#4a7c4a' },
      { icon: '⛽', title: 'Pool: fuel for police escort', meta: '28 JUL · HARUSI YA AMINA & DEO', amount: '−250', color: '#B8463A' },
    ],
    pools: [
      {
        title: 'Fuel for the police escort',
        meta: 'HARUSI YA AMINA & DEO · KAMPALA · 3 OCT',
        status: 'CLOSING SOON',
        statusBg: '#D97A3B',
        raised: 'UGX 380K',
        goal: 'UGX 450K',
        pct: '84%',
        barColor: '#D97A3B',
        count: 11,
        contributors: [
          { init: 'JM', bg: '#1F3A38', fg: '#F7F1E6' },
          { init: 'FK', bg: '#D97A3B', fg: '#1F3A38' },
          { init: 'AN', bg: '#7B8B6E', fg: '#F7F1E6' },
          { init: '+8', bg: '#EFE7D6', fg: '#14201F' },
        ],
      },
      {
        title: 'DJ from Kampala to Jinja',
        meta: 'COOKOUT YA WASHIKAJI · JINJA · 20 SEP',
        status: 'OPEN',
        statusBg: '#F7F1E6',
        raised: 'UGX 210K',
        goal: 'UGX 600K',
        pct: '35%',
        barColor: '#1F3A38',
        count: 6,
        contributors: [
          { init: 'SK', bg: '#1F3A38', fg: '#F7F1E6' },
          { init: 'MW', bg: '#D97A3B', fg: '#1F3A38' },
          { init: '+4', bg: '#EFE7D6', fg: '#14201F' },
        ],
      },
      {
        title: 'Tents & chairs — NYTC festival',
        meta: 'NYAMA CHOMA NANENANE · JERSEY CITY · 8 AUG',
        status: 'FUNDED ✓',
        statusBg: '#7B8B6E',
        raised: '$540',
        goal: '$540',
        pct: '100%',
        barColor: '#7B8B6E',
        count: 23,
        contributors: [
          { init: 'NY', bg: '#1F3A38', fg: '#F7F1E6' },
          { init: 'JM', bg: '#D97A3B', fg: '#1F3A38' },
          { init: 'AM', bg: '#7B8B6E', fg: '#F7F1E6' },
          { init: '+20', bg: '#EFE7D6', fg: '#14201F' },
        ],
      },
    ],
  };
}

function providerValues(state, setPageState) {
  return {
    copyLabel: state.copied ? '✓ COPIED' : 'COPY',
    copyLink: () => {
      copyText('https://twende.to/p/kato-4x4');
      setLater(setPageState, { copied: true });
    },
    services: [
      { num: '01', title: 'Up-country 4x4 + driver', desc: 'Land Cruiser, village-road ready, fuel itemised', rate: 'UGX 400K/day' },
      { num: '02', title: 'Airport transfers', desc: 'Entebbe ↔ Kampala, flight tracked, any hour', rate: 'UGX 150–200K' },
      { num: '03', title: 'Wedding convoys', desc: 'Decorated lead car + guest cars, coordinated', rate: 'UGX 300K/car' },
      { num: '04', title: 'Event shuttles', desc: 'Cookouts, harambees, church events — multi-trip', rate: 'QUOTE' },
    ],
    reviews: [
      {
        job: 'AIRPORT PICKUP',
        when: 'AUG 2026',
        body: 'Picked us up at Entebbe at 3am. Tracked the delayed flight, cold water waiting, kids asleep in ten minutes. Legend.',
        who: 'Faridah · visiting from CT, USA',
      },
      {
        job: 'UP-COUNTRY, 2 DAYS',
        when: 'JUL 2026',
        body: 'Took us to the village past Mbale where the road is only mud. Never complained, helped carry gifts, negotiated the boda crossing.',
        who: 'Joel M. · diaspora trip',
      },
      {
        job: 'WEDDING CONVOY',
        when: 'JUN 2026',
        body: 'Three spotless cars, on time, and he knew the photographer’s route better than the photographer.',
        who: 'Amina & Deo · Kampala',
      },
    ],
  };
}

function providerDashboardValues(state, setPageState) {
  const mkPref = (key, label) => ({
    label,
    bg: state.prefs[key] ? '#D97A3B' : '#EFE7D6',
    knobLeft: state.prefs[key] ? '26px' : '2px',
    toggle: () =>
      setPageState((current) => ({
        ...current,
        prefs: { ...current.prefs, [key]: !current.prefs[key] },
      })),
  });

  return {
    bellOpen: state.bellOpen,
    hasUnread: !state.bellOpen,
    toggleBell: () => setPageState((current) => ({ ...current, bellOpen: !current.bellOpen })),
    notifications: [
      { icon: '🚗', body: 'New matched need: "Driver + 4x4, Kampala → Jinja" — budget UGX 400K/day.', time: '12 MIN AGO' },
      { icon: '💬', body: 'Amina (NYTC) replied to your offer on "3 canopy tents + chairs".', time: '1 HR AGO' },
      { icon: '⭐', body: 'You received a 5-star review: "Picked us up at Entebbe at 3am. Legend."', time: 'YESTERDAY' },
    ],
    tiles: [
      { label: 'NEW LEADS', big: '3', sub: 'matched to your services', bg: '#D97A3B', fg: '#1F3A38' },
      { label: 'ACTIVE OFFERS', big: '5', sub: '2 awaiting reply', bg: '#FFFDF8', fg: '#14201F' },
      { label: 'JOBS BOOKED', big: '61', sub: 'lifetime · ★ 4.9 rating', bg: '#FFFDF8', fg: '#14201F' },
      { label: 'PROFILE VIEWS', big: '418', sub: 'last 30 days · +22%', bg: '#FFFDF8', fg: '#14201F' },
    ],
    leads: [
      {
        title: 'Driver + 4x4 needed',
        hot: true,
        meta: 'KAMPALA → JINJA · 12–14 SEP · POSTED FROM: USA (DIASPORA)',
        body: 'Visiting from the US to surprise family. Reliable driver with a 4x4 for village roads. Two days, fuel included in offer please.',
        budget: 'UGX 400K/day',
        offers: 6,
      },
      {
        title: 'Airport pickup, late night',
        hot: false,
        meta: 'ENTEBBE → KAMPALA · 28 SEP · 2:40 AM ARRIVAL',
        body: 'Family of four with luggage arriving on KQ412. Need a clean 7-seater and a driver who tracks the flight.',
        budget: 'UGX 180K',
        offers: 2,
      },
      {
        title: 'Wedding convoy — 3 cars',
        hot: false,
        meta: 'KAMPALA · 3 OCT · FULL DAY',
        body: 'Harusi convoy: one decorated lead car plus two guest cars. White or silver preferred.',
        budget: 'UGX 900K',
        offers: 4,
      },
    ],
    calendar: [
      { num: '07', bg: '#FFFDF8', fg: '#14201F', label: false },
      { num: '08', bg: '#FFFDF8', fg: '#14201F', label: false },
      { num: '09', bg: '#FFFDF8', fg: '#14201F', label: false },
      { num: '10', bg: '#FFFDF8', fg: '#14201F', label: false },
      { num: '11', bg: '#FFFDF8', fg: '#14201F', label: false },
      { num: '12', bg: '#1F3A38', fg: '#F7F1E6', label: 'KLA → JINJA (pending)' },
      { num: '13', bg: '#1F3A38', fg: '#F7F1E6', label: 'KLA → JINJA (pending)' },
      { num: '14', bg: '#1F3A38', fg: '#F7F1E6', label: 'Return leg' },
      { num: '15', bg: '#FFFDF8', fg: '#14201F', label: false },
      { num: '16', bg: '#FFFDF8', fg: '#14201F', label: false },
      { num: '17', bg: '#D97A3B', fg: '#1F3A38', label: 'City tour · BOOKED' },
      { num: '18', bg: '#FFFDF8', fg: '#14201F', label: false },
      { num: '19', bg: '#FFFDF8', fg: '#14201F', label: false },
      { num: '20', bg: '#D97A3B', fg: '#1F3A38', label: 'Cookout run · BOOKED' },
    ],
    bars: [
      { h: '30%', color: '#C9BFB1' },
      { h: '45%', color: '#C9BFB1' },
      { h: '38%', color: '#C9BFB1' },
      { h: '60%', color: '#D97A3B' },
      { h: '52%', color: '#C9BFB1' },
      { h: '74%', color: '#D97A3B' },
      { h: '66%', color: '#C9BFB1' },
      { h: '100%', color: '#1F3A38' },
    ],
    prefs: [
      mkPref('leads', 'New matched leads (instant)'),
      mkPref('messages', 'Messages & offer replies'),
      mkPref('digest', 'Weekly digest instead of instant'),
      mkPref('reviews', 'Reviews & ratings'),
    ],
  };
}

export function getInitialClaudePageState(page) {
  return clone(initialState[page]);
}

export function createClaudePageValues(page, state, setPageState) {
  switch (page) {
    case 'home':
      return homeValues(state, setPageState);
    case 'event':
      return eventValues(state, setPageState);
    case 'create':
      return createValues(state, setPageState);
    case 'checkout':
      return checkoutValues(state, setPageState);
    case 'signin':
      return signinValues(state, setPageState);
    case 'myTwende':
      return myTwendeValues(state, setPageState);
    case 'messages':
      return messagesValues(state, setPageState);
    case 'wallet':
      return walletValues();
    case 'provider':
      return providerValues(state, setPageState);
    case 'providerDashboard':
      return providerDashboardValues(state, setPageState);
    case 'mobile':
      return {};
    default:
      return {};
  }
}
