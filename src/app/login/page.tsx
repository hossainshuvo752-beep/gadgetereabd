"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { friendlyAuthError } from '@/context/AuthContext';

/**
 * Login - real Supabase Auth password login. On success the AuthProvider
 * picks up the session automatically (onAuthStateChange) and the user is
 * sent to /account.
 */

const inputClasses =
  'w-full px-4 py-2 border border-text-heading/20 rounded-md text-text-heading placeholder-text-body focus:outline-none focus:ring-2 focus:ring-accent';

export default function LoginPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const form = new FormData(e.currentTarget);
    const email = String(form.get('email') ?? '').trim();
    const password = String(form.get('password') ?? '');

    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setSubmitting(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setSubmitting(false);
      setError(friendlyAuthError(signInError.message));
      return;
    }

    // Session established; AuthProvider updates everywhere via its listener.
    router.push('/account');
    router.refresh();
  };

  return (
    <section className="py-12 bg-bg-light min-h-[calc(100vh-64px)]">
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-text-heading mb-2">Login</h1>
        <p className="text-text-body mb-8">
          Welcome back - log in to manage your orders and saved gadgets.
        </p>

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
              autoComplete="current-password"
              placeholder="Your password"
              className={inputClasses}
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full px-6 py-2.5 bg-accent text-text-on-dark font-medium rounded-md hover:bg-accent-hover transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="text-sm text-text-body mt-6 text-center">
          New to TechBD?{' '}
          <Link href="/register" className="text-accent hover:text-accent-hover font-medium">
            Create an account
          </Link>
        </p>
      </div>
    </section>
  );
}
