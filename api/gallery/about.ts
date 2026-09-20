import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '../_lib/db.js';
import { getSessionUserId } from '../_lib/session.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const userId = getSessionUserId(req);
  if (!userId) return res.status(401).json({ error: 'not logged in' });
  if (req.method !== 'PUT') return res.status(405).json({ error: 'method not allowed' });

  const { optedIn, photoUrl, prompts } = req.body ?? {};
  await sql`
    INSERT INTO about_sections (user_id, opted_in, photo_url, prompts)
    VALUES (${userId}, ${!!optedIn}, ${photoUrl ?? null}, ${JSON.stringify(prompts ?? [])})
    ON CONFLICT (user_id) DO UPDATE SET
      opted_in = EXCLUDED.opted_in,
      photo_url = EXCLUDED.photo_url,
      prompts = EXCLUDED.prompts
  `;
  return res.status(200).json({ ok: true });
}
