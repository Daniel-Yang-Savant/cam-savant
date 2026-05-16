// /api/auth.js
// Verifies a Google ID token and checks against the authorized email list.
// Returns { authorized: true, email, name } on success.

export default async function handler(req, res) {
  // CORS for same-origin (Vercel) — adjust if hosted elsewhere
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { credential } = req.body || {};
  if (!credential) {
    return res.status(400).json({ error: 'Missing credential' });
  }

  try {
    // Verify the token with Google's tokeninfo endpoint
    // (lightweight alternative to google-auth-library, no deps required)
    const verifyResp = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`
    );
    if (!verifyResp.ok) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    const payload = await verifyResp.json();

    // Verify the token's audience matches our client ID
    const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
    if (!CLIENT_ID) {
      return res.status(500).json({ error: 'Server config error: missing GOOGLE_CLIENT_ID' });
    }
    if (payload.aud !== CLIENT_ID) {
      return res.status(401).json({ error: 'Token audience mismatch' });
    }

    // Check token expiry
    const now = Math.floor(Date.now() / 1000);
    if (parseInt(payload.exp) < now) {
      return res.status(401).json({ error: 'Token expired' });
    }

    const email = (payload.email || '').toLowerCase().trim();
    const verified = payload.email_verified === 'true' || payload.email_verified === true;
    if (!email || !verified) {
      return res.status(401).json({ error: 'Email not verified' });
    }

    // Check authorized list
    const allowList = (process.env.AUTHORIZED_EMAILS || '')
      .split(',')
      .map(e => e.toLowerCase().trim())
      .filter(Boolean);

    const isAuthorized = allowList.includes(email);

    if (!isAuthorized) {
      // Email is verified by Google but not on our list — pending approval
      return res.status(403).json({
        error: 'pending_approval',
        message: 'Your email is not yet authorized. Please contact the administrator.',
        email: email
      });
    }

    // Issue our own short-lived session token (signed-ish — for stronger security use a real JWT lib)
    // For now we use a simple HMAC signature
    const sessionToken = await createSessionToken(email);

    return res.status(200).json({
      authorized: true,
      email: email,
      name: payload.name || email.split('@')[0],
      picture: payload.picture || null,
      token: sessionToken
    });
  } catch (err) {
    console.error('Auth error:', err);
    return res.status(500).json({ error: 'Verification failed' });
  }
}

// Simple HMAC-based session token. For production-grade, use 'jose' or 'jsonwebtoken'.
async function createSessionToken(email) {
  const secret = process.env.SESSION_SECRET || 'CHANGE_ME_IN_PRODUCTION';
  const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
  const payload = JSON.stringify({ email, exp: expiresAt });
  const payloadB64 = Buffer.from(payload).toString('base64url');

  // Compute HMAC using Web Crypto (works in Vercel Edge and Node runtimes)
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(payloadB64));
  const sigB64 = Buffer.from(sig).toString('base64url');

  return `${payloadB64}.${sigB64}`;
}
