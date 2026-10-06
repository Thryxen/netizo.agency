import { type ComponentProps, useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { mergeRefs, observeOnce, useCanAnimate, useReducedMotionPreference } from './motion-env';

/**
 * Mosaic resolution per step, as columns across the photo's visible width (rows follow its aspect ratio, blocks stay
 * square). Relative to the width, so every photo opens on the same ~8-column mosaic whatever its size.
 */
const COLUMN_STEPS = [8, 12, 20, 32, 52, 90, 160] as const;
/** Steps whose blocks would be smaller than this (CSS px) are skipped; the canvas then crossfades to the <img>. */
const MIN_BLOCK_PX = 2;
/** Whole resolve, before the 150 ms canvas fade (CSS). */
const RESOLVE_MS = 1100;
const MAX_DEVICE_PIXEL_RATIO = 2;
/** The photo must be this visible before it resolves. */
const START_AMOUNT = 0.35;
/** Release the canvas once its fade-out (150 ms) is over. */
const RELEASE_AFTER_MS = 400;
/** Photos that would start together (a row scrolling in) start at least this far apart, in reading order. */
const START_SPACING_MS = 120;

/** The column counts this photo steps through: the shared sequence, without blocks finer than MIN_BLOCK_PX. */
function columnSteps(width: number): number[] {
    const steps = COLUMN_STEPS.filter((columns) => width / columns >= MIN_BLOCK_PX);

    return steps.length > 0 ? steps : [COLUMN_STEPS[0]];
}

/**
 * Step shown `elapsed` ms in, or `count` when done. Progress eases out (1 − (1 − t)²), so the coarse steps flash
 * by and the fine ones linger (7 steps: ~80, 170, 270, 380, 510, 690 ms, then the finest until 1.1 s).
 */
function stepAt(elapsed: number, count: number): number {
    if (elapsed >= RESOLVE_MS) {
        return count;
    }

    const progress = 1 - (1 - Math.max(0, elapsed) / RESOLVE_MS) ** 2;

    return Math.min(count - 1, Math.floor(progress * count));
}

/** Last reserved start time (performance.now()), shared by every PixelatedImage on the page. */
let lastStartAt = Number.NEGATIVE_INFINITY;

/** Book a start slot no earlier than `earliest` and at least START_SPACING_MS after the previous one. */
function reserveStart(earliest: number): number {
    const at = Math.max(earliest, lastStartAt + START_SPACING_MS);
    lastStartAt = at;

    return at;
}

type Rect = { x: number; y: number; width: number; height: number };

const POSITION_KEYWORDS: Record<string, string> = { left: '0%', center: '50%', right: '100%', top: '0%', bottom: '100%' };

/** Resolve one object-position component (keyword, %, px) against the free space along its axis. */
function resolvePosition(token: string, free: number): number {
    const value = POSITION_KEYWORDS[token] ?? token;

    if (value.endsWith('%')) {
        return (free * parseFloat(value)) / 100;
    }

    if (value.endsWith('px')) {
        return parseFloat(value);
    }

    return free / 2;
}

/** Offset of the rendered image inside its box for a computed `object-position` (1–2 value or edge-offset form). */
function parseObjectPosition(value: string, freeX: number, freeY: number): { x: number; y: number } {
    const tokens = value.trim().split(/\s+/).filter(Boolean);

    if (tokens.length > 2) {
        let x = freeX / 2;
        let y = freeY / 2;

        for (let index = 0; index < tokens.length; index++) {
            const edge = tokens[index];
            const next = tokens[index + 1];
            const offset = next !== undefined && !(next in POSITION_KEYWORDS) ? next : null;

            if (offset !== null) {
                index++;
            }

            const along = (free: number): number => (offset === null ? 0 : resolvePosition(offset, free));

            if (edge === 'left') {
                x = along(freeX);
            } else if (edge === 'right') {
                x = freeX - along(freeX);
            } else if (edge === 'top') {
                y = along(freeY);
            } else if (edge === 'bottom') {
                y = freeY - along(freeY);
            }
        }

        return { x, y };
    }

    let [first = '50%', second = '50%'] = tokens;

    if (first === 'top' || first === 'bottom' || second === 'left' || second === 'right') {
        [first, second] = [second, first];
    }

    return { x: resolvePosition(first, freeX), y: resolvePosition(second, freeY) };
}

/**
 * Where `object-fit`/`object-position` put the image: `dest` is the visible part inside the box (clipped to it),
 * `render` the whole rendered image relative to `dest` (it overhangs `dest` when the image is cropped).
 */
function fitImage(fit: string, position: string, imageWidth: number, imageHeight: number, boxWidth: number, boxHeight: number): { render: Rect; dest: Rect } | null {
    let renderWidth = boxWidth;
    let renderHeight = boxHeight;

    if (fit !== 'fill') {
        const containScale = Math.min(boxWidth / imageWidth, boxHeight / imageHeight);
        const scale =
            fit === 'contain' ? containScale : fit === 'none' ? 1 : fit === 'scale-down' ? Math.min(1, containScale) : Math.max(boxWidth / imageWidth, boxHeight / imageHeight);

        renderWidth = imageWidth * scale;
        renderHeight = imageHeight * scale;
    }

    const { x, y } = parseObjectPosition(position, boxWidth - renderWidth, boxHeight - renderHeight);
    const left = Math.max(0, x);
    const top = Math.max(0, y);
    const right = Math.min(boxWidth, x + renderWidth);
    const bottom = Math.min(boxHeight, y + renderHeight);

    if (right <= left || bottom <= top) {
        return null;
    }

    return {
        render: { x: x - left, y: y - top, width: renderWidth, height: renderHeight },
        dest: { x: left, y: top, width: right - left, height: bottom - top },
    };
}

type Pixelator = {
    width: number;
    height: number;
    /** Width of the visible crop in CSS px (what the mosaic columns divide). */
    cropWidth: number;
    /** Draw the photo as `columns` square blocks across the visible crop. */
    draw: (columns: number) => void;
    release: () => void;
};

function createCanvas(width: number, height: number): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    return canvas;
}

/**
 * Draws the photo onto `canvas` as square blocks, cropped exactly like the <img> (object-fit/-position).
 * The visible crop is rendered once at CSS-pixel size, then halved into a small pyramid, so every step only
 * downsamples by < 2× (no aliasing shimmer) before being scaled up with smoothing off.
 */
function createPixelator(canvas: HTMLCanvasElement, image: HTMLImageElement, wrapper: HTMLElement): Pixelator | null {
    const width = wrapper.clientWidth;
    const height = wrapper.clientHeight;
    const boxWidth = image.clientWidth;
    const boxHeight = image.clientHeight;
    const context = canvas.getContext('2d');

    if (!context || width === 0 || height === 0 || boxWidth === 0 || boxHeight === 0 || image.naturalWidth === 0) {
        return null;
    }

    const style = window.getComputedStyle(image);
    const fitted = fitImage(style.objectFit, style.objectPosition, image.naturalWidth, image.naturalHeight, boxWidth, boxHeight);

    if (!fitted) {
        return null;
    }

    const ratio = Math.min(window.devicePixelRatio || 1, MAX_DEVICE_PIXEL_RATIO);
    const dest: Rect = {
        x: (image.offsetLeft + fitted.dest.x) * ratio,
        y: (image.offsetTop + fitted.dest.y) * ratio,
        width: fitted.dest.width * ratio,
        height: fitted.dest.height * ratio,
    };

    canvas.width = Math.max(1, Math.round(width * ratio));
    canvas.height = Math.max(1, Math.round(height * ratio));

    const base = createCanvas(Math.max(1, Math.round(fitted.dest.width)), Math.max(1, Math.round(fitted.dest.height)));
    const baseContext = base.getContext('2d');

    if (!baseContext) {
        return null;
    }

    // The whole image, placed by destination coordinates only: with a srcset `w` candidate, naturalWidth is
    // density-corrected while drawImage source rectangles are in bitmap pixels, so a source crop would miss.
    const scaleX = base.width / fitted.dest.width;
    const scaleY = base.height / fitted.dest.height;

    baseContext.imageSmoothingQuality = 'high';
    baseContext.drawImage(image, fitted.render.x * scaleX, fitted.render.y * scaleY, fitted.render.width * scaleX, fitted.render.height * scaleY);

    const levels = [base];

    while (levels[levels.length - 1].width > 8 && levels[levels.length - 1].height > 8) {
        const previous = levels[levels.length - 1];
        const level = createCanvas(Math.ceil(previous.width / 2), Math.ceil(previous.height / 2));
        const levelContext = level.getContext('2d');

        if (!levelContext) {
            break;
        }

        levelContext.imageSmoothingQuality = 'high';
        levelContext.drawImage(previous, 0, 0, level.width, level.height);
        levels.push(level);
    }

    const scratch = createCanvas(1, 1);

    return {
        width,
        height,
        cropWidth: fitted.dest.width,
        draw(requestedColumns) {
            const columns = Math.max(1, Math.min(base.width, requestedColumns));
            const rows = Math.max(1, Math.round((columns * base.height) / base.width));
            let source = base;

            // Levels shrink by half: take the smallest one that still has at least one pixel per block.
            for (const level of levels) {
                if (level.width < columns || level.height < rows) {
                    break;
                }

                source = level;
            }

            let tile: HTMLCanvasElement = source;

            if (source.width !== columns || source.height !== rows) {
                scratch.width = columns;
                scratch.height = rows;

                const scratchContext = scratch.getContext('2d');

                if (scratchContext) {
                    scratchContext.imageSmoothingQuality = 'high';
                    scratchContext.drawImage(source, 0, 0, columns, rows);
                    tile = scratch;
                }
            }

            context.imageSmoothingEnabled = false;
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.drawImage(tile, 0, 0, tile.width, tile.height, dest.x, dest.y, dest.width, dest.height);
        },
        release() {
            for (const level of [...levels, scratch]) {
                level.width = 0;
                level.height = 0;
            }
        },
    };
}

/** Resolves once the image has loaded and decoded; rejects when it fails to load. */
function whenDecoded(image: HTMLImageElement): Promise<void> {
    const decode = (): Promise<void> =>
        (typeof image.decode === 'function' ? image.decode() : Promise.resolve()).catch((error: unknown) => {
            // decode() also rejects when a srcset candidate swap interrupts it; the image itself may be fine.
            if (image.naturalWidth === 0) {
                throw error;
            }
        });

    if (image.complete) {
        return image.naturalWidth > 0 ? decode() : Promise.reject(new Error('Image failed to load.'));
    }

    return new Promise<void>((resolve, reject) => {
        image.addEventListener('load', () => resolve(decode()), { once: true });
        image.addEventListener('error', () => reject(new Error('Image failed to load.')), { once: true });
    });
}

export type PixelatedImageProps = Omit<ComponentProps<'img'>, 'className' | 'loading' | 'fetchPriority' | 'decoding' | 'src' | 'alt' | 'width' | 'height'> & {
    src: string;
    /** Required: '' for decorative photos. */
    alt: string;
    /** Intrinsic size: reserves the aspect ratio when the wrapper has none of its own. */
    width: number;
    height: number;
    /** Above the fold (hero): eager load with high fetch priority, and the <img> is never hidden (it is the LCP). */
    priority?: boolean;
    /**
     * Tiny data-URI version of the photo (~8 columns wide), for `priority` photos: server-rendered over the real <img>
     * so the first paint already shows the coarse mosaic (pixelated), until the canvas takes over after hydration.
     */
    lqip?: string;
    /** Milliseconds to wait, once in view and decoded, before resolving (to stagger a row). */
    delay?: number;
    /** Change this number to play the resolve again (e.g. when a live mock-up rebuilds itself). */
    replay?: number;
    /** Called once the photo is fully shown (resolved, or at once when there is no motion / it failed to load). */
    onRevealed?: () => void;
    /** Wrapper classes: give it the frame's aspect ratio (e.g. `aspect-[4/5]`) or size it (`absolute inset-0`). */
    className?: string;
    /** <img> classes: fit/crop (default `object-cover`, centred), e.g. `object-[50%_30%]`. The canvas copies the crop. */
    imgClassName?: string;
};

/**
 * The page's signature, "pixel → sharp": a photo that resolves from an ~8-column mosaic to full resolution the first
 * time it is ≥35% in view and decoded (once), over ~1.1 s, then its canvas fades out over the real <img>.
 *
 * - SSR/no-JS render a plain, visible <img>. With JS, CSS hides the <img> (only under `.js`) and the wrapper shows its
 *   muted background, then the coarsest frame as soon as the image is decoded. `priority` photos keep the <img>
 *   visible underneath and paint the coarsest frame from the first paint via `lqip`.
 * - Photos that come into view together resolve one after another (START_SPACING_MS, plus `delay`).
 * - Reduced motion: no canvas, the image shows immediately.
 * - No layout shift: size the wrapper (aspect class) or rely on width/height.
 * - Parallax/scroll effects: transform a parent of this component (the canvas then moves with the photo).
 * - Same-origin images only. Exposes `data-pixel-block` (current block size, CSS px) while resolving.
 */
export function PixelatedImage({
    src,
    srcSet,
    sizes,
    alt,
    width,
    height,
    priority = false,
    lqip,
    delay = 0,
    replay = 0,
    onRevealed,
    className,
    imgClassName,
    ref,
    ...imageProps
}: PixelatedImageProps) {
    const wrapperRef = useRef<HTMLDivElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [revealed, setRevealed] = useState(false);
    const reduced = useReducedMotionPreference();
    const canAnimate = useCanAnimate();
    const mergedImageRef = useMemo(() => mergeRefs(imageRef, ref), [ref]);
    const onRevealedRef = useRef(onRevealed);
    const playedRef = useRef(replay);

    useEffect(() => {
        onRevealedRef.current = onRevealed;
    });

    // A new `replay` value plays the resolve again (the effect below restarts once `revealed` is false).
    useEffect(() => {
        if (playedRef.current !== replay) {
            playedRef.current = replay;
            setRevealed(false);
        }
    }, [replay]);

    useEffect(() => {
        const wrapper = wrapperRef.current;
        const image = imageRef.current;
        const canvas = canvasRef.current;

        if (revealed || !wrapper || !image || !canvas) {
            return;
        }

        if (!canAnimate()) {
            setRevealed(true);

            return;
        }

        let cancelled = false;
        let decoded = false;
        let inView = false;
        let started = false;
        let frame = 0;
        let timer = 0;
        let pixelator: Pixelator | null = null;

        const preparePixelator = (): Pixelator | null => {
            if (!pixelator || pixelator.width !== wrapper.clientWidth || pixelator.height !== wrapper.clientHeight) {
                pixelator?.release();
                pixelator = createPixelator(canvas, image, wrapper);
            }

            return pixelator;
        };

        const drawColumns = (active: Pixelator, columns: number): void => {
            active.draw(columns);
            wrapper.dataset.pixelBlock = String(Math.round(active.cropWidth / columns));
            // The canvas now covers the photo: the server-rendered mosaic (lqip) can go.
            wrapper.dataset.pixelDrawn = '';
        };

        const finish = (): void => {
            if (!cancelled) {
                wrapper.removeAttribute('data-pixel-block');
                setRevealed(true);
            }
        };

        const resolve = (): void => {
            const active = canAnimate() ? preparePixelator() : null;

            if (!active) {
                finish();

                return;
            }

            const steps = columnSteps(active.cropWidth);
            const startedAt = performance.now();
            let shown = -1;

            const tick = (now: number): void => {
                const step = stepAt(now - startedAt, steps.length);

                if (step >= steps.length) {
                    finish();

                    return;
                }

                if (step !== shown) {
                    shown = step;
                    drawColumns(active, steps[step]);
                }

                frame = window.requestAnimationFrame(tick);
            };

            frame = window.requestAnimationFrame(tick);
        };

        const start = (): void => {
            if (cancelled || started || !decoded || !inView) {
                return;
            }

            started = true;

            const startAt = reserveStart(performance.now() + delay);

            timer = window.setTimeout(resolve, Math.max(0, startAt - performance.now()));
        };

        whenDecoded(image).then(
            () => {
                if (cancelled) {
                    return;
                }

                decoded = true;

                // The coarsest frame stands in until the photo scrolls far enough into view (and its turn comes).
                const active = preparePixelator();

                if (active) {
                    drawColumns(active, columnSteps(active.cropWidth)[0]);
                }

                start();
            },
            () => finish(),
        );

        const stopObserving = observeOnce(wrapper, START_AMOUNT, () => {
            inView = true;
            start();
        });

        return () => {
            cancelled = true;
            window.cancelAnimationFrame(frame);
            window.clearTimeout(timer);
            stopObserving();
            pixelator?.release();
        };
    }, [revealed, reduced, canAnimate, src, delay]);

    useEffect(() => {
        const canvas = canvasRef.current;

        if (!revealed || !canvas) {
            return;
        }

        onRevealedRef.current?.();

        const timer = window.setTimeout(() => {
            canvas.width = 0;
            canvas.height = 0;
        }, RELEASE_AFTER_MS);

        return () => window.clearTimeout(timer);
    }, [revealed]);

    return (
        <div
            ref={wrapperRef}
            data-pixelate=""
            data-pixel-priority={priority ? '' : undefined}
            data-revealed={revealed ? '' : undefined}
            className={cn('relative overflow-hidden bg-muted', className)}
        >
            <img
                ref={mergedImageRef}
                src={src}
                srcSet={srcSet}
                sizes={sizes}
                alt={alt}
                width={width}
                height={height}
                loading={priority ? 'eager' : 'lazy'}
                fetchPriority={priority ? 'high' : undefined}
                decoding="async"
                className={cn('block size-full object-cover', imgClassName)}
                {...imageProps}
            />
            {lqip && (
                <img
                    data-pixel-lqip=""
                    src={lqip}
                    alt=""
                    aria-hidden="true"
                    className={cn('pointer-events-none absolute inset-0 size-full object-cover [image-rendering:pixelated]', imgClassName)}
                />
            )}
            <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none absolute inset-0 size-full" />
        </div>
    );
}
