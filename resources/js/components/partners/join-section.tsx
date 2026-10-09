import { Check } from 'lucide-react';
import { useCallback, useState } from 'react';
import { Logo } from '@/components/home/logo';
import { bleedClassName, gutterClassName, Section, SectionHeading } from '@/components/home/section';
import { localized, useCopy } from '@/lib/i18n';
import { usePartnerSections } from '@/lib/sections';
import { cn } from '@/lib/utils';
import { PartnerApplicationForm } from './partner-application-form';

const COPY = localized({
    pl: {
        title: 'Dołącz do programu',
        lead: 'Zgłoszenie zajmuje minutę. W ciągu 24 godzin odezwiemy się z kodem partnera i umową do przejrzenia.',
        namePlaceholder: 'Twoje imię i nazwisko',
        cardRole: 'Partner Netizo',
    },
    en: {
        title: 'Join the program',
        lead: 'Applying takes a minute. Within 24 hours we’ll get back to you with your partner code and an agreement to review.',
        namePlaceholder: 'Your full name',
        cardRole: 'Netizo partner',
    },
});

type PartnerCardProps = {
    name: string;
    sent: boolean;
};

/**
 * A partner's business card, the counterpart of the card handed over in the hero photo: it carries the name being
 * typed into the form, and its right 15% is a perforated stub (the partner's share). Once the application is sent the
 * card straightens and the stub is ticked. Decorative: the form says everything it shows.
 */
function PartnerCard({ name, sent }: PartnerCardProps) {
    const copy = useCopy(COPY);
    const typedName = name.trim();

    return (
        <div
            aria-hidden="true"
            data-sent={sent}
            className="relative aspect-[85/55] w-full max-w-[22rem] -rotate-2 overflow-hidden rounded-xl bg-foreground text-background shadow-[0_2px_4px_rgb(0_0_0/0.06),0_24px_48px_-20px_rgb(0_0_0/0.45)] transition-transform duration-700 ease-expo-out select-none data-[sent=true]:rotate-0 dark:shadow-none"
        >
            <div className="absolute inset-y-0 left-0 flex w-[85%] flex-col justify-between p-5 sm:p-6">
                <Logo className="h-6 self-start" />
                <div className="min-w-0">
                    <p className={cn('truncate text-lg font-semibold tracking-tight', !typedName && 'text-background/45')}>{typedName || copy.namePlaceholder}</p>
                    <p className="mt-1 text-xs text-background/60">{copy.cardRole}</p>
                </div>
            </div>
            <div className="absolute inset-y-0 right-0 flex w-[15%] flex-col items-center justify-between border-l border-dashed border-background/30 py-5 sm:py-6">
                <span className="text-xs font-semibold tabular-nums [writing-mode:vertical-rl]">15%</span>
                <span
                    data-sent={sent}
                    className="flex size-5 items-center justify-center rounded-full border border-background/40 transition-colors duration-300 data-[sent=true]:border-background data-[sent=true]:bg-background data-[sent=true]:text-foreground"
                >
                    <Check className={cn('size-3 transition-opacity duration-300', sent ? 'opacity-100' : 'opacity-0')} strokeWidth={3} />
                </span>
            </div>
        </div>
    );
}

/**
 * Dołącz (#dolacz, #join): a bleed split band, the heading and the partner card on the left, the application form on the
 * right (stacked below lg).
 */
export function JoinSection() {
    const copy = useCopy(COPY);
    const sectionId = usePartnerSections().join;
    const [name, setName] = useState('');
    const [sentName, setSentName] = useState<string | null>(null);
    const handleNameChange = useCallback((value: string) => setName(value), []);

    return (
        <Section id={sectionId} labelledBy={`${sectionId}-heading`} containerClassName="py-0 md:py-0">
            <div className={cn('grid gap-px bg-border lg:grid-cols-12', bleedClassName)}>
                <div className={cn('flex flex-col bg-background pt-20 pb-14 md:pt-28 lg:col-span-5 lg:pb-28', gutterClassName)}>
                    <SectionHeading id={`${sectionId}-heading`} title={copy.title} lead={copy.lead} className="mb-12 md:mb-14" />
                    <div className="px-1">
                        <PartnerCard name={sentName ?? name} sent={sentName !== null} />
                    </div>
                </div>

                <div className={cn('bg-background py-12 md:py-14 lg:col-span-7 lg:pt-28 lg:pb-28', gutterClassName)}>
                    <PartnerApplicationForm onNameChange={handleNameChange} onSent={setSentName} />
                </div>
            </div>
        </Section>
    );
}
