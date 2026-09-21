"use client";

import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';

// Subscription flag: the ONLY persisted state. Once the user actually
// submits the subscribe form, the popup never appears again — on any page,
// in any future session. Closing the popup (X / outside click) stores
// nothing, so it reappears after 15s on the next mounted page/visit.
const SUBSCRIBED_KEY = 'techbd_newsletter_subscribed';
const SHOW_DELAY_MS = 15000;

const NewsletterPopup: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // Show the popup 15s after landing on a mounted page, unless the user
  // has already subscribed. No "shown/dismissed" tracking of any kind.
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

  // Actual subscribe: persist permanently and close.
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    localStorage.setItem(SUBSCRIBED_KEY, 'true');
    setSubmitted(true);
    setTimeout(() => setIsOpen(false), 1200);
  };

  if (!isOpen) return null;

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

        {submitted ? (
          <p className="text-center text-accent font-medium">
            Thanks for subscribing! 🎉 Check your inbox soon.
          </p>
        ) : (
          <>
            <form className="flex" onSubmit={handleSubmit}>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 h-12 rounded-l-lg border border-text-heading/10 bg-text-on-dark px-4 text-text-heading placeholder-text-body focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <button
                type="submit"
                className="h-12 rounded-r-lg bg-accent px-6 text-text-on-dark font-medium hover:bg-accent-hover"
              >
                Subscribe
              </button>
            </form>
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
