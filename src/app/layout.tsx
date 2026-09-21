import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileBottomNav from "@/components/MobileBottomNav";
import { CartProvider } from "@/context/CartContext";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "TechBD — Bangladesh's Trusted Guide to Gadgets, Reviews & Buying Guides",
    template: "%s | TechBD",
  },
  description:
    "Honest gadget reviews, buying guides, and tech news for Bangladesh. No sponsorships, no bias — just real reviews you can trust.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        {/* Cart store wraps the whole app (Header badge, cards, /cart, checkout) */}
        <CartProvider>
          <Header />
          {/* Mobile-only bottom clearance so the fixed bottom nav bar
              (hidden at md+) never covers page content — desktop keeps
              its exact current spacing. */}
          <main className="flex-1 pb-16 md:pb-0">{children}</main>
          <Footer />
          {/* Fixed bottom nav bar — mobile only (md:hidden inside) */}
          <MobileBottomNav />
        </CartProvider>
      </body>
    </html>
  );
}
