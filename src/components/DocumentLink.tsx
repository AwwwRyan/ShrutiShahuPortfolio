'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { X } from 'lucide-react';

type DocumentLinkProps = {
  href: string;
  title: string;
  children: ReactNode;
  className?: string;
};

/**
 * Opens PDF links in an in-app preview modal (browsers render PDFs natively inside an
 * iframe, so this just supplies the surrounding chrome) instead of downloading/navigating
 * away. Non-PDF files (e.g. .docx, which browsers can't render inline) fall back to a
 * plain new-tab link — Vercel Blob serves those with Content-Disposition: attachment,
 * so a modal iframe would just show a broken/blank frame for them.
 */
export function DocumentLink({ href, title, children, className = '' }: DocumentLinkProps) {
  const [open, setOpen] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    closeButtonRef.current?.focus();

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!href.toLowerCase().endsWith('.pdf')) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {children}
      </a>
    );
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className}>
        {children}
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={title}
          className="fixed inset-0 z-50 flex items-center justify-center bg-near-black-olive/90 p-4 backdrop-blur-sm sm:p-8"
          onClick={() => setOpen(false)}
        >
          <div
            className="flex h-full w-full max-w-4xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-4 bg-near-black-olive px-4 py-3">
              <span className="truncate text-sm font-medium text-paper">{title}</span>
              <div className="flex shrink-0 items-center gap-4">
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-medium text-paper/70 underline underline-offset-2 hover:text-chartreuse"
                >
                  Open in new tab
                </a>
                <button
                  ref={closeButtonRef}
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close"
                  className="text-paper hover:text-chartreuse"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
            </div>
            <iframe src={href} title={title} className="flex-1 bg-white" />
          </div>
        </div>
      )}
    </>
  );
}
