import type { CSSProperties, ReactNode, RefObject } from 'react';
import { PanelMark } from '@/components/home/panel/panel-window';
import { BriefArtifact } from '@/components/home/process/brief-artifact';
import { DesignArtifact } from '@/components/home/process/design-artifact';
import { LaunchArtifact } from '@/components/home/process/launch-artifact';
import { PROCESS_STEPS, type ProcessStep, STEP_MS, type StepState } from '@/components/home/process/process-data';
import { ProcessStyles } from '@/components/home/process/process-styles';
import { SprintArtifact } from '@/components/home/process/sprint-artifact';
import { useProcessRelay } from '@/components/home/process/use-process-relay';
import { bleedClassName, gutterClassName, Rivet, Section, SectionHeading } from '@/components/home/section';
import { TechTag } from '@/components/home/tech-tag';
import { Button } from '@/components/ui/button';
import { localized, useCopy } from '@/lib/i18n';
import { useHomeSections } from '@/lib/sections';
import { cn } from '@/lib/utils';

const COPY = localized({
    pl: {
        title: 'Jak pracujemy',
        lead: 'Cztery etapy. Na każdym wiesz, co się dzieje i co dostajesz.',
        youGet: 'Dostajesz:',
        bridge: 'Po wdrożeniu pracujemy dalej w panelu klienta.',
        bridgeCta: 'Zobacz, jak wygląda panel',
    },
    en: {
        title: 'How we work',
        lead: 'Four stages. At each one, you know what’s happening and what you get.',
        youGet: 'You get:',
        bridge: 'After launch, we keep working together in the client portal.',
        bridgeCta: 'See what the portal looks like',
    },
});

const ARTIFACTS: ((props: { state: StepState }) => ReactNode)[] = [BriefArtifact, DesignArtifact, SprintArtifact, LaunchArtifact];

/**
 * Jak pracujemy (#proces, #process): four steps as a relay of four live artifacts, each showing what the client gets at that
 * step (a brief to approve, a prototype, a sprint on staging, the live site with its panel).
 *
 * One bleed block rail to rail, cells on the shared-border grid like the bento: a row of four from lg, 2 × 2 from md,
 * a list below. The rail is the steps' top edge from md (square markers where it meets the rails and the cell
 * borders), and a vertical line on the left below md. When the steps come into view the rail runs from step to step
 * and each step's artifact plays as it is reached (use-process-relay); without JS, during SSR and under reduced motion
 * every step shows its finished frame and the rail is full.
 *
 * Below, one strip leads on to the client panel section.
 */
export function ProcessSection() {
    const relay = useProcessRelay();
    const copy = useCopy(COPY);
    const steps = useCopy(PROCESS_STEPS);
    const sectionId = useHomeSections().process;

    return (
        <Section id={sectionId} labelledBy={`${sectionId}-heading`} containerClassName="pb-0 md:pb-0">
            <ProcessStyles />
            <SectionHeading id={`${sectionId}-heading`} title={copy.title} lead={copy.lead} />

            {/* The top-left corner carries step 1's marker (md+), so only the right end gets a rivet. */}
            <div className={cn('relative border-t border-border', bleedClassName)}>
                <Rivet side="right" />
                <ol
                    ref={relay.rowRef}
                    data-process-relay=""
                    data-relay-live={relay.live ? '' : undefined}
                    data-relay-instant={relay.instant ? '' : undefined}
                    className="grid gap-px bg-border md:grid-cols-2 lg:grid-cols-4"
                >
                    {steps.map((step, index) => (
                        <ProcessStepCell
                            key={step.number}
                            step={step}
                            index={index}
                            state={relay.states[index]}
                            artifactRef={relay.artifactRefs[index]}
                        />
                    ))}
                </ol>
            </div>

            <ProcessBridge />
        </Section>
    );
}

type ProcessStepCellProps = {
    step: ProcessStep;
    index: number;
    state: StepState;
    artifactRef: RefObject<HTMLDivElement | null>;
};

function ProcessStepCell({ step, index, state, artifactRef }: ProcessStepCellProps) {
    const copy = useCopy(COPY);
    const isLast = index === PROCESS_STEPS.pl.length - 1;
    const Artifact = ARTIFACTS[index];

    return (
        <li
            data-step-state={state}
            style={{ '--relay-ms': `${STEP_MS[index]}ms` } as CSSProperties}
            className="relative flex min-w-0 flex-col bg-background pt-8 pr-4 pb-10 pl-11 sm:pr-6 sm:pl-[3.25rem] md:px-6 md:pt-7 md:pb-8 lg:px-5 xl:px-7 xl:pt-8 xl:pb-9"
        >
            {/* md+: this step's stretch of the rail is its cell's top edge (the hairline above it). */}
            <span aria-hidden="true" className="absolute inset-x-0 -top-px z-10 hidden h-px md:block">
                <span data-relay-fill="x" className="block size-full bg-foreground" />
            </span>
            {/* Below md: a line down the left, from this step's marker to the next one (the last runs to the end). */}
            <span
                aria-hidden="true"
                className={cn('absolute top-[46px] left-[21px] z-10 w-px bg-border sm:left-[29px] md:hidden', isLast ? 'bottom-0' : '-bottom-[47px]')}
            >
                <span data-relay-fill="y" className="block size-full bg-foreground" />
            </span>
            <span aria-hidden="true" data-relay-marker="" className="absolute top-10 left-4 z-20 size-[11px] sm:left-6 md:-top-[6px] md:-left-[6px]" />
            {/* 2 × 2: the second row's hairline meets the right rail at the fourth cell. */}
            {isLast && <Rivet side="right" className="lg:hidden" />}

            <div className="flex items-baseline gap-3">
                <span aria-hidden="true" data-relay-number="" className="font-mono text-lg leading-none">
                    {step.number}
                </span>
                <h3 className="text-lg font-semibold tracking-tight sm:text-xl">{step.title}</h3>
            </div>

            <div ref={artifactRef} aria-hidden="true" className="mt-5">
                <Artifact state={state} />
            </div>

            <p className="mt-5 max-w-[46ch] text-sm leading-relaxed text-pretty text-muted-foreground">{step.text}</p>
            <p className="mt-3 max-w-[46ch] text-sm leading-relaxed text-pretty">
                <span className="font-semibold">{copy.youGet}</span> {step.deliverable}
            </p>

            <ul className="mt-5 flex flex-wrap gap-1.5 md:mt-auto md:pt-5">
                {step.tags.map((tag) => (
                    <li key={tag}>
                        <TechTag>{tag}</TechTag>
                    </li>
                ))}
            </ul>
        </li>
    );
}

/** After the launch: one strip rail to rail that leads on to the client panel (#panel, #client-portal). */
function ProcessBridge() {
    const copy = useCopy(COPY);
    const panelId = useHomeSections().panel;

    return (
        <div className={cn('relative border-t border-border', bleedClassName)}>
            <Rivet side="left" />
            <Rivet side="right" />
            <div className={cn('flex flex-col items-start gap-5 py-8 sm:flex-row sm:items-center sm:justify-between md:py-9', gutterClassName)}>
                <p className="flex items-center gap-3.5 text-lg leading-snug font-medium tracking-tight text-balance">
                    <span aria-hidden="true">
                        <PanelMark className="size-7 rounded-[4px]" />
                    </span>
                    {copy.bridge}
                </p>
                <Button size="lg" variant="outline" className="shrink-0 max-md:h-11" asChild>
                    <a href={`#${panelId}`}>{copy.bridgeCta}</a>
                </Button>
            </div>
        </div>
    );
}
