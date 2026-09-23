/**
 * TechBD client analytics tracker (Cluster 2 of the analytics build).
 *
 * Ported from the reference admin-analytics export (tracking.ts) and adapted:
 *  - Storage keys renamed to techbd_*.
 *  - Funnel events use TechBD's conversion vocabulary (see supabase/analytics-schema.sql).
 *  - LESSON #1 FIX BUILT IN: the reference lost page stats on SPA navigations
 *    because document.visibilitychange / pagehide never fired for client-side
 *    route changes, so `page_view` heartbeats (and time_on_page close-out)
 *    were never sent for routes after the first load. Fix: a MutationObserver
 *    on <title> (Next updates it on every route change) + a pathname snapshot
 *    re-opens a fresh "page context" on every navigation — flush + new
 *    heartbeat cycle — with no dependence on visibility events.
 *
 * Fire-and-forget: every send is queued and flushed by `navigator.sendBeacon`
 * or keepalive fetch; nothing here ever blocks rendering or throws to the app.
 * This module is imported ONLY by AnalyticsBootstrap (mounted once in the
 * root layout) so normal page bundles stay untouched until needed.
 */

const API = '/api/analytics/collect';
const SESSION_KEY = 'techbd_sid';
const SESSION_TS_KEY = 'techbd_sid_ts';
const UID_KEY = 'techbd_uid';
const SENT_EVENTS_KEY = 'techbd_sent';
const SENT_TTL_MS = 6 * 60 * 60 * 1000; // dedupe window: 6h

const SESSION_TTL_MS = 30 * 60 * 1000; // 30 min of inactivity = new session

type EventName =
  | 'page_view'
  | 'scroll_depth'
  | 'time_on_page'
  | 'page_load'
  | 'js_error'
  | 'header_search'
  | 'faq_expand'
  | 'contact_submit'
  | 'register_success'
  | 'login_success'
  | 'newsletter_subscribe'
  | 'newsletter_shown'
  | 'product_view'
  | 'add_to_cart'
  | 'checkout_view'
  | 'begin_checkout'
  | 'order_placed';

type Pending = {
  event: EventName;
  page?: string;
  meta?: Record<string, unknown>;
};

let queue: Pending[] = [];
let flushTimer: ReturnType<typeof setTimeout> | null = null;
let booted = false;

let currentPath = '';
let pageOpenedAt = 0;
let scrollMarksSent = new Set<number>();
let heartbeat: ReturnType<typeof setInterval> | null = null;

// ---------------------------------------------------------------------------
// storage helpers (all localStorage access guarded — private mode etc.)
// ---------------------------------------------------------------------------
function lsGet(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}
function lsSet(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* ignore */
  }
}

// ---------------------------------------------------------------------------
// session identity
// ---------------------------------------------------------------------------
function ensureSession(): string {
  const now = Date.now();
  const sid = lsGet(SESSION_KEY);
  const ts = Number(lsGet(SESSION_TS_KEY) || 0);
  if (sid && now - ts < SESSION_TTL_MS) {
    lsSet(SESSION_TS_KEY, String(now));
    return sid;
  }
  const fresh =
    (crypto.randomUUID?.() ||
      `${now.toString(36)}${Math.random().toString(36).slice(2, 10)}`) as string;
  lsSet(SESSION_KEY, fresh);
  lsSet(SESSION_TS_KEY, String(now));
  return fresh;
}

function ensureVisitorId(): string | null {
  let uid = lsGet(UID_KEY);
  if (!uid) {
    uid = (crypto.randomUUID?.() ||
      `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`) as string;
    lsSet(UID_KEY, uid);
  }
  return uid;
}

/** Stable, storage-backed dedupe for one-shot events (lesson #8). */
export function markEventSent(key: string): boolean {
  const now = Date.now();
  let map: Record<string, number> = {};
  try {
    map = JSON.parse(lsGet(SENT_EVENTS_KEY) || '{}') as Record<string, number>;
  } catch {
    map = {};
  }
  // prune expired entries while we're here
  for (const k of Object.keys(map)) {
    if (now - map[k] > SENT_TTL_MS) delete map[k];
  }
  if (map[key]) return false; // already sent inside the window
  map[key] = now;
  lsSet(SENT_EVENTS_KEY, JSON.stringify(map));
  return true;
}

// ---------------------------------------------------------------------------
// queue + flush
// ---------------------------------------------------------------------------
export function track(event: EventName, meta?: Record<string, unknown>) {
  if (!booted || typeof window === 'undefined') return;
  queue.push({ event, page: currentPath || location.pathname, meta });
  if (flushTimer) return;
  flushTimer = setTimeout(flush, 1500); // small batch window; still fire-and-forget
}

function flush() {
  flushTimer = null;
  if (!queue.length) return;
  const batch = queue;
  queue = [];

  const payload = {
    sid: ensureSession(),
    uid: ensureVisitorId(),
    events: batch,
    screen: `${window.screen?.width ?? 0}x${window.screen?.height ?? 0}`,
  };

  const body = JSON.stringify(payload);
  // sendBeacon survives page unload; keepalive fetch is the fallback.
  if (navigator.sendBeacon?.(API, new Blob([body], { type: 'application/json' }))) {
    return;
  }
  void fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
    keepalive: true,
  }).catch(() => {
    /* analytics must never surface errors */
  });
}

// ---------------------------------------------------------------------------
// page context (LESSON #1 FIX)
// ---------------------------------------------------------------------------
function openPageContext(path: string) {
  // close the previous page's timing first (sends time_on_page for it)
  closePageTiming();

  currentPath = path;
  pageOpenedAt = Date.now();
  scrollMarksSent = new Set();

  track('page_view');
  track('page_load', { ms: Math.round(performance.now()) });

  if (heartbeat) clearInterval(heartbeat);
  // heartbeat keeps `last_activity` fresh and later powers time_on_page
  heartbeat = setInterval(() => {
    if (document.visibilityState === 'visible') track('time_on_page', { at: Date.now() - pageOpenedAt });
  }, 15000);
}

function closePageTiming() {
  if (!currentPath || !pageOpenedAt) return;
  const secs = Math.round((Date.now() - pageOpenedAt) / 1000);
  if (secs >= 5) track('time_on_page', { seconds: secs, closing: true });
}

/** The SPA route-change detector: Next re-renders <title> per route. */
function watchRouteChanges() {
  const titleEl = document.querySelector('title');
  if (!titleEl) return;
  const obs = new MutationObserver(() => {
    if (location.pathname !== currentPath) openPageContext(location.pathname);
  });
  obs.observe(titleEl, { childList: true, characterData: true, subtree: true });
}

// ---------------------------------------------------------------------------
// scroll depth
// ---------------------------------------------------------------------------
function onScroll() {
  if (!currentPath) return;
  const doc = document.documentElement;
  const max = doc.scrollHeight - window.innerHeight;
  if (max <= 0) return;
  const pct = Math.min(100, Math.round((window.scrollY / max) * 100));
  for (const mark of [25, 50, 75, 100]) {
    if (pct >= mark && !scrollMarksSent.has(mark)) {
      scrollMarksSent.add(mark);
      track('scroll_depth', { percent: mark });
    }
  }
}

// ---------------------------------------------------------------------------
// Core Web Vitals (dynamic import — never blocks the page)
// ---------------------------------------------------------------------------
type VitalMetric = { name: string; value: number; rating?: string };

async function initWebVitals() {
  try {
    const mod = (await import('web-vitals')) as {
      onCLS: (cb: (m: VitalMetric) => void) => void;
      onLCP: (cb: (m: VitalMetric) => void) => void;
      onINP?: (cb: (m: VitalMetric) => void) => void;
    };
    const report = (metric: VitalMetric) => {
      track('page_load', {
        cwv: metric.name,
        value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
        rating: metric.rating,
      });
    };
    mod.onCLS(report);
    mod.onLCP(report);
    mod.onINP?.(report);
  } catch {
    /* web-vitals unavailable — skip silently */
  }
}

// ---------------------------------------------------------------------------
// boot
// ---------------------------------------------------------------------------
export function initTracking() {
  if (booted || typeof window === 'undefined') return;
  booted = true;

  openPageContext(location.pathname);
  watchRouteChanges();
  void initWebVitals();

  window.addEventListener('scroll', onScroll, { passive: true });

  // Refined close-out on tab hide/unload — the SPA-safe complement, not the
  // sole mechanism (that was the reference's bug).
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flush();
  });
  window.addEventListener('pagehide', flush);

  window.addEventListener('error', (e) => {
    track('js_error', {
      message: String(e.message).slice(0, 300),
      source: String(e.filename || '').slice(-120),
      line: e.lineno,
    });
  });
}
