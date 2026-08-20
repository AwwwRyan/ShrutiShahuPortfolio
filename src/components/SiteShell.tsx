import type { ReactNode } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { DecorativeLine } from './decor/DecorativeLine';
import { ParallaxController } from './decor/ParallaxController';
import { CustomCursor } from './decor/CustomCursor';

/**
 * Dark theme is scoped to this shell via the `site-shell` class, not the global `body`.
 * Admin has its own sibling shell (`.admin-shell`, see `src/app/admin/layout.tsx`) with
 * the same palette but none of this component's decorative motion (cursor/line/parallax)
 * — kept as a separate class so this component stays purely public-site-only.
 *
 * `relative isolate` gives the decorative line a clean positioning/stacking context to
 * anchor to; `overflow-x-clip` guards against the weave path or a parallax-shifted motif
 * ever introducing a horizontal scrollbar at extreme viewport widths.
 */
export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <div className="site-shell relative isolate flex min-h-full flex-1 flex-col overflow-x-clip bg-near-black-olive text-paper">
      <ParallaxController />
      <DecorativeLine />
      <CustomCursor />
      <Header />
      <div className="flex-1">{children}</div>
      <Footer />
    </div>
  );
}
