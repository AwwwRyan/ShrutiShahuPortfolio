import Link from 'next/link';
import type { CSSProperties, ReactNode } from 'react';

type CardTone = 'paper' | 'teal' | 'olive-sage' | 'chartreuse' | 'navy-teal';

// teal/olive-sage/navy-teal are dark tones in this palette (light text on top);
// chartreuse is the one bright fill (dark text on top) — the deliberate "pop" tile.
const TONE_CLASSES: Record<CardTone, string> = {
  paper: 'bg-paper/[0.06] border border-paper/10 text-paper backdrop-blur-sm',
  teal: 'bg-teal text-paper',
  'olive-sage': 'bg-olive-sage text-paper',
  chartreuse: 'bg-chartreuse text-near-black-olive',
  'navy-teal': 'bg-navy-teal text-paper',
};

/** Cycles category tiles through the accent tones so the four tiles read as a set, not identical boxes. */
export const CATEGORY_TILE_TONES: CardTone[] = ['teal', 'olive-sage', 'chartreuse', 'navy-teal'];

type CardProps = {
  children: ReactNode;
  href?: string;
  /** Opens `href` in a new tab (target="_blank" rel="noopener noreferrer") instead of navigating via next/link. */
  external?: boolean;
  tone?: CardTone;
  /** Optional cover image — rendered behind the content with a green-tinted overlay for legibility. */
  imageUrl?: string | null;
  /** CSS object-position for the cover image (e.g. 'center bottom', 'center 30%'). Defaults to center. */
  imagePosition?: string;
  /** Where content sits within the card. Defaults to 'end' (bottom-anchored). */
  contentPosition?: 'start' | 'end';
  className?: string;
  style?: CSSProperties;
};

/** Shared card primitive — used for the homepage category tiles, Services cards, and category-page project cards. */
export function Card({
  children,
  href,
  external = false,
  tone = 'paper',
  imageUrl,
  imagePosition = 'center',
  contentPosition = 'end',
  className = '',
  style,
}: CardProps) {
  const justify = contentPosition === 'start' ? 'justify-start' : 'justify-end';
  const classes = `group relative flex min-h-[10rem] flex-col ${justify} overflow-hidden rounded-2xl p-6 transition-transform duration-200 motion-reduce:transition-none ${TONE_CLASSES[tone]} ${className}`;

  const content = (
    <>
      {imageUrl && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt=""
            style={{ objectPosition: imagePosition }}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
          {/* Full-coverage green tint (duotone-ish, matches the palette) plus a fade toward wherever
              the content sits, so text always lands on the most-darkened part of the image.
              Full class names kept literal (not interpolated) — Tailwind can't see dynamically
              built class strings at build time. */}
          <div className="absolute inset-0 bg-near-black-olive/55 mix-blend-multiply" />
          <div
            className={
              contentPosition === 'start'
                ? 'absolute inset-0 bg-gradient-to-b from-near-black-olive/80 via-near-black-olive/15 to-olive-sage/25'
                : 'absolute inset-0 bg-gradient-to-t from-near-black-olive/80 via-near-black-olive/15 to-olive-sage/25'
            }
          />
        </>
      )}
      <div className={imageUrl ? 'relative text-paper' : 'relative'}>{children}</div>
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        style={style}
        target={external ? '_blank' : undefined}
        rel={external ? 'noopener noreferrer' : undefined}
        className={`${classes} hover:-translate-y-1 focus-visible:-translate-y-1`}
      >
        {content}
      </Link>
    );
  }

  return (
    <div style={style} className={classes}>
      {content}
    </div>
  );
}
