import { MissionScene } from '@/components/home/scenes/mission-scene';
import { Section, SectionHeading } from '@/components/home/section';
import { localized, useCopy } from '@/lib/i18n';
import { useHomeSections } from '@/lib/sections';

const COPY = localized({
    pl: {
        title: 'Nasza misja',
        lead: 'Chcemy, żeby następna generacja produktów cyfrowych była szybsza. Dla Twojej firmy budujemy spójny, wydajny zestaw narzędzi, który rośnie razem z nią.',
        quote: 'Skupiamy się na architekturze, nie tylko na kodzie.',
    },
    en: {
        title: 'Our mission',
        lead: 'We want the next generation of digital products to be faster. For your company, we build a coherent, efficient set of tools that grows with it.',
        quote: 'We focus on architecture, not just code.',
    },
});

export function MissionSection() {
    const copy = useCopy(COPY);
    const sectionId = useHomeSections().mission;

    return (
        <Section id={sectionId} labelledBy={`${sectionId}-heading`}>
            <div className="grid gap-12 lg:grid-cols-12 lg:items-center lg:gap-16">
                <div className="lg:col-span-5">
                    <SectionHeading id={`${sectionId}-heading`} title={copy.title} lead={copy.lead} className="mb-0 md:mb-0">
                        <blockquote className="mt-10 border-l-2 border-foreground pl-6">
                            <p className="text-2xl leading-snug font-semibold tracking-tight text-balance md:text-[1.75rem]">{copy.quote}</p>
                        </blockquote>
                    </SectionHeading>
                </div>

                <MissionScene className="aspect-[3/2] lg:col-span-7" />
            </div>
        </Section>
    );
}
