import React from 'react';

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
 * Homepage hero — dark navy gradient banner. ONE side-by-side structure at
 * EVERY breakpoint (owner decision, supersedes the earlier stacked-mobile
 * layout): text LEFT (~60%), featured image RIGHT (~40%), scaled down
 * proportionally on phones. Text sizes step up mobile → tablet → desktop so
 * the narrow 3fr column stays readable at 375px.
 *
 * The author/date/read-time meta line is intentionally NOT rendered here at
 * any breakpoint (cluttered in the hero; post detail pages keep theirs).
 *
 * IMAGE: 4:5 portrait, object-cover semantics for the future real image
 * (next/image fill + object-cover object-center inside this box — crops any
 * source, never stretches). Mobile box: capped 200px, centered in its
 * column; md+: 340px cap so its height ≈ the text column's and the banner
 * hugs its content. Floating category badge overlaps the bottom-right edge.
 */
const Hero: React.FC<HeroProps> = ({ post }) => {
  const colonIndex = post.title.indexOf(':');
  const leadText = colonIndex > 0 ? post.title.slice(0, colonIndex) : '';
  const restText = colonIndex > 0 ? post.title.slice(colonIndex + 1).trim() : post.title;

  return (
    <section className="bg-gradient-to-r from-bg-hero to-bg-hero-deep">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Text left / image right at every breakpoint (3fr:2fr = 60/40). */}
        <div className="grid grid-cols-[3fr_2fr] items-center gap-4 md:gap-8 lg:gap-10">
          {/* LEFT — content */}
          <div className="space-y-3 md:space-y-4">
            {/* Trending pill */}
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 md:px-3 text-[10px] md:text-xs font-semibold bg-accent-amber text-bg-hero-deep rounded-full">
              🔥 Trending This Week
            </span>

            {/* Headline — real post title, entity name in amber */}
            <h2 className="text-lg md:text-2xl lg:text-4xl font-bold text-text-on-dark line-clamp-3">
              {leadText && (
                <>
                  <span className="text-accent-amber">{leadText}</span>
                  {': '}
                </>
              )}
              {restText}
            </h2>

            {/* Excerpt — muted white, clamped to 2 lines */}
            <p className="text-xs md:text-sm line-clamp-2 text-text-on-dark-muted leading-relaxed">
              {post.excerpt}
            </p>

            {/* CTA */}
            <a
              href={`/posts/${post.id}`}
              className="inline-block px-4 py-2 md:px-6 text-xs md:text-sm bg-accent text-text-on-dark font-medium rounded-md hover:bg-accent-hover transition-colors"
            >
              Read Full Review
            </a>
          </div>

          {/* RIGHT — featured image, 4:5 portrait, contained (never stretches
              to the text column's height). Floating category badge overlaps
              the bottom-right edge. */}
          <div className="relative">
            <div className="w-full max-w-[200px] md:max-w-[340px] mx-auto aspect-[4/5] bg-bg-dark-secondary/40 rounded-xl flex items-center justify-center">
              <span className="text-text-on-dark-muted text-xs md:text-sm px-4 text-center">
                {post.imageAlt}
              </span>
            </div>
            <span className="absolute -bottom-3 right-2 md:right-4 inline-flex items-center px-2.5 md:px-3 py-1 text-[10px] md:text-xs font-semibold bg-accent text-text-on-dark rounded-full shadow-md">
              {post.category}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
