// Browser-side fetch helpers. All API routes return JSON; non-2xx responses
// throw with the message from the server body, so callers can `try/catch`.

async function request(method, path, body) {
  const res = await fetch(path, {
    method,
    headers: body ? { 'content-type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'include',
  });
  const text = await res.text();
  const data = text ? safeJSON(text) : {};
  if (!res.ok) {
    const err = new Error(data?.error || res.statusText || 'Request failed');
    err.status = res.status;
    err.details = data?.details;
    throw err;
  }
  return data;
}

function safeJSON(s) { try { return JSON.parse(s); } catch { return null; } }

export const api = {
  get:    (p)    => request('GET',    p),
  post:   (p, b) => request('POST',   p, b),
  patch:  (p, b) => request('PATCH',  p, b),
  delete: (p)    => request('DELETE', p),
};

// SWR fetcher
export const fetcher = (p) => request('GET', p);
