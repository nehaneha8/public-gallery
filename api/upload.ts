import type { VercelRequest, VercelResponse } from '@vercel/node';
import sharp from 'sharp';
import { put } from '@vercel/blob';
import { getSessionUserId } from './_lib/session.js';

// Raw image bytes in the body (Content-Type: image/*), not multipart or
// JSON/base64 — simplest to parse without a form-data library, and avoids
// base64's ~33% size inflation on phone photos.
export const config = { api: { bodyParser: false } };

const MAX_EDGE = 1600;
const QUALITY = 82;
const MAX_BYTES = 12 * 1024 * 1024; // 12MB raw upload cap

function readBody(req: VercelRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let total = 0;
    req.on('data', (chunk: Buffer) => {
      total += chunk.length;
      if (total > MAX_BYTES) {
        reject(new Error('file too large'));
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method not allowed' });

  const userId = getSessionUserId(req);
  if (!userId) return res.status(401).json({ error: 'not logged in' });

  let raw: Buffer;
  try {
    raw = await readBody(req);
  } catch {
    return res.status(413).json({ error: 'file too large' });
  }
  if (raw.length === 0) return res.status(400).json({ error: 'no image data' });

  // Same resize + WebP pipeline as scripts/process-art.mjs: auto-orient
  // from EXIF, downscale (never upscale) so the long edge is at most
  // MAX_EDGE, encode to WebP.
  let pipeline = sharp(raw).rotate();
  const meta = await pipeline.metadata();
  const w = meta.width ?? MAX_EDGE;
  const h = meta.height ?? MAX_EDGE;
  if (Math.max(w, h) > MAX_EDGE) {
    pipeline = pipeline.resize({
      width: w >= h ? MAX_EDGE : undefined,
      height: h > w ? MAX_EDGE : undefined,
      fit: 'inside',
    });
  }

  let outBuffer: Buffer;
  let aspectRatio: number;
  try {
    outBuffer = await pipeline.webp({ quality: QUALITY }).toBuffer();
    const outMeta = await sharp(outBuffer).metadata();
    aspectRatio = (outMeta.width ?? 1) / (outMeta.height ?? 1);
  } catch {
    return res.status(400).json({ error: 'not a readable image' });
  }

  const key = `u${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.webp`;
  // This project has OIDC enabled for Blob access, which @vercel/blob
  // prefers automatically — but OIDC isn't available in vercel dev's
  // "development" environment, so it errors there even with
  // BLOB_READ_WRITE_TOKEN also set. Passing the token explicitly bypasses
  // that auto-detection; production/preview still auto-detect OIDC since
  // BLOB_READ_WRITE_TOKEN isn't set there.
  const blob = await put(key, outBuffer, {
    access: 'public',
    contentType: 'image/webp',
    ...(process.env.BLOB_READ_WRITE_TOKEN ? { token: process.env.BLOB_READ_WRITE_TOKEN } : {}),
  });

  return res.status(200).json({ url: blob.url, aspectRatio: Number(aspectRatio.toFixed(4)) });
}
