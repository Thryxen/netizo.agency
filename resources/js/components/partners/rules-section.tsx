import { Section, SectionHeading } from '@/components/home/section';
import { localized, useCopy } from '@/lib/i18n';
import { usePartnerSections } from '@/lib/sections';
import { RULES } from './partner-data';

const COPY = localized({
    pl: {
        title: 'Zasady programu',
        lead: 'Pełną umowę dostajesz do przejrzenia przed startem. Najważniejsze punkty są tutaj.',
    },
    en: {
        title: 'Program terms',
        lead: 'You get the full agreement to review before you start. Here are the key points.',
    },
});

/** Zasady (#zasady, #terms): the terms as a definition list, the heading beside them from lg (the FAQ's layout). */
export function RulesSection() {
    const copy = useCopy(COPY);
    const rules = useCopy(RULES);
    const sectionId = usePartnerSections().rules;

    return (
        <Section id={sectionId} labelledBy={`${sectionId}-heading`}>
            <div className="grid gap-12 lg:grid-cols-12 lg:gap-x-16">
                <SectionHeading id={`${sectionId}-heading`} title={copy.title} lead={copy.lead} className="mb-0 md:mb-0 lg:col-span-4" />

                <dl className="border-t border-border lg:col-span-8">
                    {rules.map((rule) => (
                        <div key={rule.term} className="grid gap-1 border-b border-border py-5 sm:grid-cols-[11rem_1fr] sm:gap-8">
                            <dt className="font-medium">{rule.term}</dt>
                            <dd className="max-w-[60ch] leading-relaxed text-pretty text-muted-foreground">{rule.detail}</dd>
                        </div>
                    ))}
                </dl>
            </div>
        </Section>
    );
}
