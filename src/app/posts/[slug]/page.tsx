import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { posts } from '@/lib/posts';
import NewsletterPopup from '@/components/NewsletterPopup';
import PostMeta from '@/components/PostMeta';
import JsonLd from '@/components/JsonLd';
import { articleSchema, faqSchema } from '@/lib/schema';

/**
 * Blog article detail page (/posts/[id]). Imports the single shared posts
 * data source from @/lib/posts — do NOT inline post data here.
 */

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = posts.find((p) => p.id === parseInt(slug, 10));
  if (!post) return { title: 'Post Not Found — TechBD' };
  return {
    title: post.metaTitle,
    description: post.metaDescription,
  };
}

export default async function PostsPage({ params }: Props) {
  const { slug } = await params;
  const post = posts.find((p) => p.id === parseInt(slug, 10));

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-bg-light p-8">
        <h1 className="text-2xl font-bold text-text-heading mb-4">Post Not Found</h1>
        <p className="text-text-body mb-6">
          The post you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link
          href="/"
          className="inline-block px-4 py-2 bg-accent text-text-on-dark font-medium rounded-md hover:bg-accent-hover transition-colors"
        >
          Return to Homepage
        </Link>
      </div>
    );
  }

  return (
    <article className="min-h-screen bg-text-on-dark">
      {/* BlogPosting schema — headline/author/date mirror the visible header. */}
      <JsonLd data={articleSchema(post)} />
      {/* FAQPage schema — emitted only from the same faqs array the page
          renders below (AEO Standards 7/8: exact visible-content match). */}
      {post.faqs && post.faqs.length > 0 && <JsonLd data={faqSchema(post.faqs)} />}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Featured Image Placeholder */}
        <div className="mb-8">
          <div className="w-full h-64 bg-bg-dark-secondary/10 rounded-lg flex items-center justify-center">
            <span className="text-text-body text-sm">{post.imageAlt}</span>
          </div>
        </div>

        {/* Content Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <span className="inline-flex items-center px-3 py-1 text-xs font-semibold bg-accent/10 text-accent-hover rounded-full">
              {post.category}
            </span>
            <h1 className="text-3xl font-bold text-text-heading">{post.title}</h1>
          </div>
          {/* Two-line meta (avatar+author / date•readTime) — detail page size */}
          <PostMeta author={post.author} date={post.date} readTime={post.readTime} className="text-sm" />
        </div>

        {/* Article Content */}
        <div className="prose lg:prose-xl max-w-none">
          {/* Trusted, locally-authored HTML from src/lib/posts.ts */}
          <div dangerouslySetInnerHTML={{ __html: post.content }} />
          {/* FAQ section — each question a natural question-format H2 (AEO
              Standards 3/7); the same array feeds the FAQPage schema above. */}
          {post.faqs && post.faqs.length > 0 && (
            <section>
              {post.faqs.map((faq) => (
                <div key={faq.question}>
                  <h2>{faq.question}</h2>
                  <p>{faq.answer}</p>
                </div>
              ))}
            </section>
          )}
        </div>

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

// Generate static paths for all posts
export async function generateStaticParams() {
  return posts.map((post) => ({
    slug: post.id.toString(),
  }));
}
