import { Check, Globe, LoaderCircle } from 'lucide-react';
import { PanelMark } from '@/components/home/panel/panel-window';
import { cn } from '@/lib/utils';
import { ArtifactFrame, chipClassName, Swap, type TickStatus } from './artifact-parts';
import { ARTIFACT_MS, type StepState } from './process-data';
import { useStepClock } from './use-process-relay';

const PIPELINE = ['Build', 'Testy', 'Deploy'] as const;

/** Clock: queued (0), Build, Testy, Deploy run in turn (1–3), the site is live (4), the client panel is on (5). */
const LIVE = 4;
const PANEL = 5;

/** Response times of the last hours (relative, 0–100), integers so the path is identical on server and client. */
const SPARK = [44, 42, 45, 43, 41, 44, 40, 42, 39, 41, 43, 39, 40, 38, 40, 37] as const;
const SPARK_W = 96;
const SPARK_H = 24;
const sparkY = (value: number): number => SPARK_H - 4 - ((value - 34) / 14) * (SPARK_H - 8);
const SPARK_STEP = SPARK_W / (SPARK.length - 1);
const SPARK_PATH = SPARK.map((value, index) => `${index === 0 ? 'M' : 'L'}${(index * SPARK_STEP).toFixed(2)} ${sparkY(value).toFixed(2)}`).join('');
const SPARK_AREA = `${SPARK_PATH}L${SPARK_W} ${SPARK_H}L0 ${SPARK_H}Z`;
const SPARK_END_Y = sparkY(SPARK[SPARK.length - 1]);

function pipeStatus(index: number, step: number): TickStatus {
    if (step >= LIVE || index < step - 1) {
        return 'done';
    }

    return index === step - 1 ? 'running' : 'pending';
}

/**
 * Wdrożenie: the release. Build, Testy and Deploy go green in turn, the site is live (availability with its sparkline)
 * and the client panel is switched on. Final frame: all green, live, panel active.
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
                                    <span className="vx-relay-blink size-1.5 bg-foreground" />
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
                                    <span className="text-[12px] leading-4 font-medium">{label}</span>
                                </li>
                            );
                        })}
                    </ol>

                    <div className="flex items-center justify-between gap-3 border-t pt-3.5">
                        <span className="whitespace-nowrap">
                            <span className="text-muted-foreground">Dostępność</span>{' '}
                            <span data-on={live} className="text-[14px] font-semibold tabular-nums transition-opacity duration-300 data-[on=false]:opacity-30">
                                99,9%
                            </span>
                        </span>
                        <svg viewBox={`0 0 ${SPARK_W} ${SPARK_H}`} aria-hidden="true" className="h-6 w-[4.5rem] shrink-0 overflow-visible @[14rem]:w-24">
                            <path
                                d={SPARK_AREA}
                                data-on={live}
                                className="fill-foreground/[0.07] transition-opacity delay-300 duration-500 data-[on=false]:opacity-0 data-[on=false]:delay-0"
                            />
                            <path
                                d={SPARK_PATH}
                                pathLength={1}
                                data-on={live}
                                strokeWidth={1.5}
                                strokeLinejoin="round"
                                className="fill-none stroke-foreground [stroke-dasharray:1] transition-[stroke-dashoffset] duration-700 ease-expo-out data-[on=false]:[stroke-dashoffset:1]"
                            />
                            <rect
                                x={SPARK_W - 2}
                                y={SPARK_END_Y - 2}
                                width={4}
                                height={4}
                                data-on={live}
                                className={cn('fill-foreground transition-opacity delay-500 duration-200 data-[on=false]:opacity-0 data-[on=false]:delay-0', live && 'vx-relay-blink')}
                            />
                        </svg>
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
