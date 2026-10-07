import { ChevronLeft, ChevronRight } from 'lucide-react';
import { type ReactNode, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { formatZloty, tween } from '@/components/home/bento/bento-motion';
import { cn } from '@/lib/utils';
import { costOf, formatClock, formatMinutes, HOURLY_RATE, LIVE_ROW, MINUTES_BEFORE_STOP, MONTH_MINUTES, TIME_ROWS, TIMER_START_SECONDS } from './panel-data';
import { TIME } from './panel-timeline';

const TICK_MS = 1000;
const MAX_TICKS = 2;
const TIMER_END_SECONDS = LIVE_ROW.minutes * 60;

const netto = (minutes: number): string => `${formatZloty(costOf(minutes))} netto`;

/** Status colour of "W trakcie" (as on the board), small and muted. */
const RUNNING_DOT = 'bg-[oklch(0.62_0.13_255)]';

const ROW_GRID = 'grid grid-cols-[minmax(0,1fr)_7.4em_7.2em] items-center gap-[0.8em] px-[1em] @min-[32.5rem]/panel:grid-cols-[minmax(0,1fr)_8em_7.6em]';

/**
 * Czas pracy: October's tasks with their time and cost at the client's own rate. The running task's timer ticks
 * (digits roll), stops at 1:05:00 and is logged as 1 h 05 min with its cost; then the month's total counts up.
 * Totals are written through refs (no re-render per frame); React only ever renders their final text.
 */
export function TimeScene({ step, live }: { step: number; live: boolean }) {
    const [ticks, setTicks] = useState(0);
    const timeRef = useRef<HTMLSpanElement>(null);
    const costRef = useRef<HTMLSpanElement>(null);
    const running = step === TIME.tick || step === TIME.stop || step === TIME.reset;

    useEffect(() => {
        if (step !== TIME.tick) {
            setTicks(0);

            return;
        }

        if (!live) {
            return;
        }

        const timer = window.setInterval(() => setTicks((current) => Math.min(MAX_TICKS, current + 1)), TICK_MS);

        return () => window.clearInterval(timer);
    }, [step, live]);

    useLayoutEffect(() => {
        const time = timeRef.current;
        const cost = costRef.current;

        if (!time || !cost) {
            return;
        }

        const show = (minutes: number): void => {
            time.textContent = formatMinutes(minutes);
            cost.textContent = netto(minutes);
        };

        if (step === TIME.tick || step === TIME.stop) {
            const wrapped = time.textContent !== formatMinutes(MINUTES_BEFORE_STOP);

            show(MINUTES_BEFORE_STOP);

            // A new loop: the month's total steps back to before the running task, fading in rather than jumping.
            if (wrapped && live) {
                time.parentElement?.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 350, easing: 'ease-out' });
            }

            return;
        }

        if (step !== TIME.logged || !live) {
            show(MONTH_MINUTES);

            return;
        }

        show(MINUTES_BEFORE_STOP);

        return tween({ from: MINUTES_BEFORE_STOP, to: MONTH_MINUTES, duration: 1000, delay: 150, onUpdate: (value) => show(Math.round(value)) });
    }, [step, live]);

    const seconds = step === TIME.tick ? TIMER_START_SECONDS + ticks : step === TIME.reset ? TIMER_START_SECONDS : TIMER_END_SECONDS;

    return (
        <div className="flex h-full flex-col">
            <div className="flex h-[2.6em] items-center justify-between gap-[1em]">
                <span className="text-[1.45em] leading-none font-semibold tracking-tight">Czas pracy</span>
                <span className="flex h-[2.6em] shrink-0 items-center rounded-[0.45em] border">
                    <ChevronLeft aria-hidden="true" className="mx-[0.5em] size-[1.05em] text-muted-foreground" strokeWidth={1.75} />
                    <span className="border-x px-[0.8em] text-[1em] leading-[2.5] font-medium whitespace-nowrap">Październik 2026</span>
                    <ChevronRight aria-hidden="true" className="mx-[0.5em] size-[1.05em] text-muted-foreground" strokeWidth={1.75} />
                </span>
            </div>

            <div className="mt-[1.2em] grid grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] overflow-hidden rounded-[0.6em] border">
                <div className="min-w-0 px-[1.1em] py-[0.9em]">
                    <span className="block text-[0.95em] text-muted-foreground">Razem w miesiącu</span>
                    <span className="block">
                        <span ref={timeRef} className="mt-[0.2em] block text-[2.15em] leading-[1.15] font-semibold tracking-[-0.03em] whitespace-nowrap tabular-nums">
                            {formatMinutes(MONTH_MINUTES)}
                        </span>
                        <span ref={costRef} className="block text-[1.05em] whitespace-nowrap text-muted-foreground tabular-nums">
                            {netto(MONTH_MINUTES)}
                        </span>
                    </span>
                </div>
                <div className="min-w-0 border-l bg-muted/40 px-[1.1em] py-[0.9em]">
                    <span className="block text-[0.95em] text-muted-foreground">Twoja stawka</span>
                    <span className="mt-[0.35em] block text-[1.3em] leading-[1.2] font-semibold tracking-tight whitespace-nowrap tabular-nums">
                        {formatZloty(HOURLY_RATE)}/h
                    </span>
                    <span className="block text-[0.95em] text-muted-foreground">netto</span>
                </div>
            </div>

            <div className="mt-[1.2em] overflow-hidden rounded-[0.6em] border">
                <div className={cn(ROW_GRID, 'h-[2.4em] bg-muted/50 text-[0.9em] text-muted-foreground')}>
                    <span>Zadanie</span>
                    <span className="text-right">Czas</span>
                    <span className="text-right">Koszt</span>
                </div>
                {TIME_ROWS.map((row) =>
                    row.id === LIVE_ROW.id ? (
                        <LiveRow key={row.id} step={step} running={running} seconds={seconds} />
                    ) : (
                        <div key={row.id} className={cn(ROW_GRID, 'h-[3em] border-t text-[1em]')}>
                            <TaskName id={row.id} title={row.title} />
                            <span className="text-right whitespace-nowrap tabular-nums">{formatMinutes(row.minutes)}</span>
                            <span className="text-right whitespace-nowrap tabular-nums">{formatZloty(costOf(row.minutes))}</span>
                        </div>
                    ),
                )}
            </div>
        </div>
    );
}

function TaskName({ id, title, children }: { id: number; title: string; children?: ReactNode }) {
    return (
        <span className="flex min-w-0 items-center gap-[0.5em]">
            <span className="shrink-0 text-muted-foreground tabular-nums">#{id}</span>
            <span className="truncate">{title}</span>
            {children}
        </span>
    );
}

type LiveRowProps = { step: number; running: boolean; seconds: number };

/** The task being worked on: "W trakcie" with a live timer, until it is logged with its time and cost. */
function LiveRow({ step, running, seconds }: LiveRowProps) {
    return (
        <div
            data-running={running}
            className={cn(ROW_GRID, 'h-[3em] border-t text-[1em] transition-colors duration-500 data-[running=true]:bg-foreground/[0.035]')}
        >
            <TaskName id={LIVE_ROW.id} title={LIVE_ROW.title}>
                <span
                    data-show={running}
                    className="hidden shrink-0 rounded-[0.3em] border px-[0.4em] py-[0.05em] text-[0.82em] whitespace-nowrap text-muted-foreground transition-opacity duration-300 data-[show=false]:opacity-0 @min-[32.5rem]/panel:inline"
                >
                    W trakcie
                </span>
            </TaskName>

            <span className="grid justify-items-end">
                <span
                    data-show={running}
                    className="col-start-1 row-start-1 flex items-center gap-[0.45em] transition-[opacity,translate] delay-150 duration-300 ease-expo-out data-[show=false]:-translate-y-[0.4em] data-[show=false]:opacity-0 data-[show=false]:delay-0 data-[show=false]:duration-150"
                >
                    <span className={cn('size-[0.5em] shrink-0 rounded-[0.1em]', RUNNING_DOT, step === TIME.tick && 'nz-panel-pulse')} />
                    <RollingClock seconds={seconds} />
                </span>
                <span
                    data-show={!running}
                    className="col-start-1 row-start-1 font-medium whitespace-nowrap tabular-nums transition-[opacity,translate] delay-150 duration-300 ease-expo-out data-[show=false]:translate-y-[0.4em] data-[show=false]:opacity-0 data-[show=false]:delay-0 data-[show=false]:duration-150"
                >
                    {formatMinutes(LIVE_ROW.minutes)}
                </span>
            </span>

            <span className="grid justify-items-end">
                <span data-show={running} className="col-start-1 row-start-1 text-muted-foreground transition-opacity delay-150 duration-200 data-[show=false]:opacity-0 data-[show=false]:delay-0 data-[show=false]:duration-150">
                    –
                </span>
                <span
                    data-show={!running}
                    className="col-start-1 row-start-1 font-medium whitespace-nowrap tabular-nums transition-[opacity,translate] delay-300 duration-300 ease-expo-out data-[show=false]:translate-y-[0.4em] data-[show=false]:opacity-0 data-[show=false]:delay-0 data-[show=false]:duration-150"
                >
                    {formatZloty(costOf(LIVE_ROW.minutes))}
                </span>
            </span>
        </div>
    );
}

/** h:mm:ss in tabular figures; a digit that changes rolls in from below. */
function RollingClock({ seconds }: { seconds: number }) {
    return (
        <span className="flex font-medium tabular-nums">
            {[...formatClock(seconds)].map((character, index) => (
                <span key={index} className="relative overflow-hidden">
                    <span key={character} className="nz-panel-roll block">
                        {character}
                    </span>
                </span>
            ))}
        </span>
    );
}
