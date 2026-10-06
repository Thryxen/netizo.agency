import { useScroll, useTransform } from 'motion/react';
import { type CSSProperties, type RefObject, useCallback, useRef, useState } from 'react';
import { useHomeUi } from '@/components/home/home-ui-context';
import { Container, gutterClassName, Rivet } from '@/components/home/section';
import { CountUp, PixelatedImage, SplitLines, useMotionStyle, useReducedMotionPreference } from '@/components/motion';
import { Button } from '@/components/ui/button';
import { photo } from '@/lib/photos';
import { cn } from '@/lib/utils';

type HeroStat = {
    value: string;
    label: string;
    /** Count up from this value once the photo has resolved; omit for figures that stay as they are. */
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

const HERO_PHOTO = photo('hero-studio');

/**
 * The heading as fixed lines: four in the narrow column (phones, and from lg beside the photo), two between md and lg
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
 * The photo opens on its server-rendered mosaic and resolves as soon as the app has hydrated; the counters start
 * once it is sharp. Reduced motion and print show everything in place.
 */
const RISE_AT = 0.42;
const RISE_STAGGER = 0.08;
const COUNTER_STAGGER = 0.12;
const COUNTER_DURATION = 1;

const riseDelay = (index: number): CSSProperties => ({ '--hero-rise-delay': `${RISE_AT + index * RISE_STAGGER}s` }) as CSSProperties;

/** How far (px) the photo drifts up inside its frame while the hero scrolls away. */
const PARALLAX_DISTANCE = 40;

/**
 * Below lg the photo runs rail to rail under the copy (the gutter undone, as bleedClassName does); from lg it is the
 * right half of the hero, bleeding into the right gutter up to the rail. Side-specific margins at lg, because
 * `lg:-mx-10` would outrank a later `lg:ml-0`.
 */
const PHOTO_BLEED = '-mx-4 sm:-mx-6 lg:ml-0 lg:-mr-10';

/**
 * The studio photo as a cell of the hero grid. Below lg: full-bleed between the rails at 4/3, under a hairline with
 * rivets at the rails. From lg: the right half, from the header hairline down to the stats hairline, its left border
 * exactly on the stats strip's middle divider (both sit on the container's centre line), so the rivet at its foot
 * marks a real intersection. The photo drifts up inside the frame as the hero scrolls away.
 */
function HeroPhoto({ sectionRef, onRevealed }: { sectionRef: RefObject<HTMLElement | null>; onRevealed: () => void }) {
    const layerRef = useRef<HTMLDivElement>(null);
    const reduced = useReducedMotionPreference();
    const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end start'] });
    const y = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [0, -PARALLAX_DISTANCE]);

    useMotionStyle(layerRef, { y });

    return (
        <div data-hero-photo="" className={cn('relative aspect-[4/3] border-t border-border lg:aspect-auto lg:border-t-0 lg:border-l', PHOTO_BLEED)}>
            <div className="absolute inset-0 overflow-hidden bg-muted">
                {/* Taller than the frame by the parallax distance, so the drift never uncovers an edge. */}
                <div ref={layerRef} className="absolute inset-x-0 top-0" style={{ height: `calc(100% + ${PARALLAX_DISTANCE}px)` }}>
                    <PixelatedImage
                        {...HERO_PHOTO}
                        sizes="(min-width: 1248px) 600px, (min-width: 1024px) 50vw, 100vw"
                        alt=""
                        priority
                        onRevealed={onRevealed}
                        className="absolute inset-0"
                        imgClassName="object-[50%_42%] lg:object-[50%_50%]"
                    />
                </div>
            </div>
            <Rivet side="left" className="lg:hidden" />
            <Rivet side="right" className="lg:hidden" />
            <Rivet side="left" edge="bottom" className="md:hidden lg:block" />
        </div>
    );
}

export function Hero() {
    const { openContact } = useHomeUi();
    const sectionRef = useRef<HTMLElement>(null);
    const [photoRevealed, setPhotoRevealed] = useState(false);
    const onPhotoRevealed = useCallback(() => setPhotoRevealed(true), []);

    return (
        <section ref={sectionRef} aria-labelledby="hero-heading" className="relative">
            <Container>
                {/* From lg the hero (with its stats strip) fills the first screen; the copy centres in it. */}
                <div className="grid lg:min-h-[min(calc(100svh-var(--header-height)-8.5rem),56rem)] lg:grid-cols-2">
                    <div className="max-w-2xl pt-14 pb-12 sm:pt-16 lg:flex lg:max-w-none lg:flex-col lg:justify-center lg:py-16 lg:pr-8 xl:pr-10 [@media(min-width:1024px)_and_(max-height:820px)]:py-10">
                        <SplitLines
                            id="hero-heading"
                            lines={HEADING_LINES}
                            wideLines={HEADING_WIDE_LINES}
                            className="text-[clamp(2.75rem,min(6.5vw,10.5svh),5rem)] leading-[1.02] font-semibold tracking-[-0.04em] lg:text-[clamp(2.75rem,min(6vw,10.5svh),5rem)]"
                        />
                        <p data-hero-rise="" style={riseDelay(0)} className="mt-6 max-w-xl text-lg leading-relaxed text-pretty text-muted-foreground">
                            Strony, aplikacje webowe i mobilne oraz systemy dla firm. Projektujemy, programujemy i opiekujemy się nimi po
                            wdrożeniu.
                        </p>
                        <div data-hero-rise="" style={riseDelay(1)} className="mt-9 flex flex-wrap items-center gap-3">
                            <Button size="lg" className="max-md:h-11" onClick={() => openContact('brief')}>
                                Wyceń projekt
                            </Button>
                            <Button size="lg" variant="outline" className="max-md:h-11" asChild>
                                <a href="#projekty">Zobacz realizacje</a>
                            </Button>
                        </div>
                        <p data-hero-rise="" style={riseDelay(2)} className="mt-6 text-sm text-muted-foreground">
                            Odpowiadamy w ciągu 24 godzin.
                        </p>
                    </div>

                    <HeroPhoto sectionRef={sectionRef} onRevealed={onPhotoRevealed} />
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
                                        hold={!photoRevealed}
                                        delay={index * COUNTER_STAGGER}
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
