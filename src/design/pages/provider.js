// A provider's public page, in either layout: request a quote (with or
// without an account), ask a question, follow, share, and review a job that
// was booked and completed here.

import { stars } from '@/shared/format';
import { COLORS, EMAIL_PATTERN, copyText, sentence, shareLinks, shellValues } from './shared';

const CARD_WIDTH = 318; // card + gap in the "more vendors" row

export const initialState = {
  galleryIndex: 0,
  dirIndex: 0,
  reqOpen: false,
  reqDone: false,
  reqThreadId: null,
  reqDate: '',
  reqMsg: '',
  reqName: '',
  reqEmail: '',
  reqError: null,
  askOpen: false,
  question: '',
  writeOpen: false,
  rating: 5,
  draft: '',
  jobId: null,
  reviewError: null,
  copied: false,
};

export function stateFrom(data) {
  return { jobId: data.reviewable[0]?.id || null, following: data.following };
}

export function onMount(ctx) {
  ctx.api.post(`/api/providers/${ctx.params.slug}/track`).catch(() => {});
}

export function values(state, set, ctx) {
  const { data } = state;
  const field = (key) => (event) => set((current) => ({ ...current, [key]: event.target.value, reqError: null, reviewError: null }));
  const signedIn = data.me.signedIn;
  const firstName = data.name.split(/[\s&]/)[0];
  const links = shareLinks(data.shareUrl, `${data.name} — ${data.category} in ${data.city}, on Twendezetu.`, data.name);
  const ratingValue = data.ratingCount ? Number(data.card.rating) : 0;

  const sendReq = () => {
    const text = [state.reqDate ? `For ${new Date(`${state.reqDate}T12:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })}.` : null, state.reqMsg.trim()].filter(Boolean).join(' ');
    if (state.reqMsg.trim().length < 5) return set((current) => ({ ...current, reqError: 'Say what you need: the job, the place, the dates.' }));
    if (!signedIn && !state.reqName.trim()) return set((current) => ({ ...current, reqError: 'Add your name.' }));
    if (!signedIn && !EMAIL_PATTERN.test(state.reqEmail.trim())) return set((current) => ({ ...current, reqError: 'That email does not look right — replies go there.' }));
    return ctx.run('request', async () => {
      const result = await ctx.api.post(`/api/providers/${data.slug}/requests`, {
        message: text,
        ...(signedIn ? {} : { name: state.reqName.trim(), email: state.reqEmail.trim() }),
      });
      set((current) => ({ ...current, reqDone: true, reqThreadId: result.threadId }));
      return result;
    }, { reloadAfter: false });
  };

  const sendAsk = () => {
    const question = state.question.trim();
    if (question.length < 2) return ctx.toast('Type your question first.', 'err');
    return ctx.run('ask', async () => {
      const { threadId } = await ctx.api.post(`/api/providers/${data.slug}/questions`, { question });
      window.location.assign(`/messages?thread=${threadId}`);
    }, { reloadAfter: false });
  };

  const submitReview = () => {
    const body = state.draft.trim();
    if (body.length < 10) return set((current) => ({ ...current, reviewError: 'A sentence or two, please: at least 10 characters.' }));
    return ctx.run('review', async () => {
      await ctx.api.post(`/api/providers/${data.slug}/reviews`, { rating: state.rating, body, bookingId: state.jobId || undefined });
      set((current) => ({ ...current, writeOpen: false, draft: '' }));
    }, { success: 'Thank you! Your review is live.' });
  };

  const gallery = data.gallery;
  const galleryIndex = state.galleryIndex % gallery.length;
  const similarCount = data.similar.length;
  const visible = 3;
  const maxDir = Math.max(0, similarCount - visible);

  const reviewing = data.reviewable.find((job) => job.id === state.jobId) || data.reviewable[0];
  const following = Boolean(state.following);

  return {
    shell: shellValues(state.data.me, ctx, { active: 'vendors' }),
    me: data.me,
    accountHref: data.me.accountHref,
    accountLabel: signedIn ? 'MY TWENDE →' : 'SIGN IN →',
    accountLabelPlain: signedIn ? 'My Twende' : 'Sign in',
    orientation: data.isOwner
      ? '▣ YOUR LISTING — this is exactly what customers see.'
      : '▣ PUBLIC LISTING — anyone can view it or request a quote without an account.',
    orientationLink: data.isOwner ? 'Edit it in your dashboard →' : 'Vendor? Manage yours in the dashboard →',

    name: data.name,
    nameUpper: data.name.toUpperCase(),
    footerName: data.name.length > 14 ? firstName.toUpperCase() : data.name.toUpperCase(),
    headline: data.headline,
    description: data.description,
    category: data.category,
    categoryHref: `/vendors?category=${data.categoryCode}`,
    place: data.place,
    city: data.place,
    areasLabel: data.areasLabel,
    img: data.img,
    isVerified: data.verified,
    memberChip: `MEMBER SINCE ${data.since}${data.verified ? ' · ID VERIFIED ✓' : ''}`,
    ratingChip: data.ratingCount ? `★ ${data.card.rating} · ${data.card.jobs} JOBS` : `NEW · ${data.card.jobs} JOBS`,
    rating: data.card.rating,
    jobs: data.card.jobs,
    rate: data.card.rate === 'QUOTE' ? '' : data.card.rate,
    rateOrAsk: data.card.rate === 'QUOTE' ? 'Priced per job' : data.card.rate,
    response: data.response,

    canFollow: !data.isOwner,
    following,
    followLabel: following ? '✓ FOLLOWING' : '+ FOLLOW',
    followBg: following ? COLORS.forest : COLORS.paper,
    followFg: following ? COLORS.cream : COLORS.ink,
    toggleFollow: () => {
      if (!signedIn) {
        window.location.assign(`/sign-in?next=${encodeURIComponent(`/vendors/${data.slug}`)}`);
        return;
      }
      ctx.run('follow', async () => {
        const result = await ctx.api.post(`/api/providers/${data.slug}/follow`);
        set((current) => ({ ...current, following: result.following }));
        return result;
      }, { reloadAfter: false, success: (result) => (result.following ? sentence(`Following ${data.name}. Their news shows in My Twende`) : sentence(`Unfollowed ${data.name}`)) });
    },

    galleryImg: gallery[galleryIndex].url,
    galleryAlt: gallery[galleryIndex].alt || data.name,
    galleryMany: gallery.length > 1,
    galleryCount: `${galleryIndex + 1} / ${gallery.length}`,
    galleryPrev: () => set((current) => ({ ...current, galleryIndex: (current.galleryIndex - 1 + gallery.length) % gallery.length })),
    galleryNext: () => set((current) => ({ ...current, galleryIndex: (current.galleryIndex + 1) % gallery.length })),
    galleryDots: gallery.map((item, index) => ({
      bg: index === galleryIndex ? COLORS.clay : 'transparent',
      label: `Photo ${index + 1} of ${gallery.length}`,
      go: () => set((current) => ({ ...current, galleryIndex: index })),
    })),

    services: data.services,
    hasServices: data.services.length > 0,
    feeNote: `Guide rates. Final quotes come as offers or in your conversation. You pay the quoted price; the ${data.commissionPercent} platform fee comes out of the vendor's side, and only when a booking is paid through Twendezetu.`,

    avgRating: data.ratingCount ? data.card.rating : '—',
    avgStars: stars(ratingValue),
    reviewCountLabel: data.ratingCount === 1 ? '1 review' : `${data.ratingCount} reviews`,
    breakdown: data.breakdown,
    reviews: data.reviews,
    noReviews: data.reviews.length === 0,
    canReview: data.reviewable.length > 0,
    writeOpen: state.writeOpen,
    writeLabel: state.writeOpen ? 'CLOSE' : '✎ REVIEW YOUR BOOKING',
    writeBg: state.writeOpen ? COLORS.forest : COLORS.paper,
    writeFg: state.writeOpen ? COLORS.cream : COLORS.ink,
    toggleWrite: () => set((current) => ({ ...current, writeOpen: !current.writeOpen, reviewError: null })),
    reviewBecause: reviewing ? `your booking "${reviewing.label}" is complete` : '',
    starPicker: [1, 2, 3, 4, 5].map((value) => ({
      color: value <= state.rating ? COLORS.clayLight : 'rgba(247,241,230,0.3)',
      label: `${value} star${value === 1 ? '' : 's'}`,
      pick: () => set((current) => ({ ...current, rating: value })),
    })),
    manyJobs: data.reviewable.length > 1,
    reviewJobs: data.reviewable,
    jobId: state.jobId || '',
    setJob: field('jobId'),
    draft: state.draft,
    setDraft: field('draft'),
    submitReview,
    postingReview: Boolean(state.busy?.review),
    reviewError: state.reviewError,

    // Request a quote
    reqOpen: state.reqOpen,
    toggleReq: () => set((current) => ({ ...current, reqOpen: !current.reqOpen })),
    reqBtnLabel: state.reqOpen && !state.reqDone ? 'Close' : 'Request a quote',
    reqBg: state.reqOpen ? COLORS.forest : COLORS.clay,
    reqFg: COLORS.cream,
    reqDone: state.reqDone,
    reqNotDone: !state.reqDone,
    reqDoneNote: signedIn
      ? `${firstName} has it, and the conversation is in your Messages. Your contacts stay hidden.`
      : `${firstName} has it. Replies come to ${state.reqEmail.trim() || 'your email'}, and your address stays hidden from them. The email has a link to continue in Twendezetu.`,
    reqDate: state.reqDate,
    setReqDate: field('reqDate'),
    reqMsg: state.reqMsg,
    setReqMsg: field('reqMsg'),
    reqPlaceholder: `What do you need? The job, the place, your budget.`,
    reqName: state.reqName,
    setReqName: field('reqName'),
    reqEmail: state.reqEmail,
    setReqEmail: field('reqEmail'),
    reqError: state.reqError,
    sendReq,
    sendingReq: Boolean(state.busy?.request),

    // Ask a question
    askOpen: state.askOpen,
    askBg: state.askOpen ? COLORS.sand : COLORS.paper,
    toggleAsk: () => set((current) => ({ ...current, askOpen: !current.askOpen })),
    question: state.question,
    setQuestion: field('question'),
    askPlaceholder: `e.g. Are you free on the 12th, and does the price include travel?`,
    sendAsk,

    shareUrl: data.shareUrl,
    ...links,
    copyLabel: state.copied ? '✓ COPIED' : 'COPY',
    copyLink: () => {
      copyText(data.shareUrl);
      set((current) => ({ ...current, copied: true }));
      window.setTimeout(() => set((current) => ({ ...current, copied: false })), 1800);
    },
    shareWa: () => window.open(links.waHref, '_blank', 'noopener'),
    shareFb: () => window.open(links.fbHref, '_blank', 'noopener'),
    shareX: () => window.open(links.xHref, '_blank', 'noopener'),

    trustTitle: data.verified ? '[Verified member]' : '[Listed member]',
    trustText: data.verified
      ? `ID checked by the Twendezetu team${data.membershipEndsOn ? ` · membership active until ${data.membershipEndsOn}` : ''}. Payments are protected when you book through the platform.`
      : `Listed${data.membershipEndsOn ? ` until ${data.membershipEndsOn}` : ''}, not yet ID-verified. Payments are still protected when you book through the platform.`,

    similar: data.similar,
    directory: data.similar,
    dirOffset: `-${state.dirIndex * CARD_WIDTH}px`,
    dirPrev: () => set((current) => ({ ...current, dirIndex: Math.max(0, current.dirIndex - 1) })),
    dirNext: () => set((current) => ({ ...current, dirIndex: Math.min(maxDir, current.dirIndex + 1) })),
  };
}
