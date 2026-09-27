import React from 'react';
import ArticleCard from './ArticleCard';
import { posts, type Post } from '@/lib/posts';

/**
 * "Keep Browsing" section for blog post detail pages — shows 3 related
 * posts: same-category posts first (by views), then the most recent other
 * posts to fill any remaining slots. Automatic for every post; a post
 * never relates to itself, and legacy posts (no hero image) render the
 * placeholder box inside ArticleCard exactly as they do in listings.
 */
const RelatedPosts: React.FC<{ current: Post }> = ({ current }) => {
  const sameCategory = posts.filter((p) => p.id !== current.id && p.category === current.category);
  const others = posts.filter((p) => p.id !== current.id && p.category !== current.category);
  const related = [...sameCategory, ...others].slice(0, 3);

  if (related.length === 0) return null;

  return (
    <section className="mt-12">
      <h2 className="text-2xl font-bold text-text-heading mb-6">Keep Browsing</h2>
      <div className="grid grid-cols-2 gap-3 md:gap-6 md:grid-cols-2 lg:grid-cols-3">
        {related.map((post) => (
          <ArticleCard key={post.id} post={post} />
        ))}
      </div>
    </section>
  );
};

export default RelatedPosts;
