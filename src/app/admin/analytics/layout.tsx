import Link from 'next/link';
import { isAdminAuthenticated } from '@/lib/adminAuth';
import AdminGate from '@/components/admin/AdminGate';

export const dynamic = 'force-dynamic';

/**
 * Analytics section layout — cookie-gates EVERY /admin/analytics/* page in
 * one place (the gate component is reused from the main admin dashboard)
 * and renders the shared section nav.
 */
const NAV = [
  { href: '/admin/analytics', label: 'Overview' },
  { href: '/admin/analytics/realtime', label: 'Realtime' },
  { href: '/admin/analytics/devices', label: 'Devices & Sources' },
  { href: '/admin/analytics/locations', label: 'Locations' },
  { href: '/admin/analytics/search', label: 'Search' },
  { href: '/admin/analytics/subscribers', label: 'Subscribers' },
  { href: '/admin/analytics/search-console', label: 'Search Console' },
];

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

        <nav className="flex flex-wrap gap-2 mb-8">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="px-3 py-1.5 text-sm rounded-md border border-text-heading/15 text-text-heading hover:bg-accent/10 hover:border-accent transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {children}
      </div>
    </section>
  );
}
