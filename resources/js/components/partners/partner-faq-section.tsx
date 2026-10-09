import { FaqAnswer } from '@/components/home/faq-section';
import { FaqScene } from '@/components/home/scenes/faq-scene';
import { Section, SectionHeading } from '@/components/home/section';
import { Accordion, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { contact } from '@/lib/site';
import type { FaqItem } from '@/types/home';

/**
 * Pytania (#faq): the home FAQ's layout, its photo scene included: a partner at home asking when the commission comes
 * and Netizo answering (in line with the FAQ's own answer). From lg the scene sits under the heading and sticks while
 * the questions scroll; below lg it follows the questions in a wide crop. The answers are in the server-rendered HTML.
 */
export function PartnerFaqSection({ faq }: { faq: FaqItem[] }) {
    return (
        <Section id="faq" labelledBy="faq-heading">
            <div className="grid gap-12 lg:grid-cols-12 lg:grid-rows-[auto_1fr] lg:gap-x-16 lg:gap-y-10">
                <div className="lg:col-span-4">
                    <SectionHeading id="faq-heading" title="Częste pytania" lead="Nie ma tu Twojego pytania? Napisz, odpowiemy w ciągu 24 godzin." className="mb-0 md:mb-0">
                        <Button variant="outline" className="mt-8 max-md:h-11" asChild>
                            <a href={`mailto:${contact.email}?subject=${encodeURIComponent('Program partnerski')}`}>Napisz do nas</a>
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
                    photoName="partner-question"
                    question="Kiedy dostanę prowizję?"
                    answer="W ciągu 14 dni od opłacenia faktury przez klienta."
                    sizes="(min-width: 1248px) 331px, (min-width: 1024px) 25vw, calc(100vw - 2rem)"
                    className="aspect-[4/3] sm:aspect-[16/9] md:aspect-[2/1] lg:sticky lg:top-[calc(var(--header-height)+2.5rem)] lg:col-span-4 lg:col-start-1 lg:row-start-2 lg:aspect-[4/5] lg:self-start"
                />
            </div>
        </Section>
    );
}
