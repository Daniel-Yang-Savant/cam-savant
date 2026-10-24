// Server-only FSM authentication. Never import this module from the Studio client.
export const SESSION_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

function sessionSecret() {
  const secret = process.env.SESSION_SECRET;
  return typeof secret === 'string' && secret.trim() && secret !== 'CHANGE_ME_IN_PRODUCTION'
    ? secret : null;
}

export function isSessionConfigured() {
  return sessionSecret() !== null;
}

function validEmail(email) {
  return typeof email === 'string' && email.length <= 254 &&
    email === email.toLowerCase().trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isGoogleCredential(credential) {
  return typeof credential === 'string' && credential.length <= 16_384 &&
    /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(credential);
}

export async function createSessionToken(email) {
  const secret = sessionSecret();
  if (!secret || !validEmail(email)) throw new Error('Session configuration unavailable');
  const issuedAt = Date.now();
  const payloadB64 = Buffer.from(JSON.stringify({ email, iat: issuedAt, exp: issuedAt + SESSION_MAX_AGE_MS })).toString('base64url');
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(payloadB64));
  return `${payloadB64}.${Buffer.from(sig).toString('base64url')}`;
}

export async function verifySessionToken(token) {
  try {
    const secret = sessionSecret();
    if (!secret || typeof token !== 'string' || token.length > 4096) return null;
    const parts = token.split('.');
    if (parts.length !== 2 || parts.some(part => !/^[A-Za-z0-9_-]+$/.test(part))) return null;
    const [payloadB64, sigB64] = parts;
    const payloadBytes = Buffer.from(payloadB64, 'base64url');
    const signature = Buffer.from(sigB64, 'base64url');
    if (payloadBytes.toString('base64url') !== payloadB64 || signature.length !== 32 || signature.toString('base64url') !== sigB64) return null;
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']);
    if (!await crypto.subtle.verify('HMAC', key, signature, enc.encode(payloadB64))) return null;
    const payload = JSON.parse(payloadBytes.toString('utf8'));
    const now = Date.now();
    if (!payload || typeof payload !== 'object' || Array.isArray(payload) || !validEmail(payload.email)) return null;
    if (!Number.isSafeInteger(payload.exp) || payload.exp <= now || payload.exp > now + SESSION_MAX_AGE_MS) return null;
    // Existing seven-day sessions remain valid; newly issued sessions also bind
    // the lifetime to an issuance time rather than only a future expiration.
    if (payload.iat !== undefined && (!Number.isSafeInteger(payload.iat) || payload.iat > now || payload.iat < now - SESSION_MAX_AGE_MS || payload.exp <= payload.iat || payload.exp - payload.iat > SESSION_MAX_AGE_MS)) return null;
    return payload;
  } catch { return null; }
}

export async function getCurrentMembership(email) {
  const envList = (process.env.AUTHORIZED_EMAILS || '').split(',').map(value => value.toLowerCase().trim()).filter(Boolean);
  if (envList.includes(email)) return { authorized: true };
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return { authorized: false, unavailable: true };
  try {
    const response = await fetch(`${url}/get/${encodeURIComponent('approved_emails')}`, { headers: { Authorization: `Bearer ${token}` } });
    if (!response.ok) throw new Error('Membership lookup failed');
    const data = await response.json();
    if (data.error || !Object.prototype.hasOwnProperty.call(data, 'result')) throw new Error('Invalid membership response');
    let approved = data.result === null ? [] : JSON.parse(data.result);
    if (typeof approved === 'string') approved = JSON.parse(approved);
    if (!Array.isArray(approved)) throw new Error('Invalid membership list');
    return { authorized: approved.includes(email) };
  } catch { return { authorized: false, unavailable: true }; }
}

export async function authorizeSession(req, res) {
  if (!isSessionConfigured()) {
    res.status(503).json({ error: 'Membership sign-in is temporarily unavailable. Contact the administrator.', code: 'session_configuration_unavailable' });
    return null;
  }
  const header = req.headers.authorization;
  const match = typeof header === 'string' && /^Bearer\s+([^\s]+)$/i.exec(header);
  const payload = match ? await verifySessionToken(match[1]) : null;
  if (!payload) {
    res.status(401).json({ error: 'Invalid or expired token' });
    return null;
  }
  const membership = await getCurrentMembership(payload.email);
  if (membership.unavailable) {
    res.status(503).json({ error: 'Membership verification is temporarily unavailable. Please retry later.', code: 'membership_verification_unavailable' });
    return null;
  }
  if (!membership.authorized) {
    res.status(403).json({ error: 'Email no longer authorized' });
    return null;
  }
  return payload;
}
