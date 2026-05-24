import { useEffect, useRef } from 'react';

interface UseScrollRevealOptions {
    /** Threshold for triggering (0 to 1) */
    threshold?: number;
    /** Root margin for earlier/later triggering */
    rootMargin?: string;
    /** Only trigger once per element */
    once?: boolean;
}

/**
 * Custom hook for scroll-reveal animations.
 * Attaches IntersectionObserver to the ref element.
 * When visible, adds `bka-visible` class to trigger CSS animation.
 */
export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(
    options: UseScrollRevealOptions = {},
) {
    const { threshold = 0.15, rootMargin = '0px 0px -40px 0px', once = true } = options;
    const ref = useRef<T>(null);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('bka-visible');
                        if (once) {
                            observer.unobserve(entry.target);
                        }
                    } else if (!once) {
                        entry.target.classList.remove('bka-visible');
                    }
                });
            },
            { threshold, rootMargin },
        );

        observer.observe(element);

        return () => {
            observer.disconnect();
        };
    }, [threshold, rootMargin, once]);

    return ref;
}

/**
 * Hook variant that observes all children of a container.
 * Useful for staggered animations on a list of items.
 */
export function useScrollRevealChildren<T extends HTMLElement = HTMLDivElement>(
    selector: string = '.bka-reveal, .bka-reveal-left, .bka-reveal-right, .bka-reveal-scale',
    options: UseScrollRevealOptions = {},
) {
    const { threshold = 0.1, rootMargin = '0px 0px -40px 0px', once = true } = options;
    const containerRef = useRef<T>(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const children = container.querySelectorAll(selector);
        if (children.length === 0) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('bka-visible');
                        if (once) {
                            observer.unobserve(entry.target);
                        }
                    } else if (!once) {
                        entry.target.classList.remove('bka-visible');
                    }
                });
            },
            { threshold, rootMargin },
        );

        children.forEach((child) => observer.observe(child));

        return () => {
            observer.disconnect();
        };
    }, [selector, threshold, rootMargin, once]);

    return containerRef;
}
