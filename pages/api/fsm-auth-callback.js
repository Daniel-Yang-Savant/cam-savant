// POST target for Google Identity Services ux_mode:'redirect' on mobile.
// Google POSTs: credential (JWT) + g_csrf_token (application/x-www-form-urlencoded)
// We store the credential in sessionStorage via a tiny HTML shim, then redirect back to Studio.

import { isGoogleCredential } from '../../lib/fsm/session-auth';

export default function handler(req, res) {
  res.setHeader('Cache-Control', 'private, no-store');
  if (req.method !== 'POST') {
    res.redirect(302, '/fsm/studio/');
    return;
  }

  const csrfCookie = req.cookies?.g_csrf_token;
  const csrfBody = req.body?.g_csrf_token;
  if (typeof csrfCookie !== 'string' || !csrfCookie || csrfCookie.length > 1024 ||
      typeof csrfBody !== 'string' || csrfBody !== csrfCookie) {
    return res.status(400).json({ error: 'Invalid sign-in request. Please restart Google sign-in.' });
  }
  const credential = req.body?.credential;
  if (!isGoogleCredential(credential)) return res.status(400).json({ error: 'Invalid sign-in credential' });
  const credentialJSON = JSON.stringify(credential).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');

  // Return a minimal HTML page that stores the JWT in sessionStorage and redirects.
  // sessionStorage is same-origin only; the credential is a signed JWT from Google
  // and will be verified by /api/auth before being trusted.
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(`<!DOCTYPE html>
<html lang="zh-TW"><head><meta charset="UTF-8">
<meta http-equiv="refresh" content="3;url=/fsm/studio/">
<title>登入中…</title>
<style>body{margin:0;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#0d0d0d;color:#aaa;font:14px system-ui,sans-serif;}</style>
</head><body><p>登入中，請稍候…</p>
<script>
(function(){
  try{ sessionStorage.setItem('fsm_pending_credential',${credentialJSON}); }catch(e){}
  window.location.replace('/fsm/studio/');
})();
</script>
</body></html>`);
}
