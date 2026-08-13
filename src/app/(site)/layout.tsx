import type { ReactNode } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <Header />
      <div className="flex-1">{children}</div>
      <Footer />
    </div>
  );
}
