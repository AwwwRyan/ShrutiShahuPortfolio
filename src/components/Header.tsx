import Link from 'next/link';
import { Pill } from './Pill';

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-ink/10 bg-paper/90 backdrop-blur supports-[backdrop-filter]:bg-paper/70">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
        <Link href="/" className="font-serif text-xl font-semibold tracking-tight text-ink">
          Shruti Shahu
        </Link>
        <Pill href="/contact" tone="dark" className="px-4 py-2 text-xs sm:px-6 sm:py-3 sm:text-sm">
          Want to know more? Let&apos;s talk
        </Pill>
      </div>
    </header>
  );
}
