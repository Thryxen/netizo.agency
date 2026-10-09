import { type Localized, localized } from '@/lib/i18n';
import type { PhotoName } from '@/lib/photos';

/**
 * The mock client site the hero builds: a small online shop with hand-made knitwear, in the page's language, no real
 * brand. No-break spaces keep prices ("349 zł", "PLN 349") together.
 */

export type ShopProduct = {
    name: string;
    price: string;
    photo: PhotoName;
    /** object-position of the product shot in its 16:10 card. */
    position: string;
};

/** Product shots, the same in both languages. */
const PRODUCT_SHOTS: Pick<ShopProduct, 'photo' | 'position'>[] = [
    { photo: 'shop-sweater', position: '50% 58%' },
    { photo: 'shop-scarf', position: '58% 42%' },
    { photo: 'shop-hat', position: '34% 62%' },
];

const withShots = (items: Pick<ShopProduct, 'name' | 'price'>[]): ShopProduct[] => items.map((item, index) => ({ ...item, ...PRODUCT_SHOTS[index] }));

/** Monochrome syntax: tones are opacity steps of the editor ink, never colours. */
export type CodeTone = 'keyword' | 'tag' | 'attr' | 'string' | 'punct' | 'plain';
export type CodeToken = readonly [text: string, tone: CodeTone];

/** The component the editor writes: the shop page from the window, in React (what the agency ships). */
const shopCode = (heroTitle: string): CodeToken[][] => [
    [
        ['export default function ', 'keyword'],
        ['Shop', 'plain'],
        ['({ ', 'punct'],
        ['products', 'plain'],
        [' }) {', 'punct'],
    ],
    [
        ['  return ', 'keyword'],
        ['(', 'punct'],
    ],
    [
        ['    <', 'punct'],
        ['Layout', 'tag'],
        ['>', 'punct'],
    ],
    [
        ['      <', 'punct'],
        ['Hero', 'tag'],
        [' title', 'attr'],
        ['=', 'punct'],
        [`"${heroTitle}"`, 'string'],
        [' />', 'punct'],
    ],
    [
        ['      <', 'punct'],
        ['ProductGrid', 'tag'],
        [' items', 'attr'],
        ['=', 'punct'],
        ['{products}', 'plain'],
        [' />', 'punct'],
    ],
    [
        ['    </', 'punct'],
        ['Layout', 'tag'],
        ['>', 'punct'],
    ],
    [['  );', 'punct']],
];

export type ShopCopy = {
    url: string;
    brand: string;
    nav: string[];
    /** The shop's headline, as the lines it rises in (fixed: the stage scales as a whole, so they never rewrap). */
    headline: string[];
    /** The headline in one line: the phone's heading and the title the editor types. */
    title: string;
    lead: string;
    cta: string;
    products: ShopProduct[];
    order: { title: string; detail: string };
    /** The build's four acts over the window. */
    buildSteps: string[];
    pipeline: string[];
    code: CodeToken[][];
    performance: string;
    metrics: string;
    published: string;
    now: string;
};

export const SHOP: Localized<ShopCopy> = localized<ShopCopy>({
    pl: {
        url: 'twojafirma.pl',
        brand: 'Twoja marka',
        nav: ['Sklep', 'O nas', 'Kontakt'],
        headline: ['Swetry z polskiej', 'wełny, robione', 'ręcznie'],
        title: 'Swetry z polskiej wełny',
        lead: 'Małe serie z naturalnej wełny.',
        cta: 'Zobacz kolekcję',
        products: withShots([
            { name: 'Sweter Bałtyk', price: '349 zł' },
            { name: 'Szal Mgła', price: '189 zł' },
            { name: 'Czapka Las', price: '129 zł' },
        ]),
        order: { title: 'Nowe zamówienie, 349 zł', detail: 'Sweter Bałtyk, rozmiar M' },
        buildSteps: ['Projekt', 'Design', 'Kod', 'Wdrożenie'],
        pipeline: ['Build', 'Testy', 'Deploy'],
        code: shopCode('Swetry z polskiej wełny'),
        performance: 'Wydajność',
        metrics: 'LCP 0,8 s, CLS 0',
        published: 'Opublikowano',
        now: 'teraz',
    },
    en: {
        url: 'yourcompany.com',
        brand: 'Your brand',
        nav: ['Shop', 'About', 'Contact'],
        headline: ['Sweaters made of', 'Polish wool, knit', 'by hand'],
        title: 'Sweaters of Polish wool',
        lead: 'Small batches of natural wool.',
        cta: 'Shop the collection',
        products: withShots([
            { name: 'Baltic Sweater', price: 'PLN 349' },
            { name: 'Mist Scarf', price: 'PLN 189' },
            { name: 'Forest Hat', price: 'PLN 129' },
        ]),
        order: { title: 'New order, PLN 349', detail: 'Baltic Sweater, size M' },
        buildSteps: ['Wireframe', 'Design', 'Code', 'Launch'],
        pipeline: ['Build', 'Tests', 'Deploy'],
        code: shopCode('Sweaters of Polish wool'),
        performance: 'Performance',
        metrics: 'LCP 0.8 s, CLS 0',
        published: 'Published',
        now: 'now',
    },
});

/** Number of build steps (acts) over the window, the same in both languages. */
export const BUILD_STEP_COUNT = 4;

/** Index of the code lines that light up their part of the page while they are typed. */
export const CODE_LINE_HERO = 3;
export const CODE_LINE_PRODUCTS = 4;
