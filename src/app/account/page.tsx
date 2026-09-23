"use client";

import React from 'react';
import Link from 'next/link';
import {
  User,
  ShoppingCart,
  CreditCard,
  HelpCircle,
  Mail,
  Newspaper,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

/**
 * My Account — centred card design.
 *
 * Signed OUT: generic person avatar, "Welcome to TechBD" heading, quick-link
 * grid and Sign In / Create Account buttons.
 * Signed IN (auth is live via Supabase): the user's initials in the avatar,
 * a personal greeting, the same quick-link grid, and Browse Shop / Logout.
 */

const QUICK_LINKS = [
  { label: 'My Cart', href: '/cart', icon: ShoppingCart },
  { label: 'Checkout', href: '/checkout', icon: CreditCard },
  { label: 'Help & FAQ', href: '/faq', icon: HelpCircle },
  { label: 'Support / Contact', href: '/contact', icon: Mail },
  { label: 'Blog', href: '/blog', icon: Newspaper },
];

const initialsOf = (name: string): string =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]!.toUpperCase())
    .join('');

export default function AccountPage() {
  const { session, displayName, authReady, signOut } = useAuth();

  const initials = displayName ? initialsOf(displayName) : null;

  return (
    <section className="py-12 bg-bg-light min-h-[calc(100vh-64px)]">
      <div className="max-w-lg mx-auto px-4 sm:px-6 lg:px-8">
        {!authReady ? (
          <div className="bg-text-on-dark border border-text-heading/10 rounded-lg p-12 text-center">
            <p className="text-text-body">Checking your session...</p>
          </div>
        ) : (
          <div className="bg-text-on-dark border border-text-heading/10 rounded-lg p-8 sm:p-10">
            {/* Avatar + welcome */}
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-bg-dark text-text-on-dark flex items-center justify-center mb-4">
                {session && initials ? (
                  <span className="text-xl font-bold tracking-wide">{initials}</span>
                ) : (
                  <User className="w-9 h-9" />
                )}
              </div>
              <h1 className="text-2xl font-bold text-text-heading mb-2">
                {session ? `Hi, ${displayName ?? 'there'}` : 'Welcome to TechBD'}
              </h1>
              <p className="text-text-body mb-8 max-w-xs">
                {session
                  ? 'Manage your orders, preferences and favourite gadgets.'
                  : 'Sign in to view your profile and saved preferences.'}
              </p>
            </div>

            {/* Quick-link grid (2 columns) */}
            <div className="grid grid-cols-2 gap-3 mb-8">
              {QUICK_LINKS.map(({ label, href, icon: Icon }, index) => (
                <Link
                  key={href}
                  href={href}
                  className={`group flex items-center justify-between gap-2 bg-bg-light border border-text-heading/10 rounded-md px-4 py-3.5 hover:border-accent transition-colors ${
                    index === QUICK_LINKS.length - 1 ? 'col-span-2' : ''
                  }`}
                >
                  <span className="flex items-center gap-2.5 min-w-0">
                    <Icon className="w-4.5 h-4.5 text-accent shrink-0" aria-hidden="true" />
                    <span className="text-sm font-medium text-text-heading truncate">
                      {label}
                    </span>
                  </span>
                  <ChevronRight
                    className="w-4 h-4 text-text-body shrink-0 group-hover:text-accent group-hover:translate-x-0.5 transition-all"
                    aria-hidden="true"
                  />
                </Link>
              ))}
            </div>

            {/* Bottom action buttons */}
            {session ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Link
                  href="/shop"
                  className="px-6 py-2.5 bg-bg-dark text-text-on-dark font-medium rounded-md hover:opacity-90 transition-opacity text-center"
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
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Link
                  href="/login"
                  className="px-6 py-2.5 bg-bg-dark text-text-on-dark font-medium rounded-md hover:opacity-90 transition-opacity text-center"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="px-6 py-2.5 border border-accent text-accent font-medium rounded-md hover:bg-accent/10 transition-colors text-center"
                >
                  Create Account
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
