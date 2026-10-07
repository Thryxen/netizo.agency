import { Check, LoaderCircle, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type ArtifactFrameProps = {
    icon: LucideIcon;
    title: ReactNode;
    /** Extra classes for the title (e.g. font-mono for an address). */
    titleClassName?: string;
    /** Right side of the title bar: a status, a counter, a chip. */
    aside?: ReactNode;
    children: ReactNode;
};

/**
 * The window every step's artifact lives in: one fixed height at every breakpoint (nothing inside ever changes the
 * layout), a title bar like the bento's and the panel's window chrome, and a size container so details can drop out
 * on the narrowest cells (lg at 1024 px). Its dimming and outline follow the step's state (process-styles).
 */
export function ArtifactFrame({ icon: Icon, title, titleClassName, aside, children }: ArtifactFrameProps) {
    return (
        <div data-artifact="" className="@container flex h-[13.5rem] flex-col overflow-hidden rounded-lg border bg-background text-xs select-none">
            <div className="flex h-10 shrink-0 items-center gap-2 border-b bg-muted/50 px-3">
                <span className="hidden size-5 shrink-0 items-center justify-center rounded-[3px] bg-foreground text-background @[13rem]:flex">
                    <Icon aria-hidden="true" className="size-3" strokeWidth={2} />
                </span>
                <span className={cn('min-w-0 flex-1 truncate text-[13px] font-medium', titleClassName)}>{title}</span>
                {aside}
            </div>
            <div className="relative min-h-0 flex-1">{children}</div>
        </div>
    );
}

export type TickStatus = 'pending' | 'running' | 'done';

type TickProps = {
    status: TickStatus;
    /** How "running" looks: a blinking bit (being written) or a spinner (being checked). */
    running?: 'blink' | 'spin';
    className?: string;
};

/** A status square: dashed while pending, outlined while running, filled with a check when done. */
export function Tick({ status, running = 'blink', className }: TickProps) {
    return (
        <span
            className={cn(
                'relative flex size-3.5 shrink-0 items-center justify-center rounded-[3px] border transition-colors duration-300',
                status === 'done' && 'border-foreground bg-foreground text-background',
                status === 'running' && 'border-foreground',
                status === 'pending' && 'border-dashed border-foreground/30',
                className,
            )}
        >
            {status === 'done' && <Check aria-hidden="true" className="size-2.5" strokeWidth={3} />}
            {status === 'running' && running === 'blink' && <span className="vx-relay-blink size-1.5 bg-foreground" />}
            {status === 'running' && running === 'spin' && <LoaderCircle aria-hidden="true" className="size-2.5 animate-spin" strokeWidth={2.75} />}
        </span>
    );
}

type SwapProps = {
    /** Which of `items` shows; the others share its grid cell, faded out. */
    current: string;
    items: { key: string; node: ReactNode }[];
    /** Alignment of the stacked items (the widest one sizes the cell). */
    align?: 'start' | 'end';
    className?: string;
};

/**
 * Labels that replace each other in place (a status going Szkic → Do akceptacji → Zatwierdzone): all of them sit in one
 * grid cell, so the swap is an opacity/translate crossfade and never moves anything around it.
 */
export function Swap({ current, items, align = 'start', className }: SwapProps) {
    return (
        <span className={cn('grid shrink-0', align === 'end' ? 'justify-items-end' : 'justify-items-start', className)}>
            {items.map(({ key, node }) => (
                <span
                    key={key}
                    data-show={key === current}
                    className="col-start-1 row-start-1 flex items-center transition-[opacity,translate] duration-300 ease-expo-out data-[show=false]:translate-y-1 data-[show=false]:opacity-0"
                >
                    {node}
                </span>
            ))}
        </span>
    );
}

/** A small square-cornered chip (statuses, versions), like the tech tags. */
export const chipClassName = 'inline-flex h-6 items-center gap-1.5 rounded-[3px] border px-2 text-[11px] font-medium whitespace-nowrap';
