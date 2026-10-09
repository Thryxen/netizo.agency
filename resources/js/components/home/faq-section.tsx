import { Accordion as AccordionPrimitive } from 'radix-ui';
import { useHomeUi } from '@/components/home/home-ui-context';
import { FaqScene } from '@/components/home/scenes/faq-scene';
import { Section, SectionHeading } from '@/components/home/section';
import { Accordion, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import type { FaqItem } from '@/types/home';

/**
 * From lg: heading + CTA on the left with the photo scene under them (a client asking, Netizo answering: what "Napisz
 * do nas" leads to), the questions on the right. The questions span both rows; the scene's row is the flexible one,
 * so opening an answer never moves the scene, and the scene sticks under the header while the questions scroll.
 * Below lg: heading, questions, then the scene in a wide crop.
 */
export function FaqSection({ faq }: { faq: FaqItem[] }) {
    const { openContact } = useHomeUi();

    return (
        <Section id="faq" labelledBy="faq-heading">
            <div className="grid gap-12 lg:grid-cols-12 lg:grid-rows-[auto_1fr] lg:gap-x-16 lg:gap-y-10">
                <div className="lg:col-span-4">
                    <SectionHeading
                        id="faq-heading"
                        title="Częste pytania"
                        lead="Nie ma tu Twojego pytania? Napisz, odpowiemy w ciągu 24 godzin."
                        className="mb-0 md:mb-0"
                    >
                        <Button variant="outline" className="mt-8 max-md:h-11" onClick={() => openContact('quick')}>
                            Napisz do nas
                        </Button>
                    </SectionHeading>
                </div>

                <Accordion type="single" collapsible className="border-t lg:col-span-8 lg:col-start-5 lg:row-span-2 lg:row-start-1 lg:self-start">
                    {faq.map((item, index) => (
                        <AccordionItem key={item.question} value={`faq-${index}`}>
                            <AccordionTrigger className="gap-3 py-5 text-base leading-snug font-medium hover:text-foreground/75 hover:no-underline md:text-lg">
                                <span className="flex-1">{item.question}</span>
                            </AccordionTrigger>
                            <FaqAnswer>{item.answer}</FaqAnswer>
                        </AccordionItem>
                    ))}
                </Accordion>

                <FaqScene
                    sizes="(min-width: 1248px) 331px, (min-width: 1024px) 25vw, calc(100vw - 2rem)"
                    className="aspect-[4/3] sm:aspect-[16/9] md:aspect-[2/1] lg:sticky lg:top-[calc(var(--header-height)+2.5rem)] lg:col-span-4 lg:col-start-1 lg:row-start-2 lg:aspect-[4/5] lg:self-start"
                />
            </div>
        </Section>
    );
}

/**
 * Accordion panel that is always mounted (forceMount), so every answer is in the server-rendered HTML.
 * Closed panels collapse to zero height and are `visibility: hidden` (out of the tab order and the
 * accessibility tree). The transition lives on an inner element because Radix briefly zeroes
 * transition-duration on the Content node itself while it measures.
 */
export function FaqAnswer({ children }: { children: string }) {
    return (
        <AccordionPrimitive.Content forceMount data-slot="accordion-content" className="group/answer">
            <div className="invisible grid grid-rows-[0fr] transition-[grid-template-rows,visibility] duration-200 ease-out group-data-[state=open]/answer:visible group-data-[state=open]/answer:grid-rows-[1fr]">
                <div className="min-h-0 overflow-hidden">
                    <p className="max-w-[65ch] pr-8 pb-6 leading-relaxed text-pretty text-muted-foreground">{children}</p>
                </div>
            </div>
        </AccordionPrimitive.Content>
    );
}
