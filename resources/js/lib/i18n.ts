import { usePage } from '@inertiajs/react';

/**
 * The public site speaks Polish (no URL prefix) and English (under /en). The server picks the language from the path
 * and shares it as the `locale` page prop, with `alternates`: the current page's URL in every language.
 *
 * Copy lives next to the component that shows it, in both languages: `localized({ pl: …, en: … })`, read with
 * `useCopy()`. The English entry must have the Polish one's shape, so a missing or extra string fails `npm run types`.
 */

export const locales = ['pl', 'en'] as const;

export type Locale = (typeof locales)[number];

export type Localized<T> = Record<Locale, T>;

export type LocaleSharedProps = {
    locale?: Locale;
    alternates?: Partial<Record<Locale, string>>;
};

/** Copy in both languages; TypeScript checks the English entry against the Polish one's shape. */
export function localized<T>(copy: { pl: T; en: NoInfer<T> }): Localized<T> {
    return copy;
}

/** Language of the current page (`pl` when the server shared none, e.g. on an admin page). */
export function useLocale(): Locale {
    const { locale } = usePage<LocaleSharedProps>().props;

    return locale === 'en' ? 'en' : 'pl';
}

/** The current page in every language, for the language switcher. Empty when the page has no twin. */
export function useAlternates(): Partial<Record<Locale, string>> {
    return usePage<LocaleSharedProps>().props.alternates ?? {};
}

/** The entry of `copy` in the language of the current page. */
export function useCopy<T>(copy: Localized<T>): T {
    return copy[useLocale()];
}

/** BCP 47 tag of each language, for Intl formatting. */
export const localeTags: Localized<string> = { pl: 'pl-PL', en: 'en-US' };

/** Names of the languages, each in its own language (the switcher's accessible names). */
export const localeNames: Localized<string> = { pl: 'Polski', en: 'English' };

/**
 * A whole number grouped by thousands: "18 000" in Polish (a no-break space at every size; pl-PL Intl leaves 4-digit
 * numbers ungrouped), "18,000" in English.
 */
export function formatInteger(value: number, locale: Locale): string {
    const digits = Math.round(value).toString();

    return digits.replace(/\B(?=(\d{3})+(?!\d))/g, locale === 'pl' ? ' ' : ',');
}

/** An amount in złoty: "18 000 zł" in Polish, "PLN 18,000" in English (no-break spaces, never split). */
export function formatPln(value: number, locale: Locale): string {
    const amount = formatInteger(value, locale);

    return locale === 'pl' ? `${amount} zł` : `PLN ${amount}`;
}
