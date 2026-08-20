import { Motif } from '@/components/decor/Motif';
import { TestimonialsCarousel, type Testimonial } from './TestimonialsCarousel';

/**
 * Placeholder copy — swap for real testimonials once Shruti sends them over.
 * Names/designations/testimony text below are all dummy data, not real clients.
 */
const TESTIMONIALS: Testimonial[] = [
  {
    name: 'Alex Morgan',
    designation: 'Marketing Director, Placeholder Co.',
    testimony:
      "Working with Shruti was seamless from brief to final draft. She caught things our whole team had missed and delivered ahead of schedule.",
  },
  {
    name: 'Jordan Lee',
    designation: 'Founder, Sample Studio',
    testimony:
      "Her editing turned a rough draft into something we were genuinely proud to publish. Sharp eye for structure and voice.",
  },
  {
    name: 'Priya Sharma',
    designation: 'Content Lead, Example Media',
    testimony:
      "Shruti has a rare ability to make dense, technical writing feel effortless to read. Our readers noticed the difference immediately.",
  },
  {
    name: 'Sam Whitfield',
    designation: 'Editor-in-Chief, Demo Publication',
    testimony:
      "Reliable, thoughtful, and fast — exactly what you want from a manuscript editor on a tight deadline.",
  },
  {
    name: 'Taylor Brooks',
    designation: 'Academic Researcher',
    testimony:
      "She understood the nuance of my argument better than I'd explained it myself. The final paper was so much stronger for it.",
  },
];

export function TestimonialsSection() {
  return (
    <section className="relative mx-auto max-w-6xl px-6 py-20">
      <Motif type="blob" tone="chartreuse" size={100} depth={2} opacity={0.18} className="top-4 -right-8 hidden lg:block" />
      <h2 className="font-serif text-3xl text-paper sm:text-4xl">Testimonials</h2>
      <div className="mt-8">
        <TestimonialsCarousel testimonials={TESTIMONIALS} />
      </div>
    </section>
  );
}
