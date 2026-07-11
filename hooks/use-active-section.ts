"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Tracks which section id is currently most visible in the viewport using
 * IntersectionObserver. Returns the id of the section that is intersecting,
 * falling back to the nearest one above the fold as the user scrolls down.
 */
export function useActiveSection(sectionIds: string[]): string {
  const [activeId, setActiveId] = useState<string>("");
  const visible = useRef<Set<string>>(new Set());

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            visible.current.add(entry.target.id);
          } else {
            visible.current.delete(entry.target.id);
          }
        }
        // Pick the first visible id in document order.
        const first = sectionIds.find((id) => visible.current.has(id));
        if (first) setActiveId(first);
      },
      { rootMargin: "-10% 0px -80% 0px" },
    );

    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    for (const el of elements) {
      observer.observe(el);
    }

    return () => observer.disconnect();
  }, [sectionIds]);

  return activeId;
}
