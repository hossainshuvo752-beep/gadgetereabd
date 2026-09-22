"use client";

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

/**
 * My Account - reflects real auth state. Logged in: greeting, name,
 * sign-out. Logged out: prompt to log in / register. Order history,
 * addresses and wishlist remain future features.
 */
export default function AccountPage() {
  const { session, displayName, authReady, signOut } = useAuth();

  return (
    <section className="py-12 bg-bg-light min-h-[calc(100vh-64px)]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-text-heading mb-8">My Account</h1>

        {!authReady ? (
          <div className="bg-text-on-dark border border-text-heading/10 rounded-lg p-12 text-center">
            <p className="text-text-body">Checking your session...</p>
          </div>
        ) : session ? (
          <div className="bg-text-on-dark border border-text-heading/10 rounded-lg p-12 text-center">
            <div className="text-4xl mb-4">👋</div>
            <h2 className="text-xl font-bold text-text-heading mb-2">
              Hi, {displayName ?? 'there'}
            </h2>
            <p className="text-text-body mb-8 max-w-md mx-auto">
              You are logged in. Order history, saved addresses and a wishlist
              are on the way.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                href="/shop"
                className="px-6 py-2.5 bg-accent text-text-on-dark font-medium rounded-md hover:bg-accent-hover transition-colors"
              >
                Browse the Shop
              </Link>
              <button
                type="button"
                onClick={() => signOut()}
                className="px-6 py-2.5 border border-accent text-accent font-medium rounded-md hover:bg-accent/10 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-text-on-dark border border-text-heading/10 rounded-lg p-12 text-center">
            <div className="text-4xl mb-4">👤</div>
            <h2 className="text-xl font-bold text-text-heading mb-2">
              You are not logged in
            </h2>
            <p className="text-text-body mb-8 max-w-md mx-auto">
              Log in or create an account to track orders and save your
              favourite gadgets.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                href="/login"
                className="px-6 py-2.5 bg-accent text-text-on-dark font-medium rounded-md hover:bg-accent-hover transition-colors"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="px-6 py-2.5 border border-accent text-accent font-medium rounded-md hover:bg-accent/10 transition-colors"
              >
                Register
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
