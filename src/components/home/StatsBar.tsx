import { Motif } from '@/components/decor/Motif';

const STATS = [
  { value: '4+', label: 'Years experience' },
  { value: '80k+', label: 'Impressions & reads' },
  { value: '15+', label: 'Writers trained' },
  { value: '20+', label: 'Clients' },
] as const;

export function StatsBar() {
  return (
    <section className="relative border-y border-paper/10 bg-paper/[0.04]">
      <Motif type="ring" tone="paper" size={56} depth={1} opacity={0.25} className="top-4 right-8 hidden sm:block" />
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-6 py-12 sm:grid-cols-4 sm:gap-4">
        {STATS.map((stat) => (
          <div key={stat.label} className="text-center">
            <p className="font-serif text-3xl text-chartreuse sm:text-4xl">{stat.value}</p>
            <p className="mt-1 text-sm text-paper/70">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
