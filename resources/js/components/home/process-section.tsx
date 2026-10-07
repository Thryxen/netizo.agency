import { Check, GitBranch, LoaderCircle, NotebookPen, PenTool } from 'lucide-react';
import { type MotionValue, useMotionValueEvent, useScroll, useTransform } from 'motion/react';
import { type ReactNode, useCallback, useEffect, useId, useRef, useState, useSyncExternalStore } from 'react';
import { Appear } from '@/components/home/bento/bento-tile';
import { Rivet, Section, SectionHeading } from '@/components/home/section';
import { TechTag } from '@/components/home/tech-tag';
import { PixelatedImage, isMotionGateOpen, useMotionStyle, useReducedMotionPreference } from '@/components/motion';
import { PixelCrossfade } from '@/components/motion/pixel-crossfade';
import { useInViewLoop } from '@/components/motion/use-in-view-loop';
import { scrollBehavior } from '@/lib/in-page-navigation';
import { type PhotoName, photo } from '@/lib/photos';
import { cn } from '@/lib/utils';

type ProcessStep = {
    number: string;
    title: string;
    description: string;
    tags: string[];
    photo: PhotoName;
};

const STEPS: ProcessStep[] = [
    {
        number: '01',
        title: 'Odkrywanie',
        description: 'Poznajemy Twój biznes, analizujemy rynek i konkurencję. Definiujemy cele, wymagania i roadmapę projektu.',
        tags: ['Warsztaty', 'Research', 'Strategia'],
        photo: 'process-discovery',
    },
    {
        number: '02',
        title: 'Projektowanie',
        description: 'Tworzymy wireframe’y i interaktywne prototypy. Projektujemy UI/UX zgodny z Twoją marką i potrzebami użytkowników.',
        tags: ['Wireframes', 'Prototypy', 'UI/UX'],
        photo: 'process-design',
    },
    {
        number: '03',
        title: 'Rozwój',
        description: 'Kodujemy w dwutygodniowych sprintach z regularnymi demo. Code review, testy automatyczne i CI/CD pipeline.',
        tags: ['Agile', 'CI/CD', 'Testing'],
        photo: 'process-development',
    },
    {
        number: '04',
        title: 'Wdrożenie',
        description: 'Wdrażamy na produkcję z pełnym monitoringiem. Zapewniamy wsparcie techniczne i rozwijamy projekt według potrzeb.',
        tags: ['Deploy', 'Monitoring', 'Support'],
        photo: 'process-launch',
    },
];

const STAGE_PHOTOS = STEPS.map((step) => photo(step.photo));

/** Rail segments between the markers in the static layouts. */
const SEGMENTS = STEPS.length - 1;

/** Where a step button scrolls to, as a fraction into that step's share of the pinned scroll. */
const STEP_LANDING = 0.1;
/** The stage's chip for a new step arrives as the next photo starts resolving (PixelCrossfade dissolves at ~200–400 ms). */
const CHIP_DELAY_MS = 420;
/** The first chip waits this long after the stage comes into view (its first reveal takes ~1.1 s). */
const FIRST_CHIP_DELAY_MS = 800;

/** The pinned layout's condition; PROCESS_CSS repeats it (plus the `js` gate) as a media query. */
const PINNED_QUERY = '(min-width: 64rem) and (prefers-reduced-motion: no-preference)';

/**
 * Pinned scroll story (lg+, JS, motion allowed). It only restyles the static markup, so it lives here as CSS keyed
 * on data attributes (unlayered, so it wins over the static layout's utilities) and applies from the first paint:
 * the inline head script sets `js` before then, and removes it again if the app never boots. Also the stage chips'
 * keyframes (app.css is shared).
 *
 * - The track is 4 × 90svh tall; inside it the viewport sticks under the header for the pinned stretch.
 * - Steps: number + title on one 3.5rem row; only the active step's description and tags are open (grid rows
 *   0fr → 1fr), the others stay in the DOM (and the accessibility tree), clipped and transparent.
 * - Rail: each step's segment runs from its marker to the next marker (the last one through its own text).
 * - Stage: 4:3, bled onto the right rail, capped to the viewport height on short screens.
 */
const PROCESS_CSS = `
@keyframes vx-process-blink { 0%, 100% { opacity: 0.25; } 50% { opacity: 1; } }
@keyframes vx-process-row-in { from { opacity: 0; transform: translateY(-60%); } }
.vx-process-blink { animation: vx-process-blink 1.2s ease-in-out infinite; }
[data-process-stage]:not([data-live]) .vx-process-blink { animation-play-state: paused; }
[data-process-stage][data-live] .vx-process-row-in { animation: vx-process-row-in 650ms var(--ease-expo-out) both; }

@media (width >= 64rem) and (prefers-reduced-motion: no-preference) {
    .js [data-process-track] { height: 360svh; }
    .js [data-process-viewport] {
        position: sticky;
        top: var(--header-height);
        display: flex;
        align-items: center;
        height: calc(100svh - var(--header-height));
    }
    .js [data-process-frame] {
        display: grid;
        grid-template-columns: minmax(0, 5fr) minmax(0, 7fr);
        column-gap: 3.5rem;
        align-items: center;
        width: 100%;
    }
    .js [data-process-list] { display: block; }
    .js [data-process-step] {
        display: grid;
        grid-template-columns: 2.75rem minmax(0, 1fr);
        grid-template-rows: auto auto;
        align-items: baseline;
        column-gap: 0;
        padding: 0 0 0 2.25rem;
    }
    .js [data-process-step] > [data-pixelate],
    .js [data-process-row-rail],
    .js [data-process-row-fill] { display: none; }
    .js [data-process-jump],
    .js [data-process-pin-rail],
    .js [data-process-pin-fill],
    .js [data-process-stage] { display: block; }
    .js [data-process-marker] { top: calc(1.75rem - 5.5px); }
    .js [data-process-pin-rail] { top: calc(1.75rem + 5.5px); bottom: calc(5.5px - 1.75rem); transition: opacity 300ms linear; }
    .js [data-process-step]:last-child > [data-process-pin-rail] { bottom: 0.75rem; }
    .js [data-process-step]:last-child:not([data-active]) > [data-process-pin-rail] { opacity: 0; }
    .js [data-process-number],
    .js [data-process-title] {
        grid-row: 1;
        margin: 0;
        line-height: 3.5rem;
        color: var(--muted-foreground);
        transition: color 300ms ease;
    }
    .js [data-process-number] { grid-column: 1; font-size: 1.125rem; }
    .js [data-process-title] { grid-column: 2; font-size: 1.75rem; letter-spacing: -0.03em; }
    .js [data-process-step][data-active] > :is([data-process-number], [data-process-title]),
    .js [data-process-step]:hover > :is([data-process-number], [data-process-title]) { color: var(--foreground); }
    .js [data-process-detail] {
        grid-column: 2;
        grid-row: 2;
        display: grid;
        grid-template-rows: 0fr;
        opacity: 0;
        transition: grid-template-rows 500ms var(--ease-expo-out), opacity 200ms linear;
    }
    .js [data-process-step][data-active] > [data-process-detail] {
        grid-template-rows: 1fr;
        opacity: 1;
        transition: grid-template-rows 600ms var(--ease-expo-out), opacity 450ms linear 120ms;
    }
    .js [data-process-detail] > div { display: block; min-height: 0; overflow: hidden; }
    .js [data-process-detail] p { margin-top: 0; }
    .js [data-process-detail] ul { margin-top: 1rem; padding: 0 0 1.75rem; }
    .js [data-process-stage] {
        aspect-ratio: 4 / 3;
        max-height: calc(100svh - var(--header-height) - 4rem);
        margin-right: -2.5rem;
    }
}
`;

const subscribeToPinnedQuery = (onChange: () => void): (() => void) => {
    const query = window.matchMedia(PINNED_QUERY);
    query.addEventListener('change', onChange);

    return () => query.removeEventListener('change', onChange);
};

/** Whether the pinned layout is on (same condition as PROCESS_CSS). False on the server and while hydrating. */
function usePinnedLayout(): boolean {
    return useSyncExternalStore(
        subscribeToPinnedQuery,
        () => isMotionGateOpen() && window.matchMedia(PINNED_QUERY).matches,
        () => false,
    );
}

const stepAt = (progress: number): number => Math.min(STEPS.length - 1, Math.max(0, Math.floor(progress * STEPS.length)));

/**
 * Jak pracujemy: four steps (a real sequence, so numbered). One markup, three layouts:
 *
 * - lg+ with JS and motion (PROCESS_CSS): a pinned scroll story. The section's track is 4 × 90svh; while it scrolls
 *   by, a viewport sticks under the header with the step list on the left (rail filling with the progress, the active
 *   step open) and a 4:3 photo stage on the right that pixel-crossfades between the steps' photos, with a small live
 *   chip per step. The active step follows the scroll; a step's button scrolls to its stretch.
 * - Below lg: a vertical list with a left rail, each step with its photo (beside its text on md); every segment draws
 *   with its step's scroll progress and its marker fills when the line reaches it.
 * - lg+ without JS or with reduced motion: a row of four with the finished rail.
 *
 * Every step's full text is always in the HTML (also in the pinned layout, where closed steps are only clipped). The
 * stage is decorative (aria-hidden); the step buttons exist only in the pinned layout (display:none elsewhere).
 */
export function ProcessSection() {
    const trackRef = useRef<HTMLDivElement>(null);
    const viewportRef = useRef<HTMLDivElement>(null);
    const pinned = usePinnedLayout();
    const reduced = useReducedMotionPreference();
    const [headerOffset, setHeaderOffset] = useState(64);
    const [active, setActive] = useState(0);

    const { scrollYProgress: storyProgress } = useScroll({ target: trackRef, offset: [`start ${headerOffset}px`, 'end end'] });

    useEffect(() => {
        const viewport = viewportRef.current;
        const top = viewport && pinned ? parseFloat(window.getComputedStyle(viewport).top) : NaN;

        if (Number.isFinite(top)) {
            setHeaderOffset(top);
        }

        if (pinned) {
            setActive(stepAt(storyProgress.get()));
        }
    }, [pinned, storyProgress]);

    useMotionValueEvent(storyProgress, 'change', (progress) => {
        if (pinned) {
            setActive(stepAt(progress));
        }
    });

    const goToStep = useCallback((index: number): void => {
        const track = trackRef.current;
        const viewport = viewportRef.current;

        if (!track || !viewport) {
            return;
        }

        const stickyTop = parseFloat(window.getComputedStyle(viewport).top) || 0;
        const pinnedDistance = track.offsetHeight - viewport.offsetHeight;
        const trackTop = track.getBoundingClientRect().top + window.scrollY;

        window.scrollTo({ top: trackTop - stickyTop + pinnedDistance * ((index + STEP_LANDING) / STEPS.length), behavior: scrollBehavior() });
    }, []);

    return (
        <Section id="proces" labelledBy="proces-heading">
            <style>{PROCESS_CSS}</style>
            <SectionHeading id="proces-heading" title="Jak pracujemy" lead="Cztery etapy. Na każdym wiesz, co się dzieje i co dostajesz." />

            <div ref={trackRef} data-process-track="">
                <div ref={viewportRef} data-process-viewport="">
                    <div data-process-frame="" className="w-full">
                        <ol data-process-list="" className="grid lg:grid-cols-4">
                            {STEPS.map((step, index) => (
                                <ProcessStepItem
                                    key={step.number}
                                    step={step}
                                    index={index}
                                    active={index === active}
                                    storyProgress={storyProgress}
                                    reduced={reduced}
                                    onSelect={goToStep}
                                />
                            ))}
                        </ol>

                        <ProcessStage active={active} />
                    </div>
                </div>
            </div>
        </Section>
    );
}

/** `[.js_&]` + `motion-safe`: the undrawn state before the first scroll measurement; inline styles take over after. */
const undrawnVertical = 'motion-safe:[.js_&]:[transform:scaleY(0)]';
const unfilledMarker = 'motion-safe:[.js_&]:opacity-0';

type ProcessStepItemProps = {
    step: ProcessStep;
    index: number;
    /** The pinned layout's current step (open, `aria-current`). */
    active: boolean;
    storyProgress: MotionValue<number>;
    reduced: boolean;
    onSelect: (index: number) => void;
};

function ProcessStepItem({ step, index, active, storyProgress, reduced, onSelect }: ProcessStepItemProps) {
    const isLast = index === SEGMENTS;
    const titleId = useId();
    const itemRef = useRef<HTMLLIElement>(null);
    const stackedFillRef = useRef<HTMLSpanElement>(null);
    const stackedMarkerRef = useRef<HTMLSpanElement>(null);
    const pinFillRef = useRef<HTMLSpanElement>(null);
    const pinMarkerRef = useRef<HTMLSpanElement>(null);

    // Below lg each segment follows its own step: the line's tip tracks a point 60% down the viewport.
    const { scrollYProgress: stepProgress } = useScroll({ target: itemRef, offset: ['start 0.6', 'end 0.6'] });
    const stackedScale = useTransform(stepProgress, [0, 1], reduced ? [1, 1] : [0, 1]);
    const stackedMarkerOpacity = useTransform(stepProgress, (progress): number => (reduced || progress > 0 ? 1 : 0));

    // Pinned: each step owns a quarter of the story; its segment fills across it, its marker fills as it begins.
    const reachedAt = index / STEPS.length;
    const pinScale = useTransform(storyProgress, [reachedAt, (index + 1) / STEPS.length], [0, 1]);
    const pinMarkerOpacity = useTransform(storyProgress, (progress): number => (progress >= reachedAt - 0.0001 ? 1 : 0));

    useMotionStyle(stackedFillRef, { scaleY: stackedScale });
    useMotionStyle(stackedMarkerRef, { opacity: stackedMarkerOpacity });
    useMotionStyle(pinFillRef, { scaleY: pinScale });
    useMotionStyle(pinMarkerRef, { opacity: pinMarkerOpacity });

    const image = photo(step.photo);

    return (
        <li
            ref={itemRef}
            data-process-step=""
            data-active={active ? '' : undefined}
            className={cn(
                'relative pl-10 md:grid md:grid-cols-2 md:grid-rows-[auto_auto_1fr] md:content-start md:gap-x-8 lg:flex lg:flex-col lg:pt-12 lg:pr-8 lg:pl-0',
                !isLast && 'pb-12 lg:pb-0',
            )}
        >
            {/* Pinned layout only: the step's row scrolls the story to this step. */}
            <button
                type="button"
                data-process-jump=""
                aria-labelledby={titleId}
                aria-current={active ? 'step' : undefined}
                onClick={() => onSelect(index)}
                // Tabbing through the steps walks the story (pointer focus waits for the click).
                onFocus={(event) => event.currentTarget.matches(':focus-visible') && onSelect(index)}
                className="absolute -inset-x-3 top-0 z-10 hidden h-14 rounded-md outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
            />

            {!isLast && (
                <>
                    <span aria-hidden="true" className="absolute top-[22px] -bottom-[11px] left-[5px] w-px bg-border lg:hidden">
                        <span ref={stackedFillRef} className={cn('block size-full origin-top bg-foreground', undrawnVertical)} />
                    </span>
                    {/* The static row (no JS or reduced motion) always shows the finished rail. */}
                    <span aria-hidden="true" data-process-row-rail="" className="absolute top-[5px] right-0 left-[11px] hidden h-px bg-foreground lg:block" />
                </>
            )}
            <span aria-hidden="true" data-process-pin-rail="" className="absolute left-[5px] hidden w-px bg-border">
                <span ref={pinFillRef} className="block size-full origin-top bg-foreground [transform:scaleY(0)]" />
            </span>

            <span aria-hidden="true" data-process-marker="" className="absolute top-[11px] left-0 size-[11px] border border-foreground bg-background lg:top-0">
                <span ref={stackedMarkerRef} className={cn('absolute -inset-px bg-foreground transition-opacity duration-300 lg:hidden', unfilledMarker)} />
                <span data-process-row-fill="" className="absolute -inset-px hidden bg-foreground lg:block" />
                <span
                    ref={pinMarkerRef}
                    data-process-pin-fill=""
                    className={cn('absolute -inset-px hidden bg-foreground transition-opacity duration-300', index > 0 && 'opacity-0')}
                />
            </span>

            <span aria-hidden="true" data-process-number="" className="block font-pixel text-[2rem] leading-none md:col-span-2">
                {step.number}
            </span>
            <PixelatedImage
                {...image}
                sizes="(min-width: 1248px) 248px, (min-width: 1024px) 20vw, (min-width: 768px) 40vw, calc(100vw - 4.5rem)"
                alt=""
                className="mt-5 aspect-[3/2] border md:row-span-2 lg:mt-6"
            />
            <h3 id={titleId} data-process-title="" className="mt-5 text-xl font-semibold tracking-tight lg:mt-6">
                {step.title}
            </h3>
            <div data-process-detail="" className="lg:flex lg:flex-1 lg:flex-col">
                <div className="lg:flex lg:flex-1 lg:flex-col">
                    <p className="mt-3 max-w-[48ch] leading-relaxed text-pretty text-muted-foreground">{step.description}</p>
                    {/* From lg the tag rows bottom-align across the four steps. */}
                    <ul className="mt-5 flex flex-wrap content-start gap-1.5 lg:mt-auto lg:pt-5">
                        {step.tags.map((tag) => (
                            <li key={tag}>
                                <TechTag>{tag}</TechTag>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </li>
    );
}

/**
 * The pinned layout's photo stage: the active step's photo (PixelCrossfade between them) and a small live chip per
 * step in the bento's vocabulary. Decorative: the list carries the content.
 */
function ProcessStage({ active }: { active: number }) {
    const { ref, active: live } = useInViewLoop<HTMLDivElement>({ amount: 0.4 });
    const [entered, setEntered] = useState(false);
    const [chipStep, setChipStep] = useState<number | null>(active);
    const previousActive = useRef(active);

    // The first chip slides in once the stage's first reveal (pixel → sharp) is well under way.
    useEffect(() => {
        if (entered || !live) {
            return;
        }

        const timer = window.setTimeout(() => setEntered(true), FIRST_CHIP_DELAY_MS);

        return () => window.clearTimeout(timer);
    }, [entered, live]);

    // The old chip leaves at once; the new one arrives while the next photo resolves.
    useEffect(() => {
        if (previousActive.current === active) {
            return;
        }

        previousActive.current = active;
        setChipStep(null);

        const timer = window.setTimeout(() => setChipStep(active), CHIP_DELAY_MS);

        return () => window.clearTimeout(timer);
    }, [active]);

    return (
        <div ref={ref} aria-hidden="true" data-process-stage="" data-live={live ? '' : undefined} className="relative hidden border-y border-l">
            <Rivet side="right" className="-top-[3px]" />
            <Rivet side="right" edge="bottom" className="-bottom-[3px]" />
            <PixelCrossfade images={STAGE_PHOTOS} index={active} sizes="(min-width: 1248px) 660px, 56vw" className="absolute inset-0" />

            <div className="absolute bottom-4 left-4 z-10 w-[16rem] xl:bottom-5 xl:left-5 xl:w-[17.5rem]">
                <DiscoveryChip show={entered && chipStep === 0} live={live} />
                <DesignChip show={entered && chipStep === 1} live={live} />
                <DevelopmentChip show={entered && chipStep === 2} live={live} />
                <LaunchChip show={entered && chipStep === 3} live={live} />
            </div>
        </div>
    );
}

type ChipProps = { show: boolean; live: boolean };

/** Leaving is quicker than arriving, so two chips never read on top of each other. */
const chipClassName = 'absolute bottom-0 left-0 w-full rounded-lg border bg-background/95 p-3 text-xs leading-snug data-[show=false]:duration-200';

function ChipIcon({ children, className }: { children: ReactNode; className?: string }) {
    return <span className={cn('flex size-8 shrink-0 items-center justify-center rounded-md bg-foreground text-background', className)}>{children}</span>;
}

/** A tiny status square: dashed while pending, outlined with a blinking bit while running, filled with a check when done. */
function StatusBit({ status }: { status: 'pending' | 'running' | 'done' }) {
    return (
        <span
            className={cn(
                'relative flex size-3.5 shrink-0 items-center justify-center rounded-[3px] border transition-colors duration-300',
                status === 'done' && 'border-foreground bg-foreground text-background',
                status === 'running' && 'border-foreground',
                status === 'pending' && 'border-dashed border-input',
            )}
        >
            {status === 'done' && <Check className="size-2.5" strokeWidth={3} />}
            {status === 'running' && <span className="vx-process-blink size-1.5 bg-foreground" />}
        </span>
    );
}

const DISCOVERY_ITEMS = ['Cele biznesowe', 'Wymagania', 'Roadmapa projektu'] as const;
const DISCOVERY_TICK_MS = 650;

/** Odkrywanie: the workshop's agenda ticks off item by item. Static frame: all done. */
function DiscoveryChip({ show, live }: ChipProps) {
    const [done, setDone] = useState<number>(DISCOVERY_ITEMS.length);
    const running = show && live;

    useEffect(() => {
        if (!running) {
            return;
        }

        let count = 0;
        setDone(0);

        const timer = window.setInterval(() => {
            count += 1;
            setDone(count);

            if (count >= DISCOVERY_ITEMS.length) {
                window.clearInterval(timer);
            }
        }, DISCOVERY_TICK_MS);

        return () => window.clearInterval(timer);
    }, [running]);

    return (
        <Appear show={show} className={chipClassName}>
            <div className="flex items-center gap-3">
                <ChipIcon>
                    <NotebookPen className="size-4" strokeWidth={1.75} />
                </ChipIcon>
                <span className="min-w-0">
                    <span className="block truncate font-medium">Warsztat, 3 h</span>
                    <span className="block truncate text-muted-foreground">Ustalamy zakres i priorytety</span>
                </span>
            </div>
            <ul className="mt-3 flex flex-col gap-1.5 border-t pt-3">
                {DISCOVERY_ITEMS.map((item, index) => {
                    const status = index < done ? 'done' : index === done ? 'running' : 'pending';

                    return (
                        <li key={item} className="flex items-center gap-2">
                            <StatusBit status={status} />
                            <span className={cn('transition-colors duration-300', status === 'done' ? 'text-foreground' : 'text-muted-foreground')}>{item}</span>
                        </li>
                    );
                })}
            </ul>
        </Appear>
    );
}

const PROTOTYPE_SCREENS = 18;
const SCREEN_STAGGER_MS = 65;
const EXPORT_MS = PROTOTYPE_SCREENS * SCREEN_STAGGER_MS + 350;

/** Projektowanie: the prototype's screens export one by one, then "Prototyp v2 gotowy". Static frame: ready. */
function DesignChip({ show, live }: ChipProps) {
    const [phase, setPhase] = useState<'idle' | 'export' | 'ready'>('ready');
    const running = show && live;

    useEffect(() => {
        if (!running) {
            return;
        }

        setPhase('idle');

        // Two frames: the bits are styled off before they light up one by one.
        let frame = window.requestAnimationFrame(() => {
            frame = window.requestAnimationFrame(() => setPhase('export'));
        });
        const timer = window.setTimeout(() => setPhase('ready'), EXPORT_MS);

        return () => {
            window.cancelAnimationFrame(frame);
            window.clearTimeout(timer);
        };
    }, [running]);

    const ready = phase === 'ready';

    return (
        <Appear show={show} className={chipClassName}>
            <div className="flex items-center gap-3">
                <ChipIcon>{ready ? <Check className="size-4" strokeWidth={2.25} /> : <LoaderCircle className="size-4 animate-spin" strokeWidth={2} />}</ChipIcon>
                <span className="min-w-0">
                    <span className="block truncate font-medium">{ready ? 'Prototyp v2 gotowy' : 'Prototyp v2'}</span>
                    <span className="block truncate text-muted-foreground">{ready ? `${PROTOTYPE_SCREENS} ekranów, gotowy do testów` : 'Eksport ekranów'}</span>
                </span>
            </div>
            <span className="mt-3 flex gap-0.5 border-t pt-3">
                {Array.from({ length: PROTOTYPE_SCREENS }, (_, screen) => (
                    <span
                        key={screen}
                        data-on={phase !== 'idle'}
                        style={phase === 'export' ? { transitionDelay: `${screen * SCREEN_STAGGER_MS}ms` } : undefined}
                        className="h-3.5 flex-1 bg-foreground transition-opacity duration-200 data-[on=false]:opacity-15"
                    />
                ))}
            </span>
        </Appear>
    );
}

const COMMITS = [
    { hash: '9c41e2a', message: 'feat: koszyk' },
    { hash: '3b7f0d1', message: 'test: płatności online' },
    { hash: 'e58a6c4', message: 'fix: walidacja adresu' },
    { hash: '71d2b9f', message: 'feat: panel klienta' },
    { hash: 'c0a3e87', message: 'perf: cache zapytań' },
    { hash: '4f19d6b', message: 'feat: wysyłka kurierem' },
] as const;
const VISIBLE_COMMITS = 3;
const COMMIT_MS = 2000;
const CI_MS = 900;

const commitAt = (serial: number): (typeof COMMITS)[number] => COMMITS[((serial % COMMITS.length) + COMMITS.length) % COMMITS.length];

/** Rozwój: commits land on main one after another (rows slide by transform), each one running CI first. */
function DevelopmentChip({ show, live }: ChipProps) {
    // Newest first, one more than fits so the row leaving at the bottom slides out instead of vanishing.
    const [serials, setSerials] = useState<number[]>([0, -1, -2, -3]);
    const [checking, setChecking] = useState(false);
    const running = show && live;
    const latest = serials[0];

    useEffect(() => {
        if (!running) {
            return;
        }

        const timer = window.setTimeout(() => {
            setSerials((current) => [current[0] + 1, ...current].slice(0, VISIBLE_COMMITS + 1));
            setChecking(true);
        }, COMMIT_MS);

        return () => window.clearTimeout(timer);
    }, [running, latest]);

    useEffect(() => {
        if (!checking) {
            return;
        }

        const timer = window.setTimeout(() => setChecking(false), CI_MS);

        return () => window.clearTimeout(timer);
    }, [checking]);

    return (
        <Appear show={show} className={chipClassName}>
            <div className="flex items-center justify-between gap-3">
                <span className="flex min-w-0 items-center gap-3">
                    <ChipIcon>
                        <GitBranch className="size-4" strokeWidth={1.75} />
                    </ChipIcon>
                    <span className="min-w-0">
                        <span className="block truncate font-medium">main</span>
                        <span className="block truncate text-muted-foreground">Sprint 4, dzień 6</span>
                    </span>
                </span>
                <span className="inline-flex shrink-0 items-center gap-1.5 rounded-[3px] border px-1.5 py-1 text-[11px]">
                    {checking ? <LoaderCircle className="size-3 animate-spin" strokeWidth={2.25} /> : <Check className="size-3" strokeWidth={2.5} />}
                    CI
                </span>
            </div>
            <ul className="relative mt-3 overflow-hidden border-t font-mono text-[11px]" style={{ height: `${VISIBLE_COMMITS * 1.75}rem` }}>
                {serials.map((serial, index) => {
                    const commit = commitAt(serial);
                    const pending = index === 0 && checking;

                    return (
                        <li
                            key={serial}
                            style={{ transform: `translateY(${index * 100}%)` }}
                            className="absolute inset-x-0 top-0 h-7 transition-transform duration-700 ease-expo-out"
                        >
                            <span className={cn('flex h-full items-center gap-2 border-b', serial > 0 && 'vx-process-row-in')}>
                                <span className="shrink-0 text-muted-foreground">{commit.hash}</span>
                                <span className="min-w-0 flex-1 truncate">{commit.message}</span>
                                {pending ? (
                                    <span className="vx-process-blink size-1.5 shrink-0 bg-foreground" />
                                ) : (
                                    <Check className="size-3 shrink-0" strokeWidth={2.5} />
                                )}
                            </span>
                        </li>
                    );
                })}
            </ul>
        </Appear>
    );
}

const UPTIME_DAYS = 30;
const DAY_STAGGER_MS = 28;

/** Wdrożenie: live monitoring; the last 30 days light up day by day, today blinks. Static frame: all lit. */
function LaunchChip({ show, live }: ChipProps) {
    const [lit, setLit] = useState(true);
    const running = show && live;

    useEffect(() => {
        if (!running) {
            return;
        }

        setLit(false);

        let frame = window.requestAnimationFrame(() => {
            frame = window.requestAnimationFrame(() => setLit(true));
        });

        return () => window.cancelAnimationFrame(frame);
    }, [running]);

    return (
        <Appear show={show} className={chipClassName}>
            <div className="flex items-start justify-between gap-3">
                <span className="min-w-0">
                    <span className="block text-muted-foreground">Uptime, 30 dni</span>
                    <span className="mt-1 block text-2xl leading-none font-semibold tracking-tight tabular-nums">99,9%</span>
                </span>
                <span className="flex shrink-0 items-center gap-1.5 text-[11px] text-muted-foreground">
                    <span className="vx-process-blink size-1.5 bg-foreground" />
                    na żywo
                </span>
            </div>
            <span className="mt-3 flex gap-0.5 border-t pt-3">
                {Array.from({ length: UPTIME_DAYS }, (_, day) => (
                    <span
                        key={day}
                        data-on={lit}
                        style={lit && running ? { transitionDelay: `${day * DAY_STAGGER_MS}ms` } : undefined}
                        className={cn(
                            'h-3.5 flex-1 bg-foreground transition-opacity duration-200 data-[on=false]:opacity-15',
                            day === UPTIME_DAYS - 1 && lit && 'vx-process-blink',
                        )}
                    />
                ))}
            </span>
            <span className="mt-2 block text-muted-foreground">Wszystkie usługi działają</span>
        </Appear>
    );
}
