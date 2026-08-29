import { useEffect } from "react";

export function useClickOutside(ref, handler, ignoreRef) {
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        !ref.current ||
        ref.current.contains(event.target) ||
        (ignoreRef?.current && ignoreRef.current.contains(event.target))
      ) {
        return;
      }

      handler(event);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [ref, handler, ignoreRef]);
}