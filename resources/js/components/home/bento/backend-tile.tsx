import { useEffect, useRef } from 'react';
import { useInViewLoop } from '@/components/motion/use-in-view-loop';
import { cn } from '@/lib/utils';
import { BentoTile, type BentoRivet, BentoTileText, type BentoService, liveVisualProps, tileGutterTop, tileGutterX } from './bento-tile';

/** One period of requests per second (relative, 0–100); the chart repeats it, so the scroll loops seamlessly. */
const TRAFFIC = [
    52, 55, 51, 58, 62, 57, 60, 66, 63, 59, 64, 70, 74, 68, 65, 71, 67, 60, 56, 61, 58, 53, 49, 54, 50, 46, 52, 57, 55, 62, 78, 72, 64, 60, 63, 58, 54, 57, 61,
    56, 52, 55, 49, 47, 51, 48, 53, 50,
] as const;

const CHART_HEIGHT = 40;
const CHART_WIDTH = TRAFFIC.length * 2;

/** Two periods side by side, as integers-derived coordinates (identical on server and client). */
const LINE = Array.from({ length: CHART_WIDTH + 1 }, (_, x) => {
    const y = CHART_HEIGHT - 2 - ((TRAFFIC[x % TRAFFIC.length] - 40) / 45) * 32;

    return `${x === 0 ? 'M' : 'L'}${x} ${y.toFixed(2)}`;
}).join('');
const AREA = `${LINE}L${CHART_WIDTH} ${CHART_HEIGHT}L0 ${CHART_HEIGHT}Z`;

/** Readings the counters step through while live (no-break thousands space); index 0 is the static frame. */
const REQUESTS = ['1\u00a0284', '1\u00a0312', '1\u00a0297', '1\u00a0341', '1\u00a0326', '1\u00a0268', '1\u00a0305', '1\u00a0289'] as const;
const P95 = ['42', '44', '41', '43', '46', '42', '40', '43'] as const;
const TICK_MS = 1200;

/**
 * Systemy backend: a live traffic panel. The requests-per-second sparkline keeps scrolling (one CSS transform) and the
 * counters tick through realistic readings, written straight to the DOM (no re-render per tick).
 */
export function BackendTile({ service, rivets }: { service: BentoService; rivets?: BentoRivet[] }) {
    const { ref, active } = useInViewLoop<HTMLDivElement>();
    const requestsRef = useRef<HTMLSpanElement>(null);
    const p95Ref = useRef<HTMLSpanElement>(null);
    const readingRef = useRef(0);

    useEffect(() => {
        if (!active) {
            return;
        }

        const tick = (): void => {
            readingRef.current = (readingRef.current + 1) % REQUESTS.length;

            if (requestsRef.current) {
                requestsRef.current.textContent = REQUESTS[readingRef.current];
            }

            if (p95Ref.current) {
                p95Ref.current.textContent = P95[readingRef.current];
            }
        };
        const first = window.setTimeout(tick, 150);
        const timer = window.setInterval(tick, TICK_MS);

        return () => {
            window.clearTimeout(first);
            window.clearInterval(timer);
        };
    }, [active]);

    return (
        <BentoTile rivets={rivets}>
            <BentoTileText service={service} className={cn(tileGutterX, tileGutterTop)} />

            <div ref={ref} {...liveVisualProps(active)} className="mt-auto pt-7">
                <div className={cn('flex items-end justify-between gap-3', tileGutterX)}>
                    <span className="min-w-0">
                        <span className="block text-[11px] text-muted-foreground">Żądania na sekundę</span>
                        <span ref={requestsRef} className="mt-0.5 block text-2xl leading-none font-semibold tracking-tight tabular-nums">
                            {REQUESTS[0]}
                        </span>
                    </span>
                    <span className="flex shrink-0 items-center gap-1.5 text-[11px] text-muted-foreground">
                        <span className="nz-bento-blink nz-bento-loop size-1.5 bg-foreground" />
                        na żywo
                    </span>
                </div>

                {/* Runs rail to rail of the tile; dashed gridlines stay put while the series scrolls under them. */}
                <div className="relative mt-3 h-20 overflow-hidden">
                    <span className="absolute inset-x-0 top-1/4 border-t border-dashed" />
                    <span className="absolute inset-x-0 top-2/4 border-t border-dashed" />
                    <span className="absolute inset-x-0 top-3/4 border-t border-dashed" />
                    <svg
                        viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
                        preserveAspectRatio="none"
                        className="nz-bento-scroll nz-bento-loop absolute inset-y-0 left-0 h-full w-[200%]"
                    >
                        <path d={AREA} className="fill-foreground/[0.06]" />
                        <path d={LINE} vectorEffect="non-scaling-stroke" strokeWidth={1.5} strokeLinejoin="round" className="fill-none stroke-foreground" />
                    </svg>
                </div>

                <div className={cn('flex items-center justify-between gap-3 border-t py-2.5 text-[11px] text-muted-foreground', tileGutterX)}>
                    <span>
                        p95{' '}
                        <span className="font-medium text-foreground tabular-nums">
                            <span ref={p95Ref}>{P95[0]}</span>
                            {'\u00a0'}ms
                        </span>
                    </span>
                    <span>
                        błędy <span className="font-medium text-foreground tabular-nums">0,02%</span>
                    </span>
                </div>
            </div>
        </BentoTile>
    );
}
