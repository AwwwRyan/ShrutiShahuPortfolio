'use client';

import { useEffect } from 'react';

/**
 * Replaces the OS cursor with a small dot + trailing ring, scoped to `.site-shell` only
 * (admin keeps the native cursor). Position is written to CSS vars on <html> exactly like
 * ParallaxController — no React re-renders on pointer move. The ring's own CSS `transition`
 * (not JS) creates the trailing/lag effect and the hover-state grow, so this component only
 * ever toggles two classes; all motion is CSS-driven.
 * Never activates on touch devices (no real pointer to track) or under prefers-reduced-motion
 * (a follow-and-grow cursor is inherently a motion effect) — the native cursor is the correct
 * fallback in both cases, not a same-position static replacement.
 */
export function CustomCursor() {
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
    if (prefersReducedMotion || isCoarsePointer) return;

    const shell = document.querySelector('.site-shell');
    if (!shell) return;

    const root = document.documentElement;
    shell.classList.add('cursor-custom');

    let ticking = false;
    let lastX = 0;
    let lastY = 0;
    const applyPosition = () => {
      root.style.setProperty('--cursor-x', `${lastX}px`);
      root.style.setProperty('--cursor-y', `${lastY}px`);
      ticking = false;
    };
    const onPointerMove = (event: PointerEvent) => {
      lastX = event.clientX;
      lastY = event.clientY;
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(applyPosition);
      }
    };

    const isInteractive = (target: EventTarget | null) =>
      target instanceof Element && target.closest('a, button, [role="button"]');

    const onPointerOver = (event: PointerEvent) => {
      if (isInteractive(event.target)) shell.classList.add('cursor-hover');
    };
    const onPointerOut = (event: PointerEvent) => {
      if (isInteractive(event.target)) shell.classList.remove('cursor-hover');
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    document.addEventListener('pointerover', onPointerOver);
    document.addEventListener('pointerout', onPointerOut);
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerover', onPointerOver);
      document.removeEventListener('pointerout', onPointerOut);
      shell.classList.remove('cursor-custom', 'cursor-hover');
      root.style.removeProperty('--cursor-x');
      root.style.removeProperty('--cursor-y');
    };
  }, []);

  return (
    <svg
      className="cursor-paw"
      viewBox="0 0 32 32"
      width="32"
      height="32"
      aria-hidden="true"
    >
      <g className="cursor-paw-toes">
        <ellipse cx="7" cy="13" rx="3.4" ry="4.2" transform="rotate(-25 7 13)" />
        <ellipse cx="13" cy="7" rx="3.2" ry="4" />
        <ellipse cx="19" cy="7" rx="3.2" ry="4" />
        <ellipse cx="25" cy="13" rx="3.4" ry="4.2" transform="rotate(25 25 13)" />
      </g>
      <ellipse className="cursor-paw-pad" cx="16" cy="21.5" rx="8.5" ry="6.5" />
      <g className="cursor-paw-claws">
        <path d="M4.5 8 L6.5 11.5 L2.5 11 Z" transform="rotate(-25 7 13)" />
        <path d="M11.5 2 L14.5 2 L13 6.5 Z" />
        <path d="M17.5 2 L20.5 2 L19 6.5 Z" />
        <path d="M27.5 8 L29.5 11 L25.5 11.5 Z" transform="rotate(25 25 13)" />
      </g>
    </svg>
  );
}
