/** "Kim jesteś" options of the partner application form (values = StorePartnerApplicationRequest::PARTNER_TYPES). */
export const partnerTypeOptions = [
    { value: 'accounting', label: 'Biuro rachunkowe' },
    { value: 'marketing', label: 'Agencja marketingowa' },
    { value: 'creative', label: 'Grafik, fotograf, copywriter' },
    { value: 'consultant', label: 'Doradca, konsultant' },
    { value: 'client', label: 'Klient Netizo' },
    { value: 'other', label: 'Ktoś inny' },
] as const;

export type PartnerType = (typeof partnerTypeOptions)[number]['value'];

/** Label of a saved partner type; a value the form no longer offers is shown as it was saved. */
export function partnerTypeLabel(value: string): string {
    return partnerTypeOptions.find((option) => option.value === value)?.label ?? value;
}
