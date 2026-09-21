"use client";

import React, { useState } from 'react';
import Link from 'next/link';

/**
 * Login — UI placeholder only (same pattern as the Contact page form).
 * No real authentication yet: submit just shows a success panel.
 */
export default function LoginPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const inputClasses =
    'w-full px-4 py-2 border border-text-heading/20 rounded-md text-text-heading placeholder-text-body focus:outline-none focus:ring-2 focus:ring-accent';

  return (
    <section className="py-12 bg-bg-light min-h-[calc(100vh-64px)]">
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-text-heading mb-2">Login</h1>
        <p className="text-text-body mb-8">
          Welcome back — log in to manage your orders and saved gadgets.
        </p>

        {submitted ? (
          <div
            role="status"
            className="bg-text-on-dark border border-text-heading/10 rounded-lg p-8 text-center"
          >
            <div className="text-3xl mb-3">✅</div>
            <h2 className="text-xl font-bold text-text-heading mb-2">
              Login successful!
            </h2>
            <p className="text-text-body mb-6">
              This is a placeholder confirmation — no real authentication is
              connected yet.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                href="/account"
                className="px-6 py-2.5 bg-accent text-text-on-dark font-medium rounded-md hover:bg-accent-hover transition-colors"
              >
                Go to My Account
              </Link>
              <button
                onClick={() => setSubmitted(false)}
                className="px-6 py-2.5 border border-accent text-accent font-medium rounded-md hover:bg-accent/10 transition-colors"
              >
                Back to login
              </button>
            </div>
          </div>
        ) : (
          <>
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-text-heading mb-2"
                >
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  placeholder="you@example.com"
                  className={inputClasses}
                />
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-text-heading mb-2"
                >
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  required
                  placeholder="Your password"
                  className={inputClasses}
                />
              </div>
              <button
                type="submit"
                className="w-full px-6 py-2.5 bg-accent text-text-on-dark font-medium rounded-md hover:bg-accent-hover transition-colors"
              >
                Login
              </button>
            </form>

            <p className="text-sm text-text-body mt-6 text-center">
              New to TechBD?{' '}
              <Link href="/register" className="text-accent hover:text-accent-hover font-medium">
                Create an account
              </Link>
            </p>
          </>
        )}
      </div>
    </section>
  );
}
