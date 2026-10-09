import { useScroll, useTransform } from 'motion/react';
import { type CSSProperties, useRef } from 'react';
import { bleedClassName, gutterClassName, Rivet, Section, SectionHeading } from '@/components/home/section';
import { useMotionStyle, useReducedMotionPreference } from '@/components/motion';
import { Button } from '@/components/ui/button';
import { localized, useCopy } from '@/lib/i18n';
import { usePartnerSections } from '@/lib/sections';
import { cn } from '@/lib/utils';
import { STEPS } from './partner-data';

const COPY = localized({
    pl: {
        title: 'Jak to działa',
        lead: 'Cztery kroki. Ty polecasz, my zajmujemy się resztą.',
        yourPart: 'Twoja część kończy się na drugim kroku.',
        calculate: 'Policz, ile możesz zarobić',
    },
    en: {
        title: 'How it works',
        lead: 'Four steps. You refer, we take care of the rest.',
        yourPart: 'Your part ends at step two.',
        calculate: 'See how much you could earn',
    },
});

/** A marker fills over this fraction of the rail after the line reaches it. */
const MARKER_RAMP = 1 / 30;

/** The rail's end marker: placed so that it is full exactly as the line arrives. */
const END_AT = 1 - MARKER_RAMP;

/**
 * The rail is driven by two custom properties written by scroll, one per layout (`--rail-x` for the row from lg,
 * `--rail-y` for the list below), 0–1: the line's fill scales with it and each square marker (outlined like the home
 * page's process markers) fills once the line passes it (`--at`: where the marker sits along the line, the start of
 * its step in both layouts; the end marker sits at the end).
 * Without the properties the rail is full: SSR, no JS (the `html.js` gate is gone) and reduced motion show the finished
 * state. Under the gate, until scroll takes over, it is empty, so it never drops from full to empty in sight.
 */
const STEPS_CSS = `
[data-steps] { --rail-x: 1; --rail-y: 1; }
@media screen and (prefers-reduced-motion: no-preference) {
    .js [data-steps] { --rail-x: 0; --rail-y: 0; }
}
[data-rail-fill='x'] { transform: scaleX(var(--rail-x)); transform-origin: left; }
[data-rail-fill='y'] { transform: scaleY(var(--rail-y)); transform-origin: top; }
[data-step-marker] {
    background-color: var(--background);
    box-shadow: inset 0 0 0 1px color-mix(in oklab, var(--foreground) 38%, transparent);
}
[data-step-dot] { opacity: clamp(0, calc((var(--rail-y) - var(--at)) / ${MARKER_RAMP}), 1); }
@media (width >= 64rem) {
    [data-step-dot] { opacity: clamp(0, calc((var(--rail-x) - var(--at)) / ${MARKER_RAMP}), 1); }
}
`;

/** A square marker on the rail at `at` (0–1 along it): outlined until the line reaches it, filled from then on. */
function RailMarker({ at, className }: { at: number; className: string }) {
    return (
        <span aria-hidden="true" data-step-marker="" style={{ '--at': at } as CSSProperties} className={cn('absolute z-20 size-[11px]', className)}>
            <span data-step-dot="" className="absolute inset-0 bg-foreground" />
        </span>
    );
}

/**
 * Jak to działa (#jak-to-dziala, #how-it-works): the four steps on the shared-border grid, a row of four from lg and a list below,
 * with the rail running along their top edge (lg) or down their left side. Square markers sit where the rail meets
 * the cell borders (lg), as in "Jak pracujemy" on the home page, and one more ends the rail (the right rail from lg,
 * the strip below the list under lg). Scroll draws the rail: the line fills as the steps pass up the screen, each
 * marker fills when the line reaches it, and the line reaches its end while the steps are still in full view.
 */
export function StepsSection() {
    const copy = useCopy(COPY);
    const steps = useCopy(STEPS);
    const sectionIds = usePartnerSections();
    const listRef = useRef<HTMLOListElement>(null);
    const reduced = useReducedMotionPreference();
    // lg: the row is short, so the rail is full once its top edge is 40% down the screen (the steps sit mid-screen).
    const { scrollYProgress: rowProgress } = useScroll({ target: listRef, offset: ['start 85%', 'start 40%'] });
    // Below lg: the fill's tip runs just below the middle of the screen and is full when the list's end passes it.
    const { scrollYProgress: listProgress } = useScroll({ target: listRef, offset: ['start 75%', 'end 70%'] });
    const railX = useTransform(rowProgress, [0, 1], reduced ? [1, 1] : [0, 1]);
    const railY = useTransform(listProgress, [0, 1], reduced ? [1, 1] : [0, 1]);

    useMotionStyle(listRef, { '--rail-x': railX, '--rail-y': railY });

    return (
        <Section id={sectionIds.howItWorks} labelledBy={`${sectionIds.howItWorks}-heading`} containerClassName="pb-0 md:pb-0">
            <style>{STEPS_CSS}</style>
            <SectionHeading id={`${sectionIds.howItWorks}-heading`} title={copy.title} lead={copy.lead} />

            {/* lg: the top corners carry step 1's marker and the rail's end marker, so the rivets show only below lg. */}
            <div className={cn('relative border-t border-border', bleedClassName)}>
                <Rivet side="left" className="lg:hidden" />
                <Rivet side="right" className="lg:hidden" />
                <ol ref={listRef} data-steps="" className="relative grid gap-px bg-border lg:grid-cols-4">
                    {/* lg: the rail is the steps' top edge. */}
                    <span aria-hidden="true" className="absolute inset-x-0 -top-px z-10 hidden h-px lg:block">
                        <span data-rail-fill="x" className="block size-full bg-foreground" />
                    </span>
                    {/* Below lg: the rail runs down the left, from the first marker to the end of the list. */}
                    <span aria-hidden="true" className="absolute top-10 bottom-0 left-[21px] z-10 w-px bg-border sm:left-[29px] lg:hidden">
                        <span data-rail-fill="y" className="block size-full bg-foreground" />
                    </span>
                    {/* The rail's end: the right rail (lg), the hairline under the list (below lg). */}
                    <RailMarker at={END_AT} className="-top-[6px] -right-[6px] hidden lg:block" />
                    <RailMarker at={END_AT} className="-bottom-[6px] left-4 sm:left-6 lg:hidden" />

                    {steps.map((step, index) => (
                        <li
                            key={step.number}
                            className="relative flex min-w-0 flex-col bg-background pt-8 pr-4 pb-10 pl-11 sm:pr-6 sm:pl-[3.25rem] lg:px-6 lg:pt-9 lg:pb-10 xl:px-7"
                        >
                            <RailMarker at={index / steps.length} className="top-[2.15rem] left-4 sm:left-6 lg:-top-[6px] lg:-left-[6px]" />

                            <span aria-hidden="true" className="font-mono text-sm text-muted-foreground">
                                {step.number}
                            </span>
                            <h3 className="mt-2 text-xl font-semibold tracking-tight">{step.title}</h3>
                            <p className="mt-3 max-w-[46ch] leading-relaxed text-pretty text-muted-foreground">{step.text}</p>
                        </li>
                    ))}
                </ol>
            </div>

            <div className={cn('relative border-t border-border', bleedClassName)}>
                <Rivet side="left" />
                <Rivet side="right" />
                <div className={cn('flex flex-col items-start gap-5 py-8 sm:flex-row sm:items-center sm:justify-between md:py-9', gutterClassName)}>
                    <p className="text-lg leading-snug font-medium tracking-tight text-balance">{copy.yourPart}</p>
                    <Button size="lg" variant="outline" className="shrink-0 max-md:h-11" asChild>
                        <a href={`#${sectionIds.calculator}`}>{copy.calculate}</a>
                    </Button>
                </div>
            </div>
        </Section>
    );
}
