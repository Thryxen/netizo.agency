import { type MotionValue, styleEffect } from 'motion/react';
import { type RefObject, useEffect, useRef } from 'react';

/**
 * Binds MotionValues (e.g. useScroll + useTransform) to an element's inline style, batched per frame by motion:
 * the light path for scroll-driven motion (≈14 KB gz with the scroll hooks) instead of `motion.*` components,
 * which pull in the animation engine. Keys: transform shorthands (`x`, `y`, `scale`, `scaleX`, `rotate`, …),
 * CSS properties (`opacity`, `clipPath`) or custom properties (`'--progress'`).
 *
 * Writes happen only after hydration, so render the static/SSR state with classes. Gate motion yourself:
 * a flat output range under useReducedMotionPreference(). Pass MotionValues from motion hooks (stable identities);
 * the binding is rebuilt only when the set of keys changes.
 *
 * @example
 * const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
 * const y = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [0, -40]);
 * useMotionStyle(photoRef, { y });
 */
export function useMotionStyle(ref: RefObject<HTMLElement | SVGElement | null>, values: Record<string, MotionValue<number> | MotionValue<string>>): void {
    const valuesRef = useRef(values);
    const keys = Object.keys(values).sort().join('|');

    useEffect(() => {
        valuesRef.current = values;
    });

    useEffect(() => {
        const element = ref.current;

        if (!element || keys === '') {
            return;
        }

        return styleEffect(element, valuesRef.current as Record<string, MotionValue>);
    }, [ref, keys]);
}
