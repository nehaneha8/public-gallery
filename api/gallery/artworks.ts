import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '@vercel/postgres';
import { getSessionUserId } from '../_lib/session';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const userId = getSessionUserId(req);
  if (!userId) return res.status(401).json({ error: 'not logged in' });

  if (req.method === 'POST') {
    const { title, description, size, imageUrl, aspectRatio } = req.body ?? {};
    if (!title || !size || !imageUrl || !aspectRatio) {
      return res.status(400).json({ error: 'title, size, imageUrl, and aspectRatio are required' });
    }
    if (!['small', 'medium', 'large'].includes(size)) {
      return res.status(400).json({ error: 'size must be small, medium, or large' });
    }
    const countRes = await sql`SELECT COUNT(*)::int AS count FROM artworks WHERE user_id = ${userId}`;
    const sortOrder = (countRes.rows[0] as { count: number }).count;
    const result = await sql`
      INSERT INTO artworks (user_id, title, description, size_category, image_url, aspect_ratio, sort_order)
      VALUES (${userId}, ${title}, ${description ?? null}, ${size}, ${imageUrl}, ${aspectRatio}, ${sortOrder})
      RETURNING id
    `;
    return res.status(201).json({ id: (result.rows[0] as { id: number }).id });
  }

  if (req.method === 'PATCH') {
    const { id, title, description, size, sortOrder } = req.body ?? {};
    if (!id) return res.status(400).json({ error: 'id is required' });
    await sql`
      UPDATE artworks SET
        title = COALESCE(${title ?? null}, title),
        description = COALESCE(${description ?? null}, description),
        size_category = COALESCE(${size ?? null}, size_category),
        sort_order = COALESCE(${sortOrder ?? null}, sort_order)
      WHERE id = ${id} AND user_id = ${userId}
    `;
    return res.status(200).json({ ok: true });
  }

  if (req.method === 'DELETE') {
    const id = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;
    if (!id) return res.status(400).json({ error: 'id is required' });
    await sql`DELETE FROM artworks WHERE id = ${id} AND user_id = ${userId}`;
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: 'method not allowed' });
}
