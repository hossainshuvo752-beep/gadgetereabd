import React from 'react';
import ArticleCard from '@/components/ArticleCard';
import { posts } from '@/lib/posts';

/**
 * Trending Now — shows posts beyond the Hero's featured one. With only ONE
 * post on the site, the Hero already features it, so this section hides
 * itself instead of duplicating the same card.
 */
const TrendingPosts: React.FC = () => {
  // Skip the Hero's featured post (the first one) — trend what's left.
  const trendingPosts = posts.slice(1);

  // Single-post site: nothing left to trend — render nothing.
  if (trendingPosts.length === 0) return null;

  return (
    <section className="mb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-text-heading mb-6">
          Trending Now
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {trendingPosts.map((post) => (
            <ArticleCard key={post.id} post={post} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrendingPosts;
