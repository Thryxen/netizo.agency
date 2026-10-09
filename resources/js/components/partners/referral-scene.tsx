import { Landmark, ReceiptText } from 'lucide-react';
import { useState } from 'react';
import { Appear } from '@/components/home/bento/bento-tile';
import { CHIP_SURFACE, ChipIcon, SceneBackdrop, SceneChip, sceneProps, STAGE_SIZES, VISITOR_BUBBLE } from '@/components/home/scenes/scene-parts';
import { useLiveLoop } from '@/components/motion/use-in-view-loop';
import { cn } from '@/lib/utils';
import { CommissionBar } from './commission-bar';
import { commission, EXAMPLE_CODE, formatPln, SCENE_ORDERS, type SceneOrder } from './partner-data';

/** Per order: gone → the order arrives → its 15% slice fills → the payout lands (and holds). */
const PHASE_MS = [700, 1300, 1700, 3600] as const;
const ORDER = 1;
const SPLIT = 2;
const PAYOUT = 3;
const STEP_MS = SCENE_ORDERS.flatMap(() => PHASE_MS);

/**
 * Scoped styles: before the loop has started, under the inline script's `html.js` gate, the chips wait hidden, so the
 * first order plays from its start instead of the static frame flashing first. SSR, no JS and reduced motion show the
 * static frame (the last order, paid out).
 */
const SCENE_CSS = `
@media screen and (prefers-reduced-motion: no-preference) {
    .js [data-referral-scene]:not([data-started]) [data-referral-chip] { opacity: 0; }
}
`;

/**
 * The hero's stage: a business card handed across a café table (the referral) with the rest of the story arriving
 * over it, one order after another: the order placed with the partner's code, its 15% slice filling, the payout
 * landing as a bank notification. Decorative (the copy beside it says the same); the loop runs only while in view.
 */
export function ReferralScene({ className }: { className?: string }) {
    const { ref, step, active } = useLiveLoop<HTMLDivElement>(STEP_MS, { staticStep: STEP_MS.length - 1, amount: 0.3 });
    const [started, setStarted] = useState(false);

    if (active && !started) {
        setStarted(true);
    }

    const orderIndex = Math.floor(step / PHASE_MS.length);
    const phase = step % PHASE_MS.length;
    // While the chips fade out (phase 0) they keep the previous order, so nothing swaps in sight.
    const shownIndex = phase === 0 ? (orderIndex + SCENE_ORDERS.length - 1) % SCENE_ORDERS.length : orderIndex;
    const order = SCENE_ORDERS[shownIndex];

    return (
        <div ref={ref} {...sceneProps(active)} data-referral-scene="" data-started={started ? '' : undefined} className={cn('relative overflow-hidden bg-muted', className)}>
            <style>{SCENE_CSS}</style>
            <SceneBackdrop name="partner-referral" eager sizes={STAGE_SIZES} imgClassName="object-[36%_50%] lg:object-[40%_50%]" />

            <p className={cn(VISITOR_BUBBLE, 'absolute top-6 left-6 hidden max-w-[15.5rem] sm:block')}>
                Odezwij się do Netizo i podaj mój kod: <span className="font-mono font-medium">{EXAMPLE_CODE}</span>
            </p>

            <div data-referral-chip="" className="absolute inset-x-3 top-3 sm:inset-x-auto sm:top-6 sm:right-6 sm:w-[21rem]">
                <SceneChip
                    show={phase >= PAYOUT}
                    from="above"
                    icon={Landmark}
                    title="Przelew przychodzący"
                    detail="Prowizja partnerska Netizo"
                    trailing={<span className="text-sm font-semibold whitespace-nowrap tabular-nums">+{formatPln(commission(order.value))}</span>}
                />
            </div>

            <div data-referral-chip="" className="absolute inset-x-3 bottom-3 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:w-[21rem]">
                <OrderCard order={order} show={phase >= ORDER} split={phase >= SPLIT} />
            </div>
        </div>
    );
}

type OrderCardProps = {
    order: SceneOrder;
    show: boolean;
    /** The 15% slice has filled and the partner's share shows. */
    split: boolean;
};

/** The order placed with the partner's code: who and what, its net value, and the bar that splits off 15%. */
function OrderCard({ order, show, split }: OrderCardProps) {
    return (
        <Appear show={show} from="none" className={cn('rounded-lg p-3', CHIP_SURFACE, 'duration-600 data-[show=false]:translate-y-3')}>
            <div className="flex items-center gap-3">
                <ChipIcon icon={ReceiptText} />
                <span className="min-w-0 flex-1 text-xs leading-snug">
                    <span className="flex items-center gap-1.5">
                        <span className="truncate font-medium">{order.title}</span>
                        <span className="shrink-0 rounded-[3px] border px-1 font-mono text-[10px] leading-4 text-muted-foreground">{EXAMPLE_CODE}</span>
                    </span>
                    <span className="block truncate text-muted-foreground">
                        {order.client}, {order.item}
                    </span>
                </span>
                <span className="self-start text-xs font-semibold whitespace-nowrap tabular-nums">{formatPln(order.value)}</span>
            </div>

            <CommissionBar filled={split} className="mt-3" />
            <div className="mt-1.5 flex items-baseline justify-between gap-3 text-[11px] leading-4">
                <span className="text-muted-foreground">Netizo 85%</span>
                <span data-show={split} className="font-medium tabular-nums transition-opacity duration-300 data-[show=false]:opacity-0">
                    Twoje 15%: {formatPln(commission(order.value))}
                </span>
            </div>
        </Appear>
    );
}
