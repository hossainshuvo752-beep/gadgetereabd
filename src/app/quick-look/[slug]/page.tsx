import Link from 'next/link';
import type { Metadata } from 'next';
import { slugify, products } from '@/lib/products';
import QuickLookDetail from '@/components/QuickLookDetail';
import NewsletterPopup from '@/components/NewsletterPopup';
import JsonLd from '@/components/JsonLd';
import { productSchema } from '@/lib/schema';

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
  if (!product) return { title: 'Product not found | TechBD' };

  // Price-lookup/spec intent metadata, generated from real product data only.
  const { specSheet: spec, price } = product;
  const title = `${product.title} Price in Bangladesh — Specs & Review | TechBD`;

  const pricePart =
    price !== null && !product.priceEstimated
      ? `${product.title} price in Bangladesh: ৳${price.toLocaleString()}.`
      : product.priceEstimated && price !== null
        ? `${product.title} estimated price in Bangladesh: ৳${price.toLocaleString()} (official BD price not confirmed yet).`
        : `${product.title} price in Bangladesh: coming soon.`;
  const availability =
    product.status === 'upcoming'
      ? 'Not officially released in Bangladesh yet.'
      : product.priceEstimated
        ? 'Availability in Bangladesh: unconfirmed.'
        : 'Available now in Bangladesh.';
  const description = `${pricePart} Check full specifications — ${spec.display.size} ${spec.display.type} display, ${spec.performance.processor}, ${spec.performance.ram} RAM, ${spec.cameraSystem.rear}. ${availability}`;

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

  return (
    <>
      {/* Product schema — mirrors the visible spec sheet; offers only when
          the price is confirmed (see lib/schema.ts). */}
      <JsonLd data={productSchema(product)} />
      <QuickLookDetail product={product} />
      <NewsletterPopup />
    </>
  );
}
