import React from 'react';
import PostMeta from './PostMeta';

interface HeroProps {
  post: {
    id: number;
    title: string;
    excerpt: string;
    category: string;
    date: string;
    readTime: string;
    imageAlt: string;
  };
}

/**
 * Homepage hero — dark navy gradient banner matching the reference layout.
 *
 * MOBILE (below lg): stacked text-first in the reference's exact order —
 * trending pill → headline (white with amber entity accent) → muted
 * description → CTA → featured image LAST, centered, with the floating
 * category badge on its bottom-right corner. (The author/date meta row is
 * desktop-only — the reference mobile stack doesn't include it.)
 *
 * DESKTOP (lg+): same content, two columns — text LEFT, image RIGHT.
 *
 * IMAGE RATIO: 4:5 portrait on EVERY breakpoint (chosen over 3:4 — same
 * portrait feel, less vertical bulk beside the text column). object-cover
 * + object-center crop any source image gracefully; when a real hero
 * image replaces the placeholder, render it with next/image fill +
 * object-cover object-center inside this same container.
 */
const Hero: React.FC<HeroProps> = ({ post }) => {
  const colonIndex = post.title.indexOf(':');
  const leadText = colonIndex > 0 ? post.title.slice(0, colonIndex) : '';
  const restText = colonIndex > 0 ? post.title.slice(colonIndex + 1).trim() : post.title;

  return (
    <section className="bg-gradient-to-r from-bg-hero to-bg-hero-deep">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Text first / image second in the DOM (reference mobile stack).
            SIDE-BY-SIDE from md (tablet) up: TEXT 60% / IMAGE 40% via
            grid-cols-[3fr_2fr] — the reference's proportion (text column
            keeps headline+excerpt comfortable, portrait image stays
            secondary). Mobile stays stacked full-width. */}
        <div className="grid gap-6 md:grid-cols-[3fr_2fr] md:gap-8 lg:gap-10 items-center">
          {/* LEFT / TOP — content */}
          <div className="space-y-4 lg:order-1">
            {/* Trending pill */}
            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold bg-accent-amber text-bg-hero-deep rounded-full">
              🔥 Trending This Week
            </span>

            {/* Headline — real post title, entity name in amber */}
            <h2 className="text-2xl lg:text-4xl font-bold text-text-on-dark line-clamp-3">
              {leadText && (
                <>
                  <span className="text-accent-amber">{leadText}</span>
                  {': '}
                </>
              )}
              {restText}
            </h2>

            {/* Excerpt — muted white; visible on mobile too now (part of the
                reference stack), clamped to 2 lines at every breakpoint */}
            <p className="line-clamp-2 text-text-on-dark-muted leading-relaxed max-w-xl">
              {post.excerpt}
            </p>

            {/* Meta row — desktop only (reference mobile stack ends at CTA) */}
            <PostMeta
              date={post.date}
              readTime={post.readTime}
              className="hidden lg:block text-xs"
              tone="dark"
            />

            {/* CTA */}
            <a
              href={`/posts/${post.id}`}
              className="inline-block px-6 py-2 bg-accent text-text-on-dark font-medium rounded-md hover:bg-accent-hover transition-colors"
            >
              Read Full Review
            </a>
          </div>

          {/* RIGHT (md+) / BOTTOM (mobile) — featured image, 4:5 portrait
              at every breakpoint. Mobile: full-width, capped + centered.
              md+: the image FILLS its 40% column (cap removed) so the column
              ratio is real. Floating category badge overlaps the
              bottom-right edge, reference-style. */}
          <div className="relative md:order-2">
            <div className="w-full max-w-sm md:max-w-none mx-auto aspect-[4/5] bg-bg-dark-secondary/40 rounded-xl flex items-center justify-center">
              <span className="text-text-on-dark-muted text-sm px-6 text-center">
                {post.imageAlt}
              </span>
            </div>
            <span className="absolute -bottom-3 right-4 inline-flex items-center px-3 py-1 text-xs font-semibold bg-accent text-text-on-dark rounded-full shadow-md">
              {post.category}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
