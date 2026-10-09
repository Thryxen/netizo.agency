import { localized, useLocale } from '@/lib/i18n';

/** Form endpoints of each language (routes/web.php); a form posts to its page's language, so errors come back in it. */
export const endpoints = localized({
    pl: {
        contact: '/kontakt',
        brief: '/brief',
        callback: '/oddzwonimy',
        newsletter: '/newsletter',
        partner: '/partnerzy',
    },
    en: {
        contact: '/en/contact',
        brief: '/en/brief',
        callback: '/en/callback',
        newsletter: '/en/newsletter',
        partner: '/en/partners',
    },
});

export type Endpoints = (typeof endpoints)['pl'];

/** Form endpoints in the language of the current page. */
export function useEndpoints(): Endpoints {
    return endpoints[useLocale()];
}
