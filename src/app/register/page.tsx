"use client";

import React, { useState } from 'react';
import Link from 'next/link';

/**
 * Register — UI placeholder only (same pattern as the Contact page form).
 * No real account creation yet: submit just shows a success panel.
 */
export default function RegisterPage() {
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
        <h1 className="text-3xl font-bold text-text-heading mb-2">Register</h1>
        <p className="text-text-body mb-8">
          Create a TechBD account to track orders and save your favourite
          gadgets.
        </p>

        {submitted ? (
          <div
            role="status"
            className="bg-text-on-dark border border-text-heading/10 rounded-lg p-8 text-center"
          >
            <div className="text-3xl mb-3">🎉</div>
            <h2 className="text-xl font-bold text-text-heading mb-2">
              Account created!
            </h2>
            <p className="text-text-body mb-6">
              This is a placeholder confirmation — no real account system is
              connected yet.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                href="/login"
                className="px-6 py-2.5 bg-accent text-text-on-dark font-medium rounded-md hover:bg-accent-hover transition-colors"
              >
                Go to Login
              </Link>
              <button
                onClick={() => setSubmitted(false)}
                className="px-6 py-2.5 border border-accent text-accent font-medium rounded-md hover:bg-accent/10 transition-colors"
              >
                Register another
              </button>
            </div>
          </div>
        ) : (
          <>
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-text-heading mb-2"
                >
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  placeholder="Your full name"
                  className={inputClasses}
                />
              </div>
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
                  placeholder="Choose a password"
                  className={inputClasses}
                />
              </div>
              <button
                type="submit"
                className="w-full px-6 py-2.5 bg-accent text-text-on-dark font-medium rounded-md hover:bg-accent-hover transition-colors"
              >
                Create Account
              </button>
            </form>

            <p className="text-sm text-text-body mt-6 text-center">
              Already have an account?{' '}
              <Link href="/login" className="text-accent hover:text-accent-hover font-medium">
                Login here
              </Link>
            </p>
          </>
        )}
      </div>
    </section>
  );
}
