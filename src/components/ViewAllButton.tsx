import React from 'react';
import Link from 'next/link';

/**
 * Shared "View All …" button — the ONE component for the crawlable link
 * that sits centered UNDER a section's card grid/row.
 *
 * Appearance (owner-specified): solid dark pill (bg-bg-dark) with white
 * text (text-text-on-dark), rounded-lg, px-8 py-3, font-semibold, soft
 * shadow (shadow-lg), hover using the existing bg-bg-dark-secondary
 * token, smooth transition. Colors come ONLY from @theme tokens; type is
 * the site's single Inter face. No hardcoded hex anywhere.
 *
 * Placement contract: render DIRECTLY BELOW the section's card grid/row,
 * wrapped in the consumer's own flex justify-center container with
 * mt-8–mt-10 spacing (the component centers itself via inline-flex so the
 * desktop width hugs the label; mobile takes the full row up to max-w-sm
 * so it can never overflow).
 *
 * It is a real crawlable next/link <a> with visible text — no rel="nofollow".
 */
const ViewAllButton: React.FC<{
  href: string;
  label: string;
}> = ({ href, label }) => (
  <div className="flex justify-center mt-8 sm:mt-10 mb-4">
    <Link
      href={href}
      className={`tactile inline-flex w-full sm:w-auto max-w-sm items-center justify-center gap-2 px-8 py-3 rounded-lg font-semibold text-text-on-dark bg-bg-dark shadow-lg hover:bg-bg-dark-secondary transition-colors text-center`}
    >
      {label}
      <span aria-hidden="true">→</span>
    </Link>
  </div>
);

export default ViewAllButton;
