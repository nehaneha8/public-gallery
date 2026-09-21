import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '../_lib/db.js';
import bcrypt from 'bcryptjs';
import { signSession, setSessionCookie } from '../_lib/session.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method not allowed' });

  const { email, password } = req.body ?? {};
  if (typeof email !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ error: 'email and password are required' });
  }

  const result = await sql`SELECT id, password_hash, slug FROM users WHERE email = ${email}`;
  const user = result.rows[0] as { id: number; password_hash: string; slug: string } | undefined;
  if (!user) return res.status(401).json({ error: 'invalid email or password' });

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) return res.status(401).json({ error: 'invalid email or password' });

  setSessionCookie(req, res, signSession(user.id));
  return res.status(200).json({ slug: user.slug });
}
