// /api/pending-users.js
// Admin-only endpoint for managing the user approval queue.
// GET  → returns current pending_list from Upstash
// POST → approve or reject a pending user
//   { action: 'approve', email: '...' } → adds to approved_emails, removes from pending_list
//   { action: 'reject',  email: '...' } → removes from pending_list only

const ADMIN_EMAIL = 'hermiterudite@gmail.com';

// ── KV helpers (Upstash REST API) ─────────────────────────────────────────
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
  if (!url || !token) throw new Error('KV not configured');
  const res = await fetch(`${url}/set/${encodeURIComponent(key)}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(JSON.stringify(value))
  });
  if (!res.ok) throw new Error('KV set failed: ' + res.status);
}

// ── Session token verification (same as auth.js) ──────────────────────────
async function verifySessionToken(token) {
  try {
    const [payloadB64, sigB64] = token.split('.');
    if (!payloadB64 || !sigB64) return null;
    const secret = process.env.SESSION_SECRET || 'CHANGE_ME_IN_PRODUCTION';
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw', enc.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']
    );
    const sigBytes = Buffer.from(sigB64, 'base64url');
    const valid = await crypto.subtle.verify('HMAC', key, sigBytes, enc.encode(payloadB64));
    if (!valid) return null;
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString());
    if (payload.exp < Date.now()) return null;
    return payload;
  } catch { return null; }
}

// ── Main handler ──────────────────────────────────────────────────────────
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // Auth check — must be admin
  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (!token) return res.status(401).json({ error: 'Missing token' });
  const payload = await verifySessionToken(token);
  if (!payload) return res.status(401).json({ error: 'Invalid or expired token' });
  if (payload.email !== ADMIN_EMAIL) return res.status(403).json({ error: 'Admin only' });

  // ── GET: return pending list + approved list ──────────────────────────
  if (req.method === 'GET') {
    try {
      const [pending, approved] = await Promise.all([
        kvGet('pending_list'),
        kvGet('approved_emails'),
      ]);
      return res.status(200).json({ pending: pending || [], approved: approved || [] });
    } catch (err) {
      console.error('pending-users GET error:', err);
      return res.status(500).json({ error: 'Failed to load lists' });
    }
  }

  // ── POST: approve / reject / revoke ──────────────────────────────────
  if (req.method === 'POST') {
    const { action, email } = req.body || {};
    if (!action || !email) return res.status(400).json({ error: 'Missing action or email' });
    if (!['approve', 'reject', 'revoke'].includes(action)) return res.status(400).json({ error: 'action must be approve, reject, or revoke' });

    try {
      if (action === 'revoke') {
        // Remove from approved_emails only
        const approved = await kvGet('approved_emails') || [];
        await kvSet('approved_emails', approved.filter(e => e !== email));
        return res.status(200).json({ ok: true, action: 'revoked', email });
      }

      // approve / reject: remove from pending_list first
      const pending = await kvGet('pending_list') || [];
      await kvSet('pending_list', pending.filter(p => p.email !== email));

      if (action === 'approve') {
        const approved = await kvGet('approved_emails') || [];
        if (!approved.includes(email)) {
          approved.push(email);
          await kvSet('approved_emails', approved);
        }
        return res.status(200).json({ ok: true, action: 'approved', email });
      }

      return res.status(200).json({ ok: true, action: 'rejected', email });
    } catch (err) {
      console.error('pending-users POST error:', err);
      return res.status(500).json({ error: 'Failed to update lists' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
