"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { track } from '@/lib/tracking';
import { products, isPurchasable, type Product } from '@/lib/products';

/**
 * THE cart store — simple React Context held in local state, persisted to
 * localStorage so the cart survives reloads. Used by "Add to Cart" buttons
 * (ProductCard, ShopTeaser), the /cart page, /checkout and /order-confirmation.
 *
 * Rules:
 * - Items reference the shared products array by id — never duplicate product
 *   data here.
 * - Only confirmed-price products can be added (isPurchasable); estimated or
 *   missing prices are rejected with an explanatory toast.
 * - Do not hardcode product ids anywhere in the app — carts start empty.
 */

export type CartItem = {
  productId: number;
  qty: number;
  /** Chosen variant label (color/storage from detail pages; "Standard" on cards) */
  variant: string;
};

const STORAGE_KEY = 'techbd_cart_v1';

type CartContextValue = {
  items: CartItem[];
  /** Total number of units (for the Header badge). */
  count: number;
  /** Whether localStorage has been read (avoid badge flicker before hydration). */
  hydrated: boolean;
  addToCart: (productId: number, qty?: number, variant?: string) => void;
  changeQty: (productId: number, delta: number) => void;
  removeItem: (productId: number) => void;
  clearCart: () => void;
  /** Resolve a cart item to its Product (undefined if it left the catalog). */
  findProduct: (productId: number) => Product | undefined;
  toast: string | null;
  /** Show an arbitrary toast message (e.g. "Pre-order request received: …"). */
  notify: (message: string) => void;
};

const CartContext = createContext<CartContextValue | null>(null);

function readStoredItems(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Keep only entries that still resolve to a purchasable catalog product.
    return parsed.filter(
      (entry): entry is CartItem =>
        entry &&
        typeof entry.productId === 'number' &&
        typeof entry.qty === 'number' &&
        entry.qty > 0 &&
        typeof entry.variant === 'string' &&
        isPurchasable(products.find((p) => p.id === entry.productId) as Product)
    );
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Hydrate from localStorage once on mount (client only).
  useEffect(() => {
    setItems(readStoredItems());
    setHydrated(true);
  }, []);

  // Persist on every change after hydration.
  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const showToast = useCallback((message: string) => {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2500);
  }, []);

  const addToCart = useCallback(
    (productId: number, qty = 1, variant = 'Standard') => {
      const product = products.find((p) => p.id === productId);
      if (!product || !isPurchasable(product)) {
        showToast('Sorry — this product can’t be added yet (no confirmed price).');
        return;
      }
      setItems((prev) => {
        const existing = prev.find((item) => item.productId === productId);
        if (existing) {
          return prev.map((item) =>
            item.productId === productId
              ? { ...item, qty: Math.min(99, item.qty + qty) }
              : item
          );
        }
        return [...prev, { productId, qty, variant }];
      });
      showToast(`Added to cart: ${product.title}`);
      track('add_to_cart', { product_id: product.id });
    },
    [showToast]
  );

  const changeQty = useCallback((productId: number, delta: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.productId === productId
          ? { ...item, qty: Math.min(99, Math.max(1, item.qty + delta)) }
          : item
      )
    );
  }, []);

  const removeItem = useCallback((productId: number) => {
    setItems((prev) => prev.filter((item) => item.productId !== productId));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const findProduct = useCallback(
    (productId: number) => products.find((p) => p.id === productId),
    []
  );

  const count = items.reduce((sum, item) => sum + item.qty, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        count,
        hydrated,
        addToCart,
        changeQty,
        removeItem,
        clearCart,
        findProduct,
        toast,
        notify: showToast,
      }}
    >
      {children}
      {/* Toast feedback — fixed above the sticky header, non-interactive */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-20 left-1/2 -translate-x-1/2 z-[60] px-5 py-2.5 rounded-lg shadow-lg bg-accent text-text-on-dark text-sm font-medium"
        >
          {toast}
        </div>
      )}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart must be used inside <CartProvider>');
  }
  return ctx;
}
