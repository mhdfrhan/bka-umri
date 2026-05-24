import { useState, useEffect } from 'react';

export function useMediaQuery(query: string): boolean {
    const [matches, setMatches] = useState<boolean>(false);

    useEffect(() => {
        const mediaQuery = window.matchMedia(query);
        
        // Initial set
        setMatches(mediaQuery.matches);
        
        // Handler for media query changes
        const handler = (event: MediaQueryListEvent) => {
            setMatches(event.matches);
        };
        
        // Modern approach
        if (mediaQuery.addEventListener) {
            mediaQuery.addEventListener('change', handler);
            return () => mediaQuery.removeEventListener('change', handler);
        } 
        // Fallback for older browsers
        else {
            mediaQuery.addListener(handler);
            return () => mediaQuery.removeListener(handler);
        }
    }, [query]);

    return matches;
}
