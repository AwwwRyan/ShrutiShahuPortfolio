import { ArrowUpRight, BookOpenCheck, GraduationCap, Newspaper, PenTool, Search, SpellCheck } from 'lucide-react';
import { Card } from '@/components/Card';
import { Motif } from '@/components/decor/Motif';

// Only chartreuse/paper are light enough to read as an icon badge fill+stroke against
// the dark card surface in this palette — alternate between the two for variety.
const ICON_TONES = ['chartreuse', 'paper'] as const;

// `span` grows the grid pattern in from mobile (always single column, no spans) up through
// sm (simple 2-col pairing) to lg (the full asymmetric bento) — complexity scales up with
// available width rather than trying to force the bento shape into a narrow viewport.
const SERVICES = [
  {
    name: 'Content Editing & Proofreading',
    Icon: SpellCheck,
    span: 'sm:col-span-2 lg:col-span-2 lg:row-span-2',
  },
  { name: 'Manuscript Editing', Icon: BookOpenCheck, span: '' },
  { name: 'Academic Editing', Icon: GraduationCap, span: 'lg:row-span-2' },
  { name: 'Writing', Icon: PenTool, span: 'sm:col-span-2 lg:col-span-1' },
  { name: 'Digital News Reportage', Icon: Newspaper, span: 'sm:col-span-2 lg:col-span-2' },
  { name: 'Research', Icon: Search, span: 'sm:col-span-2 lg:col-span-2' },
] as const;

const ICON_BG: Record<(typeof ICON_TONES)[number], string> = {
  chartreuse: 'bg-chartreuse/15 text-chartreuse',
  paper: 'bg-paper/15 text-paper',
};

export function ServicesSection() {
  return (
    <section className="relative mx-auto max-w-6xl px-6 py-20">
      <Motif type="blob" tone="olive-sage" size={90} depth={2} opacity={0.2} className="top-2 -left-4 hidden lg:block" />
      <h2 className="font-serif text-3xl text-paper sm:text-4xl">Services</h2>

      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:grid-flow-dense lg:auto-rows-[10rem]">
        {SERVICES.map(({ name, Icon, span }, index) => {
          const tone = ICON_TONES[index % ICON_TONES.length];
          return (
            <Card
              key={name}
              href="/contact"
              tone="paper"
              className={`min-h-[12rem] lg:min-h-0 ${span}`}
            >
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
