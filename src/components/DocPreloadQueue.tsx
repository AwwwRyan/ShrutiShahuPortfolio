'use client';

import { useEffect } from 'react';

type NetworkInformation = { saveData?: boolean; effectiveType?: string };

/**
 * Background-fetches every doc URL into the browser's HTTP cache, smallest first, one
 * at a time — so opening a "Download Resume" link or a project's PDF later is instant
 * instead of starting its download from scratch. Runs as a real queue (not a burst of
 * parallel `<link rel="prefetch">` tags like MediaPreloader uses for images) because
 * these files can be tens of MB: fetching them one at a time, smallest-first, means the
 * most likely-to-finish documents land in cache quickly and no single visit ever has
 * more than one large download competing with the rest of the page's own traffic.
 * Skips entirely on a metered/slow connection (Save-Data header or 2G-class link) —
 * this is a nice-to-have, never worth spending someone's mobile data plan on.
 */
export function DocPreloadQueue({ urls }: { urls: string[] }) {
  useEffect(() => {
    if (urls.length === 0) return;

    const connection = (navigator as Navigator & { connection?: NetworkInformation }).connection;
    if (connection?.saveData || /^(slow-2g|2g)$/.test(connection?.effectiveType ?? '')) {
      return;
    }

    let cancelled = false;

    async function run() {
      const sized = await Promise.all(
        urls.map(async (url) => {
          try {
            const res = await fetch(url, { method: 'HEAD' });
            const size = Number(res.headers.get('content-length'));
            return { url, size: Number.isFinite(size) ? size : Infinity };
          } catch {
            return { url, size: Infinity };
          }
        }),
      );
      sized.sort((a, b) => a.size - b.size);

      for (const { url } of sized) {
        if (cancelled) return;
        await fetch(url, { cache: 'force-cache' }).catch(() => {});
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [urls]);

  return null;
}
