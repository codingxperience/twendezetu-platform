// Browser-side API client for the design pages. Errors come back as
// ApiError with the server's message, code and HTTP status. Calls that move
// money carry an Idempotency-Key so a double click or a retried request can
// never charge twice.

export class ApiError extends Error {
  constructor(message, { status, code, details } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

function newKey() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

async function request(method, path, body, { idempotent = false, form } = {}) {
  const headers = { accept: 'application/json' };
  if (body !== undefined && !form) headers['content-type'] = 'application/json';
  if (idempotent) headers['idempotency-key'] = newKey();

  let response;
  try {
    response = await fetch(path, {
      method,
      headers,
      body: form || (body !== undefined ? JSON.stringify(body) : undefined),
      credentials: 'same-origin',
    });
  } catch {
    throw new ApiError('You seem to be offline. Check your connection and try again.', { status: 0, code: 'network' });
  }

  const text = await response.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }
  if (!response.ok) {
    const error = data?.error || {};
    throw new ApiError(error.message || 'Something went wrong. Please try again.', { status: response.status, code: error.code, details: error.details });
  }
  return data;
}

export const api = {
  get: (path) => request('GET', path),
  post: (path, body, options) => request('POST', path, body ?? {}, options),
  put: (path, body, options) => request('PUT', path, body ?? {}, options),
  patch: (path, body, options) => request('PATCH', path, body ?? {}, options),
  delete: (path, body, options) => request('DELETE', path, body, options),
  upload: (file, purpose) => {
    const form = new FormData();
    form.append('file', file);
    form.append('purpose', purpose);
    return request('POST', '/api/uploads', undefined, { form });
  },
};
