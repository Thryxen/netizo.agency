import { Check, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ArtifactFrame, chipClassName, Swap, Tick, type TickStatus } from './artifact-parts';
import { ARTIFACT_MS, type StepState } from './process-data';
import { useStepClock } from './use-process-relay';

/** The brief's sections, with what each one ended up holding (shown from 14rem of artifact width). */
const SECTIONS = [
    { label: 'Cele biznesowe', detail: '3 cele' },
    { label: 'Grupa docelowa', detail: '2 persony' },
    { label: 'Zakres prac', detail: '12 pozycji' },
] as const;

/** Clock: sections 1, 2, 3 are written in turn (0–2), then the brief goes for approval (3) and is approved (4). */
const REVIEW = 3;
const APPROVED = 4;

/**
 * Odkrywanie: the brief in the client panel's "Dokumenty" vocabulary. Its sections get filled in one by one, then its
 * status goes Szkic → Do akceptacji → Zatwierdzone. Final frame: all three checked, approved.
 */
export function BriefArtifact({ state }: { state: StepState }) {
    const step = useStepClock(ARTIFACT_MS.brief, state);
    const written = Math.min(step, SECTIONS.length);
    const status = step >= APPROVED ? 'approved' : step === REVIEW ? 'review' : 'draft';

    const sectionStatus = (index: number): TickStatus => {
        if (index < written) {
            return 'done';
        }

        return state === 'active' && index === step ? 'running' : 'pending';
    };

    return (
        <ArtifactFrame
            icon={FileText}
            title="Brief: Twoja firma"
            aside={<span className="shrink-0 text-[11px] text-muted-foreground tabular-nums">{written}/3</span>}
        >
            <div className="flex h-full flex-col">
                <ul className="flex flex-1 flex-col justify-center gap-1 px-3">
                    {SECTIONS.map(({ label, detail }, index) => {
                        const tick = sectionStatus(index);

                        return (
                            <li key={label} className="flex h-8 items-center gap-2.5 text-[13px]">
                                <Tick status={tick} />
                                <span className={cn('min-w-0 flex-1 truncate transition-colors duration-300', tick === 'done' ? 'text-foreground' : 'text-muted-foreground')}>
                                    {label}
                                </span>
                                <span
                                    data-show={tick === 'done'}
                                    className="hidden shrink-0 text-[11px] text-muted-foreground tabular-nums transition-opacity duration-300 data-[show=false]:opacity-0 @[14rem]:inline"
                                >
                                    {detail}
                                </span>
                            </li>
                        );
                    })}
                </ul>

                <div className="flex h-11 shrink-0 items-center justify-between gap-2 border-t px-3">
                    <span className="text-muted-foreground">Status</span>
                    <Swap
                        current={status}
                        align="end"
                        items={[
                            {
                                key: 'draft',
                                node: <span className={cn(chipClassName, 'border-dashed border-foreground/30 font-normal text-muted-foreground')}>Szkic</span>,
                            },
                            {
                                key: 'review',
                                node: (
                                    <span className={cn(chipClassName, 'border-foreground/40')}>
                                        <span className="nz-relay-blink size-1.5 bg-foreground" />
                                        Do akceptacji
                                    </span>
                                ),
                            },
                            {
                                key: 'approved',
                                node: (
                                    <span className={cn(chipClassName, 'border-foreground bg-foreground text-background')}>
                                        <Check aria-hidden="true" className="size-3" strokeWidth={2.75} />
                                        Zatwierdzone
                                    </span>
                                ),
                            },
                        ]}
                    />
                </div>
            </div>
        </ArtifactFrame>
    );
}
