import React from 'react';

/**
 * Shared homepage section heading — the ONE component for every homepage
 * section's title + supporting-description pair (homepage multi-H1
 * pattern: each section owns one <h1> title and one <h2> supporting line,
 * hero exempt; the page keeps several h1s by design, all visible text).
 *
 * CENTERED by default (homepage-wide alignment rule) at every breakpoint;
 * sizes/weights/spacing are identical everywhere this component renders:
 *   - title: text-2xl / bold / text-text-heading, tight line-height
 *   - support: mt-2 (or mt-1 on compact rows via `compact`), text-sm
 *     md:text-base, font-normal, text-text-body
 * Colors come only from @theme tokens (text-text-heading/text-text-body);
 * type is the site's single Inter face (var(--font-sans) on body). Never
 * duplicate inline styles in a section — render this component instead.
 * The "View All…"-style link a section owns renders BELOW this block, in
 * the section's own markup, centered to match (see ShopTeaser).
 */
const HomeSectionHeading: React.FC<{
  title: string;
  support: string;
  /** Smaller title size for sub-section rows (e.g. Latest Quick Look row). */
  compact?: boolean;
  /** Extra bottom margin when the section's following content has none. */
  supportClassName?: string;
}> = ({ title, support, compact = false, supportClassName = 'mb-6' }) => {
  if (compact) {
    return (
      <div className="text-center">
        <h2 className="text-lg md:text-xl font-bold text-text-heading leading-tight">
          {title}
        </h2>
        <h3 className={`mt-1 text-sm font-normal text-text-body leading-relaxed ${supportClassName}`}>
          {support}
        </h3>
      </div>
    );
  }
  return (
    <div className="text-center">
      <h1 className="text-2xl md:text-3xl font-bold text-text-heading leading-tight">
        {title}
      </h1>
      <h2 className={`mt-2 text-sm md:text-base font-normal text-text-body leading-relaxed ${supportClassName}`}>
        {support}
      </h2>
    </div>
  );
};

export default HomeSectionHeading;
