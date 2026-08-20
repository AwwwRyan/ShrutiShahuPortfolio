/**
 * Renders a `<link rel="prefetch">` per URL — Next.js hoists any <link> rendered
 * anywhere in the tree up into <head>. Prefetch is the lowest-priority fetch type
 * (never competes with the current page's own requests) and just warms the
 * browser's HTTP cache, so this is pure upside: nothing renders or blocks on it,
 * it only makes a later navigation to a page using one of these images instant
 * instead of showing a visible pop-in while it downloads for the first time.
 */
export function MediaPreloader({ urls }: { urls: string[] }) {
  return (
    <>
      {urls.map((url) => (
        <link key={url} rel="prefetch" as="image" href={url} />
      ))}
    </>
  );
}
