import Link from 'next/link';
import type { ReactNode } from 'react';

const BASE =
  'inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 font-sans text-sm font-semibold tracking-wide transition-colors duration-200 motion-reduce:transition-none';

const TONES = {
  dark: 'bg-near-black-olive text-paper hover:bg-navy-teal',
  teal: 'bg-teal text-near-black-olive hover:bg-olive-sage hover:text-paper',
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
