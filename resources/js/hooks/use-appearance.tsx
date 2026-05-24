import { useSyncExternalStore } from 'react';

export type ResolvedAppearance = 'light' | 'dark';
export type Appearance = ResolvedAppearance | 'system';

export type UseAppearanceReturn = {
    readonly appearance: Appearance;
    readonly resolvedAppearance: ResolvedAppearance;
    readonly updateAppearance: (mode: Appearance) => void;
};

const listeners = new Set<() => void>();

const applyTheme = (): void => {
    if (typeof document === 'undefined') {
        return;
    }

    // Always force light theme
    document.documentElement.classList.remove('dark');
    document.documentElement.style.colorScheme = 'light';
};

const subscribe = (callback: () => void) => {
    listeners.add(callback);
    return () => listeners.delete(callback);
};

export function initializeTheme(): void {
    if (typeof window === 'undefined') {
        return;
    }

    // Clear any stored dark mode settings
    localStorage.setItem('appearance', 'light');
    applyTheme();
}

export function useAppearance(): UseAppearanceReturn {
    const appearance: Appearance = useSyncExternalStore(
        subscribe,
        () => 'light' as Appearance,
        () => 'light' as Appearance,
    );

    const resolvedAppearance: ResolvedAppearance = 'light';

    const updateAppearance = (): void => {
        // No-op, dark mode is disabled
    };

    return { appearance, resolvedAppearance, updateAppearance } as const;
}
