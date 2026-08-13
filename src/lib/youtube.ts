/**
 * Converts a YouTube watch/shorts/youtu.be URL into an embeddable
 * `youtube.com/embed/<id>` URL for use in an <iframe>. Returns null for
 * anything that isn't a recognizable YouTube URL.
 */
export function getYouTubeEmbedUrl(url: string): string | null {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }

  const host = parsed.hostname.replace(/^www\.|^m\./, '');

  if (host === 'youtu.be') {
    const id = parsed.pathname.slice(1);
    return id ? `https://www.youtube.com/embed/${id}` : null;
  }

  if (host !== 'youtube.com') {
    return null;
  }

  if (parsed.pathname === '/watch') {
    const id = parsed.searchParams.get('v');
    return id ? `https://www.youtube.com/embed/${id}` : null;
  }

  const shortsMatch = parsed.pathname.match(/^\/shorts\/([^/]+)/);
  if (shortsMatch) {
    return `https://www.youtube.com/embed/${shortsMatch[1]}`;
  }

  if (/^\/embed\//.test(parsed.pathname)) {
    return url;
  }

  return null;
}
