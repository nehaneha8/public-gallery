import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '../_lib/db.js';
import { getSessionUserId } from '../_lib/session.js';
import { resolveGalleryTitle } from '../_lib/galleryTitle.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const userId = getSessionUserId(req);
  if (!userId) return res.status(401).json({ error: 'not logged in' });

  if (req.method === 'GET') {
    const result = await sql`SELECT email, display_name, slug, gallery_title FROM users WHERE id = ${userId}`;
    const user = result.rows[0] as
      | { email: string; display_name: string; slug: string; gallery_title: string | null }
      | undefined;
    if (!user) return res.status(401).json({ error: 'not logged in' });

    return res.status(200).json({
      email: user.email,
      displayName: user.display_name,
      slug: user.slug,
      title: resolveGalleryTitle(user.display_name, user.gallery_title),
    });
  }

  if (req.method === 'PATCH') {
    const { galleryTitle } = req.body ?? {};
    const trimmed = typeof galleryTitle === 'string' ? galleryTitle.trim() : '';
    const result = await sql`
      UPDATE users SET gallery_title = ${trimmed || null} WHERE id = ${userId}
      RETURNING display_name, gallery_title
    `;
    const user = result.rows[0] as { display_name: string; gallery_title: string | null };
    return res.status(200).json({ title: resolveGalleryTitle(user.display_name, user.gallery_title) });
  }

  return res.status(405).json({ error: 'method not allowed' });
}
