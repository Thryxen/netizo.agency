import { briefOptions, type BriefOption } from '@/components/home/brief/brief-options';

export type BriefField = keyof typeof briefOptions;

/** Label of a saved brief value; a value the form no longer offers is shown as it was saved. */
export function briefLabel(field: BriefField, value: string | null | undefined): string | null {
    if (!value) {
        return null;
    }

    return (briefOptions[field] as BriefOption[]).find((option) => option.value === value)?.label ?? value;
}

export function briefLabels(field: BriefField, values: string[] | null | undefined): string {
    return (values ?? []).map((value) => briefLabel(field, value) ?? value).join(', ');
}
