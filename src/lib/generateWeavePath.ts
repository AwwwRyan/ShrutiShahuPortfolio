/**
 * Generates a smooth, organic SVG path (cubic beziers through alternating waypoints) that
 * weaves down a page of the given height. Pure/deterministic so it's easy to reason about —
 * no Math.random(), just a fixed oscillating x-pattern that avoids looking like a mechanical
 * sine wave. `width` is a viewBox unit (paired with `preserveAspectRatio="none"` by the
 * caller) so x-positions are effectively percentages of whatever width the SVG is rendered at.
 */
const X_PATTERN = [0.5, 0.16, 0.82, 0.32, 0.7, 0.1, 0.88, 0.44, 0.6, 0.2, 0.78, 0.38];
const SEGMENT_HEIGHT = 420;

export function generateWeavePath(height: number, width = 1000): string {
  if (height < 40) return '';

  const segments = Math.max(3, Math.round(height / SEGMENT_HEIGHT));
  const points = Array.from({ length: segments + 1 }, (_, i) => ({
    x: X_PATTERN[i % X_PATTERN.length] * width,
    y: (height / segments) * i,
  }));

  let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];
    const dy = (p1.y - p0.y) / 2;
    d += ` C ${p0.x.toFixed(1)} ${(p0.y + dy).toFixed(1)}, ${p1.x.toFixed(1)} ${(p1.y - dy).toFixed(1)}, ${p1.x.toFixed(1)} ${p1.y.toFixed(1)}`;
  }
  return d;
}
