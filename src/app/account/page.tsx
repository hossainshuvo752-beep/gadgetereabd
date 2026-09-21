import React from 'react';
import Link from 'next/link';

/**
 * My Account — placeholder page. No real account functionality yet;
 * the Footer/Header link here so the Account entry points are not dead ends.
 */
export default function AccountPage() {
  return (
    <section className="py-12 bg-bg-light min-h-[calc(100vh-64px)]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-text-heading mb-8">My Account</h1>

        <div className="bg-text-on-dark border border-text-heading/10 rounded-lg p-12 text-center">
          <div className="text-4xl mb-4">👤</div>
          <h2 className="text-xl font-bold text-text-heading mb-2">
            Account features coming soon
          </h2>
          <p className="text-text-body mb-8 max-w-md mx-auto">
            Order history, saved addresses and a wishlist are on the way. In the
            meantime, browse the shop or log in / register to be ready when
            accounts go live.
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
      </div>
    </section>
  );
}
