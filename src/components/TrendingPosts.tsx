import React from 'react';
import ArticleCard from '@/components/ArticleCard';
import { posts } from '@/lib/posts';
import { nextOccurrence, type AltOccurrenceTracker } from '@/lib/imageAlt';

/**
 * Trending Now — shows posts beyond the Hero's featured one. With only ONE
 * post on the site, the Hero already features it, so this section hides
 * itself instead of duplicating the same card.
 */
const TrendingPosts: React.FC<{ altTracker?: AltOccurrenceTracker }> = ({ altTracker }) => {
  // Skip the Hero's featured post (the first one) — trend what's left,
  // capped at 8 (two 4-up rows on desktop) like Latest Posts.
  const trendingPosts = posts.slice(1, 9);

  // Single-post site: nothing left to trend — render nothing.
  if (trendingPosts.length === 0) return null;

  return (
    <section className="mb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section heading pair (homepage multi-H1 pattern): h1 title +
            muted h2 description subtext, look unchanged from the old h2. */}
        <h1 className="text-2xl font-bold text-text-heading mb-1">
          Popular Tech Guides &amp; Comparisons for Bangladesh
        </h1>
        <h2 className="text-sm font-normal text-text-body mb-6">
          Most-read reviews, explainers and buying comparisons
        </h2>
        {/* 4-up on desktop (lg) — same compact card proportions as the
            /blog page and Latest Posts. */}
        <div className="grid grid-cols-2 gap-3 md:gap-6 lg:grid-cols-4">
          {trendingPosts.map((post, i) => (
            <div key={post.id} className="fade-up" style={{ '--stagger-delay': `${Math.min(i * 50, 350)}ms` } as React.CSSProperties}>
              <ArticleCard
                post={post}
                occurrence={altTracker ? nextOccurrence(altTracker, post.id) : 0}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrendingPosts;
