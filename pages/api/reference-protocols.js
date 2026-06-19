// /api/reference-protocols.js
// Admin-curated SHARED reference protocols (the "參考協定" library), stored in Vercel KV.
//   GET  → any authenticated user: returns the current shared reference list
//   POST → ADMIN ONLY: overwrites the shared reference list (client sends the merged array)
// These are merged into PROTECTED_PAYLOAD.full by /api/protected-data so all users see them.

const ADMIN_EMAIL = 'hermiterudite@gmail.com';
const KV_KEY = 'reference_protocols_extra';

// ── KV helpers (Upstash REST API, no npm deps) ────────────────────────────
async function kvGet(key) {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  const res = await fetch(`${url}/get/${encodeURIComponent(key)}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) return null;
  const { result } = await res.json();
  if (!result) return null;
  try { const p = JSON.parse(result); return typeof p === 'string' ? JSON.parse(p) : p; } catch { return null; }
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

// ── Session token verification (same scheme as auth.js / protocols.js) ─────
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

  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (!token) return res.status(401).json({ error: 'Missing token' });
  const payload = await verifySessionToken(token);
  if (!payload) return res.status(401).json({ error: 'Invalid or expired token' });

  // GET: anyone authenticated can read the shared reference list
  if (req.method === 'GET') {
    try {
      const list = await kvGet(KV_KEY);
      return res.status(200).json({ protocols: Array.isArray(list) ? list : [] });
    } catch (err) {
      console.error('reference-protocols GET error:', err);
      return res.status(500).json({ error: 'Failed to load reference protocols' });
    }
  }

  // POST: admin only — overwrite the shared reference list
  if (req.method === 'POST') {
    if (payload.email !== ADMIN_EMAIL) {
      return res.status(403).json({ error: 'Admin only' });
    }
    const { protocols } = req.body || {};
    if (!Array.isArray(protocols)) {
      return res.status(400).json({ error: 'protocols must be an array' });
    }
    try {
      await kvSet(KV_KEY, protocols);
      return res.status(200).json({ ok: true, count: protocols.length });
    } catch (err) {
      console.error('reference-protocols POST error:', err);
      return res.status(500).json({ error: 'Failed to save reference protocols' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
