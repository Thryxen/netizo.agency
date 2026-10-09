import { bleedClassName, Section, SectionHeading } from '@/components/home/section';
import { cn } from '@/lib/utils';
import { AUDIENCES } from './partner-data';

/** Dla kogo (#dla-kogo): who usually knows a firm that needs a website, each with the moment a referral comes up. */
export function AudienceSection() {
    return (
        <Section id="dla-kogo" labelledBy="dla-kogo-heading" containerClassName="pb-0 md:pb-0">
            <SectionHeading
                id="dla-kogo-heading"
                title="Dla kogo jest program"
                lead="Wystarczy, że rozmawiasz z właścicielami firm. Polecenie zwykle przychodzi samo, w takich sytuacjach:"
            />

            <ul className={cn('grid gap-px border-t border-border bg-border sm:grid-cols-2 lg:grid-cols-3', bleedClassName)}>
                {AUDIENCES.map((audience) => (
                    <li key={audience.title} className="bg-background px-4 py-8 sm:px-6 md:py-10 lg:px-10">
                        <h3 className="text-lg font-semibold tracking-tight">{audience.title}</h3>
                        <p className="mt-2 max-w-[40ch] leading-relaxed text-pretty text-muted-foreground">{audience.text}</p>
                    </li>
                ))}
            </ul>
        </Section>
    );
}
