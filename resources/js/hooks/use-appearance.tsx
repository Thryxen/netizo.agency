import { useCallback, useSyncExternalStore } from 'react';

export type Appearance = 'light' | 'dark';

export type UseAppearanceReturn = {
    readonly appearance: Appearance;
    readonly updateAppearance: (mode: Appearance) => void;
    /** Light ↔ dark, saved for the next visits. */
    readonly toggleAppearance: () => void;
};

const STORAGE_KEY = 'appearance';
const THEME_COLORS: Record<Appearance, string> = { light: '#ffffff', dark: '#0a0a0a' };

const listeners = new Set<() => void>();
let currentAppearance: Appearance = 'light';

const setCookie = (name: string, value: string, days = 365): void => {
    if (typeof document === 'undefined') {
        return;
    }

    const maxAge = days * 24 * 60 * 60;
    const secure = window.location.protocol === 'https:' ? ';Secure' : '';

    document.cookie = `${name}=${value};path=/;max-age=${maxAge};SameSite=Lax${secure}`;
};

const readCookie = (name: string): string | null => {
    if (typeof document === 'undefined') {
        return null;
    }

    const match = document.cookie.split('; ').find((row) => row.startsWith(`${name}=`));

    return match ? decodeURIComponent(match.slice(name.length + 1)) : null;
};

const readStorage = (): string | null => {
    try {
        return window.localStorage.getItem(STORAGE_KEY);
    } catch {
        return null;
    }
};

const writeStorage = (value: Appearance): void => {
    try {
        window.localStorage.setItem(STORAGE_KEY, value);
    } catch {
        // Storage can be unavailable (private mode, blocked site data); the cookie still persists the choice.
    }
};

/** Dark only when the visitor chose it; anything else (nothing stored, an old "system" value) is light. */
const getStoredAppearance = (): Appearance => {
    if (typeof window === 'undefined') {
        return 'light';
    }

    return (readCookie(STORAGE_KEY) ?? readStorage()) === 'dark' ? 'dark' : 'light';
};

const applyTheme = (appearance: Appearance): void => {
    if (typeof document === 'undefined') {
        return;
    }

    const root = document.documentElement;

    root.classList.toggle('dark', appearance === 'dark');
    root.style.colorScheme = appearance;

    document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]').forEach((meta) => {
        meta.content = THEME_COLORS[appearance];
    });
};

const subscribe = (callback: () => void): (() => void) => {
    listeners.add(callback);

    return () => {
        listeners.delete(callback);
    };
};

const notify = (): void => listeners.forEach((listener) => listener());

const persist = (appearance: Appearance): void => {
    writeStorage(appearance);
    setCookie(STORAGE_KEY, appearance);
};

let initialized = false;

/**
 * Sync the <html> class and the saved preference (the cookie the server renders from, mirrored in localStorage).
 * Called once from app.tsx; safe to call on the server (no-op).
 */
export function initializeTheme(): void {
    if (typeof window === 'undefined' || initialized) {
        return;
    }

    initialized = true;
    currentAppearance = getStoredAppearance();

    if (readCookie(STORAGE_KEY) !== currentAppearance || readStorage() !== currentAppearance) {
        persist(currentAppearance);
    }

    applyTheme(currentAppearance);
}

export function useAppearance(): UseAppearanceReturn {
    const appearance = useSyncExternalStore<Appearance>(
        subscribe,
        () => currentAppearance,
        () => 'light',
    );

    const updateAppearance = useCallback((mode: Appearance): void => {
        currentAppearance = mode;
        persist(mode);
        applyTheme(mode);
        notify();
    }, []);

    const toggleAppearance = useCallback((): void => {
        updateAppearance(currentAppearance === 'dark' ? 'light' : 'dark');
    }, [updateAppearance]);

    return { appearance, updateAppearance, toggleAppearance } as const;
}
