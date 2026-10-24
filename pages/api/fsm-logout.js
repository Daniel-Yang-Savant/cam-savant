import { clearSessionCookie, requireSameOriginWrite } from '../../lib/fsm/session-auth';

export default function handler(req, res) {
  res.setHeader('Cache-Control', 'private, no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!requireSameOriginWrite(req, res)) return;
  // Clearing still works when membership was revoked or configuration is down.
  clearSessionCookie(res);
  return res.status(200).json({ ok: true });
}
