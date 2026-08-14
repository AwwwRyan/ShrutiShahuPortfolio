'use client';

import { useEffect, useRef, useState } from 'react';
import { generateWeavePath } from '@/lib/generateWeavePath';

/**
 * A single hand-drawn-feeling bezier thread running the full height of the page, behind
 * content. Draws itself in via stroke-dashoffset tied to scroll progress. Re-measures on
 * resize/content changes so it stays correct as sections reflow (e.g. grid columns collapsing
 * on mobile change the page's total height).
 */
export function DecorativeLine() {
  const [pathData, setPathData] = useState('');
  const [height, setHeight] = useState(0);
  const pathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    const measure = () => {
      const h = document.documentElement.scrollHeight;
      setHeight(h);
      setPathData(generateWeavePath(h));
    };
    measure();

    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(document.body);
    window.addEventListener('resize', measure);
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, []);

  useEffect(() => {
    const path = pathRef.current;
    if (!path || !pathData) return;

    const length = path.getTotalLength();
    path.style.strokeDasharray = `${length}`;

    let ticking = false;
    const applyProgress = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 1;
      path.style.strokeDashoffset = `${length * (1 - progress)}`;
      ticking = false;
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(applyProgress);
      }
    };

    applyProgress();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', applyProgress);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', applyProgress);
    };
  }, [pathData]);

  if (!pathData) return null;

  return (
    <svg
      className="pointer-events-none absolute inset-x-0 top-0"
      width="100%"
      height={height}
      viewBox={`0 0 1000 ${height}`}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="decorative-line-gradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--color-olive-sage)" />
          <stop offset="50%" stopColor="var(--color-chartreuse)" />
          <stop offset="100%" stopColor="var(--color-paper)" />
        </linearGradient>
      </defs>
      <path
        ref={pathRef}
        d={pathData}
        fill="none"
        stroke="url(#decorative-line-gradient)"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.38"
      />
    </svg>
  );
}
