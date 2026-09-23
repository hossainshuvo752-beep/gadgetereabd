import { NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/adminAuth';
import { loadAdminData } from '@/lib/adminData';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Dashboard data endpoint — SERVER ONLY access via the verified admin
 * cookie. All queries run through the service-role client server-side;
 * nothing is ever fetched client-side.
 */
export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const data = await loadAdminData();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to load data' },
      { status: 500 }
    );
  }
}
