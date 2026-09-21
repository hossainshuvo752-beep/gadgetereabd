import React from 'react';

type PostMetaProps = {
  /** Author display name — the circle shows its first initial. */
  author?: string;
  date: string;
  readTime: string;
  /** Size override for context (cards default compact; detail page passes text-sm). */
  className?: string;
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
}: PostMetaProps) {
  return (
    <div className={`space-y-1 ${className}`}>
      <div className="flex items-center gap-1.5">
        <span
          aria-hidden="true"
          className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent-hover text-[10px] font-bold leading-none"
        >
          {author.charAt(0).toUpperCase()}
        </span>
        <span className="font-medium text-text-heading">{author}</span>
        <span className="text-text-body/60" aria-hidden="true">
          •
        </span>
      </div>
      <div className="flex items-center gap-1.5 text-text-body">
        <span>{date}</span>
        <span className="text-text-body/60" aria-hidden="true">
          •
        </span>
        <span>{readTime}</span>
      </div>
    </div>
  );
}
