import Link from 'next/link';
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
