/**
 * Jumps between sections of the single-page home. They never add a history entry: Inertia stores its page in
 * every entry it sees, and going Back to such an entry remounts the page, which would wipe half-filled forms.
 * Replacing the current entry (passing its state along) keeps Inertia's page and remembered state intact.
 */

export const prefersReducedMotion = (): boolean =>
    typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const scrollBehavior = (): ScrollBehavior => (prefersReducedMotion() ? 'auto' : 'smooth');

/** Point the URL at `hash` (`''` drops the fragment) by replacing the current history entry. */
export function replaceUrlHash(hash: string): void {
    const { pathname, search, hash: currentHash } = window.location;

    if (hash === currentHash) {
        return;
    }

    window.history.replaceState(window.history.state, '', `${pathname}${search}${hash}`);
}

/** Focus an element without scrolling, making it programmatically focusable first when it is not. */
export function focusWithoutScroll(element: HTMLElement): void {
    if (element.tabIndex < 0 && !element.hasAttribute('tabindex')) {
        element.setAttribute('tabindex', '-1');
    }

    element.focus({ preventScroll: true });
}

/** A section hands focus to its heading (`${id}-heading` or its first h2); anything else takes focus itself. */
function focusTargetFor(target: HTMLElement): HTMLElement {
    const heading = document.getElementById(`${target.id}-heading`) ?? (target.matches('section') ? target.querySelector('h2') : null);

    return heading instanceof HTMLElement ? heading : target;
}

/** Scroll to an element (respecting reduced motion), record it in the URL and move focus to it. */
export function goToElement(target: HTMLElement): void {
    replaceUrlHash(`#${target.id}`);
    target.scrollIntoView({ behavior: scrollBehavior(), block: 'start' });
    focusWithoutScroll(focusTargetFor(target));
}

export function goToSection(id: string): void {
    const target = document.getElementById(id);

    if (target) {
        goToElement(target);
    }
}

/** Scroll to the top of the page and drop the fragment from the URL (what a `href="#"` link does). */
export function goToTop(): void {
    replaceUrlHash('');
    window.scrollTo({ top: 0, behavior: scrollBehavior() });
}
