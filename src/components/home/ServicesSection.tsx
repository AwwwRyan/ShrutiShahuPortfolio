import { Card } from '@/components/Card';

const SERVICES = [
  'Content Editing & Proofreading',
  'Manuscript Editing',
  'Academic Editing',
  'Writing',
  'Digital News Reportage',
  'Research',
] as const;

export function ServicesSection() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <h2 className="font-serif text-3xl text-ink sm:text-4xl">Services</h2>

      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {SERVICES.map((service) => (
          <Card key={service} tone="paper" className="justify-center">
            <span className="font-serif text-xl text-ink">{service}</span>
          </Card>
        ))}
      </div>
    </section>
  );
}
