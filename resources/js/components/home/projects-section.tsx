import { useRef, useState } from 'react';
import { CaseStudyDialog, ProjectMetrics } from '@/components/home/case-study-dialog';
import { useHomeUi } from '@/components/home/home-ui-context';
import { ProjectFrame } from '@/components/home/project-frame';
import { bleedClassName, gutterClassName, Rivet, Section, SectionHeading } from '@/components/home/section';
import { TechTag } from '@/components/home/tech-tag';
import { Button } from '@/components/ui/button';
import { localized, useCopy } from '@/lib/i18n';
import { useHomeSections } from '@/lib/sections';
import { cn } from '@/lib/utils';
import type { Project } from '@/types/home';

const COPY = localized({
    pl: {
        title: 'Ostatnie wdrożenia',
        lead: 'Wybrane projekty, które zaprojektowaliśmy, zbudowaliśmy i dalej rozwijamy.',
        empty: 'Pierwsze realizacje pokażemy tu wkrótce.',
        write: 'Napisz do nas',
        tech: 'Technologie',
        caseStudy: 'Zobacz case study',
        caseStudyOf: (title: string): string => ` projektu ${title}`,
    },
    en: {
        title: 'Recent launches',
        lead: 'Selected projects we designed, built and keep developing.',
        empty: 'We’ll show our first projects here soon.',
        write: 'Write to us',
        tech: 'Technologies',
        caseStudy: 'See the case study',
        caseStudyOf: (title: string): string => ` of ${title}`,
    },
});

/**
 * One full-bleed row per project: hairlines run rail to rail (with rivets) and the section drops its bottom
 * padding so the last row meets the next section's hairline.
 */
export function ProjectsSection({ projects }: { projects: Project[] }) {
    const { openContact } = useHomeUi();
    const copy = useCopy(COPY);
    const sectionId = useHomeSections().projects;
    const [activeProject, setActiveProject] = useState<Project | null>(null);
    const [isCaseStudyOpen, setIsCaseStudyOpen] = useState(false);
    const caseStudyTriggerRef = useRef<HTMLElement | null>(null);

    const openCaseStudy = (project: Project, trigger: HTMLElement): void => {
        caseStudyTriggerRef.current = trigger;
        setActiveProject(project);
        setIsCaseStudyOpen(true);
    };

    const hasProjects = projects.length > 0;

    return (
        <Section id={sectionId} labelledBy={`${sectionId}-heading`} containerClassName={hasProjects ? 'pb-0 md:pb-0' : undefined}>
            <SectionHeading id={`${sectionId}-heading`} title={copy.title} lead={copy.lead} />

            {hasProjects ? (
                <>
                    <ul className={cn('divide-y border-t', bleedClassName)}>
                        {projects.map((project) => (
                            <li key={project.id} className={cn('relative py-10 md:py-14', gutterClassName)}>
                                <Rivet side="left" />
                                <Rivet side="right" />
                                <ProjectRow project={project} onOpenCaseStudy={openCaseStudy} />
                            </li>
                        ))}
                    </ul>
                    <CaseStudyDialog
                        project={activeProject}
                        open={isCaseStudyOpen}
                        onOpenChange={setIsCaseStudyOpen}
                        returnFocusRef={caseStudyTriggerRef}
                    />
                </>
            ) : (
                <div className="flex flex-col items-start gap-6 border p-8 md:p-10">
                    <p className="text-lg leading-relaxed">{copy.empty}</p>
                    <Button variant="outline" className="max-md:h-11" onClick={() => openContact('quick')}>
                        {copy.write}
                    </Button>
                </div>
            )}
        </Section>
    );
}

type ProjectRowProps = {
    project: Project;
    onOpenCaseStudy: (project: Project, trigger: HTMLElement) => void;
};

/**
 * `group/project`: keyboard focus on the row's button scrolls the screenshot preview like a hover on the frame does.
 */
function ProjectRow({ project, onOpenCaseStudy }: ProjectRowProps) {
    const copy = useCopy(COPY);
    const titleId = `projekt-${project.slug}-title`;

    return (
        <article aria-labelledby={titleId} className="group/project grid gap-8 lg:grid-cols-12 lg:items-center lg:gap-12">
            <div className="min-w-0 lg:col-span-5">
                <h3 id={titleId} className="text-2xl leading-tight font-semibold tracking-tight">
                    {project.title}
                </h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{project.category}</p>
                <p className="mt-5 max-w-[60ch] leading-relaxed text-pretty">{project.description}</p>

                {project.techStack.length > 0 && (
                    <ul aria-label={copy.tech} className="mt-6 flex flex-wrap gap-1.5">
                        {project.techStack.map((tech) => (
                            <li key={tech}>
                                <TechTag>{tech}</TechTag>
                            </li>
                        ))}
                    </ul>
                )}

                <ProjectMetrics metrics={project.metrics} className="mt-8" />

                <Button variant="outline" aria-haspopup="dialog" className="mt-8 max-md:h-11" onClick={(event) => onOpenCaseStudy(project, event.currentTarget)}>
                    {copy.caseStudy}
                    <span className="sr-only">{copy.caseStudyOf(project.title)}</span>
                </Button>
            </div>

            <ProjectFrame project={project} variant="preview" className="order-first lg:col-span-7" />
        </article>
    );
}
