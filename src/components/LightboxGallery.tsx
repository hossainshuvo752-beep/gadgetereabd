'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';

type LightboxGalleryProps = {
  images: string[];
  /** Alt-text base (product name) — suffixed per view for accessibility. */
  alt: string;
  initialIndex: number;
  onClose: () => void;
};

/**
 * Amazon-style image lightbox for product galleries (Shop + Quick Look
 * detail pages). Overlay with a large main view (click image to zoom),
 * arrow navigation, keyboard support (←/→/Esc), a single-row thumbnail
 * strip, and an X close button. Styled with the site's color tokens.
 */
export default function LightboxGallery({
  images,
  alt,
  initialIndex,
  onClose,
}: LightboxGalleryProps) {
  const [index, setIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(false);

  const total = images.length;
  const prev = useCallback(
    () => setIndex((i) => (i + total - 1) % total),
    [total]
  );
  const next = useCallback(() => setIndex((i) => (i + 1) % total), [total]);

  // Keyboard navigation + scroll lock while the lightbox is open.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose, prev, next]);

  return (
    <div
      className="fixed inset-0 z-[100] bg-bg-dark/90 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`${alt} image gallery`}
      onClick={onClose}
    >
      <div
        className="relative bg-text-on-dark border border-text-heading/10 rounded-lg shadow-xl w-full max-w-5xl flex flex-col p-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header: counter + close */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-text-body">
            {index + 1} / {total}
            <span className="ml-3 hidden sm:inline text-xs">
              Click the image to zoom
            </span>
          </span>
          <button
            onClick={onClose}
            aria-label="Close gallery"
            className="w-9 h-9 rounded-full bg-text-on-dark border border-text-heading/10 shadow flex items-center justify-center text-text-body hover:text-accent text-lg leading-none"
          >
            ×
          </button>
        </div>

        {/* Main view — square container, object-contain (zoom scales it up) */}
        <div className="relative w-full aspect-square max-h-[65vh] bg-bg-dark-secondary/10 rounded-md overflow-hidden">
          <Image
            src={images[index]!}
            alt={`${alt} — image ${index + 1} of ${total}`}
            fill
            sizes="(max-width: 1024px) 100vw, 800px"
            className={`object-contain p-2 transition-transform duration-200 ${
              zoom ? 'scale-150 cursor-zoom-out' : 'cursor-zoom-in'
            }`}
            onClick={() => setZoom((z) => !z)}
          />
          {/* arrows */}
          {total > 1 && (
            <>
              <button
                onClick={prev}
                aria-label="Previous image"
                className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-text-on-dark border border-text-heading/10 shadow flex items-center justify-center text-text-body hover:text-accent"
              >
                ‹
              </button>
              <button
                onClick={next}
                aria-label="Next image"
                className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-text-on-dark border border-text-heading/10 shadow flex items-center justify-center text-text-body hover:text-accent"
              >
                ›
              </button>
            </>
          )}
        </div>

        {/* Single-row thumbnail strip */}
        {total > 1 && (
          <div className="flex gap-2 overflow-x-auto mt-3 justify-start sm:justify-center">
            {images.map((img, i) => (
              <button
                key={img}
                onClick={() => {
                  setIndex(i);
                  setZoom(false);
                }}
                aria-label={`View image ${i + 1}`}
                aria-current={i === index}
                className={`relative w-16 h-16 shrink-0 rounded-md overflow-hidden border-2 transition-colors ${
                  i === index
                    ? 'border-accent'
                    : 'border-text-heading/10 hover:border-accent/50'
                }`}
              >
                <Image
                  src={img}
                  alt=""
                  fill
                  sizes="64px"
                  className="object-contain p-0.5"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
