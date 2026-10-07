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

export const infoLinks = [
    { href: '/utrzymanie', label: 'Utrzymanie' },
    { href: '/regulamin', label: 'Regulamin' },
    { href: '/polityka-prywatnosci', label: 'Polityka prywatności' },
] as const;
