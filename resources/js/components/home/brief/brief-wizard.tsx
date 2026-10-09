import { useForm } from '@inertiajs/react';
import { type FormEvent, type ReactNode, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useRememberedValue } from '@/hooks/use-remembered-value';
import { useEndpoints } from '@/lib/endpoints';
import { type Locale, localized, useCopy, useLocale } from '@/lib/i18n';
import {
    BRIEF_TOTAL_STEPS,
    type BriefField,
    briefFieldStep,
    type BriefFormData,
    briefNextSteps,
    briefSteps,
    createInitialBriefData,
} from './brief-options';
import { type BriefStepProps, BudgetStep, ContactStep, DetailsStep, FeaturesStep, ProjectTypeStep, TechStep } from './brief-steps';
import { fieldError, focusAndReveal, FormErrorAlert, formLevelError, SubmitButton } from './fields';

/** Client-side messages: the same wording as the server's (lang/{pl,en}/forms.php, `brief`). */
const COPY = localized({
    pl: {
        typesRequired: 'Wybierz przynajmniej jeden typ projektu.',
        nameRequired: 'Imię i nazwisko jest wymagane.',
        nameMin: 'Imię i nazwisko musi mieć co najmniej 2 znaki.',
        emailRequired: 'Adres e-mail jest wymagany.',
        emailInvalid: 'Podaj poprawny adres e-mail.',
        privacyRequired: 'Musisz zaakceptować politykę prywatności.',
        stepOf: (step: number, total: number): string => `Krok ${step} z ${total}`,
        progress: 'Postęp briefu',
        sentHeading: 'Brief wysłany',
        sentMessage: 'Dziękujemy. Przeanalizujemy wymagania i odezwiemy się w ciągu 24 godzin.',
        nextSteps: 'Co dalej',
        restart: 'Wypełnij ponownie',
        back: 'Wstecz',
        submit: 'Wyślij brief',
        next: 'Dalej',
    },
    en: {
        typesRequired: 'Please choose at least one project type.',
        nameRequired: 'Please enter your full name.',
        nameMin: 'Your full name must be at least 2 characters long.',
        emailRequired: 'Please enter your email address.',
        emailInvalid: 'Please enter a valid email address.',
        privacyRequired: 'Please accept the privacy policy.',
        stepOf: (step: number, total: number): string => `Step ${step} of ${total}`,
        progress: 'Brief progress',
        sentHeading: 'Brief sent',
        sentMessage: 'Thank you. We’ll review your requirements and get back to you within 24 hours.',
        nextSteps: 'What’s next',
        restart: 'Start a new brief',
        back: 'Back',
        submit: 'Send brief',
        next: 'Next',
    },
});

/** Ignore a "Wyślij brief" click that lands right after "Dalej" turned into it (double click on step 5). */
const SUBMIT_GUARD_MS = 400;

const stepComponents: Record<number, (props: BriefStepProps) => ReactNode> = {
    1: ProjectTypeStep,
    2: FeaturesStep,
    3: DetailsStep,
    4: TechStep,
    5: BudgetStep,
    6: ContactStep,
};

const briefFields = Object.keys(briefFieldStep) as BriefField[];

type ContactErrors = Partial<Record<'name' | 'email' | 'privacy', string>>;

/** Client-side gate for step 6 (mirrors StoreProjectBriefRequest; the server stays the source of truth). */
function validateContact(data: BriefFormData, locale: Locale): ContactErrors {
    const copy = COPY[locale];
    const errors: ContactErrors = {};
    const name = data.name.trim();
    const email = data.email.trim();

    if (name === '') {
        errors.name = copy.nameRequired;
    } else if (name.length < 2) {
        errors.name = copy.nameMin;
    }

    if (email === '') {
        errors.email = copy.emailRequired;
    } else if (!/^[^\s@]+@[^\s@]+$/.test(email)) {
        errors.email = copy.emailInvalid;
    }

    if (!data.privacy) {
        errors.privacy = copy.privacyRequired;
    }

    return errors;
}

/** First wizard step that holds one of the errored fields (keys may be `field` or `field.N`). */
function firstErroredStep(errorKeys: string[]): number | null {
    const steps = errorKeys
        .map((key) => key.split('.')[0])
        .filter((field): field is BriefField => field in briefFieldStep)
        .map((field) => briefFieldStep[field]);

    return steps.length > 0 ? Math.min(...steps) : null;
}

type PendingFocus = 'heading' | 'success' | 'invalid' | null;

const isBriefStep = (value: unknown): value is number => Number.isInteger(value) && (value as number) >= 1 && (value as number) <= BRIEF_TOTAL_STEPS;

export function BriefWizard() {
    const locale = useLocale();
    const copy = useCopy(COPY);
    const endpoints = useEndpoints();
    const form = useForm<BriefFormData>(createInitialBriefData);
    const [step, setStep] = useState(1);
    const [submitted, setSubmitted] = useState(false);

    // A half-filled brief survives a page remount caused by history navigation.
    useRememberedValue('home-brief:data', form.data, (remembered) => {
        if (typeof remembered === 'object' && remembered !== null) {
            form.setData({ ...createInitialBriefData(), ...(remembered as Partial<BriefFormData>) });
        }
    });
    useRememberedValue('home-brief:step', step, (remembered) => {
        if (isBriefStep(remembered)) {
            setStep(remembered);
        }
    });

    const rootRef = useRef<HTMLDivElement>(null);
    const headingRef = useRef<HTMLHeadingElement>(null);
    const successHeadingRef = useRef<HTMLHeadingElement>(null);
    const pendingFocus = useRef<PendingFocus>(null);
    const lastStepChangeAt = useRef(0);

    // Focus only after a user-driven change — never on first render.
    useEffect(() => {
        const target = pendingFocus.current;

        if (target === null) {
            return;
        }

        pendingFocus.current = null;

        if (target === 'heading') {
            focusAndReveal(headingRef.current);
        } else if (target === 'success') {
            focusAndReveal(successHeadingRef.current);
        } else {
            const invalid = rootRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]');

            if (invalid) {
                invalid.focus();
            }
        }
    }, [step, submitted, form.errors]);

    const errors: Partial<Record<BriefField, string>> = {};

    for (const field of briefFields) {
        const message = fieldError(form.errors, field);

        if (message) {
            errors[field] = message;
        }
    }

    const formError = formLevelError(form.errors);

    const setField: BriefStepProps['setField'] = (field, value) => {
        form.setData((previous) => ({ ...previous, [field]: value }));

        if (errors[field]) {
            form.clearErrors(field);
        }
    };

    const goToStep = (next: number): void => {
        pendingFocus.current = 'heading';
        lastStepChangeAt.current = performance.now();
        setStep(next);
    };

    const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
        event.preventDefault();

        if (form.processing) {
            return;
        }

        if (step === 1 && form.data.types.length === 0) {
            pendingFocus.current = 'invalid';
            form.setError('types', copy.typesRequired);

            return;
        }

        if (step < BRIEF_TOTAL_STEPS) {
            goToStep(step + 1);

            return;
        }

        if (performance.now() - lastStepChangeAt.current < SUBMIT_GUARD_MS) {
            return;
        }

        const contactErrors = validateContact(form.data, locale);

        if (Object.keys(contactErrors).length > 0) {
            pendingFocus.current = 'invalid';
            form.clearErrors();
            form.setError(contactErrors);

            return;
        }

        form.post(endpoints.brief, {
            preserveScroll: true,
            onSuccess: () => {
                form.reset();
                pendingFocus.current = 'success';
                setStep(1);
                setSubmitted(true);
            },
            onError: (serverErrors) => {
                const target = firstErroredStep(Object.keys(serverErrors));

                if (target !== null && target !== step) {
                    goToStep(target);
                } else if (target !== null) {
                    pendingFocus.current = 'invalid';
                }
            },
        });
    };

    const restart = (): void => {
        form.reset();
        form.clearErrors();
        pendingFocus.current = 'heading';
        setStep(1);
        setSubmitted(false);
    };

    if (submitted) {
        return (
            <div ref={rootRef} className="grid gap-8">
                <div className="grid gap-3">
                    <h3 ref={successHeadingRef} tabIndex={-1} className="scroll-mt-4 text-2xl font-semibold tracking-tight outline-none">
                        {copy.sentHeading}
                    </h3>
                    <p role="status" className="max-w-prose leading-relaxed text-muted-foreground">
                        {copy.sentMessage}
                    </p>
                </div>

                <div className="grid gap-3">
                    <h4 className="text-sm font-medium">{copy.nextSteps}</h4>
                    <ol className="grid border-t border-l border-border sm:grid-cols-3">
                        {briefNextSteps[locale].map((item, index) => (
                            <li key={item.title} className="flex gap-3 border-r border-b border-border p-4">
                                <span
                                    aria-hidden="true"
                                    className="flex size-6 shrink-0 items-center justify-center border border-foreground text-xs font-medium tabular-nums"
                                >
                                    {index + 1}
                                </span>
                                <span className="grid gap-0.5">
                                    <span className="text-sm font-medium">{item.title}</span>
                                    <span className="text-sm text-muted-foreground">{item.description}</span>
                                </span>
                            </li>
                        ))}
                    </ol>
                </div>

                <div>
                    <Button type="button" variant="outline" className="max-md:h-11" onClick={restart}>
                        {copy.restart}
                    </Button>
                </div>
            </div>
        );
    }

    const current = briefSteps[locale][step - 1];
    const StepBody = stepComponents[step];
    const isLastStep = step === BRIEF_TOTAL_STEPS;
    const headingId = 'brief-step-heading';

    return (
        <div ref={rootRef}>
            <form onSubmit={handleSubmit} noValidate aria-labelledby={headingId} className="grid gap-8">
                <div className="grid gap-5">
                    <div className="flex items-center gap-4">
                        <p aria-hidden="true" className="shrink-0 text-sm text-muted-foreground tabular-nums">
                            {copy.stepOf(step, BRIEF_TOTAL_STEPS)}
                        </p>
                        <Progress
                            value={(step / BRIEF_TOTAL_STEPS) * 100}
                            aria-label={copy.progress}
                            getValueLabel={() => copy.stepOf(step, BRIEF_TOTAL_STEPS)}
                            className="h-1 rounded-none bg-border"
                        />
                    </div>
                    <div className="grid gap-2">
                        <h3
                            id={headingId}
                            ref={headingRef}
                            tabIndex={-1}
                            className="scroll-mt-4 text-xl font-semibold tracking-tight text-balance outline-none sm:text-2xl"
                        >
                            <span className="sr-only">{`${copy.stepOf(step, BRIEF_TOTAL_STEPS)}: `}</span>
                            {current.title}
                        </h3>
                        <p className="text-muted-foreground">{current.description}</p>
                    </div>
                </div>

                <StepBody data={form.data} errors={errors} setField={setField} />

                <FormErrorAlert message={formError} />

                <div className="flex flex-wrap items-center gap-3 border-t border-border pt-6">
                    {step > 1 && (
                        <Button type="button" variant="outline" className="max-md:h-11" onClick={() => goToStep(step - 1)} disabled={form.processing}>
                            {copy.back}
                        </Button>
                    )}
                    <SubmitButton processing={form.processing} className="ml-auto min-w-28 max-md:h-11">
                        {isLastStep ? copy.submit : copy.next}
                    </SubmitButton>
                </div>
            </form>
        </div>
    );
}
