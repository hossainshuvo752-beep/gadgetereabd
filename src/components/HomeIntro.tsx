import React from 'react';

/**
 * Homepage intro strip — the page's ONE visible H1.
 *
 * The hero headline is a post title (an H2, intentionally: the homepage's
 * subject is the site, not that one article), so before this strip the
 * homepage had no H1 at all. This section states the site's core promise in
 * a single H1 and one supporting sentence, in normal flow directly under
 * the hero — visible text only, no sr-only heading, so what crawlers index
 * is exactly what a visitor reads.
 *
 * Sizing is deliberately slim (one line of H1 + one line of copy) and it
 * uses the same max-w-7xl container + horizontal padding as every other
 * homepage section, so it aligns with the sections above and below it.
 * Colors come only from @theme tokens; type is the site's single Inter face.
 */
const HomeIntro: React.FC = () => {
  return (
    <section className="border-b border-text-heading/10 bg-bg-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-text-heading leading-tight">
          Gadget Prices, Specs &amp; Reviews in Bangladesh
        </h1>
        <p className="mt-2 text-sm md:text-base text-text-body leading-relaxed max-w-3xl">
          Check official and unofficial prices, full specifications and honest
          buying guides for phones, laptops, audio and smart-home gadgets.
        </p>
      </div>
    </section>
  );
};

export default HomeIntro;
