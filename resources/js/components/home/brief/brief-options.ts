import { Globe, type LucideIcon, Monitor, PenTool, ShoppingCart, Smartphone, Wrench } from 'lucide-react';
import { type Locale, type Localized, localized } from '@/lib/i18n';

/**
 * Brief wizard options, ported 1:1 (values) from resources/views/livewire/brief.blade.php.
 * Values must stay in sync with the Rule::in lists in App\Http\Requests\StoreProjectBriefRequest, and be the same,
 * in the same order, in both languages: only labels and descriptions are translated.
 * Polish labels only got sentence case and typographic fixes (en dashes, "E-mail").
 */
export type BriefOption = { value: string; label: string; description?: string };

export type BriefCardOption = BriefOption & { icon: LucideIcon };

export type BriefOptionGroup = { title: string; options: BriefOption[] };

/** Step 1 — project types (types[]). */
export const projectTypeOptions = localized<BriefCardOption[]>({
    pl: [
        { value: 'website', label: 'Strona WWW', description: 'Landing page, firmowa, portfolio', icon: Globe },
        { value: 'webapp', label: 'Aplikacja web', description: 'SaaS, panel, dashboard, CRM', icon: Monitor },
        { value: 'ecommerce', label: 'E-commerce', description: 'Sklep, marketplace, B2B', icon: ShoppingCart },
        { value: 'mobile', label: 'Aplikacja mobilna', description: 'iOS, Android, cross-platform', icon: Smartphone },
        { value: 'redesign', label: 'Redesign', description: 'Modernizacja istniejącego projektu', icon: PenTool },
        { value: 'other', label: 'Inne', description: 'API, integracje, automatyzacje', icon: Wrench },
    ],
    en: [
        { value: 'website', label: 'Website', description: 'Landing page, company site, portfolio', icon: Globe },
        { value: 'webapp', label: 'Web app', description: 'SaaS, admin panel, dashboard, CRM', icon: Monitor },
        { value: 'ecommerce', label: 'E-commerce', description: 'Online store, marketplace, B2B', icon: ShoppingCart },
        { value: 'mobile', label: 'Mobile app', description: 'iOS, Android, cross-platform', icon: Smartphone },
        { value: 'redesign', label: 'Redesign', description: 'Modernizing an existing project', icon: PenTool },
        { value: 'other', label: 'Other', description: 'APIs, integrations, automation', icon: Wrench },
    ],
});

/** Step 2 — features (features[]), grouped. */
export const featureGroups = localized<BriefOptionGroup[]>({
    pl: [
        {
            title: 'Użytkownicy',
            options: [
                { value: 'auth', label: 'Logowanie / rejestracja' },
                { value: 'social', label: 'Social login' },
                { value: 'roles', label: 'Role i uprawnienia' },
                { value: 'profiles', label: 'Profile użytkowników' },
            ],
        },
        {
            title: 'Płatności',
            options: [
                { value: 'payments', label: 'Płatności online' },
                { value: 'subscriptions', label: 'Subskrypcje' },
                { value: 'invoices', label: 'Faktury' },
                { value: 'cart', label: 'Koszyk' },
            ],
        },
        {
            title: 'Zarządzanie',
            options: [
                { value: 'cms', label: 'CMS' },
                { value: 'admin', label: 'Panel admina' },
                { value: 'analytics', label: 'Analityka' },
                { value: 'reports', label: 'Raporty' },
            ],
        },
        {
            title: 'Integracje',
            options: [
                { value: 'api', label: 'API zewnętrzne' },
                { value: 'notifications', label: 'Powiadomienia' },
                { value: 'chat', label: 'Chat' },
                { value: 'email', label: 'E-mail marketing' },
            ],
        },
        {
            title: 'Dodatkowe',
            options: [
                { value: 'booking', label: 'Rezerwacje' },
                { value: 'search', label: 'Wyszukiwarka' },
                { value: 'multilang', label: 'Wielojęzyczność' },
                { value: 'ai', label: 'Funkcje AI' },
                { value: 'maps', label: 'Mapy' },
                { value: 'upload', label: 'Upload plików' },
            ],
        },
    ],
    en: [
        {
            title: 'Users',
            options: [
                { value: 'auth', label: 'Sign-up / log-in' },
                { value: 'social', label: 'Social login' },
                { value: 'roles', label: 'Roles and permissions' },
                { value: 'profiles', label: 'User profiles' },
            ],
        },
        {
            title: 'Payments',
            options: [
                { value: 'payments', label: 'Online payments' },
                { value: 'subscriptions', label: 'Subscriptions' },
                { value: 'invoices', label: 'Invoices' },
                { value: 'cart', label: 'Shopping cart' },
            ],
        },
        {
            title: 'Management',
            options: [
                { value: 'cms', label: 'CMS' },
                { value: 'admin', label: 'Admin panel' },
                { value: 'analytics', label: 'Analytics' },
                { value: 'reports', label: 'Reports' },
            ],
        },
        {
            title: 'Integrations',
            options: [
                { value: 'api', label: 'Third-party APIs' },
                { value: 'notifications', label: 'Notifications' },
                { value: 'chat', label: 'Chat' },
                { value: 'email', label: 'Email marketing' },
            ],
        },
        {
            title: 'Extras',
            options: [
                { value: 'booking', label: 'Bookings' },
                { value: 'search', label: 'Search' },
                { value: 'multilang', label: 'Multiple languages' },
                { value: 'ai', label: 'AI features' },
                { value: 'maps', label: 'Maps' },
                { value: 'upload', label: 'File uploads' },
            ],
        },
    ],
});

/** Step 3 — industry (select). */
export const industryOptions = localized<BriefOption[]>({
    pl: [
        { value: 'ecommerce', label: 'E-commerce / handel' },
        { value: 'fintech', label: 'Fintech / finanse' },
        { value: 'healthcare', label: 'Healthcare / medycyna' },
        { value: 'education', label: 'Edukacja / e-learning' },
        { value: 'realestate', label: 'Nieruchomości' },
        { value: 'travel', label: 'Turystyka / HoReCa' },
        { value: 'logistics', label: 'Logistyka / transport' },
        { value: 'saas', label: 'SaaS / IT' },
        { value: 'media', label: 'Media / rozrywka' },
        { value: 'other', label: 'Inna' },
    ],
    en: [
        { value: 'ecommerce', label: 'E-commerce / retail' },
        { value: 'fintech', label: 'Fintech / finance' },
        { value: 'healthcare', label: 'Healthcare / medicine' },
        { value: 'education', label: 'Education / e-learning' },
        { value: 'realestate', label: 'Real estate' },
        { value: 'travel', label: 'Travel / hospitality' },
        { value: 'logistics', label: 'Logistics / transport' },
        { value: 'saas', label: 'SaaS / IT' },
        { value: 'media', label: 'Media / entertainment' },
        { value: 'other', label: 'Other' },
    ],
});

/** Step 3 — target audience (select). */
export const audienceOptions = localized<BriefOption[]>({
    pl: [
        { value: 'b2c', label: 'B2C – klienci indywidualni' },
        { value: 'b2b', label: 'B2B – firmy' },
        { value: 'both', label: 'B2B + B2C' },
        { value: 'internal', label: 'Użytkownicy wewnętrzni' },
    ],
    en: [
        { value: 'b2c', label: 'B2C – consumers' },
        { value: 'b2b', label: 'B2B – businesses' },
        { value: 'both', label: 'B2B + B2C' },
        { value: 'internal', label: 'Internal users' },
    ],
});

/** Step 3 — "Czy masz projekt graficzny?" (radio cards). */
export const designOptions = localized<BriefOption[]>({
    pl: [
        { value: 'yes', label: 'Tak, mam', description: 'Figma / Sketch / XD' },
        { value: 'partial', label: 'Częściowo', description: 'Szkice / inspiracje' },
        { value: 'no', label: 'Nie mam', description: 'Potrzebuję projektu' },
    ],
    en: [
        { value: 'yes', label: 'Yes, I do', description: 'Figma / Sketch / XD' },
        { value: 'partial', label: 'Partly', description: 'Sketches / inspiration' },
        { value: 'no', label: 'No', description: 'I need a design' },
    ],
});

/** Step 3 — "Oczekiwany termin" (radio cards). */
export const timelineOptions = localized<BriefOption[]>({
    pl: [
        { value: 'asap', label: 'Pilne', description: 'ASAP' },
        { value: '1-2', label: '1–2 mies.', description: 'Standardowy' },
        { value: '3-6', label: '3–6 mies.', description: 'Większy projekt' },
        { value: 'flexible', label: 'Elastyczny', description: 'Do ustalenia' },
    ],
    en: [
        { value: 'asap', label: 'Urgent', description: 'ASAP' },
        { value: '1-2', label: '1–2 months', description: 'Standard' },
        { value: '3-6', label: '3–6 months', description: 'Larger project' },
        { value: 'flexible', label: 'Flexible', description: 'To be agreed' },
    ],
});

/** Step 4 — preferred technologies (tech[]). */
export const techOptions = localized<BriefOption[]>({
    pl: [
        { value: 'react', label: 'React' },
        { value: 'next', label: 'Next.js' },
        { value: 'vue', label: 'Vue.js' },
        { value: 'node', label: 'Node.js' },
        { value: 'laravel', label: 'Laravel' },
        { value: 'python', label: 'Python' },
        { value: 'wordpress', label: 'WordPress' },
        { value: 'shopify', label: 'Shopify' },
        { value: 'nopreference', label: 'Bez preferencji' },
    ],
    en: [
        { value: 'react', label: 'React' },
        { value: 'next', label: 'Next.js' },
        { value: 'vue', label: 'Vue.js' },
        { value: 'node', label: 'Node.js' },
        { value: 'laravel', label: 'Laravel' },
        { value: 'python', label: 'Python' },
        { value: 'wordpress', label: 'WordPress' },
        { value: 'shopify', label: 'Shopify' },
        { value: 'nopreference', label: 'No preference' },
    ],
});

/** Step 4 — security level (select). */
export const securityOptions = localized<BriefOption[]>({
    pl: [
        { value: 'standard', label: 'Standardowe (SSL)' },
        { value: 'high', label: 'Wysokie (2FA, szyfrowanie)' },
        { value: 'enterprise', label: 'Enterprise (GDPR, SOC2)' },
    ],
    en: [
        { value: 'standard', label: 'Standard (SSL)' },
        { value: 'high', label: 'High (2FA, encryption)' },
        { value: 'enterprise', label: 'Enterprise (GDPR, SOC2)' },
    ],
});

/** Step 4 — hosting (select). */
export const hostingOptions = localized<BriefOption[]>({
    pl: [
        { value: 'help', label: 'Potrzebuję pomocy' },
        { value: 'own', label: 'Mam własny' },
        { value: 'cloud', label: 'Cloud (AWS/GCP/Azure)' },
    ],
    en: [
        { value: 'help', label: 'I need help' },
        { value: 'own', label: 'I have my own' },
        { value: 'cloud', label: 'Cloud (AWS/GCP/Azure)' },
    ],
});

/** Step 5 — budget (radio cards). */
export const budgetOptions = localized<BriefOption[]>({
    pl: [
        { value: 'small', label: '1–5k PLN', description: 'Landing page, strona wizytówka' },
        { value: 'medium', label: '5–15k PLN', description: 'Rozbudowana strona, mały sklep' },
        { value: 'large', label: '15–50k PLN', description: 'Aplikacja, duży e-commerce' },
        { value: 'enterprise', label: '50k+ PLN', description: 'System enterprise, platforma' },
        { value: 'unknown', label: 'Do ustalenia', description: 'Chcę poznać wycenę' },
    ],
    en: [
        { value: 'small', label: 'PLN 1–5k', description: 'Landing page, simple company site' },
        { value: 'medium', label: 'PLN 5–15k', description: 'Larger website, small store' },
        { value: 'large', label: 'PLN 15–50k', description: 'App, large e-commerce' },
        { value: 'enterprise', label: 'PLN 50k+', description: 'Enterprise system, platform' },
        { value: 'unknown', label: 'To be agreed', description: 'I’d like a quote' },
    ],
});

/** Step 5 — cooperation model (radio cards). */
export const cooperationModelOptions = localized<BriefOption[]>({
    pl: [
        { value: 'fixed', label: 'Fixed price', description: 'Stała cena' },
        { value: 'hourly', label: 'Time & material', description: 'Godzinowo' },
        { value: 'dedicated', label: 'Dedicated team', description: 'Zespół' },
    ],
    en: [
        { value: 'fixed', label: 'Fixed price', description: 'One set price' },
        { value: 'hourly', label: 'Time & material', description: 'Billed hourly' },
        { value: 'dedicated', label: 'Dedicated team', description: 'Your own team' },
    ],
});

/** Step 6 — "Skąd o nas wiesz?" (select). */
export const sourceOptions = localized<BriefOption[]>({
    pl: [
        { value: 'google', label: 'Google' },
        { value: 'social', label: 'Social media' },
        { value: 'referral', label: 'Polecenie' },
        { value: 'clutch', label: 'Clutch' },
        { value: 'other', label: 'Inne' },
    ],
    en: [
        { value: 'google', label: 'Google' },
        { value: 'social', label: 'Social media' },
        { value: 'referral', label: 'Referral' },
        { value: 'clutch', label: 'Clutch' },
        { value: 'other', label: 'Other' },
    ],
});

/** Step 6 — preferred contact (contact_pref[]). */
export const contactPreferenceOptions = localized<BriefOption[]>({
    pl: [
        { value: 'email', label: 'E-mail' },
        { value: 'phone', label: 'Telefon' },
        { value: 'video', label: 'Video call' },
    ],
    en: [
        { value: 'email', label: 'Email' },
        { value: 'phone', label: 'Phone' },
        { value: 'video', label: 'Video call' },
    ],
});

const optionsByField = (locale: Locale) =>
    ({
        types: projectTypeOptions[locale],
        features: featureGroups[locale].flatMap((group) => group.options),
        industry: industryOptions[locale],
        audience: audienceOptions[locale],
        design: designOptions[locale],
        timeline: timelineOptions[locale],
        tech: techOptions[locale],
        security: securityOptions[locale],
        hosting: hostingOptions[locale],
        budget: budgetOptions[locale],
        cooperation_model: cooperationModelOptions[locale],
        source: sourceOptions[locale],
        contact_pref: contactPreferenceOptions[locale],
    }) satisfies Record<string, BriefOption[]>;

/** Every option list by brief field, in each language, for lookups. */
export const briefOptions: Localized<ReturnType<typeof optionsByField>> = { pl: optionsByField('pl'), en: optionsByField('en') };

/** Form payload; keys equal the request keys and model columns. */
export type BriefFormData = {
    types: string[];
    features: string[];
    industry: string;
    audience: string;
    design: string;
    timeline: string;
    tech: string[];
    security: string;
    hosting: string;
    integrations: string;
    budget: string;
    cooperation_model: string;
    notes: string;
    name: string;
    email: string;
    phone: string;
    company: string;
    position: string;
    website: string;
    source: string;
    contact_pref: string[];
    privacy: boolean;
};

export type BriefField = keyof BriefFormData;

export const createInitialBriefData = (): BriefFormData => ({
    types: [],
    features: [],
    industry: '',
    audience: '',
    design: '',
    timeline: '',
    tech: [],
    security: '',
    hosting: '',
    integrations: '',
    budget: '',
    cooperation_model: '',
    notes: '',
    name: '',
    email: '',
    phone: '',
    company: '',
    position: '',
    website: '',
    source: '',
    contact_pref: [],
    privacy: false,
});

export type BriefStep = { title: string; description: string };

export const briefSteps = localized<BriefStep[]>({
    pl: [
        { title: 'Jakiego typu projekt planujesz?', description: 'Wybierz wszystkie pasujące opcje.' },
        { title: 'Jakich funkcji potrzebujesz?', description: 'Zaznacz wymagane funkcjonalności.' },
        { title: 'Szczegóły projektu', description: 'Opowiedz więcej o swoich potrzebach.' },
        { title: 'Wymagania techniczne', description: 'Opcjonalne preferencje technologiczne.' },
        { title: 'Budżet i współpraca', description: 'Pomoże dopasować zakres projektu.' },
        { title: 'Dane kontaktowe', description: 'Zostaw dane, a przygotujemy wycenę.' },
    ],
    en: [
        { title: 'What kind of project are you planning?', description: 'Choose all that apply.' },
        { title: 'What features do you need?', description: 'Check the features you need.' },
        { title: 'Project details', description: 'Tell us more about what you need.' },
        { title: 'Technical requirements', description: 'Optional technology preferences.' },
        { title: 'Budget and engagement', description: 'This helps us match the scope.' },
        { title: 'Contact details', description: 'Leave your details and we’ll prepare a quote.' },
    ],
});

export const BRIEF_TOTAL_STEPS = briefSteps.pl.length;

/** The wizard step (1-based) on which each field is edited — used to jump to the first errored step. */
export const briefFieldStep: Record<BriefField, number> = {
    types: 1,
    features: 2,
    industry: 3,
    audience: 3,
    design: 3,
    timeline: 3,
    tech: 4,
    security: 4,
    hosting: 4,
    integrations: 4,
    budget: 5,
    cooperation_model: 5,
    notes: 5,
    name: 6,
    email: 6,
    phone: 6,
    company: 6,
    position: 6,
    website: 6,
    source: 6,
    contact_pref: 6,
    privacy: 6,
};

/** Success screen: what happens next (a real sequence). */
export const briefNextSteps = localized<{ title: string; description: string }[]>({
    pl: [
        { title: 'Analiza wymagań', description: 'Przejrzymy szczegóły projektu.' },
        { title: 'Wstępna wycena', description: 'Przygotujemy szacunek kosztów.' },
        { title: 'Konsultacja', description: 'Umówimy bezpłatną rozmowę.' },
    ],
    en: [
        { title: 'Requirements review', description: 'We’ll go through the project details.' },
        { title: 'Initial quote', description: 'We’ll prepare a cost estimate.' },
        { title: 'Consultation', description: 'We’ll schedule a free call.' },
    ],
});
