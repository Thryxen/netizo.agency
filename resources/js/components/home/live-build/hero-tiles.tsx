import type { CSSProperties } from 'react';

type Tile = {
    /** Position and size in grid units (one unit = the dot grid's 1.5rem), from the first dot. */
    x: number;
    y: number;
    size: number;
    /** Opacity range the tile breathes between: some nearly vanish, others only dim. */
    low: number;
    high: number;
    /** Seconds per breath, and a negative delay so the tiles start out of phase. */
    duration: number;
    delay: number;
};

/** Hand-placed so the field reads as scattered, never as a pattern; sizes are whole multiples of the dot grid. */
const TILES: Tile[] = [
    { x: 1, y: 1, size: 4, low: 0, high: 0.06, duration: 9, delay: -2 },
    { x: 9, y: 0, size: 8, low: 0.012, high: 0.035, duration: 13, delay: -7 },
    { x: 21, y: 2, size: 4, low: 0, high: 0.07, duration: 8, delay: -4 },
    { x: 27, y: 6, size: 4, low: 0.02, high: 0.045, duration: 11, delay: -9 },
    { x: 2, y: 12, size: 6, low: 0, high: 0.05, duration: 10, delay: -1 },
    { x: 25, y: 16, size: 8, low: 0.01, high: 0.04, duration: 14, delay: -5 },
    { x: 0, y: 25, size: 8, low: 0.015, high: 0.035, duration: 12, delay: -3 },
    { x: 13, y: 29, size: 4, low: 0, high: 0.07, duration: 9, delay: -6 },
    { x: 19, y: 33, size: 4, low: 0.02, high: 0.05, duration: 10, delay: -8 },
    { x: 29, y: 30, size: 4, low: 0, high: 0.06, duration: 7, delay: -2.5 },
    { x: 6, y: 34, size: 4, low: 0.01, high: 0.04, duration: 11, delay: -10 },
    { x: 33, y: 22, size: 6, low: 0, high: 0.045, duration: 12, delay: -4.5 },
];

const TILES_CSS = `
@keyframes lb-tile-breathe {
    0%, 100% { opacity: var(--tile-low); }
    50% { opacity: var(--tile-high); }
}
[data-lb-tile] {
    opacity: calc((var(--tile-low) + var(--tile-high)) / 2);
    animation: lb-tile-breathe var(--tile-duration) ease-in-out var(--tile-delay) infinite;
}
@media (prefers-reduced-motion: reduce) {
    [data-lb-tile] { animation: none; }
}
`;

/**
 * Ambient background of the hero stage: large, very light squares on the dot grid that slowly breathe in and out,
 * each at its own pace and depth, so the space around the build is never static. They sit under the scene (they do
 * not tilt with it) and run in CSS only: from the first paint, no JS; static under reduced motion.
 */
export function HeroTiles() {
    return (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
            <style>{TILES_CSS}</style>
            {TILES.map((tile, index) => (
                <span
                    key={index}
                    data-lb-tile=""
                    className="absolute bg-foreground"
                    style={
                        {
                            left: `calc(0.75rem + ${tile.x} * 1.5rem)`,
                            top: `calc(0.75rem + ${tile.y} * 1.5rem)`,
                            width: `${tile.size * 1.5}rem`,
                            height: `${tile.size * 1.5}rem`,
                            '--tile-low': tile.low,
                            '--tile-high': tile.high,
                            '--tile-duration': `${tile.duration}s`,
                            '--tile-delay': `${tile.delay}s`,
                        } as CSSProperties
                    }
                />
            ))}
        </div>
    );
}
