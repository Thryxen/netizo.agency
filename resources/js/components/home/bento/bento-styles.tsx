/**
 * Keyframes for the bento's live visuals. They live with the bento (app.css is shared), as a plain <style> that renders
 * identically on the server and the client. Only transform and opacity are animated.
 *
 * - Infinite loops (`nz-bento-loop`) are paused unless their visual is live (`data-bento-live`: in view, tab visible,
 *   motion allowed), so offscreen tiles cost nothing and the static frame is the loop's first frame.
 * - One-shot effects (typing, click, new order row) only run under `data-bento-live`; without it the element shows
 *   its final state. Reduced motion switches every bento animation and transition off.
 */
const BENTO_CSS = `
@keyframes nz-bento-scroll { to { transform: translate3d(-50%, 0, 0); } }
@keyframes nz-bento-blink { 0%, 100% { opacity: 0.25; } 50% { opacity: 1; } }
@keyframes nz-bento-type { from { opacity: 0; } }
@keyframes nz-bento-press { 45% { transform: scale(0.94); } }
@keyframes nz-bento-ripple {
    from { opacity: 0.55; transform: translate(-50%, -50%) scale(0.3); }
    to { opacity: 0; transform: translate(-50%, -50%) scale(1.5); }
}
@keyframes nz-bento-row-in { from { opacity: 0; transform: translateY(-60%); } }
@keyframes nz-bento-flash { 0% { opacity: 0; } 12%, 70% { opacity: 1; } 100% { opacity: 0; } }

.nz-bento-scroll { animation: nz-bento-scroll var(--bento-scroll, 14s) linear infinite; }
.nz-bento-blink { animation: nz-bento-blink 1.2s ease-in-out var(--bento-delay, 0s) infinite; }
[data-bento-visual]:not([data-bento-live]) .nz-bento-loop { animation-play-state: paused; }

[data-bento-live] .nz-bento-type > span { animation: nz-bento-type 1ms linear calc(120ms + var(--i) * 20ms) both; }
[data-bento-live] .nz-bento-press { animation: nz-bento-press 280ms ease-out 1000ms; }
.nz-bento-ripple { opacity: 0; }
[data-bento-live] .nz-bento-ripple { animation: nz-bento-ripple 650ms ease-out 1000ms forwards; }
.nz-bento-row-in { animation: nz-bento-row-in 650ms var(--ease-expo-out) both; }
.nz-bento-flash { opacity: 0; }
[data-bento-live] .nz-bento-flash { animation: nz-bento-flash 2.4s ease both; }

@media (prefers-reduced-motion: reduce) {
    [data-bento-visual], [data-bento-visual] * { animation: none !important; transition: none !important; }
}
`;

export function BentoStyles() {
    return <style>{BENTO_CSS}</style>;
}
