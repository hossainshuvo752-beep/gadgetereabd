import { NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/adminAuth';
import { createAdminClient } from '@/lib/supabaseAdmin';

export const runtime = 'nodejs';

const ALLOWED_STATUSES = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

/**
 * PATCH /api/admin/orders/[id] — admin-only order status update.
 * Runs through the service-role client (RLS has no admin UPDATE policy,
 * by design — the only write path is this server-side route, protected by
 * the admin session cookie).
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  let status = '';
  try {
    const body = (await request.json()) as { status?: unknown };
    if (typeof body?.status === 'string') status = body.status;
  } catch {
    // fall through
  }

  if (!ALLOWED_STATUSES.includes(status)) {
    return NextResponse.json(
      { error: `Invalid status — must be one of: ${ALLOWED_STATUSES.join(', ')}.` },
      { status: 400 }
    );
  }

  const db = createAdminClient();
  const { error } = await db.from('orders').update({ status }).eq('id', id);
  if (error) {
    return NextResponse.json(
      { error: 'Could not update the order status.' },
      { status: 500 }
    );
  }
  return NextResponse.json({ ok: true });
}
