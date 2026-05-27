// Tiny helpers shared by API route handlers: consistent JSON responses and
// uniform error formatting. Zod validation errors become readable strings.

export function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json', ...headers },
  });
}

export function ok(data) { return json(data, 200); }
export function created(data) { return json(data, 201); }
export function badRequest(message, details) { return json({ error: message, details }, 400); }
export function notFound(message = 'Not found') { return json({ error: message }, 404); }
export function serverError(message = 'Something went wrong') { return json({ error: message }, 500); }
export function authError() { return json({ error: 'Authentication required' }, 401); }

export function zodError(err) {
  const issues = err?.issues || [];
  const first = issues[0];
  const message = first ? `${first.path?.join('.') || 'field'}: ${first.message}` : 'Invalid request';
  return badRequest(message, issues);
}

// Serialise a Prisma vendor (with packages) into the shape the UI consumes.
// Splits comma-separated columns back into arrays.
export function serializeVendor(v) {
  if (!v) return null;
  return {
    id: v.id,
    slug: v.slug,
    name: v.name,
    type: v.type,
    category: v.category,
    city: v.city,
    country: v.country,
    description: v.description,
    rating: v.rating,
    reviewsCount: v.reviewsCount,
    basePrice: v.basePrice,
    unit: v.unit,
    capacity: v.capacity,
    tags: splitCsv(v.tags),
    highlights: splitCsv(v.highlights),
    host: { name: v.hostName, years: v.hostYears, superhost: v.superhost },
    coverImage: v.coverImage,
    gallery: splitCsv(v.gallery),
    packages: (v.packages || []).map((p) => ({
      id: p.id,
      name: p.name,
      subtitle: p.subtitle,
      price: p.price,
      includes: splitCsv(p.includes),
      featured: p.featured,
    })),
  };
}

function splitCsv(s) {
  if (!s) return [];
  return String(s).split(',').map((x) => x.trim()).filter(Boolean);
}

export function serializeBooking(b) {
  return {
    id: b.id,
    status: b.status,
    paymentStatus: b.paymentStatus,
    eventDate: b.eventDate?.toISOString?.() || b.eventDate,
    guests: b.guests,
    contactName: b.contactName,
    contactPhone: b.contactPhone,
    notes: b.notes,
    subtotal: b.subtotal,
    serviceFee: b.serviceFee,
    vat: b.vat,
    total: b.total,
    depositAmount: b.depositAmount,
    currency: b.currency,
    createdAt: b.createdAt?.toISOString?.() || b.createdAt,
    vendor: b.vendor ? {
      id: b.vendor.id, slug: b.vendor.slug, name: b.vendor.name,
      city: b.vendor.city, country: b.vendor.country, type: b.vendor.type,
      coverImage: b.vendor.coverImage,
    } : undefined,
    package: b.package ? { id: b.package.id, name: b.package.name } : undefined,
    customer: b.customer ? { id: b.customer.id, name: b.customer.name, email: b.customer.email } : undefined,
    messages: b.messages?.map((m) => ({
      id: m.id, fromRole: m.fromRole, body: m.body,
      senderName: m.sender?.name, createdAt: m.createdAt?.toISOString?.() || m.createdAt,
    })),
  };
}
