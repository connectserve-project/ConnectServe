import { useEffect, useRef, useState } from 'react';

/**
 * Animates a number from 0 to `end` once the target ref scrolls into view.
 * Returns [ref, value] — attach ref to the element that should trigger the count.
 */
export const useCountUp = (end, duration = 1400) => {
  const [value, setValue] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;

    const prefersReduced =
      window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced) {
      setValue(end);
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !started.current) {
            started.current = true;
            const startTime = performance.now();
            const tick = (now) => {
              const progress = Math.min(1, (now - startTime) / duration);
              // ease-out cubic
              const eased = 1 - Math.pow(1 - progress, 3);
              setValue(Math.round(eased * end));
              if (progress < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [end, duration]);

  return [ref, value];
};
