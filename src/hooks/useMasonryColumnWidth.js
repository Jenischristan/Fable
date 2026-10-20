import { useCallback, useEffect, useRef, useState } from "react";

const getColumnsForWidth = (width, fallback = 2) => {
  if (!width || width <= 0) return Math.min(5, Math.max(2, fallback));
  if (width < 768) return 2;
  if (width <= 1024) return 3;
  if (width <= 1400) return 4;
  return 5;
};

const getInitialState = (gutter = 16, fallback = 2) => {
  const initialWidth =
    typeof window !== "undefined" ? window.innerWidth : 360;
  const columns = getColumnsForWidth(initialWidth, fallback);
  const targetWidth = Math.max(
    60,
    Math.floor((initialWidth - (columns - 1) * gutter) / columns),
  );
  return { columnWidth: targetWidth, columnCount: columns };
};

export function useMasonryColumnWidth(
  ref,
  { gutter = 16, fallback = 2 } = {},
) {
  const [state, setState] = useState(() => getInitialState(gutter, fallback));
  const frameRef = useRef(null);

  const measure = useCallback(() => {
    const el = ref?.current;
    const width = el?.clientWidth || (typeof window !== "undefined" ? window.innerWidth : 360);
    if (!width || width <= 0) return;

    // Strict 2 to 5 columns everywhere:
    // mobile / narrow (< 768px): 2 columns
    // tablet (768 - 1024px): 3 columns
    // desktop (1024 - 1400px): 4 columns
    // wide (> 1400px): 5 columns
    const columns = Math.min(5, Math.max(2, getColumnsForWidth(width, fallback)));
    const targetWidth = Math.max(
      60,
      Math.floor((width - (columns - 1) * gutter) / columns),
    );

    setState((prev) => {
      if (prev.columnWidth === targetWidth && prev.columnCount === columns) {
        return prev;
      }
      return { columnWidth: targetWidth, columnCount: columns };
    });
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

  const output = {
    columnWidth: state.columnWidth,
    columnCount: state.columnCount,
    valueOf() {
      return state.columnWidth;
    },
    [Symbol.toPrimitive](hint) {
      return hint === "string" ? String(state.columnWidth) : state.columnWidth;
    },
  };

  return output;
}

