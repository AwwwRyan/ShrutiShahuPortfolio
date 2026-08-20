'use client';

import { useEffect, useRef } from 'react';
import { Quote } from 'lucide-react';

export type Testimonial = {
  name: string;
  designation: string;
  testimony: string;
};

const SCROLL_SPEED_PX_PER_FRAME = 0.4;

/**
 * Continuous slow auto-scroll driven by nudging real `scrollLeft` on a raf loop — not a CSS
 * transform — so native manual scrolling (touch drag, trackpad, scrollbar) just works
 * alongside it with no conflict. Content is rendered twice back-to-back; once scrollLeft
 * passes the halfway point (end of the first copy) it's decremented by exactly that half-width,
 * which is invisible since the second copy is pixel-identical to the first — a standard
 * seamless-loop marquee technique.
 * Pauses on hover (mouse) and while touched (tap), resuming on mouseleave/touchend — matching
 * the plain-language ask ("stops on hover/on tap"). Skips the auto-scroll entirely under
 * prefers-reduced-motion, but the strip stays manually scrollable either way.
 */
export function TestimonialsCarousel({ testimonials }: { testimonials: Testimonial[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);
  // Tracked separately from el.scrollLeft (not read back from it) because scrollLeft's
  // setter rounds to the nearest integer — accumulating a sub-1px-per-frame increment
  // directly on it gets silently truncated to 0 every frame and never actually moves.
  const positionRef = useRef(0);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const el = containerRef.current;
    if (!el) return;

    positionRef.current = el.scrollLeft;
    let raf: number;
    const step = () => {
      if (!pausedRef.current) {
        const halfWidth = el.scrollWidth / 2;
        positionRef.current += SCROLL_SPEED_PX_PER_FRAME;
        if (positionRef.current >= halfWidth) {
          positionRef.current -= halfWidth;
        }
        el.scrollLeft = positionRef.current;
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, []);

  const pause = () => {
    pausedRef.current = true;
  };
  // Resyncs from the real scrollLeft so a manual scroll while paused (hover + wheel, or a
  // touch drag) doesn't cause a visible jump back to the stale pre-interaction position.
  const resume = () => {
    if (containerRef.current) {
      positionRef.current = containerRef.current.scrollLeft;
    }
    pausedRef.current = false;
  };

  return (
    <div
      ref={containerRef}
      className="flex gap-6 overflow-x-auto pb-4 [scrollbar-width:thin] [-webkit-overflow-scrolling:touch]"
      onMouseEnter={pause}
      onMouseLeave={resume}
      onTouchStart={pause}
      onTouchEnd={resume}
    >
      {[...testimonials, ...testimonials].map((testimonial, index) => (
        <figure
          key={index}
          className="w-[20rem] shrink-0 rounded-2xl border border-paper/10 bg-paper/[0.06] p-6 backdrop-blur-sm sm:w-[24rem]"
        >
          <Quote className="h-6 w-6 text-chartreuse" strokeWidth={1.5} aria-hidden="true" />
          <blockquote className="mt-4 text-base leading-relaxed text-paper/85">
            {testimonial.testimony}
          </blockquote>
          <figcaption className="mt-5">
            <div className="font-serif text-lg text-paper">{testimonial.name}</div>
            <div className="text-sm text-paper/60">{testimonial.designation}</div>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
