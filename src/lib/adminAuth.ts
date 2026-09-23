import 'server-only';
import crypto from 'crypto';
import { cookies } from 'next/headers';

/**
 * Admin session helpers — SERVER ONLY.
 *
 * The password itself never reaches the browser: the login route compares
 * it timing-safely against ADMIN_PASSWORD and, on success, sets an httpOnly
 * cookie holding an HMAC token derived from server-side secrets. Pages and
 * routes verify the cookie value with a timing-safe comparison. No client
 * code can read or forge any of this.
 */
export const ADMIN_COOKIE = 'techbd_admin_session';

/** Admin session lifetime. */
const SESSION_TTL_SECONDS = Number(process.env.ADMIN_SESSION_TTL_HOURS ?? 8) * 60 * 60;

function sessionSecret(): string {
  // HMAC key material: ADMIN_COOKIE_SECRET when set (dedicated secret),
  // otherwise a combination of the two server secrets so the token is
  // useless without either one.
  const dedicated = process.env.ADMIN_COOKIE_SECRET;
  if (dedicated) return dedicated;
  return `${process.env.ADMIN_PASSWORD ?? ''}:${process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''}`;
}

export function sessionToken(): string {
  const body = Buffer.from(
    JSON.stringify({
      sub: 'admin',
      exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
    })
  ).toString('base64url');
  const sig = crypto.createHmac('sha256', sessionSecret()).update(body).digest('base64url');
  return `${body}.${sig}`;
}

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

/** Compares a submitted password against ADMIN_PASSWORD (timing-safe). */
export function verifyAdminPassword(password: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false; // env not configured -> nobody gets in
  return safeEqual(password, expected);
}

/** Reads + verifies the admin session cookie in server components/routes. */
export async function isAdminAuthenticated(): Promise<boolean> {
  const store = await cookies();
  const value = store.get(ADMIN_COOKIE)?.value;
  if (!value) return false;
  if (!process.env.ADMIN_PASSWORD) return false;

  // Token format: base64url(payload).base64url(HMAC). Verify the signature
  // timing-safely, then the payload (sub + exp).
  const dot = value.lastIndexOf('.');
  if (dot < 0) return false;
  const body = value.slice(0, dot);
  const sig = value.slice(dot + 1);
  const expected = crypto.createHmac('sha256', sessionSecret()).update(body).digest('base64url');
  if (!safeEqual(sig, expected)) return false;
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as {
      sub?: string;
      exp?: number;
    };
    if (payload.sub !== 'admin') return false;
    if (typeof payload.exp !== 'number' || payload.exp < Date.now() / 1000) return false;
    return true;
  } catch {
    return false;
  }
}
