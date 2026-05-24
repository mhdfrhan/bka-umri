import { useState, useEffect, useCallback } from 'react';

export function useMediaQuery(query: string): boolean {
    const [matches, setMatches] = useState<boolean>(false);

    const updateMatches = useCallback((mediaQuery: MediaQueryList) => {
        setMatches(mediaQuery.matches);
    }, []);

    useEffect(() => {
        const mediaQuery = window.matchMedia(query);

        // Initial set via callback (not directly in effect body)
        updateMatches(mediaQuery);

        // Handler for media query changes
        const handler = (event: MediaQueryListEvent) => {
            setMatches(event.matches);
        };

        mediaQuery.addEventListener('change', handler);

        return () => mediaQuery.removeEventListener('change', handler);
    }, [query, updateMatches]);

    return matches;
}
