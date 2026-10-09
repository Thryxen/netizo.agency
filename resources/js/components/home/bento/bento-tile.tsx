import type { ComponentProps, ReactNode } from 'react';
import { Rivet } from '@/components/home/section';
import { TechTag } from '@/components/home/tech-tag';
import { SpotlightLayer, useSpotlight } from '@/components/motion/spotlight';
import { localized, useCopy } from '@/lib/i18n';
import { cn } from '@/lib/utils';

const COPY = localized({
    pl: { technologies: (title: string): string => `Technologie: ${title}` },
    en: { technologies: (title: string): string => `Technologies: ${title}` },
});

export type BentoService = {
    title: string;
    /** One sentence: the tile shows the rest. */
    description: string;
    tags: string[];
};

/**
 * A rivet at the tile's top corner, where the row hairline above the tile meets a rail. Rivets are md+ only;
 * `className` narrows one to the breakpoints where the tile actually touches that rail (e.g. `lg:hidden`).
 */
export type BentoRivet = { side: 'left' | 'right'; className?: string };

/** Tile padding. Below md it matches the page gutter, so tile text lines up with the section heading. */
export const tileGutterX = 'px-4 sm:px-6 lg:px-7 xl:px-8';
export const tileGutterTop = 'pt-6 sm:pt-7 xl:pt-8';
export const tileGutterBottom = 'pb-6 sm:pb-7 xl:pb-8';

type BentoTileProps = {
    /** Grid placement (spans) and per-tile sizing. */
    className?: string;
    rivets?: BentoRivet[];
    children: ReactNode;
};

/**
 * One cell of the services bento: a list item on the shared-border grid (no radius, no shadow), with the
 * pointer spotlight behind its content. It never clips, so its rivets can sit on the rails; visuals clip themselves.
 */
export function BentoTile({ className, rivets, children }: BentoTileProps) {
    const spotlight = useSpotlight<HTMLLIElement>();

    return (
        <li {...spotlight} className={cn('relative isolate flex min-w-0 flex-col bg-background', className)}>
            <SpotlightLayer />
            {rivets?.map((rivet) => <Rivet key={`${rivet.side}-${rivet.className ?? 'all'}`} side={rivet.side} className={rivet.className} />)}
            {children}
        </li>
    );
}

type BentoTileTextProps = {
    service: BentoService;
    /** lg: the 2×2 web tile. */
    size?: 'md' | 'lg';
    className?: string;
};

/** Title (H3), one-line description and technology tags. */
export function BentoTileText({ service, size = 'md', className }: BentoTileTextProps) {
    const { title, description, tags } = service;
    const copy = useCopy(COPY);

    return (
        <div className={className}>
            <h3 className={cn('font-semibold tracking-tight text-balance', size === 'lg' ? 'text-xl sm:text-2xl' : 'text-lg sm:text-xl')}>{title}</h3>
            <p className="mt-1.5 max-w-[44ch] text-sm leading-relaxed text-pretty text-muted-foreground">{description}</p>
            <ul aria-label={copy.technologies(title)} className="mt-4 flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                    <li key={tag}>
                        <TechTag>{tag}</TechTag>
                    </li>
                ))}
            </ul>
        </div>
    );
}

/**
 * Attributes for a tile's live visual: hidden from assistive tech (the tile text carries the meaning) and flagged
 * for the scoped bento CSS, which runs loops and typing only under `data-bento-live`.
 */
export function liveVisualProps(active: boolean): { 'aria-hidden': true; 'data-bento-visual': ''; 'data-bento-live': '' | undefined } {
    return { 'aria-hidden': true, 'data-bento-visual': '', 'data-bento-live': active ? '' : undefined };
}

type AppearProps = ComponentProps<'div'> & {
    /** Visible state. The SSR/static frame renders with `show` true, so no-JS output is complete. */
    show: boolean;
    /** Milliseconds before appearing (not applied when hiding). */
    delay?: number;
    /** Where the element rises from. */
    from?: 'below' | 'above' | 'none';
};

/**
 * A piece of a live visual that fades (and nudges) in while `show` is true. A CSS transition on opacity and
 * translate only, so toggling it never re-lays out the tile; reduced motion collapses it to an instant swap.
 */
export function Appear({ show, delay = 0, from = 'below', className, style, ...props }: AppearProps) {
    return (
        <div
            data-show={show}
            style={show && delay > 0 ? { ...style, transitionDelay: `${delay}ms` } : style}
            className={cn(
                'transition-[opacity,translate] duration-500 ease-expo-out data-[show=false]:opacity-0',
                from === 'below' && 'data-[show=false]:translate-y-1.5',
                from === 'above' && 'data-[show=false]:-translate-y-1.5',
                className,
            )}
            {...props}
        />
    );
}
