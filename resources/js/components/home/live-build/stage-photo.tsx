import { photo, type PhotoName } from '@/lib/photos';
import { cn } from '@/lib/utils';
import { clamp01, easeOut } from './timeline';

type StagePhotoProps = {
    /** Key in PHOTO_REVEALS: when the clock fades this photo in. */
    name: string;
    photo: PhotoName;
    sizes: string;
    /** CSS object-position of the crop. */
    position?: string;
    /** Phone mock-up photos are below the fold on small screens and never fade in: load them lazily. */
    lazy?: boolean;
    className?: string;
};

/**
 * A photo slot of the mock site. The static frame (SSR, no JS, reduced motion) is a plain <img>; while the stage plays,
 * the clock hides it until its reveal, then fades it in over the muted slot.
 */
export function StagePhoto({ name, photo: photoName, sizes, position = '50% 50%', lazy = false, className }: StagePhotoProps) {
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
        </span>
    );
}

export type PhotoReveal = {
    /** Render the slot for loop time `t`. */
    render: (t: number) => void;
    /** Back to the static frame (inline styles removed). */
    reset: () => void;
};

/**
 * Drives one StagePhoto from the clock: hidden before `at` (the wireframe shows), then the muted slot appears and the
 * photo fades in over it for `duration`. Writes only when a value changes.
 */
export function createPhotoReveal(slot: HTMLElement, at: number, duration: number): PhotoReveal {
    const image = slot.querySelector('img');
    const written = new Map<HTMLElement, string>();

    const setOpacity = (element: HTMLElement, value: number): void => {
        const text = String(Math.round(value * 1000) / 1000);

        if (written.get(element) !== text) {
            written.set(element, text);
            element.style.opacity = text;
        }
    };

    return {
        render(t) {
            if (!image) {
                return;
            }

            setOpacity(slot, t < at ? 0 : 1);
            setOpacity(image, easeOut(clamp01((t - at) / duration)));
        },
        reset() {
            for (const element of written.keys()) {
                element.style.removeProperty('opacity');
            }

            written.clear();
        },
    };
}
