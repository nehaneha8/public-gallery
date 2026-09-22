import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '../_lib/db.js';
import bcrypt from 'bcryptjs';
import { signSession, setSessionCookie } from '../_lib/session.js';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// The username becomes the gallery's URL directly (/g/<username>), so it's
// validated as a URL-safe slug up front rather than derived-then-suffixed
// from a display name — this is also why it must be rejected outright on
// collision instead of auto-appended with "-2", "-3", etc.
const USERNAME_PATTERN = /^[a-z0-9](?:[a-z0-9-]{1,28}[a-z0-9])?$/;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method not allowed' });

  const { email, password, username } = req.body ?? {};
  if (typeof username !== 'string' || !username.trim()) {
    return res.status(400).json({ error: 'Username is required.' });
  }
  const normalizedUsername = username.trim().toLowerCase();
  if (!USERNAME_PATTERN.test(normalizedUsername)) {
    return res.status(400).json({
      error: 'Username must be 3-30 characters: lowercase letters, numbers, and hyphens only, no spaces.',
    });
  }
  if (typeof email !== 'string' || !email.trim()) {
    return res.status(400).json({ error: 'Email is required.' });
  }
  if (!EMAIL_PATTERN.test(email.trim())) {
    return res.status(400).json({ error: "That doesn't look like a valid email address." });
  }
  if (typeof password !== 'string' || !password) {
    return res.status(400).json({ error: 'Password is required.' });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters.' });
  }

  const existingUsername = await sql`SELECT id FROM users WHERE slug = ${normalizedUsername}`;
  if (existingUsername.rows.length > 0) {
    return res.status(409).json({ error: 'That username is already taken.' });
  }

  const existingEmail = await sql`SELECT id FROM users WHERE email = ${email}`;
  if (existingEmail.rows.length > 0) {
    return res.status(409).json({ error: 'An account with that email already exists.' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const result = await sql`
    INSERT INTO users (email, password_hash, display_name, slug)
    VALUES (${email}, ${passwordHash}, ${normalizedUsername}, ${normalizedUsername})
    RETURNING id, slug
  `;
  const user = result.rows[0] as { id: number; slug: string };

  setSessionCookie(req, res, signSession(user.id));
  return res.status(201).json({ slug: user.slug });
}
