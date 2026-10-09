import type { CSSProperties } from 'react';
import { Container, gutterClassName, Rivet } from '@/components/home/section';
import { SplitLines } from '@/components/motion';
import { Button } from '@/components/ui/button';
import { localized, useCopy } from '@/lib/i18n';
import { usePartnerSections } from '@/lib/sections';
import { cn } from '@/lib/utils';
import { HERO_TERMS } from './partner-data';
import { ReferralScene } from './referral-scene';

/**
 * The offer as one sentence in fixed lines: four in the narrow column (phones, and from lg beside the stage), two
 * between md and lg where it spans the full width. The widest line ("dostajesz 15%") is ~6.6 em; the English lines are
 * shorter.
 */
const COPY = localized({
    pl: {
        headingLines: ['Polecasz nas,', 'dostajesz 15%', 'od każdego', 'zamówienia.'],
        lead: 'Znasz firmę, która potrzebuje strony, sklepu albo aplikacji? Przekaż jej kontakt do nas. Rozmowy, wycenę i wdrożenie bierzemy na siebie, a Ty dostajesz 15% netto od każdej opłaconej faktury tego klienta.',
        join: 'Dołącz do programu',
        calculate: 'Policz swoją prowizję',
        note: 'Udział jest bezpłatny. Odpowiadamy w ciągu 24 godzin.',
        termsLabel: 'Warunki w skrócie',
    },
    en: {
        headingLines: ['Refer us,', 'earn 15%', 'of every', 'order.'],
        lead: 'Know a company that needs a website, an online store or an app? Pass their contact details on to us. We handle the calls, the quote and the build, and you get 15% of the net value of every invoice that client pays.',
        join: 'Join the program',
        calculate: 'Calculate your commission',
        note: 'Joining is free. We reply within 24 hours.',
        termsLabel: 'Terms at a glance',
    },
});
const HEADING_WIDE_LINES = [
    [0, 1],
    [2, 3],
];

/** Same first-screen choreography as the home hero (app.css `[data-split-line]`, `[data-hero-rise]`). */
const RISE_AT = 0.5;
const RISE_STAGGER = 0.08;

const riseDelay = (index: number): CSSProperties => ({ '--hero-rise-delay': `${RISE_AT + index * RISE_STAGGER}s` }) as CSSProperties;

/** Shared borders for a 2×2 (mobile) / 1×4 (lg) strip, as under the home hero. */
const TERM_CELL_BORDERS = ['border-r border-b lg:border-b-0', 'border-b lg:border-r lg:border-b-0', 'border-r', ''];

/** Below lg the stage runs rail to rail under the copy; from lg it is the right 7/12, up to the rail (as LiveBuild). */
const STAGE_BLEED =
    '-mx-4 aspect-[4/5] border-t border-border sm:-mx-6 sm:aspect-[16/11] lg:col-span-7 lg:ml-0 lg:-mr-10 lg:aspect-auto lg:border-t-0 lg:border-l';

export function PartnerHero() {
    const copy = useCopy(COPY);
    const heroTerms = useCopy(HERO_TERMS);
    const sectionIds = usePartnerSections();

    return (
        <section aria-labelledby="hero-heading" className="relative">
            <Container>
                <div className="grid lg:min-h-[min(calc(100svh-var(--header-height)-8.5rem),56rem)] lg:grid-cols-12">
                    <div className="max-w-2xl pt-8 pb-12 sm:pt-16 lg:col-span-5 lg:flex lg:max-w-none lg:flex-col lg:justify-center lg:py-14 lg:pr-8 lg:[container-type:inline-size] xl:pr-10">
                        <SplitLines
                            id="hero-heading"
                            lines={copy.headingLines}
                            wideLines={HEADING_WIDE_LINES}
                            className="text-[clamp(2.375rem,min(6vw,9svh),4.25rem)] leading-[1.04] font-semibold tracking-[-0.04em] lg:text-[clamp(2.25rem,min(12.5cqw,3.9vw,7svh),3.5rem)]"
                        />
                        <p data-hero-rise="" style={riseDelay(0)} className="mt-6 max-w-xl text-lg leading-relaxed text-pretty text-muted-foreground lg:text-[1.0625rem] xl:text-lg">
                            {copy.lead}
                        </p>
                        <div data-hero-rise="" style={riseDelay(1)} className="mt-9 flex flex-wrap items-center gap-3 lg:mt-8">
                            <Button size="lg" className="max-md:h-11" asChild>
                                <a href={`#${sectionIds.join}`}>{copy.join}</a>
                            </Button>
                            <Button size="lg" variant="outline" className="max-md:h-11" asChild>
                                <a href={`#${sectionIds.calculator}`}>{copy.calculate}</a>
                            </Button>
                        </div>
                        <p data-hero-rise="" style={riseDelay(2)} className="mt-6 text-sm text-muted-foreground">
                            {copy.note}
                        </p>
                    </div>

                    <div className={cn('relative', STAGE_BLEED)}>
                        <ReferralScene className="absolute inset-0" />
                        <Rivet side="left" className="lg:hidden" />
                        <Rivet side="right" className="lg:hidden" />
                        <Rivet side="left" edge="bottom" className="md:hidden lg:block" />
                    </div>
                </div>
            </Container>

            <div className="border-t border-border">
                <Container className="px-0 sm:px-0 lg:px-0">
                    <Rivet side="left" />
                    <Rivet side="right" />
                    <ul aria-label={copy.termsLabel} className="grid grid-cols-2 lg:grid-cols-4">
                        {heroTerms.map((term, index) => (
                            <li key={term.label} className={cn('flex min-w-0 flex-col gap-2 border-border py-7 sm:py-8', gutterClassName, TERM_CELL_BORDERS[index])}>
                                <span className="text-[2.25rem] leading-none font-semibold tracking-tight tabular-nums sm:text-[2.5rem] lg:text-[2.75rem]">{term.value}</span>
                                <span className="text-sm leading-snug text-muted-foreground">{term.label}</span>
                            </li>
                        ))}
                    </ul>
                </Container>
            </div>
        </section>
    );
}
