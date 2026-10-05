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
  /** Force ONE horizontal line: avatar + author + date + read time, never
   *  wrapping. Used by the article header (detail page); cards keep the
   *  two-line layout that suits narrow columns. Ellipsis-fallbacks keep the
   *  row intact if a surface ever renders it narrower than the content. */
  singleLine?: boolean;
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
 */export default function PostMeta({
  author = 'Jupiter BD Team',
  date,
  readTime,
  className = 'text-[11px] md:text-xs',
  tone = 'light',
  singleLine = false,
}: PostMetaProps) {
  const dark = tone === 'dark';

  if (singleLine) {
    // ONE line, never wrapping: nowrap flex with truncating text spans.
    // whitespace-nowrap on the container would hide overflow without
    // visual feedback, so each text piece can ellipsize if space runs out —
    // but at the detail page's real widths (375px+) the full content fits.
    return (
      <div
        className={`flex flex-nowrap items-center ${className}`}
        style={{ minWidth: 0 }}
      >
        <span
          aria-hidden="true"
          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold leading-none ${
            dark ? 'bg-accent/20 text-accent-amber' : 'bg-accent/10 text-accent-hover'
          }`}
        >
          {author.charAt(0).toUpperCase()}
        </span>
        <span
          className={`ml-1.5 shrink-0 font-medium whitespace-nowrap ${
            dark ? 'text-text-on-dark' : 'text-text-heading'
          }`}
        >
          {author}
        </span>
        <span
          className={`mx-1.5 shrink-0 ${dark ? 'text-text-on-dark-muted/60' : 'text-text-body/60'}`}
          aria-hidden="true"
        >
          •
        </span>
        <span className={`whitespace-nowrap ${dark ? 'text-text-on-dark-muted' : 'text-text-body'}`}>
          {date}
        </span>
        <span
          className={`mx-1.5 shrink-0 ${dark ? 'text-text-on-dark-muted/60' : 'text-text-body/60'}`}
          aria-hidden="true"
        >
          •
        </span>
        <span className={`whitespace-nowrap ${dark ? 'text-text-on-dark-muted' : 'text-text-body'}`}>
          {readTime}
        </span>
      </div>
    );
  }

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
