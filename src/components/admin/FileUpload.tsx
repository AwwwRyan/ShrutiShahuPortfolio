'use client';

import { useEffect, useRef, useState } from 'react';
import { uploadSingleFile } from '@/lib/uploadActions';
import { adminFileInputClasses } from '@/lib/adminStyles';

/** Blocks the surrounding form's submit while any upload from this field is still in flight. */
function useSubmitGuard(busy: boolean) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const form = rootRef.current?.closest('form');
    if (!form) return;

    const guard = (e: SubmitEvent) => {
      if (busy) {
        e.preventDefault();
        window.alert('Please wait for the upload to finish before saving.');
      }
    };

    form.addEventListener('submit', guard);
    return () => form.removeEventListener('submit', guard);
  }, [busy]);

  return rootRef;
}

/** Single-file upload — cover image, external doc. Uploads immediately on selection. */
export function SingleFileUpload({
  id,
  name,
  accept,
  folder,
}: {
  id?: string;
  name: string;
  accept: string;
  folder: string;
}) {
  const [status, setStatus] = useState<'idle' | 'uploading' | 'done' | 'error'>('idle');
  const [url, setUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const rootRef = useSubmitGuard(status === 'uploading');

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setStatus('uploading');
    setError(null);

    const formData = new FormData();
    formData.set('file', file);
    formData.set('folder', folder);
    const result = await uploadSingleFile(formData);

    if ('error' in result) {
      setStatus('error');
      setError(result.error);
      return;
    }
    setUrl(result.url);
    setStatus('done');
  }

  return (
    <div ref={rootRef}>
      <input type="hidden" name={name} value={url} />
      <input id={id} type="file" accept={accept} onChange={handleChange} className={adminFileInputClasses} />
      {status === 'uploading' && <p className="mt-1.5 text-xs text-paper/60">Uploading…</p>}
      {status === 'done' && <p className="mt-1.5 text-xs text-chartreuse">Uploaded.</p>}
      {status === 'error' && <p className="mt-1.5 text-xs text-rust">{error}</p>}
    </div>
  );
}

type QueueItem = { id: string; name: string; status: 'uploading' | 'done' | 'error'; url?: string; error?: string };

/** Multi-file upload — gallery images. Uploads one file at a time, not in parallel, so a
 * slow/large file doesn't hold up the others and bandwidth stays predictable — same
 * sequential-queue approach as DocPreloadQueue elsewhere in this app. */
export function MultiFileUpload({ name, accept, folder }: { name: string; accept: string; folder: string }) {
  const [items, setItems] = useState<QueueItem[]>([]);
  const busy = items.some((i) => i.status === 'uploading');
  const rootRef = useSubmitGuard(busy);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    const queued = files.map((file) => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      name: file.name,
      status: 'uploading' as const,
    }));
    setItems((prev) => [...prev, ...queued]);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const id = queued[i].id;

      const formData = new FormData();
      formData.set('file', file);
      formData.set('folder', folder);
      const result = await uploadSingleFile(formData);

      setItems((prev) =>
        prev.map((item) =>
          item.id === id
            ? 'error' in result
              ? { ...item, status: 'error', error: result.error }
              : { ...item, status: 'done', url: result.url }
            : item,
        ),
      );
    }
  }

  return (
    <div ref={rootRef}>
      {items
        .filter((i) => i.status === 'done' && i.url)
        .map((i) => (
          <input key={i.id} type="hidden" name={name} value={i.url} />
        ))}
      <input type="file" accept={accept} multiple onChange={handleChange} className={adminFileInputClasses} />
      {items.length > 0 && (
        <ul className="mt-2 space-y-1 text-xs">
          {items.map((i) => (
            <li
              key={i.id}
              className={
                i.status === 'error' ? 'text-rust' : i.status === 'uploading' ? 'text-paper/60' : 'text-chartreuse'
              }
            >
              {i.name} — {i.status === 'uploading' ? 'Uploading…' : i.status === 'error' ? i.error : 'Uploaded'}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
