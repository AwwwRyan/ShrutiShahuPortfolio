import type { ReactNode } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';

/**
 * Dark theme is scoped to this shell (public site only) via the `site-shell` class,
 * not the global `body` — admin stays on its original light/unstyled look, untouched.
 */
export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <div className="site-shell flex min-h-full flex-1 flex-col bg-near-black-olive text-paper">
      <Header />
      <div className="flex-1">{children}</div>
      <Footer />
    </div>
  );
}
