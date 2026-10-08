import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { errorIdFor, FieldError } from './fields';

/**
 * Selection controls for the brief: real <input type="checkbox|radio"> (visually hidden, keyboard accessible)
 * wrapped in a <label> styled as a card or chip. Selected = foreground border + a filled square "bit".
 */

type ChoiceBaseProps = {
    type: 'checkbox' | 'radio';
    id: string;
    name: string;
    value: string;
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
    invalid?: boolean;
    describedBy?: string;
};

/**
 * The square marker, outlined when off and filled when checked, the same for checkboxes and radios.
 * In forced-colors mode backgrounds are reset, so the marker opts out and paints the selection in Highlight.
 */
function BitMarker({ className }: { className?: string }) {
    return (
        <span
            aria-hidden="true"
            className={cn(
                'block size-2.5 shrink-0 border border-foreground/60 transition-colors group-data-[state=checked]/choice:border-foreground',
                'forced-colors:border-[CanvasText] forced-colors:forced-color-adjust-none forced-colors:group-data-[state=checked]/choice:border-[Highlight]',
                'group-data-[state=checked]/choice:bg-foreground forced-colors:group-data-[state=checked]/choice:bg-[Highlight]',
                className,
            )}
        />
    );
}

/** Forced-colors mode turns every border CanvasText, so a selected card or chip also gets a Highlight outline. */
const forcedColorsCheckedClassName =
    'forced-colors:data-[state=checked]:outline-2 forced-colors:data-[state=checked]:-outline-offset-2 forced-colors:data-[state=checked]:outline-[Highlight] forced-colors:data-[state=checked]:outline-solid';

function HiddenInput({ type, id, name, value, checked, onCheckedChange, invalid, describedBy }: ChoiceBaseProps) {
    return (
        <input
            type={type}
            id={id}
            name={name}
            value={value}
            checked={checked}
            onChange={(event) => onCheckedChange(event.target.checked)}
            aria-invalid={invalid || undefined}
            aria-describedby={describedBy}
            className="sr-only"
        />
    );
}

type ChoiceCardProps = ChoiceBaseProps & {
    label: string;
    description?: string;
    icon?: LucideIcon;
};

/** A cell of a shared-border grid (wrap cards in <ChoiceGrid>). */
export function ChoiceCard({ label, description, icon: Icon, ...input }: ChoiceCardProps) {
    return (
        <label
            htmlFor={input.id}
            data-state={input.checked ? 'checked' : 'unchecked'}
            className={cn(
                'group/choice relative -mt-px -ml-px flex min-w-0 cursor-pointer flex-col gap-1 border border-border bg-background p-4 pr-10 transition-colors outline-none select-none hover:bg-accent/60',
                'has-[input[aria-invalid=true]]:z-[5] has-[input[aria-invalid=true]]:border-destructive/50',
                'data-[state=checked]:z-10 data-[state=checked]:border-foreground',
                'has-[:focus-visible]:z-20 has-[:focus-visible]:border-ring has-[:focus-visible]:ring-[3px] has-[:focus-visible]:ring-ring/50',
                forcedColorsCheckedClassName,
            )}
        >
            <HiddenInput {...input} />
            <BitMarker className="absolute top-4 right-4" />
            {Icon && <Icon aria-hidden="true" className="mb-2 size-5 text-foreground" strokeWidth={1.75} />}
            <span className="text-sm leading-snug font-medium">{label}</span>
            {description && <span className="text-sm leading-snug text-muted-foreground">{description}</span>}
        </label>
    );
}

/** Shared-border grid for ChoiceCards: the cells overlap their neighbours by 1px, so borders are shared. */
export function ChoiceGrid({ className, children }: { className?: string; children: ReactNode }) {
    return <div className={cn('grid grid-cols-1 pt-px pl-px sm:grid-cols-2', className)}>{children}</div>;
}

type ChoiceChipProps = ChoiceBaseProps & { label: string };

/** Toggle chip with checkbox semantics. */
export function ChoiceChip({ label, ...input }: ChoiceChipProps) {
    return (
        <label
            htmlFor={input.id}
            data-state={input.checked ? 'checked' : 'unchecked'}
            className={cn(
                'group/choice relative inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-md border border-input bg-background px-3 py-1.5 text-sm transition-colors select-none hover:bg-accent/60 md:min-h-9 dark:bg-input/12',
                'data-[state=checked]:border-foreground',
                'has-[:focus-visible]:border-ring has-[:focus-visible]:ring-[3px] has-[:focus-visible]:ring-ring/50',
                forcedColorsCheckedClassName,
            )}
        >
            <HiddenInput {...input} />
            <BitMarker className="size-2" />
            <span>{label}</span>
        </label>
    );
}

type ChoiceFieldsetProps = {
    /** Base id for the group; the error message gets `${id}-error`. */
    id: string;
    legend: ReactNode;
    legendClassName?: string;
    hint?: ReactNode;
    error?: string;
    className?: string;
    children: ReactNode;
};

/** <fieldset> + <legend> wrapper for a group of choices, with an error underneath. */
export function ChoiceFieldset({ id, legend, legendClassName, hint, error, className, children }: ChoiceFieldsetProps) {
    return (
        <fieldset id={id} aria-describedby={error ? errorIdFor(id) : undefined} className={cn('min-w-0', className)}>
            <legend className={cn('mb-3 text-sm leading-none font-medium', legendClassName)}>{legend}</legend>
            {hint && <p className="-mt-1 mb-3 text-sm text-muted-foreground">{hint}</p>}
            {children}
            <FieldError fieldId={id} message={error} className="mt-2" />
        </fieldset>
    );
}

/** Toggle a value inside a string array (checkbox groups). */
export function toggleValue(values: string[], value: string, checked: boolean): string[] {
    if (checked) {
        return values.includes(value) ? values : [...values, value];
    }

    return values.filter((item) => item !== value);
}
