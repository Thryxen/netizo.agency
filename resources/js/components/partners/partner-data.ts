import { type Locale, type Localized, localized } from '@/lib/i18n';

/**
 * Copy and figures of the partner programme page (/partnerzy, /en/partners). The terms here, in the hero strip and in
 * the FAQ (lang/{pl,en}/partners.php) must say the same: 15% net, 12 months, payout within 14 days.
 */

/** Commission rate as a fraction. */
export const COMMISSION_RATE = 0.15;

export const commission = (orderValue: number): number => Math.round(orderValue * COMMISSION_RATE);

export type HeroTerm = { value: string; label: string };

/** The terms strip under the hero, in the language of the home page's stats strip. */
export const HERO_TERMS = localized<HeroTerm[]>({
    pl: [
        { value: '15%', label: 'netto od każdej opłaconej faktury' },
        { value: '12 mies.', label: 'prowizji od zamówień klienta' },
        { value: '14 dni', label: 'na przelew po opłaceniu faktury' },
        { value: '0 zł', label: 'za udział w programie' },
    ],
    en: [
        { value: '15%', label: 'of the net value of every paid invoice' },
        { value: '1 year', label: 'of commission on the client’s orders' },
        { value: '14 days', label: 'to payout after the invoice is paid' },
        { value: 'PLN 0', label: 'to join the program' },
    ],
});

export type SceneOrder = {
    /** "Nowe zamówienie" or "Kolejne zamówienie" (a follow-up from the same client). */
    title: string;
    client: string;
    item: string;
    value: number;
};

/** Net value of each order the hero scene cycles through (the same in both languages). */
const SCENE_ORDER_VALUES = [18000, 6000, 12000];

const sceneOrders = (orders: Omit<SceneOrder, 'value'>[]): SceneOrder[] => orders.map((order, index) => ({ ...order, value: SCENE_ORDER_VALUES[index] }));

/** The orders the hero scene cycles through: a new client, the same client's follow-up order, another client. */
export const SCENE_ORDERS: Localized<SceneOrder[]> = {
    pl: sceneOrders([
        { title: 'Nowe zamówienie', client: 'Piekarnia Ziarno', item: 'sklep internetowy' },
        { title: 'Kolejne zamówienie', client: 'Piekarnia Ziarno', item: 'program lojalnościowy' },
        { title: 'Nowe zamówienie', client: 'Gabinet Ruch', item: 'strona z rezerwacjami' },
    ]),
    en: sceneOrders([
        { title: 'New order', client: 'Ziarno Bakery', item: 'online store' },
        { title: 'Repeat order', client: 'Ziarno Bakery', item: 'loyalty program' },
        { title: 'New order', client: 'Ruch Physio', item: 'booking website' },
    ]),
};

/** The partner code the hero's message and order chip share (an example). */
export const EXAMPLE_CODE = 'ANNA15';

export type Step = { number: string; title: string; text: string };

export const STEPS = localized<Step[]>({
    pl: [
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
    ],
    en: [
        {
            number: '01',
            title: 'You sign up',
            text: 'You fill in a short form. Within 24 hours you get your partner code and an agreement to sign.',
        },
        {
            number: '02',
            title: 'You refer us',
            text: 'You give a company you know your code, or pass their contact details on to us. No selling or negotiating needed.',
        },
        {
            number: '03',
            title: 'We do the rest',
            text: 'We talk to the client, then quote, design and build. You get an email about every order placed with your code.',
        },
        {
            number: '04',
            title: 'You get 15%',
            text: 'After every client invoice is paid, we transfer 15% of its net value to you within 14 days at the latest.',
        },
    ],
});

export type ProjectPresetId = 'simple' | 'company' | 'shop' | 'app';

export type ProjectPreset = { id: ProjectPresetId; label: string; value: number };

/** Typical quotes, within the price ranges of the home page FAQ ("Ile kosztuje strona…"). */
const PRESET_VALUES: Record<ProjectPresetId, number> = { simple: 4000, company: 10000, shop: 15000, app: 30000 };

const PRESET_LABELS = localized<Record<ProjectPresetId, string>>({
    pl: { simple: 'Prosta strona', company: 'Strona firmowa', shop: 'Sklep internetowy', app: 'Aplikacja webowa' },
    en: { simple: 'Simple website', company: 'Company website', shop: 'Online store', app: 'Web application' },
});

const projectPresets = (locale: Locale): ProjectPreset[] =>
    (Object.keys(PRESET_VALUES) as ProjectPresetId[]).map((id) => ({ id, label: PRESET_LABELS[locale][id], value: PRESET_VALUES[id] }));

export const PROJECT_PRESETS: Localized<ProjectPreset[]> = { pl: projectPresets('pl'), en: projectPresets('en') };

/** What the calculator starts with (SSR, no JS): three firms with different projects. */
export const INITIAL_BASKET: ProjectPresetId[] = ['company', 'app', 'shop'];

export const MAX_FIRMS = 12;

export type Audience = { title: string; text: string };

/** Who the programme is for; the same groups as "Kim jesteś" in the form (partner-options.ts). */
export const AUDIENCES = localized<Audience[]>({
    pl: [
        { title: 'Biuro rachunkowe', text: 'Klient zakłada firmę i pyta, kto zrobi mu stronę. Odpowiadasz jednym kontaktem.' },
        { title: 'Agencja marketingowa', text: 'Prowadzisz kampanie, a klientowi brakuje strony albo sklepu, który zamieni ruch w zamówienia.' },
        { title: 'Grafik, fotograf, copywriter', text: 'Robisz logo, zdjęcia albo teksty. Strona to zwykle następny krok Twojego klienta.' },
        { title: 'Doradca, konsultant', text: 'Porządkujesz procesy w firmie i widzisz, gdzie przydałby się system albo aplikacja.' },
        { title: 'Klient Netizo', text: 'Ktoś pyta, kto zrobił Twoją stronę. Od teraz ta odpowiedź się opłaca.' },
        { title: 'Ktoś, kto zna firmy', text: 'Znasz właścicieli firm z pracy, z branży albo z sąsiedztwa. To wystarczy.' },
    ],
    en: [
        { title: 'Accounting firm', text: 'A client is starting a business and asks who could build their website. You answer with one contact.' },
        { title: 'Marketing agency', text: 'You run the campaigns, but the client has no website or store to turn that traffic into orders.' },
        { title: 'Designer, photographer, copywriter', text: 'You create logos, photos or copy. A website is usually your client’s next step.' },
        { title: 'Advisor, consultant', text: 'You help companies streamline how they work and see where a system or an app would help.' },
        { title: 'Netizo client', text: 'Someone asks who built your website. From now on, that answer pays off.' },
        { title: 'Someone who knows businesses', text: 'You know business owners from work, your industry or your neighborhood. That’s enough.' },
    ],
});

export type Rule = { term: string; detail: string };

export const RULES = localized<Rule[]>({
    pl: [
        { term: 'Prowizja', detail: '15% wartości netto każdej faktury opłaconej przez poleconego klienta.' },
        { term: 'Jak długo', detail: '12 miesięcy od pierwszego zamówienia klienta: projekt, rozbudowa, opieka techniczna.' },
        { term: 'Wypłata', detail: 'Przelewem, najpóźniej 14 dni po opłaceniu faktury przez klienta.' },
        { term: 'Rozliczenie', detail: 'Na fakturę, jeśli prowadzisz firmę. Na podstawie umowy, jeśli jej nie prowadzisz.' },
        { term: 'Kto się liczy', detail: 'Nowa firma, z którą nie rozmawialiśmy o współpracy w ostatnich 12 miesiącach.' },
        { term: 'Przypisanie', detail: 'Kod partnera podany przez klienta albo kontakt przekazany przez Ciebie, za zgodą klienta.' },
        { term: 'Cena dla klienta', detail: 'Taka sama jak bez polecenia. Prowizję płacimy z naszej marży.' },
        { term: 'Limit', detail: 'Nie ma. Polecasz tyle firm, ile chcesz, z całej Polski.' },
    ],
    en: [
        { term: 'Commission', detail: '15% of the net value of every invoice paid by the referred client.' },
        { term: 'How long', detail: '12 months from the client’s first order: the project, extensions, technical care.' },
        { term: 'Payout', detail: 'By bank transfer, no later than 14 days after the client pays the invoice.' },
        { term: 'Invoicing', detail: 'You invoice us if you run a business. If you don’t, we pay you under a signed agreement.' },
        { term: 'Who counts', detail: 'A new company we haven’t talked to about working together in the last 12 months.' },
        { term: 'Attribution', detail: 'Your partner code given by the client, or contact details you pass on with the client’s consent.' },
        { term: 'Client’s price', detail: 'The same as without a referral. We pay the commission out of our margin.' },
        { term: 'Limit', detail: 'None. Refer as many companies as you like.' },
    ],
});
