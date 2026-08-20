import Link from 'next/link';
import type { ReactNode } from 'react';

const BASE =
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full px-4 py-3 font-sans text-xs font-semibold tracking-wide transition-colors duration-200 motion-reduce:transition-none sm:px-6 sm:text-sm';

const TONES = {
  // "dark" now means "the bold, high-contrast pill" — inverted to a light fill so it
  // pops off the dark page background instead of blending into it.
  dark: 'bg-paper text-near-black-olive hover:bg-chartreuse',
  // teal/olive-sage are dark tones in this palette, so the "teal" pill tone uses the
  // other light color (chartreuse) instead — text stays dark across the hover shift.
  teal: 'bg-chartreuse text-near-black-olive hover:bg-paper',
} as const;

type PillProps = {
  href: string;
  children: ReactNode;
  tone?: keyof typeof TONES;
  className?: string;
};

/** Shared pill-shaped button. Hash hrefs render as same-page scroll anchors; everything else is an internal Link. */
export function Pill({ href, children, tone = 'dark', className = '' }: PillProps) {
  const classes = `${BASE} ${TONES[tone]} ${className}`;

  if (href.startsWith('#')) {
    return (
      <a href={href} className={classes}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={classes}>
      {children}
    </Link>
  );
}
