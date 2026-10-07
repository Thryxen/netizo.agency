import { type RefObject, useEffect, useState, useSyncExternalStore } from 'react';
import { useCanAnimate } from '@/components/motion/motion-env';
import { useInViewLoop } from '@/components/motion/use-in-view-loop';
import { HOLD_MS, REWIND_MS, STEP_MS, type StepState } from './process-data';

const STEP_COUNT = STEP_MS.length;
const ALL_DONE: StepState[] = Array.from({ length: STEP_COUNT }, () => 'done');
const ALL_PENDING: StepState[] = Array.from({ length: STEP_COUNT }, () => 'pending');

/** Relay cursor: a step index while that step holds the baton, or one of these. */
const FINISHED = STEP_COUNT;
const REWIND = -1;
const RESET = -2;

/** md+: the steps sit side by side (a row of four, or 2 × 2) and run as one relay. Below: a list, step by step. */
const ROW_QUERY = '(min-width: 48rem)';

const subscribeToRowQuery = (onChange: () => void): (() => void) => {
    const query = window.matchMedia(ROW_QUERY);
    query.addEventListener('change', onChange);

    return () => query.removeEventListener('change', onChange);
};

function useRowLayout(): boolean {
    return useSyncExternalStore(
        subscribeToRowQuery,
        () => window.matchMedia(ROW_QUERY).matches,
        () => true,
    );
}

function statesAt(cursor: number): StepState[] {
    if (cursor >= FINISHED) {
        return ALL_DONE;
    }

    if (cursor < 0) {
        return ALL_PENDING;
    }

    return ALL_PENDING.map((_, index) => (index < cursor ? 'done' : index === cursor ? 'active' : 'pending'));
}

type ListRun = { states: StepState[]; startedAt: number[] };

const FRESH_LIST: ListRun = { states: ALL_PENDING, startedAt: ALL_PENDING.map(() => 0) };

export type ProcessRelay = {
    /** The list of steps (the row's in-view gate). */
    rowRef: RefObject<HTMLOListElement | null>;
    /** Each step's artifact (below md every step runs when its own artifact is seen). */
    artifactRefs: RefObject<HTMLDivElement | null>[];
    states: StepState[];
    /** Something is in view and moving: CSS loops (blinking bits) may run. */
    live: boolean;
    /** A quiet reset is being applied: transitions are switched off for two frames (data-relay-instant). */
    instant: boolean;
};

/**
 * The relay's director. SSR, no JS and reduced motion: every step finished. Once the app runs (motion allowed) the
 * steps quietly return to their first frame (transitions off), and:
 *
 * - md+ (row of four, 2 × 2): when the row comes into view (first pixel + 100 px, useInViewLoop) step 1 takes the baton
 *   at once; each step holds it for STEP_MS while its artifact plays and the rail runs to the next marker. After step 4
 *   the row holds, rewinds softly and runs again while in view. Leaving the view resets it quietly, so it starts fresh
 *   (and nothing runs offscreen).
 * - Below md (a vertical list): each step plays when its own artifact comes into view and resets once it is out of view.
 */
export function useProcessRelay(): ProcessRelay {
    const canAnimate = useCanAnimate();
    const rowLayout = useRowLayout();
    const row = useInViewLoop<HTMLOListElement>();
    const first = useInViewLoop<HTMLDivElement>();
    const second = useInViewLoop<HTMLDivElement>();
    const third = useInViewLoop<HTMLDivElement>();
    const fourth = useInViewLoop<HTMLDivElement>();
    const artifacts = [first, second, third, fourth];

    const [prepared, setPrepared] = useState(false);
    const [instant, setInstant] = useState(false);
    const [cursor, setCursor] = useState<number>(FINISHED);
    const [listRun, setListRun] = useState<ListRun>({ states: ALL_DONE, startedAt: ALL_PENDING.map(() => 0) });
    const [preparedLayout, setPreparedLayout] = useState(rowLayout);

    // Once the app runs (and on a layout switch): back to the first frame, quietly.
    useEffect(() => {
        if ((prepared && preparedLayout === rowLayout) || !canAnimate()) {
            return;
        }

        setPrepared(true);
        setPreparedLayout(rowLayout);
        setCursor(RESET);
        setListRun(FRESH_LIST);
        setInstant(true);
    }, [prepared, preparedLayout, rowLayout, canAnimate]);

    // The quiet reset lasts two frames: styles are computed without transitions, then transitions come back.
    useEffect(() => {
        if (!instant) {
            return;
        }

        let secondFrame = 0;
        const firstFrame = window.requestAnimationFrame(() => {
            secondFrame = window.requestAnimationFrame(() => setInstant(false));
        });

        return () => {
            window.cancelAnimationFrame(firstFrame);
            window.cancelAnimationFrame(secondFrame);
        };
    }, [instant]);

    // Row: the relay clock.
    useEffect(() => {
        if (!prepared || !rowLayout) {
            return;
        }

        if (!row.active) {
            if (cursor !== RESET) {
                setCursor(RESET);
                setInstant(true);
            }

            return;
        }

        if (cursor === RESET) {
            if (!instant) {
                setCursor(0);
            }

            return;
        }

        const delay = cursor === FINISHED ? HOLD_MS : cursor === REWIND ? REWIND_MS : STEP_MS[cursor];
        const next = cursor === FINISHED ? REWIND : cursor === REWIND ? 0 : cursor + 1;
        const timer = window.setTimeout(() => setCursor(next), delay);

        return () => window.clearTimeout(timer);
    }, [prepared, rowLayout, row.active, cursor, instant]);

    // List: a step starts when its artifact is in view, but never while the step before it is still playing (two steps
    // fit on a tall phone screen; they take turns, like the row). Out of view it goes back to its first frame.
    const inView = artifacts.map((artifact) => artifact.active);
    const inViewKey = inView.map(Number).join('');
    const listKey = listRun.states.join();

    useEffect(() => {
        if (!prepared || rowLayout || instant) {
            return;
        }

        const now = performance.now();

        setListRun((current) => {
            const states: StepState[] = [];

            current.states.forEach((state, index) => {
                const previousPlaying = index > 0 && states[index - 1] === 'active';

                if (inViewKey[index] !== '1') {
                    states.push('pending');
                } else {
                    states.push(state === 'pending' && !previousPlaying ? 'active' : state);
                }
            });

            if (states.every((state, index) => state === current.states[index])) {
                return current;
            }

            return { states, startedAt: current.startedAt.map((time, index) => (states[index] === 'active' && current.states[index] !== 'active' ? now : time)) };
        });
    }, [prepared, rowLayout, instant, inViewKey, listKey]);

    useEffect(() => {
        if (rowLayout) {
            return;
        }

        const deadlines = listRun.states.map((state, index) => (state === 'active' ? listRun.startedAt[index] + STEP_MS[index] : Infinity));
        const nearest = Math.min(...deadlines);

        if (nearest === Infinity) {
            return;
        }

        const timer = window.setTimeout(
            () => {
                const now = performance.now() + 10;

                setListRun((current) => ({
                    ...current,
                    states: current.states.map((state, index) => (state === 'active' && current.startedAt[index] + STEP_MS[index] <= now ? 'done' : state)),
                }));
            },
            Math.max(0, nearest - performance.now()),
        );

        return () => window.clearTimeout(timer);
    }, [rowLayout, listRun]);

    const reduced = row.reducedMotion;
    const states = reduced || !prepared ? ALL_DONE : rowLayout ? statesAt(cursor) : listRun.states;
    const live = !reduced && (rowLayout ? row.active : inView.some(Boolean));

    return {
        rowRef: row.ref,
        artifactRefs: artifacts.map((artifact) => artifact.ref),
        states,
        live,
        instant,
    };
}

/**
 * An artifact's own clock: 0 (its first frame) while pending, its final frame (`durations.length`) when done, and
 * while active it steps from 0 through `durations` to the final frame. Restarts from 0 every time the step becomes
 * active again (derived during render, so the first active frame is never a stale one).
 */
export function useStepClock(durations: readonly number[], state: StepState): number {
    const final = durations.length;
    const [clock, setClock] = useState<{ state: StepState; step: number }>({ state, step: state === 'done' ? final : 0 });
    let current = clock;

    if (clock.state !== state) {
        current = { state, step: state === 'done' ? final : 0 };
        setClock(current);
    }

    const { step } = current;

    useEffect(() => {
        if (state !== 'active' || step >= final) {
            return;
        }

        const timer = window.setTimeout(() => setClock((value) => (value.state === 'active' ? { ...value, step: value.step + 1 } : value)), durations[step]);

        return () => window.clearTimeout(timer);
    }, [state, step, final, durations]);

    return state === 'pending' ? 0 : state === 'done' ? final : step;
}
