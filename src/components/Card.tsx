import Link from 'next/link';
import type { CSSProperties, ReactNode } from 'react';

type CardTone = 'paper' | 'teal' | 'olive-sage' | 'chartreuse' | 'navy-teal';

const TONE_CLASSES: Record<CardTone, string> = {
  paper: 'bg-white border border-ink/10 text-ink',
  teal: 'bg-teal text-near-black-olive',
  'olive-sage': 'bg-olive-sage text-paper',
  chartreuse: 'bg-chartreuse text-near-black-olive',
  'navy-teal': 'bg-navy-teal text-paper',
};

/** Cycles category tiles through the accent tones so the four tiles read as a set, not identical boxes. */
export const CATEGORY_TILE_TONES: CardTone[] = ['teal', 'olive-sage', 'chartreuse', 'navy-teal'];

type CardProps = {
  children: ReactNode;
  href?: string;
  tone?: CardTone;
  /** Optional cover image — rendered behind the content with a dark gradient for legibility. */
  imageUrl?: string | null;
  className?: string;
  style?: CSSProperties;
};

/** Shared card primitive — used for the homepage category tiles, Services cards, and category-page project cards. */
export function Card({
  children,
  href,
  tone = 'paper',
  imageUrl,
  className = '',
  style,
}: CardProps) {
  const classes = `group relative flex min-h-[10rem] flex-col justify-end overflow-hidden rounded-2xl p-6 transition-transform duration-200 motion-reduce:transition-none ${TONE_CLASSES[tone]} ${className}`;

  const content = (
    <>
      {imageUrl && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-near-black-olive/80 via-near-black-olive/10 to-transparent" />
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
