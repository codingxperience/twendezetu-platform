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
    bellOpen: false,
    profileOpen: false,
    referOpen: {},
    editOpen: {},
    calendarOn: { 0: true, 1: false },
    reminders: { 0: '7d - 1d - 2h', 1: '1d' },
    acceptedOffer: null,
    monthIdx: 0,
    selected: null,
    toast: null,
  },
  messages: {
    active: 0,
    accepted: false,
    draft: '',
    toast: null,
    reportOpen: false,
    attachOpen: false,
    counterVal: 'UGX 700K, fuel included',
    threadData: null,
  },
  wallet: {
    balance: 1250,
    toppedUp: false,
    sendOpen: false,
    topUpOpen: false,
    newPoolOpen: false,
    recipient: '',
    amount: '250',
    sendNoteVal: '',
    poolName: '',
    poolGoal: '75000',
    toast: null,
    toastKind: 'ok',
    sendNote: 'Send points to family, friends, or event pools. No phone number is shown until you choose to share it.',
  },
  provider: { copied: false, galleryIdx: 0, dirIdx: 0, askOpen: false, question: '', toast: null },
  providerDashboard: {
    bellOpen: false,
    profileOpen: false,
    prefs: { leads: true, messages: true, digest: false, reviews: true },
    leadUI: {},
    monthIdx: 0,
    renewed: false,
    toast: null,
  },
  admin: {
    section: 'overview',
    toast: null,
    reportState: {},
    userState: {},
    verifyState: {},
    postState: {},
    settings: { signups: true, autoScam: true, guestRsvp: true, poolRelease: false },
  },
  finance: {
    range: '30d',
    filter: 'ALL',
    payoutDone: false,
    released: {},
    toast: null,
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

function showToast(setPageState, message, delay = 3400, extra = {}) {
  setPageState((state) => ({ ...state, ...extra, toast: message }));
  window.setTimeout(() => {
    setPageState((state) => ({ ...state, toast: null }));
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
        href: 'Provider Listing.dc.html',
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
        href: 'Checkout.dc.html',
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

function walletValues(state, setPageState) {
  const balance = Number(state.balance ?? 0);
  const usd = balance / 100;
  const fmt = (amount) => Math.round(amount).toLocaleString();
  const resetTopUp = () => {
    window.setTimeout(() => {
      setPageState((current) => ({ ...current, toppedUp: false }));
    }, 1800);
  };

  return {
    balanceFmt: balance.toLocaleString(),
    equivalents: `Approx. $${usd.toFixed(2)} - KES ${fmt(usd * 129)} - UGX ${fmt(usd * 3720)} - TZS ${fmt(usd * 2680)}`,
    topUpLabel: state.toppedUp ? '+500 added' : 'Top up',
    topUp: () => {
      setPageState((current) => ({
        ...current,
        balance: Number(current.balance ?? 0) + 500,
        toppedUp: true,
        sendNote: 'Top-up added 500 PTS. Your updated balance is ready.',
      }));
      resetTopUp();
    },
    sendOpen: state.sendOpen,
    sendBg: state.sendOpen ? '#A85A23' : 'transparent',
    toggleSend: () =>
      setPageState((current) => ({
        ...current,
        sendOpen: !current.sendOpen,
      })),
    recipient: state.recipient,
    amount: state.amount,
    setRecipient: (event) =>
      setPageState((current) => ({
        ...current,
        recipient: event.target.value,
      })),
    setAmount: (event) =>
      setPageState((current) => ({
        ...current,
        amount: event.target.value,
      })),
    confirmSend: () => {
      setPageState((current) => {
        const amount = Math.floor(Number(current.amount));
        const recipient = String(current.recipient ?? '').trim();
        const currentBalance = Number(current.balance ?? 0);

        if (!recipient) {
          return { ...current, sendOpen: true, sendNote: 'Add a recipient before sending points.' };
        }

        if (!Number.isFinite(amount) || amount <= 0) {
          return { ...current, sendOpen: true, sendNote: 'Enter a positive points amount to send.' };
        }

        if (amount > currentBalance) {
          return { ...current, sendOpen: true, sendNote: 'That amount is above your available points balance.' };
        }

        return {
          ...current,
          amount: '250',
          balance: currentBalance - amount,
          recipient: '',
          sendOpen: true,
          sendNote: `Sent ${amount.toLocaleString()} PTS to ${recipient}.`,
        };
      });
    },
    sendNote: state.sendNote,
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

function myTwendeValuesV5(state, setPageState) {
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
  const reminderOptions = ['7d - 1d - 2h', '1d - 2h', '1d', 'Off'];
  const events = [
    {
      img: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=400&q=80',
      title: 'NYTC Nyama Choma Festival',
      city: 'Lincoln Park - Jersey City, NJ',
      date: 'SAT - 8 AUG - 2:00 PM',
      badge: 'GOING',
      badgeBg: '#D97A3B',
      href: 'Event Nyama Choma.dc.html',
      link: 'twende.to/nyama-nanenane?r=amina',
    },
    {
      img: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=400&q=80',
      title: 'Diaspora Connect Mixer',
      city: 'Newark, NJ',
      date: 'FRI - 21 AUG - 7:00 PM',
      badge: 'INTERESTED',
      badgeBg: '#F7F1E6',
      href: 'Event Nyama Choma.dc.html',
      link: 'twende.to/mixer-newark?r=amina',
    },
  ];
  const upcoming = events.map((event, index) => ({
    ...event,
    referOpen: !!state.referOpen[index],
    refer: () =>
      setPageState((current) => ({
        ...current,
        referOpen: { ...current.referOpen, [index]: !current.referOpen[index] },
      })),
    copy: () => {
      copyText(`https://${event.link}`);
      showToast(setPageState, 'Referral link copied. Invites are tracked in Analytics.');
    },
    shareWa: () => showToast(setPageState, `WhatsApp share ready for ${event.title}.`),
    shareFb: () => showToast(setPageState, `Facebook share ready for ${event.title}.`),
    shareEm: () => showToast(setPageState, `Email invite draft ready for ${event.title}.`),
    calLabel: state.calendarOn[index] ? 'CALENDAR ON' : 'ADD TO CAL',
    calBg: state.calendarOn[index] ? '#7B8B6E' : '#F7F1E6',
    calFg: state.calendarOn[index] ? '#F7F1E6' : '#14201F',
    toggleCal: () =>
      setPageState((current) => ({
        ...current,
        calendarOn: { ...current.calendarOn, [index]: !current.calendarOn[index] },
      })),
    reminders: state.reminders[index] || 'Off',
    editOpen: !!state.editOpen[index],
    editLabel: state.editOpen[index] ? 'DONE' : 'EDIT',
    toggleEdit: () =>
      setPageState((current) => ({
        ...current,
        editOpen: { ...current.editOpen, [index]: !current.editOpen[index] },
      })),
    reminderOpts: reminderOptions.map((option) => ({
      label: option,
      bg: state.reminders[index] === option ? '#1F3A38' : '#F7F1E6',
      fg: state.reminders[index] === option ? '#F7F1E6' : '#14201F',
      pick: () =>
        setPageState((current) => ({
          ...current,
          reminders: { ...current.reminders, [index]: option },
          editOpen: { ...current.editOpen, [index]: false },
          toast: `Reminder changed for ${event.title}: ${option}.`,
        })),
    })),
    action: index === 0 ? 'View event' : 'See details',
  }));
  const offerDefs = [
    { name: 'Jersey Party Rentals', rating: '4.8', jobs: 112, note: '3x 20ft canopies, 60 chairs, delivery and setup by noon.', price: '$540' },
    { name: 'Mama T Events Co.', rating: '5.0', jobs: 38, note: 'Tents, chairs and two serving tables. NYTC member discount included.', price: '$490' },
  ];
  const offers = offerDefs.map((offer, index) => ({
    ...offer,
    accepted: state.acceptedOffer === index,
    acceptLabel: state.acceptedOffer === index ? 'ACCEPTED' : 'ACCEPT OFFER',
    acceptBg: state.acceptedOffer === index ? '#7B8B6E' : '#D97A3B',
    acceptFg: state.acceptedOffer === index ? '#F7F1E6' : '#1F3A38',
    accept: () =>
      setPageState((current) => ({
        ...current,
        acceptedOffer: index,
        toast: `Offer accepted from ${offer.name}. Booking, escrow and masked thread are ready.`,
      })),
  }));
  const saved = [
    { img: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&q=80', title: 'Afrogroove Night', city: 'Brooklyn, NY', date: 'FRI - 14 AUG', href: 'Checkout.dc.html' },
    { img: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=500&q=80', title: 'Umoja Cultural Day', city: 'Kampala, UG', date: 'SAT - 15 AUG', href: 'Twendezetu Home.dc.html' },
    { img: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500&q=80', title: 'Swahili Food Fair', city: 'Nairobi, KE', date: 'SUN - 16 AUG', href: 'Twendezetu Home.dc.html' },
    { img: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=500&q=80', title: 'Sunday Family Picnic', city: 'Hartford, CT', date: 'SUN - 30 AUG', href: 'Twendezetu Home.dc.html' },
  ];
  const months = [
    {
      name: 'August 2026',
      days: 31,
      offset: 5,
      events: {
        8: { label: 'NYAMA CHOMA 2PM', color: '#D97A3B', title: 'NYTC Nyama Choma Festival', meta: 'Lincoln Park - Jersey City - RSVP, reminders on', href: 'Event Nyama Choma.dc.html' },
        18: { label: 'TENTS NEED CLOSES', color: '#1F3A38', title: 'Your need: 3 canopy tents', meta: 'Offer window closes - 9 offers received', href: 'Messages.dc.html' },
        21: { label: 'MIXER 7PM', color: '#D97A3B', title: 'Diaspora Connect Mixer', meta: 'Newark, NJ - interested', href: 'Event Nyama Choma.dc.html' },
      },
    },
    {
      name: 'September 2026',
      days: 30,
      offset: 1,
      events: {
        12: { label: 'KLA - JINJA TRIP', color: '#1F3A38', title: 'Driver + 4x4 - Kampala to Jinja', meta: 'Your posted need - 6 offers - trip day 1', href: 'Messages.dc.html' },
        14: { label: 'RETURN LEG', color: '#1F3A38', title: 'Return - Jinja to Kampala', meta: '6 PM pickup from Jinja town', href: 'Messages.dc.html' },
        20: { label: 'COOKOUT - JINJA', color: '#D97A3B', title: 'Cookout ya washikaji', meta: 'Jinja - DJ pool 35% funded', href: 'Points Wallet.dc.html' },
      },
    },
  ];
  const month = months[state.monthIdx] || months[0];
  const monthDays = Array.from({ length: month.offset + month.days }, (_, index) => {
    if (index < month.offset) return { num: '', label: false, bg: '#EFE7D6', fg: '#8C7F6F', outline: 'transparent', pick: () => {} };
    const day = index - month.offset + 1;
    const event = month.events[day];
    const selected = state.selected === day;
    return {
      num: String(day).padStart(2, '0'),
      label: event?.label || false,
      bg: event ? event.color : '#FFFDF8',
      fg: event ? '#F7F1E6' : '#14201F',
      outline: selected ? '4px solid #D97A3B' : '0',
      pick: () => setPageState((current) => ({ ...current, selected: event ? day : null })),
    };
  });
  const selected = state.selected ? month.events[state.selected] : null;

  return {
    bellOpen: state.bellOpen,
    bellBadge: !state.bellOpen,
    toggleBell: () => setPageState((current) => ({ ...current, bellOpen: !current.bellOpen, profileOpen: false })),
    profileOpen: state.profileOpen,
    toggleProfile: () => setPageState((current) => ({ ...current, profileOpen: !current.profileOpen, bellOpen: false })),
    toggleBellFromMenu: () => setPageState((current) => ({ ...current, bellOpen: true, profileOpen: false })),
    toastProfile: () => showToast(setPageState, 'Profile editor opens here: name, city, photo and notification language.'),
    tabs: [mkTab('upcoming', 'Upcoming'), mkTab('saved', 'Saved'), mkTab('calendar', 'Calendar'), mkTab('offers', 'Offers')],
    showUpcoming: state.tab === 'upcoming' || state.tab === 'offers',
    showSaved: state.tab === 'saved',
    showCalendar: state.tab === 'calendar',
    notices: [
      { time: '12 MIN', body: 'Mama T Events Co. lowered the tent offer to $490.' },
      { time: '1 HR', body: 'Two friends joined from your referral links.' },
    ],
    upcoming,
    offers,
    saved,
    monthName: month.name,
    monthDays,
    prevMonth: () => setPageState((current) => ({ ...current, monthIdx: Math.max(0, current.monthIdx - 1), selected: null })),
    nextMonth: () => setPageState((current) => ({ ...current, monthIdx: Math.min(months.length - 1, current.monthIdx + 1), selected: null })),
    selectedEvent: !!selected,
    selTitle: selected?.title || '',
    selMeta: selected?.meta || '',
    selDate: state.selected ? `${month.name.split(' ')[0]} ${state.selected}` : '',
    selHref: selected?.href || '#',
    clearSel: () => setPageState((current) => ({ ...current, selected: null })),
    prefs: [
      mkPref('rsvp', 'Event reminders (7d - 1d - 2h)'),
      mkPref('offers', 'Offers on my needs (instant)'),
      mkPref('friends', 'Friend RSVPs and referrals'),
      mkPref('digest', 'Weekly digest instead of instant'),
    ],
    copyLabel: state.copied ? 'COPIED' : 'COPY',
    copyRef: () => {
      copyText('https://twende.to/r/amina');
      setLater(setPageState, { copied: true });
    },
    toast: state.toast,
  };
}

function defaultMessageThreads() {
  return [
    {
      name: 'Kato 4x4 & Tours',
      initials: 'K4',
      sub: '- 4.9 - VERIFIED',
      re: 'RE: DRIVER + 4X4 - KLA TO JINJA',
      time: 'TUE',
      unread: true,
      offerState: 'open',
      msgs: [
        { kind: 'text', who: 'KATO 4X4', time: 'TUE 10:14', mine: false, text: 'Habari! I do the Jinja route weekly. Land Cruiser, village-road ready. Both days I can be with you by 6am.' },
        { kind: 'offer', offerId: '#OF-2214', offerTitle: '2 days - 4x4 + driver', offerPrice: 'UGX 760K', offerNote: 'Fuel included - Kampala pickup - village roads OK - flight tracking free' },
        { kind: 'text', who: 'YOU', time: 'TUE 10:31', mine: true, text: 'Yes, return on the 14th around 6pm from Jinja town. Please keep it quiet.' },
        { kind: 'warn', text: 'Contact details are masked until an offer is accepted.' },
      ],
    },
    {
      name: 'Jersey Party Rentals',
      initials: 'JP',
      sub: '- 4.8 - 112 JOBS',
      re: 'RE: 3 CANOPY TENTS + CHAIRS',
      time: 'MON',
      unread: false,
      offerState: 'open',
      msgs: [
        { kind: 'text', who: 'JERSEY PARTY', time: 'MON 14:02', mine: false, text: 'We can deliver three 20ft canopies and 60 chairs to Lincoln Park by noon on the 8th.' },
        { kind: 'offer', offerId: '#OF-2189', offerTitle: 'Tents + 60 chairs', offerPrice: '$540', offerNote: 'Delivery, setup and teardown included - insured - park permit compliant' },
      ],
    },
    {
      name: 'UONGOZI - NYTC',
      initials: 'NY',
      sub: '- ORGANIZER',
      re: 'NYAMA CHOMA FESTIVAL - UPDATES',
      time: 'SUN',
      unread: false,
      offerState: 'none',
      msgs: [
        { kind: 'text', who: 'NYTC', time: 'SUN 18:20', mine: false, text: 'Karibu! Parking details for Lincoln Park are now on the event page. Enter from Communipaw Ave.' },
        { kind: 'text', who: 'YOU', time: 'SUN 19:05', mine: true, text: 'Asante! Nakuja na familia yote. Is there a spot for the tents we are bringing?' },
      ],
    },
    {
      name: 'DJ Zawadi',
      initials: 'DZ',
      sub: '- 5.0 - 27 GIGS',
      re: 'RE: DJ FOR A COOKOUT - JINJA',
      time: 'SAT',
      unread: false,
      offerState: 'open',
      msgs: [
        { kind: 'text', who: 'DJ ZAWADI', time: 'SAT 11:40', mine: false, text: 'Amapiano plus bongo set, four hours, own decks and speakers. Transport from Kampala is the only extra.' },
        { kind: 'offer', offerId: '#OF-2160', offerTitle: '4-hour set + gear', offerPrice: 'UGX 350K', offerNote: 'Decks + PA included - deposit 20%' },
      ],
    },
  ];
}

function messagesValuesV5(state, setPageState) {
  const threads = state.threadData || defaultMessageThreads();
  const active = Math.min(state.active || 0, threads.length - 1);
  const thread = threads[active];
  const last = (item) => {
    const message = item.msgs[item.msgs.length - 1];
    return message.kind === 'offer' ? `Formal offer: ${message.offerPrice} - ${message.offerTitle}` : message.text || 'Offer status updated';
  };
  const patchThread = (updater) => {
    setPageState((current) => {
      const data = (current.threadData || threads).map((item) => ({ ...item, msgs: [...item.msgs] }));
      updater(data[Math.min(current.active || 0, data.length - 1)], data);
      return { ...current, threadData: data };
    });
  };
  const send = () => {
    const text = String(state.draft || '').trim();
    if (!text) {
      showToast(setPageState, 'Type a message first.');
      return;
    }
    const masked = text.replace(/(\+?\d[\d\s\-()]{7,})/g, '[hidden until acceptance]').replace(/\S+@\S+\.\S+/g, '[hidden until acceptance]');
    patchThread((item) => {
      item.msgs.push({ kind: 'text', who: 'YOU', time: 'NOW', mine: true, text: masked });
      if (masked !== text) item.msgs.push({ kind: 'warn', text: 'Contact details detected and masked until acceptance.' });
    });
    setPageState((current) => ({ ...current, draft: '' }));
    showToast(setPageState, masked === text ? 'Sent. They will see it in-app and by email.' : 'Sent with contact details masked.');
  };
  const messages = thread.msgs.map((message) => {
    const base = {
      isText: message.kind === 'text',
      isWarn: message.kind === 'warn',
      isOffer: message.kind === 'offer',
      isCounter: message.kind === 'counterUI',
      isAccepted: message.kind === 'accepted',
      align: message.mine ? 'end' : 'start',
      metaAlign: message.mine ? 'right' : 'left',
      bg: message.mine ? '#D97A3B' : '#FFFDF8',
      fg: message.mine ? '#1F3A38' : '#14201F',
      who: message.who,
      time: message.time,
      text: message.text,
    };
    if (message.kind !== 'offer') return base;
    return {
      ...base,
      offerId: message.offerId,
      offerTitle: message.offerTitle,
      offerPrice: message.offerPrice,
      offerNote: message.offerNote,
      offerOpen: thread.offerState === 'open',
      offerDone: thread.offerState !== 'open',
      offerStatus: thread.offerState === 'accepted' ? 'ACCEPTED - BOOKING CREATED' : thread.offerState === 'countered' ? 'COUNTERED - AWAITING REPLY' : '',
      accept: () => {
        patchThread((item) => {
          item.offerState = 'accepted';
          item.msgs.push({ kind: 'accepted' });
        });
        showToast(setPageState, 'Offer accepted. Contacts revealed, booking and escrow created.');
      },
      counter: () =>
        patchThread((item) => {
          item.offerState = 'countered';
          item.msgs.push({ kind: 'counterUI' });
        }),
    };
  });

  return {
    threads: threads.map((item, index) => ({
      name: item.name,
      re: item.re,
      time: item.time,
      unread: item.unread && active !== index,
      preview: last(item),
      open: () => setPageState((current) => ({ ...current, active: index, reportOpen: false, attachOpen: false })),
      bg: active === index ? '#1F3A38' : '#FFFDF8',
      fg: active === index ? '#F7F1E6' : '#14201F',
      metaColor: active === index ? '#E8A472' : '#A85A23',
      previewColor: active === index ? 'rgba(247,241,230,0.75)' : '#6E6155',
    })),
    activeName: thread.name,
    activeNameUpper: thread.name.toUpperCase(),
    activeInitials: thread.initials,
    activeSub: thread.sub,
    activeRe: thread.re,
    maskBg: thread.offerState === 'accepted' ? '#DCE8D9' : '#EFE7D6',
    maskLabel: thread.offerState === 'accepted' ? 'CONTACTS REVEALED' : 'CONTACTS MASKED',
    messages,
    reportOpen: state.reportOpen,
    toggleReport: () => setPageState((current) => ({ ...current, reportOpen: !current.reportOpen, attachOpen: false })),
    reportReasons: ['Spam or scam attempt', 'Asked to pay off-platform', 'Harassment or abuse', 'Fake listing or impersonation'].map((label) => ({
      label,
      pick: () => {
        setPageState((current) => ({ ...current, reportOpen: false }));
        showToast(setPageState, `Report filed: ${label}. Trust and safety will review within 24h.`);
      },
    })),
    attachOpen: state.attachOpen,
    attachBg: state.attachOpen ? '#D97A3B' : '#F7F1E6',
    toggleAttach: () => setPageState((current) => ({ ...current, attachOpen: !current.attachOpen, reportOpen: false })),
    attachOpts: [
      { label: 'Photo or file', message: 'File picker opens here for images and PDFs.' },
      { label: 'Location pin', message: 'Meeting point can be shared while exact address stays masked.' },
      { label: 'Payment request', message: 'Payment request will be held in escrow until the job is done.' },
    ].map((option) => ({
      label: option.label,
      pick: () => {
        setPageState((current) => ({ ...current, attachOpen: false }));
        showToast(setPageState, option.message);
      },
    })),
    draft: state.draft,
    setDraft: (event) => setPageState((current) => ({ ...current, draft: event.target.value })),
    onKey: (event) => {
      if (event.key === 'Enter') send();
    },
    send,
    counterVal: state.counterVal,
    setCounterVal: (event) => setPageState((current) => ({ ...current, counterVal: event.target.value })),
    sendCounter: () => {
      const value = state.counterVal || 'Counter offer';
      patchThread((item) => {
        item.msgs = item.msgs.filter((message) => message.kind !== 'counterUI');
        item.msgs.push({ kind: 'text', who: 'YOU', time: 'NOW', mine: true, text: `Counter-offer: ${value}` });
      });
      showToast(setPageState, `Counter sent to ${thread.name}.`);
    },
    toast: state.toast,
  };
}

function walletValuesV5(state, setPageState) {
  const fmt = (amount) => Number(amount || 0).toLocaleString('en-US');
  const poolDefs = [
    {
      title: 'Fuel for the police escort',
      meta: 'HARUSI YA AMINA & DEO - KAMPALA - 3 OCT',
      status: 'CLOSING SOON',
      statusBg: '#D97A3B',
      raised: 380,
      goal: 450,
      unit: 'UGX',
      unitK: true,
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
      meta: 'COOKOUT YA WASHIKAJI - JINJA - 20 SEP',
      status: 'OPEN',
      statusBg: '#F7F1E6',
      raised: 210,
      goal: 600,
      unit: 'UGX',
      unitK: true,
      count: 6,
      contributors: [
        { init: 'SK', bg: '#1F3A38', fg: '#F7F1E6' },
        { init: 'MW', bg: '#D97A3B', fg: '#1F3A38' },
        { init: '+4', bg: '#EFE7D6', fg: '#14201F' },
      ],
    },
    {
      title: 'Tents & chairs - NYTC festival',
      meta: 'NYAMA CHOMA NANENANE - JERSEY CITY - 8 AUG',
      status: 'FUNDED',
      statusBg: '#7B8B6E',
      raised: 540,
      goal: 540,
      unit: '$',
      count: 23,
      contributors: [
        { init: 'NY', bg: '#1F3A38', fg: '#F7F1E6' },
        { init: 'JM', bg: '#D97A3B', fg: '#1F3A38' },
        { init: 'AM', bg: '#7B8B6E', fg: '#F7F1E6' },
        { init: '+20', bg: '#EFE7D6', fg: '#14201F' },
      ],
    },
  ];
  const pools = [...(state.customPools || []), ...poolDefs].map((pool, index) => {
    const extra = state.poolProgress?.[index] || 0;
    const raised = pool.raised + extra;
    const pct = Math.min(100, Math.round((raised / pool.goal) * 100));
    const funded = pct >= 100;
    const amountLabel = pool.unitK ? `${pool.unit} ${raised}K` : `${pool.unit}${raised}`;
    const goalLabel = pool.unitK ? `${pool.unit} ${pool.goal}K` : `${pool.unit}${pool.goal}`;
    return {
      ...pool,
      raised: amountLabel,
      goal: goalLabel,
      pct: `${pct}%`,
      barColor: funded ? '#7B8B6E' : index === 1 ? '#1F3A38' : '#D97A3B',
      chipOpen: !!state.chipOpen?.[index] && !funded,
      chipLabel: funded ? 'FUNDED' : state.chipOpen?.[index] ? 'CLOSE' : 'CHIP IN',
      chipBg: funded ? '#7B8B6E' : '#D97A3B',
      chipFg: funded ? '#F7F1E6' : '#1F3A38',
      chipIn: () => {
        if (funded) {
          showToast(setPageState, 'This pool already hit its goal.');
          return;
        }
        setPageState((current) => ({ ...current, chipOpen: { ...current.chipOpen, [index]: !current.chipOpen?.[index] } }));
      },
      chipAmts: [100, 250, 500].map((amount) => ({
        label: `${amount} PTS`,
        give: () => {
          if (amount > Number(state.balance || 0)) {
            showToast(setPageState, `Insufficient balance for ${amount} points. Top up first.`, 3400, { toastKind: 'err' });
            return;
          }
          setPageState((current) => ({
            ...current,
            balance: Number(current.balance || 0) - amount,
            chipOpen: { ...current.chipOpen, [index]: false },
            poolProgress: { ...current.poolProgress, [index]: Number(current.poolProgress?.[index] || 0) + Math.max(1, Math.round(amount / 100)) },
          }));
          showToast(setPageState, `${fmt(amount)} pts added to ${pool.title}.`);
        },
      })),
      share: () => {
        copyText('https://twende.to/pool/' + pool.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
        showToast(setPageState, 'Pool link copied for WhatsApp or Facebook.');
      },
    };
  });
  const activity = state.activity || [
    { icon: 'v', iconBg: '#7B8B6E', iconFg: '#F7F1E6', title: 'Top-up from card', meta: 'YESTERDAY - $10.00 -> 1,000 PTS', amount: '+1,000', color: '#4a7c4a' },
    { icon: 'T', iconBg: '#D97A3B', iconFg: '#1F3A38', title: 'Afrogroove Night - early bird', meta: '3 AUG - TICKET #TW-8841', amount: '-400', color: '#B8463A' },
    { icon: '+', iconBg: '#7B8B6E', iconFg: '#F7F1E6', title: 'From Joel M. (Hartford, CT)', meta: '1 AUG - kwa mafuta ya safari', amount: '+500', color: '#4a7c4a' },
    { icon: 'P', iconBg: '#1F3A38', iconFg: '#F7F1E6', title: 'Pool: fuel for police escort', meta: '28 JUL - HARUSI YA AMINA & DEO', amount: '-250', color: '#B8463A' },
  ];

  return {
    balanceFmt: fmt(state.balance),
    balanceFmtSmall: fmt(state.balance),
    equivalents: `Approx. $${(Number(state.balance || 0) / 100).toFixed(2)} - KES ${fmt(Number(state.balance || 0) * 1.29)} - UGX ${fmt(Number(state.balance || 0) * 37.2)} - TZS ${fmt(Number(state.balance || 0) * 26.8)}`,
    topUpOpen: state.topUpOpen,
    topUpBg: state.topUpOpen ? '#E8A472' : '#D97A3B',
    toggleTopUp: () => setPageState((current) => ({ ...current, topUpOpen: !current.topUpOpen, sendOpen: false })),
    topUpOpts: [5, 10, 25, 50].map((usd) => ({
      label: `$${usd}`,
      pts: `+${fmt(usd * 100)} PTS`,
      buy: () => {
        setPageState((current) => ({
          ...current,
          balance: Number(current.balance || 0) + usd * 100,
          topUpOpen: false,
          activity: [{ icon: 'v', iconBg: '#7B8B6E', iconFg: '#F7F1E6', title: 'Top-up from card', meta: `JUST NOW - $${usd}.00 -> ${fmt(usd * 100)} PTS`, amount: `+${fmt(usd * 100)}`, color: '#4a7c4a' }, ...(current.activity || activity)],
        }));
        showToast(setPageState, `Top-up complete: +${fmt(usd * 100)} points.`);
      },
    })),
    sendOpen: state.sendOpen,
    sendBg: state.sendOpen ? 'rgba(247,241,230,0.15)' : 'none',
    toggleSend: () => setPageState((current) => ({ ...current, sendOpen: !current.sendOpen, topUpOpen: false })),
    recipient: state.recipient,
    sendNoteVal: state.sendNoteVal,
    amount: state.amount,
    setRecipient: (event) => setPageState((current) => ({ ...current, recipient: event.target.value })),
    setSendNote: (event) => setPageState((current) => ({ ...current, sendNoteVal: event.target.value })),
    setAmount: (event) => setPageState((current) => ({ ...current, amount: event.target.value })),
    confirmSend: () => {
      const amount = Math.floor(Number(state.amount));
      const recipient = String(state.recipient || '').trim();
      if (!recipient) {
        showToast(setPageState, 'Enter a recipient before sending.', 3400, { toastKind: 'err' });
        return;
      }
      if (!Number.isFinite(amount) || amount <= 0) {
        showToast(setPageState, 'Enter an amount above 0.', 3400, { toastKind: 'err' });
        return;
      }
      if (amount > Number(state.balance || 0)) {
        showToast(setPageState, `Insufficient balance. You have ${fmt(state.balance)} pts.`, 3400, { toastKind: 'err' });
        return;
      }
      setPageState((current) => ({
        ...current,
        balance: Number(current.balance || 0) - amount,
        recipient: '',
        amount: '250',
        sendNoteVal: '',
        sendOpen: false,
        activity: [{ icon: '>', iconBg: '#D97A3B', iconFg: '#1F3A38', title: `Sent to ${recipient}`, meta: state.sendNoteVal || 'JUST NOW - points transfer', amount: `-${fmt(amount)}`, color: '#B8463A' }, ...(current.activity || activity)],
      }));
      showToast(setPageState, `Sent ${fmt(amount)} pts to ${recipient}.`);
    },
    newPoolOpen: state.newPoolOpen,
    newPoolBg: state.newPoolOpen ? '#1F3A38' : '#F7F1E6',
    newPoolFg: state.newPoolOpen ? '#F7F1E6' : '#14201F',
    toggleNewPool: () => setPageState((current) => ({ ...current, newPoolOpen: !current.newPoolOpen })),
    poolName: state.poolName,
    poolGoal: state.poolGoal,
    setPoolName: (event) => setPageState((current) => ({ ...current, poolName: event.target.value })),
    setPoolGoal: (event) => setPageState((current) => ({ ...current, poolGoal: event.target.value })),
    createPool: () => {
      const name = String(state.poolName || '').trim();
      const goal = Number(state.poolGoal);
      if (!name) {
        showToast(setPageState, 'Give the pool a name first.', 3400, { toastKind: 'err' });
        return;
      }
      if (!Number.isFinite(goal) || goal <= 0) {
        showToast(setPageState, 'Set a pool goal above 0 points.', 3400, { toastKind: 'err' });
        return;
      }
      setPageState((current) => ({
        ...current,
        newPoolOpen: false,
        poolName: '',
        poolGoal: '75000',
        customPools: [{ title: name, meta: 'NEW HARAMBEE POOL - SHARE LINK READY', status: 'OPEN', statusBg: '#F7F1E6', raised: 0, goal: Math.round(goal / 100), unit: 'PTS ', count: 1, contributors: [{ init: 'AM', bg: '#D97A3B', fg: '#1F3A38' }] }, ...(current.customPools || [])],
      }));
      showToast(setPageState, 'Pool created. Share link copied.');
    },
    activity,
    pools,
    toast: state.toast,
    toastBg: state.toastKind === 'err' ? '#B8463A' : '#1F3A38',
    toastFg: '#F7F1E6',
  };
}

function providerValuesV5(state, setPageState) {
  const gallery = [
    ['https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=1400&q=80', 'Land Cruiser on the open road'],
    ['https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=1400&q=80', 'Driver at the wheel'],
    ['https://images.unsplash.com/photo-1502877338535-766e1452684a?w=1400&q=80', 'Vehicle detail'],
    ['https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1400&q=80', 'Up-country route'],
  ];
  const dir = [
    { name: 'DJ Zawadi', cat: 'MUSIC & DJS', rating: '5.0', jobs: 27, city: 'KAMPALA', desc: 'Amapiano + bongo sets, own decks and PA.', rate: 'UGX 350K/set', img: 'https://images.unsplash.com/photo-1571266028243-d220c6a7cbfd?w=600&q=80' },
    { name: 'Mama T Events Co.', cat: 'TENTS & EQUIPMENT', rating: '5.0', jobs: 38, city: 'JERSEY CITY', desc: 'Canopies, chairs, serving tables. NYTC member discount.', rate: 'FROM $490', img: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=600&q=80' },
    { name: 'Chef Halima', cat: 'CATERING & CHEFS', rating: '4.9', jobs: 54, city: 'DAR ES SALAAM', desc: 'Pilau, biryani and nyama choma for 20-500 guests.', rate: 'TZS 15K/plate', img: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=600&q=80' },
    { name: 'Jersey Party Rentals', cat: 'TENTS & EQUIPMENT', rating: '4.8', jobs: 112, city: 'NEWARK, NJ', desc: 'Full event rental fleet, insured and park-permit compliant.', rate: 'FROM $180', img: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=600&q=80' },
  ];
  const galleryIdx = state.galleryIdx || 0;
  const dirIdx = state.dirIdx || 0;
  return {
    galleryImg: gallery[galleryIdx][0],
    galleryAlt: gallery[galleryIdx][1],
    galleryCount: `${galleryIdx + 1} / ${gallery.length}`,
    galleryPrev: () => setPageState((current) => ({ ...current, galleryIdx: (current.galleryIdx + gallery.length - 1) % gallery.length })),
    galleryNext: () => setPageState((current) => ({ ...current, galleryIdx: (current.galleryIdx + 1) % gallery.length })),
    galleryDots: gallery.map((_item, index) => ({
      bg: index === galleryIdx ? '#D97A3B' : 'transparent',
      go: () => setPageState((current) => ({ ...current, galleryIdx: index })),
    })),
    askOpen: state.askOpen,
    askBg: state.askOpen ? '#D97A3B' : '#F7F1E6',
    toggleAsk: () => setPageState((current) => ({ ...current, askOpen: !current.askOpen })),
    question: state.question,
    setQuestion: (event) => setPageState((current) => ({ ...current, question: event.target.value })),
    sendAsk: () => {
      if (!String(state.question || '').trim()) {
        showToast(setPageState, 'Type your question first.');
        return;
      }
      setPageState((current) => ({ ...current, askOpen: false, question: '' }));
      showToast(setPageState, 'Question sent. A masked thread opens in Messages.');
    },
    copyLabel: state.copied ? 'COPIED' : 'COPY',
    copyLink: () => {
      copyText('https://twende.to/p/kato-4x4');
      setLater(setPageState, { copied: true });
    },
    shareWa: () => showToast(setPageState, 'WhatsApp share ready for Kato 4x4.'),
    shareFb: () => showToast(setPageState, 'Facebook share ready for Kato 4x4.'),
    shareX: () => showToast(setPageState, 'X share ready for Kato 4x4.'),
    services: [
      { num: '01', title: 'Up-country 4x4 + driver', desc: 'Land Cruiser, village-road ready, fuel itemised', rate: 'UGX 400K/day' },
      { num: '02', title: 'Airport transfers', desc: 'Entebbe to Kampala, flight tracked, any hour', rate: 'UGX 150-200K' },
      { num: '03', title: 'Wedding convoys', desc: 'Decorated lead car plus guest cars, coordinated', rate: 'UGX 300K/car' },
      { num: '04', title: 'Event shuttles', desc: 'Cookouts, harambees and church events', rate: 'QUOTE' },
    ],
    reviews: [
      { job: 'AIRPORT PICKUP', when: 'AUG 2026', body: 'Picked us up at Entebbe at 3am. Tracked the delayed flight and had cold water waiting.', who: 'Faridah - visiting from CT, USA' },
      { job: 'UP-COUNTRY, 2 DAYS', when: 'JUL 2026', body: 'Took us to the village past Mbale where the road is only mud. Never complained.', who: 'Joel M. - diaspora trip' },
      { job: 'WEDDING CONVOY', when: 'JUN 2026', body: 'Three spotless cars, on time, and he knew the photographer route better than anyone.', who: 'Amina & Deo - Kampala' },
    ],
    dirOffset: dirIdx + 1,
    dirPrev: () => setPageState((current) => ({ ...current, dirIdx: Math.max(0, current.dirIdx - 1) })),
    dirNext: () => setPageState((current) => ({ ...current, dirIdx: Math.min(dir.length - 2, current.dirIdx + 1) })),
    directory: dir.slice(dirIdx, dirIdx + 2).map((provider) => ({
      ...provider,
      view: () => showToast(setPageState, `${provider.name} profile would open here.`),
    })),
    toast: state.toast,
  };
}

function providerDashboardValuesV5(state, setPageState) {
  const patchLead = (index, patch) =>
    setPageState((current) => ({
      ...current,
      leadUI: { ...current.leadUI, [index]: { ...(current.leadUI[index] || {}), ...patch } },
    }));
  const mkPref = (key, label) => ({
    label,
    bg: state.prefs[key] ? '#D97A3B' : '#EFE7D6',
    knobLeft: state.prefs[key] ? '26px' : '2px',
    toggle: () => setPageState((current) => ({ ...current, prefs: { ...current.prefs, [key]: !current.prefs[key] } })),
  });
  const leadDefs = [
    { title: 'Driver + 4x4 needed', hot: true, meta: 'KAMPALA TO JINJA - 12-14 SEP - POSTED FROM USA', body: 'Visiting from the US to surprise family. Reliable driver with a 4x4 for village roads.', budget: 'UGX 400K/day', offers: 6, defPrice: 'UGX 760K total' },
    { title: 'Airport pickup, late night', hot: false, meta: 'ENTEBBE TO KAMPALA - 28 SEP - 2:40 AM ARRIVAL', body: 'Family of four with luggage arriving on KQ412. Need clean 7-seater and flight tracking.', budget: 'UGX 180K', offers: 2, defPrice: 'UGX 170K' },
    { title: 'Wedding convoy - 3 cars', hot: false, meta: 'KAMPALA - 3 OCT - FULL DAY', body: 'Harusi convoy: one decorated lead car plus two guest cars. White or silver preferred.', budget: 'UGX 900K', offers: 4, defPrice: 'UGX 880K' },
  ];
  const leads = leadDefs.map((lead, index) => {
    const ui = state.leadUI[index] || {};
    return {
      ...lead,
      offerOpen: !!ui.offerOpen,
      askOpen: !!ui.askOpen,
      sent: !!ui.sent,
      sentMsg: ui.sentMsg || '',
      offerBtnLabel: ui.offerSent ? 'OFFER SENT' : 'SEND OFFER ->',
      offerBtnBg: ui.offerSent ? '#7B8B6E' : '#1F3A38',
      offerBtnFg: '#F7F1E6',
      askBtnBg: ui.askOpen ? '#D97A3B' : 'transparent',
      toggleOffer: () => {
        if (ui.offerSent) {
          showToast(setPageState, 'Offer already sent. Track replies in Messages.');
          return;
        }
        patchLead(index, { offerOpen: !ui.offerOpen, askOpen: false });
      },
      toggleAsk: () => patchLead(index, { askOpen: !ui.askOpen, offerOpen: false }),
      offerPrice: ui.price || lead.defPrice,
      offerNote: ui.note || 'Fuel included, pickup confirmed, masked contact until acceptance.',
      question: ui.question || '',
      setPrice: (event) => patchLead(index, { price: event.target.value }),
      setNote: (event) => patchLead(index, { note: event.target.value }),
      setQuestion: (event) => patchLead(index, { question: event.target.value }),
      submitOffer: () => {
        patchLead(index, { offerOpen: false, offerSent: true, sent: true, sentMsg: `Formal offer sent (${ui.price || lead.defPrice}).` });
        showToast(setPageState, `Offer submitted on ${lead.title}.`);
      },
      submitAsk: () => {
        if (!String(ui.question || '').trim()) {
          showToast(setPageState, 'Type your question first.');
          return;
        }
        patchLead(index, { askOpen: false, sent: true, sentMsg: 'Question sent. A masked thread was opened.', question: '' });
        showToast(setPageState, `Question sent on ${lead.title}.`);
      },
    };
  });
  const months = [
    { name: 'September 2026', events: { 12: ['KLA -> JINJA', 'pending'], 13: ['KLA -> JINJA', 'pending'], 14: ['RETURN LEG', 'pending'], 17: ['CITY TOUR', 'booked'], 20: ['COOKOUT RUN', 'booked'] } },
    { name: 'October 2026', events: { 3: ['WEDDING CONVOY', 'booked'], 4: ['AIRPORT PICKUP', 'booked'], 12: ['JINJA DAY TRIP', 'pending'] } },
  ];
  const month = months[state.monthIdx] || months[0];
  const calendar = Array.from({ length: 28 }, (_item, index) => {
    const day = index + 1;
    const event = month.events[day];
    const booked = event?.[1] === 'booked';
    return {
      num: String(day).padStart(2, '0'),
      label: event?.[0] || false,
      bg: event ? (booked ? '#D97A3B' : '#1F3A38') : '#FFFDF8',
      fg: event ? '#F7F1E6' : '#14201F',
      pick: () => {
        if (event) showToast(setPageState, `${month.name} ${day}: ${event[0]} - ${booked ? 'confirmed and synced' : 'awaiting poster acceptance'}.`);
      },
    };
  });
  return {
    bellOpen: state.bellOpen,
    hasUnread: !state.bellOpen,
    toggleBell: () => setPageState((current) => ({ ...current, bellOpen: !current.bellOpen, profileOpen: false })),
    profileOpen: state.profileOpen,
    toggleProfile: () => setPageState((current) => ({ ...current, profileOpen: !current.profileOpen, bellOpen: false })),
    editProfile: () => showToast(setPageState, 'Business profile editor opens here.'),
    notifSettings: () => showToast(setPageState, 'Notification settings are in the right rail below.'),
    billing: () => showToast(setPageState, 'Billing: UGX 20,000/year membership, next renewal shown below.'),
    notifications: [
      { icon: 'CAR', body: 'New matched need: Driver + 4x4, Kampala to Jinja.', time: '12 MIN AGO' },
      { icon: 'MSG', body: 'Amina replied to your offer on tents and chairs.', time: '1 HR AGO' },
      { icon: 'STAR', body: 'You received a 5-star review.', time: 'YESTERDAY' },
    ],
    tiles: [
      { label: 'NEW LEADS', big: '3', sub: 'matched to your services', bg: '#D97A3B', fg: '#1F3A38' },
      { label: 'ACTIVE OFFERS', big: '5', sub: '2 awaiting reply', bg: '#FFFDF8', fg: '#14201F' },
      { label: 'JOBS BOOKED', big: '61', sub: 'lifetime - 4.9 rating', bg: '#FFFDF8', fg: '#14201F' },
      { label: 'PROFILE VIEWS', big: '418', sub: 'last 30 days - +22%', bg: '#FFFDF8', fg: '#14201F' },
    ],
    leads,
    monthName: month.name,
    prevMonth: () => setPageState((current) => ({ ...current, monthIdx: Math.max(0, current.monthIdx - 1) })),
    nextMonth: () => setPageState((current) => ({ ...current, monthIdx: Math.min(months.length - 1, current.monthIdx + 1) })),
    calendar,
    syncInfo: () => showToast(setPageState, 'Calendar sync is two-way with Google and Apple calendars.'),
    membershipStatus: state.renewed ? 'Active - renews in 577 days' : 'Active - renews in 212 days',
    membershipPct: state.renewed ? '100%' : '42%',
    renewBg: state.renewed ? '#7B8B6E' : '#D97A3B',
    renewLabel: state.renewed ? 'Renewed - receipt sent' : 'Renew early - save 15%',
    renew: () => {
      if (state.renewed) {
        showToast(setPageState, 'Already renewed. Receipt was emailed.');
        return;
      }
      setPageState((current) => ({ ...current, renewed: true }));
      showToast(setPageState, 'Membership renewed 12 more months at the early saving.');
    },
    payout: () => showToast(setPageState, 'Withdrawal of UGX 2.4M initiated to mobile money.'),
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
      mkPref('messages', 'Messages and offer replies'),
      mkPref('digest', 'Weekly digest instead of instant'),
      mkPref('reviews', 'Reviews and ratings'),
    ],
    editListing: () => showToast(setPageState, 'Listing editor opens here.'),
    shareListing: () => {
      copyText('https://twende.to/p/kato-4x4');
      showToast(setPageState, 'Listing link copied.');
    },
    toast: state.toast,
  };
}

function adminValues(state, setPageState) {
  const go = (section) => () => setPageState((current) => ({ ...current, section }));
  const navDefs = [
    ['overview', 'OVERVIEW', false],
    ['moderation', 'MODERATION', '3'],
    ['users', 'USERS & ROLES', false],
    ['verify', 'VERIFICATION', '2'],
    ['content', 'EVENTS & NEEDS', false],
    ['settings', 'SETTINGS', false],
  ];
  const reportDefs = [
    { severity: 'HIGH', sevBg: '#B8463A', reason: 'Asked to pay off-platform', meta: 'THREAD #TH-8812 - REPORTED BY AMINA M. - 2 HR AGO', body: 'Provider asked for a deposit to a personal mobile money number before accepting the offer.' },
    { severity: 'MED', sevBg: '#D97A3B', reason: 'Fake listing / impersonation', meta: 'LISTING #P-0417 - REPORTED BY KATO 4X4 - YESTERDAY', body: 'Image hash matches a verified listing and copied reviews.' },
    { severity: 'LOW', sevBg: '#7B8B6E', reason: 'Spam posting', meta: 'USER #U-2291 - AUTO-FLAGGED - YESTERDAY', body: 'Same provider pitch posted across multiple cities in 40 minutes.' },
  ];
  const reports = reportDefs.map((report, index) => ({
    ...report,
    open: !state.reportState[index],
    resolved: !!state.reportState[index],
    resolution: state.reportState[index] || '',
    dismiss: () => setPageState((current) => ({ ...current, reportState: { ...current.reportState, [index]: 'DISMISSED - NO ACTION' }, toast: 'Report dismissed and reporter notified.' })),
    warn: () => setPageState((current) => ({ ...current, reportState: { ...current.reportState, [index]: 'WARNING ISSUED' }, toast: 'Formal warning sent.' })),
    suspend: () => setPageState((current) => ({ ...current, reportState: { ...current.reportState, [index]: 'ACCOUNT SUSPENDED' }, toast: 'Account suspended and listings hidden.' })),
  }));
  const userDefs = [
    { name: 'Amina Mushi', email: 'am***@gmail.com', role: 'USER + ADVERTISER', city: 'NJ, USA', suspended: false },
    { name: 'Ssemakula Kato', email: 'ka***@gmail.com', role: 'PROVIDER', city: 'Kampala', suspended: false },
    { name: 'UONGOZI - NYTC', email: 'info@nytanzanian...', role: 'ORGANIZER', city: 'NJ, USA', suspended: false },
    { name: 'QuickCars UG', email: 'qc***@yahoo.com', role: 'PROVIDER', city: 'Kampala', suspended: true },
    { name: 'Joel M.', email: 'jo***@outlook.com', role: 'USER', city: 'Hartford, CT', suspended: false },
  ];
  const users = userDefs.map((user, index) => {
    const suspended = state.userState[index] != null ? state.userState[index] : user.suspended;
    return {
      ...user,
      status: suspended ? 'SUSPENDED' : 'ACTIVE',
      statusColor: suspended ? '#E8A472' : '#7B8B6E',
      view: () => showToast(setPageState, `${user.name}: profile, posts, threads and wallet ledger open read-only.`),
      toggleLabel: suspended ? 'REINSTATE' : 'SUSPEND',
      toggleBorder: suspended ? '#7B8B6E' : '#B8463A',
      toggleColor: suspended ? '#7B8B6E' : '#E8A472',
      toggle: () => setPageState((current) => ({ ...current, userState: { ...current.userState, [index]: !suspended }, toast: `${suspended ? 'Reinstated' : 'Suspended'} ${user.name}.` })),
    };
  });
  const verifications = [
    { name: 'Chef Halima Catering', meta: 'DAR ES SALAAM - CATERING - APPLIED 2 DAYS AGO', checks: [['ID DOC', '#7B8B6E'], ['BUSINESS PERMIT', '#7B8B6E'], ['PHONE VERIFIED', '#7B8B6E']] },
    { name: 'Simba Sounds', meta: 'NAIROBI - MUSIC & PA - APPLIED 4 DAYS AGO', checks: [['ID DOC', '#7B8B6E'], ['BUSINESS PERMIT MISSING', '#E8A472'], ['PHONE VERIFIED', '#7B8B6E']] },
    { name: 'Lensa ya Kigali', meta: 'KIGALI - PHOTOGRAPHY - APPLIED 1 WEEK AGO', checks: [['ID DOC', '#7B8B6E'], ['PORTFOLIO', '#7B8B6E'], ['PHONE VERIFIED', '#7B8B6E']] },
  ].map((verification, index) => ({
    ...verification,
    checks: verification.checks.map(([label, color]) => ({ label, color })),
    pending: !state.verifyState[index],
    done: !!state.verifyState[index],
    result: state.verifyState[index] === 'approved' ? 'APPROVED - BADGE LIVE' : 'MORE INFO REQUESTED',
    approve: () => setPageState((current) => ({ ...current, verifyState: { ...current.verifyState, [index]: 'approved' }, toast: `${verification.name} verified.` })),
    reject: () => setPageState((current) => ({ ...current, verifyState: { ...current.verifyState, [index]: 'info' }, toast: `Info request sent to ${verification.name}.` })),
  }));
  const posts = [
    { title: 'NYTC Nyama Choma Festival', by: 'UONGOZI - NYTC', type: 'EVENT', city: 'Jersey City', traction: '214 RSVP - 38 SH', featured: true },
    { title: 'Driver + 4x4 needed', by: 'Amina M.', type: 'NEED', city: 'Kampala', traction: '6 OFFERS', featured: false },
    { title: 'Afrogroove Night', by: 'Groove Ent.', type: 'EVENT - PAID', city: 'Brooklyn', traction: '96 SOLD', featured: false },
    { title: 'Umoja Cultural Day', by: 'Umoja CBO', type: 'EVENT - PAID', city: 'Kampala', traction: '310 SOLD', featured: false },
    { title: 'DJ for a cookout', by: 'Joel M.', type: 'NEED', city: 'Jinja', traction: '4 OFFERS', featured: false },
  ].map((post, index) => {
    const postState = state.postState[index] || {};
    const featured = postState.featured != null ? postState.featured : post.featured;
    const hidden = !!postState.hidden;
    return {
      ...post,
      featLabel: featured ? 'FEATURED' : 'FEATURE',
      featBg: featured ? '#D97A3B' : 'none',
      featFg: featured ? '#14201F' : '#E8A472',
      hideLabel: hidden ? 'UNHIDE' : 'HIDE',
      feature: () => setPageState((current) => ({ ...current, postState: { ...current.postState, [index]: { ...postState, featured: !featured } }, toast: `${featured ? 'Removed from' : 'Promoted to'} featured: ${post.title}.` })),
      hide: () => setPageState((current) => ({ ...current, postState: { ...current.postState, [index]: { ...postState, hidden: !hidden } }, toast: `${hidden ? 'Restored' : 'Hidden'}: ${post.title}.` })),
    };
  });
  const mkSetting = (key, title, desc) => ({
    title,
    desc,
    isToggle: true,
    isValue: false,
    bg: state.settings[key] ? '#D97A3B' : 'rgba(247,241,230,0.15)',
    knobLeft: state.settings[key] ? '28px' : '2px',
    toggle: () => setPageState((current) => ({ ...current, settings: { ...current.settings, [key]: !current.settings[key] }, toast: `Setting updated: ${title}.` })),
  });
  return {
    navItems: navDefs.map(([id, label, badge]) => ({ label, badge, go: go(id), bg: state.section === id ? '#F7F1E6' : 'transparent', fg: state.section === id ? '#14201F' : 'rgba(247,241,230,0.8)' })),
    isOverview: state.section === 'overview',
    isModeration: state.section === 'moderation',
    isUsers: state.section === 'users',
    isVerify: state.section === 'verify',
    isContent: state.section === 'content',
    isSettings: state.section === 'settings',
    kpis: [
      { label: 'TOTAL USERS', big: '12,480', delta: '+8.2% this month', deltaColor: '#7B8B6E' },
      { label: 'ACTIVE PROVIDERS', big: '1,146', delta: '+31 this week', deltaColor: '#7B8B6E' },
      { label: 'LIVE EVENTS', big: '324', delta: '24 featured-eligible', deltaColor: 'rgba(247,241,230,0.6)' },
      { label: 'OPEN NEEDS', big: '208', delta: '95% matched < 72h', deltaColor: '#7B8B6E' },
      { label: 'TICKETS SOLD (30D)', big: '8,912', delta: '+14.6% vs prior', deltaColor: '#7B8B6E' },
      { label: 'GMV (30D)', big: '$186K', delta: 'USD equivalent', deltaColor: 'rgba(247,241,230,0.6)' },
      { label: 'OPEN REPORTS', big: '3', delta: '1 high severity', deltaColor: '#E8A472' },
      { label: 'UPTIME (90D)', big: '99.97%', delta: 'last incident 41d ago', deltaColor: '#7B8B6E' },
    ],
    attention: [
      { label: 'HIGH report: off-platform payment attempt in thread #TH-8812', action: 'MODERATE', go: go('moderation') },
      { label: '2 provider verifications waiting over 48h', action: 'REVIEW', go: go('verify') },
      { label: 'Payout batch of $23,410 awaits finance approval', action: 'FINANCE', go: () => { window.location.href = '/finance'; } },
      { label: 'Featured slot for 15 Aug is empty - 3 candidates', action: 'CURATE', go: go('content') },
    ],
    reports,
    users,
    verifications,
    posts,
    settings: [
      mkSetting('signups', 'New provider sign-ups', 'Pause during fraud waves; existing providers unaffected.'),
      mkSetting('autoScam', 'Automated scam detection', 'Scan masked threads for payment-redirect language.'),
      mkSetting('guestRsvp', 'Guest RSVP without account', 'Growth loop; only disable under attack.'),
      mkSetting('poolRelease', 'Manual review of pool releases > $1,000', 'Adds finance review before large harambee payouts.'),
      { title: 'Platform fee', desc: 'Charged only on paid tickets and paid bookings. Free posts stay free.', isToggle: false, isValue: true, value: '5-7%' },
    ],
    toast: state.toast,
  };
}

function financeValues(state, setPageState) {
  const scales = { '7d': 0.28, '30d': 1, '90d': 2.6 };
  const scale = scales[state.range] || 1;
  const usd = (amount) => '$' + Math.round(amount * scale).toLocaleString('en-US');
  const ledgerRows = [
    { icon: 'T', type: 'TICKETS', iconBg: '#D97A3B', title: 'Umoja Cultural Day - 42 tickets', meta: 'TXN #TX-99120 - UGX 1,050,000 - MTN MOMO', status: 'SETTLED', statusColor: '#7B8B6E', gross: '$282', fee: '$14.10 (5%)' },
    { icon: 'B', type: 'BOOKINGS', iconBg: '#E8A472', title: 'Booking: Kato 4x4 - 2-day trip', meta: 'TXN #TX-99114 - UGX 760,000 - ESCROW', status: 'IN ESCROW', statusColor: '#E8A472', gross: '$204', fee: '$14.28 (7%)' },
    { icon: 'M', type: 'MEMBERSHIPS', iconBg: '#7B8B6E', title: 'Membership renewal: Chef Halima', meta: 'TXN #TX-99101 - TZS 48,000 - CARD', status: 'SETTLED', statusColor: '#7B8B6E', gross: '$18', fee: '$18 (100%)' },
    { icon: 'P', type: 'POINTS', iconBg: '#F7F1E6', title: 'Points top-up: Amina M.', meta: 'TXN #TX-99097 - $25.00 - CARD', status: 'SETTLED', statusColor: '#7B8B6E', gross: '$25', fee: '$0.75 (3%)' },
    { icon: 'R', type: 'REFUNDS', iconBg: '#B8463A', title: 'Refund: duplicate ticket purchase', meta: 'TXN #TX-99071 - KES 1,000 - REVERSAL', status: 'REFUNDED', statusColor: '#E8A472', gross: '-$7.75', fee: '$0' },
  ];
  return {
    ranges: ['7d', '30d', '90d'].map((range) => ({
      label: range.toUpperCase(),
      pick: () => setPageState((current) => ({ ...current, range })),
      bg: state.range === range ? '#F7F1E6' : 'transparent',
      fg: state.range === range ? '#14201F' : '#F7F1E6',
    })),
    rangeLabel: `LAST ${String(state.range || '30d').toUpperCase()}`,
    kpis: [
      { label: 'GROSS VOLUME (GMV)', big: usd(186000), sub: 'tickets + bookings + points', bg: '#D97A3B', fg: '#14201F' },
      { label: 'PLATFORM REVENUE', big: usd(11940), sub: 'fees + memberships', bg: '#1F3A38', fg: '#F7F1E6' },
      { label: 'FEES ON PAID FLOWS', big: usd(9020), sub: '5% tickets - 7% bookings - 3% points', bg: '#1F3A38', fg: '#F7F1E6' },
      { label: 'MEMBERSHIP REVENUE', big: usd(2920), sub: '1,146 active provider memberships', bg: '#1F3A38', fg: '#F7F1E6' },
    ],
    streams: [
      { label: 'Ticket fees (5%)', amount: usd(5480), pct: '46%', color: '#D97A3B' },
      { label: 'Booking fees (7%)', amount: usd(3540), pct: '30%', color: '#E8A472' },
      { label: 'Provider memberships', amount: usd(2920), pct: '24%', color: '#7B8B6E' },
      { label: 'Points float yield', amount: usd(680), pct: '6%', color: '#F7F1E6' },
    ],
    ledgerFilters: ['ALL', 'TICKETS', 'BOOKINGS', 'MEMBERSHIPS', 'POINTS', 'REFUNDS'].map((filter) => ({
      label: filter,
      pick: () => setPageState((current) => ({ ...current, filter })),
      bg: state.filter === filter ? '#14201F' : 'transparent',
      fg: state.filter === filter ? '#F7F1E6' : '#14201F',
    })),
    ledger: ledgerRows.filter((row) => state.filter === 'ALL' || row.type === state.filter),
    escrow: [
      { label: 'Kato 4x4 - Jinja trip', meta: 'BK-5521 - JOB 12-14 SEP', amount: '$204', until: 'AUTO 15 SEP', releasable: false, held: true },
      { label: 'Mama T - NYTC tents', meta: 'BK-7102 - JOB DONE, CONFIRMED', amount: '$490', releasable: !state.released[1], held: !!state.released[1], until: state.released[1] ? 'RELEASED' : '', release: () => setPageState((current) => ({ ...current, released: { ...current.released, 1: true }, toast: '$490 released to Mama T Events Co.' })) },
      { label: 'DJ Zawadi - cookout set', meta: 'BK-7099 - DEPOSIT 20%', amount: '$19', until: 'AUTO 21 SEP', releasable: false, held: true },
    ],
    payoutTotal: state.payoutDone ? '$0' : '$23,410',
    payoutCount: state.payoutDone ? '0' : '214',
    payoutLabel: state.payoutDone ? 'Batch approved - processing' : 'Approve weekly batch ->',
    payoutBg: state.payoutDone ? '#7B8B6E' : '#D97A3B',
    approvePayout: () => {
      if (state.payoutDone) {
        showToast(setPageState, 'Batch already processing. Next batch opens Monday.');
        return;
      }
      setPageState((current) => ({ ...current, payoutDone: true, toast: 'Payout batch approved: $23,410 to 214 providers.' }));
    },
    currencies: [
      { code: 'USD', pct: '38%', usd: '$70.7K' },
      { code: 'UGX', pct: '24%', usd: '$44.6K' },
      { code: 'KES', pct: '18%', usd: '$33.5K' },
      { code: 'TZS', pct: '14%', usd: '$26.0K' },
      { code: 'RWF', pct: '6%', usd: '$11.2K' },
    ],
    dunning: () => showToast(setPageState, 'Renewal reminders queued for 89 providers.'),
    exportCsv: () => showToast(setPageState, `Ledger export queued (${state.range}, ${state.filter}).`),
    toast: state.toast,
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
      return myTwendeValuesV5(state, setPageState);
    case 'messages':
      return messagesValuesV5(state, setPageState);
    case 'wallet':
      return walletValuesV5(state, setPageState);
    case 'provider':
      return providerValuesV5(state, setPageState);
    case 'providerDashboard':
      return providerDashboardValuesV5(state, setPageState);
    case 'admin':
      return adminValues(state, setPageState);
    case 'finance':
      return financeValues(state, setPageState);
    case 'mobile':
      return {};
    default:
      return {};
  }
}
