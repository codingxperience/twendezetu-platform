// Provider verification: a five-part application (business, identity,
// business proof, phone, payout) that autosaves as the provider types and is
// reviewed by the trust team. ID and account numbers are encrypted at rest;
// reviewers see only masked values.

import { prisma, transaction } from '../db.js';
import { audit } from '../audit.js';
import { badRequest, conflict, forbidden, invalid, notFound } from '../errors.js';
import { decrypt, encrypt, lastDigits } from '../security/crypto.js';
import { notify } from '../notify/index.js';
import { COUNTRIES, PROVIDER_CATEGORIES, providerCategoryFromLabel, relativeTime } from '../../shared/format.js';
import { saveListing } from './providers.js';
import { maskPhone } from './identity.js';
import { deleteFiles } from '../storage.js';
import { log } from '../log.js';

const PAYOUT_LABELS = { MTN_MOMO: 'MTN MoMo', MPESA: 'M-Pesa', BANK: 'Bank account', AIRTEL_MONEY: 'Airtel Money' };

async function applicationFor(user, { create = false } = {}) {
  const provider = await prisma.provider.findUnique({ where: { ownerId: user.id }, include: { verification: true } });
  if (!provider) return { provider: null, application: null };
  if (provider.verification) return { provider, application: provider.verification };
  if (!create) return { provider, application: null };
  const application = await prisma.verificationApplication.create({
    data: { providerId: provider.id, businessName: provider.name, category: provider.category, cities: [provider.city, ...provider.serviceAreas].join(', ') },
  });
  return { provider, application };
}

export function completeness(app, user) {
  if (!app) return { business: false, identity: false, proof: false, phone: false, payout: false };
  return {
    business: Boolean(app.businessName && app.cities && app.description),
    identity: Boolean(app.idName && app.idNumberEnc && app.idFileId),
    proof: app.proofRoute === 'FORMAL'
      ? Boolean(app.proofFileId && app.proofNumber)
      : Boolean(app.portfolioFileIds?.length >= 5 && app.referenceOne && app.referenceTwo),
    phone: Boolean(app.phoneVerifiedAt || user?.phoneVerifiedAt),
    payout: Boolean(app.payoutAccountEnc),
  };
}

export async function verificationState(user) {
  const { provider, application } = await applicationFor(user);
  const account = await prisma.user.findUnique({ where: { id: user.id }, select: { phone: true, phoneVerifiedAt: true, country: true } });
  const app = application;
  // After approval the documents are gone by design; the sections stay done.
  const done = app?.status === 'APPROVED' ? { business: true, identity: true, proof: true, phone: true, payout: true } : completeness(app, account);
  return {
    hasProvider: Boolean(provider),
    status: app?.status || 'DRAFT',
    submitted: ['SUBMITTED', 'APPROVED'].includes(app?.status),
    reviewNote: app?.reviewNote || null,
    savedAt: app?.updatedAt || null,
    done,
    fields: {
      bizName: app?.businessName || provider?.name || '',
      bizCat: app?.category ? PROVIDER_CATEGORIES[app.category].label : provider ? PROVIDER_CATEGORIES[provider.category].label : 'Transport & drivers',
      bizCities: app?.cities || '',
      bizYears: app?.yearsActive != null ? String(app.yearsActive) : '',
      bizDesc: app?.description || '',
      idName: app?.idName || '',
      idNumber: app?.idNumberEnc ? `•••• ${lastDigits(decrypt(app.idNumberEnc), 4) || '••••'}` : '',
      idUploaded: Boolean(app?.idFileId),
      proofRoute: app?.proofRoute === 'PORTFOLIO' ? 'informal' : 'formal',
      proofUploaded: Boolean(app?.proofFileId),
      proofNum: app?.proofNumber || '',
      portfolioCount: app?.portfolioFileIds?.length || 0,
      ref1: app?.referenceOne || '',
      ref2: app?.referenceTwo || '',
      phone: account.phoneVerifiedAt ? maskPhone(account.phone) : account.phone || '',
      phoneVerified: Boolean(account.phoneVerifiedAt),
      payoutMethod: app?.payoutKind ? ['MTN_MOMO', 'MPESA', 'BANK'].indexOf(app.payoutKind) : 0,
      payoutNum: app?.payoutLast4 ? `•••• ${app.payoutLast4}` : '',
    },
  };
}

// Saves one section. The business section also creates the provider listing
// (as a draft) the first time, so everything else has somewhere to hang.
export async function saveSection(user, section, input) {
  if (section === 'business') {
    const category = providerCategoryFromLabel(input.bizCat) || input.category;
    if (!category) throw invalid('Choose your service category.');
    const cities = String(input.bizCities || '').split(',').map((city) => city.trim()).filter(Boolean);
    if (!cities.length) throw invalid('List at least one city you serve.');
    const account = await prisma.user.findUnique({ where: { id: user.id }, select: { country: true } });
    const country = input.country || account.country || 'UG';
    if (!COUNTRIES[country]) throw invalid('Choose a supported country.');
    // The application's description seeds a brand-new listing; an existing
    // listing keeps the headline and description its owner wrote for customers.
    const listed = await prisma.provider.findUnique({ where: { ownerId: user.id }, select: { id: true } });
    const listing = await saveListing(user, {
      name: input.bizName,
      category,
      city: cities[0],
      country,
      serviceAreas: cities.slice(1),
      yearsActive: input.bizYears ? Number.parseInt(input.bizYears, 10) || null : null,
      ...(listed ? {} : { headline: String(input.bizDesc || '').split(/(?<=[.!?])\s/)[0]?.slice(0, 140), description: input.bizDesc }),
    });
    await prisma.verificationApplication.upsert({
      where: { providerId: listing.id },
      create: { providerId: listing.id, businessName: input.bizName, category, cities: cities.join(', '), yearsActive: input.bizYears ? Number.parseInt(input.bizYears, 10) || null : null, description: input.bizDesc },
      update: { businessName: input.bizName, category, cities: cities.join(', '), yearsActive: input.bizYears ? Number.parseInt(input.bizYears, 10) || null : null, description: input.bizDesc },
    });
    return verificationState(user);
  }

  const { application } = await applicationFor(user, { create: true });
  if (!application) throw badRequest('Start with your business details.');
  if (['SUBMITTED', 'APPROVED'].includes(application.status)) throw conflict('Your application is locked while it is being reviewed.', 'locked');

  const data = {};
  if (section === 'identity') {
    if (input.idName !== undefined) data.idName = String(input.idName).trim().slice(0, 120) || null;
    if (input.idNumber !== undefined && !String(input.idNumber).startsWith('••••')) {
      const number = String(input.idNumber).replace(/\s+/g, '').slice(0, 40);
      data.idNumberEnc = number ? encrypt(number) : null;
    }
  } else if (section === 'proof') {
    if (input.proofRoute) data.proofRoute = input.proofRoute === 'informal' ? 'PORTFOLIO' : 'FORMAL';
    if (input.proofNum !== undefined) data.proofNumber = String(input.proofNum).trim().slice(0, 60) || null;
    if (input.ref1 !== undefined) data.referenceOne = String(input.ref1).trim().slice(0, 160) || null;
    if (input.ref2 !== undefined) data.referenceTwo = String(input.ref2).trim().slice(0, 160) || null;
  } else if (section === 'payout') {
    const kinds = ['MTN_MOMO', 'MPESA', 'BANK'];
    if (input.payoutMethod !== undefined) data.payoutKind = kinds[Number(input.payoutMethod)] || 'MTN_MOMO';
    if (input.payoutNum !== undefined && !String(input.payoutNum).startsWith('••••')) {
      const number = String(input.payoutNum).replace(/[^\d+]/g, '');
      if (number && number.replace(/\D/g, '').length < 6) throw invalid('That account or wallet number looks too short.');
      data.payoutAccountEnc = number ? encrypt(number) : null;
      data.payoutLast4 = number ? lastDigits(number) : null;
    }
  } else {
    throw badRequest('Unknown section.');
  }

  await prisma.verificationApplication.update({ where: { id: application.id }, data });
  return verificationState(user);
}

const DOCUMENT_PURPOSE = { id: 'KYC_ID', proof: 'KYC_PROOF', portfolio: 'KYC_PORTFOLIO' };

export async function attachDocument(user, kind, fileId) {
  const { application } = await applicationFor(user, { create: true });
  if (!application) throw badRequest('Start with your business details.');
  if (['SUBMITTED', 'APPROVED'].includes(application.status)) throw conflict('Your application is locked while it is being reviewed.', 'locked');
  const file = await prisma.fileObject.findUnique({ where: { id: fileId } });
  if (!file || file.ownerId !== user.id || file.purpose !== DOCUMENT_PURPOSE[kind]) throw forbidden('That upload is not available.');

  const data = kind === 'id'
    ? { idFileId: file.id }
    : kind === 'proof'
      ? { proofFileId: file.id }
      : { portfolioFileIds: { set: [...new Set([...application.portfolioFileIds, file.id])].slice(-20) } };
  await prisma.verificationApplication.update({ where: { id: application.id }, data });
  return verificationState(user);
}

export async function submitApplication(user) {
  const { provider, application } = await applicationFor(user);
  if (!application) throw badRequest('Start with your business details.');
  if (application.status === 'SUBMITTED') return verificationState(user);
  if (application.status === 'APPROVED') throw conflict('You are already verified.', 'verified');
  const account = await prisma.user.findUnique({ where: { id: user.id }, select: { phoneVerifiedAt: true, phone: true } });
  const done = completeness(application, account);
  const missing = Object.entries(done).filter(([, ok]) => !ok).map(([section]) => section);
  if (missing.length) throw invalid(`${missing.length} section${missing.length === 1 ? '' : 's'} still incomplete: ${missing.join(', ')}.`);

  await transaction(async (tx) => {
    await tx.verificationApplication.update({
      where: { id: application.id },
      data: { status: 'SUBMITTED', submittedAt: new Date(), phone: account.phone, phoneVerifiedAt: account.phoneVerifiedAt, reviewNote: null },
    });

    // The verified payout destination becomes a saved payout method.
    const existing = await tx.paymentMethod.findFirst({ where: { userId: user.id, kind: application.payoutKind, last4: application.payoutLast4, deletedAt: null } });
    if (!existing && application.payoutKind) {
      await tx.paymentMethod.create({
        data: {
          userId: user.id,
          kind: application.payoutKind,
          label: `${PAYOUT_LABELS[application.payoutKind]} ••${application.payoutLast4}`,
          last4: application.payoutLast4,
          accountEnc: application.payoutAccountEnc,
          usableForPayouts: true,
        },
      });
    }

    const reviewers = await tx.user.findMany({ where: { role: { in: ['ADMIN', 'MODERATOR'] }, status: 'ACTIVE' }, select: { id: true } });
    for (const reviewer of reviewers) {
      await notify(tx, { userId: reviewer.id, topic: 'LEADS', title: `Verification waiting: ${provider.name}`, body: 'A provider submitted all five sections for review.', href: '/admin?section=verify' });
    }
    await audit(tx, { actorId: user.id, action: 'verification.submitted', targetType: 'Provider', targetId: provider.id });
  });
  return verificationState(user);
}

// ── Review queue (trust team) ─────────────────────────────────────────────

export async function verificationQueue() {
  const applications = await prisma.verificationApplication.findMany({
    where: { status: 'SUBMITTED' },
    orderBy: { submittedAt: 'asc' },
    include: { provider: { select: { id: true, name: true, city: true, category: true } } },
    take: 50,
  });
  return applications.map((app) => ({
    id: app.id,
    name: app.provider.name,
    meta: `${app.provider.city} · ${PROVIDER_CATEGORIES[app.provider.category].upper} · APPLIED ${relativeTime(app.submittedAt)}`.toUpperCase(),
    checks: [
      ['ID DOC', Boolean(app.idFileId)],
      [app.proofRoute === 'FORMAL' ? 'BUSINESS PERMIT' : 'PORTFOLIO + REFERENCES', app.proofRoute === 'FORMAL' ? Boolean(app.proofFileId) : app.portfolioFileIds.length >= 5],
      ['PHONE VERIFIED', Boolean(app.phoneVerifiedAt)],
      ['PAYOUT', Boolean(app.payoutAccountEnc)],
    ],
    documents: [app.idFileId, app.proofFileId, ...app.portfolioFileIds].filter(Boolean),
    idNumberHint: app.idNumberEnc ? `•••• ${lastDigits(decrypt(app.idNumberEnc), 4)}` : null,
  }));
}

export async function reviewApplication(reviewer, applicationId, { decision, note }) {
  const app = await prisma.verificationApplication.findUnique({ where: { id: applicationId }, include: { provider: true } });
  if (!app) throw notFound();
  if (app.status !== 'SUBMITTED') throw conflict('This application is not waiting for review.', 'not_pending');
  const status = { approve: 'APPROVED', info: 'NEEDS_INFO', reject: 'REJECTED' }[decision];
  if (!status) throw badRequest('Unknown decision.');
  if (status !== 'APPROVED' && !note) throw invalid('Tell the provider what is missing.');

  await transaction(async (tx) => {
    await tx.verificationApplication.update({ where: { id: app.id }, data: { status, reviewedAt: new Date(), reviewerId: reviewer.id, reviewNote: note || null } });
    if (status === 'APPROVED') await tx.provider.update({ where: { id: app.providerId }, data: { verifiedAt: new Date() } });
    await notify(tx, {
      userId: app.provider.ownerId,
      topic: 'MONEY',
      title: status === 'APPROVED' ? 'You are verified' : status === 'NEEDS_INFO' ? 'Your verification needs one more thing' : 'Your verification was not approved',
      body: status === 'APPROVED' ? 'The verified badge is now live on your listing.' : note,
      href: status === 'APPROVED' ? `/providers/${app.provider.slug}` : '/provider-verification',
    });
    await audit(tx, { actorId: reviewer.id, action: `verification.${decision}`, targetType: 'Provider', targetId: app.providerId, meta: { note } });
    // Once there is a final decision, the identity documents have done their
    // job: the ID number and every uploaded document are discarded. A
    // request for more information keeps them, since the review continues.
    if (status !== 'NEEDS_INFO') {
      await tx.verificationApplication.update({ where: { id: app.id }, data: { idNumberEnc: null, idFileId: null, proofFileId: null, portfolioFileIds: { set: [] } } });
    }
  });
  if (status !== 'NEEDS_INFO') {
    await deleteFiles([app.idFileId, app.proofFileId, ...app.portfolioFileIds]).catch((error) => {
      // The records are already detached from the application; a failed
      // storage delete is logged for a retry rather than undoing the decision.
      log.error('verification documents not deleted', { applicationId: app.id, error });
    });
  }
  return { status };
}
