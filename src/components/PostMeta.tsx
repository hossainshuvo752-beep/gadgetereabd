import React from 'react';

type PostMetaProps = {
  /** Author display name — the circle shows its first initial. */
  author?: string;
  date: string;
  readTime: string;
  /** Size override for context (cards default compact; detail page passes text-sm). */
  className?: string;
  /** 'light' (default) for light cards; 'dark' flips the text/avatar tokens
   *  for dark backgrounds (e.g. the homepage hero banner). */
  tone?: 'light' | 'dark';
};

/**
 * Two-line post meta, gadgeterea-style:
 *   line 1: avatar-initial circle + author name + bullet
 *   line 2: date • read time
 *
 * Replaces the old single-line "By … • … • …" row, which wrapped to three
 * awkward lines inside 2-column mobile cards. Two short lines stay clean at
 * any card width; sizes are token-based (site color rule) and tweakable via
 * `className` per surface.
 */
export default function PostMeta({
  author = 'TechBD Team',
  date,
  readTime,
  className = 'text-[11px] md:text-xs',
  tone = 'light',
}: PostMetaProps) {
  const dark = tone === 'dark';
  return (
    <div className={`space-y-1 ${className}`}>
      <div className="flex items-center gap-1.5">
        <span
          aria-hidden="true"
          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold leading-none ${
            dark ? 'bg-accent/20 text-accent-amber' : 'bg-accent/10 text-accent-hover'
          }`}
        >
          {author.charAt(0).toUpperCase()}
        </span>
        <span className={`font-medium ${dark ? 'text-text-on-dark' : 'text-text-heading'}`}>
          {author}
        </span>
        <span className={dark ? 'text-text-on-dark-muted/60' : 'text-text-body/60'} aria-hidden="true">
          •
        </span>
      </div>
      <div className={`flex items-center gap-1.5 ${dark ? 'text-text-on-dark-muted' : 'text-text-body'}`}>
        <span>{date}</span>
        <span className={dark ? 'text-text-on-dark-muted/60' : 'text-text-body/60'} aria-hidden="true">
          •
        </span>
        <span>{readTime}</span>
      </div>
    </div>
  );
}
