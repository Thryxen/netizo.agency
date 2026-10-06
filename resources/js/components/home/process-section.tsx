import { type MotionValue, useScroll, useTransform } from 'motion/react';
import { useRef } from 'react';
import { Section, SectionHeading } from '@/components/home/section';
import { TechTag } from '@/components/home/tech-tag';
import { PixelatedImage, useMotionStyle, useReducedMotionPreference } from '@/components/motion';
import { type PhotoName, photo } from '@/lib/photos';
import { cn } from '@/lib/utils';

type ProcessStep = {
    number: string;
    title: string;
    description: string;
    tags: string[];
    photo: PhotoName;
};

const STEPS: ProcessStep[] = [
    {
        number: '01',
        title: 'Odkrywanie',
        description: 'Poznajemy Twój biznes, analizujemy rynek i konkurencję. Definiujemy cele, wymagania i roadmapę projektu.',
        tags: ['Warsztaty', 'Research', 'Strategia'],
        photo: 'process-discovery',
    },
    {
        number: '02',
        title: 'Projektowanie',
        description: 'Tworzymy wireframe’y i interaktywne prototypy. Projektujemy UI/UX zgodny z Twoją marką i potrzebami użytkowników.',
        tags: ['Wireframes', 'Prototypy', 'UI/UX'],
        photo: 'process-design',
    },
    {
        number: '03',
        title: 'Rozwój',
        description: 'Kodujemy w dwutygodniowych sprintach z regularnymi demo. Code review, testy automatyczne i CI/CD pipeline.',
        tags: ['Agile', 'CI/CD', 'Testing'],
        photo: 'process-development',
    },
    {
        number: '04',
        title: 'Wdrożenie',
        description: 'Wdrażamy na produkcję z pełnym monitoringiem. Zapewniamy wsparcie techniczne i rozwijamy projekt według potrzeb.',
        tags: ['Deploy', 'Monitoring', 'Support'],
        photo: 'process-launch',
    },
];

/** Rail segments between the markers. */
const SEGMENTS = STEPS.length - 1;

/**
 * Four steps on a rail: vertical with a left rail below lg, a horizontal row from lg up. Each step has an 11px square
 * marker; the 1px rail runs through the markers' centres. Each step's photo (3:2) sits above its text, except on md
 * where it sits beside it (photo column + text column) so the vertical list stays short.
 *
 * The rail draws with scroll progress and each marker fills when the line reaches it:
 * - from lg the steps share one row, so one progress for the whole list (its top travelling from 85% to 35% of the
 *   viewport) draws the three segments one after another;
 * - below lg each segment follows its own step, so the line's tip tracks a point 60% down the viewport.
 * SSR, no JS and reduced motion show the finished rail (the empty state is only styled under `html.js` with motion).
 */
export function ProcessSection() {
    const listRef = useRef<HTMLOListElement>(null);
    const reduced = useReducedMotionPreference();
    const { scrollYProgress: rowProgress } = useScroll({ target: listRef, offset: ['start 0.85', 'start 0.35'] });

    return (
        <Section id="proces" labelledBy="proces-heading">
            <SectionHeading id="proces-heading" title="Jak pracujemy" lead="Cztery etapy. Na każdym wiesz, co się dzieje i co dostajesz." />

            <ol ref={listRef} className="grid lg:grid-cols-4">
                {STEPS.map((step, index) => (
                    <ProcessStepItem key={step.number} step={step} index={index} rowProgress={rowProgress} reduced={reduced} />
                ))}
            </ol>
        </Section>
    );
}

/** `[.js_&]` + `motion-safe`: the undrawn state before the first scroll measurement; inline styles take over after. */
const undrawnVertical = 'motion-safe:[.js_&]:[transform:scaleY(0)]';
const undrawnHorizontal = 'motion-safe:[.js_&]:[transform:scaleX(0)]';
const unfilledMarker = 'motion-safe:[.js_&]:opacity-0';

type ProcessStepItemProps = {
    step: ProcessStep;
    index: number;
    rowProgress: MotionValue<number>;
    reduced: boolean;
};

function ProcessStepItem({ step, index, rowProgress, reduced }: ProcessStepItemProps) {
    const isLast = index === SEGMENTS;
    const itemRef = useRef<HTMLLIElement>(null);
    const verticalFillRef = useRef<HTMLSpanElement>(null);
    const horizontalFillRef = useRef<HTMLSpanElement>(null);
    const stackedMarkerRef = useRef<HTMLSpanElement>(null);
    const rowMarkerRef = useRef<HTMLSpanElement>(null);

    const { scrollYProgress: stepProgress } = useScroll({ target: itemRef, offset: ['start 0.6', 'end 0.6'] });
    const reachedAt = index / SEGMENTS;

    const verticalScale = useTransform(stepProgress, [0, 1], reduced ? [1, 1] : [0, 1]);
    const horizontalScale = useTransform(rowProgress, [reachedAt, (index + 1) / SEGMENTS], reduced ? [1, 1] : [0, 1]);
    const stackedMarkerOpacity = useTransform(stepProgress, (progress): number => (reduced || progress > 0 ? 1 : 0));
    const rowMarkerOpacity = useTransform(rowProgress, (progress): number => (reduced || (progress > 0 && progress >= reachedAt - 0.001) ? 1 : 0));

    useMotionStyle(verticalFillRef, { scaleY: verticalScale });
    useMotionStyle(horizontalFillRef, { scaleX: horizontalScale });
    useMotionStyle(stackedMarkerRef, { opacity: stackedMarkerOpacity });
    useMotionStyle(rowMarkerRef, { opacity: rowMarkerOpacity });

    const image = photo(step.photo);

    return (
        <li
            ref={itemRef}
            className={cn(
                'relative pl-10 md:grid md:grid-cols-2 md:grid-rows-[auto_auto_auto_1fr] md:content-start md:gap-x-8 lg:flex lg:flex-col lg:pt-12 lg:pr-8 lg:pl-0',
                !isLast && 'pb-12 lg:pb-0',
            )}
        >
            {!isLast && (
                <>
                    <span aria-hidden="true" className="absolute top-[22px] -bottom-[11px] left-[5px] w-px bg-border lg:hidden">
                        <span ref={verticalFillRef} className={cn('block size-full origin-top bg-foreground', undrawnVertical)} />
                    </span>
                    <span aria-hidden="true" className="absolute top-[5px] right-0 left-[11px] hidden h-px bg-border lg:block">
                        <span ref={horizontalFillRef} className={cn('block size-full origin-left bg-foreground', undrawnHorizontal)} />
                    </span>
                </>
            )}
            <span aria-hidden="true" className="absolute top-[11px] left-0 size-[11px] border border-foreground bg-background lg:top-0">
                <span ref={stackedMarkerRef} className={cn('absolute -inset-px bg-foreground transition-opacity duration-300 lg:hidden', unfilledMarker)} />
                <span ref={rowMarkerRef} className={cn('absolute -inset-px hidden bg-foreground transition-opacity duration-300 lg:block', unfilledMarker)} />
            </span>

            <span aria-hidden="true" className="block font-pixel text-[2rem] leading-none md:col-span-2">
                {step.number}
            </span>
            <PixelatedImage
                {...image}
                sizes="(min-width: 1248px) 248px, (min-width: 1024px) 20vw, (min-width: 768px) 40vw, calc(100vw - 4.5rem)"
                alt=""
                className="mt-5 aspect-[3/2] border md:row-span-3 lg:mt-6"
            />
            <h3 className="mt-5 text-xl font-semibold tracking-tight lg:mt-6">{step.title}</h3>
            <p className="mt-3 max-w-[48ch] leading-relaxed text-pretty text-muted-foreground">{step.description}</p>
            {/* From lg the tag rows bottom-align across the four steps. */}
            <ul className="mt-5 flex flex-wrap content-start gap-1.5 lg:mt-auto lg:pt-5">
                {step.tags.map((tag) => (
                    <li key={tag}>
                        <TechTag>{tag}</TechTag>
                    </li>
                ))}
            </ul>
        </li>
    );
}
