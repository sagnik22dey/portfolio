import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/** Fade/slide-in children matching a selector as they scroll into view. */
export function useReveal<T extends HTMLElement>(selector = '[data-reveal]', stagger = 0.08) {
  const scope = useRef<T>(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.set(selector, { opacity: 1, y: 0 });
      return;
    }
    const ctx = gsap.context(() => {
      const targets = gsap.utils.toArray<HTMLElement>(selector);
      gsap.set(targets, { opacity: 0, yPercent: 12, force3D: true, willChange: 'transform, opacity' });

      ScrollTrigger.batch(targets, {
        start: 'top 88%',
        once: true,
        onEnter: (batch) =>
          gsap.to(batch, {
            opacity: 1,
            yPercent: 0,
            duration: 0.7,
            ease: 'power2.out',
            stagger,
            force3D: true,
            overwrite: true,
            onComplete: () => gsap.set(batch, { willChange: 'auto' }),
          }),
      });
    }, scope);

    return () => ctx.revert();
  }, [selector, stagger]);

  return scope;
}
