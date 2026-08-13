import type { Metadata } from 'next';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { NotFoundMessage } from '@/components/NotFoundMessage';

export const metadata: Metadata = { title: 'Page not found — Shruti Shahu' };

export default function NotFound() {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <Header />
      <div className="flex-1">
        <NotFoundMessage />
      </div>
      <Footer />
    </div>
  );
}
