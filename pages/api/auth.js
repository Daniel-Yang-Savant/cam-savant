// /api/auth.js
// Verifies a Google ID token and checks against the authorized email list.
// Also checks Upstash `approved_emails` (admin-approved via Studio).
// Stores pending users in Upstash `pending_list`.

import { createSessionToken, getCurrentMembership, isGoogleCredential, isSessionConfigured, requireSameOriginWrite, setSessionCookie } from '../../lib/fsm/session-auth';
import { applyPagesRateLimit } from '../../lib/security/request-protection';

// ── Upstash helpers ───────────────────────────────────────────────────────────
async function kvGet(key) {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  try {
    const res = await fetch(`${url}/get/${encodeURIComponent(key)}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) return null;
    const { result } = await res.json();
    if (!result) return null;
    const parsed = JSON.parse(result); return typeof parsed === 'string' ? JSON.parse(parsed) : parsed;
  } catch { return null; }
}

async function kvSet(key, value) {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return;
  await fetch(`${url}/set/${encodeURIComponent(key)}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(JSON.stringify(value))
  });
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'private, no-store');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!requireSameOriginWrite(req, res)) return;
  if (!isSessionConfigured() || !process.env.GOOGLE_CLIENT_ID) {
    return res.status(503).json({ error: 'Membership sign-in is temporarily unavailable. Contact the administrator.', code: 'session_configuration_unavailable' });
  }

  const { credential } = req.body || {};
  if (!isGoogleCredential(credential)) return res.status(400).json({ error: 'Invalid sign-in credential' });
  if (!await applyPagesRateLimit(req, res, 'fsm-sign-in', 20, 15 * 60 * 1000)) return;

  try {
    // Verify with Google tokeninfo
    const verifyResp = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`
    );
    if (!verifyResp.ok) return res.status(401).json({ error: 'Invalid token' });
    const payload = await verifyResp.json();

    const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
    if (payload.aud !== CLIENT_ID) return res.status(401).json({ error: 'Token audience mismatch' });
    if (!['accounts.google.com', 'https://accounts.google.com'].includes(payload.iss)) return res.status(401).json({ error: 'Invalid token issuer' });

    const now = Math.floor(Date.now() / 1000);
    const expiration = Number(payload.exp);
    if (!Number.isSafeInteger(expiration) || expiration <= now) return res.status(401).json({ error: 'Token expired' });

    const email = typeof payload.email === 'string' ? payload.email.toLowerCase().trim() : '';
    const verified = payload.email_verified === 'true' || payload.email_verified === true;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254 || !verified) return res.status(401).json({ error: 'Email not verified' });

    const membership = await getCurrentMembership(email);
    if (membership.unavailable) return res.status(503).json({ error: 'Membership verification is temporarily unavailable. Please retry later.', code: 'membership_verification_unavailable' });

    if (!membership.authorized) {
      // Add to pending_list if not already there (fire-and-forget)
      (async () => {
        try {
          const pending = await kvGet('pending_list') || [];
          if (!pending.find(p => p.email === email)) {
            pending.push({
              email,
              name: typeof payload.name === 'string' ? payload.name.slice(0, 200) : '',
              picture: typeof payload.picture === 'string' ? payload.picture.slice(0, 2048) : '',
              requestedAt: new Date().toISOString()
            });
            await kvSet('pending_list', pending);
          }
        } catch {}
      })();

      return res.status(403).json({
        error: 'pending_approval',
        message: '您的帳號正在等待審核，請聯繫管理員。',
        email
      });
    }

    const sessionToken = await createSessionToken(email);
    setSessionCookie(res, sessionToken);
    return res.status(200).json({
      authorized: true,
      email,
      name: typeof payload.name === 'string' ? payload.name.slice(0, 200) : email.split('@')[0],
      picture: typeof payload.picture === 'string' ? payload.picture.slice(0, 2048) : null
    });
  } catch (err) {
    console.error('Auth error:', err);
    return res.status(500).json({ error: 'Verification failed' });
  }
}
