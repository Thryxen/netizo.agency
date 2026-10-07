import { CalendarCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Photo } from '@/components/home/photo';
import { useLiveLoop } from '@/components/motion/use-in-view-loop';
import { photo } from '@/lib/photos';
import { cn } from '@/lib/utils';
import { Appear, BentoTile, type BentoRivet, BentoTileText, type BentoService, liveVisualProps, tileGutterBottom, tileGutterX } from './bento-tile';

/** notification shown (static frame) → slides away → nothing → the next booking slides in. */
const PHASE_MS = [3200, 500, 600] as const;
const SHOWN = 0;
const GONE = 2;

const BOOKINGS = [
    { time: '14:30', detail: 'Szczepienie, gabinet 2' },
    { time: '15:15', detail: 'Wizyta kontrolna, gabinet 1' },
    { time: '16:40', detail: 'Pielęgnacja, gabinet 3' },
] as const;

/**
 * Aplikacje mobilne: the bento-mobile photo fills the tile and booking notifications
 * slide in over it. The text sits on a solid band at the bottom for legibility (no gradient scrim).
 */
export function MobileTile({ service, rivets }: { service: BentoService; rivets?: BentoRivet[] }) {
    const { ref, step, active } = useLiveLoop<HTMLDivElement>(PHASE_MS, { staticStep: SHOWN });
    const [booking, setBooking] = useState(0);

    useEffect(() => {
        if (step === GONE) {
            setBooking((current) => (current + 1) % BOOKINGS.length);
        }
    }, [step]);

    const { time, detail } = BOOKINGS[booking];

    return (
        <BentoTile className="min-h-[32rem] sm:min-h-[36rem] md:min-h-[27rem] lg:row-span-2 lg:min-h-0" rivets={rivets}>
            <div ref={ref} {...liveVisualProps(active)} className="absolute inset-0 overflow-hidden">
                <Photo
                    {...photo('bento-mobile')}
                    alt=""
                    sizes="(min-width: 1024px) 300px, (min-width: 768px) 50vw, 100vw"
                    className="absolute inset-0"
                    imgClassName="object-[54%_42%]"
                />
                <Appear
                    show={step === SHOWN}
                    from="none"
                    className={cn(
                        'absolute inset-x-3 top-3 flex items-center gap-3 rounded-lg border bg-background/95 p-3 sm:inset-x-4 sm:top-4',
                        'duration-600 data-[show=false]:-translate-y-[130%]',
                    )}
                >
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-foreground text-background">
                        <CalendarCheck className="size-4" strokeWidth={1.75} />
                    </span>
                    <span className="min-w-0 text-xs leading-snug">
                        <span className="block truncate font-medium">Nowa rezerwacja, {time}</span>
                        <span className="block truncate text-muted-foreground">{detail}</span>
                    </span>
                </Appear>
            </div>

            <div className={cn('relative mt-auto border-t bg-background/90 pt-5 sm:pt-6', tileGutterX, tileGutterBottom)}>
                <BentoTileText service={service} />
            </div>
        </BentoTile>
    );
}
