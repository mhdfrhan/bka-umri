import { useCallback, useEffect, useRef, useState } from 'react';

interface UseCountUpOptions {
    /** Duration of count animation in ms */
    duration?: number;
    /** Only animate once */
    once?: boolean;
}

/**
 * Parses a display string into numeric value and affixes.
 * Examples:
 *   "25+" → { prefix: "", value: 25, suffix: "+" }
 *   "1.000+" → { prefix: "", value: 1000, suffix: "+" }
 *   "2015" → { prefix: "", value: 2015, suffix: "" }
 */
function parseDisplayValue(raw: string): {
    prefix: string;
    value: number;
    suffix: string;
    formatted: (n: number) => string;
} {
    const match = raw.match(/^([^\d]*?)([\d.,]+)(.*)$/);

    if (!match) {
        return {
            prefix: '',
            value: 0,
            suffix: raw,
            formatted: () => raw,
        };
    }

    const prefix = match[1];
    const numStr = match[2];
    const suffix = match[3];

    // Detect if using dot as thousands separator (Indonesian format)
    const usesDotSeparator = numStr.includes('.') && !numStr.includes(',');
    const cleanNum = usesDotSeparator
        ? numStr.replace(/\./g, '')
        : numStr.replace(/,/g, '');
    const value = parseInt(cleanNum, 10);

    const formatted = (n: number): string => {
        if (usesDotSeparator) {
            return n.toLocaleString('id-ID');
        }

        return n.toString();
    };

    return { prefix, value, suffix, formatted };
}

/**
 * Custom hook for animated count-up effect.
 * Returns a ref to observe and the current display string.
 */
export function useCountUp(
    targetValue: string,
    options: UseCountUpOptions = {},
): { ref: React.RefObject<HTMLElement | null>; displayValue: string } {
    const { duration = 2000, once = true } = options;
    const ref = useRef<HTMLElement>(null);
    const [displayValue, setDisplayValue] = useState(targetValue);
    const hasAnimated = useRef(false);

    const animate = useCallback(() => {
        const parsed = parseDisplayValue(targetValue);

        if (parsed.value === 0) {
            setDisplayValue(targetValue);

            return;
        }

        const startTime = performance.now();
        const endValue = parsed.value;

        function step(currentTime: number) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Ease-out cubic for smooth deceleration
            const eased = 1 - Math.pow(1 - progress, 3);
            const currentValue = Math.round(eased * endValue);

            setDisplayValue(
                `${parsed.prefix}${parsed.formatted(currentValue)}${parsed.suffix}`,
            );

            if (progress < 1) {
                requestAnimationFrame(step);
            }
        }

        requestAnimationFrame(step);
    }, [targetValue, duration]);

    useEffect(() => {
        const element = ref.current;

        if (!element) {
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (
                        entry.isIntersecting &&
                        (!once || !hasAnimated.current)
                    ) {
                        hasAnimated.current = true;
                        animate();

                        if (once) {
                            observer.unobserve(entry.target);
                        }
                    }
                });
            },
            { threshold: 0.3 },
        );

        observer.observe(element);

        return () => {
            observer.disconnect();
        };
    }, [animate, once]);

    return { ref, displayValue };
}
