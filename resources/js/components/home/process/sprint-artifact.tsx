import { Check, GitBranch, LoaderCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ArtifactFrame, chipClassName, Tick, type TickStatus } from './artifact-parts';
import { ARTIFACT_MS, type StepState } from './process-data';
import { useStepClock } from './use-process-relay';

/** The sprint's commits, oldest first, with the day each one landed (shown from 14rem of artifact width). */
const COMMITS = [
    { message: 'feat: koszyk', day: 'pon.' },
    { message: 'fix: stopka', day: 'śr.' },
    { message: 'feat: płatności', day: 'dziś' },
] as const;

/** Clock: nothing yet (0), commits 1–3 land one by one, each checked by CI (1–3), all green (4), staging updated (5). */
const STAGING = 5;

/**
 * Rozwój: the sprint's feed. Commits tick in (CI runs, then a check) and the sprint ends on the staging server the
 * client can open, with the demo every two weeks. Final frame: three green commits, staging up to date.
 */
export function SprintArtifact({ state }: { state: StepState }) {
    const step = useStepClock(ARTIFACT_MS.sprint, state);
    const landed = Math.min(step, COMMITS.length);
    const checking = step >= 1 && step <= COMMITS.length ? step - 1 : -1;
    const updated = step >= STAGING;

    const commitStatus = (index: number): TickStatus => {
        if (index >= landed) {
            return 'pending';
        }

        return index === checking ? 'running' : 'done';
    };

    return (
        <ArtifactFrame
            icon={GitBranch}
            title="Sprint 4"
            aside={
                <span className={cn(chipClassName, 'h-5 gap-1 px-1.5', landed === 0 && 'border-dashed border-foreground/30 font-normal text-muted-foreground')}>
                    {checking >= 0 ? (
                        <LoaderCircle aria-hidden="true" className="size-3 animate-spin" strokeWidth={2.5} />
                    ) : (
                        landed > 0 && <Check aria-hidden="true" className="size-3" strokeWidth={2.75} />
                    )}
                    CI
                </span>
            }
        >
            <div className="flex h-full flex-col">
                <ul className="flex flex-1 flex-col justify-center gap-0.5 px-3">
                    {COMMITS.map(({ message, day }, index) => {
                        const status = commitStatus(index);
                        const shown = index < landed;

                        return (
                            <li key={message} className="relative flex h-7 items-center gap-2.5 text-[13px]">
                                <Tick status={status} running="spin" />
                                <span className="relative min-w-0 flex-1">
                                    <span
                                        data-show={!shown}
                                        className="absolute top-1/2 left-0 h-1.5 w-[58%] -translate-y-1/2 rounded-full bg-foreground/10 transition-opacity duration-200 data-[show=false]:opacity-0"
                                    />
                                    <span
                                        data-show={shown}
                                        className="block truncate transition-[opacity,translate] duration-300 ease-expo-out data-[show=false]:-translate-x-1 data-[show=false]:opacity-0"
                                    >
                                        {message}
                                    </span>
                                </span>
                                <span
                                    data-show={shown}
                                    className="hidden shrink-0 text-[11px] text-muted-foreground transition-opacity duration-300 data-[show=false]:opacity-0 @[14rem]:inline"
                                >
                                    {day}
                                </span>
                            </li>
                        );
                    })}
                </ul>

                <div className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-1.5 border-t px-3 py-2.5">
                    <span className="flex min-w-0 items-center gap-1.5">
                        <span
                            data-on={updated}
                            className="size-1.5 shrink-0 bg-foreground transition-opacity duration-300 data-[on=false]:opacity-25"
                        />
                        <span
                            data-on={updated}
                            className="truncate font-mono text-[11px] leading-5 transition-colors duration-300 data-[on=false]:text-muted-foreground"
                        >
                            staging.twojafirma.pl
                        </span>
                    </span>
                    <span
                        data-on={updated}
                        className={cn(chipClassName, 'h-5 px-1.5 transition-colors duration-300 data-[on=false]:font-normal data-[on=false]:text-muted-foreground data-[on=true]:border-foreground/40')}
                    >
                        Demo co 2 tygodnie
                    </span>
                </div>
            </div>
        </ArtifactFrame>
    );
}
