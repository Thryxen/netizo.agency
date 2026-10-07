import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { observeOnce, useCanAnimate, useReducedMotionPreference } from './motion-env';

/** First view: the page's pixel → sharp signature, as columns across the box (the same steps as PixelatedImage). */
const REVEAL_COLUMNS = [8, 12, 20, 32, 52, 90, 160] as const;
const REVEAL_MS = 1100;
/** A swap, sharp side first: the shown photo breaks up into these, the blocks flip, then the next one resolves back. */
const SWAP_COLUMNS = [96, 48, 28, 18, 12] as const;
const OUT_MS = 200;
const DISSOLVE_MS = 200;
const IN_MS = 360;
/** Steps whose blocks would be smaller than this (CSS px) are skipped. */
const MIN_BLOCK_PX = 2;
/** The photo is drawn once at this width (≥ the finest step), then halved into a pyramid for clean mosaics. */
const SHEET_WIDTH = 256;
const MAX_DEVICE_PIXEL_RATIO = 2;
/** The first reveal waits until the box is this visible. */
const START_AMOUNT = 0.35;
/** Release the canvas once its fade-out (150 ms) is over. */
const RELEASE_AFTER_MS = 400;

/**
 * Scoped styles (app.css is shared): images not shown are transparent, the canvas covers them only while it animates
 * (then fades out over 150 ms), and with JS + motion the box waits on its muted background (then the coarsest mosaic)
 * until the first reveal. No JS, or reduced motion: no canvas, the shown image only. Dark mode: the photo balance.
 */
const CROSSFADE_CSS = `
[data-pixel-crossfade] > img:not([data-shown]) { opacity: 0; }
[data-pixel-crossfade] > canvas { opacity: 0; transition: opacity 150ms linear; }
[data-pixel-crossfade][data-busy] > canvas { opacity: 1; transition: none; }
@media screen and (prefers-reduced-motion: no-preference) {
    .js [data-pixel-crossfade]:not([data-revealed]) > img { opacity: 0; }
}
html:not(.js) [data-pixel-crossfade] > canvas { display: none; }
@media (prefers-reduced-motion: reduce) {
    [data-pixel-crossfade] > canvas { display: none; }
}
.dark [data-pixel-crossfade][data-photo-balance] > :is(img, canvas) { filter: brightness(0.88) contrast(1.04); }
`;

export type PixelCrossfadeImage = {
    src: string;
    srcSet?: string;
    /** Intrinsic size (reserves nothing here: size the box with `className`). */
    width: number;
    height: number;
    /** Set by photo(): marks a photo (not a screenshot) for the dark-theme photo balance. */
    'data-photo'?: '';
};

export type PixelCrossfadeProps = {
    images: PixelCrossfadeImage[];
    /** The image shown. Changing it plays the transition from the current one. */
    index: number;
    sizes?: string;
    /** Box classes: size it (aspect ratio or `absolute inset-0`). */
    className?: string;
    /** <img> classes: crop with `object-position` (fit is always cover); the canvas copies the crop. */
    imgClassName?: string;
};

/**
 * A stack of photos (decorative, alt="") in one box that switches between them in the page's pixel language: the
 * shown photo breaks up into square blocks (~200 ms), the blocks flip to the next photo in a dithered diagonal sweep
 * (~200 ms; backwards when the index goes down), and the next photo resolves back to sharp (~360 ms), then the canvas
 * fades over the real <img>. The first time the box is ≥35% in view, the shown photo resolves like a PixelatedImage.
 *
 * - SSR/no-JS: plain <img> elements, only the one at `index` visible (the canvas is never shown).
 * - Reduced motion, a hidden tab or an offscreen box: the photo swaps instantly.
 * - Index changes mid-transition retarget it (no queue of transitions when scrolling fast).
 * - Images must cover the box (object-fit: cover, any object-position) and be same-origin.
 * - Drawing works on a small mosaic (≤256 px wide) scaled up with smoothing off, so a frame costs one drawImage.
 */
export function PixelCrossfade({ images, index, sizes, className, imgClassName }: PixelCrossfadeProps) {
    const wrapperRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const engineRef = useRef<CrossfadeEngine | null>(null);
    const indexRef = useRef(index);
    // The server-rendered image keeps its `data-shown` from React; after hydration the engine owns the attribute.
    const [initialIndex] = useState(index);
    const canAnimate = useCanAnimate();
    const reduced = useReducedMotionPreference();
    const photoBalance = images.some((image) => image['data-photo'] !== undefined);
    // The engine reads the <img> elements once: a different set of photos gets a new engine.
    const imagesKey = images.map((image) => image.src).join('|');

    useEffect(() => {
        const wrapper = wrapperRef.current;
        const canvas = canvasRef.current;

        if (!wrapper || !canvas) {
            return;
        }

        const engine = createEngine(wrapper, canvas, canAnimate);
        engineRef.current = engine;
        engine.setIndex(indexRef.current);

        return () => {
            engine.destroy();
            engineRef.current = null;
        };
    }, [canAnimate, reduced, imagesKey]);

    useEffect(() => {
        indexRef.current = index;
        engineRef.current?.setIndex(index);
    }, [index]);

    return (
        <div
            ref={wrapperRef}
            data-pixel-crossfade=""
            data-photo-balance={photoBalance ? '' : undefined}
            className={cn('relative overflow-hidden bg-muted', className)}
        >
            <style>{CROSSFADE_CSS}</style>
            {images.map((image, imageIndex) => (
                <img
                    key={image.src}
                    src={image.src}
                    srcSet={image.srcSet}
                    sizes={sizes}
                    width={image.width}
                    height={image.height}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    data-shown={imageIndex === initialIndex ? '' : undefined}
                    className={cn('absolute inset-0 block size-full object-cover', imgClassName)}
                />
            ))}
            <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none absolute inset-0 size-full" />
        </div>
    );
}

type CrossfadeEngine = {
    setIndex: (index: number) => void;
    destroy: () => void;
};

type Phase = 'idle' | 'reveal' | 'out' | 'dissolve' | 'in';

type Sheet = { key: string; levels: HTMLCanvasElement[] };

function createCanvas(width: number, height: number): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    return canvas;
}

/** One `object-position` component (%, px or keyword, as computed) against the free space along its axis. */
function resolvePosition(token: string | undefined, free: number): number {
    if (token === undefined) {
        return free / 2;
    }

    if (token.endsWith('%')) {
        return (free * parseFloat(token)) / 100;
    }

    if (token.endsWith('px')) {
        return parseFloat(token);
    }

    return { left: 0, top: 0, right: free, bottom: free }[token] ?? free / 2;
}

/** Where `object-fit: cover` puts the image inside a box of this size (it overhangs the box where cropped). */
function coverRect(image: HTMLImageElement, boxWidth: number, boxHeight: number): { x: number; y: number; width: number; height: number } | null {
    if (image.naturalWidth === 0 || image.naturalHeight === 0) {
        return null;
    }

    const scale = Math.max(boxWidth / image.naturalWidth, boxHeight / image.naturalHeight);
    const width = image.naturalWidth * scale;
    const height = image.naturalHeight * scale;
    const [x, y] = window.getComputedStyle(image).objectPosition.trim().split(/\s+/);

    return { x: resolvePosition(x, boxWidth - width), y: resolvePosition(y, boxHeight - height), width, height };
}

/**
 * The visible crop of `image`, drawn once at ≤ SHEET_WIDTH px wide, plus halvings down to ~8 px: any mosaic is then
 * one small downsample (< 2×) from the nearest level, so coarse steps average the photo instead of aliasing.
 * Destination coordinates only: with a srcset `w` candidate, naturalWidth is density-corrected.
 */
function buildSheet(image: HTMLImageElement, boxWidth: number, boxHeight: number): HTMLCanvasElement[] | null {
    const rect = coverRect(image, boxWidth, boxHeight);

    if (!rect) {
        return null;
    }

    const scale = Math.min(SHEET_WIDTH, Math.round(boxWidth)) / boxWidth;
    const base = createCanvas(Math.max(1, Math.round(boxWidth * scale)), Math.max(1, Math.round(boxHeight * scale)));
    const baseContext = base.getContext('2d');

    if (!baseContext) {
        return null;
    }

    baseContext.imageSmoothingQuality = 'high';
    baseContext.drawImage(image, rect.x * scale, rect.y * scale, rect.width * scale, rect.height * scale);

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

    return levels;
}

/** Downsample a sheet into `target` as a `columns` × `rows` mosaic (one pixel per block). */
function paintMosaic(levels: HTMLCanvasElement[], columns: number, rows: number, target: HTMLCanvasElement): CanvasRenderingContext2D | null {
    let source = levels[0];

    for (const level of levels) {
        if (level.width < columns || level.height < rows) {
            break;
        }

        source = level;
    }

    if (target.width !== columns || target.height !== rows) {
        target.width = columns;
        target.height = rows;
    }

    const context = target.getContext('2d', { willReadFrequently: true });

    if (!context) {
        return null;
    }

    context.imageSmoothingQuality = 'high';
    context.drawImage(source, 0, 0, columns, rows);

    return context;
}

/**
 * When each block flips during the dissolve (0–1): a diagonal sweep from the top left (bottom right when going back),
 * dithered with a fixed hash so it reads as bits flipping rather than a wipe.
 */
function flipSchedule(columns: number, rows: number, forward: boolean): Float32Array {
    const schedule = new Float32Array(columns * rows);

    for (let row = 0; row < rows; row++) {
        for (let column = 0; column < columns; column++) {
            const diagonal = (column / Math.max(1, columns - 1) + row / Math.max(1, rows - 1)) / 2;
            const noise = Math.abs(Math.sin(column * 12.9898 + row * 78.233) * 43758.5453) % 1;

            schedule[row * columns + column] = (forward ? diagonal : 1 - diagonal) * 0.62 + noise * 0.38;
        }
    }

    return schedule;
}

/** Ease-out over the steps: the first ones flash by, the last ones linger. Returns the step shown at `progress`. */
function easedStep(progress: number, count: number): number {
    const eased = 1 - (1 - Math.min(1, Math.max(0, progress))) ** 2;

    return Math.min(count - 1, Math.floor(eased * count));
}

/** Even steps. Returns the step shown at `progress`. */
function linearStep(progress: number, count: number): number {
    return Math.min(count - 1, Math.max(0, Math.floor(progress * count)));
}

/** Resolves once the image has loaded and decoded; rejects when it fails to load. */
function whenDecoded(image: HTMLImageElement): Promise<void> {
    const decode = (): Promise<void> =>
        (typeof image.decode === 'function' ? image.decode() : Promise.resolve()).catch((error: unknown) => {
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

/**
 * The imperative side: owns `data-shown` on the images, `data-busy`/`data-revealed` on the box and the canvas, and
 * one requestAnimationFrame loop that only runs while something animates.
 */
function createEngine(wrapper: HTMLDivElement, canvas: HTMLCanvasElement, canAnimate: () => boolean): CrossfadeEngine {
    const images = Array.from(wrapper.querySelectorAll<HTMLImageElement>(':scope > img'));
    const context = canvas.getContext('2d');
    const decoded = images.map(() => false);
    const failed = images.map(() => false);
    const sheets = new Map<number, Sheet>();
    const mosaicFrom = createCanvas(1, 1);
    const mosaicTo = createCanvas(1, 1);
    const mixCanvas = createCanvas(1, 1);
    const animated = canAnimate();

    let shown = Math.max(0, images.findIndex((image) => image.hasAttribute('data-shown')));
    let target = shown;
    let revealed = !animated || wrapper.hasAttribute('data-revealed');
    let revealRequested = false;
    let inView = false;
    let destroyed = false;
    let frame = 0;
    let releaseTimer = 0;
    let phase: Phase = 'idle';
    let from = shown;
    let to = shown;
    let phaseStart = 0;
    let drawnKey = '';
    let mix: { from: Uint8ClampedArray; to: Uint8ClampedArray; out: ImageData; schedule: Float32Array; columns: number; rows: number } | null = null;

    wrapper.removeAttribute('data-busy');

    if (revealed) {
        wrapper.setAttribute('data-revealed', '');
    }

    const show = (next: number): void => {
        shown = next;
        images.forEach((image, imageIndex) => image.toggleAttribute('data-shown', imageIndex === next));
    };

    const setBusy = (busy: boolean): void => {
        wrapper.toggleAttribute('data-busy', busy);
    };

    // Box size in CSS px, kept by a ResizeObserver so animation frames never read layout.
    let box = { width: wrapper.clientWidth, height: wrapper.clientHeight };
    const resizing =
        typeof ResizeObserver === 'undefined'
            ? null
            : new ResizeObserver(() => {
                  box = { width: wrapper.clientWidth, height: wrapper.clientHeight };
              });
    resizing?.observe(wrapper);

    /** Box size in CSS px, with the canvas backing store matched to it; null while the box is not rendered. */
    const measure = (): { width: number; height: number } | null => {
        if (resizing === null) {
            box = { width: wrapper.clientWidth, height: wrapper.clientHeight };
        }

        const { width, height } = box;

        if (width === 0 || height === 0 || !context) {
            return null;
        }

        const ratio = Math.min(window.devicePixelRatio || 1, MAX_DEVICE_PIXEL_RATIO);
        const canvasWidth = Math.max(1, Math.round(width * ratio));
        const canvasHeight = Math.max(1, Math.round(height * ratio));

        if (canvas.width !== canvasWidth || canvas.height !== canvasHeight) {
            canvas.width = canvasWidth;
            canvas.height = canvasHeight;
            drawnKey = '';
        }

        return { width, height };
    };

    const sheetFor = (imageIndex: number, width: number, height: number): HTMLCanvasElement[] | null => {
        const image = images[imageIndex];
        const key = `${width}x${height}:${image.currentSrc}`;
        const cached = sheets.get(imageIndex);

        if (cached?.key === key) {
            return cached.levels;
        }

        const levels = buildSheet(image, width, height);

        if (levels) {
            sheets.set(imageIndex, { key, levels });
        }

        return levels;
    };

    const stepsFor = (list: readonly number[], width: number): number[] => {
        const steps = list.filter((columns) => width / columns >= MIN_BLOCK_PX);

        return steps.length > 0 ? steps : [list[list.length - 1]];
    };

    const rowsFor = (columns: number, width: number, height: number): number => Math.max(1, Math.round((columns * height) / width));

    const blit = (source: HTMLCanvasElement, columns: number, rows: number): void => {
        if (!context) {
            return;
        }

        context.imageSmoothingEnabled = false;
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(source, 0, 0, columns, rows, 0, 0, canvas.width, canvas.height);
    };

    /** One photo as a `columns`-wide mosaic. Skips the draw when that exact frame is already on the canvas. */
    const drawMosaic = (imageIndex: number, columns: number): boolean => {
        const size = measure();
        const levels = size ? sheetFor(imageIndex, size.width, size.height) : null;

        if (!size || !levels) {
            return false;
        }

        const key = `${imageIndex}:${columns}`;

        if (key !== drawnKey) {
            const rows = rowsFor(columns, size.width, size.height);

            if (paintMosaic(levels, columns, rows, mosaicFrom)) {
                blit(mosaicFrom, columns, rows);
                drawnKey = key;
            }
        }

        return true;
    };

    /** Both photos at the coarsest step, each block showing `to` once the dissolve passes its flip time. */
    const drawDissolve = (progress: number): void => {
        const size = measure();

        if (!size) {
            return;
        }

        const swapSteps = stepsFor(SWAP_COLUMNS, size.width);
        const columns = swapSteps[swapSteps.length - 1];
        const rows = rowsFor(columns, size.width, size.height);

        if (!mix || mix.columns !== columns || mix.rows !== rows) {
            const fromLevels = sheetFor(from, size.width, size.height);
            const toLevels = sheetFor(to, size.width, size.height);
            const fromContext = fromLevels ? paintMosaic(fromLevels, columns, rows, mosaicFrom) : null;
            const toContext = toLevels ? paintMosaic(toLevels, columns, rows, mosaicTo) : null;

            if (!fromContext || !toContext) {
                return;
            }

            mix = {
                from: fromContext.getImageData(0, 0, columns, rows).data,
                to: toContext.getImageData(0, 0, columns, rows).data,
                out: new ImageData(columns, rows),
                schedule: flipSchedule(columns, rows, to > from),
                columns,
                rows,
            };
        }

        const { schedule, out } = mix;

        for (let block = 0; block < schedule.length; block++) {
            const source = progress >= schedule[block] ? mix.to : mix.from;
            const offset = block * 4;

            out.data[offset] = source[offset];
            out.data[offset + 1] = source[offset + 1];
            out.data[offset + 2] = source[offset + 2];
            out.data[offset + 3] = source[offset + 3];
        }

        if (mixCanvas.width !== columns || mixCanvas.height !== rows) {
            mixCanvas.width = columns;
            mixCanvas.height = rows;
        }

        mixCanvas.getContext('2d')?.putImageData(out, 0, 0);
        blit(mixCanvas, columns, rows);
        drawnKey = '';
    };

    const schedule = (): void => {
        if (frame === 0 && !destroyed) {
            frame = window.requestAnimationFrame(tick);
        }
    };

    /** Back to rest: the canvas fades out (150 ms), then its backing store is released until the next transition. */
    const settle = (): void => {
        phase = 'idle';
        setBusy(false);
        window.clearTimeout(releaseTimer);
        releaseTimer = window.setTimeout(() => {
            if (phase === 'idle' && revealed) {
                canvas.width = 0;
                canvas.height = 0;
                drawnKey = '';
            }
        }, RELEASE_AFTER_MS);
    };

    /** Start a transition from the shown photo to `target`, or swap at once when nobody would see it animate. */
    const begin = (): void => {
        if (target === shown) {
            settle();

            return;
        }

        const visible = inView && document.visibilityState === 'visible' && measure() !== null;

        if (!canAnimate() || !visible || !decoded[shown] || failed[target]) {
            show(target);
            settle();

            return;
        }

        from = shown;
        to = target;
        mix = null;
        phase = 'out';
        phaseStart = performance.now();
        setBusy(true);
        schedule();
    };

    const tick = (now: number): void => {
        frame = 0;

        const size = measure();

        if (!size) {
            show(target);
            revealed = true;
            wrapper.setAttribute('data-revealed', '');
            settle();

            return;
        }

        const elapsed = now - phaseStart;
        const swapSteps = stepsFor(SWAP_COLUMNS, size.width);

        if (phase === 'reveal') {
            const revealSteps = stepsFor(REVEAL_COLUMNS, size.width);

            if (elapsed >= REVEAL_MS) {
                revealed = true;
                wrapper.setAttribute('data-revealed', '');
                begin();
                warm();

                return;
            }

            drawMosaic(shown, revealSteps[easedStep(elapsed / REVEAL_MS, revealSteps.length)]);
        } else if (phase === 'out') {
            const progress = elapsed / OUT_MS;

            if (progress >= 1 && (to === from || decoded[to] || failed[to])) {
                if (to === from || failed[to]) {
                    show(to);
                    phase = 'in';
                } else {
                    show(to);
                    mix = null;
                    phase = 'dissolve';
                }

                phaseStart = now;
                schedule();

                return;
            }

            // Even steps down to the coarsest, which holds while the next photo is still decoding.
            drawMosaic(from, swapSteps[linearStep(progress, swapSteps.length)]);
        } else if (phase === 'dissolve') {
            const progress = elapsed / DISSOLVE_MS;

            if (progress >= 1) {
                phase = 'in';
                phaseStart = now;
                schedule();

                return;
            }

            drawDissolve(progress);
        } else if (phase === 'in') {
            const progress = elapsed / IN_MS;

            if (progress >= 1) {
                begin();

                return;
            }

            const inSteps = [...swapSteps].reverse();

            drawMosaic(to, inSteps[easedStep(progress, inSteps.length)]);
        }

        if (phase !== 'idle') {
            schedule();
        }
    };

    /** The first reveal: once in view (START_AMOUNT) and the shown photo is decoded. */
    const reveal = (): void => {
        if (revealed || phase !== 'idle' || !revealRequested || !decoded[shown]) {
            return;
        }

        if (!canAnimate() || measure() === null) {
            revealed = true;
            wrapper.setAttribute('data-revealed', '');

            return;
        }

        phase = 'reveal';
        phaseStart = performance.now();
        setBusy(true);
        schedule();
    };

    /** Before the reveal, the coarsest mosaic stands in for the photo (the box shows its muted background until then). */
    const drawWaitingFrame = (): void => {
        if (revealed || phase !== 'idle' || !decoded[shown]) {
            return;
        }

        const size = measure();

        if (size && drawMosaic(shown, stepsFor(REVEAL_COLUMNS, size.width)[0])) {
            setBusy(true);
        }
    };

    let warmHandle = 0;
    const idleSupported = typeof window.requestIdleCallback === 'function';

    /** Build the decoded photos' sheets in idle time, one per idle period, so a transition never starts on that work. */
    const warm = (): void => {
        if (destroyed || !animated || !revealed || warmHandle !== 0) {
            return;
        }

        const work = (): void => {
            warmHandle = 0;

            const { width, height } = box;
            const pending = images.findIndex((image, imageIndex) => decoded[imageIndex] && sheets.get(imageIndex)?.key !== `${width}x${height}:${image.currentSrc}`);

            if (destroyed || pending === -1 || width === 0 || height === 0) {
                return;
            }

            sheetFor(pending, width, height);
            warm();
        };

        warmHandle = idleSupported ? window.requestIdleCallback(work, { timeout: 2000 }) : window.setTimeout(work, 200);
    };

    images.forEach((image, imageIndex) => {
        whenDecoded(image).then(
            () => {
                if (destroyed) {
                    return;
                }

                decoded[imageIndex] = true;
                warm();

                if (imageIndex === shown) {
                    drawWaitingFrame();
                    reveal();
                }
            },
            () => {
                failed[imageIndex] = true;

                if (!destroyed && imageIndex === shown && !revealed) {
                    revealed = true;
                    wrapper.setAttribute('data-revealed', '');
                    setBusy(false);
                }
            },
        );
    });

    const visibility = typeof IntersectionObserver === 'undefined' ? null : new IntersectionObserver(([entry]) => (inView = entry.isIntersecting));
    visibility?.observe(wrapper);

    if (visibility === null) {
        inView = true;
    }

    const stopRevealObserver = revealed
        ? () => {}
        : observeOnce(wrapper, START_AMOUNT, () => {
              revealRequested = true;
              reveal();
          });

    return {
        setIndex(index) {
            if (index < 0 || index >= images.length) {
                return;
            }

            target = index;

            if (!revealed) {
                // The reveal plays whichever photo is current; a change while it plays follows once it ends.
                if (phase !== 'reveal' && index !== shown) {
                    show(index);
                    drawnKey = '';
                    drawWaitingFrame();
                    reveal();
                }

                return;
            }

            if (phase === 'idle') {
                begin();
            } else if (phase === 'out') {
                to = target;
                mix = null;
            } else if (phase === 'dissolve') {
                if (target !== to) {
                    to = target;
                    mix = null;
                    show(to);
                }
            } else if (phase === 'in' && target !== to) {
                // Break the photo that is resolving straight back up from its current block size.
                const size = measure();
                const swapSteps = size ? stepsFor(SWAP_COLUMNS, size.width) : [...SWAP_COLUMNS];
                const inSteps = [...swapSteps].reverse();
                const current = inSteps[easedStep((performance.now() - phaseStart) / IN_MS, inSteps.length)];
                const outStep = Math.max(0, swapSteps.indexOf(current));
                // Where the (linear) out phase shows that step.
                const progress = outStep / swapSteps.length;

                from = to;
                to = target;
                mix = null;
                phase = 'out';
                phaseStart = performance.now() - progress * OUT_MS;
            }
        },
        destroy() {
            destroyed = true;
            window.cancelAnimationFrame(frame);
            window.clearTimeout(releaseTimer);
            frame = 0;

            if (idleSupported) {
                window.cancelIdleCallback(warmHandle);
            } else {
                window.clearTimeout(warmHandle);
            }

            visibility?.disconnect();
            resizing?.disconnect();
            stopRevealObserver();

            for (const sheet of sheets.values()) {
                for (const level of sheet.levels) {
                    level.width = 0;
                    level.height = 0;
                }
            }

            sheets.clear();

            for (const scratch of [mosaicFrom, mosaicTo, mixCanvas]) {
                scratch.width = 0;
                scratch.height = 0;
            }
        },
    };
}
