import { useEffect } from 'react';
import { goToElement, goToTop } from '@/lib/in-page-navigation';

/**
 * Handles clicks on same-page links (`href="#…"`) inside the Inertia root without adding history entries
 * (see lib/in-page-navigation). Modified clicks, links handled elsewhere and links outside the root
 * (the cookie banner) keep their own behaviour.
 */
export function useInPageAnchors(rootId = 'app'): void {
    useEffect(() => {
        const handleClick = (event: MouseEvent): void => {
            if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
                return;
            }

            const link = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>('a[href^="#"]') : null;
            const root = document.getElementById(rootId);

            if (!link || !root?.contains(link) || (link.target !== '' && link.target !== '_self')) {
                return;
            }

            const href = link.getAttribute('href') ?? '#';

            if (href === '#') {
                event.preventDefault();
                goToTop();

                return;
            }

            let id: string;

            try {
                id = decodeURIComponent(href.slice(1));
            } catch {
                return;
            }

            const target = document.getElementById(id);

            if (!target || !root.contains(target)) {
                return;
            }

            event.preventDefault();
            goToElement(target);
        };

        document.addEventListener('click', handleClick);

        return () => document.removeEventListener('click', handleClick);
    }, [rootId]);
}
