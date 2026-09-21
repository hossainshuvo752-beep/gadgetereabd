"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, LayoutGrid, Tag, ShoppingCart } from 'lucide-react';
import { useCart } from '@/context/CartContext';

/**
 * Mobile-only fixed bottom navigation bar (hidden at md+). Four items with
 * icon-over-label layout; the item matching the current route highlights in
 * the accent color. Uses safe-area insets so it clears iPhone home bars.
 *
 * IMPORTANT pairing: the layout adds matching bottom padding to <main> and
 * the Footer on mobile so this bar never covers page content. If you change
 * the bar's height classes here, mirror them in layout.tsx / Footer.tsx.
 */
const ITEMS = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/shop', label: 'Category', icon: LayoutGrid },
  { href: '/deals', label: 'Offer', icon: Tag },
  { href: '/cart', label: 'Cart', icon: ShoppingCart },
] as const;

const MobileBottomNav: React.FC = () => {
  const pathname = usePathname();
  const { count: cartCount } = useCart();

  return (
    <nav
      aria-label="Mobile navigation"
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-bg-dark border-t border-text-on-dark/10"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="grid grid-cols-4">
        {ITEMS.map(({ href, label, icon: Icon }) => {
          // Exact match on "/" so every other page doesn't highlight Home;
          // prefix match elsewhere so /shop/1 still highlights Category.
          const active =
            href === '/' ? pathname === '/' : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? 'page' : undefined}
              className={`relative flex flex-col items-center justify-center gap-0.5 py-2 text-[11px] font-medium transition-colors ${
                active ? 'text-accent' : 'text-text-on-dark/70 hover:text-text-on-dark'
              }`}
            >
              <span className="relative">
                <Icon className="w-5 h-5" />
                {/* Cart item doubles as the live cart badge */}
                {href === '/cart' && cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 flex items-center justify-center rounded-full bg-accent text-text-on-dark text-[10px] font-bold leading-none">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </span>
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
