import React from 'react';
import Link from 'next/link';

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
        <div className="h-48 bg-bg-dark-secondary/10 flex items-center justify-center">
          <span className="text-text-body text-sm">{post.imageAlt}</span>
        </div>
        <div className="p-5">
          <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-semibold bg-accent text-text-on-dark rounded-full mb-3">
            {post.category}
          </span>
          <h3 className="text-xl font-bold text-text-heading mb-3 line-clamp-2">
            {post.title}
          </h3>
          <p className="text-text-body leading-relaxed mb-4 line-clamp-3">
            {post.excerpt}
          </p>
          <div className="flex items-center text-xs text-text-body">
            <span>By TechBD Team</span>
            <span className="mx-2">•</span>
            <span>{post.date}</span>
            <span className="mx-2">•</span>
            <span>{post.readTime}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ArticleCard;
