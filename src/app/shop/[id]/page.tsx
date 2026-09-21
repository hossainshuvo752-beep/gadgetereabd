import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { products } from '@/lib/products';
import QuickLookDetail from '@/components/QuickLookDetail';
import NewsletterPopup from '@/components/NewsletterPopup';

/**
 * Individual Shop product page: /shop/1, /shop/2, …
 * Server component — resolves the id and delegates to the SHARED
 * QuickLookDetail template (identical layout/gallery/CTA behavior as
 * /quick-look/[slug]; only the breadcrumb differs).
 */
export function generateStaticParams() {
  return products.map((product) => ({ id: String(product.id) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = products.find((p) => p.id === parseInt(id, 10));
  if (!product) return { title: 'Product not found | TechBD' };
  return {
    title: `${product.title} — Specs & Price in Bangladesh | TechBD`,
    description: `${product.specSheet.basicInfo.brand} ${product.specSheet.basicInfo.model}: ${product.specSheet.display.size} ${product.specSheet.display.type}, ${product.specSheet.performance.processor}. Full specs and Bangladesh price on TechBD.`,
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const productId = parseInt(id);
  const product = products.find((p) => p.id === productId);

  if (!product) {
    notFound();
  }

  return (
    <>
      {/* Same shared template as the Quick Look detail page — breadcrumb
          points back to the Shop listing instead of Quick Look. */}
      <QuickLookDetail
        product={product}
        breadcrumb={{ href: '/shop', label: 'Shop' }}
      />
      <NewsletterPopup />
    </>
  );
}
