import { localized, useLocale } from '@/lib/i18n';

/**
 * Anchor ids of the page sections in each language: `/#kontakt` on the Polish site is `/en#contact` on the English one.
 * A section's heading id is `${id}-heading`.
 */

export const homeSections = localized({
    pl: {
        services: 'uslugi',
        projects: 'projekty',
        mission: 'misja',
        clients: 'klienci',
        process: 'proces',
        panel: 'panel',
        faq: 'faq',
        newsletter: 'newsletter',
        contact: 'kontakt',
    },
    en: {
        services: 'services',
        projects: 'projects',
        mission: 'mission',
        clients: 'clients',
        process: 'process',
        panel: 'client-portal',
        faq: 'faq',
        newsletter: 'newsletter',
        contact: 'contact',
    },
});

export type HomeSection = keyof (typeof homeSections)['pl'];

export const partnerSections = localized({
    pl: {
        howItWorks: 'jak-to-dziala',
        calculator: 'kalkulator',
        audience: 'dla-kogo',
        rules: 'zasady',
        faq: 'faq',
        join: 'dolacz',
    },
    en: {
        howItWorks: 'how-it-works',
        calculator: 'calculator',
        audience: 'who-its-for',
        rules: 'terms',
        faq: 'faq',
        join: 'join',
    },
});

export type PartnerSection = keyof (typeof partnerSections)['pl'];

/** Anchor ids of the home page sections in the language of the current page. */
export function useHomeSections(): Record<HomeSection, string> {
    return homeSections[useLocale()];
}

/** Anchor ids of the partner programme page sections in the language of the current page. */
export function usePartnerSections(): Record<PartnerSection, string> {
    return partnerSections[useLocale()];
}
