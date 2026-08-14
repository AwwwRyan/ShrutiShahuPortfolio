'use client';

import { useEffect } from 'react';

/**
 * Single global pointer-tracking mount. Writes normalized cursor position (-1 to 1 on each
 * axis) to CSS custom properties on the root element rather than React state, so every
 * <Motif> can react purely via CSS transform without triggering re-renders on every mouse
 * move. Never attaches the listener at all on touch devices or under prefers-reduced-motion —
 * Motifs then simply read the CSS var's fallback (0) and never move.
 */
export function ParallaxController() {
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
    if (prefersReducedMotion || isCoarsePointer) return;

    const root = document.documentElement;
    let ticking = false;
    let lastX = 0;
    let lastY = 0;

    const applyPosition = () => {
      root.style.setProperty('--parallax-x', lastX.toFixed(4));
      root.style.setProperty('--parallax-y', lastY.toFixed(4));
      ticking = false;
    };

    const onPointerMove = (event: PointerEvent) => {
      lastX = (event.clientX / window.innerWidth) * 2 - 1;
      lastY = (event.clientY / window.innerHeight) * 2 - 1;
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(applyPosition);
      }
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      root.style.removeProperty('--parallax-x');
      root.style.removeProperty('--parallax-y');
    };
  }, []);

  return null;
}
