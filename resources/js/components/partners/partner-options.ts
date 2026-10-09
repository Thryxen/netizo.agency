import type { Locale, Localized } from '@/lib/i18n';

/**
 * "Kim jesteś" options of the partner application form (values = StorePartnerApplicationRequest::PARTNER_TYPES, each
 * listed once: a test reads them from this file), with the label in each language.
 */
export const partnerTypeOptions = [
    { value: 'accounting', label: { pl: 'Biuro rachunkowe', en: 'Accounting firm' } },
    { value: 'marketing', label: { pl: 'Agencja marketingowa', en: 'Marketing agency' } },
    { value: 'creative', label: { pl: 'Grafik, fotograf, copywriter', en: 'Designer, photographer, copywriter' } },
    { value: 'consultant', label: { pl: 'Doradca, konsultant', en: 'Advisor, consultant' } },
    { value: 'client', label: { pl: 'Klient Netizo', en: 'Netizo client' } },
    { value: 'other', label: { pl: 'Ktoś inny', en: 'Someone else' } },
] as const satisfies readonly { value: string; label: Localized<string> }[];

export type PartnerType = (typeof partnerTypeOptions)[number]['value'];

/**
 * Label of a saved partner type (Polish by default: the admin panel is Polish); a value the form no longer offers is
 * shown as it was saved.
 */
export function partnerTypeLabel(value: string, locale: Locale = 'pl'): string {
    return partnerTypeOptions.find((option) => option.value === value)?.label[locale] ?? value;
}
