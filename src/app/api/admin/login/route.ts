import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  ADMIN_COOKIE,
  sessionToken,
  verifyAdminPassword,
} from '@/lib/adminAuth';

export const runtime = 'nodejs';

/**
 * Admin login — SERVER ONLY password check. The submitted password is
 * compared against ADMIN_PASSWORD here; on success an httpOnly cookie
 * with an HMAC session token is set. The browser never sees the password
 * or the token's derivation material.
 */
export async function POST(request: Request) {
  let password = '';
  try {
    const body = (await request.json()) as { password?: unknown };
    if (typeof body?.password === 'string') password = body.password;
  } catch {
    // fall through with empty password -> unauthorized
  }

  if (!password || !verifyAdminPassword(password)) {
    return NextResponse.json(
      { ok: false, error: 'Incorrect password.' },
      { status: 401 }
    );
  }

  const store = await cookies();
  store.set(ADMIN_COOKIE, sessionToken(), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 8, // 8-hour admin session
  });

  return NextResponse.json({ ok: true });
}
