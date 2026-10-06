import { type ComponentProps, type PointerEvent, useCallback, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

/**
 * Pointer-following highlight for bento tiles only (spec v2 §2): spread the returned props on the tile, render
 * <SpotlightLayer /> as its first child and give the tile `relative isolate` plus its own background.
 * Writes `--spotlight-x/y` straight to the element (no re-render); mouse only, touch never shows it.
 */
export function useSpotlight<T extends HTMLElement = HTMLElement>(): {
    'data-spotlight': '';
    onPointerMove: (event: PointerEvent<T>) => void;
} {
    const frameRef = useRef(0);

    const onPointerMove = useCallback((event: PointerEvent<T>) => {
        if (event.pointerType !== 'mouse') {
            return;
        }

        const element = event.currentTarget;
        const { clientX, clientY } = event;

        window.cancelAnimationFrame(frameRef.current);
        frameRef.current = window.requestAnimationFrame(() => {
            const rect = element.getBoundingClientRect();

            element.style.setProperty('--spotlight-x', `${Math.round(clientX - rect.left)}px`);
            element.style.setProperty('--spotlight-y', `${Math.round(clientY - rect.top)}px`);
        });
    }, []);

    useEffect(() => () => window.cancelAnimationFrame(frameRef.current), []);

    return { 'data-spotlight': '', onPointerMove };
}

/**
 * The highlight itself: a monochrome radial wash (foreground at 6%) that fades in while a mouse hovers the tile.
 * Sits behind the tile's content (-z-10 inside the tile's isolated stacking context).
 */
export function SpotlightLayer({ className }: { className?: string }) {
    return <span aria-hidden="true" data-spotlight-layer="" className={cn('pointer-events-none absolute inset-0 -z-10', className)} />;
}

/** Convenience wrapper: a `relative isolate` div with the spotlight wired in. */
export function Spotlight({ className, children, onPointerMove, ...props }: ComponentProps<'div'>) {
    const spotlight = useSpotlight<HTMLDivElement>();

    return (
        <div
            {...props}
            data-spotlight=""
            onPointerMove={(event) => {
                spotlight.onPointerMove(event);
                onPointerMove?.(event);
            }}
            className={cn('relative isolate', className)}
        >
            <SpotlightLayer />
            {children}
        </div>
    );
}
