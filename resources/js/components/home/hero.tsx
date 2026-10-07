import type { CSSProperties } from 'react';
import { useHomeUi } from '@/components/home/home-ui-context';
import { LiveBuild } from '@/components/home/live-build/live-build';
import { Container, gutterClassName, Rivet } from '@/components/home/section';
import { CountUp, SplitLines } from '@/components/motion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type HeroStat = {
    value: string;
    label: string;
    /** Count up from this value on load; omit for figures that stay as they are. */
    countFrom?: number;
};

/**
 * Only the figures that read well while moving count: "150+" from 120 and "99,9%" from 99,0 (just the decimal moves).
 * A small integer ("8 lat") or a ceiling metric counted up from zero would read as a claim about zero.
 */
const STATS: HeroStat[] = [
    { value: '150+', label: 'zrealizowanych projektów', countFrom: 120 },
    { value: '8 lat', label: 'doświadczenia' },
    { value: '99,9%', label: 'dostępności wdrożeń', countFrom: 99 },
    { value: 'Leszno', label: 'działamy w całej Polsce' },
];

/** Shared borders for a 2×2 (mobile) / 1×4 (lg) strip: right edges between columns, bottom edge under the first row. */
const STAT_CELL_BORDERS = ['border-r border-b lg:border-b-0', 'border-b lg:border-r lg:border-b-0', 'border-r', ''];

const STAT_VALUE_CLASS = 'font-pixel text-[2.25rem] leading-none tracking-tight sm:text-[2.5rem] lg:text-[2.75rem]';

/**
 * The heading as fixed lines: four in the narrow column (phones, and from lg beside the stage), two between md and lg
 * where it spans the full width.
 */
const HEADING_LINES = ['Tworzymy', 'strony WWW', 'dla ambitnych', 'firm.'];
const HEADING_WIDE_LINES = [
    [0, 1],
    [2, 3],
];

/**
 * The first screen plays from the first paint, in CSS only (app.css: `[data-split-line]`, `[data-hero-rise]`), so it
 * never waits for the bundle: H1 lines rise (0–1.1 s), then the lead, the buttons and the reply line (from 0.42 s).
 * The stage starts building as soon as the app has hydrated; the counters run once the copy has settled.
 * Reduced motion and print show everything in place.
 */
const RISE_AT = 0.42;
const RISE_STAGGER = 0.08;
const COUNTER_DELAY = 0.7;
const COUNTER_STAGGER = 0.12;
const COUNTER_DURATION = 1;

const riseDelay = (index: number): CSSProperties => ({ '--hero-rise-delay': `${RISE_AT + index * RISE_STAGGER}s` }) as CSSProperties;

/**
 * Below lg the stage runs rail to rail under the copy (the gutter undone, as bleedClassName does), under a hairline
 * with rivets at the rails; from lg it is the right 7/12 of the hero, from the header hairline down to the stats
 * hairline and into the right gutter up to the rail. Side-specific margins at lg, because `lg:-mx-10` would outrank a
 * later `lg:ml-0`.
 */
const STAGE_BLEED = '-mx-4 border-t border-border sm:-mx-6 lg:col-span-7 lg:ml-0 lg:-mr-10 lg:border-t-0 lg:border-l';

export function Hero() {
    const { openContact } = useHomeUi();

    return (
        <section aria-labelledby="hero-heading" className="relative">
            <Container>
                {/* From lg the hero (with its stats strip) fills the first screen; the copy centres in it. */}
                <div className="grid lg:min-h-[min(calc(100svh-var(--header-height)-8.5rem),56rem)] lg:grid-cols-12">
                    {/* From lg the column is a size container: the heading scales with the column's width (the widest line,
                        "dla ambitnych", is ~6.23 em), so its four lines never re-wrap on wide or tall screens. */}
                    <div className="max-w-2xl pt-8 pb-12 sm:pt-16 lg:col-span-5 lg:flex lg:max-w-none lg:flex-col lg:justify-center lg:py-14 lg:pr-8 lg:[container-type:inline-size] xl:pr-10 [@media(min-width:1024px)_and_(max-height:820px)]:py-10">
                        <SplitLines
                            id="hero-heading"
                            lines={HEADING_LINES}
                            wideLines={HEADING_WIDE_LINES}
                            className="text-[clamp(2.75rem,min(6.5vw,10.5svh),5rem)] leading-[1.02] font-semibold tracking-[-0.04em] lg:text-[clamp(2.5rem,min(15.6cqw,4.6vw,9.5svh),4.5rem)]"
                        />
                        <p data-hero-rise="" style={riseDelay(0)} className="mt-6 max-w-xl text-lg leading-relaxed text-pretty text-muted-foreground lg:text-[1.0625rem] xl:text-lg">
                            Strony, aplikacje webowe i mobilne oraz systemy dla firm. Projektujemy, programujemy i opiekujemy się nimi po
                            wdrożeniu.
                        </p>
                        <div data-hero-rise="" style={riseDelay(1)} className="mt-9 flex flex-wrap items-center gap-3 lg:mt-8">
                            <Button size="lg" className="max-md:h-11" onClick={() => openContact('brief')}>
                                Wyceń projekt
                            </Button>
                            <Button size="lg" variant="outline" className="max-md:h-11" asChild>
                                <a href="#projekty">Zobacz realizacje</a>
                            </Button>
                        </div>
                        {/* Phones: left out, so more of the stage (and its photo) makes the first screen; it is quoted again
                            in the FAQ and on the contact form. */}
                        <p data-hero-rise="" style={riseDelay(2)} className="mt-6 hidden text-sm text-muted-foreground sm:block">
                            Odpowiadamy w ciągu 24 godzin.
                        </p>
                    </div>

                    <LiveBuild className={STAGE_BLEED} />
                </div>
            </Container>

            <div className="border-t border-border">
                <Container className="px-0 sm:px-0 lg:px-0">
                    <Rivet side="left" />
                    <Rivet side="right" />
                    <ul className="grid grid-cols-2 lg:grid-cols-4">
                        {STATS.map((stat, index) => (
                            <li
                                key={stat.label}
                                className={cn('flex min-w-0 flex-col gap-2 border-border py-7 sm:py-8', gutterClassName, STAT_CELL_BORDERS[index])}
                            >
                                {stat.countFrom === undefined ? (
                                    <span className={STAT_VALUE_CLASS}>{stat.value}</span>
                                ) : (
                                    <CountUp
                                        value={stat.value}
                                        from={stat.countFrom}
                                        delay={COUNTER_DELAY + index * COUNTER_STAGGER}
                                        duration={COUNTER_DURATION}
                                        className={STAT_VALUE_CLASS}
                                    />
                                )}
                                <span className="text-sm leading-snug text-muted-foreground">{stat.label}</span>
                            </li>
                        ))}
                    </ul>
                </Container>
            </div>
        </section>
    );
}
