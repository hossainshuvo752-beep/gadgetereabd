"use client";

import { useCallback, useState } from 'react';

/**
 * THE shared newsletter-submission logic — every newsletter form on the
 * site (popup, homepage banner, future instances) uses this hook so
 * validation, Supabase insert and error mapping live in exactly one place.
 *
 * Persistence layer: the `newsletter_subscribers` table in Supabase
 * (INSERT-only RLS policy — the frontend can add subscribers but can
 * never read the list back). The email is never stored anywhere else.
 */
export type NewsletterStatus = 'idle' | 'loading' | 'success' | 'error' | 'already';

export type NewsletterSubmitResult =
  | { outcome: 'success' | 'already' }
  | { outcome: 'error'; message: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;

/** Single source of truth for email validation across newsletter forms. */
export const isValidEmail = (value: string): boolean => EMAIL_RE.test(value.trim());

export function useNewsletterSignup() {
  const [status, setStatus] = useState<NewsletterStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  const submit = useCallback(
    async (rawEmail: string): Promise<NewsletterSubmitResult> => {
      const email = rawEmail.trim();

      if (email === '') {
        const message = 'Please enter your email address.';
        setStatus('error');
        setError(message);
        return { outcome: 'error', message };
      }
      if (!isValidEmail(email)) {
        const message = 'Please enter a valid email address.';
        setStatus('error');
        setError(message);
        return { outcome: 'error', message };
      }

      setStatus('loading');
      setError(null);

      try {
        const { supabase } = await import('@/lib/supabase');

        const { error: insertError } = await supabase
          .from('newsletter_subscribers')
          .insert({ email });

        if (insertError) {
          // 23505 = Postgres unique_violation on `email` — this person is
          // already on the list, which is a friendly success, not a failure.
          if (insertError.code === '23505') {
            setStatus('already');
            return { outcome: 'already' };
          }
          const message =
            "Something went wrong — please try again in a moment. If it keeps failing, it may be a temporary network issue.";
          setStatus('error');
          setError(message);
          return { outcome: 'error', message };
        }

        setStatus('success');
        return { outcome: 'success' };
      } catch {
        // Client construction failure (missing env vars) or network layer error
        const message = 'Connection problem — please try again shortly.';
        setStatus('error');
        setError(message);
        return { outcome: 'error', message };
      }
    },
    []
  );

  return { submit, status, error, reset: () => { setStatus('idle'); setError(null); } };
}
