import { useEffect, useRef, useState } from 'react';
import { Photo } from '@/components/home/photo';
import { useInViewLoop } from '@/components/motion/use-in-view-loop';
import { photo } from '@/lib/photos';
import { cn } from '@/lib/utils';
import { formatZloty, tween } from './bento-motion';
import { BentoTile, type BentoRivet, BentoTileText, type BentoService, liveVisualProps, tileGutterBottom, tileGutterTop, tileGutterX } from './bento-tile';

/** Order values cycle through these; #1048 is the first order that arrives live (249,00 zł). */
const AMOUNTS = [249, 89.9, 412.5, 159, 74.99, 328.4, 129, 56.5] as const;
const FIRST_LIVE_ORDER = 1048;
/** Newest first; one more than fits, so the row leaving at the bottom slides out of view instead of vanishing. */
const INITIAL_ORDERS = [1047, 1046, 1045, 1044];
const INITIAL_REVENUE = 12_480;
const VISIBLE_ROWS = 3;
const FIRST_ARRIVAL_MS = 300;
const ARRIVAL_MS = 3600;

function amountOf(order: number): number {
    const index = (((order - FIRST_LIVE_ORDER) % AMOUNTS.length) + AMOUNTS.length) % AMOUNTS.length;

    return AMOUNTS[index];
}

/**
 * E-commerce: the packing-table photo on one half; on the other, today's orders. A new order slides in at the top
 * every few seconds (rows move by transform only) and the revenue counts up through a ref, not React state.
 */
export function EcommerceTile({ service, rivets }: { service: BentoService; rivets?: BentoRivet[] }) {
    const { ref, active } = useInViewLoop<HTMLDivElement>();
    const [orders, setOrders] = useState<number[]>(INITIAL_ORDERS);
    const revenueRef = useRef<HTMLSpanElement>(null);
    const revenue = useRef(INITIAL_REVENUE);
    const cancelCount = useRef<() => void>(() => {});
    const latest = orders[0];
    const hasLiveOrder = latest >= FIRST_LIVE_ORDER;

    useEffect(() => {
        if (!active) {
            return;
        }

        const timer = window.setTimeout(
            () => {
                const order = latest + 1;
                const from = revenue.current;
                const to = from + amountOf(order);
                const element = revenueRef.current;

                revenue.current = to;
                cancelCount.current();
                cancelCount.current = element
                    ? tween({ from, to, duration: 900, delay: 200, onUpdate: (value) => (element.textContent = formatZloty(value)) })
                    : () => {};
                setOrders((current) => [order, ...current].slice(0, VISIBLE_ROWS + 1));
            },
            hasLiveOrder ? ARRIVAL_MS : FIRST_ARRIVAL_MS,
        );

        return () => window.clearTimeout(timer);
    }, [active, latest, hasLiveOrder]);

    useEffect(() => () => cancelCount.current(), []);

    return (
        <BentoTile className="md:col-span-2" rivets={rivets}>
            <div className="grid flex-1 md:grid-cols-2">
                <div className="flex min-w-0 flex-col">
                    <BentoTileText service={service} className={cn(tileGutterX, tileGutterTop)} />

                    <div ref={ref} {...liveVisualProps(active)} className={cn('@container mt-auto pt-7', tileGutterX, tileGutterBottom)}>
                        <div className="flex items-end justify-between gap-3 border-b pb-3">
                            <span className="min-w-0">
                                <span className="block text-[11px] text-muted-foreground">Sprzedaż dziś</span>
                                <span ref={revenueRef} className="mt-1 block text-xl leading-none font-semibold tracking-tight tabular-nums">
                                    {formatZloty(INITIAL_REVENUE)}
                                </span>
                            </span>
                            {hasLiveOrder && (
                                <span key={latest} className="nz-bento-flash shrink-0 text-[11px] text-muted-foreground tabular-nums">
                                    +{formatZloty(amountOf(latest))}
                                </span>
                            )}
                        </div>

                        <ul className="relative overflow-hidden" style={{ height: `${VISIBLE_ROWS * 2.25}rem` }}>
                            {orders.map((order, index) => (
                                <li
                                    key={order}
                                    style={{ transform: `translateY(${index * 100}%)` }}
                                    className="absolute inset-x-0 top-0 h-9 transition-transform duration-700 ease-expo-out"
                                >
                                    <div className={cn('flex h-full items-center justify-between gap-3 border-b text-[13px]', order >= FIRST_LIVE_ORDER && 'nz-bento-row-in')}>
                                        <span className="flex min-w-0 items-center gap-2.5">
                                            <span
                                                data-on={index === 0}
                                                className="size-1.5 shrink-0 bg-foreground transition-opacity duration-500 data-[on=false]:opacity-25"
                                            />
                                            <span className="truncate">
                                                <span className="hidden @[13.5rem]:inline">Zamówienie </span>#{order}
                                            </span>
                                        </span>
                                        <span className="shrink-0 font-medium tabular-nums">{formatZloty(amountOf(order))}</span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div aria-hidden="true" className="relative order-first h-56 border-b sm:h-72 md:order-none md:h-auto md:border-b-0 md:border-l">
                    <Photo
                        {...photo('bento-ecommerce')}
                        alt=""
                        sizes="(min-width: 1024px) 300px, (min-width: 768px) 50vw, 100vw"
                        className="absolute inset-0"
                        imgClassName="object-[46%_50%]"
                    />
                </div>
            </div>
        </BentoTile>
    );
}
