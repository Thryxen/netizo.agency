import { type ComponentProps, type CSSProperties, type FocusEvent, type ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { mergeRefs } from './motion-env';
import { useInViewLoop } from './use-in-view-loop';

export type MarqueeProps = Omit<ComponentProps<'div'>, 'children'> & {
    /** One set of items (no ids inside: the set is cloned). Items are laid out in a row, `--marquee-gap` apart. */
    children: ReactNode;
    /** Static layout for reduced motion and no-JS (e.g. the old wordmark grid). Default: the items, wrapped. */
    fallback?: ReactNode;
    /** Seconds for one set of items to scroll past (default 36). Speed stays the same when sets are repeated. */
    duration?: number;
    /** Scroll left-to-right instead. */
    reverse?: boolean;
    /** Extra classes for each row of items (e.g. `items-baseline`). */
    rowClassName?: string;
};

/**
 * Infinite horizontal loop, driven by a CSS transform animation (app.css, "Motion primitives").
 *
 * - The set is repeated until it fills the width; every copy after the first is `aria-hidden` + `inert`, so
 *   assistive tech and the keyboard only meet the items once.
 * - Pauses on hover, on focus-within (and brings the focused item into view) and while offscreen.
 * - `min-w-0` on the root: as a grid/flex item it must not grow to its content, or the repeat measurement runs away.
 * - Edges fade through a mask (`mask-fade-x`, monochrome). Gap: set `[--marquee-gap:…]` (default 3rem).
 * - Reduced motion and no-JS show `fallback` instead (CSS switch, so no layout swap on hydration).
 */
export function Marquee({ children, fallback, duration = 36, reverse = false, rowClassName, className, ...props }: MarqueeProps) {
    const viewportRef = useRef<HTMLDivElement>(null);
    const trackRef = useRef<HTMLDivElement>(null);
    const [repeat, setRepeat] = useState(1);
    const loop = useInViewLoop<HTMLDivElement>({ amount: 0 });
    const viewportRefs = useMemo(() => mergeRefs(viewportRef, loop.ref), [loop.ref]);

    useEffect(() => {
        const viewport = viewportRef.current;
        const firstRow = trackRef.current?.firstElementChild;

        if (!viewport || !(firstRow instanceof HTMLElement) || typeof ResizeObserver === 'undefined') {
            return;
        }

        const measure = (): void => {
            if (firstRow.offsetWidth > 0 && viewport.clientWidth > 0) {
                setRepeat(Math.max(1, Math.ceil(viewport.clientWidth / firstRow.offsetWidth)));
            }
        };

        const observer = new ResizeObserver(measure);
        observer.observe(viewport);
        observer.observe(firstRow);

        return () => observer.disconnect();
    }, []);

    /**
     * Keyboard users must see what they focus: jump the (now paused) loop so the item sits in the middle, or as close
     * to it as the first set allows. The offset is clamped, never wrapped: wrapping would centre an inert copy and
     * leave the focused item (in the first set) and its focus ring off-screen.
     */
    const handleFocus = (event: FocusEvent<HTMLDivElement>): void => {
        const track = trackRef.current;
        const viewport = viewportRef.current;
        const target = event.target;

        if (!track || !viewport || !(target instanceof HTMLElement) || typeof track.getAnimations !== 'function') {
            return;
        }

        const animation = track.getAnimations()[0];
        const cycle = Number(animation?.effect?.getComputedTiming().duration);
        const half = track.scrollWidth / 2;

        if (!animation || !cycle || !half) {
            return;
        }

        const itemLeft = target.getBoundingClientRect().left - track.getBoundingClientRect().left;
        const offset = Math.min(Math.max(itemLeft - (viewport.clientWidth - target.offsetWidth) / 2, 0), half);
        const progress = offset / half;

        animation.currentTime = (reverse ? 1 - progress : progress) * cycle;
    };

    return (
        <div data-marquee="" className={cn('relative min-w-0', className)} {...props}>
            <div ref={viewportRefs} data-marquee-motion="" className="mask-fade-x overflow-hidden" onFocus={handleFocus}>
                <div
                    ref={trackRef}
                    data-marquee-track=""
                    data-paused={loop.inView ? undefined : ''}
                    data-reverse={reverse ? '' : undefined}
                    className="flex w-max"
                    style={{ '--marquee-duration': `${duration * repeat}s` } as CSSProperties}
                >
                    {Array.from({ length: repeat * 2 }, (_, index) => (
                        <div
                            key={index}
                            aria-hidden={index > 0 ? true : undefined}
                            inert={index > 0 ? true : undefined}
                            className={cn('flex shrink-0 items-center gap-[var(--marquee-gap,3rem)] pr-[var(--marquee-gap,3rem)]', rowClassName)}
                        >
                            {children}
                        </div>
                    ))}
                </div>
            </div>
            <div data-marquee-static="">{fallback ?? <div className="flex flex-wrap items-center gap-x-[var(--marquee-gap,3rem)] gap-y-4">{children}</div>}</div>
        </div>
    );
}
