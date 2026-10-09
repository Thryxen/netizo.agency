import { useScroll, useTransform } from 'motion/react';
import { type CSSProperties, useRef } from 'react';
import { bleedClassName, gutterClassName, Rivet, Section, SectionHeading } from '@/components/home/section';
import { useMotionStyle, useReducedMotionPreference } from '@/components/motion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { STEPS } from './partner-data';

/**
 * The rail is driven by one custom property, `--rail` (0–1), written by scroll: the line's fill scales with it and
 * each step's marker fills once the line passes it (`--at`: where the marker sits along the line, per layout).
 * Without the property the rail is full: SSR, no JS (the `html.js` gate is gone) and reduced motion show the finished
 * state. Under the gate, until scroll takes over, it is empty, so it never drops from full to empty in sight.
 */
const STEPS_CSS = `
[data-steps] { --rail: 1; }
@media screen and (prefers-reduced-motion: no-preference) {
    .js [data-steps] { --rail: 0; }
}
[data-rail-fill='x'] { transform: scaleX(var(--rail)); transform-origin: left; }
[data-rail-fill='y'] { transform: scaleY(var(--rail)); transform-origin: top; }
[data-step-dot] { opacity: clamp(0, calc((var(--rail) - var(--at-y)) * 30), 1); }
@media (width >= 64rem) {
    [data-step-dot] { opacity: clamp(0, calc((var(--rail) - var(--at-x)) * 30), 1); }
}
`;

/**
 * Jak to działa (#jak-to-dziala): the four steps on the shared-border grid, a row of four from lg and a list below,
 * with the rail running along their top edge (lg) or down their left side. Scroll draws the rail: the line fills as
 * the steps pass up the screen and each marker fills when the line reaches it.
 */
export function StepsSection() {
    const listRef = useRef<HTMLOListElement>(null);
    const reduced = useReducedMotionPreference();
    const { scrollYProgress } = useScroll({ target: listRef, offset: ['start 80%', 'end 55%'] });
    const rail = useTransform(scrollYProgress, [0, 1], reduced ? [1, 1] : [0, 1]);

    useMotionStyle(listRef, { '--rail': rail });

    return (
        <Section id="jak-to-dziala" labelledBy="jak-to-dziala-heading" containerClassName="pb-0 md:pb-0">
            <style>{STEPS_CSS}</style>
            <SectionHeading id="jak-to-dziala-heading" title="Jak to działa" lead="Cztery kroki. Ty polecasz, my zajmujemy się resztą." />

            <div className={cn('relative border-t border-border', bleedClassName)}>
                <Rivet side="left" />
                <Rivet side="right" />
                <ol ref={listRef} data-steps="" className="relative grid gap-px bg-border lg:grid-cols-4">
                    {/* lg: the rail is the steps' top edge. */}
                    <span aria-hidden="true" className="absolute inset-x-0 -top-px z-10 hidden h-px lg:block">
                        <span data-rail-fill="x" className="block size-full bg-foreground" />
                    </span>
                    {/* Below lg: the rail runs down the left, from the first marker to the end of the list. */}
                    <span aria-hidden="true" className="absolute top-10 bottom-0 left-[21px] z-10 w-px bg-border sm:left-[29px] lg:hidden">
                        <span data-rail-fill="y" className="block size-full bg-foreground" />
                    </span>

                    {STEPS.map((step, index) => (
                        <li
                            key={step.number}
                            style={{ '--at-x': (index + 0.15) / STEPS.length, '--at-y': index / STEPS.length } as CSSProperties}
                            className="relative flex min-w-0 flex-col bg-background pt-8 pr-4 pb-10 pl-11 sm:pr-6 sm:pl-[3.25rem] lg:px-6 lg:pt-9 lg:pb-10 xl:px-7"
                        >
                            <span
                                aria-hidden="true"
                                className="absolute top-[2.15rem] left-4 z-20 size-[11px] rounded-full border border-foreground bg-background sm:left-6 lg:-top-[5px] lg:left-6 xl:left-7"
                            >
                                <span data-step-dot="" className="absolute inset-[2px] rounded-full bg-foreground" />
                            </span>

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
                    <p className="text-lg leading-snug font-medium tracking-tight text-balance">Twoja część kończy się na drugim kroku.</p>
                    <Button size="lg" variant="outline" className="shrink-0 max-md:h-11" asChild>
                        <a href="#kalkulator">Policz, ile możesz zarobić</a>
                    </Button>
                </div>
            </div>
        </Section>
    );
}
