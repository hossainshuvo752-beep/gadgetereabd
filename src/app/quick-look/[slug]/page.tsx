import Link from 'next/link';
import type { Metadata } from 'next';
import { slugify, products } from '@/lib/products';
import QuickLookDetail from '@/components/QuickLookDetail';
import NewsletterPopup from '@/components/NewsletterPopup';

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
  return {
    title: `${product.title} — Full Specs & Price in Bangladesh | TechBD`,
    description: `${product.specSheet.basicInfo.brand} ${product.specSheet.basicInfo.model}: ${product.specSheet.display.size} ${product.specSheet.display.type}, ${product.specSheet.performance.processor}. Full spec sheet and Bangladesh price on TechBD.`,
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
      <QuickLookDetail product={product} />
      <NewsletterPopup />
    </>
  );
}
