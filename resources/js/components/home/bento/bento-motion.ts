import { cubicBezier } from 'motion/react';
import { motionTokens } from '@/components/motion/motion-env';
import type { Locale } from '@/lib/i18n';

const easeOutExpo = cubicBezier(...motionTokens.ease);

type TweenOptions = {
    from: number;
    to: number;
    /** Milliseconds. */
    duration: number;
    /** Milliseconds before the value starts moving. */
    delay?: number;
    /** Receives every frame's value: write it to the DOM through a ref, never into React state. */
    onUpdate: (value: number) => void;
};

/** A requestAnimationFrame tween on the shared expo-out curve. Returns a cancel function. */
export function tween({ from, to, duration, delay = 0, onUpdate }: TweenOptions): () => void {
    let frame = 0;
    let startedAt: number | null = null;

    const tick = (now: number): void => {
        startedAt ??= now;

        const progress = Math.min(1, Math.max(0, (now - startedAt - delay) / duration));

        onUpdate(from + (to - from) * easeOutExpo(progress));

        if (progress < 1) {
            frame = window.requestAnimationFrame(tick);
        }
    };

    frame = window.requestAnimationFrame(tick);

    return () => window.cancelAnimationFrame(frame);
}

/**
 * "12480" → "12 480,00 zł" in Polish, "PLN 12,480.00" in English (no-break spaces). Hand-rolled so server and browser
 * always agree (no ICU differences).
 */
export function formatZloty(value: number, locale: Locale): string {
    const [integer, fraction] = value.toFixed(2).split('.');

    if (locale === 'en') {
        return `PLN\u00a0${integer.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}.${fraction}`;
    }

    return `${integer.replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0')},${fraction}\u00a0zł`;
}
