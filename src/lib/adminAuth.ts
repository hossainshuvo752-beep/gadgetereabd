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

function sessionSecret(): string {
  // HMAC key material combines both server-side secrets so the token is
  // useless without either one.
  return `${process.env.ADMIN_PASSWORD ?? ''}:${process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''}`;
}

export function sessionToken(): string {
  return crypto
    .createHmac('sha256', sessionSecret())
    .update('techbd-admin-session-v1')
    .digest('hex');
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
  return safeEqual(value, sessionToken());
}
