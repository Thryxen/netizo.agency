import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

/**
 * A single square "bit". Squares mark structure (markers, bullets, steps) — never decoration for its own sake.
 */
export const pixelVariants = cva('inline-block shrink-0 rounded-none align-middle', {
    variants: {
        size: {
            xs: 'size-1',
            sm: 'size-1.5',
            md: 'size-2',
            lg: 'size-3',
            xl: 'size-4',
        },
        tone: {
            foreground: 'bg-foreground',
            muted: 'bg-muted-foreground',
            border: 'bg-border',
            primary: 'bg-primary',
            background: 'bg-background',
            outline: 'border border-foreground bg-transparent',
        },
    },
    defaultVariants: {
        size: 'sm',
        tone: 'foreground',
    },
});

export type PixelProps = ComponentProps<'span'> & VariantProps<typeof pixelVariants>;

export function Pixel({ size, tone, className, 'aria-hidden': ariaHidden = true, ...props }: PixelProps) {
    return <span data-slot="pixel" aria-hidden={ariaHidden} className={cn(pixelVariants({ size, tone }), className)} {...props} />;
}
