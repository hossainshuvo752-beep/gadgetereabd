"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { AnchorHTMLAttributes, ReactNode } from "react";

/**
 * NavLink — shared navigation link for the Header and the mobile bottom bar.
 *
 * Cross-route clicks behave exactly like next/link (SPA navigation). But a
 * click on the link for the page you are ALREADY on forces a full browser
 * reload: Next.js <Link> is a silent no-op for the current route, which
 * feels broken ("I clicked Shop on /shop and nothing happened"). A full
 * reload also lands the page at the exact top (scrollY = 0), which covers
 * the logo/Home-on-home reload rule too.
 */
type NavLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  href: string;
  children: ReactNode;
};

const NavLink = ({ href, children, onClick, ...rest }: NavLinkProps) => {
  const pathname = usePathname();
  // Exact match on purpose: a section link (e.g. "Shop" → /shop) clicked
  // from a child page (/shop/foo) should still navigate to the section root.
  const isCurrentPage = pathname === href;

  if (isCurrentPage) {
    return (
      <a
        href={href}
        {...rest}
        onClick={(event) => {
          // Run the caller's handler first (drawer close, tracking, …) —
          // it may preventDefault to take over entirely.
          onClick?.(event);
          if (!event.defaultPrevented) {
            // Same-route click: <Link> would no-op here, so bypass the
            // router with a full page load (also resets scroll to the very
            // top, including under the sticky header).
            event.preventDefault();
            window.location.assign(href);
          }
        }}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} {...rest} onClick={onClick}>
      {children}
    </Link>
  );
};

export default NavLink;
