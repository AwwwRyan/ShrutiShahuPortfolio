import { Pill } from './Pill';

export function NotFoundMessage() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-6 py-20 text-center">
      <p className="font-serif text-6xl text-navy-teal sm:text-7xl">404</p>
      <h1 className="mt-4 font-serif text-2xl text-ink sm:text-3xl">This page doesn&apos;t exist</h1>
      <p className="mt-3 text-ink/70">
        The page you&apos;re looking for may have been moved or removed.
      </p>
      <Pill href="/" tone="teal" className="mt-8">
        Back to homepage
      </Pill>
    </main>
  );
}
