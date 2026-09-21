"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import {
  X,
  Search,
  Home,
  Newspaper,
  ShoppingBag,
  Flame,
  Sparkles,
  Info,
  Phone,
  User,
  Eye,
} from 'lucide-react';
import {
  FaFacebookF,
  FaInstagram,
  FaWhatsapp,
  FaYoutube,
  FaPinterest,
} from 'react-icons/fa';
import { posts } from '@/lib/posts';
import { products } from '@/lib/products';
import { useCart } from '@/context/CartContext';

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/blog', label: 'Blog' },
  { href: '/quick-look', label: 'Quick Look' },
  { href: '/shop', label: 'Shop' },
  { href: '/new-arrivals', label: 'New Arrivals' },
  { href: '/deals', label: 'Deals' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

// Mobile drawer navigation — grouped like the reference mobile menu
// (gadgeterea-style), same order as the desktop nav. Desktop keeps using
// NAV_LINKS above, untouched.
const MOBILE_MENU_ITEMS = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/blog', label: 'Blog', icon: Newspaper },
  { href: '/quick-look', label: 'Quick Look', icon: Eye },
  { href: '/shop', label: 'Shop', icon: ShoppingBag },
  { href: '/deals', label: 'Deals', icon: Flame },
  { href: '/new-arrivals', label: 'New Arrivals', icon: Sparkles },
] as const;

const MOBILE_COMPANY_ITEMS = [
  { href: '/about', label: 'About', icon: Info },
  { href: '/contact', label: 'Contact', icon: Phone },
] as const;

// Placeholder hrefs for now — same as the Footer's social icons
// (real profile URLs get added at launch).
const SOCIAL_LINKS = [
  { label: 'Facebook', icon: FaFacebookF },
  { label: 'Instagram', icon: FaInstagram },
  { label: 'WhatsApp', icon: FaWhatsapp },
  { label: 'YouTube', icon: FaYoutube },
  { label: 'Pinterest', icon: FaPinterest },
] as const;

// No-match fallback for search: the first few catalog products (newest
// flagships) under "You might be interested in" — all currently Coming Soon,
// which the dropdown renders honestly via each product's price state.
const FALLBACK_PRODUCTS = products.slice(0, 4);

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  // Live cart count for the badge on the cart icon.
  const { count: cartCount } = useCart();

  // Derive search results during render instead of setting state in an effect.
  // Products match on title, brand or category; posts match on title.
  const q = query.trim().toLowerCase();
  const postResults =
    q === ''
      ? []
      : posts.filter((post) => post.title.toLowerCase().includes(q));
  const productResults =
    q === ''
      ? []
      : products.filter(
          (product) =>
            product.title.toLowerCase().includes(q) ||
            product.specSheet.basicInfo.brand.toLowerCase().includes(q) ||
            product.category.toLowerCase().includes(q)
        );
  // No matches at all → show popular picks instead of an empty result list.
  const showFallback =
    q !== '' && postResults.length === 0 && productResults.length === 0;
  const displayProducts =
    productResults.length > 0 ? productResults : showFallback ? FALLBACK_PRODUCTS : [];

  const closeSearch = () => {
    setIsSearchOpen(false);
    setQuery('');
  };

  // Drawer close: also clears any in-drawer search text so the next open
  // starts fresh on the menu list.
  const closeMenu = () => {
    setIsMenuOpen(false);
    setQuery('');
  };

  return (
    <>
      {/* Header */}
      <header className="bg-bg-dark sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="text-xl font-bold text-text-on-dark">
              TechBD
            </Link>
          </div>

          {/* Desktop Navigation and Actions */}
          <div className="hidden md:block md:flex md:items-center md:space-x-6">
            {/* Navigation Links */}
            <nav className="flex space-x-5 text-sm">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-text-on-dark hover:text-accent transition-colors whitespace-nowrap"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Actions: Search, Account, Cart */}
            <div className="flex items-center space-x-3">
              {/* Search Input */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-56 xl:w-72 px-4 py-2 border border-accent/40 rounded-full bg-bg-dark-secondary placeholder-text-on-dark/70 text-text-on-dark focus:outline-none focus:ring-2 focus:ring-accent"
                />
                <button
                  onClick={() => setIsSearchOpen(true)}
                  aria-label="Search"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-text-on-dark/70 hover:text-text-on-dark"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M11 6a5 5 0 100 10 5 5 0 000-10z" />
                  </svg>
                </button>
              </div>

              {/* Account Icon — links to the placeholder /account page */}
              <Link
                href="/account"
                aria-label="Account"
                className="border border-text-on-dark/20 text-text-on-dark rounded-full w-10 h-10 flex items-center justify-center hover:bg-text-on-dark/10 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </Link>

              {/* Cart Icon — links to the /cart page */}
              <Link
                href="/cart"
                aria-label={`Cart${cartCount > 0 ? ` (${cartCount} items)` : ''}`}
                className="relative border border-text-on-dark/20 text-text-on-dark rounded-full w-10 h-10 flex items-center justify-center hover:bg-text-on-dark/10 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 1.8-4.5 2.1-6.75H5.25M7.5 14.25L5.106 5.272M7.5 14.25l-1.5 3.75m9.75-3.75l1.5 3.75M9 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm9 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                </svg>
                {/* Cart count badge — hidden until there is something in the cart */}
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 flex items-center justify-center rounded-full bg-accent text-text-on-dark text-[11px] font-bold leading-none">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </Link>
            </div>
          </div>

          {/* Mobile Menu Button (Hamburger) */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(true)}
              aria-label="Open menu"
              aria-expanded={isMenuOpen}
              className="text-text-on-dark hover:text-accent"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile slide-in menu — mobile only (md:hidden), overlay drawer.
          Desktop is untouched: this whole block is hidden at md+ and the
          desktop nav bar above never renders it. */}
      <div
        className={`md:hidden fixed inset-0 z-[90] ${
          isMenuOpen ? 'visible' : 'invisible pointer-events-none'
        }`}
        aria-hidden={!isMenuOpen}
      >
        {/* Dimmed backdrop — tap to close */}
        <div
          onClick={closeMenu}
          className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${
            isMenuOpen ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Slide-in panel: search on top, MENU + COMPANY link groups,
            socials, and a full-width Login/Register button at the bottom. */}
        <aside
          role="dialog"
          aria-modal="true"
          aria-label="Site menu"
          className={`absolute inset-y-0 left-0 w-[85%] max-w-xs bg-bg-dark overflow-y-auto flex flex-col transform transition-transform duration-300 ease-in-out ${
            isMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Panel header: brand + X close (top-right corner) */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-text-on-dark/10">
            <Link href="/" onClick={closeMenu} className="text-xl font-bold text-text-on-dark">
              TechBD
            </Link>
            <button
              onClick={closeMenu}
              aria-label="Close menu"
              className="text-text-on-dark/70 hover:text-text-on-dark"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 px-4 py-4">
            {/* Search input — very top of the panel. Shares the same live
                results data as the desktop header search. */}
            <div className="relative mb-5">
              <input
                type="text"
                placeholder="Search products..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-accent/40 rounded-full bg-bg-dark-secondary placeholder-text-on-dark/70 text-text-on-dark text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-on-dark/60" />
            </div>

            {/* Live search results inside the drawer (articles + products) */}
            {q !== '' && (postResults.length > 0 || displayProducts.length > 0) && (
              <div className="mb-5 space-y-1 rounded-md border border-text-on-dark/10 p-2">
                {postResults.length > 0 && (
                  <div>
                    <p className="px-2 pb-1 text-xs font-semibold uppercase tracking-wider text-text-on-dark/50">
                      Articles
                    </p>
                    {postResults.map((post) => (
                      <Link
                        key={post.id}
                        href={`/posts/${post.id}`}
                        onClick={closeMenu}
                        className="block px-2 py-1.5 text-sm text-text-on-dark/70 hover:text-text-on-dark rounded"
                      >
                        {post.title}
                      </Link>
                    ))}
                  </div>
                )}
                {displayProducts.length > 0 && (
                  <div>
                    <p className="px-2 pb-1 text-xs font-semibold uppercase tracking-wider text-text-on-dark/50">
                      {showFallback ? 'You might be interested in' : 'Products'}
                    </p>
                    {displayProducts.map((product) => (
                      <Link
                        key={product.id}
                        href={`/shop/${product.id}`}
                        onClick={closeMenu}
                        className="flex items-center justify-between gap-3 px-2 py-1.5 text-sm text-text-on-dark/70 hover:text-text-on-dark rounded"
                      >
                        <span>{product.title}</span>
                        <span className="shrink-0 text-xs text-accent">
                          {product.price === null
                            ? 'Coming Soon'
                            : product.priceEstimated
                              ? `Est. ৳${product.price.toLocaleString()}`
                              : `৳${product.price.toLocaleString()}`}
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* MENU section */}
            <p className="text-xs font-semibold uppercase tracking-wider text-text-on-dark/50 mb-2">
              Menu
            </p>
            <nav className="space-y-1 mb-6">
              {MOBILE_MENU_ITEMS.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={closeMenu}
                  className="flex items-center gap-3 px-2 py-2.5 rounded-md text-text-on-dark hover:bg-text-on-dark/10 hover:text-accent transition-colors"
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <span className="text-base font-medium">{label}</span>
                </Link>
              ))}
            </nav>

            {/* COMPANY section */}
            <p className="text-xs font-semibold uppercase tracking-wider text-text-on-dark/50 mb-2">
              Company
            </p>
            <nav className="space-y-1">
              {MOBILE_COMPANY_ITEMS.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={closeMenu}
                  className="flex items-center gap-3 px-2 py-2.5 rounded-md text-text-on-dark hover:bg-text-on-dark/10 hover:text-accent transition-colors"
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <span className="text-base font-medium">{label}</span>
                </Link>
              ))}
            </nav>
          </div>

          {/* Bottom block: socials + full-width Login/Register */}
          <div className="px-4 pb-6 pt-2">
            <div className="flex justify-center gap-3 mb-4">
              {SOCIAL_LINKS.map(({ label, icon: Icon }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="flex items-center justify-center w-9 h-9 rounded-full bg-bg-dark-secondary hover:bg-bg-dark-secondary/70"
                >
                  <Icon className="w-4 h-4 text-text-on-dark" />
                </a>
              ))}
            </div>
            <Link
              href="/login"
              onClick={closeMenu}
              className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-accent text-text-on-dark font-medium rounded-md hover:bg-accent-hover transition-colors"
            >
              <User className="w-5 h-5" />
              Login / Register
            </Link>
          </div>
        </aside>
      </div>

      {/* Mobile Search (desktop-width overlay under the header) */}
      {isSearchOpen && (
        <div className="hidden md:block">
          <div className="pt-2 pb-3">
            <input
              type="text"
              placeholder="Search products..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-72 px-4 py-2 border border-accent/40 rounded-full bg-bg-dark-secondary placeholder-text-on-dark/70 text-text-on-dark focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <button
              onClick={closeSearch}
              className="mt-2 w-full px-3 py-1 bg-accent text-text-on-dark font-medium rounded-md hover:bg-accent-hover"
            >
              Search
            </button>
            {(postResults.length > 0 || displayProducts.length > 0) && (
              <div className="mt-2 space-y-3 rounded-md border border-text-on-dark/10 p-2">
                {postResults.length > 0 && (
                  <div>
                    <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wider text-text-on-dark/50">
                      Articles
                    </p>
                    {postResults.map((post) => (
                      <Link
                        key={post.id}
                        href={`/posts/${post.id}`}
                        onClick={closeSearch}
                        className="block px-3 py-1.5 text-sm text-text-on-dark/70 hover:text-text-on-dark rounded"
                      >
                        {post.title}
                      </Link>
                    ))}
                  </div>
                )}
                {displayProducts.length > 0 && (
                  <div>
                    <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wider text-text-on-dark/50">
                      {showFallback ? 'You might be interested in' : 'Products'}
                    </p>
                    {displayProducts.map((product) => (
                      <Link
                        key={product.id}
                        href={`/shop/${product.id}`}
                        onClick={closeSearch}
                        className="flex items-center justify-between gap-3 px-3 py-1.5 text-sm text-text-on-dark/70 hover:text-text-on-dark rounded"
                      >
                        <span>{product.title}</span>
                        {/* Dark header bg: keep the lightweight inline renderer,
                            but still mark estimated prices honestly. */}
                        <span className="shrink-0 text-xs text-accent">
                          {product.price === null
                            ? 'Coming Soon'
                            : product.priceEstimated
                              ? `Est. ৳${product.price.toLocaleString()}`
                              : `৳${product.price.toLocaleString()}`}
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
