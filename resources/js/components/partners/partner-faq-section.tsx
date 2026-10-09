import { FaqAnswer } from '@/components/home/faq-section';
import { Section, SectionHeading } from '@/components/home/section';
import { Accordion, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { contact } from '@/lib/site';
import type { FaqItem } from '@/types/home';

/** Pytania (#faq): the home FAQ's layout without its photo scene; the answers are in the server-rendered HTML. */
export function PartnerFaqSection({ faq }: { faq: FaqItem[] }) {
    return (
        <Section id="faq" labelledBy="faq-heading">
            <div className="grid gap-12 lg:grid-cols-12 lg:gap-x-16">
                <div className="lg:col-span-4">
                    <SectionHeading id="faq-heading" title="Częste pytania" lead="Nie ma tu Twojego pytania? Napisz, odpowiemy w ciągu 24 godzin." className="mb-0 md:mb-0">
                        <Button variant="outline" className="mt-8 max-md:h-11" asChild>
                            <a href={`mailto:${contact.email}?subject=${encodeURIComponent('Program partnerski')}`}>Napisz do nas</a>
                        </Button>
                    </SectionHeading>
                </div>

                <Accordion type="single" collapsible className="border-t lg:col-span-8 lg:self-start">
                    {faq.map((item, index) => (
                        <AccordionItem key={item.question} value={`faq-${index}`}>
                            <AccordionTrigger className="gap-3 py-5 text-base leading-snug font-medium hover:text-foreground/75 hover:no-underline md:text-lg">
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
