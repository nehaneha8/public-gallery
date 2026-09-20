import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '../_lib/db.js';
import bcrypt from 'bcryptjs';
import { signSession, setSessionCookie } from '../_lib/session.js';

function slugify(name: string): string {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  return base || 'artist';
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method not allowed' });

  const { email, password, displayName } = req.body ?? {};
  if (typeof email !== 'string' || typeof password !== 'string' || typeof displayName !== 'string') {
    return res.status(400).json({ error: 'email, password, and displayName are required' });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'password must be at least 8 characters' });
  }

  const existing = await sql`SELECT id FROM users WHERE email = ${email}`;
  if (existing.rows.length > 0) {
    return res.status(409).json({ error: 'an account with that email already exists' });
  }

  const baseSlug = slugify(displayName);
  let slug = baseSlug;
  let suffix = 1;
  // eslint-disable-next-line no-await-in-loop
  while ((await sql`SELECT id FROM users WHERE slug = ${slug}`).rows.length > 0) {
    suffix += 1;
    slug = `${baseSlug}-${suffix}`;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const result = await sql`
    INSERT INTO users (email, password_hash, display_name, slug)
    VALUES (${email}, ${passwordHash}, ${displayName}, ${slug})
    RETURNING id, slug
  `;
  const user = result.rows[0] as { id: number; slug: string };

  setSessionCookie(res, signSession(user.id));
  return res.status(201).json({ slug: user.slug });
}
