import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { posts, postHref, type Post } from '@/lib/posts';

/**
 * Popular Buying Guides — homepage section fed by the REAL posts data
 * source (same as Blog listing / Latest Posts), not hardcoded entries.
 *
 * A post qualifies as a "buying guide" when it is category 'Roundup'
 * (best-of / comparison roundups) OR its title starts with "Best " —
 * the two patterns all guide-style posts currently share. Newest first
 * by the array's publish order, capped at 4 (one 4-up desktop row).
 * Falls back to a category-agnostic recent fill if fewer than 4 match,
 * so the section never renders with obvious holes.
 */
function buyingGuidePosts(): Post[] {
  const matches = posts.filter(
    (p) => p.category === 'Roundup' || p.title.startsWith('Best ')
  );
  const fill = posts.filter((p) => !matches.includes(p));
  return [...matches, ...fill].slice(0, 4);
}

const BuyingGuideHighlight: React.FC = () => {
  const guides = buyingGuidePosts();

  // No posts at all — hide the section rather than render an empty shell.
  if (guides.length === 0) return null;

  return (
    <section className="mb-12 bg-bg-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-2xl font-bold text-text-heading mb-6 text-center">
          Popular Buying Guides
        </h2>
        {/* 4-up on desktop (lg) — same compact card proportions as the
            /blog page and the other homepage sections. */}
        <div className="grid grid-cols-2 gap-3 md:gap-6 lg:grid-cols-4">
          {guides.map((guide, i) => (
            <div key={guide.id} className="fade-up" style={{ '--stagger-delay': `${Math.min(i * 60, 300)}ms` } as React.CSSProperties}>
            <div className="card-lift bg-text-on-dark rounded-lg overflow-hidden shadow">
              {/* Real post hero image, 16:9 — same image source as the
                  blog listing (ArticleCard) and Latest Posts. */}
              <div className="relative aspect-video w-full bg-bg-dark-secondary/10 overflow-hidden">
                {guide.heroImage ? (
                  <Image
                    src={guide.heroImage}
                    alt={guide.imageAlt}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover"
                  />
                ) : (
                  <span className="absolute inset-0 flex items-center justify-center text-text-body text-sm">
                    {guide.imageAlt}
                  </span>
                )}
              </div>
              <div className="p-3 md:p-5">
                <h3 className="text-sm md:text-xl font-bold text-text-heading mb-3 line-clamp-2">
                  {guide.title}
                </h3>
                <p className="hidden md:line-clamp-2 text-text-body mb-4">
                  {guide.excerpt}
                </p>
                {/* Real slug URL via the shared postHref builder — the old
                    hardcoded version linked to '#'. */}
                <Link
                  href={postHref(guide)}
                  className="text-accent hover:text-accent-hover underline font-medium text-sm md:text-base"
                >
                  Read Guide →
                </Link>
              </div>
            </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BuyingGuideHighlight;
