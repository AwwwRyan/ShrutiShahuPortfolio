import type { Metadata } from 'next';
import { NotFoundMessage } from '@/components/NotFoundMessage';

export const metadata: Metadata = { title: 'Page not found — Shruti Shahu' };

export default function NotFound() {
  return <NotFoundMessage />;
}
