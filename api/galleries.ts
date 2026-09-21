import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from './_lib/db.js';
import { resolveGalleryTitle } from './_lib/galleryTitle.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'method not allowed' });

  // Only list users with actual content — an account whose gallery was
  // cleared (Dashboard's "Delete my gallery") still exists but shouldn't
  // show up here until they upload something again.
  const result = await sql`
    SELECT u.slug, u.display_name, u.gallery_title,
      (SELECT image_url FROM artworks WHERE user_id = u.id ORDER BY sort_order ASC LIMIT 1) AS thumbnail
    FROM users u
    WHERE EXISTS (SELECT 1 FROM artworks WHERE user_id = u.id)
       OR EXISTS (SELECT 1 FROM sketches WHERE user_id = u.id)
       OR EXISTS (SELECT 1 FROM about_sections WHERE user_id = u.id AND opted_in = true)
    ORDER BY u.created_at DESC
  `;

  return res.status(200).json({
    galleries: result.rows.map((r) => ({
      slug: r.slug,
      title: resolveGalleryTitle(r.display_name, r.gallery_title),
      thumbnail: r.thumbnail ?? null,
    })),
  });
}
