// /api/protocols.js
// GET  → returns this user's personal protocol list (from Vercel KV)
// POST → saves this user's personal protocol list (to Vercel KV)

const ADMIN_EMAIL = 'hermiterudite@gmail.com';

// Seed protocols for the admin user (the original 10 curated templates)
const SEED_PROTOCOLS = [{"id":"myofascial_short","name_zh":"肌筋膜 — 最短模板","name_en":"Shortest Myofascial Template","category":"myofascial","indication_zh":"通用肌筋膜疼痛，肩頸首選","indication_en":"General myofascial pain, shoulder/neck first-line","steps":[{"freq_a":40,"freq_b":10,"duration":4,"polarity":"Alternating","wave":"Medium","current":200},{"freq_a":40,"freq_b":396,"duration":4,"polarity":"Alternating","wave":"Medium","current":200},{"freq_a":91,"freq_b":77,"duration":4,"polarity":"Alternating","wave":"Medium","current":200},{"freq_a":91,"freq_b":142,"duration":4,"polarity":"Alternating","wave":"Medium","current":200},{"freq_a":13,"freq_b":396,"duration":8,"polarity":"Alternating","wave":"Medium","current":200}],"_custom":true},{"id":"acute_disc","name_zh":"急性椎間盤損傷","name_en":"Acute Disc Injury","category":"disc","indication_zh":"急性椎間盤突出，神經根症狀","steps":[{"freq_a":40,"freq_b":396,"duration":4,"polarity":"Positive","wave":"Gentle","current":100},{"freq_a":40,"freq_b":10,"duration":4,"polarity":"Positive","wave":"Gentle","current":100},{"freq_a":40,"freq_b":710,"duration":5,"polarity":"Positive","wave":"Gentle","current":100},{"freq_a":40,"freq_b":330,"duration":5,"polarity":"Positive","wave":"Gentle","current":100},{"freq_a":40,"freq_b":630,"duration":5,"polarity":"Positive","wave":"Gentle","current":100},{"freq_a":124,"freq_b":710,"duration":10,"polarity":"Positive","wave":"Gentle","current":100},{"freq_a":49,"freq_b":710,"duration":5,"polarity":"Positive","wave":"Gentle","current":100},{"freq_a":81,"freq_b":142,"duration":5,"polarity":"Positive","wave":"Gentle","current":100}],"_custom":true},{"id":"subacute_disc","name_zh":"亞急性椎間盤","name_en":"Sub-acute Disc","category":"disc","indication_zh":"椎間盤損傷 2-6 週","steps":[{"freq_a":40,"freq_b":396,"duration":4,"polarity":"Positive","wave":"Medium","current":100},{"freq_a":40,"freq_b":10,"duration":4,"polarity":"Positive","wave":"Medium","current":100},{"freq_a":124,"freq_b":710,"duration":15,"polarity":"Positive","wave":"Medium","current":100},{"freq_a":40,"freq_b":710,"duration":5,"polarity":"Positive","wave":"Medium","current":100},{"freq_a":284,"freq_b":710,"duration":5,"polarity":"Positive","wave":"Medium","current":100},{"freq_a":49,"freq_b":710,"duration":5,"polarity":"Positive","wave":"Medium","current":100}],"_custom":true},{"id":"chronic_disc","name_zh":"慢性椎間盤","name_en":"Chronic Disc","category":"disc","indication_zh":"慢性椎間盤退變、長期下背痛","steps":[{"freq_a":40,"freq_b":396,"duration":4,"polarity":"Positive","wave":"Sharp","current":200},{"freq_a":284,"freq_b":396,"duration":4,"polarity":"Positive","wave":"Sharp","current":200},{"freq_a":124,"freq_b":710,"duration":20,"polarity":"Positive","wave":"Sharp","current":200},{"freq_a":40,"freq_b":710,"duration":5,"polarity":"Positive","wave":"Sharp","current":200},{"freq_a":284,"freq_b":710,"duration":5,"polarity":"Positive","wave":"Sharp","current":200},{"freq_a":91,"freq_b":710,"duration":5,"polarity":"Alternating","wave":"Sharp","current":200},{"freq_a":13,"freq_b":710,"duration":5,"polarity":"Alternating","wave":"Sharp","current":200},{"freq_a":81,"freq_b":710,"duration":5,"polarity":"Alternating","wave":"Sharp","current":200},{"freq_a":49,"freq_b":142,"duration":5,"polarity":"Alternating","wave":"Sharp","current":200}],"_custom":true},{"id":"acute_facet","name_zh":"急性小面關節疼痛","name_en":"Acute Facet Joint Pain","category":"joint","indication_zh":"急性 facet 卡住、轉身突發疼痛","steps":[{"freq_a":18,"freq_b":62,"duration":3,"polarity":"Alternating","wave":"Gentle","current":100},{"freq_a":40,"freq_b":480,"duration":4,"polarity":"Alternating","wave":"Gentle","current":100},{"freq_a":40,"freq_b":783,"duration":4,"polarity":"Alternating","wave":"Gentle","current":100},{"freq_a":40,"freq_b":396,"duration":4,"polarity":"Alternating","wave":"Gentle","current":100},{"freq_a":40,"freq_b":157,"duration":4,"polarity":"Alternating","wave":"Gentle","current":100},{"freq_a":40,"freq_b":116,"duration":4,"polarity":"Alternating","wave":"Gentle","current":100},{"freq_a":124,"freq_b":480,"duration":10,"polarity":"Alternating","wave":"Gentle","current":100},{"freq_a":81,"freq_b":142,"duration":5,"polarity":"Alternating","wave":"Gentle","current":100}],"_custom":true},{"id":"chronic_facet","name_zh":"慢性小面關節疼痛","name_en":"Chronic Facet Joint Pain","category":"joint","indication_zh":"慢性 facet 退變、長期僵硬","steps":[{"freq_a":40,"freq_b":480,"duration":4,"polarity":"Alternating","wave":"Sharp","current":200},{"freq_a":40,"freq_b":783,"duration":4,"polarity":"Alternating","wave":"Sharp","current":200},{"freq_a":284,"freq_b":480,"duration":4,"polarity":"Alternating","wave":"Sharp","current":200},{"freq_a":284,"freq_b":783,"duration":4,"polarity":"Alternating","wave":"Sharp","current":200},{"freq_a":91,"freq_b":480,"duration":5,"polarity":"Alternating","wave":"Sharp","current":200},{"freq_a":13,"freq_b":480,"duration":5,"polarity":"Alternating","wave":"Sharp","current":200},{"freq_a":13,"freq_b":396,"duration":5,"polarity":"Alternating","wave":"Sharp","current":200},{"freq_a":81,"freq_b":142,"duration":5,"polarity":"Alternating","wave":"Sharp","current":200},{"freq_a":49,"freq_b":480,"duration":5,"polarity":"Alternating","wave":"Sharp","current":200}],"_custom":true},{"id":"ligament","name_zh":"韌帶不穩定","name_en":"Ligamentous Instability","category":"soft_tissue","indication_zh":"韌帶鬆弛、關節不穩","steps":[{"freq_a":124,"freq_b":100,"duration":10,"polarity":"Alternating","wave":"Medium","current":200},{"freq_a":124,"freq_b":191,"duration":10,"polarity":"Alternating","wave":"Medium","current":200},{"freq_a":124,"freq_b":77,"duration":10,"polarity":"Alternating","wave":"Medium","current":200},{"freq_a":124,"freq_b":142,"duration":10,"polarity":"Alternating","wave":"Medium","current":200},{"freq_a":40,"freq_b":100,"duration":5,"polarity":"Alternating","wave":"Medium","current":200},{"freq_a":284,"freq_b":100,"duration":5,"polarity":"Alternating","wave":"Medium","current":200},{"freq_a":81,"freq_b":100,"duration":5,"polarity":"Alternating","wave":"Medium","current":200},{"freq_a":49,"freq_b":142,"duration":5,"polarity":"Alternating","wave":"Medium","current":200}],"_custom":true},{"id":"tendon","name_zh":"肌腱傷害","name_en":"Tendon Injuries","category":"soft_tissue","indication_zh":"肌腱炎、肌腱撕裂、慢性肌腱病","steps":[{"freq_a":124,"freq_b":191,"duration":30,"polarity":"Alternating","wave":"Medium","current":200},{"freq_a":124,"freq_b":77,"duration":5,"polarity":"Alternating","wave":"Medium","current":200},{"freq_a":40,"freq_b":191,"duration":5,"polarity":"Alternating","wave":"Medium","current":200},{"freq_a":284,"freq_b":191,"duration":5,"polarity":"Alternating","wave":"Medium","current":200},{"freq_a":40,"freq_b":195,"duration":5,"polarity":"Alternating","wave":"Medium","current":200},{"freq_a":81,"freq_b":191,"duration":5,"polarity":"Alternating","wave":"Medium","current":200},{"freq_a":49,"freq_b":142,"duration":5,"polarity":"Alternating","wave":"Medium","current":200}],"_custom":true},{"id":"concussion","name_zh":"腦震盪基本方案","name_en":"Concussion Basic Protocol","category":"neurological","indication_zh":"腦震盪後症候群","steps":[{"freq_a":94,"freq_b":200,"duration":4,"polarity":"Positive","wave":"Gentle","current":100},{"freq_a":970,"freq_b":200,"duration":4,"polarity":"Positive","wave":"Gentle","current":100},{"freq_a":94,"freq_b":94,"duration":4,"polarity":"Positive","wave":"Gentle","current":100},{"freq_a":321,"freq_b":94,"duration":4,"polarity":"Positive","wave":"Gentle","current":100},{"freq_a":9,"freq_b":94,"duration":4,"polarity":"Positive","wave":"Gentle","current":100},{"freq_a":81,"freq_b":310,"duration":5,"polarity":"Positive","wave":"Gentle","current":100},{"freq_a":49,"freq_b":94,"duration":5,"polarity":"Positive","wave":"Gentle","current":100}],"_custom":true},{"id":"inflammation_core","name_zh":"消炎核心","name_en":"Inflammation Core","category":"core","indication_zh":"通用消炎、急性傷害第一線","steps":[{"freq_a":40,"freq_b":116,"duration":4,"polarity":"Alternating","wave":"Medium","current":200}],"_custom":true}];

// ── KV helpers (Upstash REST API, no npm deps) ────────────────────────────
async function kvGet(key) {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  const res = await fetch(`${url}/get/${encodeURIComponent(key)}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) return null;
  const { result } = await res.json();
  if (!result) return null;
  try { return JSON.parse(result); } catch { return null; }
}

async function kvSet(key, value) {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
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

  // Auth check
  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (!token) return res.status(401).json({ error: 'Missing token' });
  const payload = await verifySessionToken(token);
  if (!payload) return res.status(401).json({ error: 'Invalid or expired token' });

  const email = payload.email;
  const kvKey = `protocols:${email}`;

  // ── GET: fetch user's protocols ──────────────────────────────────────────
  if (req.method === 'GET') {
    try {
      let protocols = await kvGet(kvKey);
      if (protocols === null) {
        // First login: seed admin with 10 curated, others start empty
        protocols = email === ADMIN_EMAIL ? SEED_PROTOCOLS : [];
        await kvSet(kvKey, protocols);
      }
      return res.status(200).json({ protocols });
    } catch (err) {
      console.error('protocols GET error:', err);
      return res.status(500).json({ error: 'Failed to load protocols' });
    }
  }

  // ── POST: save user's protocols ──────────────────────────────────────────
  if (req.method === 'POST') {
    const { protocols } = req.body || {};
    if (!Array.isArray(protocols)) return res.status(400).json({ error: 'protocols must be an array' });
    try {
      await kvSet(kvKey, protocols);
      return res.status(200).json({ ok: true });
    } catch (err) {
      console.error('protocols POST error:', err);
      return res.status(500).json({ error: 'Failed to save protocols' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
