"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Password gate for /admin. The submitted password is checked SERVER-SIDE
 * (POST /api/admin/login against ADMIN_PASSWORD); nothing about the check
 * runs in the browser. On success the httpOnly session cookie is set and
 * the server component re-renders the dashboard.
 */
export default function AdminGate() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!password) {
      setError('Please enter the admin password.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        router.refresh(); // re-run the server component, now authenticated
        return;
      }
      setError('Incorrect password.');
    } catch {
      setError('Connection problem — please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="py-12 bg-bg-light min-h-[calc(100vh-64px)]">
      <div className="max-w-sm mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-text-on-dark border border-text-heading/10 rounded-lg p-8 text-center">
          <div className="text-4xl mb-4">🔒</div>
          <h1 className="text-xl font-bold text-text-heading mb-2">Admin Access</h1>
          <p className="text-text-body text-sm mb-6">
            Enter the admin password to open the dashboard.
          </p>
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError(null);
              }}
              placeholder="Admin password"
              autoComplete="current-password"
              className={`w-full px-4 py-2.5 border rounded-md text-text-heading placeholder-text-body focus:outline-none focus:ring-2 ${
                error
                  ? 'border-danger ring-1 ring-danger'
                  : 'border-text-heading/20 focus:ring-accent'
              }`}
            />
            {error && (
              <p role="alert" className="text-sm text-danger text-left">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="w-full px-6 py-2.5 bg-accent text-text-on-dark font-medium rounded-md hover:bg-accent-hover transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? 'Checking…' : 'Unlock Dashboard'}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
