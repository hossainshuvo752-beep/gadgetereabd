import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { homeCategoryLinks, homeQuickLookLinks } from '@/lib/homeLinks';
import HomeSectionHeading from './HomeSectionHeading';
import ViewAllButton from './ViewAllButton';

/**
 * Homepage internal-navigation section: "Browse by Category".
 *
 * Two rows, both fed by shared data (src/lib/homeLinks.ts, derived from
 * categories.ts + products.ts) — no product names, slugs or counts are
 * typed into this component:
 *   1. top-level category cards with live product counts
 *   2. a "Latest Quick Look pages" row of deep links + a "View all Quick
 *      Look" link to the listing
 *
 * All text is server-rendered and visible (no accordions, no hidden copy).
 * Cards reuse the site's existing card treatment (white surface, token
 * border, subtle lift on hover) and collapse to a single column on mobile.
 * Colors are @theme tokens only.
 */
const BrowseCategories: React.FC = () => {
  return (
    <section className="mb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Centered section heading pair via the SHARED homepage heading
            component. */}
        <HomeSectionHeading
          title="Browse Gadgets by Category: Phones, Laptops, Audio & More"
          support="Find specs and prices by device type or brand"
        />

        {/* Top-level categories — labels and counts from the shared tree. */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
          {homeCategoryLinks.map((category) => (
            <Link
              key={category.label}
              href={category.href}
              className="group bg-text-on-dark border border-text-heading/10 rounded-lg p-4 card-lift"
            >
              <span className="block text-sm md:text-base font-semibold text-text-heading group-hover:text-accent transition-colors">
                {category.label}
              </span>
              <span className="mt-1 block text-xs text-text-body">
                {category.count} {category.count === 1 ? 'product' : 'products'}
              </span>
            </Link>
          ))}
        </div>

        {/* Latest Quick Look pages — deep links straight to the guides. */}
        <div className="mt-10">
          {/* Centered compact sub-heading (shared homepage heading
              component, compact variant). The old header-row "View all
              Quick Look" link is replaced by the shared dark button BELOW
              the Quick Look card grid. */}
          <HomeSectionHeading
            compact
            title="Latest Phone & Gadget Prices and Specs in Bangladesh"
            support="Quick spec sheets with prices for phones and gadgets"
          />
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {homeQuickLookLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group bg-text-on-dark border border-text-heading/10 rounded-lg p-4 card-lift"
              >
                <span className="block text-sm font-semibold text-text-heading group-hover:text-accent transition-colors">
                  {link.label}
                </span>
                <span className="mt-1 block text-xs text-text-body">
                  {link.description}
                </span>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-accent">
                  Full specs and guide
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            ))}
          </div>

          {/* Single "View all" control for this sub-section — the shared
              dark button, centered under the Quick Look card grid. */}
          <ViewAllButton href="/quick-look" label="View All in Quick Look" />
        </div>
      </div>
    </section>
  );
};

export default BrowseCategories;
