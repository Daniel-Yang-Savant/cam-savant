// Server-only FSM authentication. Never import this module from the Studio client.
import { applyPagesRateLimit } from '../security/request-protection';
export const SESSION_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
export const SESSION_COOKIE_NAME = '__Host-fsm_session';

export function sessionCookieName() {
  return process.env.NODE_ENV === 'production' ? SESSION_COOKIE_NAME : 'fsm_session';
}

export function setSessionCookie(res, token) {
  res.setHeader('Set-Cookie', `${sessionCookieName()}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_MAX_AGE_MS / 1000}${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`);
}

export function clearSessionCookie(res) {
  res.setHeader('Set-Cookie', `${sessionCookieName()}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`);
}

function requestOrigin(req) {
  const host = req.headers.host;
  if (typeof host !== 'string' || !/^[A-Za-z0-9.:[\]-]+$/.test(host)) return null;
  const local = /^(localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/i.test(host);
  try { return new URL(`${process.env.NODE_ENV === 'production' && !local ? 'https' : 'http'}://${host}`).origin; }
  catch { return null; }
}

export function requireSameOriginWrite(req, res) {
  const expected = requestOrigin(req);
  if (!expected || req.headers.origin !== expected || req.headers['x-fsm-csrf'] !== '1' || req.headers['sec-fetch-site'] === 'cross-site') {
    res.status(403).json({ error: 'Please submit this request from the FSM Studio page.', code: 'invalid_request_origin' });
    return false;
  }
  return true;
}

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
  const payloadB64 = Buffer.from(JSON.stringify({ v: 2, email, iat: issuedAt, exp: issuedAt + SESSION_MAX_AGE_MS })).toString('base64url');
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode('fsm-cookie-session:v2:' + payloadB64));
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
    if (!await crypto.subtle.verify('HMAC', key, signature, enc.encode('fsm-cookie-session:v2:' + payloadB64))) return null;
    const payload = JSON.parse(payloadBytes.toString('utf8'));
    const now = Date.now();
    if (!payload || typeof payload !== 'object' || Array.isArray(payload) || payload.v !== 2 || !validEmail(payload.email)) return null;
    if (!Number.isSafeInteger(payload.exp) || payload.exp <= now || payload.exp > now + SESSION_MAX_AGE_MS) return null;
    // A separate signing purpose invalidates the former JavaScript-readable
    // bearer sessions. Every cookie session has a bounded issuance time.
    if (!Number.isSafeInteger(payload.iat) || payload.iat > now || payload.iat < now - SESSION_MAX_AGE_MS || payload.exp <= payload.iat || payload.exp - payload.iat > SESSION_MAX_AGE_MS) return null;
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
  // A pre-migration tab can send its old bearer while the browser attaches a
  // newer tab's cookie. Never reinterpret that legacy request as cookie login.
  if (req.headers.authorization !== undefined) {
    res.status(401).json({ error: 'This sign-in method expired. Please reload FSM Studio.', code: 'legacy_session_expired' });
    return null;
  }
  if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method) && !requireSameOriginWrite(req, res)) return null;
  const origin = req.headers.origin;
  if (req.headers['sec-fetch-site'] === 'cross-site' || (origin && origin !== requestOrigin(req))) {
    res.status(403).json({ error: 'Cross-origin session requests are not allowed' });
    return null;
  }
  const payload = await verifySessionToken(req.cookies?.[sessionCookieName()]);
  if (!payload) {
    res.status(401).json({ error: 'Invalid or expired token' });
    return null;
  }
  // Cookie sessions are shared by tabs. Bind requests to the profile the page
  // actually displayed, so a simultaneous account switch cannot save A's data
  // into B's account before the cross-tab notification arrives.
  const expectedAccount = req.headers['x-fsm-account'];
  if ((!['GET', 'HEAD', 'OPTIONS'].includes(req.method) && typeof expectedAccount !== 'string') ||
      (expectedAccount !== undefined && expectedAccount !== payload.email)) {
    res.status(409).json({ error: 'The signed-in account changed. Please reload your session.', code: 'session_account_changed' });
    return null;
  }
  if (!await applyPagesRateLimit(req, res, `fsm-member:${payload.email}`, 300, 15 * 60 * 1000)) return null;
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
