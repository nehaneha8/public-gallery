import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '../_lib/db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'method not allowed' });

  const slug = String(req.query.slug ?? '');
  const userRes = await sql`SELECT id, display_name FROM users WHERE slug = ${slug}`;
  const user = userRes.rows[0] as { id: number; display_name: string } | undefined;
  if (!user) return res.status(404).json({ error: 'gallery not found' });

  const [artworksRes, sketchesRes, aboutRes] = await Promise.all([
    sql`SELECT id, title, description, size_category, image_url, aspect_ratio
        FROM artworks WHERE user_id = ${user.id} ORDER BY sort_order ASC`,
    sql`SELECT id, image_url FROM sketches WHERE user_id = ${user.id} ORDER BY sort_order ASC`,
    sql`SELECT opted_in, photo_url, prompts FROM about_sections WHERE user_id = ${user.id}`,
  ]);

  const about = aboutRes.rows[0] as
    | { opted_in: boolean; photo_url: string | null; prompts: { question: string; answer: string }[] }
    | undefined;

  return res.status(200).json({
    slug,
    displayName: user.display_name,
    artworks: artworksRes.rows.map((a) => ({
      id: String(a.id),
      title: a.title,
      description: a.description ?? undefined,
      src: a.image_url,
      aspectRatio: a.aspect_ratio,
      size: a.size_category,
    })),
    sketches: sketchesRes.rows.map((s) => ({ id: String(s.id), src: s.image_url })),
    about: about?.opted_in
      ? { photoSrc: about.photo_url ?? undefined, prompts: about.prompts }
      : null,
  });
}
