import { Check, LoaderCircle } from 'lucide-react';
import type { CSSProperties } from 'react';
import { useLiveLoop } from '@/components/motion/use-in-view-loop';
import { cn } from '@/lib/utils';
import { BentoTile, type BentoRivet, BentoTileText, type BentoService, liveVisualProps, tileGutterBottom, tileGutterTop, tileGutterX } from './bento-tile';

type StageStatus = 'pending' | 'running' | 'done';

type Stage = { label: string; took: string };

const STAGES: Stage[] = [
    { label: 'Build', took: '48 s' },
    { label: 'Testy', took: '72 s' },
    { label: 'Deploy', took: '21 s' },
    { label: 'Monitoring', took: 'aktywny' },
];

/** queued → each stage runs in turn → all green (static frame). */
const PHASE_MS = [700, 1100, 1300, 1000, 1100, 2600] as const;
const DONE = STAGES.length + 1;

/** The log line typed under the pipeline in each phase. */
const LOG = [
    'git push origin main',
    'build: obraz kontenera gotowy',
    'test: 248 testów, 0 błędów',
    'deploy: nowa wersja bez przestojów',
    'monitoring: wszystkie usługi działają',
    'Wdrożono w 2 min 21 s',
] as const;

function statusOf(stage: number, phase: number): StageStatus {
    if (phase === DONE || stage < phase - 1) {
        return 'done';
    }

    return stage === phase - 1 ? 'running' : 'pending';
}

const STATUS_TEXT: Record<Exclude<StageStatus, 'done'>, string> = { pending: 'w kolejce', running: 'w toku' };

/**
 * DevOps & Cloud: a deploy pipeline. Each stage goes pending → running (spinner) → done (check) and a log line types
 * out under it. A row of four from 28rem of tile width, a vertical list below that (container query).
 */
export function DevopsTile({ service, rivets }: { service: BentoService; rivets?: BentoRivet[] }) {
    const { ref, step, active } = useLiveLoop<HTMLDivElement>(PHASE_MS, { staticStep: DONE });

    return (
        <BentoTile className="lg:col-span-2" rivets={rivets}>
            <BentoTileText service={service} className={cn(tileGutterX, tileGutterTop)} />

            <div ref={ref} {...liveVisualProps(active)} className={cn('@container mt-auto pt-7', tileGutterX, tileGutterBottom)}>
                <ol className="grid gap-3 @md:grid-cols-4 @md:gap-0">
                    {STAGES.map((stage, index) => {
                        const status = statusOf(index, step);
                        const isLast = index === STAGES.length - 1;
                        const linkDone = statusOf(index + 1, step) !== 'pending';

                        return (
                            <li key={stage.label} className="relative flex items-center gap-3 @md:flex-col @md:items-start @md:gap-2.5">
                                {!isLast && (
                                    <>
                                        {/* Connector to the next stage, filled once that stage starts. */}
                                        <span className="absolute top-7 -bottom-3 left-3.5 w-px bg-border @md:hidden">
                                            <span
                                                data-on={linkDone}
                                                className="block size-full origin-top bg-foreground transition-transform duration-500 ease-expo-out data-[on=false]:scale-y-0"
                                            />
                                        </span>
                                        <span className="absolute top-3.5 right-2 left-9 hidden h-px bg-border @md:block">
                                            <span
                                                data-on={linkDone}
                                                className="block size-full origin-left bg-foreground transition-transform duration-500 ease-expo-out data-[on=false]:scale-x-0"
                                            />
                                        </span>
                                    </>
                                )}
                                <StatusBox status={status} />
                                <span className="flex min-w-0 flex-1 items-baseline justify-between gap-2 @md:flex-col @md:gap-0.5">
                                    <span className="truncate text-[13px] font-medium">{stage.label}</span>
                                    <span className="w-16 shrink-0 text-right text-[11px] text-muted-foreground tabular-nums @md:w-auto @md:text-left">
                                        {status === 'done' ? stage.took : STATUS_TEXT[status]}
                                    </span>
                                </span>
                            </li>
                        );
                    })}
                </ol>

                <div className="mt-5 flex items-center gap-2 overflow-hidden rounded-md border bg-muted/50 px-3 py-2 font-mono text-[11px] leading-5 text-muted-foreground">
                    <span className="shrink-0 text-foreground/40">$</span>
                    <span key={step} className="nz-bento-type min-w-0 truncate">
                        {[...LOG[step]].map((character, index) => (
                            <span key={index} style={{ '--i': index } as CSSProperties}>
                                {character}
                            </span>
                        ))}
                    </span>
                </div>
            </div>
        </BentoTile>
    );
}

function StatusBox({ status }: { status: StageStatus }) {
    return (
        <span
            className={cn(
                'relative z-10 flex size-7 shrink-0 items-center justify-center rounded-md border bg-background',
                status === 'done' && 'border-foreground bg-foreground text-background',
                status === 'running' && 'border-foreground text-foreground',
                status === 'pending' && 'border-dashed border-input text-muted-foreground',
            )}
        >
            {status === 'done' && <Check className="size-3.5" strokeWidth={2.5} />}
            {status === 'running' && <LoaderCircle className="size-3.5 animate-spin" strokeWidth={2.25} />}
        </span>
    );
}
