import { authorizeSession } from '../../lib/fsm/session-auth';

// /api/my-protocols.js
// Per-user custom protocol storage in Upstash KV.
// Key: my_protocols:{email}
//
// GET  → returns { protocols: [...] } for the authenticated user
// POST → { protocols: [...] } — replaces the user's full protocol list

// ── KV helpers ────────────────────────────────────────────────────────────────
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
    const parsed = JSON.parse(result);
    return typeof parsed === 'string' ? JSON.parse(parsed) : parsed;
  } catch { return null; }
}

async function kvSet(key, value) {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) throw new Error('KV not configured');
  const res = await fetch(`${url}/set/${encodeURIComponent(key)}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(JSON.stringify(value))
  });
  if (!res.ok) throw new Error('KV set failed: ' + res.status);
}

// ── Main handler ──────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // Auth check
  const payload = await authorizeSession(req, res);
  if (!payload) return;

  const kvKey = `my_protocols:${payload.email}`;

  // ── GET ───────────────────────────────────────────────────────────────────
  if (req.method === 'GET') {
    try {
      const protocols = await kvGet(kvKey) || [];
      return res.status(200).json({ protocols });
    } catch (err) {
      console.error('my-protocols GET error:', err);
      return res.status(500).json({ error: 'Failed to load protocols' });
    }
  }

  // ── POST ──────────────────────────────────────────────────────────────────
  if (req.method === 'POST') {
    const { protocols } = req.body || {};
    if (!Array.isArray(protocols)) return res.status(400).json({ error: 'protocols must be an array' });
    // Basic safety: limit size
    if (protocols.length > 500) return res.status(400).json({ error: 'Too many protocols (max 500)' });
    try {
      await kvSet(kvKey, protocols);
      return res.status(200).json({ ok: true, count: protocols.length });
    } catch (err) {
      console.error('my-protocols POST error:', err);
      return res.status(500).json({ error: 'Failed to save protocols' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
