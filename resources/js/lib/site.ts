import { localized, useLocale } from '@/lib/i18n';

/**
 * Contact details and links repeated across the header, footer, contact section and callback dialog.
 */

export const contact = {
    email: 'kontakt@netizo.pl',
    phone: {
        display: '+48 884 343 924',
        href: 'tel:+48884343924',
    },
} as const;

export const clientPanelUrl = 'https://panel-klienta.netizo.pl';

/** Pages of the site in each language (routes/web.php). */
export const pageUrls = localized({
    pl: { home: '/', partners: '/partnerzy' },
    en: { home: '/en', partners: '/en/partners' },
});

export type InfoLink = {
    href: string;
    label: string;
    /**
     * Language of the linked page when it differs from the current one (these pages exist in Polish only): the link
     * gets `hrefLang` and a "PL" marker (InfoLinkLabel).
     */
    hrefLang?: 'pl';
};

export const infoLinks = localized<InfoLink[]>({
    pl: [
        { href: '/partnerzy', label: 'Program partnerski' },
        { href: '/utrzymanie', label: 'Utrzymanie' },
        { href: '/regulamin', label: 'Regulamin' },
        { href: '/polityka-prywatnosci', label: 'Polityka prywatności' },
    ],
    en: [
        { href: '/en/partners', label: 'Partner program' },
        { href: '/utrzymanie', label: 'Maintenance', hrefLang: 'pl' },
        { href: '/regulamin', label: 'Terms of service', hrefLang: 'pl' },
        { href: '/polityka-prywatnosci', label: 'Privacy policy', hrefLang: 'pl' },
    ],
});

/** Page URLs in the language of the current page. */
export function usePageUrls(): (typeof pageUrls)['pl'] {
    return pageUrls[useLocale()];
}

/** Footer and menu links in the language of the current page. */
export function useInfoLinks(): InfoLink[] {
    return infoLinks[useLocale()];
}
