import { Motif } from '@/components/decor/Motif';
import { TestimonialsCarousel, type Testimonial } from './TestimonialsCarousel';

const TESTIMONIALS: Testimonial[] = [
  {
    name: 'Sonia Sharma',
    designation: 'Senior Editor',
    testimony:
      "If you're looking for a growth-driven professional who's amazing at her role and doesn't need constant pushing and pulling, you're looking for Shruti. When we were on the same team, I had the privilege to learn a lot from her working style.",
  },
  {
    name: 'Manu Sharma',
    designation: 'Scriptwriter & Senior QA Specialist',
    testimony:
      "To hiring managers, I've worked with her closely, and she's an absolute star. Super reliable, great leader, and brings so much clarity to content. Truly a gem!",
  },
  {
    name: 'Christine Wanjira Muriithi',
    designation: 'Trainee Writer',
    testimony:
      "As someone who's had the privilege of working under her guidance, mentorship, and friendship, I genuinely and highly recommend Shruti. She brings a wealth of knowledge, a zesty personality, a knack for everything 'content', and great managerial skills!",
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
