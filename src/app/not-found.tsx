import type { Metadata } from 'next';
import { SiteShell } from '@/components/SiteShell';
import { NotFoundMessage } from '@/components/NotFoundMessage';

export const metadata: Metadata = { title: 'Page not found — Shruti Shahu' };

export default function NotFound() {
  return (
    <SiteShell>
      <NotFoundMessage />
    </SiteShell>
  );
}
