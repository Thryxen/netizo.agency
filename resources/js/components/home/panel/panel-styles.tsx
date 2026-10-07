/**
 * Styles for the client panel mock, colocated like the bento's and the hero's (app.css is shared): a plain <style>
 * that renders the same on the server and the client. Only transform and opacity are animated.
 *
 * Sizing: the stage is a size container (`@container/panel`) and the mock is drawn in `em` of one unit derived from
 * the stage's width, so it scales as one picture and the text stays legible. Three compositions by stage width
 * (the Tailwind variants in the markup use the same breakpoints):
 *   - below 32.5rem (phones): no sidebar, three board columns (Pilne hidden), the stage is 38 em wide;
 *   - 32.5–41.25rem (tablets, lg's narrow stage): an icon rail, four columns, 56 em;
 *   - from 41.25rem: the full sidebar, four columns, 62 em.
 * The unit is capped at 11px; wider stages widen the window (the board's columns are fluid). The side padding leaves
 * a band of the photo set (backdrop-office) visible around the window.
 *
 * States: the markup is always one frame of the loop. Without `data-panel-live` (SSR, no JS, offscreen, reduced
 * motion) it shows its final state without animations; reduced motion switches every animation and transition off.
 */
const PANEL_CSS = `
[data-panel-viewport] {
    --panel-cols: 3;
    --panel-col-shift: 1;
    --panel-gap: 0.6em;
    --panel-card-h: 7.7em;
    --panel-slot: calc(var(--panel-card-h) + 0.4em);
    --panel-toast-x: -0.5em;
    font-size: min(11px, calc(100cqw / 38));
    padding: 2.6em 1em 1.6em;
}
@container panel (width >= 32.5rem) {
    [data-panel-viewport] {
        --panel-cols: 4;
        --panel-col-shift: 0;
        --panel-toast-x: -1.2em;
        font-size: min(11px, calc(100cqw / 56));
        padding: 3.2em 2.6em 2.2em;
    }
}
@container panel (width >= 41.25rem) {
    [data-panel-viewport] {
        --panel-toast-x: -1.4em;
        font-size: min(11px, calc(100cqw / 62));
        padding: 3.6em 4.4em 2.6em;
    }
}

[data-panel-columns] { grid-template-columns: repeat(var(--panel-cols), minmax(0, 1fr)); column-gap: var(--panel-gap); }

/* A board card's slot: one column wide, placed by --col / --slot (set inline), moved by transform only. */
[data-panel-card] {
    width: calc((100% - (var(--panel-cols) - 1) * var(--panel-gap)) / var(--panel-cols));
    transform: translate3d(calc((var(--col) - var(--panel-col-shift)) * (100% + var(--panel-gap))), calc(var(--slot) * var(--panel-slot)), 0);
    transition: transform 700ms var(--ease-expo-out);
}
[data-panel-card][data-delay] { transition-delay: 120ms; }

/* The designer's pointer: glides between targets (em from the content area's top-right corner). */
[data-panel-cursor] {
    transform: translate3d(calc(-1em * var(--x)), calc(1em * var(--y)), 0);
    transition: transform 480ms cubic-bezier(0.45, 0, 0.2, 1), opacity 200ms linear;
}

@keyframes vx-panel-char { from { opacity: 0; } }
@keyframes vx-panel-caret { from, to { box-shadow: 0.08em 0 0 0 currentColor; } }
@keyframes vx-panel-blink { 0%, 100% { opacity: 0.3; } 50% { opacity: 1; } }
@keyframes vx-panel-roll { from { opacity: 0; transform: translateY(65%); } }
@keyframes vx-panel-press { 45% { transform: scale(0.94); } }
@keyframes vx-panel-ripple {
    from { opacity: 0.55; transform: translate(-50%, -50%) scale(0.3); }
    to { opacity: 0; transform: translate(-50%, -50%) scale(1.5); }
}
@keyframes vx-panel-land {
    from { box-shadow: 0 0 0 0.25em color-mix(in oklab, var(--foreground) 22%, transparent); }
}

/* Typing: characters appear one by one, the caret rides on the newest one, then keeps blinking at the end. */
[data-panel-live] [data-panel-typing] > span {
    animation: vx-panel-char 1ms linear calc(260ms + var(--i) * 24ms) both, vx-panel-caret 24ms linear calc(260ms + var(--i) * 24ms);
}
[data-panel-live] [data-panel-typing] > span:last-child {
    animation: vx-panel-char 1ms linear calc(260ms + var(--i) * 24ms) both, vx-panel-caret 1s step-end calc(260ms + var(--i) * 24ms) infinite;
}

.vx-panel-pulse { animation: vx-panel-blink 1.1s ease-in-out infinite; }
[data-panel-stage]:not([data-panel-live]) .vx-panel-pulse { animation-play-state: paused; }
[data-panel-live] .vx-panel-roll { animation: vx-panel-roll 320ms var(--ease-expo-out) both; }
[data-panel-live] .vx-panel-press { animation: vx-panel-press 220ms ease-out; }
.vx-panel-ripple { opacity: 0; }
[data-panel-live] .vx-panel-ripple { animation: vx-panel-ripple 600ms ease-out forwards; }
[data-panel-live] .vx-panel-land { animation: vx-panel-land 1.1s ease-out 200ms both; }

@media (prefers-reduced-motion: reduce) {
    [data-panel-stage], [data-panel-stage] * { animation: none !important; transition: none !important; }
}
`;

export function PanelStyles() {
    return <style>{PANEL_CSS}</style>;
}
