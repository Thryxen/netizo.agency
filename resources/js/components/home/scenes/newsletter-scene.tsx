import { Mail } from 'lucide-react';
import { Photo } from '@/components/home/photo';
import { useLiveLoop } from '@/components/motion/use-in-view-loop';
import { localized, useCopy } from '@/lib/i18n';
import { photo } from '@/lib/photos';
import { cn } from '@/lib/utils';
import { SceneChip, sceneProps } from './scene-parts';

/** gone → the notification slides in from the top and stays (static frame) → slides away. */
const PHASE_MS = [900, 5600] as const;
const SHOWN = 1;

const COPY = localized({
    pl: { title: 'Nowy numer', detail: 'Trendy i case studies, październik', now: 'teraz' },
    en: { title: 'New issue', detail: 'Trends and case studies, October', now: 'now' },
});

/**
 * Newsletter: someone reading on a phone over coffee (newsletter-reading) and the
 * monthly issue arriving as a push notification over the top edge, like the bento's booking notification.
 */
export function NewsletterScene({ className }: { className?: string }) {
    const { ref, step, active } = useLiveLoop<HTMLDivElement>(PHASE_MS, { staticStep: SHOWN, amount: 0.3 });
    const copy = useCopy(COPY);

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
                title={copy.title}
                detail={copy.detail}
                trailing={<span className="self-start text-[11px] leading-snug text-muted-foreground">{copy.now}</span>}
                className="absolute inset-x-3 top-3 mx-auto max-w-[22rem] sm:inset-x-4 sm:top-4"
            />
        </div>
    );
}
