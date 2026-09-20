import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '../_lib/db.js';
import { getSessionUserId } from '../_lib/session.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const userId = getSessionUserId(req);
  if (!userId) return res.status(401).json({ error: 'not logged in' });

  if (req.method === 'POST') {
    const { imageUrl } = req.body ?? {};
    if (!imageUrl) return res.status(400).json({ error: 'imageUrl is required' });
    const countRes = await sql`SELECT COUNT(*)::int AS count FROM sketches WHERE user_id = ${userId}`;
    const sortOrder = (countRes.rows[0] as { count: number }).count;
    const result = await sql`
      INSERT INTO sketches (user_id, image_url, sort_order)
      VALUES (${userId}, ${imageUrl}, ${sortOrder})
      RETURNING id
    `;
    return res.status(201).json({ id: (result.rows[0] as { id: number }).id });
  }

  if (req.method === 'PATCH') {
    const { id, sortOrder } = req.body ?? {};
    if (!id || sortOrder === undefined) return res.status(400).json({ error: 'id and sortOrder are required' });
    await sql`UPDATE sketches SET sort_order = ${sortOrder} WHERE id = ${id} AND user_id = ${userId}`;
    return res.status(200).json({ ok: true });
  }

  if (req.method === 'DELETE') {
    const id = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;
    if (!id) return res.status(400).json({ error: 'id is required' });
    await sql`DELETE FROM sketches WHERE id = ${id} AND user_id = ${userId}`;
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: 'method not allowed' });
}
