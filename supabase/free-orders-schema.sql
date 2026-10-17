-- ============================================================================
-- Jupiter BD Free Orders schema — run in the Supabase SQL Editor.
-- Stores the free-order REQUESTS sent from /free-order (the single Free Order
-- button on listing cards and product detail pages). A free order is a
-- request, not a purchase: nothing is charged and no cart is involved.
--
-- The `surface` column records which placement produced the request:
-- shop-card | new-arrivals-card | deals-card | shop-detail | quick-look.
-- ============================================================================

create table if not exists public.free_orders (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,               -- display ID, e.g. JBD-7K3M9Q2
  user_id uuid references auth.users(id) on delete set null,  -- null = guest
  product_id int not null,
  product_title text not null,
  product_slug text not null,
  variant text not null default 'Standard',
  list_price int,                               -- reference only; may be estimated
  price_estimated boolean not null default true,
  contact_name text not null,
  contact_phone text not null,
  contact_email text,
  address text not null,
  city text not null,
  note text,
  surface text not null default 'shop-card'
    check (surface in ('shop-card','new-arrivals-card','deals-card','shop-detail','quick-look')),
  status text not null default 'pending',       -- pending|contacted|confirmed|cancelled
  created_at timestamptz not null default now()
);

create index if not exists free_orders_created_idx on public.free_orders (created_at desc);
create index if not exists free_orders_user_idx on public.free_orders (user_id);
create index if not exists free_orders_surface_idx on public.free_orders (surface);

-- RLS: anyone (guest or logged-in) may send a request; only the service role
-- (admin dashboard, server-side) and the owning logged-in user may read them.
alter table public.free_orders enable row level security;

create policy "allow_public_insert"
on public.free_orders
for insert
to anon, authenticated
with check (true);

create policy "users_read_own_free_orders"
on public.free_orders
for select
to authenticated
using (auth.uid() = user_id);

-- Verify afterwards:
--   select tablename, rowsecurity from pg_tables
--   where tablename = 'free_orders';  -> rowsecurity = true
