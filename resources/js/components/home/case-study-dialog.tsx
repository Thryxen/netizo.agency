import { ExternalLinkIcon, XIcon } from 'lucide-react';
import { type RefObject, useRef } from 'react';
import { ExternalLink } from '@/components/home/external-link';
import { useHomeUi } from '@/components/home/home-ui-context';
import { ProjectFrame } from '@/components/home/project-frame';
import { TechTag } from '@/components/home/tech-tag';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import type { Project, ProjectMetric } from '@/types/home';

type ProjectMetricsProps = {
    metrics: ProjectMetric[];
    size?: 'sm' | 'lg';
    className?: string;
};

/**
 * Project numbers as a shared-border row (value over label). Renders nothing without metrics.
 */
export function ProjectMetrics({ metrics, size = 'sm', className }: ProjectMetricsProps) {
    if (metrics.length === 0) {
        return null;
    }

    const columns = metrics.length === 1 ? 'grid-cols-1' : metrics.length === 2 ? 'grid-cols-2' : 'grid-cols-3';

    return (
        <ul aria-label="Projekt w liczbach" className={cn('grid border-t border-l', columns, className)}>
            {metrics.map((metric) => (
                <li key={`${metric.value}-${metric.label}`} className={cn('flex min-w-0 flex-col gap-1 border-r border-b p-3', size === 'lg' ? 'md:p-5' : 'md:p-4')}>
                    <span
                        className={cn(
                            'font-semibold tracking-tight tabular-nums [overflow-wrap:anywhere]',
                            size === 'lg' ? 'text-xl md:text-2xl' : 'text-lg',
                        )}
                    >
                        {metric.value}
                    </span>
                    <span className="text-xs leading-snug hyphens-auto text-muted-foreground [overflow-wrap:anywhere] md:text-sm">{metric.label}</span>
                </li>
            ))}
        </ul>
    );
}

type CaseStudyDialogProps = {
    /** The project to show. Keep it set while closing so the exit animation still has content. */
    project: Project | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    /** Element that opened the dialog (no DialogTrigger is used, so Radix can't restore focus by itself). */
    returnFocusRef?: RefObject<HTMLElement | null>;
};

/**
 * Case study for one project, built from page props (no request). The whole dialog scrolls under a sticky
 * title bar; Esc, overlay click and the close button close it.
 */
export function CaseStudyDialog({ project, open, onOpenChange, returnFocusRef }: CaseStudyDialogProps) {
    const { openContact } = useHomeUi();
    const isContactRequestedRef = useRef(false);

    const requestQuote = (): void => {
        isContactRequestedRef.current = true;
        onOpenChange(false);
        openContact('brief');
    };

    /**
     * After the CTA, openContact() moves focus to the contact heading, so leave focus alone.
     * Otherwise return it to the "Zobacz case study" button that opened the dialog.
     */
    const handleCloseAutoFocus = (event: Event): void => {
        event.preventDefault();

        if (isContactRequestedRef.current) {
            isContactRequestedRef.current = false;

            return;
        }

        const returnTarget = returnFocusRef?.current;

        if (returnTarget?.isConnected) {
            returnTarget.focus();
        }
    };

    return (
        <Dialog open={open && project !== null} onOpenChange={onOpenChange}>
            {project && (
                <DialogContent
                    showCloseButton={false}
                    onCloseAutoFocus={handleCloseAutoFocus}
                    className="block max-h-[calc(100dvh-2rem)] overflow-y-auto overscroll-contain p-0 sm:max-w-5xl"
                >
                    <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b bg-background px-5 py-4 md:px-8 md:py-5">
                        <div className="min-w-0">
                            <DialogTitle className="text-xl leading-tight font-semibold tracking-tight text-balance md:text-2xl">
                                {project.title}
                            </DialogTitle>
                            <DialogDescription className="mt-1">{project.category}</DialogDescription>
                        </div>
                        <DialogClose asChild>
                            <Button variant="ghost" size="icon" aria-label="Zamknij" className="-mt-1 -mr-2 shrink-0 max-md:size-11">
                                <XIcon aria-hidden="true" />
                            </Button>
                        </DialogClose>
                    </div>

                    <div className="grid gap-10 px-5 py-6 md:px-8 md:py-8">
                        <div className="grid gap-4">
                            <p>
                                <ExternalLink
                                    href={project.liveUrl}
                                    className="inline-flex items-center gap-1.5 rounded-sm text-sm font-medium underline decoration-foreground/30 underline-offset-4 transition-colors hover:decoration-foreground focus-visible:outline-2 focus-visible:outline-offset-2"
                                >
                                    {project.url}
                                    <ExternalLinkIcon aria-hidden="true" className="size-3.5" />
                                </ExternalLink>
                            </p>
                            <ProjectMetrics metrics={project.metrics} size="lg" />
                        </div>

                        <ProjectFrame project={project} variant="full" />

                        <div>
                            <h3 className="text-lg font-semibold tracking-tight">O projekcie</h3>
                            <p className="mt-3 max-w-[65ch] leading-relaxed text-pretty">{project.fullDescription || project.description}</p>
                        </div>

                        <ChallengesAndSolutions challenges={project.challenges} solutions={project.solutions} />

                        {project.techStack.length > 0 && (
                            <div>
                                <h3 className="text-lg font-semibold tracking-tight">Stack technologiczny</h3>
                                <ul className="mt-4 flex flex-wrap gap-1.5">
                                    {project.techStack.map((tech) => (
                                        <li key={tech}>
                                            <TechTag size="md">{tech}</TechTag>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col gap-4 border-t bg-muted/50 px-5 py-6 sm:flex-row sm:items-center sm:justify-between md:px-8">
                        <p className="text-lg leading-snug font-semibold tracking-tight text-balance">
                            Podoba Ci się ten projekt? Zbudujmy coś razem.
                        </p>
                        <Button size="lg" className="self-start max-md:h-11 sm:self-auto" onClick={requestQuote}>
                            Wyślij zapytanie
                        </Button>
                    </div>
                </DialogContent>
            )}
        </Dialog>
    );
}

function ChallengesAndSolutions({ challenges, solutions }: { challenges: string[]; solutions: string[] }) {
    const columns = [
        { title: 'Wyzwania', items: challenges },
        { title: 'Rozwiązania', items: solutions },
    ].filter((column) => column.items.length > 0);

    if (columns.length === 0) {
        return null;
    }

    return (
        <div className={cn('grid border-t border-l', columns.length === 2 && 'md:grid-cols-2')}>
            {columns.map((column) => (
                <div key={column.title} className="border-r border-b p-5 md:p-6">
                    <h3 className="text-lg font-semibold tracking-tight">{column.title}</h3>
                    <ul className="mt-4 grid list-disc gap-3 pl-5 marker:text-muted-foreground">
                        {column.items.map((item) => (
                            <li key={item} className="pl-1 leading-relaxed">
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
    );
}
