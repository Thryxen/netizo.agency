import { Globe, type LucideIcon, Monitor, PenTool, ShoppingCart, Smartphone, Wrench } from 'lucide-react';

/**
 * Brief wizard options, ported 1:1 (values) from resources/views/livewire/brief.blade.php.
 * Values must stay in sync with the Rule::in lists in App\Http\Requests\StoreProjectBriefRequest.
 * Labels only got sentence case and typographic fixes (en dashes, "E-mail").
 */
export type BriefOption = { value: string; label: string; description?: string };

export type BriefCardOption = BriefOption & { icon: LucideIcon };

export type BriefOptionGroup = { title: string; options: BriefOption[] };

/** Step 1 — project types (types[]). */
export const projectTypeOptions: BriefCardOption[] = [
    { value: 'website', label: 'Strona WWW', description: 'Landing page, firmowa, portfolio', icon: Globe },
    { value: 'webapp', label: 'Aplikacja web', description: 'SaaS, panel, dashboard, CRM', icon: Monitor },
    { value: 'ecommerce', label: 'E-commerce', description: 'Sklep, marketplace, B2B', icon: ShoppingCart },
    { value: 'mobile', label: 'Aplikacja mobilna', description: 'iOS, Android, cross-platform', icon: Smartphone },
    { value: 'redesign', label: 'Redesign', description: 'Modernizacja istniejącego projektu', icon: PenTool },
    { value: 'other', label: 'Inne', description: 'API, integracje, automatyzacje', icon: Wrench },
];

/** Step 2 — features (features[]), grouped. */
export const featureGroups: BriefOptionGroup[] = [
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
];

/** Step 3 — industry (select). */
export const industryOptions: BriefOption[] = [
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
];

/** Step 3 — target audience (select). */
export const audienceOptions: BriefOption[] = [
    { value: 'b2c', label: 'B2C – klienci indywidualni' },
    { value: 'b2b', label: 'B2B – firmy' },
    { value: 'both', label: 'B2B + B2C' },
    { value: 'internal', label: 'Użytkownicy wewnętrzni' },
];

/** Step 3 — "Czy masz projekt graficzny?" (radio cards). */
export const designOptions: BriefOption[] = [
    { value: 'yes', label: 'Tak, mam', description: 'Figma / Sketch / XD' },
    { value: 'partial', label: 'Częściowo', description: 'Szkice / inspiracje' },
    { value: 'no', label: 'Nie mam', description: 'Potrzebuję projektu' },
];

/** Step 3 — "Oczekiwany termin" (radio cards). */
export const timelineOptions: BriefOption[] = [
    { value: 'asap', label: 'Pilne', description: 'ASAP' },
    { value: '1-2', label: '1–2 mies.', description: 'Standardowy' },
    { value: '3-6', label: '3–6 mies.', description: 'Większy projekt' },
    { value: 'flexible', label: 'Elastyczny', description: 'Do ustalenia' },
];

/** Step 4 — preferred technologies (tech[]). */
export const techOptions: BriefOption[] = [
    { value: 'react', label: 'React' },
    { value: 'next', label: 'Next.js' },
    { value: 'vue', label: 'Vue.js' },
    { value: 'node', label: 'Node.js' },
    { value: 'laravel', label: 'Laravel' },
    { value: 'python', label: 'Python' },
    { value: 'wordpress', label: 'WordPress' },
    { value: 'shopify', label: 'Shopify' },
    { value: 'nopreference', label: 'Bez preferencji' },
];

/** Step 4 — security level (select). */
export const securityOptions: BriefOption[] = [
    { value: 'standard', label: 'Standardowe (SSL)' },
    { value: 'high', label: 'Wysokie (2FA, szyfrowanie)' },
    { value: 'enterprise', label: 'Enterprise (GDPR, SOC2)' },
];

/** Step 4 — hosting (select). */
export const hostingOptions: BriefOption[] = [
    { value: 'help', label: 'Potrzebuję pomocy' },
    { value: 'own', label: 'Mam własny' },
    { value: 'cloud', label: 'Cloud (AWS/GCP/Azure)' },
];

/** Step 5 — budget (radio cards). */
export const budgetOptions: BriefOption[] = [
    { value: 'small', label: '1–5k PLN', description: 'Landing page, strona wizytówka' },
    { value: 'medium', label: '5–15k PLN', description: 'Rozbudowana strona, mały sklep' },
    { value: 'large', label: '15–50k PLN', description: 'Aplikacja, duży e-commerce' },
    { value: 'enterprise', label: '50k+ PLN', description: 'System enterprise, platforma' },
    { value: 'unknown', label: 'Do ustalenia', description: 'Chcę poznać wycenę' },
];

/** Step 5 — cooperation model (radio cards). */
export const cooperationModelOptions: BriefOption[] = [
    { value: 'fixed', label: 'Fixed price', description: 'Stała cena' },
    { value: 'hourly', label: 'Time & material', description: 'Godzinowo' },
    { value: 'dedicated', label: 'Dedicated team', description: 'Zespół' },
];

/** Step 6 — "Skąd o nas wiesz?" (select). */
export const sourceOptions: BriefOption[] = [
    { value: 'google', label: 'Google' },
    { value: 'social', label: 'Social media' },
    { value: 'referral', label: 'Polecenie' },
    { value: 'clutch', label: 'Clutch' },
    { value: 'other', label: 'Inne' },
];

/** Step 6 — preferred contact (contact_pref[]). */
export const contactPreferenceOptions: BriefOption[] = [
    { value: 'email', label: 'E-mail' },
    { value: 'phone', label: 'Telefon' },
    { value: 'video', label: 'Video call' },
];

/** Every option list by brief field, for lookups. */
export const briefOptions = {
    types: projectTypeOptions,
    features: featureGroups.flatMap((group) => group.options),
    industry: industryOptions,
    audience: audienceOptions,
    design: designOptions,
    timeline: timelineOptions,
    tech: techOptions,
    security: securityOptions,
    hosting: hostingOptions,
    budget: budgetOptions,
    cooperation_model: cooperationModelOptions,
    source: sourceOptions,
    contact_pref: contactPreferenceOptions,
} satisfies Record<string, BriefOption[]>;

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

export const briefSteps: BriefStep[] = [
    { title: 'Jakiego typu projekt planujesz?', description: 'Wybierz wszystkie pasujące opcje.' },
    { title: 'Jakich funkcji potrzebujesz?', description: 'Zaznacz wymagane funkcjonalności.' },
    { title: 'Szczegóły projektu', description: 'Opowiedz więcej o swoich potrzebach.' },
    { title: 'Wymagania techniczne', description: 'Opcjonalne preferencje technologiczne.' },
    { title: 'Budżet i współpraca', description: 'Pomoże dopasować zakres projektu.' },
    { title: 'Dane kontaktowe', description: 'Zostaw dane, a przygotujemy wycenę.' },
];

export const BRIEF_TOTAL_STEPS = briefSteps.length;

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
export const briefNextSteps: { title: string; description: string }[] = [
    { title: 'Analiza wymagań', description: 'Przejrzymy szczegóły projektu.' },
    { title: 'Wstępna wycena', description: 'Przygotujemy szacunek kosztów.' },
    { title: 'Konsultacja', description: 'Umówimy bezpłatną rozmowę.' },
];
