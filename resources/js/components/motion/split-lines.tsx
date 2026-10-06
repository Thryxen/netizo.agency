import { type CSSProperties, Fragment, type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export type SplitLinesProps = Omit<HTMLAttributes<HTMLHeadingElement>, 'children'> & {
    /** The heading as its lines (narrow column: phones, and from lg where the heading shares the row with a photo). */
    lines: string[];
    /**
     * From md up to lg the heading spans the full column: how the lines above merge there, as groups of line indexes
     * in order (e.g. [[0, 1], [2, 3]] for two lines). Omit to keep the same lines everywhere.
     */
    wideLines?: number[][];
    /** Element to render (default h1). */
    as?: 'h1' | 'h2' | 'p';
    /** Seconds before the first line starts. */
    delay?: number;
    /** Seconds between lines (default 0.08). */
    stagger?: number;
    /** Seconds per line (default 0.9). */
    duration?: number;
};

/** Overflow mask around a rising line; the padding keeps ascenders and descenders unclipped without moving the text. */
const MASK = '-mt-[0.1em] -mb-[0.14em] block overflow-hidden pt-[0.1em] pb-[0.14em]';
/** The same mask, only between md and lg (written out in full so Tailwind sees the classes). */
const WIDE_MASK = 'md:max-lg:-mt-[0.1em] md:max-lg:-mb-[0.14em] md:max-lg:block md:max-lg:overflow-hidden md:max-lg:pt-[0.1em] md:max-lg:pb-[0.14em]';

/**
 * Hero heading entrance: each line rises (y 110% → 0) out of an overflow-hidden mask, 80 ms apart, from the first
 * paint. Pure CSS (app.css `[data-split-line]`): it neither waits for nor depends on hydration, so the server-rendered
 * heading animates (or, under reduced motion and in print, simply shows) before the bundle has even loaded.
 *
 * The lines are fixed per breakpoint instead of measured: `lines` everywhere, merged into `wideLines` between md and
 * lg. A line that still does not fit wraps inside its mask (it then rises as one block), so nothing overflows.
 * The text is one real text run (no aria-hidden copy): screen readers and crawlers get the heading once.
 */
export function SplitLines({ lines, wideLines, as = 'h1', delay = 0, stagger = 0.08, duration = 0.9, className, style, ...props }: SplitLinesProps) {
    const Component = as;
    const groups = wideLines ?? lines.map((_, index) => [index]);
    const timing = { '--split-delay': `${delay}s`, '--split-stagger': `${stagger}s`, '--split-duration': `${duration}s` } as CSSProperties;

    return (
        <Component data-split-lines={wideLines ? 'wide' : ''} style={{ ...style, ...timing }} className={className} {...props}>
            {groups.map((group, groupIndex) => (
                <Fragment key={groupIndex}>
                    {groupIndex > 0 && ' '}
                    {/* md–lg: this group is the masked, rising line; elsewhere it dissolves into its own lines. */}
                    <span className={cn('contents', wideLines && WIDE_MASK)}>
                        <span
                            data-split-line={wideLines ? 'wide' : undefined}
                            style={{ '--line': groupIndex } as CSSProperties}
                            className={cn('contents', wideLines && 'md:max-lg:block')}
                        >
                            {group.map((lineIndex, indexInGroup) => (
                                <Fragment key={lineIndex}>
                                    {indexInGroup > 0 && ' '}
                                    <span className={cn(MASK, wideLines && 'md:max-lg:inline md:max-lg:m-0 md:max-lg:overflow-visible md:max-lg:p-0')}>
                                        <span
                                            data-split-line="narrow"
                                            style={{ '--line': lineIndex } as CSSProperties}
                                            className={cn('block', wideLines && 'md:max-lg:inline')}
                                        >
                                            {lines[lineIndex]}
                                        </span>
                                    </span>
                                </Fragment>
                            ))}
                        </span>
                    </span>
                </Fragment>
            ))}
        </Component>
    );
}
