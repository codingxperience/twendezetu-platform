// Refunds and disputes: open a case on a purchase, follow its timeline, and
// answer cases opened against you. Money only moves on the server.

import { COLORS, field, selected } from './shared';

const MAX_FILE_BYTES = 4 * 1024 * 1024;

const TIMELINE = {
  opened: { mark: '1', title: 'Case opened · money frozen' },
  contested: { mark: '!', title: 'Contested' },
  escalated: { mark: '→', title: 'Sent to the resolution team' },
  resolved: { mark: '✓', title: 'Closed' },
  withdrawn: { mark: '×', title: 'Withdrawn' },
};

export const initialState = { pick: null, reason: null, detail: '', files: [], note: '', noteFiles: [], formError: null };

export function stateFrom(data) {
  return { pick: data.picked };
}

// Uploads one picked file as dispute evidence and appends it to a list.
function attacher(ctx, set, key) {
  return (event) => {
    const input = event.target;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    if (file.size > MAX_FILE_BYTES) {
      ctx.toast('Files can be at most 4 MB.', 'err');
      return;
    }
    ctx.run(`upload:${key}`, async () => {
      const uploaded = await ctx.api.upload(file, 'DISPUTE_EVIDENCE');
      set((state) => ({ ...state, [key]: [...state[key], { id: uploaded.file.id, name: file.name }].slice(0, 10) }));
    }, { reloadAfter: false });
  };
}

function fileChips(set, key, files) {
  return files.map((file) => ({
    name: file.name,
    remove: () => set((state) => ({ ...state, [key]: state[key].filter((item) => item.id !== file.id) })),
  }));
}

function caseTimeline(item, responseHours) {
  const rows = item.timeline.map((event) => {
    if (event.kind.startsWith('note.')) {
      const yours = (event.kind === 'note.opener') === item.mine;
      return { mark: '✎', title: yours ? 'Your note' : 'Note from the other party', desc: event.note, when: event.when, done: true };
    }
    const known = TIMELINE[event.kind] || { mark: '·', title: event.kind };
    return { ...known, desc: event.note, when: event.when, done: true };
  });
  if (item.status === 'OPEN') {
    rows.push({
      mark: '…',
      title: item.mine ? 'Waiting for the other party' : 'Your answer is due',
      desc: `${item.respondIn} hour${item.respondIn === 1 ? '' : 's'} left of ${responseHours}. With no answer, the case goes to the resolution team.`,
      when: '',
      done: false,
    });
  }
  if (item.status === 'ESCALATED') {
    rows.push({ mark: '…', title: 'Resolution team reviewing', desc: 'They read both sides and the evidence, then decide. Their decision moves the money.', when: '', done: false });
  }
  return rows.map((row) => ({
    ...row,
    bg: row.done ? COLORS.forest : COLORS.paper,
    fg: row.done ? COLORS.cream : COLORS.rust,
    titleColor: row.done ? COLORS.ink : COLORS.rust,
    hasWhen: Boolean(row.when),
  }));
}

export function values(state, set, ctx) {
  const { data } = state;
  const active = data.cases.find((item) => item.reference === data.activeCase) || null;

  // ── New case ──────────────────────────────────────────────────────────
  const purchase = data.purchases.find((item) => `${item.kind}:${item.id}` === state.pick) || null;
  const ready = Boolean(purchase && state.reason && state.detail.trim().length >= 10);

  const submit = () => {
    if (!purchase) return set((current) => ({ ...current, formError: 'Choose the purchase this is about.' }));
    if (!state.reason) return set((current) => ({ ...current, formError: 'Pick what happened.' }));
    if (state.detail.trim().length < 10) return set((current) => ({ ...current, formError: 'Add a short description: the other side needs context to answer.' }));
    return ctx.run('open', async () => {
      const result = await ctx.api.post('/api/disputes', {
        [purchase.kind === 'order' ? 'orderId' : 'bookingId']: purchase.id,
        reason: state.reason,
        detail: state.detail.trim(),
        evidenceFileIds: state.files.map((file) => file.id),
      }, { idempotent: true });
      set((current) => ({ ...current, pick: null, reason: null, detail: '', files: [] }));
      ctx.navigate(`/disputes?case=${result.dispute.reference}`);
      return result;
    }, { reloadAfter: false, success: (result) => `Case ${result.dispute.reference} is open.` });
  };

  // ── Existing case ─────────────────────────────────────────────────────
  const act = (key, body, success) => ctx.run(key, () => ctx.api.post(`/api/disputes/${active.id}`, body, { idempotent: true }), { success });

  const refundFull = async () => {
    const sure = await ctx.ask({
      title: `Refund ${active.amount}?`,
      body: 'The full amount goes back to the buyer and the case closes. Points refunds arrive at once; card refunds take the bank 3–5 days.',
      input: false,
      confirmLabel: 'Refund in full',
    });
    if (sure) act('respond', { action: 'refund' }, 'Refunded. The case is closed.');
  };

  const refundPart = async () => {
    const amount = await ctx.ask({
      title: 'Refund part of it',
      body: `Up to ${active.amount}. The rest is paid to you as normal and the case closes.`,
      placeholder: `Amount in ${active.currency}`,
      inputMode: 'decimal',
      confirmLabel: 'Refund this amount',
    });
    if (amount) act('respond', { action: 'partial', amount }, 'Partial refund sent. The case is closed.');
  };

  const contest = async () => {
    const note = await ctx.ask({
      title: 'Contest this case',
      body: 'Say what happened from your side. The resolution team reads both sides and the evidence before deciding.',
      maxLength: 1000,
      confirmLabel: 'Send to the resolution team',
    });
    if (note) act('respond', { action: 'contest', note }, 'Sent to the resolution team.');
  };

  const withdraw = async () => {
    const sure = await ctx.ask({
      title: 'Withdraw this case?',
      body: 'The money is unfrozen and goes where it was going. You can open a new case on this purchase later if you need to.',
      input: false,
      confirmLabel: 'Withdraw case',
      danger: true,
    });
    if (sure) act('withdraw', { action: 'withdraw' }, 'Case withdrawn.');
  };

  const sendNote = () => {
    if (!state.note.trim() && !state.noteFiles.length) return ctx.toast('Write a note or attach a file.', 'err');
    return ctx.run('note', async () => {
      await ctx.api.post(`/api/disputes/${active.id}`, { action: 'note', note: state.note.trim() || undefined, fileIds: state.noteFiles.map((file) => file.id) }, { idempotent: true });
      set((current) => ({ ...current, note: '', noteFiles: [] }));
    }, { success: 'Added to the case.' });
  };

  const heading = !active
    ? ''
    : active.status === 'OPEN'
      ? active.mine ? 'Case opened. Money frozen' : 'A case needs your answer'
      : active.status === 'ESCALATED'
        ? 'With the resolution team'
        : active.statusLabel;

  return {
    me: data.me,
    responseHours: data.responseHours,

    creating: !active,
    viewing: Boolean(active),

    purchases: data.purchases.map((item) => {
      const tone = selected(`${item.kind}:${item.id}` === state.pick);
      return { ...item, bg: tone.bg, fg: tone.fg, pick: () => set((current) => ({ ...current, pick: `${item.kind}:${item.id}`, formError: null })) };
    }),
    noPurchases: data.purchases.length === 0,
    reasons: data.reasons.map((reason) => {
      const on = reason.key === state.reason;
      const tone = selected(on);
      return { ...reason, on, bg: tone.bg, fg: tone.fg, pick: () => set((current) => ({ ...current, reason: reason.key, formError: null })) };
    }),
    detail: state.detail,
    setDetail: field(set, 'detail'),
    detailCount: `${state.detail.length}/2000`,
    attachEvidence: attacher(ctx, set, 'files'),
    files: fileChips(set, 'files', state.files),
    hasFiles: state.files.length > 0,
    uploading: Boolean(state.busy?.['upload:files']),
    submit,
    submitBg: ready ? COLORS.clay : COLORS.sand,
    submitLabel: state.busy?.open ? 'Opening…' : 'Open case & freeze the money',
    formError: state.formError,

    caseRef: active?.reference || '',
    caseStatus: active?.statusLabel || '',
    heading,
    subject: active?.subject || '',
    reason: active?.reason || '',
    amount: active?.amount || '',
    refunded: active?.refunded || '',
    wasRefunded: Boolean(active?.refunded),
    caseDetail: active?.detail || '',
    detailBy: active?.mine ? 'What you told them' : 'What the buyer told you',
    evidence: active?.evidence.map((item) => ({ ...item, by: (item.side === 'opener') === active.mine ? 'YOURS' : 'THEIRS' })) || [],
    hasEvidence: Boolean(active?.evidence.length),
    timeline: active ? caseTimeline(active, data.responseHours) : [],

    canRespond: Boolean(active?.canRespond),
    refundFullLabel: active ? `Refund ${active.amount}` : '',
    refundFull,
    refundPart,
    contest,
    canWithdraw: Boolean(active?.canWithdraw),
    withdraw,
    canNote: Boolean(active?.canNote),
    note: state.note,
    setNote: field(set, 'note'),
    attachNote: attacher(ctx, set, 'noteFiles'),
    noteFiles: fileChips(set, 'noteFiles', state.noteFiles),
    hasNoteFiles: state.noteFiles.length > 0,
    sendNote,
    noteLabel: state.busy?.note ? 'Adding…' : 'Add to case',

    cases: data.cases.map((item) => ({
      href: `/disputes?case=${item.reference}`,
      reference: item.reference,
      subject: item.subject,
      status: item.statusLabel,
      amount: item.amount,
      side: item.mine ? 'YOU OPENED' : 'AGAINST YOU',
      bg: item.reference === data.activeCase ? COLORS.sand : COLORS.paper,
      statusColor: item.live ? (item.canRespond ? COLORS.red : COLORS.rust) : COLORS.muted,
    })),
    hasCases: data.cases.length > 0,
  };
}
