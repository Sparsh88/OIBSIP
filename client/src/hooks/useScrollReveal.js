import { useState, useEffect, useRef } from 'react';

/**
 * Custom hook to detect when an element scrolls into the viewport.
 * 
 * @param {Object} options
 * @param {number} options.threshold - Viewport intersection ratio (default: 0.15)
 * @param {string} options.rootMargin - Margin around the root bounding box (default: '0px 0px -40px 0px')
 * @param {boolean} options.once - If true, unobserves after triggering once (default: true)
 * @returns {[React.RefObject, boolean]} [ref, isVisible]
 */
export function useScrollReveal(options = {}) {
  const {
    threshold = 0.15,
    rootMargin = '0px 0px -40px 0px',
    once = true,
  } = options;

  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Fallback if IntersectionObserver is not supported
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      setIsVisible(true);
      return;
    }

    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) {
            observer.unobserve(element);
          }
        } else if (!once) {
          setIsVisible(false);
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(element);

    return () => {
      if (element) {
        observer.unobserve(element);
      }
      observer.disconnect();
    };
  }, [threshold, rootMargin, once]);

  return [ref, isVisible];
}
