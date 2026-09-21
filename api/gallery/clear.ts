import type { VercelRequest, VercelResponse } from '@vercel/node';
import { del } from '@vercel/blob';
import { sql } from '../_lib/db.js';
import { getSessionUserId } from '../_lib/session.js';

// Wipes all gallery content (artworks, sketches, about-me) for the logged-in
// user, but keeps their account so they stay logged in and can start
// uploading again immediately — the account itself is never deleted here.
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const userId = getSessionUserId(req);
  if (!userId) return res.status(401).json({ error: 'not logged in' });
  if (req.method !== 'DELETE') return res.status(405).json({ error: 'method not allowed' });

  const [artworksRes, sketchesRes, aboutRes] = await Promise.all([
    sql`SELECT image_url FROM artworks WHERE user_id = ${userId}`,
    sql`SELECT image_url FROM sketches WHERE user_id = ${userId}`,
    sql`SELECT photo_url FROM about_sections WHERE user_id = ${userId}`,
  ]);

  const urls = [
    ...artworksRes.rows.map((r) => r.image_url as string),
    ...sketchesRes.rows.map((r) => r.image_url as string),
    ...aboutRes.rows.map((r) => r.photo_url as string | null).filter((u): u is string => !!u),
  ];

  await Promise.all([
    sql`DELETE FROM artworks WHERE user_id = ${userId}`,
    sql`DELETE FROM sketches WHERE user_id = ${userId}`,
    sql`DELETE FROM about_sections WHERE user_id = ${userId}`,
  ]);

  if (urls.length > 0) {
    try {
      await del(urls, process.env.BLOB_READ_WRITE_TOKEN ? { token: process.env.BLOB_READ_WRITE_TOKEN } : undefined);
    } catch {
      // Blob cleanup failing shouldn't fail the whole clear — the DB rows
      // (what the site actually reads from) are already gone either way.
    }
  }

  return res.status(200).json({ ok: true });
}
