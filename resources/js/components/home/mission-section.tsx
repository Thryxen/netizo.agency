import { Pixel } from '@/components/home/pixel';
import { MissionScene } from '@/components/home/scenes/mission-scene';
import { Section, SectionHeading } from '@/components/home/section';

export function MissionSection() {
    return (
        <Section id="misja" labelledBy="misja-heading">
            <div className="grid gap-12 lg:grid-cols-12 lg:items-center lg:gap-16">
                <div className="lg:col-span-5">
                    <SectionHeading
                        id="misja-heading"
                        title="Nasza misja"
                        lead="Chcemy, żeby następna generacja produktów cyfrowych była szybsza. Dla Twojej firmy budujemy spójny, wydajny zestaw narzędzi, który rośnie razem z nią."
                        className="mb-0 md:mb-0"
                    >
                        <blockquote className="relative mt-10 border-l-2 border-foreground pl-6">
                            <Pixel size="md" className="absolute top-0 -left-[5px]" />
                            <p className="text-2xl leading-snug font-semibold tracking-tight text-balance md:text-[1.75rem]">
                                Skupiamy się na architekturze, nie tylko na kodzie.
                            </p>
                        </blockquote>
                    </SectionHeading>
                </div>

                <MissionScene className="aspect-[3/2] lg:col-span-7" />
            </div>
        </Section>
    );
}
