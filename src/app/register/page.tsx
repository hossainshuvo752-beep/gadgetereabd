"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { track } from '@/lib/tracking';
import { friendlyAuthError } from '@/context/AuthContext';

/**
 * Register — real Supabase Auth signup (email/password). Supabase manages
 * credentials and sessions internally (auth.users); we only store the
 * display name and optional phone: in signup metadata first, mirrored into
 * `profiles` when a session exists (confirmation OFF). Confirmation ON is
 * handled below.
 */

const inputClasses =
  'w-full px-4 py-2 border border-text-heading/20 rounded-md text-text-heading placeholder-text-body focus:outline-none focus:ring-2 focus:ring-accent';

type Status =
  | { kind: 'idle' }
  | { kind: 'submitting' }
  | { kind: 'needs-confirmation' }
  | { kind: 'done' }
  | { kind: 'error'; message: string };

export default function RegisterPage() {
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const form = new FormData(e.currentTarget);
    const name = String(form.get('name') ?? '').trim();
    const email = String(form.get('email') ?? '').trim();
    const password = String(form.get('password') ?? '');

    // Client-side validation (no native browser tooltips)
    if (name.length < 2) {
      setError('Please enter your name.');
      return;
    }
    // Optional — validated only when provided.
    const phone = String(form.get('phone') ?? '').trim();
    if (phone && !/^[+]?[\d\s()-]{6,20}$/.test(phone)) {
      setError('Please enter a valid phone number (or leave it blank).');
      return;
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setStatus({ kind: 'submitting' });
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    });

    if (signUpError) {
      setStatus({ kind: 'idle' });
      setError(friendlyAuthError(signUpError.message));
      return;
    }

    // Confirmation disabled: session exists now -> create profile row.
    if (data.session && data.user) {
      await supabase
        .from('profiles')
        .insert({ id: data.user.id, full_name: name, phone: phone || null });
      track('register_success', { with_phone: Boolean(phone) });
      setStatus({ kind: 'done' });
      return;
    }

    // Confirmation enabled (default): user must click the email link.
    setStatus({ kind: 'needs-confirmation' });
  };

  return (
    <section className="py-12 bg-bg-light min-h-[calc(100vh-64px)]">
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-text-heading mb-2">Register</h1>
        <p className="text-text-body mb-8">
          Create a TechBD account to track orders and save your favourite
          gadgets.
        </p>

        {status.kind === 'needs-confirmation' ? (
          <div
            role="status"
            className="bg-text-on-dark border border-text-heading/10 rounded-lg p-8 text-center"
          >
            <div className="text-3xl mb-3">📧</div>
            <h2 className="text-xl font-bold text-text-heading mb-2">
              Check your email to confirm
            </h2>
            <p className="text-text-body mb-6">
              We sent a confirmation link to your email address. Confirm it,
              then log in to finish setting up your account.
            </p>
            <Link
              href="/login"
              className="px-6 py-2.5 bg-accent text-text-on-dark font-medium rounded-md hover:bg-accent-hover transition-colors"
            >
              Go to Login
            </Link>
          </div>
        ) : status.kind === 'done' ? (
          <div
            role="status"
            className="bg-text-on-dark border border-text-heading/10 rounded-lg p-8 text-center"
          >
            <div className="text-3xl mb-3">🎉</div>
            <h2 className="text-xl font-bold text-text-heading mb-2">
              Account created!
            </h2>
            <p className="text-text-body mb-6">
              You are signed in and ready to go.
            </p>
            <Link
              href="/account"
              className="px-6 py-2.5 bg-accent text-text-on-dark font-medium rounded-md hover:bg-accent-hover transition-colors"
            >
              Go to My Account
            </Link>
          </div>
        ) : (
          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <p
                role="alert"
                className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-4 py-2"
              >
                {error}
              </p>
            )}
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
                autoComplete="name"
                placeholder="Your full name"
                className={inputClasses}
              />
            </div>
            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-text-heading mb-2"
              >
                Phone <span className="font-normal text-text-body">(optional)</span>
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                autoComplete="tel"
                placeholder="01XXXXXXXXX"
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
                autoComplete="email"
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
                autoComplete="new-password"
                placeholder="Choose a password (8+ characters)"
                className={inputClasses}
              />
            </div>
            <button
              type="submit"
              disabled={status.kind === 'submitting'}
              className="w-full px-6 py-2.5 bg-accent text-text-on-dark font-medium rounded-md hover:bg-accent-hover transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {status.kind === 'submitting' ? 'Creating account…' : 'Create Account'}
            </button>

            <p className="text-sm text-text-body text-center">
              Already have an account?{' '}
              <Link href="/login" className="text-accent hover:text-accent-hover font-medium">
                Login here
              </Link>
            </p>
          </form>
        )}
      </div>
    </section>
  );
}
