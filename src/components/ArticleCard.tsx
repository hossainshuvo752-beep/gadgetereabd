import React from 'react';
import Link from 'next/link';
import PostMeta from './PostMeta';

type Post = {
  id: number;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  readTime: string;
  imageAlt: string;
};

const ArticleCard: React.FC<{ post: Post }> = ({ post }) => {
  return (
    <Link href={`/posts/${post.id}`}>
      <div className="bg-text-on-dark border border-text-heading/10 rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-300">
        {/* 16:9 ratio lock — blog images are 16:9 everywhere (listing,
            homepage cards, detail hero). */}
        <div className="aspect-video bg-bg-dark-secondary/10 flex items-center justify-center">
          <span className="text-text-body text-sm">{post.imageAlt}</span>
        </div>
        <div className="p-3 md:p-5">
          <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-semibold bg-accent text-text-on-dark rounded-full mb-3">
            {post.category}
          </span>
          <h3 className="text-sm md:text-xl font-bold text-text-heading mb-3 line-clamp-2">
            {post.title}
          </h3>
          {/* Excerpt — hidden on mobile (compact 2-col cards), shown on
              desktop exactly as before */}
          {/* md:line-clamp-2 OWNS display at md+ — pairing unprefixed
              line-clamp-2 with md:block let display:block win the cascade
              and disabled the clamp on desktop (4-5 line descriptions). */}
          <p className="hidden md:line-clamp-2 text-text-body leading-relaxed mb-4">
            {post.excerpt}
          </p>
          {/* Two-line meta (avatar+author / date•readTime) — shared PostMeta */}
          <PostMeta date={post.date} readTime={post.readTime} />
        </div>
      </div>
    </Link>
  );
};

export default ArticleCard;
