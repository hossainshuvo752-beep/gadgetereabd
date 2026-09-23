-- ============================================================================
-- TechBD Analytics schema — adapted from the reference admin-analytics build.
-- Run in the Supabase SQL Editor. Idempotent-ish: guarded with IF NOT EXISTS.
--
-- Funnel vocabulary adapted for TechBD (NOT the affiliate original):
--   conversions = add_to_cart, checkout_view/begin_checkout (checkout intent),
--   newsletter_subscribe, contact_submit, register_success.
-- All analytics tables are SERVICE-ROLE ONLY: RLS enabled with NO policies,
-- so anon/authed clients can neither read nor write them. The tracker API
-- and the dashboard read/write via the server-side service-role key only.
-- ============================================================================

-- 1. Raw events (append-only; dashboards never display from this table)
create table if not exists public.analytics_events (
  id bigserial primary key,
  session_id text not null,
  user_id text,                          -- populated for logged-in visitors
  event text not null,
  page text default '',
  source text default 'direct',
  device text default 'unknown',
  os text,
  browser text,
  country text default 'unknown',
  city text default 'unknown',
  url text default '',
  ref_host text,
  utm_campaign text,
  utm_medium text,
  utm_source text,
  meta jsonb default '{}',
  created_at timestamptz not null default now()
);

create index if not exists analytics_events_created_idx on public.analytics_events (created_at desc);
create index if not exists analytics_events_session_idx on public.analytics_events (session_id);
create index if not exists analytics_events_event_idx on public.analytics_events (event);
create index if not exists analytics_events_page_idx on public.analytics_events (page);
create index if not exists analytics_events_created_id_idx on public.analytics_events (created_at, id);

-- 2. One row per visit (upserted by the ingest API)
create table if not exists public.analytics_sessions (
  session_id text primary key,
  user_id text,
  source text default 'direct',
  device text default 'unknown',
  country text default 'unknown',
  city text default 'unknown',
  landing_page text default '',
  exit_page text default '',
  started_at timestamptz not null default now(),
  last_activity timestamptz not null default now(),
  ended_at timestamptz,
  page_views int default 1,
  interactions int default 0,
  duration_seconds int default 0
);

create index if not exists analytics_sessions_last_activity_idx on public.analytics_sessions (last_activity desc);

-- 3. Daily totals keyed by (date, source, device, country)
create table if not exists public.analytics_daily (
  date date not null,
  source text not null default 'direct',
  device text not null default 'unknown',
  country text not null default 'unknown',
  visitors int default 0,
  unique_visitors int default 0,
  sessions int default 0,
  page_views int default 0,
  bounces int default 0,
  session_seconds int default 0,
  -- TechBD funnel counters (adapted from the affiliate original):
  product_views int default 0,
  add_to_cart int default 0,
  checkouts int default 0,
  newsletter_subscribes int default 0,
  newsletter_shown int default 0,
  contact_submits int default 0,
  registers int default 0,
  primary key (date, source, device, country)
);

-- 4. Daily per-page stats
create table if not exists public.analytics_pages_daily (
  date date not null,
  page text not null,
  views int default 0,
  unique_views int default 0,
  time_on_page_seconds int default 0,
  exits int default 0,
  referral_hits int default 0,
  primary key (date, page)
);

-- 5. The workhorse: one JSON report payload per UTC day
create table if not exists public.analytics_reports (
  id bigserial primary key,
  date date not null unique,
  payload jsonb not null,
  created_at timestamptz not null default now()
);

-- 6. Search Console snapshot cache (single row, id = 'snapshot')
create table if not exists public.search_console_cache (
  id text primary key default 'snapshot',
  site_url text,
  fetched_at timestamptz,
  totals jsonb,
  trend jsonb,
  queries jsonb,
  pages jsonb,
  sitemaps jsonb,
  inspections jsonb,
  last_error jsonb
);

-- Lock everything down: RLS on, zero policies -> only the service role
-- (server-side) can touch these tables.
alter table public.analytics_events enable row level security;
alter table public.analytics_sessions enable row level security;
alter table public.analytics_daily enable row level security;
alter table public.analytics_pages_daily enable row level security;
alter table public.analytics_reports enable row level security;
alter table public.search_console_cache enable row level security;

-- ---------------------------------------------------------------------------
-- Newsletter enrichment: source/country columns so the SubscriberTable (and
-- CSV export) can show where signups came from. Cheap now — table is tiny.
-- ---------------------------------------------------------------------------
alter table public.newsletter_subscribers add column if not exists source text;
alter table public.newsletter_subscribers add column if not exists country text;
alter table public.newsletter_subscribers add column if not exists city text;

-- Verify afterwards:
--   select tablename, rowsecurity from pg_tables
--   where tablename like 'analytics%' or tablename = 'search_console_cache';
--   -> rowsecurity = true on all six.
