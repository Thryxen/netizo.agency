export type AdminUser = { id: number; name: string; email: string };

export type AdminSharedProps = {
    auth: { user: AdminUser | null };
    sidebarOpen: boolean;
    flash: { success: string | null };
    errors: Record<string, string>;
};

export type Paginated<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    from: number | null;
    to: number | null;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
};

export type LeadFilters = {
    search: string;
    from: string;
    until: string;
    sort: string;
    direction: 'asc' | 'desc';
};

export type AdminProjectRow = {
    id: number;
    title: string;
    slug: string;
    url: string;
    category: string;
    sortOrder: number;
    isActive: boolean;
    thumbnailUrl: string | null;
    updatedAt: string;
};

export type AdminProject = AdminProjectRow & {
    description: string;
    fullDescription: string;
    fullImageUrl: string | null;
    techStack: string[];
    metrics: { value: string; label: string }[];
    challenges: string[];
    solutions: string[];
    /** English copy for /en; empty strings and lists fall back to the Polish copy there. */
    categoryEn: string;
    descriptionEn: string;
    fullDescriptionEn: string;
    metricsEn: { value: string; label: string }[];
    challengesEn: string[];
    solutionsEn: string[];
};

export type AdminClient = {
    id: number;
    name: string;
    url: string | null;
    sortOrder: number;
    isActive: boolean;
    updatedAt: string;
};

/** Language of the site a lead came from (`/` or `/en`). */
export type LeadLocale = 'pl' | 'en';

export type AdminMessageRow = {
    id: number;
    locale: LeadLocale;
    name: string;
    email: string;
    subject: string | null;
    excerpt: string;
    createdAt: string;
};

export type AdminMessage = AdminMessageRow & { message: string };

export type AdminBriefRow = {
    id: number;
    locale: LeadLocale;
    name: string;
    email: string;
    company: string | null;
    types: string[];
    budget: string | null;
    timeline: string | null;
    createdAt: string;
};

export type AdminBrief = AdminBriefRow & {
    phone: string | null;
    position: string | null;
    website: string | null;
    source: string | null;
    contactPref: string[];
    features: string[];
    industry: string | null;
    audience: string | null;
    design: string | null;
    tech: string[];
    security: string | null;
    hosting: string | null;
    integrations: string | null;
    cooperationModel: string | null;
    notes: string | null;
};

export type AdminCallbackRow = { id: number; locale: LeadLocale; phone: string; createdAt: string };

export type AdminPartnerRow = {
    id: number;
    locale: LeadLocale;
    name: string;
    email: string;
    phone: string | null;
    partnerType: string;
    createdAt: string;
};

export type AdminPartner = AdminPartnerRow & { message: string | null };

export type BriefFilters = LeadFilters & { budget: string; timeline: string };
