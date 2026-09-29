// Provider verification: five sections that autosave, then one submit.

import { COLORS } from './shared';

const SECTIONS = [
  ['business', 'BUSINESS INFO'],
  ['identity', 'IDENTITY'],
  ['proof', 'BUSINESS PROOF'],
  ['phone', 'PHONE'],
  ['payout', 'PAYOUT'],
  ['review', 'REVIEW & SUBMIT'],
];
const SECTION_OF = {
  bizName: 'business', bizCat: 'business', bizCities: 'business', bizYears: 'business', bizDesc: 'business',
  idName: 'identity', idNumber: 'identity',
  proofRoute: 'proof', proofNum: 'proof', ref1: 'proof', ref2: 'proof',
  payoutMethod: 'payout', payoutNum: 'payout',
};
const PAYOUT_OPTIONS = [
  { title: 'MTN MoMo', desc: 'Uganda, Rwanda. Arrives on your phone.', chip: 'MOBILE MONEY' },
  { title: 'M-Pesa', desc: 'Kenya, Tanzania. Arrives on your phone.', chip: 'MOBILE MONEY' },
  { title: 'Bank account', desc: 'Any bank in the five countries we serve.', chip: 'BANK' },
];
const PORTFOLIO_MIN = 5;
const SAVE_DELAY_MS = 800;

// Pending autosaves, one timer per section, and the form as last rendered:
// a save that fires later sends what is on screen at that moment.
const timers = new Map();
const latest = { form: null };

export const initialState = { section: 'business', form: null, dirty: {}, saving: false, saveError: null, otpStage: 'idle', otpValue: '', otpError: null };

export function stateFrom(data) {
  const firstOpen = SECTIONS.find(([key]) => key !== 'review' && !data.done[key])?.[0] || 'review';
  return { form: { ...data.fields }, section: data.submitted ? 'review' : firstOpen, otpStage: data.fields.phoneVerified ? 'done' : 'idle' };
}

function fieldsFor(section, form) {
  return Object.fromEntries(Object.entries(SECTION_OF).filter(([, owner]) => owner === section).map(([key]) => [key, form[key] ?? '']));
}

export function values(state, set, ctx) {
  const { data, form } = state;
  latest.form = form;
  const applyState = (fresh) => set((current) => ({ ...current, data: { ...current.data, ...fresh, savedAt: new Date().toISOString() } }));

  const save = async (section) => {
    timers.delete(section);
    const fields = fieldsFor(section, latest.form);
    set((current) => ({ ...current, saving: true }));
    try {
      applyState(await ctx.api.patch('/api/verification', { section, fields }));
      set((current) => ({ ...current, saving: false, saveError: null, dirty: { ...current.dirty, [section]: false } }));
    } catch (error) {
      set((current) => ({ ...current, saving: false, saveError: error.message }));
    }
  };
  const schedule = (section) => {
    window.clearTimeout(timers.get(section));
    timers.set(section, window.setTimeout(() => save(section), SAVE_DELAY_MS));
  };
  const flush = () => {
    for (const [section, timer] of timers) {
      window.clearTimeout(timer);
      save(section);
    }
  };
  const setField = (key) => (event) => {
    const value = event.target.value;
    set((current) => ({ ...current, form: { ...current.form, [key]: value }, dirty: { ...current.dirty, [SECTION_OF[key]]: true } }));
    schedule(SECTION_OF[key]);
  };
  const choose = (key, value) => {
    set((current) => ({ ...current, form: { ...current.form, [key]: value } }));
    schedule(SECTION_OF[key]);
  };
  const go = (section) => {
    flush();
    set((current) => ({ ...current, section }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const upload = (kind, purpose) => (event) => {
    const input = event.target;
    const files = [...(input.files || [])];
    input.value = '';
    if (!files.length) return;
    if (files.some((file) => file.size > 4 * 1024 * 1024)) {
      ctx.toast('Files can be at most 4 MB each.', 'err');
      return;
    }
    ctx.run(`upload:${kind}`, async () => {
      let fresh;
      for (const file of files) {
        const { file: stored } = await ctx.api.upload(file, purpose);
        fresh = await ctx.api.post('/api/verification/documents', { kind, fileId: stored.id });
      }
      applyState(fresh);
    }, { reloadAfter: false, success: files.length > 1 ? `${files.length} photos added.` : 'Uploaded.' });
  };

  // Phone
  const sendOtp = () => {
    const phone = String(form.phone || '').trim();
    if (phone.replace(/\D/g, '').length < 7) return set((current) => ({ ...current, otpError: 'Enter your full number with the country code.' }));
    return ctx.run('otp', async () => {
      await ctx.api.post('/api/account/phone', { phone });
      set((current) => ({ ...current, otpStage: 'sent', otpError: null, otpValue: '' }));
    }, { reloadAfter: false });
  };
  const checkOtp = () => {
    const code = state.otpValue.trim();
    if (!/^\d{6}$/.test(code)) return set((current) => ({ ...current, otpError: 'Enter the 6-digit code from the text message.' }));
    return ctx.run('otp-check', async () => {
      try {
        await ctx.api.put('/api/account/phone', { phone: String(form.phone).trim(), code });
      } catch (error) {
        set((current) => ({ ...current, otpError: error.message }));
        return;
      }
      applyState(await ctx.api.get('/api/verification'));
      set((current) => ({ ...current, otpStage: 'done', otpError: null }));
    }, { reloadAfter: false, success: 'Phone verified.' });
  };

  const done = data.done;
  const doneCount = Object.values(done).filter(Boolean).length;
  const locked = data.submitted;
  const chip = (ok) => (ok ? { chip: '✓ DONE', chipColor: '#4a7c4a' } : { chip: 'TO DO', chipColor: COLORS.rust });
  const minutesAgo = data.savedAt ? Math.round((Date.now() - new Date(data.savedAt).getTime()) / 60_000) : null;
  const statusBanner = {
    SUBMITTED: 'In review. Your answers are locked until the trust team decides.',
    APPROVED: 'Verified ✓ Your badge is live, and your documents have been deleted.',
    NEEDS_INFO: 'The trust team asked for one more thing:',
    REJECTED: 'Not approved this time. Your documents were deleted; fix the note below and submit again with fresh uploads.',
  }[data.status];

  const reviewValue = {
    business: [form.bizName, form.bizCat, form.bizCities].filter(Boolean).join(' · ') || 'Not filled in',
    identity: [form.idName, data.fields.idUploaded ? 'ID uploaded' : 'ID not uploaded'].filter(Boolean).join(' · '),
    proof: form.proofRoute === 'informal' ? `${data.fields.portfolioCount} of ${PORTFOLIO_MIN} photos · ${[form.ref1, form.ref2].filter(Boolean).length} of 2 references` : `${data.fields.proofUploaded ? 'Document uploaded' : 'No document yet'}${form.proofNum ? ` · ${form.proofNum}` : ''}`,
    phone: data.fields.phoneVerified ? `${data.fields.phone} · verified` : 'Not verified yet',
    payout: form.payoutNum ? `${PAYOUT_OPTIONS[Number(form.payoutMethod) || 0].title} · •••• ${String(form.payoutNum).replace(/\D/g, '').slice(-4)}` : 'Not added yet',
  };

  return {
    me: data.me,
    saveStamp: state.saving ? 'SAVING…' : state.saveError ? `NOT SAVED YET — ${state.saveError.toUpperCase()}` : minutesAgo == null ? '' : minutesAgo < 1 ? '● SAVED JUST NOW' : `● SAVED ${minutesAgo} MIN AGO`,
    pct: `${Math.round((doneCount / 5) * 100)}%`,
    statusBanner: statusBanner || '',
    reviewNote: ['NEEDS_INFO', 'REJECTED'].includes(data.status) ? data.reviewNote : '',
    statusBg: data.status === 'APPROVED' ? '#DCE8D9' : data.status === 'REJECTED' ? '#F2C9C2' : '#FBEED8',
    statusFg: COLORS.ink,
    navItems: SECTIONS.map(([key, label]) => {
      const active = state.section === key;
      const status = key === 'review' ? { chip: data.submitted ? 'SENT' : `${doneCount}/5`, chipColor: COLORS.rust } : chip(done[key]);
      return { label, ...status, current: active ? 'step' : 'false', bg: active ? COLORS.forest : 'transparent', fg: active ? COLORS.cream : COLORS.ink, chipColor: active ? COLORS.clayLight : status.chipColor, go: () => go(key) };
    }),
    isBusiness: state.section === 'business',
    isIdentity: state.section === 'identity',
    isProof: state.section === 'proof',
    isPhone: state.section === 'phone',
    isPayout: state.section === 'payout',
    isReview: state.section === 'review',
    goIdentity: () => go('identity'),
    goProof: () => go('proof'),
    goPhone: () => go('phone'),
    goPayout: () => go('payout'),
    goReview: () => go('review'),

    categories: data.categories,
    fBizName: form.bizName, setBizName: setField('bizName'),
    fBizCat: form.bizCat, setBizCat: setField('bizCat'),
    fBizCities: form.bizCities, setBizCities: setField('bizCities'),
    fBizYears: form.bizYears, setBizYears: setField('bizYears'),
    fBizDesc: form.bizDesc, setBizDesc: setField('bizDesc'),

    fIdName: form.idName, setIdName: setField('idName'),
    fIdNumber: form.idNumber, setIdNumber: setField('idNumber'),
    idBtnLabel: data.fields.idUploaded ? '✓ ID UPLOADED · REPLACE' : '⇪ UPLOAD YOUR ID',
    idBtnBg: data.fields.idUploaded ? '#DCE8D9' : COLORS.paper,
    uploadId: upload('id', 'KYC_ID'),

    isFormalRoute: form.proofRoute !== 'informal',
    isInformalRoute: form.proofRoute === 'informal',
    pickFormal: () => choose('proofRoute', 'formal'),
    pickInformal: () => choose('proofRoute', 'informal'),
    formalBg: form.proofRoute !== 'informal' ? COLORS.forest : COLORS.paper,
    formalFg: form.proofRoute !== 'informal' ? COLORS.cream : COLORS.ink,
    informalBg: form.proofRoute === 'informal' ? COLORS.forest : COLORS.paper,
    informalFg: form.proofRoute === 'informal' ? COLORS.cream : COLORS.ink,
    proofBtnLabel: data.fields.proofUploaded ? '✓ DOCUMENT UPLOADED · REPLACE' : '⇪ UPLOAD THE DOCUMENT',
    proofBtnBg: data.fields.proofUploaded ? '#DCE8D9' : COLORS.paper,
    uploadProof: upload('proof', 'KYC_PROOF'),
    fProofNum: form.proofNum, setProofNum: setField('proofNum'),
    portBtnLabel: data.fields.portfolioCount >= PORTFOLIO_MIN
      ? `✓ ${data.fields.portfolioCount} PHOTOS UPLOADED · ADD MORE`
      : `⇪ UPLOAD PHOTOS OF PAST WORK (${data.fields.portfolioCount} OF ${PORTFOLIO_MIN})`,
    portBtnBg: data.fields.portfolioCount >= PORTFOLIO_MIN ? '#DCE8D9' : COLORS.paper,
    uploadPortfolio: upload('portfolio', 'KYC_PORTFOLIO'),
    fRef1: form.ref1, setRef1: setField('ref1'),
    fRef2: form.ref2, setRef2: setField('ref2'),

    fPhone: form.phone,
    setPhone: (event) => set((current) => ({ ...current, form: { ...current.form, phone: event.target.value }, otpError: null })),
    otpIdle: state.otpStage === 'idle',
    otpSent: state.otpStage === 'sent',
    otpDone: state.otpStage === 'done',
    otpValue: state.otpValue,
    setOtp: (event) => set((current) => ({ ...current, otpValue: event.target.value, otpError: null })),
    otpError: state.otpError,
    sendOtp,
    checkOtp,
    resendOtp: () => set((current) => ({ ...current, otpStage: 'idle', otpValue: '', otpError: null })),

    payoutOpts: PAYOUT_OPTIONS.map((option, index) => {
      const selected = Number(form.payoutMethod || 0) === index;
      return { ...option, selected, bg: selected ? COLORS.forest : COLORS.paper, fg: selected ? COLORS.cream : COLORS.ink, pick: () => choose('payoutMethod', index) };
    }),
    fPayoutNum: form.payoutNum, setPayoutNum: setField('payoutNum'),

    reviewRows: SECTIONS.filter(([key]) => key !== 'review').map(([key, label]) => ({ label, value: reviewValue[key], ...chip(done[key]), go: () => go(key) })),
    submitted: data.submitted,
    submitting: Boolean(state.busy?.submit),
    submitLabel: data.status === 'APPROVED' ? '✓ Verified' : data.submitted ? '✓ Submitted — in review' : doneCount === 5 ? 'Submit for review →' : `${5 - doneCount} section${5 - doneCount === 1 ? '' : 's'} left before you can submit`,
    submitBg: doneCount === 5 && !locked ? COLORS.clay : COLORS.sand,
    submitFg: doneCount === 5 && !locked ? COLORS.cream : COLORS.forest,
    submit: () => {
      if (locked) return;
      if (doneCount < 5) {
        const next = SECTIONS.find(([key]) => key !== 'review' && !done[key]);
        ctx.toast(`Finish ${next[1].toLowerCase()} first.`, 'err');
        go(next[0]);
        return;
      }
      ctx.run('submit', async () => applyState(await ctx.api.post('/api/verification')), { reloadAfter: false, success: 'Submitted. You will hear from the trust team here and by email.' });
    },
  };
}
