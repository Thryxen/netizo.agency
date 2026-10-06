import { Accordion as AccordionPrimitive } from 'radix-ui';
import { useHomeUi } from '@/components/home/home-ui-context';
import { Pixel } from '@/components/home/pixel';
import { Section, SectionHeading } from '@/components/home/section';
import { Accordion, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import type { FaqItem } from '@/types/home';

export function FaqSection({ faq }: { faq: FaqItem[] }) {
    const { openContact } = useHomeUi();

    return (
        <Section id="faq" labelledBy="faq-heading">
            <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
                <div className="lg:col-span-4">
                    <SectionHeading
                        id="faq-heading"
                        title="Częste pytania"
                        lead="Nie ma tu Twojego pytania? Napisz, odpowiemy w ciągu 24 godzin."
                        className="mb-0 md:mb-0 lg:sticky lg:top-[calc(var(--header-height)+2rem)]"
                    >
                        <Button variant="outline" className="mt-8 max-md:h-11" onClick={() => openContact('quick')}>
                            Napisz do nas
                        </Button>
                    </SectionHeading>
                </div>

                <Accordion type="single" collapsible className="border-t lg:col-span-8">
                    {faq.map((item, index) => (
                        <AccordionItem key={item.question} value={`faq-${index}`}>
                            <AccordionTrigger className="group gap-3 py-5 text-base leading-snug font-medium hover:text-foreground/75 hover:no-underline md:text-lg">
                                {/* The item's bit: lit (ink) while its answer is open. */}
                                <Pixel size="sm" className="mt-2 bg-border transition-colors group-data-[state=open]:bg-foreground md:mt-2.5" />
                                <span className="flex-1">{item.question}</span>
                            </AccordionTrigger>
                            <FaqAnswer>{item.answer}</FaqAnswer>
                        </AccordionItem>
                    ))}
                </Accordion>
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
function FaqAnswer({ children }: { children: string }) {
    return (
        <AccordionPrimitive.Content forceMount data-slot="accordion-content" className="group/answer">
            <div className="invisible grid grid-rows-[0fr] transition-[grid-template-rows,visibility] duration-200 ease-out group-data-[state=open]/answer:visible group-data-[state=open]/answer:grid-rows-[1fr]">
                <div className="min-h-0 overflow-hidden">
                    {/* Indented by the bit + gap so the answer lines up with its question. */}
                    <p className="max-w-[65ch] pr-8 pb-6 pl-[1.125rem] leading-relaxed text-pretty text-muted-foreground">{children}</p>
                </div>
            </div>
        </AccordionPrimitive.Content>
    );
}
