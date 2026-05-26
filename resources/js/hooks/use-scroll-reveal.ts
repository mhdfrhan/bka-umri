import { useCallback, useRef } from 'react';

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
 * Uses a Callback Ref pattern to seamlessly support conditionally/asynchronously
 * rendered elements (e.g. elements rendered after loading states).
 */
export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(
    options: UseScrollRevealOptions = {},
) {
    const {
        threshold = 0.15,
        rootMargin = '0px 0px -40px 0px',
        once = true,
    } = options;
    const observerRef = useRef<IntersectionObserver | null>(null);

    const setRef = useCallback(
        (element: T | null) => {
            // Disconnect previous observer
            if (observerRef.current) {
                observerRef.current.disconnect();
                observerRef.current = null;
            }

            if (!element) {
                return;
            }

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
            observerRef.current = observer;
        },
        [threshold, rootMargin, once],
    );

    return setRef;
}

/**
 * Hook variant that observes all children of a container.
 * Combines Callback Ref and MutationObserver to automatically discover and observe
 * dynamic or asynchronously loaded children (such as items loaded from an API/local storage).
 */
export function useScrollRevealChildren<T extends HTMLElement = HTMLDivElement>(
    selector: string = '.bka-reveal, .bka-reveal-left, .bka-reveal-right, .bka-reveal-scale',
    options: UseScrollRevealOptions = {},
) {
    const {
        threshold = 0.1,
        rootMargin = '0px 0px -40px 0px',
        once = true,
    } = options;
    const observerRef = useRef<IntersectionObserver | null>(null);
    const mutationObserverRef = useRef<MutationObserver | null>(null);

    const setRef = useCallback(
        (container: T | null) => {
            // Cleanup previous observers
            if (observerRef.current) {
                observerRef.current.disconnect();
                observerRef.current = null;
            }

            if (mutationObserverRef.current) {
                mutationObserverRef.current.disconnect();
                mutationObserverRef.current = null;
            }

            if (!container) {
                return;
            }

            const observedElements = new Set<Element>();

            const observer = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                            entry.target.classList.add('bka-visible');

                            if (once) {
                                observer.unobserve(entry.target);
                                observedElements.delete(entry.target);
                            }
                        } else if (!once) {
                            entry.target.classList.remove('bka-visible');
                        }
                    });
                },
                { threshold, rootMargin },
            );

            const updateObservations = () => {
                const children = container.querySelectorAll(selector);
                children.forEach((child) => {
                    if (!observedElements.has(child)) {
                        observer.observe(child);
                        observedElements.add(child);
                    }
                });
            };

            // Initial run
            updateObservations();

            // Setup MutationObserver to watch for dynamic children additions
            const mutationObserver = new MutationObserver(() => {
                updateObservations();
            });

            mutationObserver.observe(container, {
                childList: true,
                subtree: true,
            });

            observerRef.current = observer;
            mutationObserverRef.current = mutationObserver;
        },
        [selector, threshold, rootMargin, once],
    );

    return setRef;
}
