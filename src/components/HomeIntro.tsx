import React from 'react';

/**
 * Homepage intro strip = section 1 heading pair (h1 + h2 description).
 *
 * This section OWNS the page's first headline: an <h1> stating the site's
 * core promise and, directly below it, a muted <h2> description line
 * (styled as small gray subtext, NOT a big heading — part of the homepage
 * multi-H1 pattern: one h1+h2 pair per section, hero exempt).
 *
 * Sizing is deliberately slim (one line of h1 + one line of copy) and it
 * uses the same max-w-7xl container + horizontal padding as every other
 * homepage section, so it aligns with the sections above and below it.
 * Colors come only from @theme tokens; type is the site's single Inter face.
 */
const HomeIntro: React.FC = () => {
  return (
    <section className="border-b border-text-heading/10 bg-bg-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <h1 className="text-2xl md:text-3xl font-bold text-text-heading leading-tight">
          Gadget Prices, Specs &amp; Reviews in Bangladesh
        </h1>
        <h2 className="mt-2 text-sm md:text-base font-normal text-text-body leading-relaxed max-w-3xl">
          Official &amp; unofficial prices, full specs and honest guides
        </h2>
      </div>
    </section>
  );
};

export default HomeIntro;
