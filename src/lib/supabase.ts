import { createClient } from '@supabase/supabase-js';

/**
 * Supabase client — backend for sensitive/user-generated data ONLY.
 *
 * Product and blog catalog data deliberately stays in src/lib (static,
 * versioned, SEO-critical). Anything user-generated or sensitive
 * (accounts, form submissions, newsletter lists, orders) goes here.
 *
 * Values come from environment variables — never hardcoded:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY
 * (see .env.example; set them locally in .env.local and in Vercel's
 * dashboard for the live site).
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase configuration: set NEXT_PUBLIC_SUPABASE_URL and ' +
      'NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local (local) and in Vercel ' +
      'Environment Variables (production).'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
