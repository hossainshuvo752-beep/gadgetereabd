-- ============================================================================
-- TechBD Orders schema — run in the Supabase SQL Editor.
-- Stores real orders placed through /checkout (Buy Now + cart flows).
-- Prices are whole taka (int) — matches the site's ৳ formatting.
-- ============================================================================

-- 1. Orders — one row per placed order
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,            -- display ID, e.g. TechBD-7K3M9Q2
  user_id uuid references auth.users(id) on delete set null,  -- null = guest checkout
  contact_name text not null,
  contact_phone text not null,
  contact_email text,
  address text not null,
  city text not null,
  payment_method text not null default 'cod',   -- cod | bkash | nagad
  subtotal int not null default 0,
  delivery_fee int not null default 0,
  total int not null default 0,
  status text not null default 'pending',       -- pending|confirmed|shipped|delivered|cancelled
  newsletter_opt_in boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists orders_created_idx on public.orders (created_at desc);
create index if not exists orders_user_idx on public.orders (user_id);

-- 2. Line items — what was bought, at the price when it was bought
create table if not exists public.order_items (
  id bigserial primary key,
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id int not null,
  title text not null,
  variant text not null default 'Standard',
  qty int not null default 1,
  unit_price int not null,
  line_total int not null
);

create index if not exists order_items_order_idx on public.order_items (order_id);

-- 3. RLS: anyone (guest or logged-in) can place an order; nobody can read
--    or change orders through the public API except:
--    - the service role (admin dashboard, server-side), and
--    - logged-in users reading their OWN orders (account order history).
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

create policy "allow_public_insert"
on public.orders
for insert
to anon, authenticated
with check (true);

create policy "users_read_own_orders"
on public.orders
for select
to authenticated
using (auth.uid() = user_id);

create policy "allow_public_insert"
on public.order_items
for insert
to anon, authenticated
with check (true);

create policy "users_read_own_items"
on public.order_items
for select
to authenticated
using (
  exists (
    select 1 from public.orders o
    where o.id = order_id and o.user_id = auth.uid()
  )
);

-- Verify afterwards:
--   select tablename, rowsecurity from pg_tables
--   where tablename in ('orders','order_items');  -> rowsecurity = true
