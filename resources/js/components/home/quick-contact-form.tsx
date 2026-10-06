import { useForm } from '@inertiajs/react';
import { type FormEvent, useEffect, useRef, useState } from 'react';
import { Field, fieldError, focusAndReveal, FormErrorAlert, formLevelError, invalidProps, SelectField, SubmitButton } from '@/components/home/brief/fields';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useRememberedValue } from '@/hooks/use-remembered-value';
import { endpoints } from '@/lib/endpoints';

type QuickContactData = {
    name: string;
    email: string;
    subject: string;
    message: string;
};

/** "Temat" options, ported from resources/views/livewire/quick-contact.blade.php (values = StoreContactMessageRequest::SUBJECTS). */
const subjectOptions = [
    { value: 'project', label: 'Nowy projekt' },
    { value: 'cooperation', label: 'Współpraca' },
    { value: 'career', label: 'Kariera' },
    { value: 'other', label: 'Inne' },
];

const createInitialData = (): QuickContactData => ({ name: '', email: '', subject: '', message: '' });

/** Short contact form (Kontakt → "Szybka wiadomość"). */
export function QuickContactForm() {
    const form = useForm<QuickContactData>(createInitialData);
    const [submitted, setSubmitted] = useState(false);

    // A half-written message survives a page remount caused by history navigation.
    useRememberedValue('home-quick-contact:data', form.data, (remembered) => {
        if (typeof remembered === 'object' && remembered !== null) {
            form.setData({ ...createInitialData(), ...(remembered as Partial<QuickContactData>) });
        }
    });
    const successHeadingRef = useRef<HTMLHeadingElement>(null);
    const nameInputRef = useRef<HTMLInputElement>(null);
    const pendingFocus = useRef<'success' | 'form' | 'invalid' | null>(null);
    const rootRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const target = pendingFocus.current;

        if (target === null) {
            return;
        }

        pendingFocus.current = null;

        if (target === 'success') {
            focusAndReveal(successHeadingRef.current);
        } else if (target === 'form') {
            nameInputRef.current?.focus();
        } else {
            rootRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
        }
    }, [submitted, form.errors]);

    const errors = {
        name: fieldError(form.errors, 'name'),
        email: fieldError(form.errors, 'email'),
        subject: fieldError(form.errors, 'subject'),
        message: fieldError(form.errors, 'message'),
    };
    const formError = formLevelError(form.errors);

    const setField = <K extends keyof QuickContactData>(field: K, value: QuickContactData[K]): void => {
        form.setData((previous) => ({ ...previous, [field]: value }));

        if (errors[field]) {
            form.clearErrors(field);
        }
    };

    const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
        event.preventDefault();

        if (form.processing) {
            return;
        }

        form.post(endpoints.contact, {
            preserveScroll: true,
            onSuccess: () => {
                form.reset();
                pendingFocus.current = 'success';
                setSubmitted(true);
            },
            onError: (serverErrors) => {
                if (Object.keys(serverErrors).some((key) => key !== 'form')) {
                    pendingFocus.current = 'invalid';
                }
            },
        });
    };

    if (submitted) {
        return (
            <div ref={rootRef} className="grid gap-3">
                <h3 ref={successHeadingRef} tabIndex={-1} className="scroll-mt-4 text-2xl font-semibold tracking-tight outline-none">
                    Wiadomość wysłana
                </h3>
                <p role="status" className="leading-relaxed text-muted-foreground">
                    Odpowiemy w ciągu 24 godzin.
                </p>
                <div className="pt-5">
                    <Button
                        type="button"
                        variant="outline"
                        className="max-md:h-11"
                        onClick={() => {
                            pendingFocus.current = 'form';
                            setSubmitted(false);
                        }}
                    >
                        Wyślij kolejną wiadomość
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div ref={rootRef}>
            <form onSubmit={handleSubmit} noValidate aria-label="Szybka wiadomość" className="grid gap-5">
                <div className="grid gap-5 sm:grid-cols-2">
                    <Field fieldId="contact-name" label="Imię i nazwisko" required error={errors.name}>
                        <Input
                            ref={nameInputRef}
                            id="contact-name"
                            name="name"
                            autoComplete="name"
                            placeholder="Jan Kowalski"
                            maxLength={255}
                            value={form.data.name}
                            onChange={(event) => setField('name', event.target.value)}
                            aria-required="true"
                            {...invalidProps('contact-name', errors.name)}
                        />
                    </Field>
                    <Field fieldId="contact-email" label="E-mail" required error={errors.email}>
                        <Input
                            id="contact-email"
                            name="email"
                            type="email"
                            inputMode="email"
                            autoComplete="email"
                            placeholder="jan@firma.pl"
                            maxLength={255}
                            value={form.data.email}
                            onChange={(event) => setField('email', event.target.value)}
                            aria-required="true"
                            {...invalidProps('contact-email', errors.email)}
                        />
                    </Field>
                </div>

                <SelectField
                    fieldId="contact-subject"
                    label="Temat"
                    placeholder="Wybierz temat…"
                    options={subjectOptions}
                    value={form.data.subject}
                    onValueChange={(value) => setField('subject', value)}
                    error={errors.subject}
                />

                <Field fieldId="contact-message" label="Wiadomość" required error={errors.message}>
                    <Textarea
                        id="contact-message"
                        name="message"
                        rows={6}
                        maxLength={5000}
                        placeholder="W czym możemy pomóc?"
                        value={form.data.message}
                        onChange={(event) => setField('message', event.target.value)}
                        aria-required="true"
                        className="min-h-36"
                        {...invalidProps('contact-message', errors.message)}
                    />
                </Field>

                <FormErrorAlert message={formError} />

                <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-4 border-t border-border pt-6">
                    <p className="text-sm text-muted-foreground">
                        Pola oznaczone <span aria-hidden="true">*</span>
                        <span className="sr-only">gwiazdką</span> są wymagane.
                    </p>
                    <SubmitButton processing={form.processing} className="ml-auto max-md:h-11">
                        Wyślij wiadomość
                    </SubmitButton>
                </div>
            </form>
        </div>
    );
}
