"use client";

import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useNewsletterSignup } from '@/hooks/useNewsletterSignup';

// Display gate ONLY — set after a confirmed Supabase success/already-subscribed
// result so this browser stops auto-showing the popup. The actual subscription
// record lives in the newsletter_subscribers table; this flag never creates or
// fakes one. Closing the popup (X / outside click) stores nothing.
const SUBSCRIBED_KEY = 'techbd_newsletter_subscribed';
const SHOW_DELAY_MS = 15000;

const NewsletterPopup: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const { submit, status, error } = useNewsletterSignup();

  // Show the popup 15s after landing on a mounted page, unless this browser
  // has already completed a real subscription through Supabase. No
  // "shown/dismissed" tracking of any kind.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (localStorage.getItem(SUBSCRIBED_KEY)) return;

    const timer = setTimeout(() => {
      setIsOpen(true);
    }, SHOW_DELAY_MS);

    return () => clearTimeout(timer);
  }, []);

  // X button / overlay click: close this instance only. Nothing persisted —
  // the popup will reappear on the next page/visit after 15 seconds.
  const dismiss = () => {
    setIsOpen(false);
  };

  // Subscribe: the hook validates inline (no native tooltip), inserts into
  // Supabase, and maps 23505 to the already-subscribed outcome. The flag is
  // written ONLY on a confirmed database result.
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const result = await submit(email);
    if (result.outcome === 'error') return; // inline error is rendered from the hook

    if (typeof window !== 'undefined') {
      localStorage.setItem(SUBSCRIBED_KEY, 'true');
    }
    setTimeout(() => setIsOpen(false), 1600);
  };

  if (!isOpen) return null;

  const busy = status === 'loading';
  const succeeded = status === 'success' || status === 'already';

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-bg-dark/70 px-4"
      onClick={dismiss}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="newsletter-popup-title"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md bg-text-on-dark rounded-lg shadow-xl p-6 sm:p-8"
      >
        <button
          onClick={dismiss}
          aria-label="Close newsletter popup"
          className="absolute top-3 right-3 text-text-body hover:text-text-heading transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 id="newsletter-popup-title" className="text-2xl font-bold text-text-heading mb-2 text-center">
          Get Weekly Tech Deals &amp; Updates 🔥
        </h2>
        <p className="text-center text-text-body mb-6">
          Subscribe for exclusive reviews, new arrivals and tech tips
        </p>

        {succeeded ? (
          <p className="text-center text-accent font-medium" role="status">
            {status === 'already'
              ? "You're already subscribed! 🎉"
              : 'Thanks for subscribing! 🎉 Check your inbox soon.'}
          </p>
        ) : (
          <>
            {/* MOBILE: input + button stack vertically (side-by-side pushed
                Subscribe past the popup edge on narrow screens). SM+: the
                original side-by-side row. noValidate disables the browser's
                native tooltip — validation is inline below the input. */}
            <form
              noValidate
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row gap-3 sm:gap-0"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                disabled={busy}
                className={`h-12 w-full rounded-lg sm:rounded-l-lg sm:rounded-r-none border px-4 text-text-heading placeholder-text-body focus:outline-none focus:ring-2 disabled:opacity-60 ${
                  error
                    ? 'border-danger ring-1 ring-danger'
                    : 'border-text-heading/10 focus:ring-accent'
                }`}
              />
              <button
                type="submit"
                disabled={busy}
                className="h-12 w-full sm:w-auto rounded-lg sm:rounded-l-none sm:rounded-r-lg bg-accent px-6 text-text-on-dark font-medium hover:bg-accent-hover disabled:opacity-60"
              >
                {busy ? 'Subscribing…' : 'Subscribe'}
              </button>
            </form>
            {/* Inline error from the shared hook — validation or insert
                failure — styled to the site tokens, no native tooltips. */}
            {error && (
              <p className="mt-2 text-sm text-danger" role="alert">
                {error}
              </p>
            )}
            <p className="mt-2 text-center text-text-body text-sm">
              We respect your privacy. Unsubscribe anytime.
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default NewsletterPopup;
