'use client';

import React, { useState } from 'react';
import { FaFacebookF, FaLinkedinIn, FaXTwitter, FaLink } from 'react-icons/fa6';

/**
 * Share row for blog post detail pages — Facebook, X, LinkedIn, and
 * Copy Link. All share targets are composed CLIENT-SIDE from the post's
 * canonical URL (passed in as a prop from the server component).
 *
 * Window.open (rather than target=_blank hrefs) keeps the share popups
 * small and consistent; the copy button falls back to execCommand for
 * older browsers and always shows inline feedback ("Copied!").
 */
const ShareButtons: React.FC<{ url: string; title: string }> = ({ url, title }) => {
  const [copied, setCopied] = useState(false);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const openShare = (shareUrl: string) => {
    window.open(shareUrl, '_blank', 'noopener,noreferrer,width=600,height=540');
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      // Clipboard API can be blocked (permissions / non-secure contexts) —
      // fall back to the legacy textarea approach.
      const ta = document.createElement('textarea');
      ta.value = url;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand('copy');
        setCopied(true);
      } finally {
        document.body.removeChild(ta);
      }
    }
    setTimeout(() => setCopied(false), 2000);
  };

  const btn =
    'flex h-9 w-9 items-center justify-center rounded-full border border-text-heading/15 text-text-heading transition-colors hover:border-accent hover:text-accent';

  return (
    <div className="mt-10 border-y border-text-heading/10 py-4">
      <span className="mb-3 block text-xs font-semibold uppercase tracking-wider text-text-body">
        Share this post
      </span>
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          aria-label="Share on Facebook"
          className={btn}
          onClick={() => openShare(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`)}
        >
          <FaFacebookF className="h-4 w-4" />
        </button>
        <button
          type="button"
          aria-label="Share on X"
          className={btn}
          onClick={() =>
            openShare(`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`)
          }
        >
          <FaXTwitter className="h-4 w-4" />
        </button>
        <button
          type="button"
          aria-label="Share on LinkedIn"
          className={btn}
          onClick={() =>
            openShare(`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`)
          }
        >
          <FaLinkedinIn className="h-4 w-4" />
        </button>
        <button
          type="button"
          aria-label="Copy link"
          className={`${btn} ${copied ? 'border-accent text-accent' : ''}`}
          onClick={copyLink}
        >
          {copied ? (
            <span className="text-[10px] font-semibold leading-none">COPIED</span>
          ) : (
            <FaLink className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  );
};

export default ShareButtons;
