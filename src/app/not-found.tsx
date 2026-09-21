import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <section className="min-h-[calc(100vh-64px)] bg-bg-light flex items-center justify-center px-4">
      <div className="text-center py-20">
        <div className="text-6xl font-bold text-accent mb-4">404</div>
        <h1 className="text-3xl font-bold text-text-heading mb-3">
          Page not found
        </h1>
        <p className="text-text-body max-w-md mx-auto mb-8">
          The page you are looking for doesn&apos;t exist or may have moved.
          No worries — the reviews and guides are all still here.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="px-6 py-2.5 bg-accent text-text-on-dark font-medium rounded-md hover:bg-accent-hover transition-colors"
          >
            ← Back to Home
          </Link>
          <Link
            href="/blog"
            className="px-6 py-2.5 border border-text-heading/20 text-text-body font-medium rounded-md hover:bg-bg-light transition-colors"
          >
            Browse the Blog
          </Link>
        </div>
      </div>
    </section>
  );
}
