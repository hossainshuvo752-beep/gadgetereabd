import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import PostMeta from './PostMeta';
import { postHref, type Post } from '@/lib/posts';

type PostCardData = Pick<
  Post,
  'id' | 'slug' | 'title' | 'excerpt' | 'category' | 'date' | 'readTime' | 'imageAlt' | 'heroImage'
>;

/** Category badge colors — one distinct hue per category so cards scan
 *  fast (dopamine-design principle). Unknown categories fall back to the
 *  brand accent. All pairings keep white text ≥4.5:1 contrast.
 *  Exported: the post detail page header renders the same badge pill
 *  (badge → title → excerpt → meta → hero) and must stay in sync. */
export const CATEGORY_BADGE_COLORS: Record<string, string> = {
  News: 'bg-badge-news',
  Roundup: 'bg-badge-roundup',
  Explainer: 'bg-badge-explainer',
  Review: 'bg-badge-review',
  Guide: 'bg-badge-guide',
};

const ArticleCard: React.FC<{ post: PostCardData }> = ({ post }) => {
  return (
    <Link href={postHref(post)}>
      <div className="card-lift bg-text-on-dark border border-text-heading/10 rounded-lg overflow-hidden">
        {/* 16:9 ratio lock — blog images are 16:9 everywhere (listing,
            homepage cards, detail hero). */}
        {/* Category badge overlays the image (top-left, 12px inset) instead
            of occupying its own row below it — solid bg-accent pill keeps it
            legible over any image. */}
        <div className="relative aspect-video bg-bg-dark-secondary/10 flex items-center justify-center overflow-hidden">
          {post.heroImage ? (
            <Image
              src={post.heroImage}
              alt={post.imageAlt}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className="card-zoom object-cover"
            />
          ) : (
            <span className="text-text-body text-sm">{post.imageAlt}</span>
          )}
          <span
            className={`absolute top-3 left-3 inline-flex items-center px-2.5 py-0.5 text-xs font-semibold text-text-on-dark rounded-full ${
              CATEGORY_BADGE_COLORS[post.category] ?? 'bg-accent'
            }`}
          >
            {post.category}
          </span>
        </div>
        <div className="p-3 md:p-5">
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
