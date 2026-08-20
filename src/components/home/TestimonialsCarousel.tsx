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
 * alongside it with no conflict. Content is rendered twice back-to-back; a `scroll` listener
 * (covering BOTH the auto-scroll and any manual drag/swipe/wheel scroll, not just the raf
 * loop) jumps scrollLeft back by exactly half of scrollWidth the moment it passes the
 * halfway point — invisible since the second copy is pixel-identical to the first, giving a
 * seamless infinite loop no matter what's driving the scroll.
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
    const el = containerRef.current;
    if (!el) return;

    const onScroll = () => {
      const halfWidth = el.scrollWidth / 2;
      if (el.scrollLeft >= halfWidth) {
        el.scrollLeft -= halfWidth;
      }
      // Re-sync so the raf loop below (if running) continues from the corrected value
      // instead of overwriting it with its own stale, pre-correction position next frame.
      positionRef.current = el.scrollLeft;
    };
    el.addEventListener('scroll', onScroll, { passive: true });

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf: number | undefined;
    if (!prefersReducedMotion) {
      positionRef.current = el.scrollLeft;
      const step = () => {
        if (!pausedRef.current) {
          positionRef.current += SCROLL_SPEED_PX_PER_FRAME;
          el.scrollLeft = positionRef.current;
        }
        raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    }

    return () => {
      el.removeEventListener('scroll', onScroll);
      if (raf !== undefined) cancelAnimationFrame(raf);
    };
  }, []);

  const pause = () => {
    pausedRef.current = true;
  };
  // No need to resync positionRef here — the scroll listener above already keeps it in
  // sync in real time with any manual scroll that happened while paused.
  const resume = () => {
    pausedRef.current = false;
  };

  return (
    <div
      ref={containerRef}
      className="no-scrollbar flex gap-6 overflow-x-auto pb-4 [-webkit-overflow-scrolling:touch]"
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
