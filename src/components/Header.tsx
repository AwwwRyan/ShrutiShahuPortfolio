import Link from 'next/link';
import { Pill } from './Pill';

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-paper/10 bg-near-black-olive/90 backdrop-blur supports-[backdrop-filter]:bg-near-black-olive/70">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
        <Link href="/" className="flex items-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Shruti Shahu" className="h-9 w-9 shrink-0" />
          <span className="hidden font-serif text-xl font-semibold tracking-tight text-paper sm:inline">
            Shruti Shahu
          </span>
        </Link>
        <Pill href="/contact" tone="dark" className="px-4 py-2 text-xs sm:px-6 sm:py-3 sm:text-sm">
          Want to know more? Let&apos;s talk
        </Pill>
      </div>
    </header>
  );
}
