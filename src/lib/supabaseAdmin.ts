import 'server-only';
import { createClient } from '@supabase/supabase-js';

/**
 * Service-role Supabase client — SERVER ONLY.
 *
 * The service_role key bypasses RLS entirely, so this client may only ever
 * be imported from server components / route handlers. The `server-only`
 * package makes any client-side import a hard build error. The key is read
 * from env (never NEXT_PUBLIC_, never committed, never sent to the browser).
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      'Admin client misconfigured: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must both be set on the server.'
    );
  }

  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
