import Link from 'next/link';
import { isAdminAuthenticated } from '@/lib/adminAuth';
import AdminGate from '@/components/admin/AdminGate';
import { AnalyticsNav } from './AnalyticsNav';

export const dynamic = 'force-dynamic';

/**
 * Analytics section layout — cookie-gates EVERY /admin/analytics/* page in
 * one place (the gate component is reused from the main admin dashboard)
 * and renders the shared section nav (client component — carries the
 * selected date range between tabs so switching pages preserves it).
 */
export default async function AnalyticsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authed = await isAdminAuthenticated();
  if (!authed) {
    return <AdminGate />;
  }

  return (
    <section className="py-8 bg-bg-light min-h-[calc(100vh-64px)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
          <div>
            <h1 className="text-2xl font-bold text-text-heading">Analytics</h1>
            <p className="text-text-body text-sm mt-0.5">
              Internal traffic &amp; conversion data — service-role, server-side only.
            </p>
          </div>
          <Link
            href="/admin"
            className="text-sm text-accent hover:underline"
          >
            ← Back to dashboard
          </Link>
        </div>

        <AnalyticsNav />

        {children}
      </div>
    </section>
  );
}
