import { EVENT_CATALOG, EVENT_CATS, findEventBySlug } from '@/design/events-catalog';
import { PROVIDER_CATALOG, findProviderBySlug } from '@/design/providers-catalog';

const CURRENCIES = ['USD', 'KES', 'UGX', 'TZS', 'RWF'];

const initialState = {
  home: { currency: 'USD', lang: 'en', cat: 'All' },
  event: { rsvpStep: 'idle', copied: false, gName: '', gEmail: '', gParty: 1, gError: null },
  eventDetail: { slug: 'nyama-choma-festival-2026', rsvpStep: 'idle', copied: false, gName: '', gEmail: '', gError: null },
  providerDetail: { slug: 'dj-zawadi', copied: false, reqOpen: false, reqName: '', reqEmail: '', reqMsg: '', reqError: null, reqDone: false, askOpen: false, question: '' },
  create: {
    step: 1,
    kind: 'need',
    ticketMode: 'free',
    tiers: [
      { name: 'Early bird', price: 'UGX 20,000', qty: '150' },
      { name: 'VIP lounge', price: 'UGX 45,000', qty: '40' },
    ],
    copied: false,
    toggles: { reveal: false, offers: true, digest: true, comments: false },
  },
  checkout: {
    qty: { early: 2, ga: 0, vip: 0 },
    method: 'online',
    currency: 'USD',
    promoValue: 'NANE20',
    promoApplied: false,
    buyerName: '',
    buyerEmail: '',
    paid: false,
    payError: null,
    waitlisted: false,
    group: false,
    guests: ['', ''],
    eventSlug: null,
  },
  signin: { mode: 'register', role: 'advertiser' },
  myTwende: {
    tab: 'foryou',
    following: { 0: true, 1: false, 2: false, 3: true },
    copied: false,
    prefs: { rsvp: true, offers: true, friends: true, digest: false },
    pausedPosts: {},
    bellOpen: false,
    profileOpen: false,
    referOpen: {},
    qrOpen: {},
    editOpen: {},
    calAdded: { 0: true, 1: false },
    reminders: { 0: '7d · 1d · 2h', 1: '1d' },
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
    pendingTopUp: null,
    cashOpen: false,
    cashAmount: '500',
    cashDest: 0,
    newPoolOpen: false,
    recipient: '',
    amount: '200',
    sendNoteVal: '',
    poolName: '',
    poolGoal: '5000',
    toast: null,
    toastKind: 'ok',
    sendNote: 'Send points to family, friends, or event pools. No phone number is shown until you choose to share it.',
  },
  provider: { copied: false, galleryIdx: 0, dirIdx: 0, askOpen: false, question: '', toast: null, writeOpen: false, starSel: 5, jobSel: '', draft: '', posted: false, reviewError: null },
  providerDashboard: {
    bellOpen: false,
    profileOpen: false,
    prefs: { leads: true, messages: true, digest: false, reviews: true },
    leadUI: {},
    monthIdx: 0,
    renewed: false,
    toast: null,
  },
  providerWallet: {
    avail: 2400,
    withdrawOpen: false,
    confirmOpen: false,
    wAmount: '2400',
    dest: 0,
    filter: 'ALL',
    toast: null,
    toastKind: 'ok',
    activity: null,
  },
  providerVerification: {
    section: 'business',
    savedAt: 'AUTOSAVE ON',
    f: {
      bizName: 'Kato 4x4 & Tours',
      bizCat: 'Transport & drivers',
      bizCities: 'Kampala, Jinja, Entebbe',
      bizYears: '10',
      bizDesc: '',
      idName: '',
      idNumber: '',
      idUploaded: false,
      proofRoute: 'formal',
      proofUploaded: false,
      proofNum: '',
      portUploaded: false,
      ref1: '',
      ref2: '',
      phone: '+256 7•• ••• 214',
      otp: 'idle',
      otpValue: '',
      payoutMethod: 0,
      payoutNum: '',
    },
    otp: 'idle',
    otpValue: '',
    otpError: false,
    submitted: false,
    toast: null,
  },
  settings: {
    section: 'profile',
    toast: null,
    saved: false,
    role: 'user',
    fields: { name: 'Amina Mushi', biz: 'Amina M.', email: 'amina@gmail.com', phone: '+1 (9**) *** 4412' },
    notifs: null,
    defaultPay: 0,
    twoFa: false,
    quiet: true,
  },
  admin: {
    section: 'overview',
    toast: null,
    adminMenuOpen: false,
    reportState: {},
    userState: {},
    verifyState: {},
    postState: {},
    settings: { signups: true, autoScam: true, guestRsvp: true, poolRelease: false },
  },
  finance: {
    range: '30d',
    filter: 'ALL',
    finMenuOpen: false,
    finSection: 'OVERVIEW',
    payoutDone: false,
    released: {},
    toast: null,
  },
  mobile: {},
  checkin: { admitted: 186, blocked: 3, seen: {}, result: null, manual: '', log: [] },
  disputes: { purchase: 0, reason: null, detail: '', evidence: false, submitted: false, formError: null, toast: null },
  organizerAnalytics: {},
  organizerPayouts: { withdrawn: false, toast: null },
  referralRewards: { copied: false, toast: null },
  splitPay: { paid: { 0: true, 1: true }, reminded: {}, copied: false, toast: null },
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
  setPageState((state) => {
    const next = { ...state, ...extra, toast: message };
    if ('toastKind' in state && !('toastKind' in extra)) next.toastKind = 'ok';
    return next;
  });
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

function scrollShelfBy(id, dir) {
  if (typeof document === 'undefined') return;
  const el = document.getElementById(id);
  if (el) el.scrollBy({ left: dir * Math.min(el.clientWidth * 0.9, 560), behavior: 'smooth' });
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
  const sw = state.lang === 'sw';
  const allEvents = EVENT_CATALOG;
  const catalogCats = EVENT_CATS;
  const shownEvents = state.cat === 'All' ? allEvents : allEvents.filter((event) => event.cat === state.cat);
  const heroEvent = allEvents[0];
  const scrollShelf = (id, dir) => () => {
    const el = typeof document !== 'undefined' ? document.getElementById(id) : null;
    if (el) el.scrollBy({ left: dir * Math.min(el.clientWidth * 0.9, 560), behavior: 'smooth' });
  };
  const shelves = catalogCats.map((cat) => {
    const catEvents = allEvents.filter((event) => event.cat === cat);
    const scrollId = `tw-shelf-${cat.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
    return {
      label: cat,
      count: `${catEvents.length} events`,
      scrollId,
      prev: scrollShelf(scrollId, -1),
      next: scrollShelf(scrollId, 1),
      jump: () => setPageState((current) => ({ ...current, cat })),
      events: catEvents,
    };
  });
  const exploreList = [allEvents[1], allEvents[2], allEvents[3]]
    .concat(['Music + DJs', 'Faith', 'Sports'].map((cat) => allEvents.find((event) => event.cat === cat && !event.badge)))
    .filter(Boolean)
    .slice(0, 6);

  return {
    isEn: !sw,
    isSw: sw,
    langLabel: sw ? 'SW -> EN' : 'EN -> SW',
    toggleLang: () => setPageState((current) => ({ ...current, lang: current.lang === 'en' ? 'sw' : 'en' })),
    currency: state.currency,
    cycleCurrency: () => setPageState((current) => ({ ...current, currency: cycleCurrency(current.currency) })),
    cityLabel: 'NEW JERSEY / NEW YORK',
    eventCount: shownEvents.length,
    isAll: state.cat === 'All',
    isFiltered: state.cat !== 'All',
    featured: {
      href: heroEvent.href,
      img: heroEvent.img,
      title: heroEvent.title,
      city: heroEvent.city,
      date: heroEvent.date,
      price: heroEvent.price,
      going: `${heroEvent.going} going`,
      badge: heroEvent.badge,
      blurb: heroEvent.blurb,
      kicker: '[Tukio kuu — featured this month]',
    },
    explore: exploreList.map((event) => ({
      href: event.href,
      img: event.img,
      title: event.title,
      date: event.date,
      city: event.city,
      price: event.price,
    })),
    shelves,
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
    process: sw
      ? [
          { num: '01', title: 'Tangaza', desc: 'Tukio au hitaji - bure, kwa dakika chache. Mawasiliano yako yamefichwa tangu mwanzo.' },
          { num: '02', title: 'Sambaza', desc: 'Kila tangazo lina link ya WhatsApp na Facebook. Mtandao wako unakusambazia.' },
          { num: '03', title: 'Unganishwa', desc: 'Watoa huduma wa mji huo wanapata taarifa na kujibu na ofa, ndani ya jukwaa.' },
          { num: '04', title: 'Kusanyika', desc: 'RSVP na tiketi zinaingia kalenda zenye vikumbusho - siku 7, siku 1, saa 2 kabla.' },
          { num: '05', title: 'Lipana', desc: 'Lipa mtandaoni, mlangoni, au changishana pointi kuvuka mipaka. Ada ni pale pesa inapohamia tu.' },
        ]
      : [
          { num: '01', title: 'Post', desc: 'An event or a need - free, in minutes. Your contacts are masked from day one.' },
          { num: '02', title: 'Share', desc: 'Every post gets a link built for WhatsApp and Facebook. Your circle spreads it for you.' },
          { num: '03', title: 'Match', desc: 'Providers in that city get notified and respond with offers, in-platform.' },
          { num: '04', title: 'Gather', desc: 'RSVP and tickets sync to calendars with reminders - 7 days, 1 day, 2 hours before.' },
          { num: '05', title: 'Settle', desc: 'Pay online, at the door, or pool points across borders. Fees only when money moves.' },
        ],
    categories: ['All', 'Nyama choma', 'Music + DJs', 'Community', 'Weddings', 'Faith', 'Sports']
      .map((category) => {
        const count = category === 'All' ? allEvents.length : allEvents.filter((event) => event.cat === category).length;
        const active = state.cat === category;
        return {
          label: `${category} (${count})`,
          pick: () => setPageState((current) => ({ ...current, cat: category })),
          bg: active ? '#1F3A38' : '#F7F1E6',
          fg: active ? '#F7F1E6' : '#14201F',
        };
      })
      .concat({
        label: 'Needs board ↓',
        pick: () => {
          const board = document.querySelector('[data-needs-board]');
          if (board) window.scrollTo({ top: board.offsetTop - 80, behavior: 'smooth' });
        },
        bg: '#D97A3B',
        fg: '#14201F',
      }),
    events: shownEvents.slice(0, 32),
    moreStories: [
      {
        href: 'Event Nyama Choma.dc.html',
        when: '2 HRS AGO',
        title: 'NYTC confirms the Communipaw Ave side for Nanenane',
        desc: 'Parking details posted; the grill masters start at 2:30 PM. Hii si ya kukosa.',
        img: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=500&q=80',
      },
      {
        href: 'Provider Listing.dc.html',
        when: '11 HRS AGO',
        title: 'Kato 4x4 hits 61 jobs with a 4.9 rating',
        desc: 'The village-road specialist on why late-night airport runs made his reputation.',
        img: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=500&q=80',
      },
      {
        href: 'Points Wallet.dc.html',
        when: '1 DAY AGO',
        title: 'Harambee pools: 23 contributors, 4 countries, one set of tents',
        desc: 'How the NYTC tents pool funded itself in 72 hours - and what it means for cross-border giving.',
        img: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=500&q=80',
      },
      {
        href: 'Create Event.dc.html',
        when: '2 DAYS AGO',
        title: 'Posting a need is free - and your number stays yours',
        desc: 'A walkthrough of masked contacts, offers, and escrow for first-time posters.',
        img: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500&q=80',
      },
    ],
    needs: [
      { num: '01', title: 'Driver + 4x4 needed', meta: 'Kampala → Jinja · 12–14 Sep · budget UGX 400K', offers: 6 },
      { num: '02', title: 'DJ for a cookout', meta: 'Jinja · 20 Sep · afrobeat + amapiano', offers: 4 },
      { num: '03', title: '3 canopy tents + chairs', meta: 'Jersey City, NJ · 8 Aug · NYTC festival', offers: 9 },
    ],
  };
}

function shareBase() {
  if (typeof window !== 'undefined' && window.location && window.location.origin) return window.location.origin;
  return process.env.NEXT_PUBLIC_APP_URL || 'https://twendezetu-platform-oufr.vercel.app';
}

function eventDetailValues(state, setPageState) {
  const event =
    findEventBySlug(state.slug) || {
      slug: state.slug || 'event',
      title: 'Event not found',
      cat: 'Community',
      img: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=1100&q=80',
      city: 'Twendezetu',
      venue: 'Twendezetu',
      date: 'SOON',
      time: '',
      price: 'FREE',
      going: 0,
      badge: false,
      organizer: 'Twendezetu',
      description: 'This event link could not be found. Browse the guide to discover events near you.',
    };
  const isFree = event.price === 'FREE';
  const dateLine = event.time ? `${event.date} · ${event.time}` : event.date;
  const heroImg = /^https:\/\/images\.unsplash\.com/.test(event.img) ? event.img.replace(/w=\d+/, 'w=1100') : event.img;
  const shareUrl = `${shareBase()}/events/${event.slug}`;
  const shareText = `${event.title} — ${event.date}, ${event.city}. Hii si ya kukosa!`;
  const rsvped = state.rsvpStep === 'done';
  const similar = EVENT_CATALOG.filter((item) => item.cat === event.cat && item.slug !== event.slug).slice(0, 8);

  return {
    title: event.title,
    category: event.cat,
    dateLine,
    city: event.city,
    venue: event.venue || event.city,
    price: event.price,
    priceHead: isFree ? 'Free entry' : event.price,
    going: event.going,
    img: heroImg,
    organizer: event.organizer,
    description: event.description,
    badge: event.badge,
    isFree,
    isPaid: !isFree,
    ticketsHref: `/checkout?event=${event.slug}`,
    // Guest RSVP (no account required)
    rsvped,
    notRsvped: !rsvped,
    rsvpForm: state.rsvpStep === 'form',
    rsvpLabel: state.rsvpStep === 'form' ? 'Finish below ↓' : 'RSVP — I am going',
    rsvpBg: state.rsvpStep === 'form' ? '#1F3A38' : '#D97A3B',
    rsvpFg: state.rsvpStep === 'form' ? '#F7F1E6' : '#1F3A38',
    toggleRsvp: () =>
      setPageState((current) => ({ ...current, rsvpStep: current.rsvpStep === 'idle' ? 'form' : 'idle', gError: null })),
    gName: state.gName || '',
    setGName: (e) => setPageState((current) => ({ ...current, gName: e.target.value, gError: null })),
    gEmail: state.gEmail || '',
    setGEmail: (e) => setPageState((current) => ({ ...current, gEmail: e.target.value, gError: null })),
    gError: state.gError,
    gNameShown: String(state.gName || '').split(' ')[0] || 'rafiki',
    confirmRsvp: () => {
      const name = String(state.gName || '').trim();
      const email = String(state.gEmail || '').trim();
      if (!name) {
        setPageState((current) => ({ ...current, gError: 'Please add your name.' }));
        return;
      }
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
        setPageState((current) => ({ ...current, gError: 'That email does not look right — we need it for your invite.' }));
        return;
      }
      setPageState((current) => ({ ...current, rsvpStep: 'done', gError: null }));
    },
    cancelRsvp: () => setPageState((current) => ({ ...current, rsvpStep: 'idle', gError: null })),
    // Share (canonical, unfurlable URL)
    shareUrl,
    copyLabel: state.copied ? '✓ COPIED' : 'COPY',
    copyLink: () => {
      copyText(shareUrl);
      setLater(setPageState, { copied: true });
    },
    waHref: `https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`,
    fbHref: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    emHref: `mailto:?subject=${encodeURIComponent(event.title)}&body=${encodeURIComponent(`${shareText}\n\n${shareUrl}`)}`,
    similar: similar.map((item) => ({
      href: item.href,
      img: item.img,
      title: item.title,
      city: item.city,
      date: item.date,
      price: item.price,
    })),
  };
}

function providerDetailValues(state, setPageState) {
  const provider =
    findProviderBySlug(state.slug) || {
      slug: state.slug || 'provider',
      name: 'Provider not found',
      cat: 'PROVIDERS',
      city: 'Twendezetu',
      rating: '5.0',
      jobs: 0,
      rate: '—',
      img: 'https://images.unsplash.com/photo-1516873240891-4bf014598ab4?w=1100&q=80',
      description: 'This provider link could not be found. Browse the directory to find providers near you.',
      verified: false,
      href: '/providers/provider',
    };
  const heroImg = /^https:\/\/images\.unsplash\.com/.test(provider.img) ? provider.img.replace(/w=\d+/, 'w=1100') : provider.img;
  const shareUrl = `${shareBase()}/providers/${provider.slug}`;
  const shareText = `${provider.name} — ${provider.cat} in ${provider.city}, ★${provider.rating} on Twendezetu.`;
  const similar = PROVIDER_CATALOG.filter((item) => item.cat === provider.cat && item.slug !== provider.slug).slice(0, 8);

  return {
    name: provider.name,
    category: provider.cat,
    city: provider.city,
    rating: provider.rating,
    jobs: provider.jobs,
    rate: provider.rate,
    img: heroImg,
    description: provider.description,
    isVerified: !!provider.verified,
    backHref: '/providers/kato-4x4',
    reviews: [
      { stars: '★★★★★', name: 'Amina M.', job: 'Wedding convoy', body: `${provider.name} was on time and professional — everything went through the platform, no surprises.` },
      { stars: '★★★★★', name: 'Joseph K.', job: 'Airport pickup', body: 'Great communication and fair pricing. Would book again.' },
      { stars: '★★★★☆', name: 'Grace N.', job: 'Community event', body: 'Solid, reliable service. Recommended for diaspora events.' },
    ],
    similar: similar.map((item) => ({ href: item.href, img: item.img, name: item.name, city: item.city, rating: item.rating, rate: item.rate })),
    // Request a service (guest, masked)
    reqOpen: state.reqOpen,
    reqNotDone: !state.reqDone,
    reqDone: state.reqDone,
    reqBg: state.reqOpen ? '#1F3A38' : '#D97A3B',
    reqFg: state.reqOpen ? '#F7F1E6' : '#1F3A38',
    reqBtnLabel: state.reqDone ? '✓ Request sent' : state.reqOpen ? 'Hide request form' : 'Request a service →',
    toggleReq: () => setPageState((current) => ({ ...current, reqOpen: !current.reqOpen, reqError: null })),
    reqName: state.reqName,
    setReqName: (e) => setPageState((current) => ({ ...current, reqName: e.target.value, reqError: null })),
    reqEmail: state.reqEmail,
    setReqEmail: (e) => setPageState((current) => ({ ...current, reqEmail: e.target.value, reqError: null })),
    reqMsg: state.reqMsg,
    setReqMsg: (e) => setPageState((current) => ({ ...current, reqMsg: e.target.value, reqError: null })),
    reqError: state.reqError,
    sendReq: () => {
      if (!String(state.reqName || '').trim()) {
        setPageState((current) => ({ ...current, reqError: 'Please add your name.' }));
        return;
      }
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(String(state.reqEmail || '').trim())) {
        setPageState((current) => ({ ...current, reqError: 'We need a valid email to route replies (it stays masked).' }));
        return;
      }
      if (!String(state.reqMsg || '').trim()) {
        setPageState((current) => ({ ...current, reqError: 'Tell the provider what you need.' }));
        return;
      }
      setPageState((current) => ({ ...current, reqDone: true, reqError: null }));
    },
    // Ask a question (guest)
    askOpen: state.askOpen,
    askBg: state.askOpen ? '#D97A3B' : '#F7F1E6',
    toggleAsk: () => setPageState((current) => ({ ...current, askOpen: !current.askOpen })),
    question: state.question,
    setQuestion: (e) => setPageState((current) => ({ ...current, question: e.target.value })),
    sendAsk: () => {
      if (!String(state.question || '').trim()) {
        showToast(setPageState, 'Type your question first.');
        return;
      }
      showToast(setPageState, `Question sent to ${provider.name} — replies arrive in-platform.`);
      setPageState((current) => ({ ...current, askOpen: false, question: '' }));
    },
    // Share (canonical, unfurlable URL)
    shareUrl,
    copyLabel: state.copied ? '✓ COPIED' : 'COPY',
    copyLink: () => {
      copyText(shareUrl);
      setLater(setPageState, { copied: true });
    },
    waHref: `https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`,
    fbHref: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    emHref: `mailto:?subject=${encodeURIComponent(provider.name)}&body=${encodeURIComponent(`${shareText}\n\n${shareUrl}`)}`,
  };
}

function eventValues(state, setPageState) {
  const done = state.rsvpStep === 'done';
  const party = state.gParty || 1;

  return {
    rsvped: done,
    rsvpForm: state.rsvpStep === 'form',
    rsvpLabel: done ? 'You are going' : state.rsvpStep === 'form' ? 'Finish below' : 'RSVP - I am going',
    rsvpBg: done ? '#1F3A38' : '#D97A3B',
    rsvpFg: done ? '#F7F1E6' : '#1F3A38',
    toggleRsvp: () =>
      setPageState((current) => ({
        ...current,
        rsvpStep: current.rsvpStep === 'idle' ? 'form' : 'idle',
        gError: null,
      })),
    gName: state.gName || '',
    setGName: (event) => setPageState((current) => ({ ...current, gName: event.target.value, gError: null })),
    gEmail: state.gEmail || '',
    setGEmail: (event) => setPageState((current) => ({ ...current, gEmail: event.target.value, gError: null })),
    partyOpts: [1, 2, 3, 4].map((count) => ({
      label: count === 4 ? '4+ GUESTS' : `${count} ${count === 1 ? 'GUEST' : 'GUESTS'}`,
      pick: () => setPageState((current) => ({ ...current, gParty: count })),
      bg: party === count ? '#1F3A38' : '#FFFDF8',
      fg: party === count ? '#F7F1E6' : '#14201F',
    })),
    gError: state.gError,
    confirmRsvp: () => {
      const name = String(state.gName || '').trim();
      const email = String(state.gEmail || '').trim();
      if (!name) {
        setPageState((current) => ({ ...current, gError: 'Please add your name.' }));
        return;
      }
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
        setPageState((current) => ({ ...current, gError: 'That email does not look right - we need it for your invite.' }));
        return;
      }
      setPageState((current) => ({ ...current, rsvpStep: 'done', gError: null }));
    },
    cancelRsvp: () => setPageState((current) => ({ ...current, rsvpStep: 'idle', gError: null })),
    gNameShown: String(state.gName || '').split(' ')[0] || 'rafiki',
    gEmailShown: state.gEmail || '',
    gPartyShown: party === 4 ? '4+ guests' : `${party} ${party === 1 ? 'guest' : 'guests'}`,
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
    icsHref: 'data:text/calendar;charset=utf-8,' + encodeURIComponent(
      'BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Twendezetu//EN\nBEGIN:VEVENT\nUID:nyama-nanenane-2026@twende.to\nDTSTART:20260808T180000Z\nDTEND:20260809T010000Z\nSUMMARY:NYTC Nyama Choma Festival Nanenane\nLOCATION:Lincoln Park\\, 1 Country Road 605\\, Jersey City\\, NJ 07304\nDESCRIPTION:Hii si ya kukosa! Communipaw Ave side. https://twende.to/nyama-nanenane\nBEGIN:VALARM\nTRIGGER:-P1D\nACTION:DISPLAY\nDESCRIPTION:Nyama Choma is tomorrow!\nEND:VALARM\nEND:VEVENT\nEND:VCALENDAR'),
    similar: [
      {
        href: 'Checkout.dc.html',
        img: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&q=80',
        title: 'Afrogroove Night',
        city: 'Brooklyn, NY',
        date: 'FRI · 14 AUG',
      },
      {
        href: 'Twendezetu Home.dc.html',
        img: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=600&q=80',
        title: 'Diaspora Connect Mixer',
        city: 'Newark, NJ',
        date: 'FRI · 21 AUG',
      },
      {
        href: 'Twendezetu Home.dc.html',
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
  const tiers = state.tiers || [];

  return {
    kind: state.kind,
    isEventKind: state.kind === 'event',
    isPaid: state.ticketMode === 'paid',
    pickFree: () => setPageState((current) => ({ ...current, ticketMode: 'free' })),
    pickPaid: () => setPageState((current) => ({ ...current, ticketMode: 'paid' })),
    freeBg: state.ticketMode === 'free' ? '#1F3A38' : '#FFFDF8',
    freeFg: state.ticketMode === 'free' ? '#F7F1E6' : '#14201F',
    paidBg: state.ticketMode === 'paid' ? '#1F3A38' : '#FFFDF8',
    paidFg: state.ticketMode === 'paid' ? '#F7F1E6' : '#14201F',
    tierRows: tiers.map((tier, index) => ({
      ...tier,
      remove: () => setPageState((current) => ({ ...current, tiers: (current.tiers || []).filter((_item, itemIndex) => itemIndex !== index) })),
    })),
    addTier: () =>
      setPageState((current) => ({
        ...current,
        tiers: [...(current.tiers || []), { name: 'New tier', price: 'UGX 25,000', qty: '100' }],
      })),
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
  const joinWaitlist = () => setPageState((current) => ({ ...current, waitlisted: true }));
  const mkTier = (id, name, tag, desc, was, soldOut) => ({
    name,
    tag,
    desc,
    was,
    soldOut,
    available: !soldOut,
    wlLabel: state.waitlisted ? '✓ ON WAITLIST' : 'JOIN WAITLIST',
    wlBg: state.waitlisted ? '#7B8B6E' : '#D97A3B',
    wlFg: state.waitlisted ? '#F7F1E6' : '#14201F',
    waitlist: joinWaitlist,
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
    eventTitle: findEventBySlug(state.eventSlug)?.title || 'Afrogroove Night',
    tiers: [
      mkTier('early', 'Early bird', 'SAVE 20%', 'Pay online before 1 Aug · limited allocation', fmt(25), false),
      mkTier('ga', 'General admission', false, 'Entry 9 PM – 3 AM · all areas', false, false),
      mkTier('vip', 'VIP lounge', false, 'Lounge + bar access · free welcome drink', false, false),
      {
        name: 'Door price',
        tag: false,
        desc: 'SOLD OUT online — join the waitlist for released seats',
        was: false,
        price: fmt(25),
        soldOut: true,
        available: false,
        qty: 0,
        plus: () => {},
        minus: () => {},
        opacity: 0.7,
        wlLabel: state.waitlisted ? '✓ ON WAITLIST' : 'JOIN WAITLIST',
        wlBg: state.waitlisted ? '#7B8B6E' : '#D97A3B',
        wlFg: state.waitlisted ? '#F7F1E6' : '#14201F',
        waitlist: joinWaitlist,
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
    notPaid: !state.paid,
    paid: state.paid,
    groupOpen: state.group,
    groupBg: state.group ? '#D97A3B' : '#EFE7D6',
    groupKnob: state.group ? '26px' : '2px',
    toggleGroup: () => setPageState((current) => ({ ...current, group: !current.group })),
    guestCount: state.guests.filter((g) => g.trim()).length || state.guests.length,
    guestRows: state.guests.map((name, i) => ({
      n: i + 1,
      name,
      ph: i === 0 ? 'Guest 1 (you)' : `Guest ${i + 1} — name for their QR`,
      set: (event) =>
        setPageState((current) => ({
          ...current,
          guests: current.guests.map((g, gi) => (gi === i ? event.target.value : g)),
        })),
    })),
    splitPay: () => {
      try {
        navigator.clipboard.writeText('https://twende.to/split/tw-8841');
      } catch (error) {}
      setPageState((current) => ({
        ...current,
        payError: '✓ Split-pay link copied — each guest pays their share, tickets issue as they do.',
      }));
    },
    buyerName: state.buyerName,
    setBuyerName: (event) => setPageState((current) => ({ ...current, buyerName: event.target.value, payError: null })),
    buyerEmail: state.buyerEmail,
    setBuyerEmail: (event) => setPageState((current) => ({ ...current, buyerEmail: event.target.value, payError: null })),
    buyerFirst: state.buyerName.split(' ')[0] || 'rafiki',
    payError: state.payError,
    pay: () => {
      if (subtotal <= 0) {
        setPageState((current) => ({ ...current, payError: '✕ Pick at least one ticket above.' }));
        return;
      }
      if (!state.buyerName.trim()) {
        setPageState((current) => ({ ...current, payError: '✕ Add your name — it goes on the ticket.' }));
        return;
      }
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(state.buyerEmail)) {
        setPageState((current) => ({ ...current, payError: '✕ We need a valid email to send your QR ticket.' }));
        return;
      }
      setPageState((current) => ({ ...current, paid: true }));
    },
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
  const reminderOptions = ['7d · 1d · 2h', '1d · 2h', '1d', 'Off'];
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
      owned: true,
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
    qrOpen: !!state.qrOpen[index],
    qrBg: state.qrOpen[index] ? '#1F3A38' : '#F7F1E6',
    qrFg: state.qrOpen[index] ? '#F7F1E6' : '#14201F',
    toggleQr: () =>
      setPageState((current) => ({
        ...current,
        qrOpen: { ...current.qrOpen, [index]: !current.qrOpen[index] },
      })),
    ticketCode: `TW-88${41 + index}`,
    qrCells: Array.from({ length: 49 }, (_, k) => ((k * 7 + index * 13 + (k % 5) * 3) % 3 === 0 ? '#F7F1E6' : '#14201F')),
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
    calLabel: state.calAdded[index] ? '🗓 IN CALENDAR ✓' : '🗓 ADD TO CALENDAR',
    calBg: state.calAdded[index] ? '#1F3A38' : '#F7F1E6',
    calFg: state.calAdded[index] ? '#F7F1E6' : '#14201F',
    toggleCal: () =>
      setPageState((current) => ({
        ...current,
        calAdded: { ...current.calAdded, [index]: !current.calAdded[index] },
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
    { img: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&q=80', title: 'Afrogroove Night', city: 'Brooklyn, NY', date: 'FRI · 14 AUG', href: 'Checkout.dc.html', action: 'tickets from $20' },
    { img: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=500&q=80', title: 'Umoja Cultural Day', city: 'Kampala, UG', date: 'SAT · 15 AUG', href: 'Checkout.dc.html', action: 'UGX 25,000' },
    { img: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500&q=80', title: 'Swahili Food Fair', city: 'Nairobi, KE', date: 'SUN · 16 AUG', href: 'Checkout.dc.html', action: 'KES 500' },
    { img: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=500&q=80', title: 'Sunday Family Picnic', city: 'Hartford, CT', date: 'SUN · 30 AUG', href: 'Event Nyama Choma.dc.html', action: 'free RSVP' },
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
    tabs: [mkTab('foryou', 'For You'), mkTab('upcoming', 'Upcoming'), mkTab('posts', 'My Posts'), mkTab('saved', 'Saved'), mkTab('calendar', 'Calendar')],
    showForYou: state.tab === 'foryou',
    fyOrganizers: [
      { init: 'NY', name: 'UONGOZI NYTC · Nyama choma', bg: '#1F3A38', fg: '#F7F1E6' },
      { init: 'TE', name: 'Tanzania Embassy · Community', bg: '#D97A3B', fg: '#1F3A38' },
      { init: 'GM', name: 'Grill Masters DSM · Nyama choma', bg: '#D97A3B', fg: '#1F3A38' },
      { init: 'AG', name: 'Afrogroove · Music', bg: '#D97A3B', fg: '#1F3A38' },
      { init: 'KG', name: 'Kigali Sessions · Music', bg: '#7B8B6E', fg: '#F7F1E6' },
      { init: 'BF', name: 'Bongo Fleva Nights · Music', bg: '#1F3A38', fg: '#F7F1E6' },
      { init: 'UM', name: 'Umoja Day · Community', bg: '#7B8B6E', fg: '#F7F1E6' },
      { init: 'DC', name: 'Diaspora Connect · Community', bg: '#1F3A38', fg: '#F7F1E6' },
      { init: 'SF', name: 'Swahili Fair · Community', bg: '#D97A3B', fg: '#1F3A38' },
      { init: 'HE', name: 'Harusi Expo · Weddings', bg: '#1F3A38', fg: '#F7F1E6' },
      { init: 'NP', name: 'Neema Planners · Weddings', bg: '#7B8B6E', fg: '#F7F1E6' },
      { init: 'GC', name: 'Grace Chapel NJ · Faith', bg: '#D97A3B', fg: '#1F3A38' },
      { init: 'EA', name: 'EA Premier Fans · Sports', bg: '#1F3A38', fg: '#F7F1E6' },
    ],
    fyFeatured: {
      href: '/events/swahili-heritage-festival-2026',
      img: '/assets/events/swahili-heritage-festival.jpeg',
      title: 'Swahili Heritage Festival 2026',
      by: 'Because you follow Tanzania Embassy',
      date: 'SUN · 26 JUL · 3–5 PM',
      city: 'Africatown · Philadelphia, PA',
      blurb: 'Tamasha la Urithi wa Kiswahili — “Kiswahili kwa Ushirikiano, Amani na Ustawi.” Music and culture with DJ Luke.',
    },
    fyExplore: [
      { href: '/events/nyama-choma-festival-2026', img: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=300&q=80', title: 'Nyama Choma Festival', date: 'SAT · 8 AUG', by: 'UONGOZI · NYTC' },
      { href: '/events/afrogroove-night', img: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&q=80', title: 'Afrogroove Night', date: 'FRI · 14 AUG', by: 'Afrogroove Collective' },
      { href: '/events/diaspora-connect-mixer', img: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=300&q=80', title: 'Diaspora Connect Mixer', date: 'FRI · 21 AUG', by: 'Diaspora Connect' },
    ],
    fyShelfId: 'tw-mt-follow-shelf',
    fyPrev: () => scrollShelfBy('tw-mt-follow-shelf', -1),
    fyNext: () => scrollShelfBy('tw-mt-follow-shelf', 1),
    fyEvents: [
      { href: '/events/swahili-heritage-festival-2026', img: '/assets/events/swahili-heritage-festival.jpeg', title: 'Swahili Heritage Festival', by: 'Tanzania Embassy · Community', date: 'SUN · 26 JUL' },
      { href: '/events/nyama-choma-festival-2026', img: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=500&q=80', title: 'Nyama Choma Festival', by: 'UONGOZI - NYTC', date: 'SAT · 8 AUG' },
      { href: '/events/afrogroove-night', img: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&q=80', title: 'Afrogroove Night', by: 'Afrogroove Collective', date: 'FRI · 14 AUG' },
      { href: '/events/umoja-cultural-day', img: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=500&q=80', title: 'Umoja Cultural Day', by: 'Umoja Day Committee', date: 'SAT · 15 AUG' },
      { href: '/events/diaspora-connect-mixer', img: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=500&q=80', title: 'Diaspora Connect Mixer', by: 'Diaspora Connect', date: 'FRI · 21 AUG' },
    ],
    fyNeeds: [
      { title: '3 canopy tents + chairs (yours)', meta: 'JERSEY CITY · CLOSES 18 AUG · 9 OFFERS', chip: 'CLOSING SOON' },
      { title: 'Photographer for gospel picnic', meta: 'HARTFORD, CT · 30 AUG · BUDGET $250', chip: '2 OFFERS' },
    ],
    fyFollow: [
      { init: 'K4', name: 'Kato 4x4 & Tours', meta: '★ 4.9 · KAMPALA', bg: '#1F3A38', fg: '#F7F1E6' },
      { init: 'MT', name: 'Mama T Events Co.', meta: '★ 5.0 · JERSEY CITY', bg: '#D97A3B', fg: '#1F3A38' },
      { init: 'DZ', name: 'DJ Zawadi', meta: '★ 4.7 · JINJA', bg: '#7B8B6E', fg: '#F7F1E6' },
      { init: 'CH', name: 'Chef Halima Catering', meta: '★ 4.8 · DAR', bg: '#1F3A38', fg: '#F7F1E6' },
    ].map((follow, index) => {
      const on = !!state.following[index];
      return {
        ...follow,
        btnLabel: on ? '✓ FOLLOWING' : '+ FOLLOW',
        btnBg: on ? '#1F3A38' : '#F7F1E6',
        btnFg: on ? '#F7F1E6' : '#14201F',
        toggle: () =>
          setPageState((current) => ({
            ...current,
            following: { ...current.following, [index]: !on },
          })),
      };
    }),
    showUpcoming: state.tab === 'upcoming',
    showPosts: state.tab === 'posts',
    myPosts: [
      {
        kind: 'NEED',
        title: '3 canopy tents + chairs',
        meta: 'JERSEY CITY, NJ - FOR: NYTC NYAMA CHOMA - 8 AUG - LINK: twende.to/n/tents-nytc',
        stageIdx: 2,
        stage: 'OFFERS IN',
        offers: 9,
        stats: '412 VIEWS - 38 SHARES - 9 OFFERS - POSTED 3 DAYS AGO',
      },
      {
        kind: 'NEED',
        title: 'Driver + 4x4, Kampala to Jinja',
        meta: 'KAMPALA, UG - 12-14 SEP - LINK: twende.to/n/driver-kla-jinja',
        stageIdx: 3,
        stage: 'ACCEPTED - KATO 4X4',
        offers: 6,
        stats: '218 VIEWS - 12 SHARES - 6 OFFERS - ESCROW HELD',
      },
      {
        kind: 'EVENT',
        title: 'Sunday family picnic',
        meta: 'HARTFORD, CT - 30 AUG - FREE RSVP - LINK: twende.to/e/family-picnic',
        stageIdx: 1,
        stage: 'LIVE ON THE GUIDE',
        offers: 0,
        stats: '58 GOING - 96 VIEWS - REMINDERS SCHEDULED',
      },
    ].map((post, index) => {
      const stages = ['DRAFT', 'LIVE', 'OFFERS', 'ACCEPTED', 'DONE'];
      const paused = !!(state.pausedPosts || {})[index];
      return {
        ...post,
        stageBg: post.stageIdx >= 3 ? '#7B8B6E' : post.stageIdx === 2 ? '#D97A3B' : '#F7F1E6',
        stageFg: post.stageIdx >= 3 ? '#F7F1E6' : '#14201F',
        hasOffers: post.offers > 0,
        pipeline: stages.map((label, stageIndex) => ({
          label,
          bg: stageIndex <= post.stageIdx ? (stageIndex === post.stageIdx ? '#D97A3B' : '#1F3A38') : '#EFE7D6',
          fg: stageIndex <= post.stageIdx ? '#14201F' : '#8C7F6F',
        })),
        edit: () => showToast(setPageState, 'Edit re-opens the post form pre-filled; changes go live instantly and watchers are notified.'),
        pauseLabel: paused ? 'RESUME' : 'PAUSE',
        pauseBg: paused ? '#D97A3B' : '#F7F1E6',
        pause: () => {
          setPageState((current) => ({
            ...current,
            pausedPosts: { ...(current.pausedPosts || {}), [index]: !paused },
          }));
          showToast(setPageState, paused ? `"${post.title}" is live again on the public boards.` : `"${post.title}" paused - hidden from boards, existing offers stay open.`);
        },
        share: () => {
          const link = post.meta.split('LINK: ')[1] || 'twende.to';
          copyText(`https://${link}`);
          showToast(setPageState, 'Public link copied - anyone can view without an account.');
        },
        close: () => showToast(setPageState, 'Closing asks for a reason, notifies offerers, and archives the post.'),
      };
    }),
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
    toggleTopUp: () => setPageState((current) => ({ ...current, topUpOpen: !current.topUpOpen, sendOpen: false, cashOpen: false, pendingTopUp: null })),
    topUpPending: !!state.pendingTopUp,
    topUpSummary: state.pendingTopUp
      ? `Top up $${state.pendingTopUp.usd}.00 for +${fmt(state.pendingTopUp.pts)} points. Nothing is charged until you confirm.`
      : '',
    topUpOpts: [5, 10, 25, 50].map((usd) => ({
      label: `$${usd}`,
      pts: `+${fmt(usd * 100)} PTS`,
      buy: () => setPageState((current) => ({ ...current, pendingTopUp: { usd, pts: usd * 100 } })),
    })),
    confirmTopUp: () => {
      const pending = state.pendingTopUp;
      if (!pending) {
        showToast(setPageState, 'Choose a top-up amount first.', 3400, { toastKind: 'err' });
        return;
      }
      setPageState((current) => ({
        ...current,
        balance: Number(current.balance || 0) + pending.pts,
        topUpOpen: false,
        pendingTopUp: null,
        activity: [{ icon: 'v', iconBg: '#7B8B6E', iconFg: '#F7F1E6', title: 'Top-up from card', meta: `JUST NOW - $${pending.usd}.00 -> ${fmt(pending.pts)} PTS`, amount: `+${fmt(pending.pts)}`, color: '#4a7c4a' }, ...(current.activity || activity)],
      }));
      showToast(setPageState, `Top-up complete: +${fmt(pending.pts)} points.`);
    },
    cancelTopUp: () => setPageState((current) => ({ ...current, pendingTopUp: null })),
    sendOpen: state.sendOpen,
    sendBg: state.sendOpen ? 'rgba(247,241,230,0.15)' : 'none',
    toggleSend: () => setPageState((current) => ({ ...current, sendOpen: !current.sendOpen, topUpOpen: false, cashOpen: false, pendingTopUp: null })),
    cashOpen: state.cashOpen,
    cashBg: state.cashOpen ? 'rgba(217,122,59,0.22)' : 'none',
    toggleCashOut: () => setPageState((current) => ({ ...current, cashOpen: !current.cashOpen, topUpOpen: false, sendOpen: false, pendingTopUp: null })),
    cashAmount: state.cashAmount,
    setCashAmount: (event) => setPageState((current) => ({ ...current, cashAmount: event.target.value })),
    cashDests: ['M-Pesa **2210', 'Visa **4412', 'Bank transfer'].map((label, index) => ({
      label,
      pick: () => setPageState((current) => ({ ...current, cashDest: index })),
      bg: state.cashDest === index ? 'rgba(217,122,59,0.25)' : 'rgba(247,241,230,0.08)',
      border: state.cashDest === index ? '#D97A3B' : 'rgba(247,241,230,0.4)',
    })),
    cashConfirmLabel: `Cash out ${fmt(state.cashAmount)} pts ->`,
    confirmCashOut: () => {
      const amount = Math.floor(Number(state.cashAmount));
      const fee = 50;
      const destinations = ['M-Pesa **2210', 'Visa **4412', 'Bank transfer'];
      if (!Number.isFinite(amount) || amount <= fee) {
        showToast(setPageState, `Enter more than ${fee} points to cash out.`, 3400, { toastKind: 'err' });
        return;
      }
      if (amount > Number(state.balance || 0)) {
        showToast(setPageState, `Insufficient balance. You have ${fmt(state.balance)} pts.`, 3400, { toastKind: 'err' });
        return;
      }
      const dest = destinations[state.cashDest] || destinations[0];
      setPageState((current) => ({
        ...current,
        balance: Number(current.balance || 0) - amount,
        cashOpen: false,
        cashAmount: '500',
        activity: [{ icon: '<', iconBg: '#F6DCC0', iconFg: '#1F3A38', title: `Cash-out to ${dest}`, meta: `JUST NOW - flat fee ${fee} pts`, amount: `-${fmt(amount)}`, color: '#B8463A' }, ...(current.activity || activity)],
      }));
      showToast(setPageState, `Cash-out queued: ${fmt(amount - fee)} pts value to ${dest}.`);
    },
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
    exportStmt: () => showToast(setPageState, 'Full personal wallet statement queued as PDF and CSV.'),
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
  const dir = PROVIDER_CATALOG;
  const maxDir = Math.max(0, dir.length - 3);
  const galleryIdx = state.galleryIdx || 0;
  const dirIdx = state.dirIdx || 0;
  const starSel = state.starSel ?? 5;
  return {
    galleryIs0: galleryIdx === 0,
    galleryIs1: galleryIdx === 1,
    galleryIs2: galleryIdx === 2,
    galleryIs3: galleryIdx === 3,
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
    toggleWrite: () => setPageState((current) => ({ ...current, writeOpen: !current.writeOpen, reviewError: null })),
    writeOpen: state.writeOpen,
    writeLabel: state.writeOpen ? '✕ CLOSE' : '✎ WRITE A REVIEW',
    writeBg: state.writeOpen ? '#1F3A38' : '#F7F1E6',
    writeFg: state.writeOpen ? '#F7F1E6' : '#14201F',
    avgRating: '4.9',
    reviewCount: 61 + (state.posted ? 1 : 0),
    breakdown: [
      { stars: 5, pct: '89%', count: 54 },
      { stars: 4, pct: '8%', count: 5 },
      { stars: 3, pct: '3%', count: 2 },
      { stars: 2, pct: '0%', count: 0 },
      { stars: 1, pct: '0%', count: 0 },
    ],
    starPicker: [1, 2, 3, 4, 5].map((n) => ({
      pick: () => setPageState((current) => ({ ...current, starSel: n })),
      color: n <= starSel ? '#D97A3B' : 'rgba(247,241,230,0.35)',
    })),
    setJob: (event) => setPageState((current) => ({ ...current, jobSel: event.target.value })),
    draft: state.draft,
    setDraft: (event) => setPageState((current) => ({ ...current, draft: event.target.value, reviewError: null })),
    reviewError: state.reviewError,
    submitReview: () => {
      if (!String(state.draft || '').trim()) {
        setPageState((current) => ({ ...current, reviewError: '✕ Add a sentence or two so it helps others.' }));
        return;
      }
      setPageState((current) => ({ ...current, writeOpen: false, posted: true, draft: '' }));
    },
    reviews: [
      ...(state.posted
        ? [{
            stars: '★★★★★'.slice(0, starSel) + '☆☆☆☆☆'.slice(0, 5 - starSel),
            job: (state.jobSel || 'UP-COUNTRY, 2 DAYS').toUpperCase().split('?').pop().trim(),
            when: 'JUST NOW',
            body: state.draft || 'Great service, highly recommend.',
            who: 'You · verified booking',
            reply: false,
          }]
        : []),
      { stars: '★★★★★', job: 'AIRPORT PICKUP', when: 'AUG 2026', body: 'Picked us up at Entebbe at 3am. Tracked the delayed flight, cold water waiting, kids asleep in ten minutes. Legend.', who: 'Faridah · visiting from CT, USA', reply: 'Asante Faridah! Karibu tena any time — those late flights are our specialty.' },
      { stars: '★★★★★', job: 'UP-COUNTRY, 2 DAYS', when: 'JUL 2026', body: 'Took us to the village past Mbale where the road is only mud. Never complained, helped carry gifts, negotiated the boda crossing.', who: 'Joel M. · diaspora trip', reply: false },
      { stars: '★★★★☆', job: 'WEDDING CONVOY', when: 'JUN 2026', body: 'Three spotless cars, on time, and he knew the photographer’s route better than the photographer.', who: 'Amina & Deo · Kampala', reply: 'Congratulations again to the happy couple! 🎉' },
    ],
    dirOffset: `${-(dirIdx * 318)}px`,
    dirPrev: () => setPageState((current) => ({ ...current, dirIdx: Math.max(0, current.dirIdx - 1) })),
    dirNext: () => setPageState((current) => ({ ...current, dirIdx: Math.min(maxDir, current.dirIdx + 1) })),
    directory: dir.map((provider) => ({
      ...provider,
      view: () => {
        if (typeof window !== 'undefined') window.location.href = provider.href;
      },
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

function providerWalletValues(state, setPageState) {
  const fmt = (amount) => Number(amount || 0).toLocaleString('en-US');
  const activity = state.activity || [
    { icon: 'J', type: 'JOBS', title: 'Job payout: City tour (BK-7031)', meta: '17 SEP - GROSS 380K - FEE 26.6K', amount: '+353K', in: true },
    { icon: 'E', type: 'ESCROW', title: 'Escrow hold: Jinja trip (BK-5521)', meta: '12-14 SEP - RELEASES ON CONFIRM', amount: '760K', in: null },
    { icon: 'J', type: 'JOBS', title: 'Job payout: Airport run (BK-6988)', meta: '9 SEP - GROSS 180K - FEE 12.6K', amount: '+167K', in: true },
    { icon: 'W', type: 'PAYOUTS', title: 'Withdrawal to MTN MoMo **7214', meta: '1 SEP - FEE 2.5K - REF WD-2210', amount: '-500K', in: false },
    { icon: 'M', type: 'FEES', title: 'Membership renewal (12 months)', meta: '28 AUG - SAVED 15% EARLY', amount: '-17K', in: false },
    { icon: 'J', type: 'JOBS', title: 'Job payout: Wedding convoy (BK-6754)', meta: '22 AUG - GROSS 900K - FEE 63K', amount: '+837K', in: true },
    { icon: 'W', type: 'PAYOUTS', title: 'Withdrawal to Stanbic **8867', meta: '15 AUG - FEE 2.5K - REF WD-2141', amount: '-1.2M', in: false },
    { icon: 'J', type: 'JOBS', title: 'Job payout: Up-country 2 days (BK-6702)', meta: '11 AUG - GROSS 800K - FEE 56K', amount: '+744K', in: true },
  ];
  const destinations = ['MTN MoMo **7214', 'Stanbic Bank **8867', 'Airtel Money (new)'];
  const destLabel = destinations[state.dest] || destinations[0];
  const amount = Number(state.wAmount || 0);
  const shown = activity.filter((item) => state.filter === 'ALL' || item.type === state.filter);

  return {
    availFmt: 'UGX ' + (Number(state.avail || 0) >= 1000 ? (Number(state.avail || 0) / 1000).toFixed(1) + 'M' : Number(state.avail || 0) + 'K'),
    availUsd: '$' + Math.round(Number(state.avail || 0) * 0.269).toLocaleString('en-US'),
    withdrawOpen: !!state.withdrawOpen && !state.confirmOpen,
    toggleWithdraw: () => setPageState((current) => ({ ...current, withdrawOpen: !current.withdrawOpen, confirmOpen: false })),
    wAmount: state.wAmount,
    setWAmount: (event) => setPageState((current) => ({ ...current, wAmount: event.target.value })),
    destinations: destinations.map((label, index) => ({
      label,
      pick: () => setPageState((current) => ({ ...current, dest: index })),
      bg: state.dest === index ? 'rgba(217,122,59,0.25)' : 'rgba(247,241,230,0.08)',
      border: state.dest === index ? '#D97A3B' : 'rgba(247,241,230,0.4)',
    })),
    reviewWithdraw: () => {
      if (!Number.isFinite(amount) || amount <= 0) {
        showToast(setPageState, 'Enter an amount above 0.', 3400, { toastKind: 'err' });
        return;
      }
      if (amount > Number(state.avail || 0)) {
        showToast(setPageState, `Insufficient: available balance is UGX ${fmt(state.avail)}K. Escrow cannot be withdrawn until release.`, 4200, { toastKind: 'err' });
        return;
      }
      setPageState((current) => ({ ...current, confirmOpen: true, withdrawOpen: false }));
    },
    confirmOpen: !!state.confirmOpen,
    confirmSummary: `Withdraw UGX ${fmt(amount)}K -> ${destLabel}. You receive UGX ${fmt(Math.max(0, amount - 2.5))}K after the flat fee.`,
    confirmWithdraw: () => {
      if (!Number.isFinite(amount) || amount <= 0 || amount > Number(state.avail || 0)) {
        showToast(setPageState, 'Review the withdrawal amount before confirming.', 3400, { toastKind: 'err' });
        return;
      }
      setPageState((current) => ({
        ...current,
        avail: Number(current.avail || 0) - amount,
        confirmOpen: false,
        withdrawOpen: false,
        activity: [{ icon: 'W', type: 'PAYOUTS', title: `Withdrawal to ${destLabel}`, meta: 'JUST NOW - FEE 2.5K - REF WD-2301', amount: '-' + fmt(amount) + 'K', in: false }, ...(current.activity || activity)],
      }));
      showToast(setPageState, `Withdrawal confirmed after 2FA. UGX ${fmt(amount)}K -> ${destLabel}, arriving within 24h.`);
    },
    cancelWithdraw: () => setPageState((current) => ({ ...current, confirmOpen: false, withdrawOpen: true })),
    toPoints: () => showToast(setPageState, 'Move earnings to personal points at 1 UGX = 0.0269 pts. Confirmation dialog opens with the exact quote.'),
    filters: ['ALL', 'JOBS', 'PAYOUTS', 'ESCROW', 'FEES'].map((filter) => ({
      label: filter,
      pick: () => setPageState((current) => ({ ...current, filter })),
      bg: state.filter === filter ? '#1F3A38' : '#F7F1E6',
      fg: state.filter === filter ? '#F7F1E6' : '#14201F',
    })),
    activity: shown.map((item) => ({
      ...item,
      iconBg: item.in === true ? '#DCE8D9' : item.in === false ? '#F6DCC0' : '#EFE7D6',
      color: item.in === true ? '#4a7c4a' : item.in === false ? '#B8463A' : '#6E6155',
    })),
    shownCount: shown.length,
    exportStmt: () => showToast(setPageState, 'Statement queued with itemised fees. PDF and CSV will be emailed in about one minute.'),
    toast: state.toast,
    toastBg: state.toastKind === 'err' ? '#B8463A' : '#1F3A38',
  };
}

function providerVerificationValues(state, setPageState) {
  const f = state.f || {};
  const section = state.section || 'business';
  const payouts = [
    ['MTN MoMo', 'Instant, Uganda-wide', 'POPULAR'],
    ['M-Pesa', 'Kenya & Tanzania', 'INSTANT'],
    ['Bank account', 'Any East African bank, 24h', 'SECURE'],
  ];
  const save = (patch) =>
    setPageState((current) => ({
      ...current,
      f: { ...(current.f || {}), ...patch },
      savedAt: 'SAVED JUST NOW ✓',
    }));
  const go = (id) => () =>
    setPageState((current) => ({
      ...current,
      section: id,
      savedAt: 'SAVED JUST NOW ✓',
    }));
  const field = (key) => (event) => save({ [key]: event.target.value });
  const done = {
    business: !!(f.bizName && f.bizCities && f.bizDesc),
    identity: !!(f.idName && f.idNumber && f.idUploaded),
    proof: f.proofRoute === 'formal' ? !!(f.proofUploaded && f.proofNum) : !!(f.portUploaded && f.ref1 && f.ref2),
    phone: f.otp === 'done',
    payout: !!f.payoutNum,
  };
  const doneCount = Object.values(done).filter(Boolean).length;
  const allDone = doneCount === 5;
  const nav = [
    ['business', '1 · BUSINESS INFO'],
    ['identity', '2 · IDENTITY'],
    ['proof', '3 · BUSINESS PROOF'],
    ['phone', '4 · PHONE'],
    ['payout', '5 · PAYOUT'],
    ['review', '6 · REVIEW & SUBMIT'],
  ];

  return {
    saveStamp: state.savedAt || 'AUTOSAVE ON',
    pct: `${Math.round((doneCount / 5) * 100)}%`,
    navItems: nav.map(([id, label]) => ({
      label,
      go: go(id),
      bg: section === id ? '#1F3A38' : 'transparent',
      fg: section === id ? '#F7F1E6' : '#3A2F25',
      chip: id === 'review' ? (state.submitted ? 'SENT ✓' : '') : done[id] ? '✓ DONE' : '…',
      chipColor: done[id] || (id === 'review' && state.submitted) ? '#7B8B6E' : '#A85A23',
    })),
    isBusiness: section === 'business',
    isIdentity: section === 'identity',
    isProof: section === 'proof',
    isPhone: section === 'phone',
    isPayout: section === 'payout',
    isReview: section === 'review',
    goIdentity: go('identity'),
    goProof: go('proof'),
    goPhone: go('phone'),
    goPayout: go('payout'),
    goReview: go('review'),
    fBizName: f.bizName || '',
    setBizName: field('bizName'),
    setBizCat: field('bizCat'),
    fBizCities: f.bizCities || '',
    setBizCities: field('bizCities'),
    fBizYears: f.bizYears || '',
    setBizYears: field('bizYears'),
    fBizDesc: f.bizDesc || '',
    setBizDesc: field('bizDesc'),
    fIdName: f.idName || '',
    setIdName: field('idName'),
    fIdNumber: f.idNumber || '',
    setIdNumber: field('idNumber'),
    idBtnLabel: f.idUploaded ? '✓ national-id.jpg - REPLACE' : '↑ UPLOAD ID DOCUMENT',
    idBtnBg: f.idUploaded ? '#DCE8D9' : '#F7F1E6',
    uploadId: () => {
      save({ idUploaded: true });
      showToast(setPageState, '✓ ID uploaded, encrypted, and saved to your draft.');
    },
    isFormalRoute: f.proofRoute === 'formal',
    isInformalRoute: f.proofRoute === 'informal',
    pickFormal: () => save({ proofRoute: 'formal' }),
    pickInformal: () => save({ proofRoute: 'informal' }),
    formalBg: f.proofRoute === 'formal' ? '#1F3A38' : '#FFFDF8',
    formalFg: f.proofRoute === 'formal' ? '#F7F1E6' : '#14201F',
    informalBg: f.proofRoute === 'informal' ? '#1F3A38' : '#FFFDF8',
    informalFg: f.proofRoute === 'informal' ? '#F7F1E6' : '#14201F',
    proofBtnLabel: f.proofUploaded ? '✓ trading-licence.pdf - REPLACE' : '↑ UPLOAD LICENCE / PERMIT / TIN',
    proofBtnBg: f.proofUploaded ? '#DCE8D9' : '#F7F1E6',
    uploadProof: () => {
      save({ proofUploaded: true });
      showToast(setPageState, '✓ Document uploaded and saved to your draft.');
    },
    fProofNum: f.proofNum || '',
    setProofNum: field('proofNum'),
    portBtnLabel: f.portUploaded ? '✓ 6 PHOTOS UPLOADED - ADD MORE' : '↑ UPLOAD 5+ PHOTOS OF PAST WORK',
    portBtnBg: f.portUploaded ? '#DCE8D9' : '#F7F1E6',
    uploadPortfolio: () => {
      save({ portUploaded: true });
      showToast(setPageState, '✓ Portfolio photos saved to your draft.');
    },
    fRef1: f.ref1 || '',
    setRef1: field('ref1'),
    fRef2: f.ref2 || '',
    setRef2: field('ref2'),
    fPhone: f.phone || '',
    setPhone: field('phone'),
    otpIdle: f.otp === 'idle',
    otpSent: f.otp === 'sent',
    otpDone: f.otp === 'done',
    otpError: state.otpError,
    sendOtp: () => {
      save({ otp: 'sent' });
      showToast(setPageState, '✓ SMS code sent. Valid 10 minutes.');
    },
    otpValue: f.otpValue || '',
    setOtp: (event) => {
      setPageState((current) => ({ ...current, otpError: false }));
      save({ otpValue: event.target.value });
    },
    checkOtp: () => {
      if (String(f.otpValue || '').trim() === '254254') {
        save({ otp: 'done' });
        showToast(setPageState, '✓ Phone verified and saved.');
        return;
      }
      setPageState((current) => ({ ...current, otpError: true }));
    },
    payoutOpts: payouts.map(([title, desc, chip], index) => ({
      title,
      desc,
      chip,
      pick: () => save({ payoutMethod: index }),
      bg: f.payoutMethod === index ? '#1F3A38' : '#FFFDF8',
      fg: f.payoutMethod === index ? '#F7F1E6' : '#14201F',
    })),
    fPayoutNum: f.payoutNum || '',
    setPayoutNum: field('payoutNum'),
    reviewRows: [
      ['BUSINESS', `${f.bizName || '—'} · ${f.bizCat || '—'} · ${f.bizCities || '—'}`, done.business, 'business'],
      ['IDENTITY', `${f.idName || '—'} · ${f.idNumber || 'no ID number'}${f.idUploaded ? ' · doc ✓' : ' · doc missing'}`, done.identity, 'identity'],
      [
        'PROOF',
        f.proofRoute === 'formal'
          ? `Document route · ${f.proofNum || 'no number'}`
          : `Portfolio route · refs: ${f.ref1 ? '✓' : '—'}/${f.ref2 ? '✓' : '—'}`,
        done.proof,
        'proof',
      ],
      ['PHONE', `${f.phone || '—'}${f.otp === 'done' ? ' · verified ✓' : ' · not verified'}`, done.phone, 'phone'],
      ['PAYOUT', `${payouts[f.payoutMethod || 0][0]} · ${f.payoutNum || 'no account'}`, done.payout, 'payout'],
    ].map(([label, value, ok, id]) => ({
      label,
      value,
      chip: ok ? '✓ COMPLETE' : 'INCOMPLETE - FIX',
      chipColor: ok ? '#7B8B6E' : '#B8463A',
      go: go(id),
    })),
    submitLabel: state.submitted ? '✓ In review - decision within 48h' : allDone ? 'Submit for review →' : `${doneCount} of 5 sections complete - finish the rest`,
    submitBg: state.submitted ? '#7B8B6E' : allDone ? '#1F3A38' : '#EFE7D6',
    submitFg: state.submitted || allDone ? '#F7F1E6' : '#8C7F6F',
    submitted: state.submitted,
    submit: () => {
      if (state.submitted) return;
      if (!allDone) {
        showToast(setPageState, `✕ ${5 - doneCount} section(s) still incomplete - tap the red rows above to jump there.`);
        return;
      }
      setPageState((current) => ({ ...current, submitted: true }));
      showToast(setPageState, '✓ Submitted. Your draft is locked for review; the trust team responds within 48h.');
    },
    toast: state.toast,
  };
}

function settingsValues(state, setPageState) {
  const provider = state.role === 'provider';
  const fields = state.fields || (provider
    ? { name: 'Ssemakula Kato', biz: 'Kato 4x4 & Tours', email: 'kato@gmail.com', phone: '+256 7** *** 214' }
    : { name: 'Amina Mushi', biz: 'Amina M.', email: 'amina@gmail.com', phone: '+1 (9**) *** 4412' });
  const defaultNotifs = [
    { title: 'Reminders (7d - 1d - 2h)', desc: "Events you RSVP'd or booked", app: true, email: true, sms: false, wa: true },
    { title: 'Offers & replies', desc: 'On your needs and threads', app: true, email: true, sms: true, wa: true },
    { title: 'Matched leads', desc: provider ? 'New needs in your categories and cities' : 'Providers matching your posts', app: true, email: true, sms: false, wa: false },
    { title: 'Money movement', desc: 'Top-ups, sends, escrow, payouts', app: true, email: true, sms: true, wa: false },
    { title: 'Comments & referrals', desc: 'Activity on your posts and links', app: true, email: false, sms: false, wa: false },
    { title: 'Twendezetu news', desc: 'Product updates, city launches', app: false, email: true, sms: false, wa: false },
  ];
  const notifs = state.notifs || defaultNotifs;
  const go = (section) => () => setPageState((current) => ({ ...current, section }));
  const knob = (on) => (on ? '19px' : '1px');
  const bg = (on) => (on ? '#D97A3B' : '#EFE7D6');
  const setField = (key) => (event) =>
    setPageState((current) => ({ ...current, saved: false, fields: { ...(current.fields || fields), [key]: event.target.value } }));
  const toggleNotif = (index, channel) => () =>
    setPageState((current) => ({
      ...current,
      notifs: (current.notifs || defaultNotifs).map((item, itemIndex) => (itemIndex === index ? { ...item, [channel]: !item[channel] } : item)),
    }));
  const payDefs = provider
    ? [
        { icon: 'MOMO', iconBg: '#FFCB05', iconFg: '#14201F', label: 'MTN MoMo **7214', meta: 'UGANDA - PAYOUTS + BILLING' },
        { icon: 'VISA', iconBg: '#1F3A38', iconFg: '#F7F1E6', label: 'Visa **4412', meta: 'EXPIRES 08/28' },
        { icon: 'BANK', iconBg: '#EFE7D6', iconFg: '#14201F', label: 'Stanbic **8867', meta: 'UGX ACCOUNT - WITHDRAWALS' },
      ]
    : [
        { icon: 'VISA', iconBg: '#1F3A38', iconFg: '#F7F1E6', label: 'Visa **4412', meta: 'EXPIRES 08/28' },
        { icon: 'MPSA', iconBg: '#4a7c4a', iconFg: '#F7F1E6', label: 'M-Pesa **2210', meta: 'KENYA - TOP-UPS + WITHDRAWALS' },
        { icon: 'MOMO', iconBg: '#FFCB05', iconFg: '#14201F', label: 'MTN MoMo **5521', meta: 'UGANDA - FAMILY SENDS' },
      ];

  return {
    backHref: provider ? 'Provider Dashboard.dc.html' : 'My Twende.dc.html',
    backLabel: provider ? 'DASHBOARD' : 'MY TWENDE',
    initials: provider ? 'SK' : 'AM',
    navItems: [
      ['profile', 'P', 'PROFILE'],
      ['notifs', 'N', 'NOTIFICATIONS'],
      ['payments', '$', 'PAYMENT METHODS'],
      ['security', 'S', 'SECURITY'],
    ].map(([id, icon, label]) => ({
      icon,
      label,
      go: go(id),
      bg: state.section === id ? '#1F3A38' : 'transparent',
      fg: state.section === id ? '#F7F1E6' : '#3A2F25',
    })),
    isProfile: state.section === 'profile',
    isNotifs: state.section === 'notifs',
    isPayments: state.section === 'payments',
    isSecurity: state.section === 'security',
    fName: fields.name,
    fBiz: fields.biz,
    fEmail: fields.email,
    fPhone: fields.phone,
    setFName: setField('name'),
    setFBiz: setField('biz'),
    setFEmail: setField('email'),
    setFPhone: setField('phone'),
    changePhoto: () => showToast(setPageState, 'Photo picker opens here with square crop and a 5MB limit.'),
    saveLabel: state.saved ? 'Saved' : 'Save changes',
    saveProfile: () => {
      setPageState((current) => ({ ...current, saved: true }));
      showToast(setPageState, 'Profile saved and synced to listings, threads and posts.');
    },
    notifRows: notifs.map((item, index) => ({
      title: item.title,
      desc: item.desc,
      appBg: bg(item.app),
      appKnob: knob(item.app),
      tApp: toggleNotif(index, 'app'),
      emailBg: bg(item.email),
      emailKnob: knob(item.email),
      tEmail: toggleNotif(index, 'email'),
      smsBg: bg(item.sms),
      smsKnob: knob(item.sms),
      tSms: toggleNotif(index, 'sms'),
      waBg: bg(item.wa),
      waKnob: knob(item.wa),
      tWa: toggleNotif(index, 'wa'),
    })),
    quietBg: state.quiet ? '#D97A3B' : '#EFE7D6',
    quietKnob: state.quiet ? '26px' : '2px',
    toggleQuiet: () => setPageState((current) => ({ ...current, quiet: !current.quiet })),
    digestAll: () => showToast(setPageState, 'All non-urgent notifications will now bundle into one Friday digest.'),
    muteAll: () => showToast(setPageState, 'Muted for 7 days. Money-movement alerts stay on for account protection.'),
    payMethods: payDefs.map((method, index) => ({
      ...method,
      isDefault: state.defaultPay === index,
      notDefault: state.defaultPay !== index,
      makeDefault: () => {
        setPageState((current) => ({ ...current, defaultPay: index }));
        showToast(setPageState, `${method.label} is now your default for payments and withdrawals.`);
      },
      remove: () => showToast(setPageState, 'Removal requires re-entering your password. Confirmation dialog opens here.'),
    })),
    addMethod: () => showToast(setPageState, 'Secure add-method form opens for card, M-Pesa, MTN MoMo or Airtel.'),
    securityRows: [
      { title: 'Password', desc: 'Last changed 3 months ago', btn: 'CHANGE', btnBg: '#F7F1E6', btnFg: '#14201F', action: () => showToast(setPageState, 'Password change form opens and can sign out other sessions.') },
      {
        title: 'Two-factor authentication',
        desc: state.twoFa ? 'ON - via SMS to **4412' : 'Off - recommended for wallet holders',
        btn: state.twoFa ? 'ON' : 'ENABLE',
        btnBg: state.twoFa ? '#7B8B6E' : '#D97A3B',
        btnFg: state.twoFa ? '#F7F1E6' : '#14201F',
        action: () => {
          setPageState((current) => ({ ...current, twoFa: !current.twoFa }));
          showToast(setPageState, state.twoFa ? '2FA disabled. We recommend keeping it on.' : '2FA enabled for sign-in, sends and withdrawals.');
        },
      },
      { title: 'Active sessions', desc: '2 devices - this one + iPhone (Jersey City)', btn: 'REVIEW', btnBg: '#F7F1E6', btnFg: '#14201F', action: () => showToast(setPageState, 'Session list opens with device, city and last active time.') },
      { title: 'Download my data / delete account', desc: 'GDPR-style export or full deletion', btn: 'OPTIONS', btnBg: '#F7F1E6', btnFg: '#14201F', action: () => showToast(setPageState, 'Export or deletion options open. Escrow must be empty before deletion.') },
    ],
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
    { severity: 'DISPUTE', sevBg: '#E8A472', reason: 'Refund dispute - escrow frozen', meta: 'CASE #DSP-1042 - KATO 4X4 BOOKING - UGX 760K HELD - 71H LEFT TO RESPOND', body: 'Provider no-show opened by the poster. Escrow is frozen. Awaiting the provider\'s response; if unresolved in 72h it escalates here for a platform decision. Both sides\' evidence attached.' },
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
    adminMenuOpen: state.adminMenuOpen,
    toggleAdminMenu: () => setPageState((current) => ({ ...current, adminMenuOpen: !current.adminMenuOpen })),
    adminSettings: () => setPageState((current) => ({ ...current, adminMenuOpen: false, section: 'settings' })),
    broadcast: () => showToast(setPageState, 'Broadcast composer opens with audience, channels and schedule. Second-admin approval is required before sending.'),
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
  const finNavDefs = [
    ['OVERVIEW', 'M3 3h8v8H3zM13 3h8v8h-8zM3 13h8v8H3zM13 13h8v8h-8z', null],
    ['LEDGER', 'M4 5h16M4 12h16M4 19h10', 'ALL'],
    ['TICKETS', 'M4 8a2 2 0 0 0 2-2h12a2 2 0 0 0 2 2v8a2 2 0 0 0-2 2H6a2 2 0 0 0-2-2zM12 6v12', 'TICKETS'],
    ['BOOKINGS', 'M8 3v4M16 3v4M4 7h16v14H4zM4 11h16', 'BOOKINGS'],
    ['MEMBERSHIPS', 'M12 3l2.5 5 5.5.8-4 3.9.9 5.5-4.9-2.6-4.9 2.6.9-5.5-4-3.9 5.5-.8z', 'MEMBERSHIPS'],
    ['REFUNDS', 'M9 14l-4-4 4-4M5 10h11a4 4 0 0 1 0 8h-3', 'REFUNDS'],
  ];
  const ledgerRows = [
    { icon: 'T', type: 'TICKETS', iconBg: '#D97A3B', title: 'Umoja Cultural Day - 42 tickets', meta: 'TXN #TX-99120 - UGX 1,050,000 - MTN MOMO', status: 'SETTLED', statusColor: '#7B8B6E', gross: '$282', fee: '$14.10 (5%)' },
    { icon: 'B', type: 'BOOKINGS', iconBg: '#E8A472', title: 'Booking: Kato 4x4 - 2-day trip', meta: 'TXN #TX-99114 - UGX 760,000 - ESCROW', status: 'IN ESCROW', statusColor: '#E8A472', gross: '$204', fee: '$14.28 (7%)' },
    { icon: 'M', type: 'MEMBERSHIPS', iconBg: '#7B8B6E', title: 'Membership renewal: Chef Halima', meta: 'TXN #TX-99101 - TZS 48,000 - CARD', status: 'SETTLED', statusColor: '#7B8B6E', gross: '$18', fee: '$18 (100%)' },
    { icon: 'P', type: 'POINTS', iconBg: '#F7F1E6', title: 'Points top-up: Amina M.', meta: 'TXN #TX-99097 - $25.00 - CARD', status: 'SETTLED', statusColor: '#7B8B6E', gross: '$25', fee: '$0.75 (3%)' },
    { icon: 'R', type: 'REFUNDS', iconBg: '#B8463A', title: 'Refund: duplicate ticket purchase', meta: 'TXN #TX-99071 - KES 1,000 - REVERSAL', status: 'REFUNDED', statusColor: '#E8A472', gross: '-$7.75', fee: '$0' },
  ];
  return {
    finMenuOpen: state.finMenuOpen,
    toggleFinMenu: () => setPageState((current) => ({ ...current, finMenuOpen: !current.finMenuOpen })),
    finSettings: () => {
      setPageState((current) => ({ ...current, finMenuOpen: false }));
      showToast(setPageState, 'Finance settings: approval limits, payout schedule, FX margin and statement recipients.');
    },
    finNav: finNavDefs.map(([label, iconPath, filter]) => ({
      label,
      iconPath,
      go: () => {
        setPageState((current) => ({ ...current, finSection: label, filter: filter || 'ALL' }));
        if (filter) showToast(setPageState, `Ledger filtered to ${label}.`);
      },
      bg: state.finSection === label ? '#F7F1E6' : 'transparent',
      fg: state.finSection === label ? '#14201F' : 'rgba(247,241,230,0.8)',
    })),
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

function checkinValues(state, setPageState) {
  const names = { 'TW-8841': 'Amina M. (×2)', 'TW-8842': 'Joel M.', 'TW-8843': 'Faridah K.' };
  const flash = (result, entry) => {
    setPageState((current) => {
      const next = { ...current, result, log: entry ? [entry, ...current.log].slice(0, 8) : current.log };
      if (entry && entry.status === 'ADMITTED') {
        next.admitted = current.admitted + 1;
        next.seen = { ...current.seen, [entry.code]: true };
      }
      if (entry && entry.status === 'DUPLICATE') next.blocked = current.blocked + 1;
      return next;
    });
    window.setTimeout(() => setPageState((current) => ({ ...current, result: null })), 1400);
  };
  const admit = (code, name) => {
    if (state.seen[code]) {
      flash(
        { ok: false, dup: true, title: '✕ Already in', sub: `${code} was scanned earlier` },
        { icon: '⛔', code, name, note: 'Second scan blocked', status: 'DUPLICATE', color: '#E8A472' },
      );
    } else {
      flash(
        { ok: true, title: '✓ Karibu!', sub: `${code} · ${name} admitted` },
        { icon: '✓', code, name, note: 'Valid ticket', status: 'ADMITTED', color: '#7B8B6E' },
      );
    }
  };
  const result = state.result;
  return {
    admitted: state.admitted,
    blocked: state.blocked,
    hasResult: !!result,
    resultBg: result ? (result.ok ? 'rgba(123,139,110,0.96)' : result.dup ? 'rgba(232,164,114,0.96)' : 'rgba(184,70,58,0.96)') : 'transparent',
    resultFg: result && result.dup ? '#14201F' : '#F7F1E6',
    resultTitle: result ? result.title : '',
    resultSub: result ? result.sub : '',
    scanValid: () => admit('TW-8842', 'Joel M.'),
    scanDup: () => admit('TW-8841', 'Amina M.'),
    scanInvalid: () =>
      flash(
        { ok: false, title: '✕ Invalid', sub: 'Not a Twendezetu ticket, or refunded' },
        { icon: '⚠', code: '—', name: 'Unknown QR', note: 'Signature failed / refunded', status: 'INVALID', color: '#B8463A' },
      ),
    manual: state.manual,
    setManual: (event) => setPageState((current) => ({ ...current, manual: event.target.value })),
    checkManual: () => {
      const code = String(state.manual || '').trim().toUpperCase();
      if (!code) return;
      if (names[code]) admit(code, names[code].replace(' (×2)', ''));
      else
        flash(
          { ok: false, title: '✕ Invalid', sub: `${code} not found` },
          { icon: '⚠', code, name: 'Unknown code', note: 'No matching ticket', status: 'INVALID', color: '#B8463A' },
        );
      setPageState((current) => ({ ...current, manual: '' }));
    },
    log: state.log,
    empty: state.log.length === 0,
  };
}

function disputesValues(state, setPageState) {
  const purchases = [
    ['Afrogroove Night — early bird × 2', 'TICKET #TW-8841 · PAID 3 AUG · CARD ••4412', '$42.00'],
    ['Kato 4x4 — 2-day booking', 'BOOKING #BK-5521 · ESCROW HELD · 12–14 SEP', 'UGX 760K'],
  ];
  const reasons = [
    ['Event cancelled or moved', 'Automatic full refund if the organizer cancelled'],
    ['Provider no-show', 'The provider never arrived or stopped responding'],
    ['Not as described', 'What arrived differs materially from the offer'],
    ['Charged incorrectly', 'Double charge, wrong amount, or unknown charge'],
  ];
  return {
    notSubmitted: !state.submitted,
    submitted: state.submitted,
    purchases: purchases.map(([title, meta, amount], index) => ({
      title,
      meta,
      amount,
      pick: () => setPageState((current) => ({ ...current, purchase: index, formError: null })),
      bg: state.purchase === index ? '#1F3A38' : '#FFFDF8',
      fg: state.purchase === index ? '#F7F1E6' : '#14201F',
    })),
    reasons: reasons.map(([title, desc], index) => ({
      title,
      desc,
      on: state.reason === index,
      pick: () => setPageState((current) => ({ ...current, reason: index, formError: null })),
      bg: state.reason === index ? '#1F3A38' : '#FFFDF8',
      fg: state.reason === index ? '#F7F1E6' : '#14201F',
    })),
    detail: state.detail,
    setDetail: (event) => setPageState((current) => ({ ...current, detail: event.target.value, formError: null })),
    evBtnLabel: state.evidence ? '✓ 2 FILES ATTACHED — ADD MORE' : '↑ ATTACH EVIDENCE',
    evBtnBg: state.evidence ? '#DCE8D9' : '#F7F1E6',
    addEvidence: () => {
      setPageState((current) => ({ ...current, evidence: true }));
      showToast(setPageState, '✓ Evidence attached — visible to the other party and the resolution team.', 3800);
    },
    submitLabel: 'Open case — freeze the money →',
    submitBg: '#B8463A',
    submitFg: '#F7F1E6',
    formError: state.formError,
    submit: () => {
      if (state.reason == null) {
        setPageState((current) => ({ ...current, formError: '✕ Pick what happened (step 2) so we route the case correctly.' }));
        return;
      }
      if (!String(state.detail || '').trim()) {
        setPageState((current) => ({ ...current, formError: '✕ Add a short description — the other party needs context to respond.' }));
        return;
      }
      setPageState((current) => ({ ...current, submitted: true }));
    },
    timeline: [
      { mark: '✓', bg: '#7B8B6E', fg: '#F7F1E6', title: 'Case opened · escrow frozen', titleColor: '#14201F', desc: `JUST NOW — ${purchases[state.purchase][2]} locked. Both parties notified in-app + email.` },
      { mark: '2', bg: '#D97A3B', fg: '#1F3A38', title: 'Other party responds (72h)', titleColor: '#14201F', desc: 'They can refund in full, propose a partial amount, or contest with their own evidence.' },
      { mark: '3', bg: '#F7F1E6', fg: '#1F3A38', title: 'Platform decision (5 business days)', titleColor: '#8C7F6F', desc: 'If you don’t settle, the resolution team reviews both sides’ evidence and rules.' },
      { mark: '4', bg: '#F7F1E6', fg: '#1F3A38', title: 'Refund to original method', titleColor: '#8C7F6F', desc: 'Card/mobile money: 3–5 days. Points: instant. Fees are refunded too when you win.' },
    ],
    withdraw: () => {
      setPageState((current) => ({ ...current, submitted: false, reason: null, detail: '', evidence: false }));
      showToast(setPageState, 'Case withdrawn — escrow unfrozen and both parties notified.', 3800);
    },
    toast: state.toast,
  };
}

function organizerAnalyticsValues() {
  return {
    kpis: [
      { label: 'PAGE VIEWS', value: '4,210', sub: '+22% this week', bg: '#D97A3B', fg: '#14201F' },
      { label: 'RSVPs', value: '214', sub: '5.1% of views', bg: '#FFFDF8', fg: '#14201F' },
      { label: 'TICKETS SOLD', value: '168', sub: '$3,180 in escrow', bg: '#FFFDF8', fg: '#14201F' },
      { label: 'CHECKED IN', value: '87%', sub: '186 of 214 at gate', bg: '#FFFDF8', fg: '#14201F' },
    ],
    funnel: [
      { label: 'Viewed the event', value: '4,210', pct: '100%', color: '#1F3A38' },
      { label: 'Clicked RSVP / tickets', value: '612', pct: '58%', color: '#3A5F5C' },
      { label: 'RSVP’d', value: '214', pct: '34%', color: '#7B8B6E' },
      { label: 'Paid for a ticket', value: '168', pct: '27%', color: '#D97A3B' },
      { label: 'Checked in at gate', value: '186', pct: '24%', color: '#B8593B' },
    ],
    sources: [
      { label: 'WhatsApp', pct: '44%' },
      { label: 'Facebook', pct: '21%' },
      { label: 'Direct link', pct: '18%' },
      { label: 'Twende feed', pct: '12%' },
      { label: 'Email', pct: '5%' },
    ],
    revBars: [
      { h: '30%', color: '#7B8B6E' }, { h: '42%', color: '#7B8B6E' }, { h: '38%', color: '#7B8B6E' },
      { h: '55%', color: '#7B8B6E' }, { h: '48%', color: '#7B8B6E' }, { h: '100%', color: '#D97A3B' },
      { h: '72%', color: '#7B8B6E' }, { h: '64%', color: '#7B8B6E' },
    ],
    tiers: [
      { name: 'Early bird', sold: 120, cap: 120, rev: '$2,040', pct: '100%', color: '#7B8B6E' },
      { name: 'General', sold: 40, cap: 200, rev: '$1,000', pct: '20%', color: '#D97A3B' },
      { name: 'VIP lounge', sold: 8, cap: 40, rev: '$360', pct: '92%', color: '#B8593B' },
    ],
  };
}

function organizerPayoutsValues(state, setPageState) {
  return {
    flow: [
      { step: '01', label: 'Buyer pays', desc: 'Card, mobile money, or points', bg: '#D97A3B', fg: '#14201F' },
      { step: '02', label: 'Escrow', desc: 'Twendezetu holds it, not you', bg: '#FFFDF8', fg: '#14201F' },
      { step: '03', label: 'Event happens', desc: 'Check-in confirms it ran', bg: '#FFFDF8', fg: '#14201F' },
      { step: '04', label: 'Payout − 5%', desc: 'To your MoMo/bank, auto', bg: '#1F3A38', fg: '#F7F1E6' },
    ],
    withdrawLabel: state.withdrawn ? '✓ Withdrawal sent' : 'Withdraw $1,842 →',
    withdraw: () => {
      if (state.withdrawn) return;
      setPageState((current) => ({ ...current, withdrawn: true }));
      showToast(setPageState, '✓ $1,842 sent to MTN MoMo ••7214 — arrives within 1–2 hours. Receipt in your email.', 3600);
    },
    schedule: [
      { mark: '✓', mBg: '#7B8B6E', mFg: '#F7F1E6', title: 'Diaspora Connect Mixer', when: 'RELEASED 22 AUG · in your balance', amount: '$1,842' },
      { mark: '⏳', mBg: '#D97A3B', mFg: '#14201F', title: 'Nyama Choma Festival', when: 'AUTO-RELEASE 10 AUG (event + 2 days)', amount: '$3,021' },
      { mark: '↻', mBg: '#EFE7D6', mFg: '#14201F', title: 'Waitlist seats — pending fill', when: 'VIP: 8 seats · released to waitlist as they’re bought', amount: '+$360' },
    ],
    history: [
      { event: 'Diaspora Connect Mixer', meta: 'PAID OUT 22 AUG · MoMo ••7214', status: 'PAID', chipBg: '#7B8B6E', chipFg: '#F7F1E6', amount: '$1,842' },
      { event: 'Umoja Cultural Day', meta: 'PAID OUT 16 AUG · MoMo ••7214', status: 'PAID', chipBg: '#7B8B6E', chipFg: '#F7F1E6', amount: '$2,410' },
      { event: 'Swahili Food Fair — refund', meta: '2 tickets refunded from escrow · 14 AUG', status: 'REFUND', chipBg: '#E8A472', chipFg: '#14201F', amount: '−$40' },
      { event: 'Gospel Sunday Picnic', meta: 'FREE EVENT · no payout', status: 'FREE', chipBg: '#EFE7D6', chipFg: '#14201F', amount: '$0' },
    ],
    statement: () => showToast(setPageState, 'Statement PDF generated for the selected period — download starting. (Backend: GET /api/organizer/payouts/statement)', 3600),
    toast: state.toast,
  };
}

function referralRewardsValues(state, setPageState) {
  return {
    copyLabel: state.copied ? '✓' : 'COPY',
    copyLink: () => {
      copyText('https://twende.to/r/amina');
      setLater(setPageState, { copied: true }, 1600);
      showToast(setPageState, '✓ Referral link copied — share it anywhere.', 3200);
    },
    rules: [
      { icon: '👋', label: 'Friend joins & verifies their number', pts: '+50' },
      { icon: '🎟', label: 'Their first ticket purchase', pts: '+200' },
      { icon: '📣', label: 'They post an event or a need', pts: '+150' },
      { icon: '🤝', label: 'They become a paying provider', pts: '+500' },
    ],
    tiers: [
      { name: 'Rafiki', need: '1+ friend', perk: 'Points unlocked', badge: '✓ REACHED', badgeColor: '#4a7c4a', bg: '#EFF3EC', fg: '#14201F' },
      { name: 'Connector', need: '10 friends', perk: '2× points + badge', badge: '3 TO GO', badgeColor: '#A85A23', bg: '#1F3A38', fg: '#F7F1E6' },
      { name: 'Champion', need: '25 friends', perk: 'Free provider year', badge: 'LOCKED', badgeColor: '#8C7F6F', bg: '#FFFDF8', fg: '#14201F' },
    ],
    friends: [
      { init: 'JM', name: 'Joel M.', action: 'Bought a ticket · 2 days ago', pts: '+250', color: '#4a7c4a', avBg: '#1F3A38', avFg: '#F7F1E6' },
      { init: 'FK', name: 'Faridah K.', action: 'Posted a need · last week', pts: '+200', color: '#4a7c4a', avBg: '#D97A3B', avFg: '#14201F' },
      { init: 'DO', name: 'Deo O.', action: 'Joined + verified · last week', pts: '+50', color: '#4a7c4a', avBg: '#7B8B6E', avFg: '#F7F1E6' },
      { init: 'NW', name: 'Neema W.', action: 'Became a provider · Jul', pts: '+500', color: '#4a7c4a', avBg: '#1F3A38', avFg: '#F7F1E6' },
      { init: 'SK', name: 'Samuel K.', action: 'Joined + verified · Jul', pts: '+50', color: '#4a7c4a', avBg: '#D97A3B', avFg: '#14201F' },
    ],
    toast: state.toast,
  };
}

function splitPayValues(state, setPageState) {
  const defs = [
    { init: 'AM', name: 'Amina M. (you)', meta: 'organizer of this split', avBg: '#1F3A38', avFg: '#F7F1E6' },
    { init: 'JM', name: 'Joel M.', meta: 'joel@…gmail.com', avBg: '#D97A3B', avFg: '#14201F' },
    { init: 'FK', name: 'Faridah K.', meta: 'via WhatsApp link', avBg: '#7B8B6E', avFg: '#F7F1E6' },
    { init: 'DO', name: 'Deo O.', meta: 'via WhatsApp link', avBg: '#1F3A38', avFg: '#F7F1E6' },
    { init: 'NW', name: 'Neema W.', meta: 'not opened yet', avBg: '#D97A3B', avFg: '#14201F' },
  ];
  const paidN = Object.values(state.paid).filter(Boolean).length;
  return {
    paidCount: paidN,
    collected: `$${(paidN * 17).toFixed(0)}.00`,
    pct: `${(paidN / 5) * 100}%`,
    remaining: `$${(5 - paidN) * 17}.00`,
    guests: defs.map((guest, index) => {
      const isPaid = !!state.paid[index];
      return {
        ...guest,
        bg: isPaid ? '#EFF3EC' : '#FFFDF8',
        share: '$17.00',
        paid: isPaid,
        unpaid: !isPaid,
        meta: isPaid ? `paid ${index === 0 ? 'just now' : 'earlier'} · QR issued` : guest.meta,
        remindLabel: state.reminded[index] ? '✓ NUDGED' : 'REMIND',
        remind: () => {
          setPageState((current) => ({ ...current, reminded: { ...current.reminded, [index]: true } }));
          showToast(setPageState, `Reminder sent to ${guest.name.replace(' (you)', '')} via their preferred channel.`, 3400);
        },
      };
    }),
    copyLabel: state.copied ? '✓ LINK COPIED' : '⧉ COPY SPLIT LINK',
    copyShort: state.copied ? '✓' : 'COPY',
    copyLink: () => {
      copyText('https://twende.to/split/afrogroove-x5');
      setLater(setPageState, { copied: true }, 1800);
      showToast(setPageState, '✓ Split link copied — send it to the group.', 3400);
    },
    payMine: () => {
      setPageState((current) => ({ ...current, paid: { ...current.paid, 0: true } }));
      showToast(setPageState, '✓ Your share paid — QR ticket sent to your email and My Twende.', 3400);
    },
    coverAll: () => {
      setPageState((current) => ({ ...current, paid: { 0: true, 1: true, 2: true, 3: true, 4: true } }));
      showToast(setPageState, '✓ You covered the remaining shares — all 5 QR tickets issued and split closed.', 3400);
    },
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
    case 'eventDetail':
      return eventDetailValues(state, setPageState);
    case 'providerDetail':
      return providerDetailValues(state, setPageState);
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
    case 'providerVerification':
      return providerVerificationValues(state, setPageState);
    case 'providerWallet':
      return providerWalletValues(state, setPageState);
    case 'admin':
      return adminValues(state, setPageState);
    case 'finance':
      return financeValues(state, setPageState);
    case 'settings':
      return settingsValues(state, setPageState);
    case 'mobile':
      return {};
    case 'checkin':
      return checkinValues(state, setPageState);
    case 'disputes':
      return disputesValues(state, setPageState);
    case 'organizerAnalytics':
      return organizerAnalyticsValues(state, setPageState);
    case 'organizerPayouts':
      return organizerPayoutsValues(state, setPageState);
    case 'referralRewards':
      return referralRewardsValues(state, setPageState);
    case 'splitPay':
      return splitPayValues(state, setPageState);
    default:
      return {};
  }
}
