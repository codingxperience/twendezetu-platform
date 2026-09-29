// Posting an event or a need, or editing one. Four steps: kind, details,
// privacy & alerts, done. The server checks everything again; the checks here
// only save a round trip and point at the field to fix.

import { CURRENCIES, parseMoneyInput } from '@/shared/money';
import { fromZonedInput } from '@/shared/time';
import { COLORS, copyText, shareLinks } from './shared';

const MAX_TIERS = 8;

let tierKey = 0;
const blankTier = (name = '') => ({ key: `t${(tierKey += 1)}`, id: null, name, price: '', qty: '', sold: 0 });

function blankForm(data, kind) {
  return {
    kind,
    title: '',
    blurb: '',
    category: kind === 'need' ? data.needCategories[0].code : data.eventCategories[0].code,
    country: data.defaults.country,
    city: data.defaults.city,
    venue: '',
    startsAt: '',
    endsAt: '',
    startsOn: '',
    endsOn: '',
    budget: '',
    closesAt: '',
    coverUrl: '',
    isFree: true,
    capacity: '',
    tiers: [blankTier('General')],
    description: '',
    organizerName: data.defaults.organizerName,
    allowGuestRsvp: true,
    publish: true,
    revealContactsOnAccept: false,
    notifyOnOffers: true,
    weeklyDigest: false,
  };
}

export const initialState = { step: 1, form: null, formError: null, result: null, copied: false };

export function stateFrom(data, params = {}) {
  const kind = params.kind === 'need' ? 'need' : 'event';
  if (data.editing) {
    const values = data.editing;
    const form = {
      ...blankForm(data, values.kind),
      ...values,
      tiers: values.kind === 'event' && values.tiers?.length ? values.tiers.map((tier) => ({ ...blankTier(), ...tier })) : [blankTier('General')],
    };
    return { step: 2, form };
  }
  return { step: params.kind ? 2 : 1, form: blankForm(data, kind) };
}

const trimmed = (value) => String(value ?? '').trim();
const wholeNumber = (value) => {
  const text = trimmed(value).replace(/[,\s]/g, '');
  if (!text) return undefined;
  const number = Number(text);
  return Number.isInteger(number) && number > 0 ? number : NaN;
};

// Checks one step and returns the first problem, or null.
function problemIn(step, form, data) {
  if (step !== 2) return null;
  const event = form.kind === 'event';
  if (trimmed(form.title).length < 3) return 'Give it a title of at least 3 characters.';
  if (trimmed(form.city).length < 2) return 'Add the city or area.';
  if (trimmed(form.description).length < (event ? 20 : 10)) return event ? 'Describe the event in a few sentences (20 characters or more).' : 'Describe what you need (10 characters or more).';
  if (!event) {
    if (form.startsOn && form.endsOn && form.endsOn < form.startsOn) return 'The end date must be on or after the start date.';
    if (form.budget && parseMoneyInput(form.budget, currencyOf(form, data)) == null) return 'Budget: write it like 400K or 400,000.';
    return null;
  }
  if (trimmed(form.blurb).length < 10) return 'Add a one-line summary (10 characters or more) for the event card.';
  if (trimmed(form.venue).length < 3) return 'Add the venue.';
  const zone = zoneOf(form, data);
  const starts = fromZonedInput(form.startsAt, zone);
  if (!starts) return 'Pick the start date and time.';
  const unchangedStart = data.editing && form.startsAt === data.editing.startsAt;
  if (!unchangedStart && starts < new Date()) return 'Pick a start time in the future.';
  if (form.endsAt) {
    const ends = fromZonedInput(form.endsAt, zone);
    if (!ends || ends <= starts) return 'The end time must be after the start.';
  }
  if (!form.coverUrl) return 'Add a cover photo. It is the first thing people see on the event card.';
  if (form.isFree) {
    if (Number.isNaN(wholeNumber(form.capacity))) return 'Capacity must be a whole number, or blank for no limit.';
    return null;
  }
  const tiers = form.tiers.filter((tier) => trimmed(tier.name) || trimmed(tier.price));
  if (!tiers.length) return 'Add at least one ticket tier, or make the event free.';
  for (const tier of tiers) {
    if (!trimmed(tier.name)) return 'Every tier needs a name.';
    const price = parseMoneyInput(tier.price, currencyOf(form, data));
    if (price == null || price <= 0) return `Set a price for ${trimmed(tier.name)}.`;
    const qty = wholeNumber(tier.qty);
    if (Number.isNaN(qty)) return `The quantity for ${trimmed(tier.name)} must be a whole number, or blank for no limit.`;
    if (qty !== undefined && qty < tier.sold) return `${trimmed(tier.name)} has already sold ${tier.sold}.`;
  }
  return null;
}

function countryOf(form, data) {
  return data.countries.find((country) => country.code === form.country) || data.countries[0];
}
function currencyOf(form, data) {
  return form.currency || countryOf(form, data).currency;
}
function zoneOf(form, data) {
  return countryOf(form, data).timezone;
}

function payloadFor(form, data) {
  const currency = currencyOf(form, data);
  if (form.kind === 'need') {
    return {
      title: trimmed(form.title),
      description: trimmed(form.description),
      category: form.category,
      city: trimmed(form.city),
      country: form.country,
      startsOn: form.startsOn ? new Date(`${form.startsOn}T00:00:00Z`).toISOString() : undefined,
      endsOn: form.endsOn ? new Date(`${form.endsOn}T00:00:00Z`).toISOString() : undefined,
      budget: trimmed(form.budget) || undefined,
      // Offers close at the end of the chosen day, venue time.
      closesAt: form.closesAt ? fromZonedInput(`${form.closesAt}T23:59`, zoneOf(form, data)).toISOString() : undefined,
      revealContactsOnAccept: form.revealContactsOnAccept,
      notifyOnOffers: form.notifyOnOffers,
      weeklyDigest: form.weeklyDigest,
    };
  }
  const zone = zoneOf(form, data);
  const tiers = form.isFree
    ? undefined
    : form.tiers
        .filter((tier) => trimmed(tier.name) || trimmed(tier.price))
        .map((tier) => ({
          ...(tier.id ? { id: tier.id } : {}),
          name: trimmed(tier.name),
          priceMinor: parseMoneyInput(tier.price, currency),
          ...(wholeNumber(tier.qty) ? { capacity: wholeNumber(tier.qty) } : {}),
        }));
  return {
    title: trimmed(form.title),
    category: form.category,
    blurb: trimmed(form.blurb),
    description: trimmed(form.description),
    coverUrl: form.coverUrl,
    venue: trimmed(form.venue),
    city: trimmed(form.city),
    country: form.country,
    startsAt: fromZonedInput(form.startsAt, zone).toISOString(),
    endsAt: form.endsAt ? fromZonedInput(form.endsAt, zone).toISOString() : undefined,
    isFree: form.isFree,
    capacity: form.isFree && wholeNumber(form.capacity) ? wholeNumber(form.capacity) : undefined,
    allowGuestRsvp: form.allowGuestRsvp,
    tiers,
    ...(data.editing ? {} : { publish: form.publish, organizerName: trimmed(form.organizerName) || undefined }),
  };
}

export function values(state, set, ctx) {
  const { data, form } = state;
  const editing = Boolean(data.editing);
  const isEvent = form.kind === 'event';
  const currency = currencyOf(form, data);
  const country = countryOf(form, data);

  const update = (change) => set((current) => ({ ...current, form: { ...current.form, ...change }, formError: null }));
  const setter = (key) => (event) => update({ [key]: event.target.value });
  const setters = Object.fromEntries(['title', 'blurb', 'category', 'city', 'venue', 'startsAt', 'endsAt', 'startsOn', 'endsOn', 'budget', 'closesAt', 'capacity', 'description', 'organizerName'].map((key) => [key, setter(key)]));
  // Country (and with it currency and time zone) is fixed once posted.
  setters.country = editing ? () => {} : setter('country');

  const goStep = (step) => set((current) => ({ ...current, step, formError: null }));
  const next = () => {
    const problem = problemIn(state.step, form, data);
    if (problem) {
      set((current) => ({ ...current, formError: problem }));
      return;
    }
    goStep(Math.min(3, state.step + 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const firstStep = editing ? 2 : 1;

  const submit = () => {
    const problem = problemIn(2, form, data);
    if (problem) {
      set((current) => ({ ...current, step: 2, formError: problem }));
      return;
    }
    const body = payloadFor(form, data);
    ctx.run('save', async () => {
      let result;
      if (isEvent) {
        result = editing
          ? (await ctx.api.patch(`/api/events/${data.editing.slug}`, body)).event
          : (await ctx.api.post('/api/events', body)).event;
      } else {
        result = editing
          ? (await ctx.api.patch(`/api/needs/${data.editing.id}`, body)).need
          : (await ctx.api.post('/api/needs', body)).need;
      }
      set((current) => ({ ...current, step: 4, result, formError: null }));
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return result;
    }, { reloadAfter: false });
  };

  const uploadCover = (event) => {
    const input = event.target;
    const file = input.files?.[0];
    if (!file) return;
    input.value = '';
    if (file.size > 4 * 1024 * 1024) {
      ctx.toast('Photos can be at most 4 MB.', 'err');
      return;
    }
    ctx.run('cover', async () => {
      const { file: stored } = await ctx.api.upload(file, 'EVENT_COVER');
      update({ coverUrl: stored.url });
    }, { reloadAfter: false, success: 'Cover photo added.' });
  };

  // Tiers
  const updateTier = (key, change) => update({ tiers: form.tiers.map((tier) => (tier.key === key ? { ...tier, ...change } : tier)) });
  const kindLocked = editing && isEvent && data.editing.tiers?.some((tier) => tier.sold > 0);

  // Privacy rows
  const toggleRow = (key, title, desc) => ({
    title,
    desc,
    on: Boolean(form[key]),
    bg: form[key] ? COLORS.clay : COLORS.sand,
    knobLeft: form[key] ? '30px' : '2px',
    toggle: () => update({ [key]: !form[key] }),
  });
  const privacyRows = isEvent
    ? [
        toggleRow('allowGuestRsvp', 'Guests can RSVP without an account', 'They give a name and email and get a private link to change their mind. Turn off to require a free account.'),
        ...(editing ? [] : [toggleRow('publish', 'Publish straight away', 'On: it goes live now. Off: it is saved as a draft you can publish from My Twende.')]),
      ]
    : [
        toggleRow('notifyOnOffers', 'Tell me as each offer arrives', 'In-app and by email, following your notification settings. Off: offers wait in Messages.'),
        toggleRow('revealContactsOnAccept', 'Share my contacts when I accept an offer', 'Only with the vendor you accept. Off: everything, including payment, stays in Twendezetu.'),
        toggleRow('weeklyDigest', 'Weekly summary by email', 'Every Monday: the offers that came in, side by side.'),
      ];

  // Done
  const result = state.result;
  const shareUrl = result && isEvent ? `${data.appUrl}/events/${result.slug}?r=${data.me.handle}` : '';
  const links = shareUrl ? shareLinks(shareUrl, `${trimmed(form.title)} — ${country.name}. Twende pamoja!`, trimmed(form.title)) : {};
  let doneTitle = 'Live';
  let doneText = '';
  if (result) {
    if (editing) {
      doneTitle = 'Saved';
      doneText = isEvent
        ? result.told
          ? `Your changes are live. ${result.told} ${result.told === 1 ? 'person going was' : 'people going were'} told about the new time or place, and their reminders moved with it.`
          : 'Your changes are live.'
        : 'Your changes are live. Vendors who already sent an offer see a note in their conversation.';
    } else if (isEvent) {
      doneTitle = result.status === 'PUBLISHED' ? 'Live. Sasa share it' : 'Saved as a draft';
      doneText = result.status === 'PUBLISHED'
        ? 'Your event is live. RSVPs and tickets show up in My Twende, and every guest gets reminders before it starts.'
        : 'Nobody else can see it yet. Publish it from My Twende when you are ready.';
    } else {
      const categoryLabel = data.needCategories.find((item) => item.code === form.category)?.label || 'your category';
      doneText = result.notified
        ? `Your need is on the needs board, and ${result.notified} ${result.notified === 1 ? 'provider' : 'providers'} for ${categoryLabel.toLowerCase()} in ${trimmed(form.city)} ${result.notified === 1 ? 'was' : 'were'} told. Offers arrive in Messages.`
        : `Your need is on the needs board. No vendor for ${categoryLabel.toLowerCase()} is listed in ${trimmed(form.city)} yet, so it stays open for anyone who serves the area. Offers arrive in Messages.`;
    }
  }

  const stepLabels = ['What you are posting', 'The details', 'Privacy & alerts', editing ? 'Saved' : 'Published'];

  return {
    me: data.me,
    headerNote: editing ? 'EDITING · CHANGES GO LIVE WHEN YOU SAVE' : 'POSTING IS FREE · YOUR CONTACTS STAY MASKED',
    exitHref: editing ? '/my-twende?tab=posts' : '/',
    steps: stepLabels.map((label, index) => {
      const num = index + 1;
      const reachable = num >= firstStep && num < state.step && state.step !== 4;
      const active = num === state.step;
      const done = num < state.step || (editing && num === 1);
      return {
        num: done && !active ? '✓' : String(num),
        label,
        current: active ? 'step' : 'false',
        bg: active ? COLORS.clay : done ? COLORS.forest : COLORS.paper,
        fg: active || done ? COLORS.cream : COLORS.ink,
        weight: active ? 700 : 500,
        labelColor: active || done ? COLORS.ink : COLORS.muted,
        cursor: reachable ? 'pointer' : 'default',
        go: () => {
          if (reachable) goStep(num);
        },
      };
    }),
    isStep1: state.step === 1,
    isStep2: state.step === 2,
    isStep3: state.step === 3,
    isStep4: state.step === 4,
    next,
    back: () => goStep(Math.max(firstStep, state.step - 1)),
    canGoBack: state.step > firstStep,

    isEventKind: isEvent,
    isNeedKind: !isEvent,
    pickEvent: () => update({ kind: 'event', category: data.eventCategories[0].code }),
    pickNeed: () => update({ kind: 'need', category: data.needCategories[0].code }),
    eventCardBg: isEvent ? COLORS.forest : COLORS.paper,
    eventCardFg: isEvent ? COLORS.cream : COLORS.ink,
    eventCardShadow: isEvent ? `6px 6px 0 ${COLORS.clay}` : 'none',
    needCardBg: !isEvent ? COLORS.forest : COLORS.paper,
    needCardFg: !isEvent ? COLORS.cream : COLORS.ink,
    needCardShadow: !isEvent ? `6px 6px 0 ${COLORS.clay}` : 'none',

    detailsTitle: editing ? (isEvent ? 'Edit your event' : 'Edit your need') : 'The details',
    detailsIntro: isEvent ? 'What people see on the event card and the event page.' : 'Vendors who serve this city and category are told when you post.',
    titlePlaceholder: isEvent ? 'e.g. Afrogroove Night' : 'e.g. Driver + 4x4 needed, Kampala → Jinja',
    form,
    set: setters,
    categories: isEvent ? data.eventCategories : data.needCategories,
    countries: data.countries,
    countryLocked: editing,
    currency,
    budgetPlaceholder: currency === 'USD' ? 'e.g. 400' : 'e.g. 400,000',
    pricePlaceholder: CURRENCIES[currency]?.exponent ? 'e.g. 25.00' : 'e.g. 20,000',
    timeHint: isEvent
      ? `Times are the venue's local time (${country.timezone.replace('_', ' ')}). The event page shows the time zone beside every time.`
      : `Dates are local to ${country.name}. Offers close at the end of the day you pick.`,
    hasCover: Boolean(form.coverUrl),
    coverLabel: form.coverUrl ? '↺ REPLACE PHOTO' : '＋ UPLOAD A COVER PHOTO',
    uploadCover,

    isPaid: !form.isFree,
    freeBg: form.isFree ? COLORS.forest : COLORS.paper,
    freeFg: form.isFree ? COLORS.cream : COLORS.ink,
    paidBg: !form.isFree ? COLORS.forest : COLORS.paper,
    paidFg: !form.isFree ? COLORS.cream : COLORS.ink,
    pickFree: () => (kindLocked ? null : update({ isFree: true })),
    pickPaid: () => (kindLocked ? null : update({ isFree: false })),
    kindLocked,
    kindLockedNote: 'Tickets have been sold, so this event stays ticketed. You can still change prices for future buyers, add tiers, or stop selling one.',
    feePercent: `${data.fees.ticketServiceBps / 100}%`,
    releaseHours: data.fees.eventReleaseHours,
    tierRows: form.tiers.map((tier) => ({
      ...tier,
      qtyPlaceholder: tier.sold ? `at least ${tier.sold}` : 'e.g. 200',
      soldNote: tier.sold ? `${tier.sold} sold. Removing this tier stops sales; the ${tier.sold} tickets stay valid.` : '',
      setName: (event) => updateTier(tier.key, { name: event.target.value }),
      setPrice: (event) => updateTier(tier.key, { price: event.target.value }),
      setQty: (event) => updateTier(tier.key, { qty: event.target.value }),
      remove: () => update({ tiers: form.tiers.length > 1 ? form.tiers.filter((item) => item.key !== tier.key) : [blankTier()] }),
    })),
    canAddTier: form.tiers.length < MAX_TIERS,
    addTier: () => update({ tiers: [...form.tiers, blankTier()] }),

    descriptionMax: isEvent ? 4000 : 2000,
    descriptionPlaceholder: isEvent
      ? 'What happens, who it is for, what to bring. People decide here.'
      : 'e.g. Visiting from the US to surprise family. Need a reliable driver with a 4x4 for village roads. Two days, fuel included please.',
    showOrganizer: isEvent && !editing,
    formError: state.formError,

    privacyRows,
    submit,
    saving: Boolean(state.busy?.save),
    submitLabel: editing ? 'Save changes →' : isEvent && !form.publish ? 'Save draft →' : 'Publish →',

    doneKicker: editing ? '[Imehifadhiwa — saved]' : '[Imechapishwa — published]',
    doneTitle,
    doneText,
    hasShare: Boolean(shareUrl) && result?.status === 'PUBLISHED',
    shareUrl,
    ...links,
    copyLabel: state.copied ? '✓ COPIED' : 'COPY',
    copyLink: () => {
      copyText(shareUrl);
      set((current) => ({ ...current, copied: true }));
      window.setTimeout(() => set((current) => ({ ...current, copied: false })), 1800);
    },
    doneHref: result && isEvent ? `/events/${result.slug}` : '/my-twende?tab=upcoming',
    doneCta: result && isEvent ? 'Open the event →' : 'See your offers →',
    canPostAnother: !editing,
    restart: () => set((current) => ({ ...current, step: 1, result: null, form: blankForm(data, 'event'), formError: null })),
  };
}
