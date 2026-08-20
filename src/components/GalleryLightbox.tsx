'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

type GalleryLightboxProps = {
  images: string[];
  title: string;
};

/** Same modal conventions as DocumentLink (dialog role, Escape to close, body-scroll lock) — clicking a gallery thumbnail opens it full-size with left/right navigation instead of just sitting there as a plain grid of images. */
export function GalleryLightbox({ images, title }: GalleryLightboxProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const close = () => setOpenIndex(null);
  const showPrev = () => setOpenIndex((i) => (i === null ? null : (i - 1 + images.length) % images.length));
  const showNext = () => setOpenIndex((i) => (i === null ? null : (i + 1) % images.length));

  useEffect(() => {
    if (openIndex === null) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
      if (event.key === 'ArrowLeft') showPrev();
      if (event.key === 'ArrowRight') showNext();
    };
    document.addEventListener('keydown', onKeyDown);
    closeButtonRef.current?.focus();

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [openIndex]);

  return (
    <>
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {images.map((url, index) => (
          <button
            key={url}
            type="button"
            onClick={() => setOpenIndex(index)}
            className="group aspect-square overflow-hidden rounded-xl motion-reduce:transition-none"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt={`${title} — gallery image ${index + 1}`}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
            />
          </button>
        ))}
      </div>

      {openIndex !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${title} — gallery image ${openIndex + 1} of ${images.length}`}
          className="fixed inset-0 z-50 flex items-center justify-center bg-near-black-olive/90 p-4 backdrop-blur-sm sm:p-8"
          onClick={close}
        >
          <div className="absolute top-4 right-4 flex items-center gap-4 sm:top-6 sm:right-6">
            <span className="text-sm font-medium text-paper/70">
              {openIndex + 1} / {images.length}
            </span>
            <button
              ref={closeButtonRef}
              type="button"
              onClick={close}
              aria-label="Close"
              className="text-paper hover:text-chartreuse"
            >
              <X className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>

          {images.length > 1 && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                showPrev();
              }}
              aria-label="Previous image"
              className="absolute left-2 text-paper hover:text-chartreuse sm:left-6"
            >
              <ChevronLeft className="h-10 w-10" aria-hidden="true" />
            </button>
          )}

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={images[openIndex]}
            alt={`${title} — gallery image ${openIndex + 1}`}
            className="max-h-[85vh] max-w-full rounded-lg object-contain shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          />

          {images.length > 1 && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                showNext();
              }}
              aria-label="Next image"
              className="absolute right-2 text-paper hover:text-chartreuse sm:right-6"
            >
              <ChevronRight className="h-10 w-10" aria-hidden="true" />
            </button>
          )}
        </div>
      )}
    </>
  );
}
