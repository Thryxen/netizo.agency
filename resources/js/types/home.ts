export type ProjectMetric = { value: string; label: string };

export type Project = {
    id: number;
    slug: string;
    title: string;
    /** As stored, e.g. "treepro.pl" (no scheme). */
    url: string;
    /** Absolute, e.g. "https://treepro.pl" (scheme added if missing). */
    liveUrl: string;
    category: string;
    description: string;
    fullDescription: string;
    /** Absolute asset URLs or null. */
    thumbnailUrl: string | null;
    fullImageUrl: string | null;
    techStack: string[];
    metrics: ProjectMetric[];
    challenges: string[];
    solutions: string[];
};

export type Client = { id: number; name: string; url: string | null };

export type FaqItem = { question: string; answer: string };

export type HomePageProps = { projects: Project[]; clients: Client[]; faq: FaqItem[] };
