/**
 * Styles for the LiveBuild stage, colocated like the bento's (app.css is shared): a plain <style> that renders the same
 * on the server and the client.
 *
 * Sizing: the stage is a size container and the scene is drawn in `em` of one unit, `--lb-unit`, derived from the
 * container width (and from lg, from the viewport height too, so the hero fits the first screen). The whole
 * composition scales as one picture: no layout changes between sizes, no JS measuring, correct in SSR.
 *
 * States: without classes the markup IS the finished page (SSR, no JS, reduced motion, print). Under the inline
 * script's `html.js` gate, before the clock has taken over (`data-lb-live`), the stage shows the loop's first frame
 * instead (an empty browser, act 1 current), so nothing flashes when the build starts. Once live, the clock writes
 * transform/opacity inline every frame and the gate no longer applies.
 */
const LIVE_BUILD_CSS = `
[data-lb-viewport] {
    font-size: calc(100cqw / 62);
    perspective: 160em;
}
@media (width >= 40rem) {
    [data-lb-viewport] { font-size: min(calc(100cqw / 74), 11px); }
}
@media (width >= 64rem) {
    [data-lb-viewport] { font-size: max(6px, min(calc(100cqw / 74), calc((100svh - var(--header-height) - 11.5rem) / 62))); }
}

[data-lb-scene] { transform-style: preserve-3d; }
/* Depth planes: pushed toward the viewer by --lb-z (em, unitless), scaled back so they keep their designed size; the
   tilt then shifts each plane in proportion to its depth (parallax). */
[data-lb-depth] { transform: translateZ(calc(var(--lb-z, 0) * 1em)) scale(calc(1 - var(--lb-z, 0) / 160)); }

[data-lb-grid] {
    background-image: conic-gradient(at 1px 1px, transparent 75%, color-mix(in oklab, var(--foreground) 16%, transparent) 0);
    background-size: 1.5rem 1.5rem;
    background-position: 0.75rem 0.75rem;
}

[data-lb-cover] { transform: translateX(101%); }
[data-lb-marquee] { transform: scale(0); }

.dark [data-lb-photo] > :is(img, canvas) { filter: brightness(0.88) contrast(1.04); }

[data-lb-step] > [data-lb-marker] { box-shadow: inset 0 0 0 1px color-mix(in oklab, var(--foreground) 32%, transparent); }
[data-lb-step] > [data-lb-label] { color: var(--muted-foreground); }
[data-lb-step]:is([data-state='done'], [data-state='live'], [data-state='active']) > [data-lb-marker] {
    background-color: var(--foreground);
    box-shadow: none;
}
[data-lb-step]:is([data-state='live'], [data-state='active']) > [data-lb-label] { color: var(--foreground); }

@keyframes lb-pulse { 50% { opacity: 0.25; } }

@media screen and (prefers-reduced-motion: no-preference) {
    [data-lb-live] [data-lb-step][data-state='live'] > [data-lb-marker] { animation: lb-pulse 1.1s ease-in-out infinite; }

    .js [data-lb-root]:not([data-lb-live]) [data-lb-in] { opacity: 0; }
    .js [data-lb-root]:not([data-lb-live]) [data-lb-fill] { transform: scaleX(0); }
    .js [data-lb-root]:not([data-lb-live]) [data-lb-step]:not([data-lb-step='0']) > [data-lb-marker] {
        background-color: transparent;
        box-shadow: inset 0 0 0 1px color-mix(in oklab, var(--foreground) 32%, transparent);
    }
    .js [data-lb-root]:not([data-lb-live]) [data-lb-step]:not([data-lb-step='0']) > [data-lb-label] { color: var(--muted-foreground); }
    .js [data-lb-root]:not([data-lb-live]) [data-lb-step='0'] > [data-lb-marker] { background-color: var(--foreground); box-shadow: none; }
    .js [data-lb-root]:not([data-lb-live]) [data-lb-step='0'] > [data-lb-label] { color: var(--foreground); }
}

@media (prefers-reduced-motion: reduce) {
    [data-lb-root], [data-lb-root] * { animation: none !important; transition: none !important; }
}
`;

export function LiveBuildStyles() {
    return <style>{LIVE_BUILD_CSS}</style>;
}
