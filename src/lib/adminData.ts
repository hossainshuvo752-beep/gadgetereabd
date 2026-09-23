import 'server-only';
import { createAdminClient } from '@/lib/supabaseAdmin';

/**
 * All dashboard data is loaded here — server-side only, via the service-role
 * client. Orders flow in from /checkout (orders + order_items tables).
 */

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  phone: string;
  newsletterSubscribed: boolean;
  registeredAt: string; // ISO
};

export type AdminMessage = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  receivedAt: string; // ISO
};

export type AdminOrderItem = {
  title: string;
  variant: string;
  qty: number;
  unitPrice: number;
};

export type AdminOrder = {
  id: string;
  orderNumber: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  address: string;
  city: string;
  paymentMethod: string;
  items: AdminOrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: string;
  createdAt: string; // ISO
};

export type AdminData = {
  users: AdminUser[];
  messages: AdminMessage[];
  orders: AdminOrder[];
  newUsersThisWeek: number;
  pendingOrders: number;
  totalOrders: number;
  orderedValue: number;
};

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export async function loadAdminData(): Promise<AdminData> {
  const db = createAdminClient();

  // Registered users: auth.users (email + created_at) merged with profiles
  // (full_name, phone). auth.admin.listUsers returns newest-created order
  // but we sort explicitly below.
  const { data: authData, error: authError } = await db.auth.admin.listUsers({
    perPage: 1000,
  });
  if (authError) throw new Error(`auth listUsers failed: ${authError.message}`);
  const authUsers = authData?.users ?? [];

  const { data: profileRows, error: profileError } = await db
    .from('profiles')
    .select('id, full_name, phone, created_at');
  if (profileError)
    throw new Error(`profiles select failed: ${profileError.message}`);
  const profilesById = new Map<string, { full_name: string | null; phone: string | null; created_at: string | null }>();
  for (const row of profileRows ?? []) {
    profilesById.set(row.id, row);
  }

  // Newsletter cross-check: the service role CAN read this table even
  // though RLS hides it from anon clients.
  const { data: subscriberRows, error: subscriberError } = await db
    .from('newsletter_subscribers')
    .select('email');
  if (subscriberError)
    throw new Error(
      `newsletter_subscribers select failed: ${subscriberError.message}`
    );
  const subscriberEmails = new Set(
    (subscriberRows ?? []).map((r) => (r.email ?? '').trim().toLowerCase())
  );

  const now = Date.now();
  const users: AdminUser[] = authUsers
    .map((u) => {
      const profile = profilesById.get(u.id);
      const email = (u.email ?? '').trim();
      return {
        id: u.id,
        name: profile?.full_name || (u.user_metadata?.full_name as string | undefined) || '—',
        email,
        phone: profile?.phone?.trim() || '',
        newsletterSubscribed: subscriberEmails.has(email.toLowerCase()),
        registeredAt: u.created_at ?? profile?.created_at ?? '',
      };
    })
    .sort(
      (a, b) =>
        new Date(b.registeredAt).getTime() - new Date(a.registeredAt).getTime()
    );

  const newUsersThisWeek = users.filter(
    (u) => u.registeredAt && now - new Date(u.registeredAt).getTime() < WEEK_MS
  ).length;

  // Contact messages — newest first.
  const { data: messageRows, error: messageError } = await db
    .from('contact_messages')
    .select('id, name, email, subject, message, created_at')
    .order('created_at', { ascending: false });
  if (messageError)
    throw new Error(`contact_messages select failed: ${messageError.message}`);

  const messages: AdminMessage[] = (messageRows ?? []).map((r) => ({
    id: r.id,
    name: r.name,
    email: r.email,
    subject: r.subject ?? '',
    message: r.message,
    receivedAt: r.created_at,
  }));

  // Orders — newest first, with their line items (service role reads all).
  const { data: orderRows, error: orderError } = await db
    .from('orders')
    .select(
      'id, order_number, contact_name, contact_phone, contact_email, address, city, payment_method, subtotal, delivery_fee, total, status, created_at'
    )
    .order('created_at', { ascending: false });
  if (orderError) throw new Error(`orders select failed: ${orderError.message}`);

  const { data: itemRows, error: itemError } = await db
    .from('order_items')
    .select('order_id, title, variant, qty, unit_price');
  if (itemError) throw new Error(`order_items select failed: ${itemError.message}`);
  const itemsByOrder = new Map<string, AdminOrderItem[]>();
  for (const item of itemRows ?? []) {
    const list = itemsByOrder.get(item.order_id) ?? [];
    list.push({
      title: item.title,
      variant: item.variant,
      qty: item.qty,
      unitPrice: item.unit_price,
    });
    itemsByOrder.set(item.order_id, list);
  }

  const orders: AdminOrder[] = (orderRows ?? []).map((r) => ({
    id: r.id,
    orderNumber: r.order_number,
    contactName: r.contact_name,
    contactPhone: r.contact_phone,
    contactEmail: r.contact_email ?? '',
    address: r.address,
    city: r.city,
    paymentMethod: r.payment_method,
    items: itemsByOrder.get(r.id) ?? [],
    subtotal: r.subtotal,
    deliveryFee: r.delivery_fee,
    total: r.total,
    status: r.status,
    createdAt: r.created_at,
  }));

  return {
    users,
    messages,
    orders,
    newUsersThisWeek,
    pendingOrders: orders.filter((o) => o.status === 'pending').length,
    totalOrders: orders.length,
    orderedValue: orders.reduce((sum, o) => sum + o.total, 0),
  };
}
