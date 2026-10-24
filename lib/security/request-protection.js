// Server-only request protection, shared by App Router and Pages API handlers.
export const RATE_LIMIT_TIMEOUT_MS = 1500;
const localCounters = new Map();
let localSecret;
const script = `
local count = redis.call('INCR', KEYS[1])
local ttl = redis.call('PTTL', KEYS[1])
if count == 1 or ttl < 0 then
  redis.call('PEXPIRE', KEYS[1], ARGV[1])
  ttl = tonumber(ARGV[1])
end
return {count, ttl}
`;

function header(headers, name) {
  if (typeof headers?.get === 'function') return headers.get(name);
  const value = headers?.[name];
  return typeof value === 'string' ? value : null;
}

function normalizedIp(value) {
  if (typeof value !== 'string' || value.length > 200) return null;
  const ip = value.split(',')[0].trim();
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(ip)) {
    const octets = ip.split('.').map(Number);
    return octets.every(part => part <= 255) ? octets.join('.') : null;
  }
  if (!/^[0-9a-f:.]+$/i.test(ip) || !ip.includes(':')) return null;
  try { return new URL(`http://[${ip}]`).hostname.slice(1, -1); }
  catch { return null; }
}

/** Vercel overwrites its forwarding headers. Outside Vercel, use a real socket. */
export function getClientIp(headers, remoteAddress) {
  if (process.env.VERCEL === '1') {
    return normalizedIp(header(headers, 'x-vercel-forwarded-for')) ||
      normalizedIp(header(headers, 'x-forwarded-for')) || 'unknown';
  }
  const socketIp = normalizedIp(remoteAddress);
  if (socketIp) return socketIp;
  if (process.env.NODE_ENV !== 'production') {
    return normalizedIp(header(headers, 'x-forwarded-for')) ||
      normalizedIp(header(headers, 'x-real-ip')) || 'unknown';
  }
  return 'unknown';
}

/** Reject browser cross-origin writes while retaining authenticated CLI clients. */
export function isAllowedWriteOrigin(headers, expectedOrigin) {
  const origin = header(headers, 'origin');
  if (origin !== null) {
    try { return origin === new URL(origin).origin && origin === new URL(expectedOrigin).origin; }
    catch { return false; }
  }
  const site = header(headers, 'sec-fetch-site');
  return site === null || site === 'none' || site === 'same-origin';
}

function unavailable() {
  return { allowed: false, remaining: 0, resetIn: 30_000, unavailable: true };
}

async function privateBucket(key, secret) {
  const encoder = new TextEncoder();
  const signingKey = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const signature = await crypto.subtle.sign('HMAC', signingKey, encoder.encode(`cam-savant:rate-limit:v1:${key}`));
  return 'request-limit:v1:' + Array.from(new Uint8Array(signature), byte => byte.toString(16).padStart(2, '0')).join('');
}

/** Atomic, expiring counters contain only counts, TTLs, and HMAC bucket names. */
export async function checkRateLimit(key, limit, windowMs) {
  if (typeof key !== 'string' || !key || key.length > 512 || !Number.isSafeInteger(limit) || limit < 1 || !Number.isSafeInteger(windowMs) || windowMs < 1 || windowMs > 86_400_000) return unavailable();
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  const production = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';
  if (!url && !token && !production) {
    localSecret ||= Array.from(crypto.getRandomValues(new Uint8Array(32)), byte => byte.toString(16).padStart(2, '0')).join('');
    const bucket = await privateBucket(key, localSecret);
    const now = Date.now();
    for (const [storedKey, record] of localCounters) if (record.resetAt <= now) localCounters.delete(storedKey);
    let record = localCounters.get(bucket);
    if (!record) {
      if (localCounters.size >= 10_000) return unavailable();
      record = { count: 0, resetAt: now + windowMs };
      localCounters.set(bucket, record);
    }
    record.count++;
    return { allowed: record.count <= limit, remaining: Math.max(0, limit - record.count), resetIn: record.resetAt - now, unavailable: false };
  }
  if (!url || !token) return unavailable();
  const secret = process.env.RATE_LIMIT_SECRET || process.env.SESSION_SECRET || process.env.ADMIN_SECRET || token;
  let timer;
  const controller = new AbortController();
  try {
    const endpoint = new URL(url);
    const localHttp = process.env.VERCEL !== '1' && endpoint.protocol === 'http:' && ['localhost', '127.0.0.1', '[::1]'].includes(endpoint.hostname);
    if ((endpoint.protocol !== 'https:' && !localHttp) || endpoint.username || endpoint.password || endpoint.search || endpoint.hash) return unavailable();
    const bucket = await privateBucket(key, secret);
    const command = JSON.stringify(['EVAL', script, '1', bucket, String(windowMs)]);
    const operation = (async () => {
      const response = await fetch(endpoint.toString(), {
        method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: command, cache: 'no-store', redirect: 'error', signal: controller.signal,
      });
      if (!response.ok) return unavailable();
      const data = await response.json();
      if (!data || data.error || !Array.isArray(data.result) || data.result.length !== 2) return unavailable();
      const [count, ttl] = data.result;
      if (!Number.isSafeInteger(count) || count < 1 || !Number.isSafeInteger(ttl) || ttl < 0 || ttl > windowMs) return unavailable();
      return { allowed: count <= limit, remaining: Math.max(0, limit - count), resetIn: Math.max(1, ttl), unavailable: false };
    })();
    /** @type {Promise<ReturnType<typeof unavailable>>} */
    const timeout = new Promise(resolve => {
      timer = setTimeout(() => { controller.abort(); resolve(unavailable()); }, RATE_LIMIT_TIMEOUT_MS);
    });
    return await Promise.race([operation, timeout]);
  } catch { return unavailable(); }
  finally { clearTimeout(timer); }
}

export function rateLimitError(result) {
  return {
    status: result.unavailable ? 503 : 429,
    error: result.unavailable ? 'Request protection is temporarily unavailable. Please retry later.' : 'Too many requests. Please retry later.',
    code: result.unavailable ? 'request_protection_unavailable' : 'rate_limit_exceeded',
    headers: { 'Cache-Control': 'private, no-store', 'Retry-After': String(Math.max(1, Math.ceil(result.resetIn / 1000))) },
  };
}

/** No application writes occur when shared request protection cannot be checked. */
export async function applyPagesRateLimit(req, res, scope, limit, windowMs) {
  const result = await checkRateLimit(`${scope}:${getClientIp(req.headers, req.socket?.remoteAddress)}`, limit, windowMs);
  if (result.allowed) return true;
  const error = rateLimitError(result);
  for (const [name, value] of Object.entries(error.headers)) res.setHeader(name, value);
  res.status(error.status).json({ error: error.error, code: error.code });
  return false;
}
