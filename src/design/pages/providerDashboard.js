// The provider portal: answer leads, watch bookings and money, keep the
// membership current, and edit the listing (or start one).

import { CURRENCIES } from '@/shared/money';
import { COLORS, copyText, withStepUp } from './shared';

const MAX_PHOTOS = 8;
const MAX_SERVICES = 12;
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const UNITS = [
  { value: '', label: 'Starting price' },
  { value: 'day', label: 'per day' },
  { value: 'hour', label: 'per hour' },
  { value: 'event', label: 'per event' },
  { value: 'set', label: 'per set' },
  { value: 'plate', label: 'per plate' },
  { value: 'trip', label: 'per trip' },
  { value: 'car', label: 'per car' },
];
const TOPIC_ICONS = { LEADS: '◎', OFFERS: '✉', MONEY: '$', REMINDERS: '◷', SOCIAL: '★', NEWS: 'i' };

let rowKey = 0;
const withKey = (row) => ({ key: `r${(rowKey += 1)}`, ...row });

export const initialState = { bellOpen: false, profileOpen: false, editing: false, open: {}, drafts: {}, sent: {}, month: null, day: null, listingError: null, copied: false };

export function stateFrom(data, params = {}) {
  const listing = { ...data.listing, services: data.listing.services.map(withKey), media: data.listing.media.map(withKey) };
  const month = (data.bookings?.map((booking) => booking.serviceStartsOn).filter((day) => day >= (data.today || '')).sort()[0] || data.today || new Date().toISOString()).slice(0, 7);
  return { listing, editing: !data.hasListing || params.edit === '1', month };
}

export function onMount() {
  if (new URL(window.location.href).searchParams.get('edit') === '1') {
    window.requestAnimationFrame(() => document.getElementById('listing-editor')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  }
}

function monthCells(month, bookings, today, selected, pick) {
  const [year, monthIndex] = month.split('-').map(Number);
  const daysInMonth = new Date(Date.UTC(year, monthIndex, 0)).getUTCDate();
  const lead = (new Date(Date.UTC(year, monthIndex - 1, 1)).getUTCDay() + 6) % 7;
  const cells = Array.from({ length: lead }, () => ({ num: '', label: '', bg: COLORS.sand, fg: COLORS.ink, aria: 'No date', pick: () => {} }));
  for (let day = 1; day <= daysInMonth; day += 1) {
    const key = `${month}-${String(day).padStart(2, '0')}`;
    const booking = bookings.find((item) => item.serviceStartsOn <= key && key <= item.serviceEndsOn);
    const paid = booking && booking.status !== 'PENDING_PAYMENT';
    cells.push({
      num: day,
      label: booking ? booking.title.split(/\s+/).slice(0, 2).join(' ').toUpperCase() : '',
      bg: booking ? (paid ? COLORS.clay : COLORS.sand) : key === selected ? COLORS.cream : COLORS.paper,
      fg: booking && paid ? COLORS.cream : COLORS.ink,
      aria: `${day} ${MONTHS[monthIndex - 1]}${booking ? `: ${booking.title}` : ''}`,
      pick: () => pick(booking ? key : null),
    });
    if (key === today && !booking) cells[cells.length - 1].bg = '#FBEED8';
  }
  while (cells.length % 7) cells.push({ num: '', label: '', bg: COLORS.sand, fg: COLORS.ink, aria: 'No date', pick: () => {} });
  return cells;
}

function shiftMonth(month, delta) {
  const [year, monthIndex] = month.split('-').map(Number);
  const date = new Date(Date.UTC(year, monthIndex - 1 + delta, 1));
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
}

// Mirrors the server's rules so the person hears about a gap before saving.
function listingProblem(listing) {
  if (listing.name.trim().length < 2) return 'Add your business name.';
  if (listing.city.trim().length < 2) return 'Add your home city.';
  if (listing.headline.trim().length < 10) return 'Add a one-line headline (10 characters or more).';
  if (listing.description.trim().length < 30) return 'Tell customers about your business in a few sentences (30 characters or more).';
  if (!listing.coverUrl) return 'Add a cover photo. It is what people see first in the directory.';
  if (listing.services.some((service) => !service.title.trim() && (service.description.trim() || service.rate.trim()))) return 'Every service needs a name.';
  return null;
}

export function values(state, set, ctx) {
  const { data } = state;
  const { listing } = state;
  const hasListing = data.hasListing;
  const setListing = (change) => set((current) => ({ ...current, listing: { ...current.listing, ...change }, listingError: null }));
  const listingField = (key) => (event) => setListing({ [key]: event.target.value });
  const toggle = (key) => set((current) => ({ ...current, open: { ...current.open, [key]: !current.open[key] } }));
  const draft = (key, value) => set((current) => ({ ...current, drafts: { ...current.drafts, [key]: value } }));

  const upload = (purpose, onStored) => (event) => {
    const input = event.target;
    const file = input.files?.[0];
    if (!file) return;
    input.value = '';
    if (file.size > 4 * 1024 * 1024) {
      ctx.toast('Photos can be at most 4 MB.', 'err');
      return;
    }
    ctx.run(`upload:${purpose}`, async () => {
      const { file: stored } = await ctx.api.upload(file, purpose);
      onStored(stored.url);
    }, { reloadAfter: false });
  };

  // ── Listing editor ────────────────────────────────────────────────────
  const saveListing = () => {
    const problem = listingProblem(listing);
    if (problem) return set((current) => ({ ...current, listingError: problem }));
    const body = {
      name: listing.name.trim(),
      category: listing.category,
      city: listing.city.trim(),
      ...(hasListing ? {} : { country: listing.country }),
      headline: listing.headline.trim(),
      description: listing.description.trim(),
      coverUrl: listing.coverUrl,
      // A blank rate means priced per job; the server reads 'quote' as that.
      rate: listing.rate.trim() || 'quote',
      rateUnit: listing.rateUnit || '',
      serviceAreas: listing.serviceAreas.split(',').map((area) => area.trim()).filter(Boolean).slice(0, 12),
      services: listing.services
        .filter((service) => service.title.trim())
        .map((service) => ({ title: service.title.trim(), description: service.description.trim(), rate: service.rate.trim() || 'quote', rateUnit: service.rateUnit || '' })),
      media: listing.media.map((item) => ({ url: item.url, alt: item.alt || listing.name.trim() })),
    };
    return ctx.run('listing', async () => {
      const { provider } = await ctx.api.put('/api/providers/me', body);
      set((current) => ({ ...current, editing: false }));
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return provider;
    }, { success: (provider) => (provider.status === 'ACTIVE' ? 'Saved. Your public listing is updated.' : 'Saved. Pay the membership to put it live.') });
  };

  // ── Membership ────────────────────────────────────────────────────────
  const payMembership = (channel) =>
    ctx.run(`membership:${channel}`, () => withStepUp(ctx, (code) => ctx.api.post('/api/providers/me/membership', { channel, code }, { idempotent: true })), {
      success: (result) => (!result ? null : result.mode === 'test' ? 'Membership paid (test mode — no card was charged). Your listing is live.' : result.points ? `Paid with ${result.points.toLocaleString('en-US')} points. Your listing is live.` : 'Membership paid.'),
    });

  const base = {
    me: data.me,
    hasListing,
    categories: data.categories,
    countries: data.countries,
    units: UNITS,
    unread: data.unread || 0,
    hasUnread: (data.unread || 0) > 0,
    bellOpen: state.bellOpen,
    toggleBell: () => {
      const opening = !state.bellOpen;
      set((current) => ({ ...current, bellOpen: opening, profileOpen: false }));
      if (opening && data.unread) ctx.api.post('/api/notifications', {}).then(() => set((current) => ({ ...current, data: { ...current.data, unread: 0 } }))).catch(() => {});
    },
    profileOpen: state.profileOpen,
    toggleProfile: () => set((current) => ({ ...current, profileOpen: !current.profileOpen, bellOpen: false })),
    signOut: () => ctx.run('signout', async () => {
      await ctx.api.post('/api/auth/sign-out');
      window.location.assign('/');
    }, { reloadAfter: false }),
    notifications: (data.notifications || []).map((item) => ({ ...item, icon: TOPIC_ICONS[item.topic] || '·', href: item.href || '/provider-dashboard' })),
    noNotifications: !data.notifications?.length,

    editorOpen: state.editing,
    editListing: () => {
      set((current) => ({ ...current, editing: true, profileOpen: false }));
      window.requestAnimationFrame(() => document.getElementById('listing-editor')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
    },
    closeEditor: () => set((current) => ({ ...current, editing: false, listingError: null })),
    editorTitle: hasListing ? 'Your listing' : 'List your service',
    editorIntro: hasListing
      ? 'What customers see in the directory and on your page. Changes go live when you save.'
      : `Tell customers what you do. Once saved, the listing goes live when the 12-month membership (${data.membershipPrice}) is paid, and you start hearing about matching needs in your cities.`,
    countryLocked: hasListing,
    lf: listing,
    ls: {
      ...Object.fromEntries(['name', 'category', 'city', 'serviceAreas', 'headline', 'description', 'rate', 'rateUnit'].map((key) => [key, listingField(key)])),
      country: hasListing
        ? () => {}
        : (event) => {
            const country = data.countries.find((item) => item.code === event.target.value);
            setListing({ country: event.target.value, currency: country?.currency || listing.currency });
          },
    },
    coverLabel: listing.coverUrl ? '↺ REPLACE PHOTO' : '＋ UPLOAD A COVER PHOTO',
    uploadCover: upload('PROVIDER_MEDIA', (url) => setListing({ coverUrl: url })),
    gallery: listing.media.map((item) => ({ ...item, remove: () => setListing({ media: listing.media.filter((photo) => photo.key !== item.key) }) })),
    canAddPhoto: listing.media.length < MAX_PHOTOS,
    addPhoto: upload('PROVIDER_MEDIA', (url) => set((current) => ({ ...current, listing: { ...current.listing, media: [...current.listing.media, withKey({ url, alt: current.listing.name })] } }))),
    serviceRows: listing.services.map((service) => {
      const update = (change) => setListing({ services: listing.services.map((row) => (row.key === service.key ? { ...row, ...change } : row)) });
      return {
        ...service,
        setTitle: (event) => update({ title: event.target.value }),
        setDescription: (event) => update({ description: event.target.value }),
        setRate: (event) => update({ rate: event.target.value }),
        setUnit: (event) => update({ rateUnit: event.target.value }),
        remove: () => setListing({ services: listing.services.filter((row) => row.key !== service.key) }),
      };
    }),
    canAddService: listing.services.length < MAX_SERVICES,
    addService: () => setListing({ services: [...listing.services, withKey({ title: '', description: '', rate: '', rateUnit: '' })] }),
    listingError: state.listingError,
    saveListing,
    savingListing: Boolean(state.busy?.listing),
    saveLabel: hasListing ? 'Save listing →' : 'Save and continue →',
    saveNote: hasListing ? 'Your public page updates straight away.' : 'You can keep editing after saving.',
  };

  if (!hasListing) {
    return {
      ...base,
      businessLine: 'NO LISTING YET',
      statusLine: '○ NOT LISTED',
      statusColor: COLORS.muted,
      verificationLabel: 'after you list',
      listingHref: '/vendors',
      headlineTail: 'List your service',
      isDraft: false,
    };
  }

  const { provider, membership, tiles } = data;
  const currency = provider.currency;
  const pricePlaceholder = `e.g. ${CURRENCIES[currency]?.exponent ? '450' : '450,000'} (${currency})`;
  const listingHref = `/vendors/${provider.slug}`;

  // ── Leads ─────────────────────────────────────────────────────────────
  const leads = data.leads.map((lead) => {
    const offerKey = `offer:${lead.id}`;
    const askKey = `ask:${lead.id}`;
    const sent = state.sent[lead.id];
    const mine = lead.myOffer;
    const drafts = state.drafts;
    return {
      ...lead,
      offersLabel: lead.offers === 1 ? '1 offer so far' : `${lead.offers} offers so far`,
      hasMine: Boolean(mine) && !sent,
      mineText: mine ? `You offered ${mine.price} (${mine.status.toLowerCase()}).` : '',
      mineHref: mine ? `/messages?thread=${mine.threadId}` : '/messages',
      canOffer: !mine && !sent,
      offerOpen: Boolean(state.open[offerKey]),
      askOpen: Boolean(state.open[askKey]),
      offerBtnLabel: state.open[offerKey] ? 'Close' : 'Send an offer',
      offerBtnBg: state.open[offerKey] ? COLORS.forest : COLORS.clay,
      offerBtnFg: COLORS.cream,
      askBtnBg: state.open[askKey] ? COLORS.sand : COLORS.paper,
      toggleOffer: () => toggle(offerKey),
      toggleAsk: () => toggle(askKey),
      pricePlaceholder: lead.budgetMinor ? `Budget ${lead.budget} · your price` : pricePlaceholder,
      offerPrice: drafts[`${lead.id}:price`] || '',
      offerNote: drafts[`${lead.id}:note`] || '',
      question: drafts[`${lead.id}:question`] || '',
      setPrice: (event) => draft(`${lead.id}:price`, event.target.value),
      setNote: (event) => draft(`${lead.id}:note`, event.target.value),
      setQuestion: (event) => draft(`${lead.id}:question`, event.target.value),
      submitOffer: () => {
        const price = (drafts[`${lead.id}:price`] || '').trim();
        if (!price) return ctx.toast('Enter your price.', 'err');
        return ctx.run(offerKey, async () => {
          const result = await ctx.api.post(`/api/needs/${lead.id}/offers`, { price, note: (drafts[`${lead.id}:note`] || '').trim() || undefined }, { idempotent: true });
          set((current) => ({ ...current, sent: { ...current.sent, [lead.id]: { msg: `Offer ${result.reference} sent. The poster is told straight away.`, href: `/messages?thread=${result.threadId}` } } }));
          return result;
        }, { reloadAfter: false });
      },
      submitAsk: () => {
        const question = (drafts[`${lead.id}:question`] || '').trim();
        if (question.length < 2) return ctx.toast('Type your question first.', 'err');
        return ctx.run(askKey, async () => {
          const result = await ctx.api.post(`/api/needs/${lead.id}/questions`, { question });
          set((current) => ({ ...current, open: { ...current.open, [askKey]: false }, sent: { ...current.sent, [lead.id]: { msg: 'Question sent. The answer arrives in Messages.', href: `/messages?thread=${result.threadId}` } } }));
          return result;
        }, { reloadAfter: false });
      },
      sent: Boolean(sent),
      sentMsg: sent?.msg || '',
      sentHref: sent?.href || '/messages',
    };
  });

  // ── Calendar ──────────────────────────────────────────────────────────
  const [year, monthIndex] = state.month.split('-').map(Number);
  const selected = state.day ? data.bookings.find((booking) => booking.serviceStartsOn <= state.day && state.day <= booking.serviceEndsOn) : null;

  // ── Membership ────────────────────────────────────────────────────────
  const statusLabel = { ACTIVE: 'Active', DRAFT: 'Not live yet', SUSPENDED: 'Suspended' }[membership.status];
  const membershipStatus = membership.status === 'ACTIVE' ? `Active · ${membership.daysLeft} days left` : statusLabel;
  const renewLabel = membership.status !== 'ACTIVE'
    ? `Pay ${membership.price} by card`
    : membership.early
      ? `Renew early · ${membership.price} (save ${membership.saving})`
      : `Renew · ${membership.price}`;

  const earningsWeeks = data.earnings.bars;

  return {
    ...base,
    provider,
    listingHref,
    businessLine: `${provider.name} · ${provider.city}`.toUpperCase(),
    statusLine: membership.status === 'ACTIVE' ? `● LISTING LIVE${provider.verified ? ' · ID VERIFIED ✓' : ''}` : membership.status === 'SUSPENDED' ? '● SUSPENDED' : '○ NOT LIVE YET',
    statusColor: membership.status === 'ACTIVE' ? '#4a7c4a' : membership.status === 'SUSPENDED' ? COLORS.red : COLORS.rust,
    verificationLabel: provider.verified ? 'VERIFIED ✓' : 'NOT YET VERIFIED',
    headlineTail: tiles.newLeads ? `${tiles.newLeads} new ${tiles.newLeads === 1 ? 'lead' : 'leads'}` : 'No new leads today',
    isDraft: membership.status === 'DRAFT',
    payCard: () => payMembership('CARD'),
    payPoints: () => payMembership('POINTS'),

    tiles: [
      { label: 'NEW LEADS', big: tiles.newLeads, sub: 'matched needs without your offer', bg: COLORS.clay, fg: COLORS.cream },
      { label: 'ACTIVE OFFERS', big: tiles.activeOffers, sub: tiles.awaitingReply ? `${tiles.awaitingReply} waiting for the poster` : 'none waiting', bg: COLORS.paper, fg: COLORS.ink },
      { label: 'JOBS DONE', big: tiles.jobs, sub: tiles.rating === 'NEW' ? 'no reviews yet' : `★ ${tiles.rating} average`, bg: COLORS.paper, fg: COLORS.ink },
      { label: 'PROFILE VIEWS · 30D', big: tiles.views.toLocaleString('en-US'), sub: tiles.viewsDelta == null ? 'first month on record' : `${tiles.viewsDelta >= 0 ? '+' : ''}${tiles.viewsDelta}% on the month before`, bg: COLORS.forest, fg: COLORS.cream },
    ],
    matchedTo: provider.matchedTo,
    leads,
    noLeads: leads.length === 0,
    noLeadsText: membership.status === 'ACTIVE'
      ? 'No open needs match your category and cities right now. New ones appear here, and you are told as they are posted.'
      : 'Leads appear here once your listing is live.',
    hasRequests: data.requests.length > 0,
    requests: data.requests.map((request) => ({ ...request, href: request.threadId ? `/messages?thread=${request.threadId}` : '/messages' })),

    monthName: `${MONTHS[monthIndex - 1]} ${year}`,
    prevMonth: () => set((current) => ({ ...current, month: shiftMonth(current.month, -1), day: null })),
    nextMonth: () => set((current) => ({ ...current, month: shiftMonth(current.month, 1), day: null })),
    calendar: monthCells(state.month, data.bookings, data.today, state.day, (day) => set((current) => ({ ...current, day }))),
    selectedBooking: Boolean(selected),
    selectedTitle: selected ? `${selected.title} · ${selected.reference}` : '',
    selectedMeta: selected ? `${selected.serviceStartsOn === selected.serviceEndsOn ? selected.serviceStartsOn : `${selected.serviceStartsOn} → ${selected.serviceEndsOn}`} · ${selected.booked ? 'PAID INTO ESCROW' : 'WAITING FOR PAYMENT'}` : '',
    selectedHref: selected?.threadId ? `/messages?thread=${selected.threadId}` : '/messages',

    membership,
    membershipStatus,
    membershipPct: membership.status === 'ACTIVE' ? membership.pct : '0%',
    billingNote: `PAID UPFRONT FOR 12 MONTHS BY CARD OR POINTS. NOTHING RENEWS BY ITSELF: WE REMIND YOU 14 AND 3 DAYS BEFORE IT ENDS. RENEW MORE THAN ${membership.earlyWindowDays} DAYS EARLY AND SAVE ${membership.discountPercent}%.`,
    renewLabel,
    renewBg: membership.early ? COLORS.clayLight : COLORS.clay,
    renewFg: membership.early ? COLORS.ink : COLORS.cream,
    renew: () => payMembership('CARD'),
    renewPoints: () => payMembership('POINTS'),

    earningsTotal: data.earnings.total,
    earningsNote: `earned in the last 12 weeks · the ${data.commissionPercent}% platform fee comes out only when a booking is paid`,
    bars: earningsWeeks.map((bar, index) => ({ ...bar, color: bar.latest ? COLORS.clay : COLORS.forest, title: `${earningsWeeks.length - index === 1 ? 'This week' : `${earningsWeeks.length - index - 1} weeks ago`}` })),

    prefs: [
      ['leads', 'New matched leads', 'LEADS', 'inApp'],
      ['offers', 'Replies to my offers', 'OFFERS', 'inApp'],
      ['money', 'Money notices by email', 'MONEY', 'email'],
      ['digest', 'Weekly digest', null, null],
    ].map(([key, label, topic, channel]) => {
      const on = Boolean(data.prefs[key]);
      return {
        label,
        on,
        bg: on ? COLORS.clay : COLORS.sand,
        knobLeft: on ? '26px' : '2px',
        toggle: () => {
          set((current) => ({ ...current, data: { ...current.data, prefs: { ...current.data.prefs, [key]: !on } } }));
          const call = topic
            ? ctx.api.patch('/api/account/notifications', { topic, channel, enabled: !on })
            : ctx.api.put('/api/account/notifications', { weeklyDigest: !on });
          call.catch((error) => {
            set((current) => ({ ...current, data: { ...current.data, prefs: { ...current.data.prefs, [key]: on } } }));
            ctx.toast(error.message, 'err');
          });
        },
      };
    }),

    listingStats: `${provider.rating === 'NEW' ? 'New' : `★ ${provider.rating}`} · ${provider.jobs} jobs · ${provider.areas}`,
    shareLabel: state.copied ? '✓ COPIED' : '⧉ SHARE',
    shareListing: () => {
      copyText(`${data.appUrl}${listingHref}`);
      set((current) => ({ ...current, copied: true }));
      window.setTimeout(() => set((current) => ({ ...current, copied: false })), 1800);
    },
  };
}
