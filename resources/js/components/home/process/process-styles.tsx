/**
 * Styles for the relay, colocated like the bento's and the panel's (app.css is shared): a plain <style> that renders
 * the same on the server and the client. Only transform and opacity (and colours) are animated.
 *
 * Everything keys off `data-step-state` on each step (pending | active | done); without JS every step is `done`, so
 * the static frame is the finished row: rail full, markers filled, artifacts at their final frame.
 *
 * - Rail: each step owns one segment (md+: along its cell's top edge; below md: down the left rail to the next step).
 *   It grows over the step's time (`--relay-ms`) while the step holds the baton; a rewind fades it out, then it snaps
 *   back to empty unseen.
 * - Marker: outlined until reached, filled from then on; it pulses while its step is active.
 * - Artifact: dimmed until reached, outlined a step darker while it plays.
 * - `data-relay-instant`: a quiet reset (all transitions off for two frames). `data-relay-live`: CSS loops may run.
 */
const PROCESS_CSS = `
@keyframes vx-relay-blink { 0%, 100% { opacity: 0.25; } 50% { opacity: 1; } }
@keyframes vx-relay-pulse { 50% { opacity: 0.35; } }

[data-relay-fill] {
    opacity: 0;
    transition: opacity 400ms linear, transform 0s linear 400ms;
}
[data-relay-fill='x'] { transform: scaleX(0); transform-origin: left center; }
[data-relay-fill='y'] { transform: scaleY(0); transform-origin: center top; }
[data-step-state='active'] [data-relay-fill] {
    opacity: 1;
    transition: transform var(--relay-ms, 1800ms) cubic-bezier(0.45, 0, 0.25, 1), opacity 0s;
}
[data-step-state='done'] [data-relay-fill] { opacity: 1; transition: transform 200ms linear, opacity 0s; }
[data-step-state='active'] [data-relay-fill='x'], [data-step-state='done'] [data-relay-fill='x'] { transform: scaleX(1); }
[data-step-state='active'] [data-relay-fill='y'], [data-step-state='done'] [data-relay-fill='y'] { transform: scaleY(1); }

[data-relay-marker] {
    background-color: var(--background);
    box-shadow: inset 0 0 0 1px color-mix(in oklab, var(--foreground) 38%, transparent);
    transition: background-color 250ms linear, box-shadow 250ms linear;
}
[data-step-state='active'] [data-relay-marker], [data-step-state='done'] [data-relay-marker] {
    background-color: var(--foreground);
    box-shadow: inset 0 0 0 1px var(--foreground);
}
[data-relay-live] [data-step-state='active'] [data-relay-marker] { animation: vx-relay-pulse 1.1s ease-in-out 250ms infinite; }

[data-relay-number] { color: var(--muted-foreground); transition: color 300ms linear; }
[data-step-state='active'] [data-relay-number], [data-step-state='done'] [data-relay-number] { color: var(--foreground); }

[data-artifact] { transition: opacity 450ms linear, border-color 400ms linear; }
[data-step-state='pending'] [data-artifact] { opacity: 0.42; }
[data-step-state='active'] [data-artifact] { border-color: color-mix(in oklab, var(--foreground) 32%, transparent); }

.vx-relay-blink { animation: vx-relay-blink 1.2s ease-in-out infinite; }
[data-process-relay]:not([data-relay-live]) .vx-relay-blink { animation-play-state: paused; }

[data-relay-instant] *, [data-relay-instant] *::before, [data-relay-instant] *::after {
    transition: none !important;
    animation: none !important;
}

@media (prefers-reduced-motion: reduce) {
    [data-process-relay], [data-process-relay] * { animation: none !important; transition: none !important; }
}
`;

export function ProcessStyles() {
    return <style>{PROCESS_CSS}</style>;
}
