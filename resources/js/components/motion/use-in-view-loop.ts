import { type RefObject, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { useReducedMotionPreference } from './motion-env';

const subscribeToVisibility = (onChange: () => void): (() => void) => {
    document.addEventListener('visibilitychange', onChange);

    return () => document.removeEventListener('visibilitychange', onChange);
};

/** False while the tab is hidden (no point running loops nobody sees). True on the server. */
function usePageVisible(): boolean {
    return useSyncExternalStore(
        subscribeToVisibility,
        () => document.visibilityState === 'visible',
        () => true,
    );
}

export type InViewLoopOptions = {
    /** Fraction of the element that must be visible for the loop to run (default 0.2). */
    amount?: number;
    /** IntersectionObserver rootMargin, e.g. '100px 0px' to start a little early. */
    rootMargin?: string;
};

export type InViewLoop<T extends Element> = {
    /** Attach to the element whose visibility gates the loop (e.g. the bento tile). */
    ref: RefObject<T | null>;
    /** Currently at least `amount` visible. */
    inView: boolean;
    /** Reduced motion is on: render the static representative frame. */
    reducedMotion: boolean;
    /** Run the loop now: in view, tab visible, motion allowed. Always false during SSR and hydration. */
    active: boolean;
};

/**
 * Gate for looping micro-animations (bento tiles, marquee): `active` only while the element is in view, the tab is
 * visible and motion is not reduced; it pauses again offscreen (not once-only). Before hydration, without JS and
 * under reduced motion `active` is false, so components must render a complete static frame in that state.
 * For CSS loops: `style={{ animationPlayState: active ? 'running' : 'paused' }}`.
 */
export function useInViewLoop<T extends Element = HTMLDivElement>({ amount = 0.2, rootMargin = '0px' }: InViewLoopOptions = {}): InViewLoop<T> {
    const ref = useRef<T>(null);
    const [inView, setInView] = useState(false);
    const reducedMotion = useReducedMotionPreference();
    const pageVisible = usePageVisible();

    useEffect(() => {
        const element = ref.current;

        if (!element) {
            return;
        }

        if (typeof IntersectionObserver === 'undefined') {
            setInView(true);

            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                const rootHeight = entry.rootBounds?.height ?? window.innerHeight;

                setInView(entry.isIntersecting && (entry.intersectionRatio >= amount || entry.intersectionRect.height >= rootHeight * 0.5));
            },
            { threshold: [0, amount, 0.5, 1], rootMargin },
        );

        observer.observe(element);

        return () => observer.disconnect();
    }, [amount, rootMargin]);

    return { ref, inView, reducedMotion, active: inView && pageVisible && !reducedMotion };
}

export type LoopStepOptions = {
    /** Advance only while true (pass `active` from useInViewLoop); pausing keeps the current step. */
    active: boolean;
    /** Representative frame: the first render (SSR, no JS) and the frame shown under reduced motion. Default 0. */
    staticStep?: number;
    /** When true, always return `staticStep`. */
    reducedMotion?: boolean;
};

/**
 * Step clock for a calm loop: shows step i for `durations[i]` ms, then i + 1, wrapping around. Starts from
 * `staticStep` (so SSR → live has no jump), holds while inactive and resumes where it stopped.
 *
 * @example
 * const loop = useInViewLoop<HTMLDivElement>();
 * const step = useLoopStep([900, 700, 1600, 1200], { active: loop.active, reducedMotion: loop.reducedMotion, staticStep: 3 });
 */
export function useLoopStep(durations: readonly number[], { active, staticStep = 0, reducedMotion = false }: LoopStepOptions): number {
    const count = Math.max(1, durations.length);
    const [step, setStep] = useState(staticStep % count);
    const current = step % count;
    const delay = durations[current] ?? 0;

    useEffect(() => {
        if (!active || count < 2) {
            return;
        }

        const timer = window.setTimeout(() => setStep((value) => (value + 1) % count), delay);

        return () => window.clearTimeout(timer);
    }, [active, current, count, delay]);

    return reducedMotion ? staticStep % count : current;
}

export type LiveLoop<T extends Element> = InViewLoop<T> & {
    /** Current step of the loop (see useLoopStep). */
    step: number;
};

/**
 * useInViewLoop + useLoopStep in one call, for a bento tile's live visual.
 *
 * @example
 * const { ref, step } = useLiveLoop<HTMLDivElement>([800, 600, 600, 2400], { staticStep: 3 });
 * return <div ref={ref}>{step >= 1 && <HeroBlock />}{step >= 2 && <Cards />}</div>;
 */
export function useLiveLoop<T extends Element = HTMLDivElement>(
    durations: readonly number[],
    { staticStep = 0, ...options }: InViewLoopOptions & { staticStep?: number } = {},
): LiveLoop<T> {
    const loop = useInViewLoop<T>(options);
    const step = useLoopStep(durations, { active: loop.active, staticStep, reducedMotion: loop.reducedMotion });

    return { ...loop, step };
}
