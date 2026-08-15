'use client';

import { useEffect } from 'react';

/**
 * Replaces the OS cursor with Shruti's cat (public/cursor/normal.png at rest, hover.png
 * over links/buttons), scoped to `.site-shell` only (admin keeps the native cursor).
 * Position is written to CSS vars on <html> exactly like ParallaxController — no React
 * re-renders on pointer move. The two images are both always mounted and crossfade via CSS
 * `opacity` transitions driven by a single `cursor-hover` class, so this component only ever
 * toggles two classes; all motion is CSS-driven, no JS animation loop.
 * Never activates on touch devices (no real pointer to track) or under prefers-reduced-motion
 * (a following cursor is inherently a motion effect) — the native cursor is the correct
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
    <>
      {/* eslint-disable-next-line @next/next/no-img-element -- fixed-size decorative cursor, not content */}
      <img src="/cursor/normal.png" alt="" className="cursor-cat cursor-cat-normal" aria-hidden="true" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/cursor/hover.png" alt="" className="cursor-cat cursor-cat-hover" aria-hidden="true" />
    </>
  );
}
