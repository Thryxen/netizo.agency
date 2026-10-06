import { MotionConfigContext } from 'motion/react';
import { type Ref, type RefCallback, type RefObject, useCallback, useContext, useEffect, useState, useSyncExternalStore } from 'react';

/**
 * Shared motion vocabulary (spec v2 §2). CSS twin: `var(--ease-expo-out)` / Tailwind `ease-expo-out`;
 * as a JS easing function: `cubicBezier(...motionTokens.ease)` from 'motion/react'.
 */
export const motionTokens = {
    /** Expo-out-ish entrance easing. */
    ease: [0.22, 1, 0.36, 1] as const,
    /** Default entrance duration in seconds (spec range 0.5–0.8). */
    duration: 0.7,
    /** Default stagger between siblings in seconds (spec range 0.06–0.1). */
    stagger: 0.08,
} as const;

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

const reducedMotionQuery = (): MediaQueryList | null =>
    typeof window !== 'undefined' && typeof window.matchMedia === 'function' ? window.matchMedia(REDUCED_MOTION_QUERY) : null;

const subscribeToReducedMotion = (onChange: () => void): (() => void) => {
    const query = reducedMotionQuery();
    query?.addEventListener('change', onChange);

    return () => query?.removeEventListener('change', onChange);
};

const osPrefersReducedMotion = (): boolean => reducedMotionQuery()?.matches ?? false;

/**
 * True while the inline head script's `js` class is on <html>. CSS hides entrance-animated content only under `.js`,
 * and the script's fail-safe removes the class when the app has not booted in time, so effects must not animate then.
 */
export const isMotionGateOpen = (): boolean => typeof document !== 'undefined' && document.documentElement.classList.contains('js');

/**
 * Whether motion should be reduced. The OS setting always counts (a11y floor); `<MotionConfig reducedMotion="always">`
 * forces it on. SSR and the hydrating render return false, the real value follows right after hydration.
 */
export function useReducedMotionPreference(): boolean {
    const { reducedMotion } = useContext(MotionConfigContext);
    const osPrefersReduced = useSyncExternalStore(subscribeToReducedMotion, osPrefersReducedMotion, () => false);

    return reducedMotion === 'always' || osPrefersReduced;
}

/**
 * A stable live check for effects: may an entrance animation start right now? (JS gate open, motion not reduced.)
 * Reads the media query directly, so it is already correct during the hydrating render's effects.
 */
export function useCanAnimate(): () => boolean {
    const { reducedMotion } = useContext(MotionConfigContext);
    const forcedStatic = reducedMotion === 'always';

    return useCallback(() => !forcedStatic && isMotionGateOpen() && !osPrefersReducedMotion(), [forcedStatic]);
}

const VISIBILITY_STEPS = Array.from({ length: 21 }, (_, index) => index / 20);

/**
 * Calls `onEnter` once, the first time `element` is at least `amount` (0–1) visible, then disconnects.
 * An element too tall to ever reach `amount` counts once it fills half the viewport. Returns a cleanup.
 */
export function observeOnce(element: Element, amount: number, onEnter: () => void): () => void {
    if (typeof IntersectionObserver === 'undefined') {
        onEnter();

        return () => {};
    }

    const observer = new IntersectionObserver(
        (entries) => {
            for (const entry of entries) {
                if (!entry.isIntersecting) {
                    continue;
                }

                const rootHeight = entry.rootBounds?.height ?? window.innerHeight;

                if (entry.intersectionRatio >= amount || entry.intersectionRect.height >= rootHeight * 0.5) {
                    observer.disconnect();
                    onEnter();

                    return;
                }
            }
        },
        { threshold: [...new Set([...VISIBILITY_STEPS, amount])].sort((a, b) => a - b) },
    );

    observer.observe(element);

    return () => observer.disconnect();
}

/** 'pending' = hidden, waiting; 'entering' = play the entrance; 'static' = show the final state without motion. */
export type EntranceState = 'pending' | 'entering' | 'static';

export type EntranceOptions = {
    /** Fraction of the element that must be visible (default 0.3). */
    amount?: number;
    /** 'in-view' (default) waits until the element scrolls in; 'mount' starts right after hydration (above the fold). */
    trigger?: 'in-view' | 'mount';
};

/**
 * Once-only entrance trigger shared by Reveal and CountUp, usable for custom markup too.
 * Goes straight to 'static' under reduced motion or when the JS gate is closed; never runs on the server.
 */
export function useEntrance(ref: RefObject<Element | null>, { amount = 0.3, trigger = 'in-view' }: EntranceOptions = {}): EntranceState {
    const [state, setState] = useState<EntranceState>('pending');
    const reduced = useReducedMotionPreference();
    const canAnimate = useCanAnimate();

    useEffect(() => {
        const element = ref.current;

        if (state !== 'pending' || !element) {
            return;
        }

        if (!canAnimate()) {
            setState('static');

            return;
        }

        if (trigger === 'mount') {
            // Two frames: the hidden state is styled before the entrance starts, also when the page rendered client-side.
            let frame = window.requestAnimationFrame(() => {
                frame = window.requestAnimationFrame(() => setState('entering'));
            });

            return () => window.cancelAnimationFrame(frame);
        }

        return observeOnce(element, amount, () => setState('entering'));
    }, [ref, state, reduced, canAnimate, amount, trigger]);

    return state;
}

/** Combine refs (objects or callbacks, React 19 cleanup-aware) into one callback ref. Memoise the result. */
export function mergeRefs<T>(...refs: Array<Ref<T> | undefined>): RefCallback<T> {
    return (value: T | null) => {
        const cleanups = refs.map((ref) => {
            if (typeof ref === 'function') {
                const cleanup = ref(value);

                return typeof cleanup === 'function' ? cleanup : () => ref(null);
            }

            if (ref) {
                ref.current = value;

                return () => {
                    ref.current = null;
                };
            }

            return undefined;
        });

        return () => cleanups.forEach((cleanup) => cleanup?.());
    };
}
