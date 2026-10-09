import { cubicBezier } from 'motion/react';
import { type ComponentProps, useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { type EntranceOptions, mergeRefs, motionTokens, useCanAnimate, useEntrance } from './motion-env';

type DisplayNumber = {
    prefix: string;
    target: number;
    decimals: number;
    /** Thousands separator used by the original ("10 000", "10,000"), or null. */
    grouping: string | null;
    /** Decimal separator used by the original: a comma in Polish ("99,9%"), a point in English ("99.9%"). */
    decimalSeparator: string;
    suffix: string;
};

/** Same curve as motionTokens.ease; a plain rAF tween keeps motion's animation engine (~26 KB gz) out of the bundle. */
const easeOutExpo = cubicBezier(...motionTokens.ease);

/**
 * First number in a display value, Polish or English: digits with optional grouping (spaces in Polish, commas in
 * English; always three digits per group) and an optional decimal comma or point.
 */
const DISPLAY_NUMBER = /^(.*?)(\d{1,3}(?:([ \u00A0\u202F,])\d{3})+|\d+)(?:([,.])(\d+))?(.*)$/s;

/** "99,9%" → { prefix '', target 99.9, decimals 1, suffix '%' }; "8 lat" → 8 + " lat"; null when there is no number. */
export function parseDisplayNumber(value: string): DisplayNumber | null {
    const match = DISPLAY_NUMBER.exec(value);

    if (!match) {
        return null;
    }

    const [, prefix, integer, grouping, decimalSeparator = ',', fraction = '', suffix] = match;

    return {
        prefix,
        target: Number(`${integer.replace(/\D/g, '')}.${fraction || '0'}`),
        decimals: fraction.length,
        grouping: grouping ?? null,
        decimalSeparator,
        suffix,
    };
}

/** Format `value` the way the original display value was written (decimal separator, grouping, prefix/suffix). */
export function formatDisplayNumber({ prefix, decimals, grouping, decimalSeparator, suffix }: DisplayNumber, value: number): string {
    const [integer, fraction] = value.toFixed(decimals).split('.');
    const grouped = grouping ? integer.replace(/\B(?=(\d{3})+(?!\d))/g, grouping) : integer;

    return `${prefix}${grouped}${fraction ? `${decimalSeparator}${fraction}` : ''}${suffix}`;
}

export type CountUpProps = Omit<ComponentProps<'span'>, 'children'> &
    EntranceOptions & {
        /** Final value exactly as displayed: "150+", "8 lat", "99,9%", "99.9%", "30M+", "250K+". Non-numeric values render as-is. */
        value: string;
        /** Seconds (default 1.1). */
        duration?: number;
        /** Seconds before counting starts. */
        delay?: number;
        /**
         * Starting number (default 0). Count up from a nearby value when zero would misread: "99,9%" from 99 moves
         * only the decimal; "150+" from 120 never claims "0 projects".
         */
        from?: number;
        /** While true, hold the starting value even when in view (e.g. until the hero photo has resolved). */
        hold?: boolean;
    };

/**
 * Counts from `from` (default 0) to `value` the first time it is in view (default 60% visible) and not on `hold`.
 *
 * The final value is always in the DOM for assistive tech and keeps the width reserved (no layout shift); a second,
 * aria-hidden layer shows the running number. SSR/no-JS/reduced motion show the final value. With JS, CSS shows the
 * zero state from the first paint (`html.js` gate), so there is no final → 0 flash on hydration.
 */
export function CountUp({ value, duration = 1.1, delay = 0, from = 0, hold = false, amount = 0.6, trigger = 'in-view', className, ref, ...props }: CountUpProps) {
    const parsed = useMemo(() => parseDisplayNumber(value), [value]);
    const rootRef = useRef<HTMLSpanElement>(null);
    const mergedRef = useMemo(() => mergeRefs(rootRef, ref), [ref]);
    const currentRef = useRef<HTMLSpanElement>(null);
    const entrance = useEntrance(rootRef, { amount, trigger });
    const [done, setDone] = useState(false);
    const canAnimate = useCanAnimate();

    useEffect(() => {
        const current = currentRef.current;

        if (!parsed || done || entrance === 'pending' || (hold && entrance === 'entering')) {
            return;
        }

        if (entrance === 'static' || !current || !canAnimate()) {
            setDone(true);

            return;
        }

        let frame = 0;
        let startedAt: number | null = null;

        const tick = (now: number): void => {
            startedAt ??= now;

            const progress = Math.min(1, Math.max(0, (now - startedAt - delay * 1000) / (duration * 1000)));

            current.textContent = formatDisplayNumber(parsed, from + (parsed.target - from) * easeOutExpo(progress));

            if (progress < 1) {
                frame = window.requestAnimationFrame(tick);
            } else {
                setDone(true);
            }
        };

        frame = window.requestAnimationFrame(tick);

        return () => window.cancelAnimationFrame(frame);
    }, [parsed, entrance, done, duration, delay, from, hold, canAnimate]);

    if (!parsed) {
        return (
            <span ref={ref} className={className} {...props}>
                {value}
            </span>
        );
    }

    return (
        <span ref={mergedRef} data-count-up="" data-count-done={done ? '' : undefined} className={cn('inline-grid', className)} {...props}>
            <span data-count-final="" className="[grid-area:1/1]">
                {value}
            </span>
            <span ref={currentRef} data-count-current="" aria-hidden="true" className="[grid-area:1/1]">
                {formatDisplayNumber(parsed, from)}
            </span>
        </span>
    );
}
