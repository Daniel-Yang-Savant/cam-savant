import { authorizeSession } from '../../lib/fsm/session-auth';

// /api/reference-protocols.js
// Admin-curated SHARED reference protocols (the "參考協定" library), stored in Vercel KV.
//   GET  → any authenticated user: returns the current shared reference list
//   POST → ADMIN ONLY: overwrites the shared reference list (client sends the merged array)
// This is the single effective reference layer used by /api/protected-data.

import MB_REFERENCE from '../../data/fsm/mb-reference.json';
import { toPublicReferenceProtocols } from '../../lib/fsm/reference-library';

const ADMIN_EMAIL = 'hermiterudite@gmail.com';
const KV_KEY = 'reference_protocols_v3';
const MAX_PROTOCOLS = 500;
const MAX_PAYLOAD_BYTES = 2_000_000;

// ── KV helpers (Upstash REST API, no npm deps) ────────────────────────────
async function kvGet(key) {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  const res = await fetch(`${url}/get/${encodeURIComponent(key)}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('KV get failed: ' + res.status);
  const response = await res.json();
  if (response.error || !Object.prototype.hasOwnProperty.call(response, 'result')) throw new Error('Invalid KV response');
  if (response.result === null) return null;
  const parsed = JSON.parse(response.result);
  return typeof parsed === 'string' ? JSON.parse(parsed) : parsed;
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
  const result = await res.json();
  if (result.error || result.result !== 'OK') throw new Error('KV write was not acknowledged');
}

function validateReferenceProtocols(protocols) {
  if (!Array.isArray(protocols)) return 'protocols must be an array';
  if (protocols.length > MAX_PROTOCOLS) return `Too many protocols (max ${MAX_PROTOCOLS})`;
  if (Buffer.byteLength(JSON.stringify(protocols)) > MAX_PAYLOAD_BYTES) return 'Reference payload is too large (max 2 MB)';
  const ids = new Set();
  const names = new Set();
  for (let index = 0; index < protocols.length; index += 1) {
    const protocol = protocols[index];
    const id = String(protocol?.id || '').trim();
    const name = String(protocol?.name_zh || protocol?.name_en || protocol?.name || '').trim();
    if (!id || !name || !Array.isArray(protocol?.steps) || !protocol.steps.length) {
      return `Invalid protocol at index ${index}`;
    }
    if (ids.has(id)) return `Duplicate protocol id: ${id}`;
    if (names.has(name.toLowerCase())) return `Duplicate protocol name: ${name}`;
    ids.add(id);
    names.add(name.toLowerCase());
  }
  return null;
}

// ── Main handler ──────────────────────────────────────────────────────────
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const payload = await authorizeSession(req, res);
  if (!payload) return;

  // GET: anyone authenticated can read the shared reference list
  if (req.method === 'GET') {
    try {
      const list = await kvGet(KV_KEY);
      if (list !== null && !Array.isArray(list)) throw new Error('Invalid saved reference protocols');
      const protocols = toPublicReferenceProtocols(Array.isArray(list) ? list : MB_REFERENCE);
      return res.status(200).json({
        protocols,
        source: Array.isArray(list) ? 'kv' : 'repository_seed'
      });
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
    const validationError = validateReferenceProtocols(protocols);
    if (validationError) return res.status(400).json({ error: validationError });
    const publicProtocols = toPublicReferenceProtocols(protocols);
    const publicValidationError = validateReferenceProtocols(publicProtocols);
    if (publicValidationError) return res.status(400).json({ error: publicValidationError });
    try {
      await kvSet(KV_KEY, publicProtocols);
      return res.status(200).json({ ok: true, count: publicProtocols.length });
    } catch (err) {
      console.error('reference-protocols POST error:', err);
      return res.status(500).json({ error: 'Failed to save reference protocols' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
