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
 * Homepage hero — compact two-column banner (typical e-commerce/blog hero
 * scale, ~400px tall image instead of the old full-width ~684px stack):
 * image left, content right on desktop; stacked with a slim 16:9 image on
 * mobile. Ratio stays 16:9 everywhere — only the container size changed.
 */
const Hero: React.FC<HeroProps> = ({ post }) => {
  return (
    <section className="bg-text-on-dark border-b border-text-heading/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
        <div className="grid gap-6 lg:grid-cols-5 lg:gap-10 items-center">
          {/* Featured image — ~395px tall on desktop (16:9 in a 3/5 column),
              ~220px tall on mobile. */}
          <div className="lg:col-span-3">
            <div className="w-full aspect-video bg-bg-dark-secondary/10 rounded-lg flex items-center justify-center">
              <span className="text-text-body text-sm">{post.imageAlt}</span>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-4 lg:col-span-2">
            {/* Category Badge */}
            <span className="inline-flex items-center px-3 py-1 text-xs font-semibold bg-accent text-text-on-dark rounded-full">
              {post.category}
            </span>

            {/* Article Title — clamped to 2 lines like the cards */}
            <h2 className="text-2xl lg:text-3xl font-bold text-text-heading line-clamp-2">
              {post.title}
            </h2>

            {/* Excerpt — hidden on mobile (compact hero: image, badge, title,
                meta only); desktop shows it clamped to 2 lines like the cards. */}
            <p className="hidden md:line-clamp-2 text-text-body leading-relaxed">
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
      </div>
    </section>
  );
};

export default Hero;
