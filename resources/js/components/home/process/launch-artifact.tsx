import { Check, Globe, LoaderCircle } from 'lucide-react';
import { PanelMark } from '@/components/home/panel/panel-window';
import { cn } from '@/lib/utils';
import { ArtifactFrame, chipClassName, Swap, type TickStatus } from './artifact-parts';
import { ARTIFACT_MS, type StepState } from './process-data';
import { useStepClock } from './use-process-relay';

const PIPELINE = ['Testy', 'Publikacja', 'Monitoring'] as const;

/** Clock: queued (0), Testy, Publikacja, Monitoring run in turn (1–3), the site is live (4), the client panel is on (5). */
const LIVE = 4;
const PANEL = 5;

/** The last 30 days of availability as bits: every day up, one short dip (99,9%, not a perfect 100). */
const UPTIME_DAYS = Array.from({ length: 30 }, (_, day) => day);
const DIP_DAY = 17;

/** The bits light up left to right once the site is live (ms between two days). */
const UPTIME_STAGGER_MS = 16;

function pipeStatus(index: number, step: number): TickStatus {
    if (step >= LIVE || index < step - 1) {
        return 'done';
    }

    return index === step - 1 ? 'running' : 'pending';
}

/**
 * Wdrożenie: the release. Testy, Publikacja and Monitoring go green in turn, the site is live (availability with the
 * last 30 days as bits) and the client panel is switched on. Final frame: all green, live, panel active.
 */
export function LaunchArtifact({ state }: { state: StepState }) {
    const step = useStepClock(ARTIFACT_MS.launch, state);
    const live = step >= LIVE;
    const site = live ? 'live' : step >= 1 ? 'deploying' : 'queued';

    return (
        <ArtifactFrame
            icon={Globe}
            title="twojafirma.pl"
            titleClassName="font-mono text-[12px] font-normal"
            aside={
                <Swap
                    current={site}
                    align="end"
                    className="text-[11px] text-muted-foreground"
                    items={[
                        { key: 'queued', node: 'w kolejce' },
                        { key: 'deploying', node: 'wdrażanie' },
                        {
                            key: 'live',
                            node: (
                                <span className="flex items-center gap-1.5 text-foreground">
                                    <span className="nz-relay-blink size-1.5 bg-foreground" />
                                    na żywo
                                </span>
                            ),
                        },
                    ]}
                />
            }
        >
            <div className="flex h-full flex-col">
                <div className="flex flex-1 flex-col justify-center gap-4 px-3">
                    <ol className="grid grid-cols-3">
                        {PIPELINE.map((label, index) => {
                            const status = pipeStatus(index, step);
                            const linkDone = index < PIPELINE.length - 1 && pipeStatus(index + 1, step) !== 'pending';

                            return (
                                <li key={label} className="relative flex flex-col items-start gap-1.5">
                                    {index < PIPELINE.length - 1 && (
                                        <span className="absolute top-3 right-2 left-8 h-px bg-border">
                                            <span
                                                data-on={linkDone}
                                                className="block size-full origin-left bg-foreground transition-transform duration-300 ease-expo-out data-[on=false]:scale-x-0"
                                            />
                                        </span>
                                    )}
                                    <PipeBox status={status} />
                                    <span className="text-[11px] leading-4 font-medium tracking-tight @[14rem]:text-[12px] @[14rem]:tracking-normal">{label}</span>
                                </li>
                            );
                        })}
                    </ol>

                    <div className="flex flex-col gap-2 border-t pt-3">
                        <span className="flex items-baseline justify-between gap-3 whitespace-nowrap">
                            <span>
                                <span className="text-muted-foreground">Dostępność</span>{' '}
                                <span data-on={live} className="text-[14px] font-semibold tabular-nums transition-opacity duration-300 data-[on=false]:opacity-30">
                                    99,9%
                                </span>
                            </span>
                            <span className="hidden text-[11px] text-muted-foreground @[14rem]:inline">ostatnie 30 dni</span>
                        </span>
                        <span className="grid grid-cols-[repeat(30,minmax(0,1fr))] gap-[2px]">
                            {UPTIME_DAYS.map((day) => (
                                <span
                                    key={day}
                                    data-on={live}
                                    style={live ? { transitionDelay: `${day * UPTIME_STAGGER_MS}ms` } : undefined}
                                    className={cn(
                                        'aspect-square rounded-[1px] transition-opacity duration-200 data-[on=false]:opacity-15',
                                        day === DIP_DAY ? 'bg-foreground/25' : 'bg-foreground',
                                    )}
                                />
                            ))}
                        </span>
                    </div>
                </div>

                <div className="flex h-11 shrink-0 items-center border-t px-3">
                    <span
                        data-show={step >= PANEL}
                        className={cn(
                            chipClassName,
                            'border-foreground/40 transition-[opacity,translate] duration-300 ease-expo-out data-[show=false]:translate-y-1 data-[show=false]:opacity-0',
                        )}
                    >
                        <PanelMark className="size-3.5 rounded-[2px]" />
                        Panel klienta: aktywny
                    </span>
                </div>
            </div>
        </ArtifactFrame>
    );
}

/** A pipeline stage: dashed while queued, a spinner while running, filled with a check when done (as in the bento). */
function PipeBox({ status }: { status: TickStatus }) {
    return (
        <span
            className={cn(
                'relative z-10 flex size-6 shrink-0 items-center justify-center rounded-md border bg-background transition-colors duration-300',
                status === 'done' && 'border-foreground bg-foreground text-background',
                status === 'running' && 'border-foreground text-foreground',
                status === 'pending' && 'border-dashed border-foreground/30',
            )}
        >
            {status === 'done' && <Check aria-hidden="true" className="size-3.5" strokeWidth={2.5} />}
            {status === 'running' && <LoaderCircle aria-hidden="true" className="size-3.5 animate-spin" strokeWidth={2.25} />}
        </span>
    );
}
