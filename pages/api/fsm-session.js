import { authorizeSession } from '../../lib/fsm/session-auth';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'private, no-store');
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  const session = await authorizeSession(req, res);
  if (!session) return;
  return res.status(200).json({ authorized: true, email: session.email, name: session.email.split('@')[0], picture: null });
}
