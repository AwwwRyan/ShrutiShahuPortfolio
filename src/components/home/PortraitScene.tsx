/**
 * Decorative "artsy" scene behind the Hero portrait — bold overlapping color-block shapes,
 * a dot-grid texture, sparkles, and rings, all in the site palette. Pure SVG/CSS so it stays
 * crisp and scales with the container instead of relying on a pre-baked background image.
 * Every shape is kept fully inside the viewBox (with margin) so nothing gets clipped —
 * the SVG's default overflow:hidden would otherwise flatten any edge a shape crosses.
 */
export function PortraitScene() {
  return (
    <svg
      viewBox="0 0 400 520"
      className="absolute -inset-8 -z-10 h-[calc(100%+4rem)] w-[calc(100%+4rem)] sm:-inset-12 sm:h-[calc(100%+6rem)] sm:w-[calc(100%+6rem)]"
      aria-hidden="true"
    >
      <defs>
        <pattern id="portrait-dots" width="20" height="20" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="2" fill="var(--color-chartreuse)" opacity="0.5" />
        </pattern>
      </defs>

      {/* bold overlapping color-block shapes — the main "poster" layer, fully contained */}
      <circle cx="115" cy="150" r="110" fill="var(--color-chartreuse)" opacity="0.75" />
      <circle cx="295" cy="385" r="100" fill="var(--color-olive-sage)" opacity="0.8" />
      <circle cx="325" cy="95" r="65" fill="var(--color-paper)" opacity="0.5" />

      {/* dot-grid texture, confined to a corner so it reads as a deliberate accent */}
      <rect x="25" y="335" width="140" height="140" fill="url(#portrait-dots)" />

      {/* rings */}
      <circle
        cx="200"
        cy="115"
        r="65"
        fill="none"
        stroke="var(--color-near-black-olive)"
        strokeWidth="2"
        opacity="0.6"
      />
      <circle
        cx="65"
        cy="450"
        r="28"
        fill="none"
        stroke="var(--color-paper)"
        strokeWidth="2"
        opacity="0.7"
      />

      {/* sparkles */}
      <path
        d="M45 220 L53 238 L71 246 L53 254 L45 272 L37 254 L19 246 L37 238 Z"
        fill="var(--color-paper)"
      />
      <path
        d="M350 245 L355 257 L367 262 L355 267 L350 279 L345 267 L333 262 L345 257 Z"
        fill="var(--color-near-black-olive)"
      />
      <path
        d="M345 460 L350 472 L362 477 L350 482 L345 494 L340 482 L328 477 L340 472 Z"
        fill="var(--color-chartreuse)"
      />
    </svg>
  );
}
