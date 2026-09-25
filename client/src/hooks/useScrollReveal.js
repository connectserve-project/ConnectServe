import { useEffect, useRef } from 'react';

/**
 * Attaches an IntersectionObserver to the returned ref and adds
 * `reveal-visible` (see index.css `.reveal`) once the element scrolls
 * into view. Used for tasteful, one-time scroll-reveal entrance animation.
 */
export const useScrollReveal = (options = {}) => {
  const ref = useRef(null);
  // Keep the latest options in a ref instead of the effect's dependency
  // array. `options` is a fresh {} literal on every render, so depending
  // on it directly caused the observer to be torn down and recreated on
  // every re-render of the page (e.g. whenever Home's data fetches or
  // context providers updated state) — sometimes destroying it before it
  // ever got a chance to detect the element was on screen, leaving
  // sections stuck at `opacity: 0` until renders finally settled.
  const optionsRef = useRef(options);
  optionsRef.current = options;

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;

    // Respect users who prefer reduced motion
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      node.classList.add('reveal-visible');
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px', ...optionsRef.current }
    );

    observer.observe(node);
    return () => observer.disconnect();
    // Run once on mount only — see note above about why `options` must
    // not be a dependency here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return ref;
};