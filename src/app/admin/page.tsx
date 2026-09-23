import { isAdminAuthenticated } from '@/lib/adminAuth';
import { loadAdminData } from '@/lib/adminData';
import AdminOrderStatusSelect from '@/components/admin/AdminOrderStatusSelect';
import AdminGate from '@/components/admin/AdminGate';
import AdminLogoutButton from '@/components/admin/AdminLogoutButton';
import AdminCsvButton from '@/components/admin/AdminCsvButton';

export const dynamic = 'force-dynamic';

/** dd MMM yyyy for table dates. */
function fmtDate(iso: string): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

const th =
  'px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-text-body';
const td = 'px-4 py-3 text-sm text-text-heading align-top';

/**
 * Unified Admin Dashboard — a SERVER component. The password gate, session
 * cookie and every database query live server-side; the client only ever
 * receives the rendered dashboard (or the gate). Data comes exclusively
 * from the service-role client via loadAdminData().
 */
export default async function AdminPage() {
  const authed = await isAdminAuthenticated();

  if (!authed) {
    return <AdminGate />;
  }

  let data;
  try {
    data = await loadAdminData();
  } catch (error) {
    return (
      <section className="py-12 bg-bg-light min-h-[calc(100vh-64px)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-text-on-dark border border-text-heading/10 rounded-lg p-10 text-center">
            <div className="text-3xl mb-3">⚠️</div>
            <h1 className="text-xl font-bold text-text-heading mb-2">
              Dashboard data could not be loaded
            </h1>
            <p className="text-text-body max-w-lg mx-auto">
              The server could not read the Supabase data. Check that
              NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set
              correctly in this environment.
            </p>
          </div>
        </div>
      </section>
    );
  }

  const stats = [
    {
      label: 'Registered Users',
      value: String(data.users.length),
      hint:
        data.newUsersThisWeek > 0
          ? `+${data.newUsersThisWeek} this week`
          : undefined,
    },
    {
      label: 'Total Orders',
      value: String(data.totalOrders),
      hint:
        data.pendingOrders > 0
          ? `${data.pendingOrders} pending`
          : 'all handled',
    },
    {
      label: 'Contact Messages',
      value: String(data.messages.length),
      hint: undefined,
    },
    {
      label: 'Ordered Value',
      value: `৳${data.orderedValue.toLocaleString()}`,
      hint: 'all time',
    },
  ];

  return (
    <section className="py-10 bg-bg-light min-h-[calc(100vh-64px)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-text-heading">Admin Dashboard</h1>
            <p className="text-text-body mt-1">
              Users, orders and messages — server-side data, protected access.
            </p>
          </div>
          <AdminLogoutButton />
        </div>

        {/* Overview stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {stats.map(({ label, value, hint }) => (
            <div
              key={label}
              className="bg-text-on-dark border border-text-heading/10 rounded-lg p-5"
            >
              <p className="text-sm text-text-body">{label}</p>
              <p className="text-3xl font-bold text-text-heading mt-1">{value}</p>
              {hint && <p className="text-xs text-accent font-medium mt-1">{hint}</p>}
            </div>
          ))}
        </div>

        {/* Registered users */}
        <div className="mb-10">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h2 className="text-xl font-bold text-text-heading">Registered Users</h2>
            <AdminCsvButton table="users" label="Download as CSV" />
          </div>
          {data.users.length === 0 ? (
            <div className="bg-text-on-dark border border-text-heading/10 rounded-lg p-8 text-center text-text-body">
              No registered users yet.
            </div>
          ) : (
            <div className="bg-text-on-dark border border-text-heading/10 rounded-lg overflow-x-auto">
              <table className="w-full min-w-[640px]">
                <thead className="border-b border-text-heading/10">
                  <tr>
                    <th className={th}>Name</th>
                    <th className={th}>Email</th>
                    <th className={th}>Phone</th>
                    <th className={th}>Newsletter</th>
                    <th className={th}>Registered</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-text-heading/5">
                  {data.users.map((u) => (
                    <tr key={u.id}>
                      <td className={`${td} font-medium`}>{u.name}</td>
                      <td className={td}>{u.email || '—'}</td>
                      <td className={td}>{u.phone || '—'}</td>
                      <td className={td}>
                        {u.newsletterSubscribed ? (
                          <span className="text-green-600 font-medium">Subscribed</span>
                        ) : (
                          <span className="text-text-body">No</span>
                        )}
                      </td>
                      <td className={`${td} whitespace-nowrap`}>{fmtDate(u.registeredAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Orders */}
        <div className="mb-10">
          <h2 className="text-xl font-bold text-text-heading mb-4">Orders</h2>
          {data.orders.length === 0 ? (
            <div className="bg-text-on-dark border border-text-heading/10 rounded-lg p-8 text-center text-text-body">
              No orders yet.
            </div>
          ) : (
            <div className="bg-text-on-dark border border-text-heading/10 rounded-lg overflow-x-auto">
              <table className="w-full min-w-[820px]">
                <thead className="border-b border-text-heading/10">
                  <tr>
                    <th className={th}>Order</th>
                    <th className={th}>Customer</th>
                    <th className={th}>Items</th>
                    <th className={th}>Total</th>
                    <th className={th}>Placed</th>
                    <th className={th}>Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-text-heading/5">
                  {data.orders.map((o) => (
                    <tr key={o.id}>
                      <td className={`${td} whitespace-nowrap`}>
                        <span className="font-mono text-xs font-semibold text-accent">{o.orderNumber}</span>
                        <span className="block text-xs text-text-body mt-0.5">{o.paymentMethod.toUpperCase()}</span>
                      </td>
                      <td className={td}>
                        <span className="font-medium">{o.contactName}</span>
                        <span className="block text-xs text-text-body">{o.contactPhone}</span>
                        {o.contactEmail && (
                          <span className="block text-xs text-text-body">{o.contactEmail}</span>
                        )}
                        <span className="block text-xs text-text-body mt-0.5">
                          {o.address}, {o.city}
                        </span>
                      </td>
                      <td className={td}>
                        {o.items.map((item, i) => (
                          <span key={`${o.id}-item-${i}`} className="block text-xs text-text-body">
                            {item.qty} × {item.title}
                            <span className="text-text-heading"> ({item.variant})</span>
                          </span>
                        ))}
                      </td>
                      <td className={`${td} whitespace-nowrap font-semibold`}>
                        ৳{o.total.toLocaleString()}
                      </td>
                      <td className={`${td} whitespace-nowrap`}>{fmtDate(o.createdAt)}</td>
                      <td className={td}>
                        <AdminOrderStatusSelect orderId={o.id} current={o.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Contact messages */}
        <div className="mb-4">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h2 className="text-xl font-bold text-text-heading">Contact Messages</h2>
            <AdminCsvButton table="messages" label="Download as CSV" />
          </div>
          {data.messages.length === 0 ? (
            <div className="bg-text-on-dark border border-text-heading/10 rounded-lg p-8 text-center text-text-body">
              No contact messages yet.
            </div>
          ) : (
            <div className="bg-text-on-dark border border-text-heading/10 rounded-lg overflow-x-auto">
              <table className="w-full min-w-[640px]">
                <thead className="border-b border-text-heading/10">
                  <tr>
                    <th className={th}>Name</th>
                    <th className={th}>Email</th>
                    <th className={th}>Subject</th>
                    <th className={th}>Message</th>
                    <th className={th}>Received</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-text-heading/5">
                  {data.messages.map((m) => (
                    <tr key={m.id}>
                      <td className={`${td} font-medium`}>{m.name}</td>
                      <td className={td}>{m.email}</td>
                      <td className={td}>{m.subject || '—'}</td>
                      <td className={`${td} whitespace-pre-line max-w-sm`}>{m.message}</td>
                      <td className={`${td} whitespace-nowrap`}>{fmtDate(m.receivedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
