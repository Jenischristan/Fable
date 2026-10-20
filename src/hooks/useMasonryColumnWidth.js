import { useCallback, useEffect, useRef, useState } from "react";

const BREAKPOINTS = [
  { maxWidth: 380, columns: 2 },
  { maxWidth: 560, columns: 2 },
  { maxWidth: 768, columns: 3 },
  { maxWidth: 1100, columns: 4 },
  { maxWidth: Infinity, columns: 5 },
];

export function useMasonryColumnWidth(ref, { gutter = 16, fallback = 2 } = {}) {
  const [columnWidth, setColumnWidth] = useState(180);
  const frameRef = useRef(null);

  const measure = useCallback(() => {
    const el = ref?.current;
    if (!el) return;
    const width = el.clientWidth;
    if (!width) return;
    const breakpoint = BREAKPOINTS.find((bp) => width <= bp.maxWidth);
    const columns = breakpoint ? breakpoint.columns : fallback;
    const next = Math.max(120, Math.floor((width - (columns - 1) * gutter) / columns));
    setColumnWidth(next);
  }, [ref, gutter, fallback]);

  useEffect(() => {
    measure();
    const el = ref?.current;
    if (!el || typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", measure);
      return () => window.removeEventListener("resize", measure);
    }
    const observer = new ResizeObserver(() => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      frameRef.current = requestAnimationFrame(measure);
    });
    observer.observe(el);
    return () => {
      observer.disconnect();
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [measure, ref]);

  return columnWidth;
}
