import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from './_lib/db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'method not allowed' });

  const result = await sql`
    SELECT u.slug, u.display_name,
      (SELECT image_url FROM artworks WHERE user_id = u.id ORDER BY sort_order ASC LIMIT 1) AS thumbnail
    FROM users u
    ORDER BY u.created_at DESC
  `;

  return res.status(200).json({
    galleries: result.rows.map((r) => ({
      slug: r.slug,
      displayName: r.display_name,
      thumbnail: r.thumbnail ?? null,
    })),
  });
}
