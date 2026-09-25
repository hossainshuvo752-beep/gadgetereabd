"use client";

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { posts } from '@/lib/posts';
import { products, slugify } from '@/lib/products';
import PriceTag from '@/components/PriceTag';
import ArticleCard from '@/components/ArticleCard';

/**
 * Search results page — /search?q=your+query. Searches the shared dummy
 * posts (title + excerpt) and products (title + category). Dummy data only.
 *
 * useSearchParams() must be wrapped in <Suspense> for the page to prerender
 * as a static shell — do not remove the wrapper.
 */

function SearchResults() {
  const searchParams = useSearchParams();
  // The URL ?q= param is the single source of truth; the form navigates via GET.
  const query = searchParams.get('q') ?? '';

  const normalized = query.trim().toLowerCase();

  const matchedPosts =
    normalized === ''
      ? []
      : posts.filter(
          (post) =>
            post.title.toLowerCase().includes(normalized) ||
            post.excerpt.toLowerCase().includes(normalized) ||
            post.category.toLowerCase().includes(normalized)
        );

  const matchedProducts =
    normalized === ''
      ? []
      : products.filter(
          (product) =>
            product.title.toLowerCase().includes(normalized) ||
            product.category.toLowerCase().includes(normalized) ||
            product.specSheet.basicInfo.brand.toLowerCase().includes(normalized)
        );

  const totalResults = matchedPosts.length + matchedProducts.length;

  return (
    <>
      {/* Search form */}
      <form action="/search" className="flex gap-2 mb-8 max-w-xl">
        <input
          type="text"
          name="q"
          defaultValue={query}
          placeholder="Search reviews, guides, products…"
          className="flex-1 px-4 py-2 border border-text-heading/20 rounded-md text-text-heading placeholder-text-body focus:outline-none focus:ring-2 focus:ring-accent"
        />
        <button
          type="submit"
          className="px-5 py-2 bg-accent text-text-on-dark font-medium rounded-md hover:bg-accent-hover transition-colors"
        >
          Search
        </button>
      </form>

      {normalized === '' ? (
        <div className="bg-text-on-dark border border-text-heading/10 rounded-lg p-12 text-center">
          <div className="text-4xl mb-4">🔍</div>
          <h2 className="text-xl font-bold text-text-heading mb-2">
            Search TechBD
          </h2>
          <p className="text-text-body">
            Type a search term above — for example &ldquo;laptop&rdquo; or
            &ldquo;review&rdquo;.
          </p>
        </div>
      ) : (
        <>
          <p className="text-text-body mb-6">
            {totalResults > 0 ? (
              <>
                <span className="font-semibold text-text-heading">{totalResults}</span>{' '}
                result{totalResults === 1 ? '' : 's'} for{' '}
                <span className="font-semibold text-text-heading">&ldquo;{query}&rdquo;</span>
              </>
            ) : (
              <>
                No results for{' '}
                <span className="font-semibold text-text-heading">&ldquo;{query}&rdquo;</span>.
                Try a different term.
              </>
            )}
          </p>

          {/* Matching products */}
          {matchedProducts.length > 0 && (
            <section className="mb-10">
              <h2 className="text-xl font-bold text-text-heading mb-4">Products</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {matchedProducts.map((product) => (
                  <Link
                    key={product.id}
                    href={`/shop/${slugify(product.title)}`}
                    className="bg-text-on-dark border border-text-heading/10 rounded-lg p-4 hover:shadow-md transition-shadow duration-300"
                  >
                    <span className="inline-flex items-center px-2 py-0.5 text-xs font-semibold bg-accent/10 text-accent-hover rounded-full mb-2">
                      {product.category}
                    </span>
                    <h3 className="font-semibold text-text-heading mb-1">
                      {product.title}
                    </h3>
                    <p className="text-sm">
                      {product.price !== null ? (
                        <PriceTag product={product} hideOldPrice />
                      ) : (
                        <span className="text-text-body">
                          Coming Soon / Price Unavailable in Bangladesh
                        </span>
                      )}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Matching articles */}
          {matchedPosts.length > 0 && (
            <section>
              <h2 className="text-xl font-bold text-text-heading mb-4">Articles</h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {matchedPosts.map((post) => (
                  <ArticleCard key={post.id} post={post} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </>
  );
}

export default function SearchPage() {
  return (
    <section className="py-12 bg-bg-light min-h-[calc(100vh-64px)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-text-heading mb-8">Search</h1>
        <Suspense
          fallback={
            <p className="text-text-body" role="status">
              Loading search…
            </p>
          }
        >
          <SearchResults />
        </Suspense>
      </div>
    </section>
  );
}
