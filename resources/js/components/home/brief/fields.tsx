import { CircleAlert, LoaderCircle } from 'lucide-react';
import type { ComponentProps, ReactNode } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { localized, useCopy } from '@/lib/i18n';
import { scrollBehavior } from '@/lib/in-page-navigation';
import { cn } from '@/lib/utils';

/**
 * Small form helpers shared by the homepage forms (brief, quick contact, callback, newsletter).
 */

const COPY = localized({
    pl: {
        sending: 'Wysyłanie…',
        requiredBefore: 'Pola oznaczone ',
        asterisk: 'gwiazdką',
        requiredAfter: ' są wymagane.',
    },
    en: {
        sending: 'Sending…',
        requiredBefore: 'Fields marked ',
        asterisk: 'with an asterisk',
        requiredAfter: ' are required.',
    },
});

export const errorIdFor = (fieldId: string): string => `${fieldId}-error`;

/** aria-invalid / aria-describedby for a control, given its (optional) error message. */
export function invalidProps(
    fieldId: string,
    error: string | undefined,
    describedBy?: string,
): { 'aria-invalid'?: true; 'aria-describedby'?: string } {
    const ids = [describedBy, error ? errorIdFor(fieldId) : undefined].filter(Boolean).join(' ');

    return {
        'aria-invalid': error ? true : undefined,
        'aria-describedby': ids || undefined,
    };
}

/** The rate-limit error (`errors.form`) set by the backend's `throttle:forms` limiter. */
export function formLevelError(errors: object): string | undefined {
    const value = (errors as Record<string, unknown>).form;

    return typeof value === 'string' && value !== '' ? value : undefined;
}

/** First error message whose key belongs to `field` (`field` itself or `field.N`). */
export function fieldError(errors: object, field: string): string | undefined {
    const entries = Object.entries(errors as Record<string, unknown>);
    const match = entries.find(([key, value]) => (key === field || key.startsWith(`${field}.`)) && typeof value === 'string');

    return match ? (match[1] as string) : undefined;
}

export function FieldError({ fieldId, message, className }: { fieldId: string; message?: string; className?: string }) {
    if (!message) {
        return null;
    }

    return (
        <p id={errorIdFor(fieldId)} className={cn('flex items-start gap-1.5 text-sm text-destructive', className)}>
            {/* The icon keeps the error from being signalled by colour alone. */}
            <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            <span>{message}</span>
        </p>
    );
}

export function RequiredMark({ className }: { className?: string }) {
    return (
        <span aria-hidden="true" className={cn('text-muted-foreground', className)}>
            *
        </span>
    );
}

/** "Pola oznaczone * są wymagane." under a form; screen readers hear the asterisk named. */
export function RequiredFieldsNote({ className }: { className?: string }) {
    const copy = useCopy(COPY);

    return (
        <p className={cn('text-sm text-muted-foreground', className)}>
            {copy.requiredBefore}
            <span aria-hidden="true">*</span>
            <span className="sr-only">{copy.asterisk}</span>
            {copy.requiredAfter}
        </p>
    );
}

type FieldProps = {
    fieldId: string;
    label: ReactNode;
    required?: boolean;
    error?: string;
    className?: string;
    children: ReactNode;
};

/** Label + control + error, stacked. The control must carry `id={fieldId}` and `invalidProps(...)`. */
export function Field({ fieldId, label, required, error, className, children }: FieldProps) {
    return (
        <div className={cn('grid min-w-0 content-start gap-2', className)}>
            <Label htmlFor={fieldId}>
                {label}
                {required && <RequiredMark className="-ml-1" />}
            </Label>
            {children}
            <FieldError fieldId={fieldId} message={error} />
        </div>
    );
}

type SelectFieldProps = {
    fieldId: string;
    label: ReactNode;
    placeholder: string;
    options: { value: string; label: string }[];
    /** '' shows the placeholder. */
    value: string;
    onValueChange: (value: string) => void;
    error?: string;
    className?: string;
};

/** Labelled shadcn Select (the trigger carries the id, so <Label htmlFor> names it). */
export function SelectField({ fieldId, label, placeholder, options, value, onValueChange, error, className }: SelectFieldProps) {
    return (
        <Field fieldId={fieldId} label={label} error={error} className={className}>
            <Select value={value} onValueChange={onValueChange}>
                <SelectTrigger id={fieldId} className="w-full" {...invalidProps(fieldId, error)}>
                    <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent>
                    {options.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                            {option.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </Field>
    );
}

export function FormErrorAlert({ message, className }: { message?: string; className?: string }) {
    if (!message) {
        return null;
    }

    return (
        <Alert variant="destructive" className={className}>
            <CircleAlert aria-hidden="true" />
            <AlertDescription>{message}</AlertDescription>
        </Alert>
    );
}

type SubmitButtonProps = Omit<ComponentProps<typeof Button>, 'type'> & {
    processing: boolean;
    /** Label while the request runs (default "Wysyłanie…" / "Sending…"). */
    pendingLabel?: string;
};

/** Submit button: disabled with a spinner and a pending label while the request runs. */
export function SubmitButton({ processing, pendingLabel, children, disabled, ...props }: SubmitButtonProps) {
    const copy = useCopy(COPY);

    return (
        <Button type="submit" disabled={processing || disabled} {...props}>
            {processing && <LoaderCircle aria-hidden="true" className="animate-spin" />}
            {processing ? (pendingLabel ?? copy.sending) : children}
        </Button>
    );
}

/**
 * Move focus to an element (heading/status) and, when it sits under the sticky header or below the fold,
 * scroll it into view. Call only from effects or event handlers.
 */
export function focusAndReveal(element: HTMLElement | null, headerOffset = 80): void {
    if (!element) {
        return;
    }

    element.focus({ preventScroll: true });

    const rect = element.getBoundingClientRect();

    if (rect.top < headerOffset || rect.top > window.innerHeight - 48) {
        element.scrollIntoView({ block: 'start', behavior: scrollBehavior() });
    }
}
