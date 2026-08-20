'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard', match: (path: string) => path === '/admin' },
  {
    href: '/admin/categories',
    label: 'Categories',
    match: (path: string) => path.startsWith('/admin/categories') || path.startsWith('/admin/projects'),
  },
  {
    href: '/admin/site-content',
    label: 'Site Content',
    match: (path: string) => path.startsWith('/admin/site-content'),
  },
] as const;

/** Only client component in the admin shell — usePathname() purely for active-link styling. */
export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap items-center gap-1">
      {NAV_ITEMS.map((item) => {
        const active = item.match(pathname);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? 'page' : undefined}
            className={`rounded-full px-3 py-2 text-sm font-medium transition-colors ${
              active ? 'text-chartreuse' : 'text-paper/70 hover:bg-paper/10 hover:text-paper'
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
