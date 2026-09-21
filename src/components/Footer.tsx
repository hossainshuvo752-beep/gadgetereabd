import React from 'react';
import Link from 'next/link';
import { FaFacebookF, FaInstagram, FaWhatsapp, FaYoutube, FaPinterest } from 'react-icons/fa';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-bg-dark pt-12 pb-24 md:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* MOBILE: brand full-width (col-span-3), then Shop | Support |
            Account side-by-side in one 3-column row (gadgeterea-style).
            md: 2x2 grid; lg: gadgeterea 2fr_1fr_1fr_1fr ratio — unchanged. */}
        <div className="grid grid-cols-3 md:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr] gap-6 md:gap-8">
          {/* Brand — spans all 3 mobile columns; single cell at md/lg */}
          <div className="col-span-3 md:col-span-1 space-y-4">
            <Link href="/" className="mb-2 inline-block">
              <span className="text-2xl font-bold text-text-on-dark">TechBD</span>
            </Link>
            <p className="text-text-on-dark/70">
              Your honest guide to gadgets in Bangladesh.
            </p>
            <p className="text-text-on-dark/70">
              Real reviews, real trust — no sponsorships, no bias.
            </p>
            <div className="flex space-x-4 mt-2">
              <a href="#" aria-label="Facebook" className="flex items-center justify-center w-8 h-8 rounded-full bg-bg-dark-secondary hover:bg-bg-dark-secondary/70">
                <FaFacebookF className="h-5 w-5 text-text-on-dark" />
              </a>
              <a href="#" aria-label="Instagram" className="flex items-center justify-center w-8 h-8 rounded-full bg-bg-dark-secondary hover:bg-bg-dark-secondary/70">
                <FaInstagram className="h-5 w-5 text-text-on-dark" />
              </a>
              <a href="#" aria-label="WhatsApp" className="flex items-center justify-center w-8 h-8 rounded-full bg-bg-dark-secondary hover:bg-bg-dark-secondary/70">
                <FaWhatsapp className="h-5 w-5 text-text-on-dark" />
              </a>
              <a href="#" aria-label="YouTube" className="flex items-center justify-center w-8 h-8 rounded-full bg-bg-dark-secondary hover:bg-bg-dark-secondary/70">
                <FaYoutube className="h-5 w-5 text-text-on-dark" />
              </a>
              <a href="#" aria-label="Pinterest" className="flex items-center justify-center w-8 h-8 rounded-full bg-bg-dark-secondary hover:bg-bg-dark-secondary/70">
                <FaPinterest className="h-5 w-5 text-text-on-dark" />
              </a>
            </div>
          </div>

          {/* Shop — MOBILE: slightly smaller header + tighter link rhythm
              (gadgeterea-style compact footer); md: restores desktop exactly. */}
          <div className="space-y-4">
            <h3 className="text-sm md:text-lg font-semibold text-text-on-dark">Shop</h3>
            <ul className="space-y-2 md:space-y-3 text-xs md:text-base text-text-on-dark/70">
              <li><Link href="/new-arrivals" className="hover:text-accent">New Arrivals</Link></li>
              <li><Link href="/deals" className="hover:text-accent">Deals</Link></li>
              <li><Link href="/shop" className="hover:text-accent">All Products</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h3 className="text-sm md:text-lg font-semibold text-text-on-dark">Support</h3>
            <ul className="space-y-2 md:space-y-3 text-xs md:text-base text-text-on-dark/70">
              <li><Link href="/blog" className="hover:text-accent">Blog</Link></li>
              <li><Link href="/about" className="hover:text-accent">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-accent">Contact</Link></li>
              <li><Link href="/faq" className="hover:text-accent">FAQ</Link></li>
            </ul>
          </div>

          {/* Account — all four are real routes now (/account, /login and
              /register are placeholder pages; /cart is the full demo cart) */}
          <div className="space-y-4">
            <h3 className="text-sm md:text-lg font-semibold text-text-on-dark">Account</h3>
            <ul className="space-y-2 md:space-y-3 text-xs md:text-base text-text-on-dark/70">
              <li><Link href="/account" className="hover:text-accent">My Account</Link></li>
              <li><Link href="/login" className="hover:text-accent">Login</Link></li>
              <li><Link href="/register" className="hover:text-accent">Register</Link></li>
              <li><Link href="/cart" className="hover:text-accent">Cart</Link></li>
            </ul>
          </div>
        </div>

        {/* MOBILE: slimmer divider spacing + smaller legal text; md:
            restores the desktop rhythm exactly. */}
        <div className="mt-8 pt-6 md:mt-10 md:pt-8 border-t border-text-on-dark/10 text-center text-text-on-dark/60 text-xs md:text-sm">
          {/* Legal links + copyright on one line; flex-wrap drops the row to a
              second centered line on narrow screens instead of overflowing. */}
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
            <Link href="/privacy-policy" className="hover:text-accent">Privacy Policy</Link>
            <span aria-hidden="true" className="text-text-on-dark/30">|</span>
            <Link href="/terms" className="hover:text-accent">Terms &amp; Conditions</Link>
            <span aria-hidden="true" className="text-text-on-dark/30">|</span>
            <span>© {currentYear} TechBD. All rights reserved.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
