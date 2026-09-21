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

const Hero: React.FC<HeroProps> = ({ post }) => {
  return (
    <section className="bg-text-on-dark border-b border-text-heading/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Featured Image Placeholder */}
        <div className="mb-6">
          <div className="w-full h-48 bg-bg-dark-secondary/10 rounded-lg flex items-center justify-center">
            <span className="text-text-body text-sm">{post.imageAlt}</span>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4">
          {/* Category Badge */}
          <span className="inline-flex items-center px-3 py-1 text-xs font-semibold bg-accent text-text-on-dark rounded-full">
            {post.category}
          </span>

          {/* Article Title — clamped to 2 lines like the cards */}
          <h2 className="text-2xl font-bold text-text-heading line-clamp-2">
            {post.title}
          </h2>

          {/* Excerpt — hidden on mobile (compact hero: image, badge, title,
              meta only); desktop shows it clamped to 2 lines like the cards. */}
          <p className="hidden md:block text-text-body leading-relaxed line-clamp-2">
            {post.excerpt}
          </p>

          {/* Meta Info — same two-line pattern as the cards (avatar+author,
              then date•readTime); slightly larger on the featured post. */}
          <PostMeta date={post.date} readTime={post.readTime} className="text-xs" />

          {/* Button */}
          <a
            href={`/posts/${post.id}`}
            className="inline-block px-6 py-2 bg-accent text-text-on-dark font-medium rounded-md hover:bg-accent-hover transition-colors"
          >
            Read Full Review
          </a>
        </div>
      </div>
    </section>
  );
};

export default Hero;
