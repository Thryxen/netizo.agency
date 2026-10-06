import { useCallback, useSyncExternalStore } from 'react';

export type ResolvedAppearance = 'light' | 'dark';
export type Appearance = ResolvedAppearance | 'system';

export type UseAppearanceReturn = {
    readonly appearance: Appearance;
    readonly resolvedAppearance: ResolvedAppearance;
    readonly updateAppearance: (mode: Appearance) => void;
};

const STORAGE_KEY = 'appearance';
const THEME_COLORS: Record<ResolvedAppearance, string> = { light: '#ffffff', dark: '#0a0a0a' };

const listeners = new Set<() => void>();
let currentAppearance: Appearance = 'system';

const isAppearance = (value: unknown): value is Appearance => value === 'light' || value === 'dark' || value === 'system';

const mediaQuery = (): MediaQueryList | null => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
        return null;
    }

    return window.matchMedia('(prefers-color-scheme: dark)');
};

const prefersDark = (): boolean => mediaQuery()?.matches ?? false;

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

const getStoredAppearance = (): Appearance => {
    if (typeof window === 'undefined') {
        return 'system';
    }

    const stored = readStorage() ?? readCookie(STORAGE_KEY);

    return isAppearance(stored) ? stored : 'system';
};

const resolveAppearance = (appearance: Appearance): ResolvedAppearance =>
    appearance === 'dark' || (appearance === 'system' && prefersDark()) ? 'dark' : 'light';

const applyTheme = (appearance: Appearance): void => {
    if (typeof document === 'undefined') {
        return;
    }

    const resolved = resolveAppearance(appearance);
    const root = document.documentElement;

    root.classList.toggle('dark', resolved === 'dark');
    root.style.colorScheme = resolved;

    document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]').forEach((meta) => {
        meta.content = THEME_COLORS[resolved];
    });
};

const subscribe = (callback: () => void): (() => void) => {
    listeners.add(callback);

    return () => {
        listeners.delete(callback);
    };
};

const notify = (): void => listeners.forEach((listener) => listener());

const handleSystemThemeChange = (): void => {
    applyTheme(currentAppearance);
    notify();
};

let initialized = false;

/**
 * Sync the <html> class with the stored preference and follow OS changes while on "system".
 * Called once from app.tsx; safe to call on the server (no-op).
 */
export function initializeTheme(): void {
    if (typeof window === 'undefined' || initialized) {
        return;
    }

    initialized = true;
    currentAppearance = getStoredAppearance();

    if (readStorage() === null) {
        writeStorage(currentAppearance);
    }

    if (readCookie(STORAGE_KEY) !== currentAppearance) {
        setCookie(STORAGE_KEY, currentAppearance);
    }

    applyTheme(currentAppearance);
    mediaQuery()?.addEventListener('change', handleSystemThemeChange);
}

export function useAppearance(): UseAppearanceReturn {
    const appearance = useSyncExternalStore<Appearance>(
        subscribe,
        () => currentAppearance,
        () => 'system',
    );

    const updateAppearance = useCallback((mode: Appearance): void => {
        currentAppearance = mode;
        writeStorage(mode);
        setCookie(STORAGE_KEY, mode);
        applyTheme(mode);
        notify();
    }, []);

    return { appearance, resolvedAppearance: resolveAppearance(appearance), updateAppearance } as const;
}
