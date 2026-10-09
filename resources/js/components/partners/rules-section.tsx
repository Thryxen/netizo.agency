import { Section, SectionHeading } from '@/components/home/section';
import { RULES } from './partner-data';

/** Zasady (#zasady): the terms as a definition list, the heading beside them from lg (the FAQ's layout). */
export function RulesSection() {
    return (
        <Section id="zasady" labelledBy="zasady-heading">
            <div className="grid gap-12 lg:grid-cols-12 lg:gap-x-16">
                <SectionHeading
                    id="zasady-heading"
                    title="Zasady programu"
                    lead="Pełną umowę dostajesz do przejrzenia przed startem. Najważniejsze punkty są tutaj."
                    className="mb-0 md:mb-0 lg:col-span-4"
                />

                <dl className="border-t border-border lg:col-span-8">
                    {RULES.map((rule) => (
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
