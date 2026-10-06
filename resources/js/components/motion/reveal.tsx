import { type ComponentProps, type CSSProperties, useEffect, useMemo, useRef } from 'react';
import { type EntranceOptions, mergeRefs, useEntrance } from './motion-env';

/** The CSS entrance (app.css `reveal-in`): duration, and the stagger step / cap between children. */
const REVEAL_MS = 700;
const STAGGER_MS = 80;
const MAX_STAGGER_INDEX = 3;

export type RevealProps = ComponentProps<'div'> &
    EntranceOptions & {
        /** Extra delay in seconds before the entrance starts. */
        delay?: number;
        /** Reveal the direct children one after another (80 ms apart) instead of the block as a whole. */
        stagger?: boolean;
        /** Called once the block is fully shown: when its entrance has finished, or at once when it shows statically. */
        onRevealed?: () => void;
    };

/**
 * Heading-block entrance (spec v2 §2): opacity 0→1, y 16→0, blur 6px→0 over 0.7 s, once, when 30% in view.
 * Built into <SectionHeading>; use it for heading blocks only (no fade-up on cards).
 *
 * Driven by CSS (app.css, "Motion primitives"): the hidden state exists only under `html.js` and
 * `prefers-reduced-motion: no-preference`, so SSR/no-JS output is always visible; reduced motion shows the final state.
 */
export function Reveal({ amount = 0.3, trigger = 'in-view', delay = 0, stagger = false, onRevealed, style, ref, children, ...props }: RevealProps) {
    const localRef = useRef<HTMLDivElement>(null);
    const state = useEntrance(localRef, { amount, trigger });
    const mergedRef = useMemo(() => mergeRefs(localRef, ref), [ref]);
    const onRevealedRef = useRef(onRevealed);

    useEffect(() => {
        onRevealedRef.current = onRevealed;
    });

    useEffect(() => {
        if (state === 'pending') {
            return;
        }

        if (state === 'static') {
            onRevealedRef.current?.();

            return;
        }

        const lastIndex = stagger ? Math.min(MAX_STAGGER_INDEX, Math.max(0, (localRef.current?.childElementCount ?? 1) - 1)) : 0;
        const timer = window.setTimeout(() => onRevealedRef.current?.(), delay * 1000 + lastIndex * STAGGER_MS + REVEAL_MS);

        return () => window.clearTimeout(timer);
    }, [state, stagger, delay]);

    return (
        <div
            ref={mergedRef}
            data-reveal={stagger ? 'stagger' : ''}
            data-revealed={state === 'pending' ? undefined : state === 'entering' ? '' : 'static'}
            style={delay > 0 ? ({ ...style, '--reveal-delay': `${delay}s` } as CSSProperties) : style}
            {...props}
        >
            {children}
        </div>
    );
}
