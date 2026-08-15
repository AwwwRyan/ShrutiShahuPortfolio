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
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    // This component lives in the shared layout, so it never unmounts between
    // client-side navigations — only re-measures when something below tells it to.
    // Its own <svg height={height}> is itself part of document.body's height, so a
    // naive measure-and-set can pin it at the tallest page ever visited: navigating
    // from a tall page to a short one doesn't shrink body (the SVG's stale height is
    // still holding it up), so the ResizeObserver below never sees a change to react
    // to. Zeroing the SVG's height right before reading scrollHeight (then restoring
    // it) excludes its own footprint from the measurement, breaking that feedback loop.
    let scheduled = false;
    const measure = () => {
      const svg = svgRef.current;
      const previousHeight = svg?.getAttribute('height');
      svg?.setAttribute('height', '0');
      const h = document.documentElement.scrollHeight;
      if (svg && previousHeight != null) svg.setAttribute('height', previousHeight);
      setHeight(h);
      setPathData(generateWeavePath(h));
    };
    const scheduleMeasure = () => {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(() => {
        scheduled = false;
        measure();
      });
    };
    measure();

    // Also catches content swapped in by client-side route changes (e.g. a
    // server-action redirect to a shorter/taller page) — ResizeObserver alone only
    // fires on a genuine box-size change, which the feedback loop above can suppress.
    const resizeObserver = new ResizeObserver(scheduleMeasure);
    resizeObserver.observe(document.body);
    const mutationObserver = new MutationObserver(scheduleMeasure);
    mutationObserver.observe(document.body, { childList: true, subtree: true });
    window.addEventListener('resize', scheduleMeasure);
    return () => {
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      window.removeEventListener('resize', scheduleMeasure);
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
      ref={svgRef}
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
