import { photo, type PhotoName } from '@/lib/photos';
import { cn } from '@/lib/utils';
import { clamp01 } from './timeline';

type PixelPhotoProps = {
    /** Key in PHOTO_REVEALS: when the clock resolves this photo. */
    name: string;
    photo: PhotoName;
    sizes: string;
    /** CSS object-position of the crop (the mosaic copies it). */
    position?: string;
    /** Phone mock-up photos are below the fold on small screens and never resolve: load them lazily. */
    lazy?: boolean;
    className?: string;
};

/**
 * A photo slot of the mock site. The static frame (SSR, no JS, reduced motion) is a plain <img>; while the stage plays,
 * the clock hides it until its reveal, then resolves it pixel → sharp on the canvas (the page's signature, as in
 * PixelatedImage) and hands over to the <img>.
 */
export function PixelPhoto({ name, photo: photoName, sizes, position = '50% 50%', lazy = false, className }: PixelPhotoProps) {
    const { src, srcSet, width, height } = photo(photoName);

    return (
        <span data-lb-photo={name} data-lb-in="" className={cn('relative block overflow-hidden bg-muted', className)}>
            <img
                src={src}
                srcSet={srcSet}
                sizes={sizes}
                width={width}
                height={height}
                alt=""
                loading={lazy ? 'lazy' : 'eager'}
                decoding="async"
                draggable={false}
                style={{ objectPosition: position }}
                className="absolute inset-0 block size-full object-cover"
            />
            <canvas className="pointer-events-none absolute inset-0 size-full opacity-0" />
        </span>
    );
}

/** Mosaic columns per step (relative to the slot width, so every slot opens on the same coarse mosaic). */
const COLUMN_STEPS = [6, 9, 14, 22, 34, 54, 86] as const;
const MIN_BLOCK_PX = 2;
const MAX_DEVICE_PIXEL_RATIO = 2;
/** The canvas fades over the sharp <img> at the end. */
const HANDOVER_S = 0.15;

type Pixelator = { width: number; height: number; steps: number[]; draw: (columns: number) => void; release: () => void };

function createCanvas(width: number, height: number): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    return canvas;
}

/** Fraction (0–1) of an object-position component; keywords and percentages only (what the slots use). */
function positionFraction(token: string | undefined): number {
    if (token === 'left' || token === 'top') {
        return 0;
    }

    if (token === 'right' || token === 'bottom') {
        return 1;
    }

    return token?.endsWith('%') ? parseFloat(token) / 100 : 0.5;
}

/**
 * Draws the photo as square blocks, cropped like the <img> (object-fit: cover + its object-position). The crop is drawn
 * once at CSS-pixel size and halved into a small pyramid, so each step downsamples by < 2× before the blocks are scaled
 * up with smoothing off.
 */
function createPixelator(canvas: HTMLCanvasElement, image: HTMLImageElement, slot: HTMLElement): Pixelator | null {
    const width = slot.clientWidth;
    const height = slot.clientHeight;
    const context = canvas.getContext('2d');

    if (!context || width === 0 || height === 0 || image.naturalWidth === 0) {
        return null;
    }

    const ratio = Math.min(window.devicePixelRatio || 1, MAX_DEVICE_PIXEL_RATIO);
    canvas.width = Math.max(1, Math.round(width * ratio));
    canvas.height = Math.max(1, Math.round(height * ratio));

    const base = createCanvas(Math.max(1, Math.round(width)), Math.max(1, Math.round(height)));
    const baseContext = base.getContext('2d');

    if (!baseContext) {
        return null;
    }

    // Cover crop by destination coordinates only (with srcset, naturalWidth is density-corrected; aspect is what counts).
    const scale = Math.max(base.width / image.naturalWidth, base.height / image.naturalHeight);
    const renderWidth = image.naturalWidth * scale;
    const renderHeight = image.naturalHeight * scale;
    const [x, y] = (image.style.objectPosition || '50% 50%').trim().split(/\s+/);

    baseContext.imageSmoothingQuality = 'high';
    baseContext.drawImage(
        image,
        (base.width - renderWidth) * positionFraction(x),
        (base.height - renderHeight) * positionFraction(y),
        renderWidth,
        renderHeight,
    );

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
    const steps = COLUMN_STEPS.filter((columns) => width / columns >= MIN_BLOCK_PX);

    return {
        width,
        height,
        steps: steps.length > 0 ? steps : [COLUMN_STEPS[0]],
        draw(requestedColumns) {
            const columns = Math.max(1, Math.min(base.width, requestedColumns));
            const rows = Math.max(1, Math.round((columns * base.height) / base.width));
            let source = base;

            for (const level of levels) {
                if (level.width < columns || level.height < rows) {
                    break;
                }

                source = level;
            }

            scratch.width = columns;
            scratch.height = rows;

            const scratchContext = scratch.getContext('2d');

            if (!scratchContext) {
                return;
            }

            scratchContext.imageSmoothingQuality = 'high';
            scratchContext.drawImage(source, 0, 0, columns, rows);
            context.imageSmoothingEnabled = false;
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.drawImage(scratch, 0, 0, columns, rows, 0, 0, canvas.width, canvas.height);
        },
        release() {
            for (const level of [...levels, scratch]) {
                level.width = 0;
                level.height = 0;
            }
        },
    };
}

/** Step shown `fraction` (0–1) of the way through the reveal: ease-out, so coarse steps flash by and fine ones linger. */
function stepAt(fraction: number, count: number): number {
    const eased = 1 - (1 - clamp01(fraction)) ** 2;

    return Math.min(count - 1, Math.floor(eased * count));
}

export type PhotoReveal = {
    /** Render the slot for loop time `t`. */
    render: (t: number) => void;
    /** Back to the static frame (inline styles removed, canvas released). */
    reset: () => void;
};

/**
 * Drives one PixelPhoto from the clock: hidden before `at` (the wireframe shows), mosaic → sharp over `duration`,
 * then the canvas fades over the real <img>. Draws only when the step changes. A photo that has not decoded by its
 * turn shows the muted slot until it has, then joins the reveal where it stands.
 */
export function createPhotoReveal(slot: HTMLElement, at: number, duration: number): PhotoReveal {
    const image = slot.querySelector('img');
    const canvas = slot.querySelector('canvas');
    let decoded = false;
    let pixelator: Pixelator | null = null;
    /** The slot was resized (the stage scales with the viewport): rebuild the mosaic on its next draw. */
    let stale = true;
    let shown = -1;
    const written = new Map<HTMLElement, string>();
    const resizeObserver = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(() => (stale = true));

    resizeObserver?.observe(slot);

    const setOpacity = (element: HTMLElement, value: number): void => {
        const text = String(Math.round(value * 1000) / 1000);

        if (written.get(element) !== text) {
            written.set(element, text);
            element.style.opacity = text;
        }
    };

    if (image) {
        // Decode off the main thread before the first draw (drawImage would otherwise decode synchronously).
        const markDecoded = (): void => {
            (typeof image.decode === 'function' ? image.decode() : Promise.resolve())
                .catch(() => undefined)
                .then(() => (decoded = image.naturalWidth > 0));
        };

        if (image.complete) {
            markDecoded();
        } else {
            image.addEventListener('load', markDecoded, { once: true });
        }
    }

    const prepare = (): Pixelator | null => {
        if (!image || !canvas) {
            return null;
        }

        if (!pixelator || stale) {
            stale = false;
            pixelator?.release();
            pixelator = createPixelator(canvas, image, slot);
            shown = -1;
        }

        return pixelator;
    };

    return {
        render(t) {
            if (!image || !canvas) {
                return;
            }

            if (t < at) {
                setOpacity(slot, 0);
                shown = -1;

                return;
            }

            setOpacity(slot, 1);

            const elapsed = t - at;

            if (!decoded) {
                setOpacity(image, 0);
                setOpacity(canvas, 0);

                return;
            }

            if (elapsed >= duration) {
                setOpacity(image, 1);
                setOpacity(canvas, 1 - clamp01((elapsed - duration) / HANDOVER_S));

                return;
            }

            const active = prepare();

            if (!active) {
                setOpacity(image, 1);
                setOpacity(canvas, 0);

                return;
            }

            const step = stepAt(elapsed / duration, active.steps.length);

            if (step !== shown) {
                shown = step;
                active.draw(active.steps[step]);
            }

            setOpacity(image, 0);
            setOpacity(canvas, 1);
        },
        reset() {
            for (const element of written.keys()) {
                element.style.removeProperty('opacity');
            }

            written.clear();
            resizeObserver?.disconnect();
            pixelator?.release();
            pixelator = null;
            shown = -1;

            if (canvas) {
                canvas.width = 0;
                canvas.height = 0;
            }
        },
    };
}
