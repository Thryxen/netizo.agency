import { usePage } from '@inertiajs/react';
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

/** Brand names of the social networks with an icon (components/home/social-icon.tsx), the same in both languages. */
export const socialNetworkNames = {
    facebook: 'Facebook',
    instagram: 'Instagram',
    tiktok: 'TikTok',
    discord: 'Discord',
} as const;

export type SocialNetwork = keyof typeof socialNetworkNames;

export type SocialProfile = { network: SocialNetwork; url: string };

function isSocialNetwork(network: string): network is SocialNetwork {
    return Object.hasOwn(socialNetworkNames, network);
}

/**
 * Netizo's social profiles, set in .env (config/socials.php) and shared by HandleInertiaRequests on public pages:
 * only the networks with a URL, in config order. A network without an icon here is skipped.
 */
export function useSocialProfiles(): SocialProfile[] {
    const socials = usePage<{ socials?: { network: string; url: string }[] }>().props.socials ?? [];

    return socials.filter((profile): profile is SocialProfile => isSocialNetwork(profile.network));
}

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
