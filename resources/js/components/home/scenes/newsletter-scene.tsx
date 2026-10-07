import { Mail } from 'lucide-react';
import { Photo } from '@/components/home/photo';
import { useLiveLoop } from '@/components/motion/use-in-view-loop';
import { photo } from '@/lib/photos';
import { cn } from '@/lib/utils';
import { SceneChip, sceneProps } from './scene-parts';

/** gone → the notification slides in from the top and stays (static frame) → slides away. */
const PHASE_MS = [900, 5600] as const;
const SHOWN = 1;

/**
 * Newsletter: someone reading on a phone over coffee (newsletter-reading) and the
 * monthly issue arriving as a push notification over the top edge, like the bento's booking notification.
 */
export function NewsletterScene({ className }: { className?: string }) {
    const { ref, step, active } = useLiveLoop<HTMLDivElement>(PHASE_MS, { staticStep: SHOWN, amount: 0.3 });

    return (
        <div ref={ref} {...sceneProps(active)} className={cn('relative overflow-hidden bg-muted', className)}>
            <Photo
                {...photo('newsletter-reading')}
                alt=""
                sizes="(min-width: 1024px) 500px, 100vw"
                className="absolute inset-0"
                imgClassName="object-[50%_34%]"
            />
            <SceneChip
                show={step === SHOWN}
                from="above"
                icon={Mail}
                title="Nowy numer"
                detail="Trendy i case studies, październik"
                trailing={<span className="self-start text-[11px] leading-snug text-muted-foreground">teraz</span>}
                className="absolute inset-x-3 top-3 mx-auto max-w-[22rem] sm:inset-x-4 sm:top-4"
            />
        </div>
    );
}
