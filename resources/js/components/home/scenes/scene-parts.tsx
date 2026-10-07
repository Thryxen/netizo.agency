import type { LucideIcon } from 'lucide-react';
import { type CSSProperties, type ReactNode, type RefObject, useEffect, useState } from 'react';
import { Appear } from '@/components/home/bento/bento-tile';
import { type InViewLoopOptions, useInViewLoop } from '@/components/motion/use-in-view-loop';
import { photo, type PhotoName } from '@/lib/photos';
import { cn } from '@/lib/utils';

/**
 * Photo scenes (spec v7): colourful photographs of the client's world carrying small live interface elements, in the
 * language of the bento's mobile and e-commerce tiles. Colour comes from the photos; the UI stays monochrome; life
 * comes from chips that move calmly while in view (useLiveLoop: they start the moment they are seen, pause offscreen,
 * and SSR, no JS and reduced motion show their final frame). Keyframes and the dark-mode dim live in app.css
 * ("Photo scenes").
 */

/**
 * A chip's surface: solid, so its text never sits on the photo; a hairline plus a soft, short shadow in light mode
 * (dark mode: hairline only), like the hero's floating layers.
 */
export const CHIP_SURFACE = 'border bg-background shadow-[0_1px_2px_rgb(0_0_0/0.05),0_12px_28px_-12px_rgb(0_0_0/0.4)] dark:shadow-none';

/**
 * A browser window floating on a photo set (the hero's LiveBuild, the client panel mock): a soft, wide shadow in light
 * mode (dark mode: its hairline only). In em, so it scales with the scene.
 */
export const WINDOW_SHADOW = 'rounded-[0.9em] shadow-[0_0.2em_0.5em_rgb(0_0_0/0.05),0_2.4em_4.8em_-1.6em_rgb(0_0_0/0.28)] dark:shadow-none';

/** A chat bubble from the visitor: ink, its tail at the bottom right (the bento's AI tile). */
export const VISITOR_BUBBLE = 'rounded-lg rounded-br-[3px] bg-foreground px-3 py-2 text-xs leading-snug text-background shadow-[0_10px_24px_-12px_rgb(0_0_0/0.45)] dark:shadow-none';

/** A chat bubble from Netizo: the chip surface, its tail at the bottom left. */
export const NETIZO_BUBBLE = cn('rounded-lg rounded-bl-[3px] px-3 py-2 text-xs leading-snug', CHIP_SURFACE);

/**
 * Attributes for a scene's live layer: hidden from assistive tech (the section's text carries the meaning) and
 * flagged for the scene CSS, which runs its small loops (typing dots) only under `data-scene-live`.
 */
export function sceneProps(active: boolean): { 'aria-hidden': true; 'data-scene': ''; 'data-scene-live': '' | undefined } {
    return { 'aria-hidden': true, 'data-scene': '', 'data-scene-live': active ? '' : undefined };
}

/**
 * Rendered width of a backdrop stage (the hero's LiveBuild, the client panel mock): 7/12 of the 1200px column (plus
 * the hero's right gutter) from 1248px, ≈ 56vw from lg, the full width below. At 1x a desktop gets the 768w file.
 */
export const STAGE_SIZES = '(min-width: 1248px) 700px, (min-width: 1024px) 56vw, 100vw';

type SceneBackdropProps = {
    name: PhotoName;
    /** Rendered width of the photo (object-fit cover), for the 768w / 1536w choice. */
    sizes: string;
    /** First view (the hero): load at once instead of lazily. */
    eager?: boolean;
    /** Crop, e.g. `object-[50%_40%]`. */
    imgClassName?: string;
    className?: string;
};

/**
 * The set a live mock-up floats on: a full-bleed photo behind the scene that drifts very slowly (scale 1 → 1.04 and a
 * few px of pan over ~22 s, alternating; CSS only, paused offscreen and under reduced motion) and is dimmed in dark
 * mode so the floating UI keeps its contrast. It never tilts with the scene.
 */
export function SceneBackdrop({ name, sizes, eager = false, imgClassName, className }: SceneBackdropProps) {
    const { ref, inView } = useInViewLoop<HTMLDivElement>();
    const image = photo(name);

    return (
        <div ref={ref} aria-hidden="true" data-scene-backdrop="" data-paused={inView ? undefined : ''} className={cn('absolute inset-0 overflow-hidden bg-muted', className)}>
            <img
                src={image.src}
                srcSet={image.srcSet}
                sizes={sizes}
                width={image.width}
                height={image.height}
                alt=""
                loading={eager ? 'eager' : 'lazy'}
                fetchPriority={eager ? 'high' : undefined}
                decoding="async"
                draggable={false}
                data-photo=""
                className={cn('size-full object-cover', imgClassName)}
            />
        </div>
    );
}

/** The chip's leading icon: an ink square (the bento's notification icon). */
export function ChipIcon({ icon: Icon, className }: { icon: LucideIcon; className?: string }) {
    return (
        <span className={cn('flex size-8 shrink-0 items-center justify-center rounded-md bg-foreground text-background', className)}>
            <Icon aria-hidden="true" className="size-4" strokeWidth={1.75} />
        </span>
    );
}

/** Three bits blinking in turn while someone types (runs only under `data-scene-live`). */
export function TypingDots() {
    return (
        <span className="flex items-center gap-1">
            {[0, 1, 2].map((dot) => (
                <span key={dot} data-scene-blink="" style={{ '--scene-delay': `${dot * 160}ms` } as CSSProperties} className="size-1 bg-foreground/70" />
            ))}
        </span>
    );
}

type SceneChipProps = {
    show: boolean;
    /** Where it arrives from: `above` slides down from the photo's top edge (a push notification), `below` rises. */
    from?: 'above' | 'below';
    /** Leading ink square (or pass `leading`). */
    icon?: LucideIcon;
    leading?: ReactNode;
    title: ReactNode;
    detail?: ReactNode;
    /** Right-hand slot: a time stamp, a status box. */
    trailing?: ReactNode;
    /** Placement over the photo (absolute insets) and size. */
    className?: string;
};

/**
 * A notification on a photo: icon, one-line title and detail on a solid surface. Shown and hidden by `show` (opacity
 * and translate only, so it never re-lays out the scene); reduced motion makes it an instant swap.
 */
export function SceneChip({ show, from = 'below', icon, leading, title, detail, trailing, className }: SceneChipProps) {
    return (
        <Appear
            show={show}
            from="none"
            className={cn(
                'flex items-center gap-3 rounded-lg p-2.5 pr-3',
                CHIP_SURFACE,
                from === 'above' ? 'duration-600 data-[show=false]:-translate-y-[130%]' : 'duration-600 data-[show=false]:translate-y-3',
                className,
            )}
        >
            {leading ?? (icon && <ChipIcon icon={icon} />)}
            <span className="min-w-0 flex-1 text-xs leading-snug">
                <span className="block truncate font-medium">{title}</span>
                {detail && <span className="block truncate text-muted-foreground">{detail}</span>}
            </span>
            {trailing}
        </Appear>
    );
}

export type SceneArrival<T extends Element> = {
    ref: RefObject<T | null>;
    /** The chip is shown: the static frame (SSR, no JS, reduced motion, not yet seen), and for good once it arrived. */
    shown: boolean;
    /** In view with motion allowed (pass to sceneProps). */
    active: boolean;
};

/**
 * A one-shot entrance for a scene's chip, for places where the scene itself already moves (the Klienci marquee) or a
 * loop would only repeat a motif: the first time the scene is seen it hides at once and slides in after `delay` ms,
 * then stays. Leaving the view before it arrived postpones it to the next view. The static frame (SSR, no JS, reduced
 * motion, before the first view) shows it.
 */
export function useSceneArrival<T extends Element = HTMLDivElement>(delay: number, options?: InViewLoopOptions): SceneArrival<T> {
    const loop = useInViewLoop<T>(options);
    const [phase, setPhase] = useState<'idle' | 'waiting' | 'arrived'>('idle');

    if (phase === 'idle' && loop.active) {
        setPhase('waiting');
    }

    useEffect(() => {
        if (phase !== 'waiting' || !loop.active) {
            return;
        }

        const timer = window.setTimeout(() => setPhase('arrived'), delay);

        return () => window.clearTimeout(timer);
    }, [phase, loop.active, delay]);

    return { ref: loop.ref, shown: loop.reducedMotion || phase !== 'waiting', active: loop.active };
}
