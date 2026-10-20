import Link from 'next/link';
import type { Metadata } from 'next';
import { slugify, products } from '@/lib/products';
import QuickLookDetail from '@/components/QuickLookDetail';
import NewsletterPopup from '@/components/NewsletterPopup';
import JsonLd from '@/components/JsonLd';
import { productSchema, faqSchema } from '@/lib/schema';
import {
  quickLookSeoTitle,
  quickLookSeoDescription,
} from '@/lib/productSeo';
import { getQuickLookContent } from '@/lib/quickLookContent';
import QuickLookGuideSection from '@/components/QuickLookGuide';

/**
 * Individual Quick Look detail page: /quick-look/honor-robot-phone,
 * /quick-look/samsung-galaxy-s26-ultra, etc.
 * Server component — resolves the slug and delegates the (interactive)
 * layout to the QuickLookDetail client component.
 */
export function generateStaticParams() {
  return products.map((product) => ({ slug: slugify(product.title) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = products.find((p) => slugify(p.title) === slug);
  if (!product) return { title: 'Product not found | Jupiter BD' };

  // Price-lookup/spec intent metadata, generated from real product data
  // only (shared builder in lib/productSeo.ts — same copy basis as the
  // Shop route; per-product seoName + spec highlights included).
  // The title is rendered ABSOLUTE on purpose: the shared template is
  // "{seoName} Price in Bangladesh 2026 & Specs" and already sits inside
  // the 60-char budget, so the root layout's "%s | Jupiter BD" suffix
  // would push it over. A product may still carry an exact titleOverride.
  const title = quickLookSeoTitle(product);
  const description = quickLookSeoDescription(product);
  // Social card: a product with its own 1200x630 card (ogImage) uses it
  // instead of the square hero. twitter is ALWAYS set explicitly (same
  // text and image as og) — without it the page inherited the Quick Look
  // LISTING copy from the layout, which is what Search Console flagged.
  const shareImage = product.ogImage ?? product.heroImage;
  const social = shareImage ? [{ url: shareImage }] : undefined;

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: `/quick-look/${slugify(product.title)}` },
    openGraph: {
      title,
      description,
      ...(social ? { images: social } : {}),
    },
    twitter: {
      card: 'summary_large_image' as const,
      title,
      description,
      ...(shareImage ? { images: [shareImage] } : {}),
    },
  };
}

export default async function QuickLookProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = products.find((p) => slugify(p.title) === slug);

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-bg-light px-4">
        <h1 className="text-2xl font-bold text-text-heading mb-4">Product not found</h1>
        <Link
          href="/quick-look"
          className="px-4 py-2 bg-accent text-text-on-dark font-medium rounded-md hover:bg-accent-hover transition-colors"
        >
          ← Back to Quick Look
        </Link>
      </div>
    );
  }

  // Long-form guide exists for this slug only when written; products
  // without an entry render nothing extra (no thin duplicate content).
  const guide = getQuickLookContent(slugify(product.title));

  return (
    <>
      {/* Product schema — mirrors the visible spec sheet; offers only when
          the price is confirmed (see lib/schema.ts). urlContext='quick-look'
          makes the Product/Offer url self-reference THIS page's canonical
          /quick-look/<slug> (Search Console inspection fix); the Shop route
          keeps its default /shop/<slug> context. FAQPage schema is emitted
          from the SAME array the guide section renders, so the marked-up
          text matches the visible text exactly.
          Products flagged noProductSchema (no price, offers, rating or
          review to mark up — the Apple HomeView) emit NO Product node at
          all, which is what keeps an incomplete Product markup out of
          Search Console; their FAQPage is still emitted below. */}
      {!product.noProductSchema && (
        <JsonLd data={productSchema(product, 'quick-look')} />
      )}
      {guide && <JsonLd data={faqSchema(guide.faqs)} />}
      <QuickLookDetail product={product} />
      {guide && (
        <QuickLookGuideSection guide={guide} productTitle={product.title} />
      )}
      <NewsletterPopup />
    </>
  );
}
