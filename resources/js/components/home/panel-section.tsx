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
import { clientPanelUrl } from '@/lib/site';
import { cn } from '@/lib/utils';

type Benefit = {
    icon: LucideIcon;
    title: string;
    text: string;
    /** Rivets where this cell's top hairline meets a rail (md: 2 columns, lg: 3 columns). */
    rivets?: { side: 'left' | 'right'; className?: string }[];
};

const BENEFITS: Benefit[] = [
    { icon: MessagesSquare, title: 'Czat z zespołem', text: 'Piszesz do nas prosto z panelu, z plikami i potwierdzeniem przeczytania.' },
    { icon: FileText, title: 'Dokumenty na żywo', text: 'Brief, wymagania i harmonogram edytujemy razem, z historią wersji i akceptacją.' },
    {
        icon: KeyRound,
        title: 'Sejf dostępów',
        text: 'Hasła do hostingu, domeny i CMS-a są zaszyfrowane, a każde ich odkrycie trafia do dziennika.',
        rivets: [{ side: 'left', className: 'lg:hidden' }],
    },
    {
        icon: Bell,
        title: 'Powiadomienia',
        text: 'W panelu i jako push: nowe komentarze, terminy, rozliczenia i dokumenty.',
        rivets: [
            { side: 'right', className: 'lg:hidden' },
            { side: 'left', className: 'md:hidden lg:block' },
        ],
    },
    {
        icon: History,
        title: 'Pełna historia',
        text: 'Każda zmiana w zadaniach jest zapisana, także w tych usuniętych.',
        rivets: [{ side: 'left', className: 'lg:hidden' }],
    },
    { icon: ShieldCheck, title: 'Bezpieczne logowanie', text: 'Hasło i jednorazowy kod z e-maila przy każdym logowaniu.', rivets: [{ side: 'right' }] },
];

/** Children of the copy cell: on their own below lg (the cell is `display: contents` there), inside its padding from lg. */
const COPY_ITEM = 'px-4 sm:px-6 lg:px-0';

/**
 * Panel klienta (#panel), after "Jak pracujemy": we build, we deploy, then you work with us in the panel.
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
    const [mode, setMode] = useState<PanelMode>('project');

    useRememberedValue('home:panel-mode', mode, (remembered) => {
        if (isPanelMode(remembered)) {
            setMode(remembered);
        }
    });

    return (
        <Section id="panel" labelledBy="panel-heading" containerClassName="pb-0 md:pb-0">
            <SectionHeading
                id="panel-heading"
                title="Twój projekt w jednym panelu"
                lead="Po starcie współpracy dostajesz dostęp do panelu klienta. Zgłaszasz w nim poprawki, śledzisz postęp prac, czas i koszty, a dokumenty, faktury i dostępy masz w jednym miejscu."
            />

            <Tabs value={mode} onValueChange={(value) => isPanelMode(value) && setMode(value)} className="block">
                <div className={cn('relative border-t border-border', bleedClassName)}>
                    <Rivet side="left" />
                    <Rivet side="right" />

                    <div className="grid lg:grid-cols-12">
                        <div className={cn('contents lg:col-span-5 lg:flex lg:flex-col lg:justify-center lg:py-14 xl:py-16', gutterClassName)}>
                            <div className={cn('order-1 pt-8 sm:pt-10 lg:pt-0', COPY_ITEM)}>
                                <TabsList
                                    aria-label="Sposób współpracy"
                                    className="relative grid w-full grid-cols-2 group-data-[orientation=horizontal]/tabs:h-11 sm:w-fit md:group-data-[orientation=horizontal]/tabs:h-10"
                                >
                                    <span
                                        aria-hidden="true"
                                        data-mode={mode}
                                        className="absolute inset-y-[3px] left-[3px] w-[calc(50%-3px)] rounded-md bg-background shadow-sm transition-transform duration-300 ease-expo-out data-[mode=retainer]:translate-x-full dark:border dark:border-input/40 dark:bg-input/12 dark:shadow-none"
                                    />
                                    {PANEL_MODES.map(({ value, label }) => (
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
                                {PANEL_MODES.map(({ value, points }) => (
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
                                        Zaloguj się do panelu
                                    </ExternalLink>
                                </Button>
                                <Button size="lg" variant="outline" className="max-md:h-11" onClick={() => openContact('quick')}>
                                    Zapytaj o dostęp
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

            <PanelBenefits />
        </Section>
    );
}

/** The panel's other strengths: a shared-border grid rail to rail (3 × 2 from lg, 2 columns from md). */
function PanelBenefits() {
    return (
        <div className={cn('relative border-t border-border', bleedClassName)}>
            <Rivet side="left" />
            <Rivet side="right" />
            <ul aria-label="Co jeszcze jest w panelu" className="grid gap-px bg-border md:grid-cols-2 lg:grid-cols-3">
                {BENEFITS.map(({ icon: Icon, title, text, rivets }) => (
                    <li key={title} className={cn('relative flex min-w-0 flex-col bg-background py-9 md:py-10 lg:py-12', gutterClassName)}>
                        {rivets?.map((rivet) => <Rivet key={`${rivet.side}-${rivet.className ?? 'all'}`} side={rivet.side} className={rivet.className} />)}
                        <span className="flex size-10 items-center justify-center rounded-[3px] border">
                            <Icon aria-hidden="true" className="size-[18px]" strokeWidth={1.75} />
                        </span>
                        <h3 className="mt-6 text-lg font-semibold tracking-tight">{title}</h3>
                        <p className="mt-1.5 max-w-[40ch] text-sm leading-relaxed text-pretty text-muted-foreground">{text}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
}
