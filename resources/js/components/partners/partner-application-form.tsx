import { useForm } from '@inertiajs/react';
import { type FormEvent, useEffect, useRef, useState } from 'react';
import { ChoiceChip, ChoiceFieldset } from '@/components/home/brief/choices';
import { Field, fieldError, focusAndReveal, FormErrorAlert, formLevelError, invalidProps, SubmitButton } from '@/components/home/brief/fields';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useRememberedValue } from '@/hooks/use-remembered-value';
import { useEndpoints } from '@/lib/endpoints';
import { localized, useCopy, useLocale } from '@/lib/i18n';
import { usePageUrls } from '@/lib/site';
import { partnerTypeOptions } from './partner-options';

const COPY = localized({
    pl: {
        sentHeading: 'Zgłoszenie wysłane',
        sentText: (email: string) => `Dziękujemy. W ciągu 24 godzin odezwiemy się na ${email} z kodem partnera i umową do przejrzenia.`,
        home: 'Przejdź na stronę główną',
        formLabel: 'Zgłoszenie do programu partnerskiego',
        name: 'Imię i nazwisko',
        namePlaceholder: 'Anna Kowalska',
        email: 'E-mail',
        emailPlaceholder: 'anna@firma.pl',
        phone: 'Telefon (opcjonalnie)',
        type: 'Kim jesteś?',
        message: 'Kogo chcesz nam polecić? (opcjonalnie)',
        messagePlaceholder: 'Na przykład: znam kilka firm budowlanych, które potrzebują nowych stron.',
        requiredBefore: 'Zgłoszenie do niczego Cię nie zobowiązuje. Pola oznaczone ',
        asterisk: 'gwiazdką',
        requiredAfter: ' są wymagane.',
        submit: 'Wyślij zgłoszenie',
    },
    en: {
        sentHeading: 'Application sent',
        sentText: (email) => `Thank you. Within 24 hours we’ll email ${email} with your partner code and an agreement to review.`,
        home: 'Go to the home page',
        formLabel: 'Partner program application',
        name: 'Full name',
        namePlaceholder: 'Jane Smith',
        email: 'Email',
        emailPlaceholder: 'jane@company.com',
        phone: 'Phone (optional)',
        type: 'What best describes you?',
        message: 'Who would you like to refer? (optional)',
        messagePlaceholder: 'For example: I know a few construction companies that need new websites.',
        requiredBefore: 'Applying doesn’t commit you to anything. Fields marked ',
        asterisk: 'with an asterisk',
        requiredAfter: ' are required.',
        submit: 'Send application',
    },
});

type PartnerApplicationData = {
    name: string;
    email: string;
    phone: string;
    partner_type: string;
    message: string;
};

const createInitialData = (): PartnerApplicationData => ({ name: '', email: '', phone: '', partner_type: '', message: '' });

type PartnerApplicationFormProps = {
    /** The name as typed, for the partner card beside the form. */
    onNameChange?: (name: string) => void;
    /** Called once the application has been sent, with the name it was sent under. */
    onSent?: (name: string) => void;
};

/** Application to the partner programme (Dołącz → POST /partnerzy, Join → POST /en/partners). */
export function PartnerApplicationForm({ onNameChange, onSent }: PartnerApplicationFormProps) {
    const locale = useLocale();
    const copy = useCopy(COPY);
    const endpoints = useEndpoints();
    const pageUrls = usePageUrls();
    const form = useForm<PartnerApplicationData>(createInitialData);
    const [submitted, setSubmitted] = useState(false);
    const [sentTo, setSentTo] = useState('');
    const successHeadingRef = useRef<HTMLHeadingElement>(null);
    const rootRef = useRef<HTMLDivElement>(null);
    const pendingFocus = useRef<'success' | 'invalid' | null>(null);

    // A half-filled application survives a page remount caused by history navigation.
    useRememberedValue('partners-application:data', form.data, (remembered) => {
        if (typeof remembered === 'object' && remembered !== null) {
            form.setData({ ...createInitialData(), ...(remembered as Partial<PartnerApplicationData>) });
        }
    });

    useEffect(() => {
        onNameChange?.(form.data.name);
    }, [form.data.name, onNameChange]);

    useEffect(() => {
        const target = pendingFocus.current;

        if (target === null) {
            return;
        }

        pendingFocus.current = null;

        if (target === 'success') {
            focusAndReveal(successHeadingRef.current);
        } else {
            rootRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
        }
    }, [submitted, form.errors]);

    const errors = {
        name: fieldError(form.errors, 'name'),
        email: fieldError(form.errors, 'email'),
        phone: fieldError(form.errors, 'phone'),
        partner_type: fieldError(form.errors, 'partner_type'),
        message: fieldError(form.errors, 'message'),
    };
    const formError = formLevelError(form.errors);

    const setField = <K extends keyof PartnerApplicationData>(field: K, value: PartnerApplicationData[K]): void => {
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

        form.post(endpoints.partner, {
            preserveScroll: true,
            onSuccess: () => {
                onSent?.(form.data.name);
                setSentTo(form.data.email);
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
                <h3 ref={successHeadingRef} tabIndex={-1} className="scroll-mt-24 text-2xl font-semibold tracking-tight outline-none">
                    {copy.sentHeading}
                </h3>
                <p role="status" className="max-w-[48ch] leading-relaxed text-muted-foreground">
                    {copy.sentText(sentTo)}
                </p>
                <div className="pt-5">
                    <Button variant="outline" className="max-md:h-11" asChild>
                        <a href={pageUrls.home}>{copy.home}</a>
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div ref={rootRef}>
            <form onSubmit={handleSubmit} noValidate aria-label={copy.formLabel} className="grid gap-6">
                <div className="grid gap-5 sm:grid-cols-2">
                    <Field fieldId="partner-name" label={copy.name} required error={errors.name}>
                        <Input
                            id="partner-name"
                            name="name"
                            autoComplete="name"
                            placeholder={copy.namePlaceholder}
                            maxLength={255}
                            value={form.data.name}
                            onChange={(event) => setField('name', event.target.value)}
                            aria-required="true"
                            {...invalidProps('partner-name', errors.name)}
                        />
                    </Field>
                    <Field fieldId="partner-email" label={copy.email} required error={errors.email}>
                        <Input
                            id="partner-email"
                            name="email"
                            type="email"
                            inputMode="email"
                            autoComplete="email"
                            placeholder={copy.emailPlaceholder}
                            maxLength={255}
                            value={form.data.email}
                            onChange={(event) => setField('email', event.target.value)}
                            aria-required="true"
                            {...invalidProps('partner-email', errors.email)}
                        />
                    </Field>
                </div>

                <Field fieldId="partner-phone" label={copy.phone} error={errors.phone} className="sm:max-w-[calc(50%-0.625rem)]">
                    <Input
                        id="partner-phone"
                        name="phone"
                        type="tel"
                        inputMode="tel"
                        autoComplete="tel"
                        placeholder="+48 600 000 000"
                        maxLength={255}
                        value={form.data.phone}
                        onChange={(event) => setField('phone', event.target.value)}
                        {...invalidProps('partner-phone', errors.phone)}
                    />
                </Field>

                <ChoiceFieldset
                    id="partner-type"
                    legend={
                        <>
                            {copy.type} <span aria-hidden="true" className="text-muted-foreground">*</span>
                        </>
                    }
                    error={errors.partner_type}
                >
                    <div className="flex flex-wrap gap-2">
                        {partnerTypeOptions.map((option) => (
                            <ChoiceChip
                                key={option.value}
                                type="radio"
                                id={`partner-type-${option.value}`}
                                name="partner_type"
                                value={option.value}
                                label={option.label[locale]}
                                checked={form.data.partner_type === option.value}
                                onCheckedChange={(checked) => checked && setField('partner_type', option.value)}
                                invalid={Boolean(errors.partner_type)}
                            />
                        ))}
                    </div>
                </ChoiceFieldset>

                <Field fieldId="partner-message" label={copy.message} error={errors.message}>
                    <Textarea
                        id="partner-message"
                        name="message"
                        rows={4}
                        maxLength={2000}
                        placeholder={copy.messagePlaceholder}
                        value={form.data.message}
                        onChange={(event) => setField('message', event.target.value)}
                        className="min-h-28"
                        {...invalidProps('partner-message', errors.message)}
                    />
                </Field>

                <FormErrorAlert message={formError} />

                <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-4 border-t border-border pt-6">
                    <p className="max-w-[36ch] text-sm text-pretty text-muted-foreground">
                        {copy.requiredBefore}
                        <span aria-hidden="true">*</span>
                        <span className="sr-only">{copy.asterisk}</span>
                        {copy.requiredAfter}
                    </p>
                    <SubmitButton processing={form.processing} className="ml-auto max-md:h-11">
                        {copy.submit}
                    </SubmitButton>
                </div>
            </form>
        </div>
    );
}
