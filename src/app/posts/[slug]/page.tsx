import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { posts, postHref, type Post } from '@/lib/posts';
import NewsletterPopup from '@/components/NewsletterPopup';
import PostFaqAccordion from '@/components/PostFaqAccordion';
import ShareButtons from '@/components/ShareButtons';
import AuthorBio from '@/components/AuthorBio';
import RelatedPosts from '@/components/RelatedPosts';
import PostMeta from '@/components/PostMeta';
import { CATEGORY_BADGE_COLORS } from '@/components/ArticleCard';
import JsonLd from '@/components/JsonLd';
import { articleSchema, faqSchema, mentionsSchema } from '@/lib/schema';
import { SITE_URL } from '@/lib/siteUrl';

/**
 * Blog article detail page (/posts/[slug]). Imports the single shared posts
 * data source from @/lib/posts — do NOT inline post data here.
 *
 * Slug resolution: /posts/<slug> for slug posts (canonical), /posts/<id>
 * for the six legacy posts whose published URLs predate slugs (AEO
 * Standards 10 — never republish an existing URL).
 */

type Props = { params: Promise<{ slug: string }> };

function findPost(slug: string): Post | undefined {
  return (
    posts.find((p) => p.slug === slug) ??
    // Numeric URLs resolve ONLY slug-less legacy posts (which no longer
    // exist after the dummy-post removal → /posts/1…6 now correctly 404).
    // Slug posts resolve by slug alone, so /posts/<id> can't serve duplicate
    // non-canonical copies of them.
    posts.find((p) => !p.slug && p.id === parseInt(slug, 10))
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = findPost(slug);
  if (!post) return { title: 'Post Not Found — Jupiter BD' };
  const url = postHref(post);
  return {
    title: post.metaTitle,
    description: post.metaDescription,
    // Meta keywords: Google ignores them, but some engines/tools still read
    // them — derived from category + FAQ questions when no explicit list.
    keywords:
      post.metaKeywords ??
      [post.category, ...post.title.split(/[^\w৳]+/).filter((w) => w.length > 3)]
        .slice(0, 8)
        .join(', '),
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      siteName: 'Jupiter BD',
      title: post.metaTitle,
      description: post.metaDescription,
      url,
      ...(post.heroImage
        ? {
            images: [
              {
                url: post.heroImage,
                width: 1376,
                height: 768,
                alt: post.imageAlt,
              },
            ],
          }
        : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: post.metaTitle,
      description: post.metaDescription,
      ...(post.heroImage ? { images: [post.heroImage] } : {}),
    },
  };
}

export default async function PostsPage({ params }: Props) {
  const { slug } = await params;
  const post = findPost(slug);

  // Proper HTTP 404 (not a 200 shell) so search engines drop removed posts.
  if (!post) notFound();

  return (
    <article className="min-h-screen bg-text-on-dark">
      {/* BlogPosting schema — headline/author/date mirror the visible header.
          Products MENTIONED in the article emit minimal name+brand Product
          schema only — never offers/ratings (nothing visible confirms them). */}
      <JsonLd data={articleSchema(post)} />
      {post.mentions?.map((m) => <JsonLd key={m.name} data={mentionsSchema(m)} />)}
      {/* FAQPage schema — emitted only from the same faqs array the page
          renders below (AEO Standards 7/8: exact visible-content match). */}
      {post.faqs && post.faqs.length > 0 && <JsonLd data={faqSchema(post.faqs)} />}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Content Header — gadgeterea-style order: category badge → title →
            excerpt → author/date/read-time meta, THEN the hero image and body.
            The badge/meta were restored here (2026-09-28) after previously
            being removed from the article header; PostMeta keeps them in sync
            with the card pattern. */}
        <div className="mb-6">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 text-xs font-semibold text-text-on-dark rounded-full ${
              CATEGORY_BADGE_COLORS[post.category] ?? 'bg-accent'
            }`}
          >
            {post.category}
          </span>
          <h1 className="mt-3 text-3xl font-bold text-text-heading">{post.title}</h1>
          <p className="mt-3 text-base md:text-lg text-text-body leading-relaxed">{post.excerpt}</p>
          <div className="mt-4">
            <PostMeta
              author={post.author}
              date={post.date}
              readTime={post.readTime}
              className="text-sm"
              singleLine
            />
          </div>
        </div>

        {/* Featured image — real optimized WebP when the post has one;
            legacy posts keep the placeholder box. Native dimensions match
            the converted 1376×768 sources (16:9). */}
        <div className="mb-8">
          {post.heroImage ? (
            <Image
              src={post.heroImage}
              alt={post.imageAlt}
              width={1376}
              height={768}
              priority
              sizes="(max-width: 768px) 100vw, 896px"
              className="w-full h-auto rounded-lg"
            />
          ) : (
            <div className="w-full aspect-video bg-bg-dark-secondary/10 rounded-lg flex items-center justify-center">
              <span className="text-text-body text-sm">{post.imageAlt}</span>
            </div>
          )}
        </div>

        {/* Article Content — scoped typography (.post-body in globals.css;
            Tailwind's prose classes were dead here — no typography plugin). */}
        <div className="post-body">
          {/* Trusted, locally-authored HTML from src/lib/posts.ts */}
          <div dangerouslySetInnerHTML={{ __html: post.content }} />
        </div>

        {/* FAQ accordion — same faqs array feeds the FAQPage schema above
            (single-open, chevron pattern shared with HomeFAQ and /faq). */}
        {post.faqs && post.faqs.length > 0 && <PostFaqAccordion faqs={post.faqs} />}

        {/* Share row (client) — canonical URL composed server-side. */}
        <ShareButtons
          url={`${SITE_URL}${postHref(post)}`}
          title={post.title}
        />

        {/* Author attribution + link to About. */}
        <AuthorBio author={post.author} />

        {/* Related posts — same category first, recent fill. */}
        <RelatedPosts current={post} />

        {/* Back to Home Link */}
        <div className="mt-12">
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 bg-accent text-text-on-dark font-medium rounded-md hover:bg-accent-hover transition-colors"
          >
            ← Back to All Posts
          </Link>
        </div>
      </div>
      <NewsletterPopup />
    </article>
  );
}

// Generate static paths — slug-based for slug posts, numeric for legacy.
export async function generateStaticParams() {
  return posts.map((post) => ({ slug: post.slug ?? post.id.toString() }));
}
