import { Mail, Phone } from 'lucide-react';
import { BriefWizard } from '@/components/home/brief/brief-wizard';
import { type ContactTab, isContactTab, useHomeUi } from '@/components/home/home-ui-context';
import { QuickContactForm } from '@/components/home/quick-contact-form';
import { ContactScene } from '@/components/home/scenes/contact-scene';
import { bleedClassName, gutterClassName, Rivet, Section, SectionHeading } from '@/components/home/section';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { localized, useCopy } from '@/lib/i18n';
import { useHomeSections } from '@/lib/sections';
import { contact } from '@/lib/site';
import { cn } from '@/lib/utils';

const COPY = localized({
    pl: {
        tabs: [
            { value: 'brief', label: 'Brief projektu', hint: 'Szczegółowa wycena' },
            { value: 'quick', label: 'Szybka wiadomość', hint: 'Odpowiemy w 24 h' },
        ] as { value: ContactTab; label: string; hint: string }[],
        title: 'Rozpocznij współpracę',
        lead: 'Wypełnij brief, jeśli chcesz dokładnej wyceny, albo napisz krótko, czego potrzebujesz.',
        tabsLabel: 'Sposób kontaktu',
        altHeading: 'Wolisz porozmawiać?',
        callMe: 'Zadzwońcie do mnie',
    },
    en: {
        tabs: [
            { value: 'brief', label: 'Project brief', hint: 'Detailed quote' },
            { value: 'quick', label: 'Quick message', hint: 'Reply within 24 h' },
        ],
        title: 'Let’s work together',
        lead: 'Fill in the brief for a detailed quote, or tell us briefly what you need.',
        tabsLabel: 'How to contact us',
        altHeading: 'Prefer to talk?',
        callMe: 'Call me back',
    },
});

const contactLinkClass =
    'inline-flex min-h-11 items-center gap-3 rounded-sm text-sm font-medium underline-offset-4 outline-none hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/50 md:min-h-0';

/**
 * Bleed block, rail to rail like the services grid: the form cell (8/12) and the alternatives aside (4/12)
 * share one hairline. The section drops its bottom padding so the block meets the footer's hairline.
 */
export function ContactSection() {
    const { contactTab, setContactTab, openCallback } = useHomeUi();
    const copy = useCopy(COPY);
    const id = useHomeSections().contact;

    return (
        <Section id={id} labelledBy={`${id}-heading`} containerClassName="pb-0 md:pb-0">
            <SectionHeading id={`${id}-heading`} title={copy.title} lead={copy.lead} />

            <div className={cn('relative border-t border-border', bleedClassName)}>
                <Rivet side="left" />
                <Rivet side="right" />
                <div className="grid gap-px bg-border lg:grid-cols-12">
                    <div className={cn('min-w-0 bg-background pt-6 pb-10 sm:pt-8 lg:col-span-8 lg:pb-12', gutterClassName)}>
                        <Tabs value={contactTab} onValueChange={(value) => isContactTab(value) && setContactTab(value)} className="gap-8">
                            <TabsList
                                variant="line"
                                aria-label={copy.tabsLabel}
                                className="grid h-auto w-full grid-cols-2 gap-0 border-b border-border p-0 group-data-[orientation=horizontal]/tabs:h-auto"
                            >
                                {copy.tabs.map((tab) => (
                                    <TabsTrigger
                                        key={tab.value}
                                        value={tab.value}
                                        className="h-auto items-start justify-start rounded-none px-1 pt-2 pb-3.5 text-left whitespace-normal group-data-[orientation=horizontal]/tabs:after:bottom-[-1px] sm:px-2 forced-colors:after:forced-color-adjust-none forced-colors:data-[state=active]:after:bg-[Highlight]"
                                    >
                                        <span className="flex flex-col gap-0.5">
                                            <span className="text-[13px] sm:text-sm">{tab.label}</span>
                                            <span className="text-xs font-normal text-muted-foreground">{tab.hint}</span>
                                        </span>
                                    </TabsTrigger>
                                ))}
                            </TabsList>

                            {/*
                             * Both panels stay mounted so a half-filled brief survives a tab switch. The brief panel stays a
                             * tab stop (its first content is the step text); the quick panel starts with a labelled input.
                             */}
                            <TabsContent
                                value="brief"
                                forceMount
                                className="focus-visible:ring-offset-4 focus-visible:ring-offset-background data-[state=inactive]:hidden"
                            >
                                <BriefWizard />
                            </TabsContent>
                            <TabsContent value="quick" forceMount tabIndex={-1} className="data-[state=inactive]:hidden">
                                <QuickContactForm />
                            </TabsContent>
                        </Tabs>
                    </div>

                    <aside
                        aria-labelledby={`${id}-alt-heading`}
                        className="grid min-w-0 gap-px sm:grid-cols-2 lg:col-span-4 lg:grid-cols-1 lg:grid-rows-[auto_1fr]"
                    >
                        {/* Phones skip the photo so the phone and e-mail alternative follows the form directly. */}
                        <div className="hidden bg-background sm:block">
                            <ContactScene className="aspect-square" />
                        </div>

                        <div className="flex flex-col gap-6 bg-background px-4 py-10 sm:p-6 lg:p-8">
                            <h3 id={`${id}-alt-heading`} className="text-xl font-semibold tracking-tight">
                                {copy.altHeading}
                            </h3>
                            <ul className="grid gap-1 md:gap-4">
                                <li>
                                    <a href={`mailto:${contact.email}`} className={contactLinkClass}>
                                        <Mail aria-hidden="true" className="size-4 text-muted-foreground" />
                                        {contact.email}
                                    </a>
                                </li>
                                <li>
                                    <a href={contact.phone.href} className={contactLinkClass}>
                                        <Phone aria-hidden="true" className="size-4 text-muted-foreground" />
                                        {contact.phone.display}
                                    </a>
                                </li>
                            </ul>
                            <Button type="button" variant="outline" onClick={(event) => openCallback(event.currentTarget)} className="self-start max-md:h-11">
                                {copy.callMe}
                            </Button>
                        </div>
                    </aside>
                </div>
            </div>
        </Section>
    );
}
