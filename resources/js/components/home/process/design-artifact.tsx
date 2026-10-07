import { Check, PenTool } from 'lucide-react';
import type { CSSProperties, ReactNode } from 'react';
import { SlotCross } from '@/components/home/live-build/shop-window';
import { photo } from '@/lib/photos';
import { cn } from '@/lib/utils';
import { ArtifactFrame, chipClassName, Swap } from './artifact-parts';
import { ARTIFACT_MS, type StepState } from './process-data';
import { useStepClock } from './use-process-relay';

/** Clock: wireframe (0), the design resolves over it (1), a comment (2), the photo grows (3), resolved, v2 (4). */
const DESIGNED = 1;
const COMMENTED = 2;
const GROWN = 3;
const RESOLVED = 4;

const HERO_PHOTO = photo('shop-hero');

/** Stagger of the design resolving over the wireframe, element by element (ms). */
const STAGGER_MS = 70;

type MorphProps = {
    designed: boolean;
    /** Order in the stagger. */
    order: number;
    /** Wireframe look (dashed slot or grey bar) and design look of the same box. */
    wireframe: string;
    design: string;
    className?: string;
    children?: ReactNode;
};

/** One box of the mock page: its wireframe look and its design look crossfade in place (the design over the slot). */
function Morph({ designed, order, wireframe, design, className, children }: MorphProps) {
    const delay = designed ? ({ transitionDelay: `${order * STAGGER_MS}ms` } as CSSProperties) : undefined;

    return (
        <span className={cn('relative block', className)}>
            <span data-show={!designed} style={delay} className={cn('absolute inset-0 transition-opacity duration-300 data-[show=false]:opacity-0', wireframe)} />
            <span data-show={designed} style={delay} className={cn('absolute inset-0 transition-opacity duration-300 data-[show=false]:opacity-0', design)}>
                {children}
            </span>
        </span>
    );
}

const WF_SLOT = 'rounded-[3px] border border-dashed border-foreground/30 bg-foreground/[0.025]';
const WF_BAR = 'rounded-full bg-foreground/12';

/**
 * Projektowanie: the home page of the shop from the hero, as a prototype frame. The grey wireframe resolves into the
 * designed screen; the client asks "Większe zdjęcie?", the photo grows, the comment is resolved and the prototype
 * becomes v2. Final frame: the designed screen with the resolved comment.
 */
export function DesignArtifact({ state }: { state: StepState }) {
    const step = useStepClock(ARTIFACT_MS.design, state);
    const designed = step >= DESIGNED;
    const commented = step >= COMMENTED;
    const grown = step >= GROWN;
    const resolved = step >= RESOLVED;

    return (
        <ArtifactFrame
            icon={PenTool}
            title="Strona główna"
            aside={
                <Swap
                    current={resolved ? 'v2' : 'v1'}
                    align="end"
                    items={[
                        { key: 'v1', node: <span className={cn(chipClassName, 'h-5 px-1.5 font-normal text-muted-foreground')}>Prototyp v1</span> },
                        { key: 'v2', node: <span className={cn(chipClassName, 'h-5 border-foreground/40 px-1.5')}>Prototyp v2</span> },
                    ]}
                />
            }
        >
            <div className="absolute inset-0 overflow-hidden p-3">
                <div className="flex h-3.5 items-center justify-between gap-3">
                    <span className="flex items-center gap-1.5">
                        <Morph designed={designed} order={0} wireframe="border border-dashed border-foreground/35" design="bg-foreground" className="size-2.5" />
                        <Morph designed={designed} order={0} wireframe={WF_BAR} design="rounded-full bg-foreground/70" className="h-1.5 w-9" />
                    </span>
                    <span className="flex items-center gap-2">
                        {[0, 1, 2].map((link) => (
                            <Morph key={link} designed={designed} order={1} wireframe={WF_BAR} design="rounded-full bg-foreground/30" className="h-1 w-4" />
                        ))}
                    </span>
                </div>

                <div className="relative mt-3 h-20">
                    <div className="flex w-[50%] flex-col">
                        {/* The headline: two grey bars in the wireframe, the shop's real headline in the design. */}
                        <span className="relative block h-[2.375rem]">
                            <span data-show={!designed} className="absolute inset-x-0 top-0.5 flex flex-col gap-1.5 transition-opacity duration-300 data-[show=false]:opacity-0">
                                <span className={cn(WF_BAR, 'h-2 w-full rounded-[2px]')} />
                                <span className={cn(WF_BAR, 'h-2 w-[64%] rounded-[2px]')} />
                            </span>
                            <span
                                data-show={designed}
                                style={designed ? { transitionDelay: `${STAGGER_MS}ms` } : undefined}
                                className="absolute inset-0 text-[11.5px] leading-[1.2] font-semibold tracking-tight transition-opacity duration-300 data-[show=false]:opacity-0"
                            >
                                Swetry z polskiej wełny
                            </span>
                        </span>
                        <span className="mt-1.5 flex flex-col gap-1">
                            <Morph designed={designed} order={2} wireframe={WF_BAR} design="rounded-full bg-foreground/20" className="h-1 w-[92%]" />
                            <Morph designed={designed} order={2} wireframe={WF_BAR} design="rounded-full bg-foreground/20" className="h-1 w-[70%]" />
                        </span>
                        <Morph
                            designed={designed}
                            order={3}
                            wireframe="rounded-[3px] border border-dashed border-foreground/35"
                            design="rounded-[3px] bg-foreground"
                            className="mt-2.5 h-4 w-12"
                        />
                    </div>

                    <span className="absolute top-0 right-0 h-full w-[46%]">
                        <span data-show={!designed} className={cn('absolute inset-0 transition-opacity duration-300 data-[show=false]:opacity-0', WF_SLOT)}>
                            <SlotCross />
                        </span>
                        <span
                            data-show={designed}
                            data-grown={grown}
                            style={designed ? { transitionDelay: `${2 * STAGGER_MS}ms, 0ms` } : undefined}
                            className="absolute inset-0 origin-top-right overflow-hidden rounded-[4px] transition-[opacity,scale] duration-[300ms,450ms] ease-expo-out data-[grown=false]:scale-[0.78] data-[show=false]:opacity-0"
                        >
                            <img
                                src={HERO_PHOTO.src}
                                srcSet={HERO_PHOTO.srcSet}
                                sizes="160px"
                                width={HERO_PHOTO.width}
                                height={HERO_PHOTO.height}
                                alt=""
                                loading="lazy"
                                decoding="async"
                                draggable={false}
                                data-photo=""
                                className="size-full object-cover object-[64%_50%]"
                            />
                        </span>
                    </span>
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2">
                    {[0, 1, 2].map((card) => (
                        <Morph
                            key={card}
                            designed={designed}
                            order={3 + card}
                            wireframe="rounded-[4px] border border-dashed border-foreground/30"
                            design="rounded-[4px] border bg-background"
                            className="h-8"
                        >
                            <span className="absolute top-1.5 left-1.5 size-2 rounded-[2px] bg-foreground/80" />
                            <span className="absolute bottom-1.5 left-1.5 h-1 w-[60%] rounded-full bg-foreground/25" />
                        </Morph>
                    ))}
                </div>

                <Comment show={commented} resolved={resolved} />
            </div>
        </ArtifactFrame>
    );
}

/** The client's comment, pinned under the photo's corner: a question, then resolved. */
function Comment({ show, resolved }: { show: boolean; resolved: boolean }) {
    return (
        <span
            data-show={show}
            className="absolute top-[6.375rem] right-2 z-10 flex items-center gap-1.5 transition-[opacity,translate,scale] duration-300 ease-expo-out data-[show=false]:translate-y-1 data-[show=false]:scale-95 data-[show=false]:opacity-0"
        >
            <span className="rounded-md border bg-background px-2 py-1 text-[11px] leading-none font-medium whitespace-nowrap shadow-[0_0.1rem_0.4rem_rgb(0_0_0/0.08)] dark:bg-[oklch(0.22_0_0)] dark:shadow-none">
                <Swap
                    current={resolved ? 'resolved' : 'question'}
                    items={[
                        { key: 'question', node: <span className="py-px">Większe zdjęcie?</span> },
                        {
                            key: 'resolved',
                            node: (
                                <span className="flex items-center gap-1 py-px">
                                    <Check aria-hidden="true" className="size-3" strokeWidth={2.75} />
                                    Rozwiązane
                                </span>
                            ),
                        },
                    ]}
                />
            </span>
            <span className="flex size-[1.125rem] shrink-0 items-center justify-center rounded-[4px] rounded-bl-none bg-foreground text-[8px] font-semibold text-background">
                TF
            </span>
        </span>
    );
}
