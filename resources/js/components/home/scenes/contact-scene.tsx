import { Appear } from '@/components/home/bento/bento-tile';
import { PanelMark } from '@/components/home/panel/panel-window';
import { PixelatedImage } from '@/components/motion/pixelated-image';
import { useLiveLoop } from '@/components/motion/use-in-view-loop';
import { photo } from '@/lib/photos';
import { cn } from '@/lib/utils';
import { CHIP_SURFACE, sceneProps, TypingDots } from './scene-parts';

/** gone → Voxbit typing → the greeting (static frame) → gone again. */
const PHASE_MS = [800, 1400, 5600] as const;
const TYPING = 1;
const MESSAGE = 2;

/**
 * Kontakt: the meeting table (contact-desk, pixel → sharp on first view) with a greeting from Voxbit arriving over it:
 * typing, then the message (the reply time is on the form's tab right beside it).
 */
export function ContactScene({ className }: { className?: string }) {
    const { ref, step, active } = useLiveLoop<HTMLDivElement>(PHASE_MS, { staticStep: MESSAGE, amount: 0.3 });

    return (
        <div ref={ref} {...sceneProps(active)} className={cn('relative overflow-hidden bg-muted', className)}>
            <PixelatedImage {...photo('contact-desk')} sizes="(min-width: 1024px) 400px, 50vw" alt="" className="absolute inset-0" />

            <Appear
                show={step >= TYPING}
                from="none"
                className={cn(
                    'absolute inset-x-3 bottom-3 flex gap-2.5 rounded-lg p-3 sm:inset-x-4 sm:bottom-4 lg:inset-x-5 lg:bottom-5',
                    'duration-600 data-[show=false]:translate-y-3',
                    CHIP_SURFACE,
                )}
            >
                <PanelMark className="size-7 rounded-[4px]" />
                <span className="min-w-0 flex-1 text-xs leading-snug">
                    <span className="flex items-baseline gap-2">
                        <span className="font-medium">Voxbit</span>
                        <span className="ml-auto text-[11px] text-muted-foreground">teraz</span>
                    </span>
                    <span className="relative mt-0.5 block">
                        <span data-show={step === MESSAGE} className="block transition-opacity duration-300 data-[show=false]:opacity-0">
                            Cześć! W czym możemy pomóc?
                        </span>
                        <span data-show={step === TYPING} className="absolute inset-0 flex items-center transition-opacity duration-200 data-[show=false]:opacity-0">
                            <TypingDots />
                        </span>
                    </span>
                </span>
            </Appear>
        </div>
    );
}
