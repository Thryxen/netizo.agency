import type { ComponentProps, ReactNode } from 'react';
import { Reveal } from '@/components/motion/reveal';
import { cn } from '@/lib/utils';

/** The gutter between the rails and the content: <Container>'s padding, and the padding of cells inside a bleed block. */
export const gutterClassName = 'px-4 sm:px-6 lg:px-10';

/** Negative margins that undo the gutter, for blocks that run rail to rail (bleed). Must mirror gutterClassName. */
export const bleedClassName = '-mx-4 sm:-mx-6 lg:-mx-10';

/**
 * Page grid: a centred 1200px column framed (md+) by two dashed vertical rails.
 * Stacked containers line up so the rails run continuously from header to footer.
 * In dark mode the rails are tuned brighter than the 10% hairlines so the frame stays visible.
 */
export function Container({ className, children, ...props }: ComponentProps<'div'>) {
    return (
        <div
            data-slot="container"
            className={cn(
                'relative mx-auto w-full max-w-[1200px] md:w-[calc(100%-3rem)] md:border-x md:border-dashed md:border-border dark:md:border-foreground/18',
                gutterClassName,
                className,
            )}
            {...props}
        >
            {children}
        </div>
    );
}

type RivetProps = {
    side: 'left' | 'right';
    edge?: 'top' | 'bottom';
    className?: string;
};

/**
 * 7×7px square where a full-width hairline crosses a rail. Place inside a <Container>; md+ only.
 */
export function Rivet({ side, edge = 'top', className }: RivetProps) {
    return (
        <span
            aria-hidden="true"
            data-slot="rivet"
            className={cn(
                'pointer-events-none absolute z-10 hidden size-[7px] bg-rivet md:block',
                side === 'left' ? '-left-1' : '-right-1',
                edge === 'top' ? '-top-1' : '-bottom-1',
                className,
            )}
        />
    );
}

type SectionProps = Omit<ComponentProps<'section'>, 'children'> & {
    /** Anchor id (uslugi, projekty, …). Gets scroll-margin for the sticky header. */
    id?: string;
    /** Id of the heading that names this landmark (usually `${id}-heading`). */
    labelledBy?: string;
    /** Full-width top hairline with rivets at the rails (default true). */
    hairline?: boolean;
    /** Extra classes for the inner <Container> (default padding: py-20 md:py-28). */
    containerClassName?: string;
    children?: ReactNode;
};

/**
 * Page section: full-width top hairline, rails container, standard vertical rhythm.
 */
export function Section({ id, labelledBy, hairline = true, className, containerClassName, children, ...props }: SectionProps) {
    return (
        <section id={id} aria-labelledby={labelledBy} className={cn('relative', hairline && 'border-t border-border', className)} {...props}>
            <Container className={cn('py-20 md:py-28', containerClassName)}>
                {hairline && (
                    <>
                        <Rivet side="left" />
                        <Rivet side="right" />
                    </>
                )}
                {children}
            </Container>
        </section>
    );
}

type SectionHeadingProps = Omit<ComponentProps<'div'>, 'title'> & {
    /** Id for the <h2>; pass the same value to <Section labelledBy>. */
    id: string;
    title: ReactNode;
    lead?: ReactNode;
    /** Called once the heading block is fully shown (its entrance finished, or shown statically). */
    onRevealed?: () => void;
};

/**
 * Left-aligned H2 + optional lead. The heading is programmatically focusable (tabIndex -1) for in-page navigation.
 * The block enters with <Reveal stagger> (H2, then lead, then any children) the first time it is 30% in view.
 */
export function SectionHeading({ id, title, lead, onRevealed, className, children, ...props }: SectionHeadingProps) {
    return (
        <Reveal stagger onRevealed={onRevealed} data-slot="section-heading" className={cn('mb-12 md:mb-16', className)} {...props}>
            <h2
                id={id}
                tabIndex={-1}
                className="max-w-4xl text-[clamp(2rem,4vw,3.5rem)] leading-[1.05] font-semibold tracking-[-0.035em] text-balance outline-none"
            >
                {title}
            </h2>
            {lead && <p className="mt-5 max-w-2xl text-lg leading-relaxed text-pretty text-muted-foreground">{lead}</p>}
            {children}
        </Reveal>
    );
}
