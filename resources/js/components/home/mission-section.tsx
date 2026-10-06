import { Pixel } from '@/components/home/pixel';
import { Section, SectionHeading } from '@/components/home/section';
import { PixelatedImage } from '@/components/motion';
import { photo } from '@/lib/photos';

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

                <PixelatedImage
                    {...photo('mission-workshop')}
                    sizes="(min-width: 1248px) 625px, (min-width: 1024px) 50vw, calc(100vw - 3rem)"
                    alt=""
                    className="aspect-[3/2] border lg:col-span-7"
                />
            </div>
        </Section>
    );
}
