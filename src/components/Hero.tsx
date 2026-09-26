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
 * Homepage hero — dark navy gradient banner matching the reference layout:
 * text LEFT, featured image RIGHT (desktop); stacked text-first on mobile.
 *
 * The headline renders the post's REAL title with the distinguishing
 * product/entity name (text before the first colon) highlighted in amber —
 * nothing hardcoded: posts[0] is "iPhone Duo: …", so "iPhone Duo" lights up,
 * and any future featured post follows the same rule.
 */
const Hero: React.FC<HeroProps> = ({ post }) => {
  const colonIndex = post.title.indexOf(':');
  const leadText = colonIndex > 0 ? post.title.slice(0, colonIndex) : '';
  const restText = colonIndex > 0 ? post.title.slice(colonIndex + 1).trim() : post.title;

  return (
    <section className="bg-gradient-to-r from-bg-hero to-bg-hero-deep">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Text first / image second in the DOM; the row order flips on lg. */}
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-10 items-center">
          {/* LEFT — content */}
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

            {/* Excerpt — muted white for dark bg; hidden on mobile (compact
                hero: pill, title, meta, button only — established pattern) */}
            <p className="hidden md:line-clamp-2 text-text-on-dark-muted leading-relaxed max-w-xl">
              {post.excerpt}
            </p>

            {/* Meta Info — same two-line pattern as the cards */}
            <PostMeta date={post.date} readTime={post.readTime} className="text-xs" tone="dark" />

            {/* CTA */}
            <a
              href={`/posts/${post.id}`}
              className="inline-block px-6 py-2 bg-accent text-text-on-dark font-medium rounded-md hover:bg-accent-hover transition-colors"
            >
              Read Full Review
            </a>
          </div>

          {/* RIGHT — featured image with floating corner badge (overlaps the
              bottom-right edge, reference-style). aspect-video keeps the
              16:9 ratio lock; ~380px tall in the desktop column. */}
          <div className="relative lg:order-2">
            <div className="w-full aspect-video bg-bg-dark-secondary/40 rounded-xl flex items-center justify-center">
              <span className="text-text-on-dark-muted text-sm">{post.imageAlt}</span>
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
