import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { products, slugify } from '@/lib/products';
import QuickLookDetail from '@/components/QuickLookDetail';
import NewsletterPopup from '@/components/NewsletterPopup';
import JsonLd from '@/components/JsonLd';
import { productSchema } from '@/lib/schema';

/**
 * Individual Shop product page: /shop/honor-robot-phone, /shop/samsung-galaxy-s26-ultra, …
 * Server component — resolves the product by its name slug (the same slug
 * pattern as /quick-look/[slug]) and delegates to the SHARED QuickLookDetail
 * template (identical layout/gallery/CTA behavior; only the metadata differs).
 *
 * NOTE: URLs are slugs, not numeric ids. Old numeric links (/shop/3) now
 * 404 gracefully via notFound() — they were never indexed broadly and the
 * sitemap has been updated to the slug URLs.
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

  // Buying-intent metadata, generated from real product data only.
  const { specSheet: spec, price } = product;
  const title = `${product.title} — Buy Online in Bangladesh | TechBD`;

  const pricePart =
    price !== null && !product.priceEstimated
      ? `Price: ৳${price.toLocaleString()}.`
      : product.priceEstimated && price !== null
        ? `Estimated price: ৳${price.toLocaleString()} (official BD price not confirmed yet).`
        : 'Price coming soon.';
  const availability =
    product.status === 'upcoming'
      ? 'Not officially released in Bangladesh yet — pre-order open.'
      : product.priceEstimated
        ? 'Availability in Bangladesh: unconfirmed.'
        : 'Available now in Bangladesh.';
  const description = [
    `Buy ${product.title} in Bangladesh.`,
    `${spec.display.size} ${spec.display.type} display, ${spec.performance.processor}, ${spec.performance.ram} RAM.`,
    pricePart,
    availability,
  ].join(' ');

  return {
    title,
    description,
    alternates: { canonical: `/shop/${slugify(product.title)}` },
    openGraph: {
      title,
      description,
      ...(product.heroImage ? { images: [{ url: product.heroImage }] } : {}),
    },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = products.find((p) => slugify(p.title) === slug);

  if (!product) {
    notFound();
  }

  return (
    <>
      {/* Product schema — offers only when the visible price is confirmed
          (never for estimated prices or upcoming products). */}
      <JsonLd data={productSchema(product)} />
      {/* Same shared template as the Quick Look detail page. The page ends
          at the Add to Cart / Buy Now / Notify Me button row (the sectioned
          Specifications block is Quick Look–only). */}
      <QuickLookDetail product={product} showFullSpecs={false} />
      <NewsletterPopup />
    </>
  );
}
