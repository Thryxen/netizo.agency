import type { ComponentType } from 'react';

// Page props come from the server at runtime; each page types its own props.
type PageComponent = ComponentType<any>;

const pages = import.meta.glob<{ default: PageComponent }>('../pages/**/*.tsx');

/**
 * Resolve an Inertia page name (e.g. "home") to its component in resources/js/pages.
 * Shared by the client (app.tsx) and SSR (ssr.tsx) entries.
 */
export async function resolvePage(name: string): Promise<PageComponent> {
    const importPage = pages[`../pages/${name}.tsx`];

    if (!importPage) {
        throw new Error(`Page not found: ${name}`);
    }

    return (await importPage()).default;
}
