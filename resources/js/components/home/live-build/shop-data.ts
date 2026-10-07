import type { PhotoName } from '@/lib/photos';

/**
 * The mock client site the hero builds: a small online shop with hand-made knitwear. Polish copy, no real brand.
 * No-break spaces keep prices ("349 zł") together.
 */
export const SHOP_URL = 'twojafirma.pl';
export const SHOP_BRAND = 'Twoja marka';
export const SHOP_NAV = ['Sklep', 'O nas', 'Kontakt'] as const;
/** The shop's headline, as the lines it rises in (fixed: the stage scales as a whole, so they never rewrap). */
export const SHOP_HEADLINE = ['Swetry z polskiej', 'wełny, robione', 'ręcznie'] as const;
export const SHOP_LEAD = 'Małe serie z naturalnej wełny.';
export const SHOP_CTA = 'Zobacz kolekcję';

export type ShopProduct = {
    name: string;
    price: string;
    photo: PhotoName;
    /** object-position of the product shot in its 16:10 card. */
    position: string;
};

export const SHOP_PRODUCTS: ShopProduct[] = [
    { name: 'Sweter Bałtyk', price: '349 zł', photo: 'shop-sweater', position: '50% 58%' },
    { name: 'Szal Mgła', price: '189 zł', photo: 'shop-scarf', position: '58% 42%' },
    { name: 'Czapka Las', price: '129 zł', photo: 'shop-hat', position: '34% 62%' },
];

export const SHOP_ORDER = { title: 'Nowe zamówienie, 349 zł', detail: 'Sweter Bałtyk, rozmiar M' } as const;

export const BUILD_STEPS = ['Projekt', 'Design', 'Kod', 'Wdrożenie'] as const;

export const PIPELINE = ['Build', 'Testy', 'Deploy'] as const;

/** Monochrome syntax: tones are opacity steps of the editor ink, never colours. */
export type CodeTone = 'keyword' | 'tag' | 'attr' | 'string' | 'punct' | 'plain';
export type CodeToken = readonly [text: string, tone: CodeTone];

/** The component the editor writes: the shop page from the window, in React (what the agency ships). */
export const SHOP_CODE: CodeToken[][] = [
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
        ['"Swetry z polskiej wełny"', 'string'],
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

/** Index of the code lines that light up their part of the page while they are typed. */
export const CODE_LINE_HERO = 3;
export const CODE_LINE_PRODUCTS = 4;
