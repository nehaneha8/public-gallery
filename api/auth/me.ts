import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '@vercel/postgres';
import { getSessionUserId } from '../_lib/session';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'method not allowed' });

  const userId = getSessionUserId(req);
  if (!userId) return res.status(401).json({ error: 'not logged in' });

  const result = await sql`SELECT email, display_name, slug FROM users WHERE id = ${userId}`;
  const user = result.rows[0] as { email: string; display_name: string; slug: string } | undefined;
  if (!user) return res.status(401).json({ error: 'not logged in' });

  return res.status(200).json({ email: user.email, displayName: user.display_name, slug: user.slug });
}
