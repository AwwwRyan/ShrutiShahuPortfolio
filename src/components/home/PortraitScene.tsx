/**
 * Decorative "artsy" scene behind the Hero portrait — bold overlapping color-block shapes,
 * a dot-grid texture, sparkles, and rings, all in the site palette. Pure SVG/CSS so it stays
 * crisp and scales with the container instead of relying on a pre-baked background image.
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

      {/* bold overlapping color-block shapes — the main "poster" layer */}
      <ellipse cx="120" cy="130" rx="190" ry="170" fill="var(--color-chartreuse)" opacity="0.75" />
      <ellipse cx="300" cy="420" rx="170" ry="200" fill="var(--color-olive-sage)" opacity="0.8" />
      <circle cx="330" cy="80" r="80" fill="var(--color-paper)" opacity="0.5" />

      {/* dot-grid texture, confined to a corner so it reads as a deliberate accent */}
      <rect x="20" y="330" width="150" height="150" fill="url(#portrait-dots)" />

      {/* rings */}
      <circle
        cx="200"
        cy="110"
        r="72"
        fill="none"
        stroke="var(--color-near-black-olive)"
        strokeWidth="2"
        opacity="0.6"
      />
      <circle
        cx="60"
        cy="460"
        r="30"
        fill="none"
        stroke="var(--color-paper)"
        strokeWidth="2"
        opacity="0.7"
      />

      {/* sparkles */}
      <path
        d="M40 220 L48 238 L66 246 L48 254 L40 272 L32 254 L14 246 L32 238 Z"
        fill="var(--color-paper)"
      />
      <path
        d="M360 250 L365 262 L377 267 L365 272 L360 284 L355 272 L343 267 L355 262 Z"
        fill="var(--color-near-black-olive)"
      />
      <path
        d="M355 470 L360 482 L372 487 L360 492 L355 504 L350 492 L338 487 L350 482 Z"
        fill="var(--color-chartreuse)"
      />
    </svg>
  );
}
