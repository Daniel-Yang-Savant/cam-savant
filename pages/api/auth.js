// /api/auth.js
// Verifies a Google ID token and checks against the authorized email list.
// Also checks Upstash `approved_emails` (admin-approved via Studio).
// Stores pending users in Upstash `pending_list`.

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
    return JSON.parse(result);
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
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { credential } = req.body || {};
  if (!credential) return res.status(400).json({ error: 'Missing credential' });

  try {
    // Verify with Google tokeninfo
    const verifyResp = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`
    );
    if (!verifyResp.ok) return res.status(401).json({ error: 'Invalid token' });
    const payload = await verifyResp.json();

    const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
    if (!CLIENT_ID) return res.status(500).json({ error: 'Server config error: missing GOOGLE_CLIENT_ID' });
    if (payload.aud !== CLIENT_ID) return res.status(401).json({ error: 'Token audience mismatch' });

    const now = Math.floor(Date.now() / 1000);
    if (parseInt(payload.exp) < now) return res.status(401).json({ error: 'Token expired' });

    const email = (payload.email || '').toLowerCase().trim();
    const verified = payload.email_verified === 'true' || payload.email_verified === true;
    if (!email || !verified) return res.status(401).json({ error: 'Email not verified' });

    // ── Check 1: hardcoded env-var whitelist ──────────────────────────────────
    const envList = (process.env.AUTHORIZED_EMAILS || '')
      .split(',').map(e => e.toLowerCase().trim()).filter(Boolean);
    const inEnvList = envList.includes(email);

    // ── Check 2: admin-approved list in Upstash ───────────────────────────────
    let inApprovedList = false;
    if (!inEnvList) {
      const approved = await kvGet('approved_emails') || [];
      inApprovedList = approved.includes(email);
    }

    const isAuthorized = inEnvList || inApprovedList;

    if (!isAuthorized) {
      // Add to pending_list if not already there (fire-and-forget)
      (async () => {
        try {
          const pending = await kvGet('pending_list') || [];
          if (!pending.find(p => p.email === email)) {
            pending.push({
              email,
              name: payload.name || '',
              picture: payload.picture || '',
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
    return res.status(200).json({
      authorized: true,
      email,
      name: payload.name || email.split('@')[0],
      picture: payload.picture || null,
      token: sessionToken
    });
  } catch (err) {
    console.error('Auth error:', err);
    return res.status(500).json({ error: 'Verification failed' });
  }
}

async function createSessionToken(email) {
  const secret = process.env.SESSION_SECRET || 'CHANGE_ME_IN_PRODUCTION';
  const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;
  const payload = JSON.stringify({ email, exp: expiresAt });
  const payloadB64 = Buffer.from(payload).toString('base64url');
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw', enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(payloadB64));
  const sigB64 = Buffer.from(sig).toString('base64url');
  return `${payloadB64}.${sigB64}`;
}
