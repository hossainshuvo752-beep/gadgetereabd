"use client";

import React, { useState } from 'react';
import { useNewsletterSignup } from '@/hooks/useNewsletterSignup';

const NewsletterBanner: React.FC = () => {
  const [email, setEmail] = useState('');
  const { submit, status, error } = useNewsletterSignup('banner');

  // Shared Supabase-backed submission (same hook as the popup): inline
  // validation, real insert into newsletter_subscribers, 23505 mapped to
  // the already-subscribed outcome. Inline errors only — no native tooltip.
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await submit(email);
  };

  const busy = status === 'loading';
  const succeeded = status === 'success' || status === 'already';

  return (
    <section className="bg-bg-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-3xl font-bold text-center text-text-on-dark mb-4">
          Get Weekly Tech Deals & Updates 🔥
        </h2>
        <p className="text-center text-text-on-dark/70 mb-6">
          Subscribe for exclusive reviews, new arrivals and tech tips
        </p>
        <div className="flex flex-col items-center">
          {succeeded ? (
            <p className="text-accent font-medium" role="status">
              {status === 'already'
                ? "You're already subscribed! 🎉"
                : 'Thanks for subscribing! 🎉 Check your inbox soon.'}
            </p>
          ) : (
            <>
              {/* MOBILE: stacked full-width form — the side-by-side row's min-width
                  (~330px from input placeholder + button) overflowed the px-4
                  container on small phones, making the input touch the screen
                  edge. SM+: original side-by-side row, capped at max-w-md. */}
              <form
                noValidate
                onSubmit={handleSubmit}
                className="flex flex-col sm:flex-row items-stretch sm:items-center w-full max-w-md"
              >
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  disabled={busy}
                  className={`h-12 w-full rounded-lg sm:rounded-l-lg sm:rounded-r-none border bg-text-on-dark px-4 text-text-heading placeholder-text-body focus:outline-none focus:ring-2 disabled:opacity-60 ${
                    error
                      ? 'border-danger ring-1 ring-danger'
                      : 'border-text-heading/10 focus:ring-accent'
                  }`}
                />
                <button
                  type="submit"
                  disabled={busy}
                  className="h-12 w-full sm:w-auto rounded-lg sm:rounded-l-none sm:rounded-r-none sm:rounded-r-lg bg-accent px-6 text-text-on-dark font-medium hover:bg-accent-hover mt-2 sm:mt-0 disabled:opacity-60"
                >
                  {busy ? 'Subscribing…' : 'Subscribe'}
                </button>
              </form>
              {/* Inline error from the shared hook — validation or insert
                  failure — styled to the site tokens, no native tooltip. */}
              {error && (
                <p className="mt-2 text-sm text-danger" role="alert">
                  {error}
                </p>
              )}
            </>
          )}
          <p className="mt-2 text-text-on-dark/50 text-sm">
            We respect your privacy. Unsubscribe anytime.
          </p>
        </div>
      </div>
    </section>
  );
};

export default NewsletterBanner;
