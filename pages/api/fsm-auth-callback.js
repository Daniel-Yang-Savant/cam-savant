// POST target for Google Identity Services ux_mode:'redirect' on mobile.
// Google POSTs: credential (JWT) + g_csrf_token (application/x-www-form-urlencoded)
// We store the credential in sessionStorage via a tiny HTML shim, then redirect back to Studio.

export default function handler(req, res) {
  if (req.method !== 'POST') {
    res.redirect(302, '/fsm/studio/');
    return;
  }

  const credential = req.body?.credential;

  if (!credential) {
    res.redirect(302, '/fsm/studio/');
    return;
  }

  // Return a minimal HTML page that stores the JWT in sessionStorage and redirects.
  // sessionStorage is same-origin only; the credential is a signed JWT from Google
  // and will be verified by /api/auth before being trusted.
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.send(`<!DOCTYPE html>
<html lang="zh-TW"><head><meta charset="UTF-8">
<meta http-equiv="refresh" content="3;url=/fsm/studio/">
<title>登入中…</title>
<style>body{margin:0;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#0d0d0d;color:#aaa;font:14px system-ui,sans-serif;}</style>
</head><body><p>登入中，請稍候…</p>
<script>
(function(){
  try{ sessionStorage.setItem('fsm_pending_credential',${JSON.stringify(credential)}); }catch(e){}
  window.location.replace('/fsm/studio/');
})();
</script>
</body></html>`);
}
