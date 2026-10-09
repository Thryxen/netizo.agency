import { type RefObject, useEffect, useRef } from 'react';
import { useLiveLoop } from '@/components/motion/use-in-view-loop';
import { localized, useCopy } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { tween } from './bento-motion';
import { Appear, BentoTile, BentoTileText, type BentoService, liveVisualProps, tileGutterTop, tileGutterX } from './bento-tile';

/** blank page → nav → hero → cards → the cursor clicks the button → performance report (static frame) → fade out. */
const PHASE_MS = [600, 500, 700, 800, 1500, 2600, 450] as const;
const NAV = 1;
const HERO = 2;
const CARDS = 3;
const CLICK = 4;
const REPORT = 5;
const RESET = 6;

const TICKS = Array.from({ length: 24 }, (_, index) => index);

const COPY = localized({
    pl: { cta: 'Rozpocznij', performance: 'Wydajność', metrics: 'LCP 0,8 s, CLS 0' },
    en: { cta: 'Get started', performance: 'Performance', metrics: 'LCP 0.8 s, CLS 0' },
});

/**
 * Aplikacje webowe: a browser window in which a landing page assembles block by block; a cursor clicks its call to
 * action and a performance report counts up to 100. Static frame (SSR, no JS, reduced motion): the finished page.
 */
export function WebTile({ service }: { service: BentoService }) {
    const { ref, step, active } = useLiveLoop<HTMLDivElement>(PHASE_MS, { staticStep: REPORT });
    const scoreRef = useRef<HTMLSpanElement>(null);
    const previousStep = useRef(step);
    const at = (phase: number): boolean => step >= phase && step !== RESET;

    useEffect(() => {
        const cameFrom = previousStep.current;
        const score = scoreRef.current;
        previousStep.current = step;

        if (!score || !active || step !== REPORT || cameFrom !== CLICK) {
            return;
        }

        score.textContent = '0';
        const cancel = tween({ from: 0, to: 100, duration: 1100, delay: 250, onUpdate: (value) => (score.textContent = String(Math.round(value))) });

        return () => {
            cancel();
            score.textContent = '100';
        };
    }, [step, active]);

    return (
        <BentoTile className="md:col-span-2 lg:row-span-2">
            <BentoTileText service={service} size="lg" className={cn(tileGutterX, tileGutterTop)} />

            {/* The window always runs past the tile's bottom edge (clipped), like a page that continues. */}
            <div ref={ref} {...liveVisualProps(active)} className="relative mt-8 h-[23rem] overflow-hidden sm:h-[25rem] lg:h-auto lg:min-h-[24rem] lg:flex-1">
                <div className={cn('absolute inset-x-0 top-0 -bottom-8', tileGutterX)}>
                    <div className="flex h-full flex-col overflow-hidden rounded-t-lg border border-b-0 bg-background">
                        <div className="flex h-9 shrink-0 items-center gap-3 border-b bg-muted/60 px-3">
                            <span className="flex shrink-0 items-center gap-1.5">
                                <span className="size-1.5 rounded-full bg-foreground/20" />
                                <span className="size-1.5 rounded-full bg-foreground/20" />
                                <span className="size-1.5 rounded-full bg-foreground/20" />
                            </span>
                            <span className="flex h-5 w-full max-w-56 items-center rounded-md border bg-background px-2">
                                <span className="h-1.5 w-1/2 rounded-full bg-foreground/15" />
                            </span>
                        </div>
                        <LandingPage step={step} at={at} />
                    </div>
                </div>

                <div className={cn('pointer-events-none absolute inset-x-0 bottom-4 flex justify-end sm:bottom-6', tileGutterX)}>
                    <PerformanceReport show={at(REPORT)} lit={step >= REPORT} scoreRef={scoreRef} />
                </div>
            </div>
        </BentoTile>
    );
}

function LandingPage({ step, at }: { step: number; at: (phase: number) => boolean }) {
    const copy = useCopy(COPY);

    return (
        <div className="@container flex-1 p-4 @sm:p-6">
            <Appear show={at(NAV)} className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-2">
                    <span className="size-3 bg-foreground" />
                    <span className="h-2 w-12 rounded-full bg-foreground/70" />
                </span>
                <span className="hidden items-center gap-4 @sm:flex">
                    <span className="h-1.5 w-9 rounded-full bg-foreground/25" />
                    <span className="h-1.5 w-9 rounded-full bg-foreground/25" />
                    <span className="h-1.5 w-9 rounded-full bg-foreground/25" />
                </span>
                <span className="h-6 w-16 rounded-md border" />
            </Appear>

            <div className="mt-8 grid items-center gap-6 @sm:mt-10 @sm:grid-cols-[1.2fr_1fr] @sm:gap-8">
                <div>
                    <Appear show={at(HERO)}>
                        <span className="block h-4 w-[92%] rounded-[3px] bg-foreground @sm:h-5" />
                    </Appear>
                    <Appear show={at(HERO)} delay={70}>
                        <span className="mt-2.5 block h-4 w-[62%] rounded-[3px] bg-foreground @sm:h-5" />
                    </Appear>
                    <Appear show={at(HERO)} delay={140} className="mt-4 flex flex-col gap-2">
                        <span className="block h-2 w-[88%] rounded-full bg-foreground/20" />
                        <span className="block h-2 w-[70%] rounded-full bg-foreground/20" />
                    </Appear>
                    <Appear show={at(HERO)} delay={220} className="relative mt-5 w-fit">
                        <span
                            className={cn(
                                'inline-flex h-8 items-center rounded-md bg-foreground px-3.5 text-xs font-medium text-background',
                                step === CLICK && 'nz-bento-press',
                            )}
                        >
                            {copy.cta}
                        </span>
                        <Cursor show={at(CLICK)} clicking={step === CLICK} />
                    </Appear>
                </div>
                {/* A placeholder picture. */}
                <Appear show={at(HERO)} delay={120} className="hidden aspect-[4/3] rounded-md bg-muted @sm:block" />
            </div>

            <div className="mt-8 grid grid-cols-3 gap-2.5 @sm:mt-10 @sm:gap-3">
                {[0, 1, 2].map((index) => (
                    <Appear key={index} show={at(CARDS)} delay={index * 90} className="rounded-md border p-2.5 @sm:p-3.5">
                        <span className="block size-4 rounded-[3px] bg-foreground/80 @sm:size-5" />
                        <span className="mt-3 block h-2 w-[78%] rounded-full bg-foreground/55" />
                        <span className="mt-2 block h-1.5 w-[92%] rounded-full bg-foreground/15" />
                        <span className="mt-1.5 block h-1.5 w-[64%] rounded-full bg-foreground/15" />
                    </Appear>
                ))}
            </div>

            {/* A further section, only where the window is wide enough; it runs off the bottom edge on short stages. */}
            <Appear show={at(CARDS)} delay={300} className="mt-10 hidden grid-cols-[1fr_1.2fr] items-center gap-8 @sm:grid">
                <span className="aspect-[16/9] rounded-md bg-muted" />
                <span className="flex flex-col gap-2">
                    <span className="h-3 w-[72%] rounded-[3px] bg-foreground/80" />
                    <span className="mt-1 h-2 w-[94%] rounded-full bg-foreground/20" />
                    <span className="h-2 w-[80%] rounded-full bg-foreground/20" />
                    <span className="h-2 w-[56%] rounded-full bg-foreground/20" />
                </span>
            </Appear>
        </div>
    );
}

/** Travels in from the lower right (0.9 s), clicks at 1 s. Rests on the button in the static frame. */
function Cursor({ show, clicking }: { show: boolean; clicking: boolean }) {
    return (
        <span
            data-show={show}
            className="pointer-events-none absolute top-[55%] left-[68%] z-10 [transition:translate_900ms_cubic-bezier(0.45,0,0.2,1),opacity_250ms_linear] data-[show=false]:translate-x-24 data-[show=false]:translate-y-14 data-[show=false]:opacity-0"
        >
            {clicking && <span className="nz-bento-ripple absolute top-0.5 left-0.5 size-8 rounded-full border border-foreground/60" />}
            <svg viewBox="0 0 16 20" className="relative block h-5 w-4 fill-foreground stroke-background" strokeWidth={1.25} strokeLinejoin="round">
                <path d="M1.5 1.5v14.6l3.8-3.5 2.6 6.1 2.6-1.1-2.6-6h5.1z" />
            </svg>
        </span>
    );
}

type PerformanceReportProps = {
    show: boolean;
    /** Ring segments lit (the report's final state). */
    lit: boolean;
    scoreRef: RefObject<HTMLSpanElement | null>;
};

/** A small audit card: a 24-segment ring that fills while the score counts up, then the key metrics. */
function PerformanceReport({ show, lit, scoreRef }: PerformanceReportProps) {
    const copy = useCopy(COPY);

    return (
        <Appear show={show} className="mr-3 flex items-center gap-3 rounded-lg border border-foreground/15 bg-background py-2.5 pr-4 pl-2.5 sm:mr-5">
            <span className="relative size-14 shrink-0">
                <svg viewBox="0 0 56 56" className="absolute inset-0 size-full">
                    {TICKS.map((tick) => (
                        <rect
                            key={tick}
                            x="27"
                            y="1"
                            width="2"
                            height="6"
                            transform={`rotate(${tick * 15} 28 28)`}
                            data-on={lit}
                            style={lit ? { transitionDelay: `${250 + tick * 45}ms` } : undefined}
                            className="fill-foreground transition-opacity duration-200 data-[on=false]:opacity-15"
                        />
                    ))}
                </svg>
                <span ref={scoreRef} className="absolute inset-0 flex items-center justify-center text-sm font-semibold tabular-nums">
                    100
                </span>
            </span>
            <span className="text-xs leading-snug">
                <span className="block font-medium">{copy.performance}</span>
                <span className="block text-muted-foreground">{copy.metrics}</span>
            </span>
        </Appear>
    );
}
