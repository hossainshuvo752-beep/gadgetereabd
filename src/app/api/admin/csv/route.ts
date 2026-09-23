import { NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/adminAuth';
import { loadAdminData } from '@/lib/adminData';
import { toCsv } from '@/lib/adminCsv';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Formats an ISO date as a compact dd-MMM-yyyy for spreadsheet display. */
function csvDate(iso: string): string {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * CSV export for the admin tables — /api/admin/csv?table=users|messages.
 * Protected by the same server-verified admin cookie; the browser's
 * cookie rides along automatically on the download request.
 */
export async function GET(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const table = new URL(request.url).searchParams.get('table');
  if (table !== 'users' && table !== 'messages') {
    return NextResponse.json(
      { error: "Unknown table — use 'users' or 'messages'." },
      { status: 400 }
    );
  }

  try {
    const data = await loadAdminData();
    const today = new Date().toISOString().slice(0, 10);

    let csv: string;
    let filename: string;
    if (table === 'users') {
      csv = toCsv(
        ['Name', 'Email', 'Phone', 'Newsletter Subscribed', 'Registered'],
        data.users.map((u) => [
          u.name,
          u.email,
          u.phone,
          u.newsletterSubscribed ? 'Yes' : 'No',
          csvDate(u.registeredAt),
        ])
      );
      filename = `techbd-users-${today}.csv`;
    } else {
      csv = toCsv(
        ['Name', 'Email', 'Subject', 'Message', 'Received'],
        data.messages.map((m) => [
          m.name,
          m.email,
          m.subject,
          m.message,
          csvDate(m.receivedAt),
        ])
      );
      filename = `techbd-messages-${today}.csv`;
    }

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Export failed' },
      { status: 500 }
    );
  }
}
