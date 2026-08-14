import { ArrowUpRight, BookOpenCheck, GraduationCap, Newspaper, PenTool, Search, SpellCheck } from 'lucide-react';
import { Card } from '@/components/Card';

// Only chartreuse/paper are light enough to read as an icon badge fill+stroke against
// the dark card surface in this palette — alternate between the two for variety.
const ICON_TONES = ['chartreuse', 'paper'] as const;

const SERVICES = [
  { name: 'Content Editing & Proofreading', Icon: SpellCheck },
  { name: 'Manuscript Editing', Icon: BookOpenCheck },
  { name: 'Academic Editing', Icon: GraduationCap },
  { name: 'Writing', Icon: PenTool },
  { name: 'Digital News Reportage', Icon: Newspaper },
  { name: 'Research', Icon: Search },
] as const;

const ICON_BG: Record<(typeof ICON_TONES)[number], string> = {
  chartreuse: 'bg-chartreuse/15 text-chartreuse',
  paper: 'bg-paper/15 text-paper',
};

export function ServicesSection() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <h2 className="font-serif text-3xl text-paper sm:text-4xl">Services</h2>

      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {SERVICES.map(({ name, Icon }, index) => {
          const tone = ICON_TONES[index % ICON_TONES.length];
          return (
            <Card key={name} href="/contact" tone="paper" className="min-h-[12rem]">
              <div className="flex w-full items-start justify-between">
                <span
                  className={`blob-mask flex h-14 w-14 shrink-0 items-center justify-center ${ICON_BG[tone]}`}
                >
                  <Icon className="h-6 w-6" strokeWidth={1.5} aria-hidden="true" />
                </span>
                <ArrowUpRight
                  className="h-5 w-5 text-paper/30 transition-colors group-hover:text-paper/70"
                  aria-hidden="true"
                />
              </div>
              <span className="mt-6 font-serif text-xl text-paper">{name}</span>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
