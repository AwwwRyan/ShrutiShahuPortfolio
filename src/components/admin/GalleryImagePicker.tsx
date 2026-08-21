'use client';

import { useEffect, useRef, useState } from 'react';
import { adminButtonSecondary } from '@/lib/adminStyles';

/**
 * Thumbnail picker for removing existing gallery images — replaces a flat list of raw
 * Blob URLs with actual previews, a Select all/Clear toggle, and a confirm() gate on the
 * surrounding form's submit so a removal isn't silently applied on the next save. Still
 * drives the same `removeGallery` checkboxes the server action already reads — this is a
 * client-side presentation upgrade only, no server/action changes needed.
 */
export function GalleryImagePicker({ images }: { images: string[] }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const form = rootRef.current?.closest('form');
    if (!form) return;

    const handleSubmit = (e: SubmitEvent) => {
      if (selected.size === 0) return;
      const ok = window.confirm(
        `Remove ${selected.size} image${selected.size === 1 ? '' : 's'} from the gallery? This takes effect once you save.`,
      );
      if (!ok) e.preventDefault();
    };

    form.addEventListener('submit', handleSubmit);
    return () => form.removeEventListener('submit', handleSubmit);
  }, [selected]);

  const toggle = (url: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(url)) {
        next.delete(url);
      } else {
        next.add(url);
      }
      return next;
    });
  };

  return (
    <div ref={rootRef}>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs text-paper/60">
          {selected.size > 0
            ? `${selected.size} of ${images.length} selected for removal`
            : `${images.length} image${images.length === 1 ? '' : 's'}`}
        </span>
        <div className="flex gap-2">
          <button type="button" onClick={() => setSelected(new Set(images))} className={adminButtonSecondary}>
            Select all
          </button>
          <button
            type="button"
            onClick={() => setSelected(new Set())}
            disabled={selected.size === 0}
            className={`${adminButtonSecondary} disabled:cursor-not-allowed disabled:opacity-40`}
          >
            Clear
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {images.map((url) => {
          const isSelected = selected.has(url);
          return (
            <label
              key={url}
              className={`group relative block cursor-pointer overflow-hidden rounded-lg border transition-colors ${
                isSelected ? 'border-rust' : 'border-paper/15 hover:border-paper/30'
              }`}
            >
              <input
                type="checkbox"
                name="removeGallery"
                value={url}
                checked={isSelected}
                onChange={() => toggle(url)}
                className="sr-only"
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt=""
                className={`aspect-square w-full object-cover transition-opacity ${
                  isSelected ? 'opacity-40' : 'opacity-100 group-hover:opacity-80'
                }`}
              />
              <span
                className={`absolute inset-0 flex items-center justify-center bg-rust/80 text-xs font-semibold text-near-black-olive transition-opacity ${
                  isSelected ? 'opacity-100' : 'opacity-0'
                }`}
              >
                Remove
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
