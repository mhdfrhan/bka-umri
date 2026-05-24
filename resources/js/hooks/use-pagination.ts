import { useMemo } from 'react';

export interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

export function usePagination(links: PaginationLink[]) {
    return useMemo(() => {
        if (!links || links.length === 0) {
            return {
                prev: null,
                next: null,
                pages: [],
                hasPages: false,
                isFirstPage: true,
                isLastPage: true
            };
        }
        
        // Laravel paginator includes 'Previous' and 'Next' at the ends.
        const prev = links[0];
        const next = links[links.length - 1];
        const pages = links.slice(1, -1);
        
        return {
            prev,
            next,
            pages,
            hasPages: pages.length > 1,
            isFirstPage: prev.url === null,
            isLastPage: next.url === null
        };
    }, [links]);
}
