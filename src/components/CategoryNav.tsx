'use client';

import { categoryTree, getSubCategories } from '@/lib/categories';

type CategoryNavProps = {
  selectedTop: string | null;
  selectedSub: string | null;
  onSelect: (top: string | null, sub: string | null) => void;
};

/**
 * Shared top horizontal category navigation, used by BOTH the Shop page
 * and the Quick Look listing page (one component, never duplicated).
 * - Desktop: hovering (or keyboard-focusing) a category reveals a dropdown
 *   of its sub-categories. Clicking the category name selects the whole
 *   category; clicking a sub-item narrows to that sub-category.
 * - Touch/mobile: hover isn't available, so selecting a category also
 *   reveals a sub-category chip row directly below the nav — every
 *   sub-category stays one tap away without hover.
 * - Text-only: no product counts, no result meta line (established
 *   listing-page pattern).
 * Data comes from the single category tree in src/lib/categories.ts.
 */
export default function CategoryNav({
  selectedTop,
  selectedSub,
  onSelect,
}: CategoryNavProps) {
  return (
    // mb-6 gives breathing room between the nav (and its sub-category
    // chips) and the product grid on every page that renders this bar.
    <div className="mb-6">
      {/* Horizontal category bar — wraps to multiple lines when needed */}
      <nav aria-label="Product categories" className="flex flex-wrap items-center gap-2">
        {/* All Products — clears both filters */}
        <button
          onClick={() => onSelect(null, null)}
          className={`px-3.5 py-2 text-sm font-medium rounded-md border transition-colors duration-200 ${
            selectedTop === null
              ? 'bg-accent border-accent text-text-on-dark'
              : 'bg-transparent border-text-heading/20 text-text-heading hover:border-accent hover:text-accent'
          }`}
        >
          All Products
        </button>

        {categoryTree.map((cat) => {
          const isTopSelected = selectedTop === cat.name && selectedSub === null;
          const containsSelection = selectedTop === cat.name;
          return (
            <div key={cat.name} className="relative group">
              <button
                onClick={() => onSelect(cat.name, null)}
                className={`inline-flex items-center px-3.5 py-2 text-sm font-medium rounded-md border transition-colors duration-200 ${
                  isTopSelected
                    ? 'bg-accent border-accent text-text-on-dark'
                    : containsSelection
                      ? 'bg-transparent border-accent/60 text-accent group-hover:border-accent group-hover:text-accent'
                      : 'bg-transparent border-text-heading/20 text-text-heading group-hover:border-accent group-hover:text-accent'
                }`}
              >
                {cat.name}
                <svg
                  className="ml-1.5 w-3.5 h-3.5 transition-transform duration-200 group-hover:rotate-180"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Hover/focus dropdown of sub-categories.
                  pt-1.5 bridges the gap so the pointer stays inside the group.
                  Max-height = min(32rem, 80vh): tall enough that ALL current
                  sub-lists (up to 15 Mobile brands ≈ 496px) fit on screen
                  without scrolling, while 80vh keeps the dropdown inside the
                  viewport on short screens. overflow-y-auto is KEPT as the
                  safety net — it only kicks in automatically if a list ever
                  grows past the cap. No JS wheel handlers; no
                  overscroll-behavior override, so any scrolling chains to the
                  page natively. hide-scrollbar keeps it clean. */}
              <div className="invisible opacity-0 translate-y-1 group-hover:visible group-hover:opacity-100 group-hover:translate-y-0 group-focus-within:visible group-focus-within:opacity-100 group-focus-within:translate-y-0 transition-all duration-150 absolute left-0 top-full pt-1.5 z-30">
                <div className="min-w-52 max-h-[min(32rem,80vh)] overflow-y-auto hide-scrollbar bg-text-on-dark border border-text-heading/10 rounded-lg shadow-lg py-2">
                  {cat.subs.map((sub) => {
                    const isSubSelected =
                      selectedTop === cat.name && selectedSub === sub;
                    return (
                      <button
                        key={sub}
                        onClick={() => onSelect(cat.name, sub)}
                        className={`w-full px-4 py-1.5 text-sm text-left transition-colors ${
                          isSubSelected
                            ? 'font-semibold text-accent-hover'
                            : 'text-text-body hover:bg-bg-dark-secondary/10 hover:text-text-heading'
                        }`}
                      >
                        {sub}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </nav>

      {/* Touch-friendly sub-category chips — appear once a category is
          selected, keeping subs reachable without hover on mobile. */}
      {selectedTop !== null && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            onClick={() => onSelect(selectedTop, null)}
            className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors duration-200 ${
              selectedSub === null
                ? 'bg-accent/10 border-accent text-accent-hover'
                : 'bg-transparent border-text-heading/20 text-text-body hover:border-accent hover:text-accent'
            }`}
          >
            All {selectedTop}
          </button>
          {getSubCategories(selectedTop).map((sub) => {
            const isSubSelected = selectedSub === sub;
            return (
              <button
                key={sub}
                onClick={() => onSelect(selectedTop, sub)}
                className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors duration-200 ${
                  isSubSelected
                    ? 'bg-accent/10 border-accent text-accent-hover'
                    : 'bg-transparent border-text-heading/20 text-text-body hover:border-accent hover:text-accent'
                }`}
              >
                {sub}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
