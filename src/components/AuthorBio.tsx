import React from 'react';
import Link from 'next/link';

/**
 * Author attribution block for blog post detail pages — "Written by
 * TechBD Team" + one-line role + link to the About page (where team
 * info lives), matching the reference pattern. Server component: no
 * interactivity needed.
 */
const AuthorBio: React.FC<{ author?: string }> = ({ author = 'TechBD Team' }) => (
  <div className="mt-10 flex items-start gap-4 rounded-lg border border-text-heading/10 bg-bg-light p-4 md:p-5">
    <span
      aria-hidden="true"
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent/10 text-base font-bold text-accent-hover"
    >
      {author.charAt(0).toUpperCase()}
    </span>
    <div>
      <p className="text-sm font-semibold text-text-heading">Written by {author}</p>
      <p className="mt-0.5 text-sm text-text-body">
        Contributor at TechBD — honest gadget reviews, buying guides, and tech news for
        Bangladesh. No sponsorships, no bias.
      </p>
      <Link
        href="/about"
        className="mt-1.5 inline-block text-sm font-medium text-accent hover:text-accent-hover"
      >
        More about the TechBD team →
      </Link>
    </div>
  </div>
);

export default AuthorBio;
