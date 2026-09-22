import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sql } from '../_lib/db.js';
import { getSessionUserId } from '../_lib/session.js';

// Sets the gallery's cover photo on the directory page, two independent
// ways that can both be sent in the same request:
//   - `photoUrl`: a directly-uploaded cover photo (or null to remove it).
//   - `artworkId`: star a specific painting as the cover (or null to reset
//     to the default: the first-uploaded painting).
// A photoUrl always wins over a starred artworkId — see api/galleries.ts.
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const userId = getSessionUserId(req);
  if (!userId) return res.status(401).json({ error: 'not logged in' });
  if (req.method !== 'PUT') return res.status(405).json({ error: 'method not allowed' });

  const body = req.body ?? {};

  if ('photoUrl' in body) {
    const photoUrl = typeof body.photoUrl === 'string' && body.photoUrl ? body.photoUrl : null;
    await sql`UPDATE users SET cover_photo_url = ${photoUrl} WHERE id = ${userId}`;
  }

  if ('artworkId' in body) {
    const { artworkId } = body;
    if (artworkId === null || artworkId === undefined) {
      await sql`UPDATE users SET cover_artwork_id = NULL WHERE id = ${userId}`;
    } else {
      const owned = await sql`SELECT id FROM artworks WHERE id = ${artworkId} AND user_id = ${userId}`;
      if (owned.rows.length === 0) {
        return res.status(400).json({ error: 'That painting is not in your gallery.' });
      }
      await sql`UPDATE users SET cover_artwork_id = ${artworkId} WHERE id = ${userId}`;
    }
  }

  const result = await sql`SELECT cover_artwork_id, cover_photo_url FROM users WHERE id = ${userId}`;
  const row = result.rows[0] as { cover_artwork_id: number | null; cover_photo_url: string | null };
  return res.status(200).json({
    coverArtworkId: row.cover_artwork_id !== null ? String(row.cover_artwork_id) : null,
    coverPhotoUrl: row.cover_photo_url,
  });
}
