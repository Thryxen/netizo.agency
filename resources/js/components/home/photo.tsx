import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export type PhotoProps = Omit<ComponentProps<'img'>, 'className' | 'loading' | 'decoding' | 'src' | 'alt' | 'width' | 'height'> & {
    src: string;
    /** Required: '' for decorative photos. */
    alt: string;
    /** Intrinsic size: reserves the aspect ratio when the wrapper has none of its own. */
    width: number;
    height: number;
    /** Wrapper classes: give it the frame's aspect ratio (e.g. `aspect-[4/5]`) or size it (`absolute inset-0`). */
    className?: string;
    /** <img> classes: fit/crop (default `object-cover`, centred), e.g. `object-[50%_30%]`. */
    imgClassName?: string;
};

/**
 * A photo in a clipping frame: the wrapper takes the size (`className`), the lazily loaded <img> covers it, and the
 * muted background shows until it has loaded. Parallax/scroll effects: transform a parent of this component.
 */
export function Photo({ src, alt, width, height, className, imgClassName, ...imageProps }: PhotoProps) {
    return (
        <div data-photo-frame="" className={cn('relative overflow-hidden bg-muted', className)}>
            <img
                src={src}
                alt={alt}
                width={width}
                height={height}
                loading="lazy"
                decoding="async"
                className={cn('block size-full object-cover', imgClassName)}
                {...imageProps}
            />
        </div>
    );
}
