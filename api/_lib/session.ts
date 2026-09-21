import crypto from 'node:crypto';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const COOKIE_NAME = 'session';
const MAX_AGE_SECONDS = 30 * 24 * 60 * 60; // 30 days

function secret(): string {
  const s = process.env.SESSION_SECRET;
  if (!s) throw new Error('SESSION_SECRET env var is not set');
  return s;
}

// A minimal signed-cookie session (HMAC-SHA256 over a base64url JSON
// payload) rather than a full JWT library — one user id, one expiry, no
// need for anything heavier.
export function signSession(userId: number): string {
  const payload = JSON.stringify({ uid: userId, exp: Date.now() + MAX_AGE_SECONDS * 1000 });
  const encoded = Buffer.from(payload).toString('base64url');
  const sig = crypto.createHmac('sha256', secret()).update(encoded).digest('base64url');
  return `${encoded}.${sig}`;
}

function verifySession(token: string): number | null {
  const [encoded, sig] = token.split('.');
  if (!encoded || !sig) return null;
  const expected = crypto.createHmac('sha256', secret()).update(encoded).digest('base64url');
  const sigBuf = Buffer.from(sig);
  const expectedBuf = Buffer.from(expected);
  if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) return null;
  try {
    const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString());
    if (typeof payload.uid !== 'number' || payload.exp < Date.now()) return null;
    return payload.uid;
  } catch {
    return null;
  }
}

// Browsers silently drop `Secure` cookies on a plain http:// origin, which
// is exactly what `vercel dev` serves locally on localhost — omit it
// there. VERCEL_ENV isn't reliably set for vercel dev's function runtime,
// so this checks the actual request host instead: real deployments are
// always on a *.vercel.app or custom https domain, never literally
// "localhost".
function cookieSuffix(req: VercelRequest): string {
  const host = req.headers.host ?? '';
  return host.startsWith('localhost') || host.startsWith('127.0.0.1') ? '' : '; Secure';
}

export function setSessionCookie(req: VercelRequest, res: VercelResponse, token: string) {
  res.setHeader(
    'Set-Cookie',
    `${COOKIE_NAME}=${token}; Max-Age=${MAX_AGE_SECONDS}; Path=/; HttpOnly; SameSite=Lax${cookieSuffix(req)}`,
  );
}

export function clearSessionCookie(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Set-Cookie', `${COOKIE_NAME}=; Max-Age=0; Path=/; HttpOnly; SameSite=Lax${cookieSuffix(req)}`);
}

export function getSessionUserId(req: VercelRequest): number | null {
  const cookieHeader = req.headers.cookie ?? '';
  const match = cookieHeader
    .split(';')
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${COOKIE_NAME}=`));
  if (!match) return null;
  return verifySession(match.slice(COOKIE_NAME.length + 1));
}
