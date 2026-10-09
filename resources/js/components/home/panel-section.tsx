import { Bell, FileText, History, KeyRound, type LucideIcon, MessagesSquare, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { ExternalLink } from '@/components/home/external-link';
import { useHomeUi } from '@/components/home/home-ui-context';
import { isPanelMode, PANEL_MODES, type PanelMode } from '@/components/home/panel/panel-data';
import { PanelStage } from '@/components/home/panel/panel-stage';
import { bleedClassName, gutterClassName, Rivet, Section, SectionHeading } from '@/components/home/section';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRememberedValue } from '@/hooks/use-remembered-value';
import { localized, useCopy } from '@/lib/i18n';
import { useHomeSections } from '@/lib/sections';
import { clientPanelUrl } from '@/lib/site';
import { cn } from '@/lib/utils';

type Benefit = {
    icon: LucideIcon;
    /** Rivets where this cell's top hairline meets a rail (md: 2 columns, lg: 3 columns). */
    rivets?: { side: 'left' | 'right'; className?: string }[];
};

/** The benefit cells' layout, index for index with COPY.benefits. */
const BENEFITS: Benefit[] = [
    { icon: MessagesSquare },
    { icon: FileText },
    { icon: KeyRound, rivets: [{ side: 'left', className: 'lg:hidden' }] },
    {
        icon: Bell,
        rivets: [
            { side: 'right', className: 'lg:hidden' },
            { side: 'left', className: 'md:hidden lg:block' },
        ],
    },
    { icon: History, rivets: [{ side: 'left', className: 'lg:hidden' }] },
    { icon: ShieldCheck, rivets: [{ side: 'right' }] },
];

const COPY = localized({
    pl: {
        title: 'Twój projekt w jednym panelu',
        lead: 'Po starcie współpracy dostajesz dostęp do panelu klienta. Zgłaszasz w nim poprawki, śledzisz postęp prac, czas i koszty, a dokumenty, faktury i dostępy masz w jednym miejscu.',
        modes: 'Sposób współpracy',
        logIn: 'Zaloguj się do panelu',
        askForAccess: 'Zapytaj o dostęp',
        benefitsLabel: 'Co jeszcze jest w panelu',
        benefits: [
            { title: 'Czat z zespołem', text: 'Piszesz do nas prosto z panelu, z plikami i potwierdzeniem przeczytania.' },
            { title: 'Dokumenty na żywo', text: 'Brief, wymagania i harmonogram edytujemy razem, z historią wersji i akceptacją.' },
            { title: 'Sejf dostępów', text: 'Hasła do hostingu, domeny i CMS-a są zaszyfrowane, a każde ich odkrycie trafia do dziennika.' },
            { title: 'Powiadomienia', text: 'W panelu i jako push: nowe komentarze, terminy, rozliczenia i dokumenty.' },
            { title: 'Pełna historia', text: 'Każda zmiana w zadaniach jest zapisana, także w tych usuniętych.' },
            { title: 'Bezpieczne logowanie', text: 'Hasło i jednorazowy kod z e-maila przy każdym logowaniu.' },
        ],
    },
    en: {
        title: 'Your project in one portal',
        lead: 'Once we start working together, you get access to the client portal. You report fixes there, follow the progress, the time and the costs, and keep documents, invoices and credentials in one place.',
        modes: 'How we work together',
        logIn: 'Log in to the portal',
        askForAccess: 'Ask about access',
        benefitsLabel: 'What else the portal offers',
        benefits: [
            { title: 'Team chat', text: 'You message us right from the portal, with files and read receipts.' },
            { title: 'Live documents', text: 'We edit the brief, the requirements and the schedule together, with version history and approvals.' },
            { title: 'Credentials vault', text: 'Hosting, domain and CMS passwords are encrypted, and every time one is revealed, it goes into the log.' },
            { title: 'Notifications', text: 'In the portal and as push notifications: new comments, deadlines, statements and documents.' },
            { title: 'Full history', text: 'Every change to tasks is recorded, deleted tasks included.' },
            { title: 'Secure login', text: 'A password plus a one-time code sent by email, every time you log in.' },
        ],
    },
});

/** Children of the copy cell: on their own below lg (the cell is `display: contents` there), inside its padding from lg. */
const COPY_ITEM = 'px-4 sm:px-6 lg:px-0';

/**
 * Panel klienta (#panel, #client-portal), after "Jak pracujemy": we build, we deploy, then you work with us in the panel.
 *
 * Heading, then a bleed block rail to rail (like the contact section): the copy cell (5/12: toggle, the active mode's
 * list, the buttons) and the live mock's stage (7/12, bordered off on the left, bled to the right rail). Below lg
 * the stage sits right under the toggle, rail to rail between hairlines, so the switch and what it changes stay
 * together; focus order is unaffected (the stage has nothing focusable).
 *
 * The toggle is a tablist: it switches both the list and the mock. Both tab panels are always in the HTML, stacked in
 * one grid cell (the inactive one faded out and hidden accessibly), so switching never changes the height.
 * Below: the panel's other strengths.
 */
export function PanelSection() {
    const { openContact } = useHomeUi();
    const copy = useCopy(COPY);
    const panelModes = useCopy(PANEL_MODES);
    const sectionId = useHomeSections().panel;
    const [mode, setMode] = useState<PanelMode>('project');

    useRememberedValue('home:panel-mode', mode, (remembered) => {
        if (isPanelMode(remembered)) {
            setMode(remembered);
        }
    });

    return (
        <Section id={sectionId} labelledBy={`${sectionId}-heading`} containerClassName="pb-0 md:pb-0">
            <SectionHeading id={`${sectionId}-heading`} title={copy.title} lead={copy.lead} />

            <Tabs value={mode} onValueChange={(value) => isPanelMode(value) && setMode(value)} className="block">
                <div className={cn('relative border-t border-border', bleedClassName)}>
                    <Rivet side="left" />
                    <Rivet side="right" />

                    <div className="grid lg:grid-cols-12">
                        <div className={cn('contents lg:col-span-5 lg:flex lg:flex-col lg:justify-center lg:py-14 xl:py-16', gutterClassName)}>
                            <div className={cn('order-1 pt-8 sm:pt-10 lg:pt-0', COPY_ITEM)}>
                                <TabsList
                                    aria-label={copy.modes}
                                    className="relative grid w-full grid-cols-2 group-data-[orientation=horizontal]/tabs:h-11 sm:w-fit md:group-data-[orientation=horizontal]/tabs:h-10"
                                >
                                    <span
                                        aria-hidden="true"
                                        data-mode={mode}
                                        className="absolute inset-y-[3px] left-[3px] w-[calc(50%-3px)] rounded-md bg-background shadow-sm transition-transform duration-300 ease-expo-out data-[mode=retainer]:translate-x-full dark:border dark:border-input/40 dark:bg-input/12 dark:shadow-none"
                                    />
                                    {panelModes.map(({ value, label }) => (
                                        <TabsTrigger
                                            key={value}
                                            value={value}
                                            className="relative z-10 h-full px-3 data-[state=active]:bg-transparent data-[state=active]:shadow-none sm:px-4 dark:data-[state=active]:border-transparent dark:data-[state=active]:bg-transparent"
                                        >
                                            {label}
                                        </TabsTrigger>
                                    ))}
                                </TabsList>
                            </div>

                            {/* Both lists share one grid cell: the inactive one fades out and is hidden (visibility) from everyone. */}
                            <div className={cn('order-3 mt-9 grid lg:mt-8', COPY_ITEM)}>
                                {panelModes.map(({ value, points }) => (
                                    <TabsContent
                                        key={value}
                                        value={value}
                                        forceMount
                                        className="col-start-1 row-start-1 rounded-sm transition-[opacity,translate,visibility] duration-300 ease-expo-out focus-visible:ring-offset-4 focus-visible:ring-offset-background data-[state=inactive]:invisible data-[state=inactive]:translate-y-1 data-[state=inactive]:opacity-0"
                                    >
                                        <ul className="grid list-disc gap-3.5 pl-5 marker:text-muted-foreground">
                                            {points.map((point) => (
                                                <li key={point} className="pl-1 leading-relaxed text-pretty">
                                                    {point}
                                                </li>
                                            ))}
                                        </ul>
                                    </TabsContent>
                                ))}
                            </div>

                            <div className={cn('order-4 mt-9 flex flex-wrap items-center gap-3 pb-12 sm:pb-14 lg:pb-0', COPY_ITEM)}>
                                <Button size="lg" asChild className="max-md:h-11">
                                    <ExternalLink href={clientPanelUrl} rel="noopener">
                                        {copy.logIn}
                                    </ExternalLink>
                                </Button>
                                <Button size="lg" variant="outline" className="max-md:h-11" onClick={() => openContact('quick')}>
                                    {copy.askForAccess}
                                </Button>
                            </div>
                        </div>

                        <div className="relative order-2 mt-8 border-y border-border sm:mt-10 lg:col-span-7 lg:mt-0 lg:border-y-0 lg:border-l">
                            <Rivet side="left" className="lg:hidden" />
                            <Rivet side="right" className="lg:hidden" />
                            <Rivet side="left" edge="bottom" className="lg:hidden" />
                            <Rivet side="right" edge="bottom" className="lg:hidden" />
                            <Rivet side="left" className="md:hidden lg:block" />
                            <Rivet side="left" edge="bottom" className="md:hidden lg:block" />
                            <PanelStage mode={mode} className="h-full" />
                        </div>
                    </div>
                </div>
            </Tabs>

            <PanelBenefits label={copy.benefitsLabel} benefits={copy.benefits} />
        </Section>
    );
}

/** The panel's other strengths: a shared-border grid rail to rail (3 × 2 from lg, 2 columns from md). */
function PanelBenefits({ label, benefits }: { label: string; benefits: { title: string; text: string }[] }) {
    return (
        <div className={cn('relative border-t border-border', bleedClassName)}>
            <Rivet side="left" />
            <Rivet side="right" />
            <ul aria-label={label} className="grid gap-px bg-border md:grid-cols-2 lg:grid-cols-3">
                {benefits.map(({ title, text }, index) => {
                    const { icon: Icon, rivets } = BENEFITS[index];

                    return (
                        <li key={title} className={cn('relative flex min-w-0 flex-col bg-background py-9 md:py-10 lg:py-12', gutterClassName)}>
                            {rivets?.map((rivet) => <Rivet key={`${rivet.side}-${rivet.className ?? 'all'}`} side={rivet.side} className={rivet.className} />)}
                            <span className="flex size-10 items-center justify-center rounded-[3px] border">
                                <Icon aria-hidden="true" className="size-[18px]" strokeWidth={1.75} />
                            </span>
                            <h3 className="mt-6 text-lg font-semibold tracking-tight">{title}</h3>
                            <p className="mt-1.5 max-w-[40ch] text-sm leading-relaxed text-pretty text-muted-foreground">{text}</p>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}
