import { useEffect, useRef, useState } from 'react';

/**
 * The two scenes' loops as phase lists (ms). Each scene is a pure function of its phase; CSS transitions and the few
 * keyframes in panel-styles do the motion inside a phase. `hold` is the finished frame (SSR, no JS, reduced motion),
 * `reset` returns to the first frame; a scene that starts (first time in view, or picked in the toggle) plays its
 * reset at once, so motion begins the moment it is seen.
 */

/**
 * Tablica, ≈ 8.9 s: the client adds a task (the pointer opens "Dodaj task", the title types in, a screenshot is
 * pasted, priority set, submitted), the card lands in Do zrobienia, moves to W trakcie (Netizo joins), then to
 * Gotowe, and a comment arrives.
 */
export const BOARD_PHASE_MS = [560, 200, 1100, 520, 420, 300, 420, 200, 850, 1250, 620, 2150, 420] as const;

export const BOARD = {
    toAdd: 0,
    clickAdd: 1,
    type: 2,
    paste: 3,
    toPriority: 4,
    priority: 5,
    toSubmit: 6,
    submit: 7,
    landed: 8,
    progress: 9,
    done: 10,
    hold: 11,
    reset: 12,
} as const;

/**
 * Czas pracy, ≈ 8.5 s: the running task's timer ticks to 1:05:00 and stops, its time and cost are logged, the
 * month's total counts up, and the settlement arrives.
 */
export const TIME_PHASE_MS = [3000, 650, 1250, 3150, 420] as const;

export const TIME = {
    tick: 0,
    stop: 1,
    logged: 2,
    hold: 3,
    reset: 4,
} as const;

type SceneLoopOptions = {
    /** In view, tab visible, motion allowed (the stage's gate). */
    live: boolean;
    /** This scene is the one picked in the toggle. */
    selected: boolean;
    reducedMotion: boolean;
    holdStep: number;
    resetStep: number;
};

/**
 * Step clock for one scene. Runs only while live and selected; pausing keeps the current step and resumes it. Each
 * fresh start (the first run, or the scene picked again in the toggle) jumps straight to `reset`. Under reduced
 * motion it always returns the finished frame.
 */
export function useSceneLoop(durations: readonly number[], { live, selected, reducedMotion, holdStep, resetStep }: SceneLoopOptions): number {
    const count = durations.length;
    const [step, setStep] = useState(holdStep);
    const freshStart = useRef(true);
    const wasSelected = useRef(selected);
    const running = live && selected && !reducedMotion;

    useEffect(() => {
        if (selected && !wasSelected.current) {
            freshStart.current = true;
        }

        wasSelected.current = selected;
    }, [selected]);

    useEffect(() => {
        if (!running) {
            return;
        }

        const restart = freshStart.current && step !== resetStep;

        if (!restart) {
            freshStart.current = false;
        }

        const timer = window.setTimeout(
            () => {
                freshStart.current = false;
                setStep((current) => (restart ? resetStep : (current + 1) % count));
            },
            restart ? 0 : durations[step],
        );

        return () => window.clearTimeout(timer);
    }, [running, step, count, durations, resetStep]);

    return reducedMotion ? holdStep : step;
}
