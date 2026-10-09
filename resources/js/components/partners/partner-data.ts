/**
 * Copy and figures of the partner programme page (/partnerzy). The terms here, in the hero strip and in the FAQ
 * (PartnerProgramController::faq()) must say the same: 15% net, 12 months, payout within 14 days.
 */

/** Commission rate as a fraction. */
export const COMMISSION_RATE = 0.15;

/** "18 000 zł": thousands grouped with a no-break space at every size (pl-PL Intl leaves 4-digit numbers ungrouped). */
export function formatPln(value: number): string {
    const grouped = String(Math.round(value)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

    return `${grouped} zł`;
}

export const commission = (orderValue: number): number => Math.round(orderValue * COMMISSION_RATE);

export type HeroTerm = { value: string; label: string };

/** The terms strip under the hero, in the language of the home page's stats strip. */
export const HERO_TERMS: HeroTerm[] = [
    { value: '15%', label: 'netto od każdej opłaconej faktury' },
    { value: '12 mies.', label: 'prowizji od zamówień klienta' },
    { value: '14 dni', label: 'na przelew po opłaceniu faktury' },
    { value: '0 zł', label: 'za udział w programie' },
];

export type SceneOrder = {
    /** "Nowe zamówienie" or "Kolejne zamówienie" (a follow-up from the same client). */
    title: string;
    client: string;
    item: string;
    value: number;
};

/** The orders the hero scene cycles through: a new client, the same client's follow-up order, another client. */
export const SCENE_ORDERS: SceneOrder[] = [
    { title: 'Nowe zamówienie', client: 'Piekarnia Ziarno', item: 'sklep internetowy', value: 18000 },
    { title: 'Kolejne zamówienie', client: 'Piekarnia Ziarno', item: 'program lojalnościowy', value: 6000 },
    { title: 'Nowe zamówienie', client: 'Gabinet Ruch', item: 'strona z rezerwacjami', value: 12000 },
];

/** The partner code the hero's message and order chip share (an example). */
export const EXAMPLE_CODE = 'ANNA15';

export type Step = { number: string; title: string; text: string };

export const STEPS: Step[] = [
    {
        number: '01',
        title: 'Zgłaszasz się',
        text: 'Wypełniasz krótki formularz. W ciągu 24 godzin dostajesz kod partnera i umowę do podpisania.',
    },
    {
        number: '02',
        title: 'Polecasz nas',
        text: 'Dajesz znajomej firmie swój kod albo przekazujesz nam jej kontakt. Nie musisz niczego sprzedawać ani negocjować.',
    },
    {
        number: '03',
        title: 'My robimy resztę',
        text: 'Rozmawiamy z klientem, wyceniamy, projektujemy i wdrażamy. O każdym zamówieniu z Twoim kodem dostajesz maila.',
    },
    {
        number: '04',
        title: 'Dostajesz 15%',
        text: 'Po każdej opłaconej fakturze klienta przelewamy Ci 15% jej wartości netto, najpóźniej w ciągu 14 dni.',
    },
];

export type ProjectPreset = { id: string; label: string; value: number };

/** Typical quotes, within the price ranges of the home page FAQ ("Ile kosztuje strona…"). */
export const PROJECT_PRESETS: ProjectPreset[] = [
    { id: 'simple', label: 'Prosta strona', value: 4000 },
    { id: 'company', label: 'Strona firmowa', value: 10000 },
    { id: 'shop', label: 'Sklep internetowy', value: 15000 },
    { id: 'app', label: 'Aplikacja webowa', value: 30000 },
];

/** What the calculator starts with (SSR, no JS): three firms with different projects. */
export const INITIAL_BASKET: ProjectPreset['id'][] = ['company', 'app', 'shop'];

export const MAX_FIRMS = 12;

export type Audience = { title: string; text: string };

/** Who the programme is for; the same groups as "Kim jesteś" in the form (partner-options.ts). */
export const AUDIENCES: Audience[] = [
    { title: 'Biuro rachunkowe', text: 'Klient zakłada firmę i pyta, kto zrobi mu stronę. Odpowiadasz jednym kontaktem.' },
    { title: 'Agencja marketingowa', text: 'Prowadzisz kampanie, a klientowi brakuje strony albo sklepu, który zamieni ruch w zamówienia.' },
    { title: 'Grafik, fotograf, copywriter', text: 'Robisz logo, zdjęcia albo teksty. Strona to zwykle następny krok Twojego klienta.' },
    { title: 'Doradca, konsultant', text: 'Porządkujesz procesy w firmie i widzisz, gdzie przydałby się system albo aplikacja.' },
    { title: 'Klient Netizo', text: 'Ktoś pyta, kto zrobił Twoją stronę. Od teraz ta odpowiedź się opłaca.' },
    { title: 'Ktoś, kto zna firmy', text: 'Znasz właścicieli firm z pracy, z branży albo z sąsiedztwa. To wystarczy.' },
];

export type Rule = { term: string; detail: string };

export const RULES: Rule[] = [
    { term: 'Prowizja', detail: '15% wartości netto każdej faktury opłaconej przez poleconego klienta.' },
    { term: 'Jak długo', detail: '12 miesięcy od pierwszego zamówienia klienta: projekt, rozbudowa, opieka techniczna.' },
    { term: 'Wypłata', detail: 'Przelewem, najpóźniej 14 dni po opłaceniu faktury przez klienta.' },
    { term: 'Rozliczenie', detail: 'Na fakturę, jeśli prowadzisz firmę. Na podstawie umowy, jeśli jej nie prowadzisz.' },
    { term: 'Kto się liczy', detail: 'Nowa firma, z którą nie rozmawialiśmy o współpracy w ostatnich 12 miesiącach.' },
    { term: 'Przypisanie', detail: 'Kod partnera podany przez klienta albo kontakt przekazany przez Ciebie, za zgodą klienta.' },
    { term: 'Cena dla klienta', detail: 'Taka sama jak bez polecenia. Prowizję płacimy z naszej marży.' },
    { term: 'Limit', detail: 'Nie ma. Polecasz tyle firm, ile chcesz, z całej Polski.' },
];
