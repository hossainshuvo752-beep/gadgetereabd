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
  // Shop route; hand-tuned per-product description phrases included).
  const title = quickLookSeoTitle(product);
  const description = quickLookSeoDescription(product);

  return {
    title,
    description,
    alternates: { canonical: `/quick-look/${slugify(product.title)}` },
    openGraph: {
      title,
      description,
      ...(product.heroImage ? { images: [{ url: product.heroImage }] } : {}),
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
          the price is confirmed (see lib/schema.ts). FAQPage schema is
          emitted from the SAME array the guide section renders, so the
          marked-up text matches the visible text exactly (only for the
          guide's own FAQ — the existing Product schema is untouched). */}
      <JsonLd data={productSchema(product)} />
      {guide && <JsonLd data={faqSchema(guide.faqs)} />}
      <QuickLookDetail product={product} />
      {guide && <QuickLookGuideSection guide={guide} />}
      <NewsletterPopup />
    </>
  );
}
