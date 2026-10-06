import { useForm } from '@inertiajs/react';
import { type FormEvent, type ReactNode, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useRememberedValue } from '@/hooks/use-remembered-value';
import { endpoints } from '@/lib/endpoints';
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

const TYPES_REQUIRED_MESSAGE = 'Wybierz przynajmniej jeden typ projektu.';

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
function validateContact(data: BriefFormData): ContactErrors {
    const errors: ContactErrors = {};
    const name = data.name.trim();
    const email = data.email.trim();

    if (name === '') {
        errors.name = 'Imię i nazwisko jest wymagane.';
    } else if (name.length < 2) {
        errors.name = 'Imię i nazwisko musi mieć co najmniej 2 znaki.';
    }

    if (email === '') {
        errors.email = 'Adres e-mail jest wymagany.';
    } else if (!/^[^\s@]+@[^\s@]+$/.test(email)) {
        errors.email = 'Podaj poprawny adres e-mail.';
    }

    if (!data.privacy) {
        errors.privacy = 'Musisz zaakceptować politykę prywatności.';
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
            form.setError('types', TYPES_REQUIRED_MESSAGE);

            return;
        }

        if (step < BRIEF_TOTAL_STEPS) {
            goToStep(step + 1);

            return;
        }

        if (performance.now() - lastStepChangeAt.current < SUBMIT_GUARD_MS) {
            return;
        }

        const contactErrors = validateContact(form.data);

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
                        Brief wysłany
                    </h3>
                    <p role="status" className="max-w-prose leading-relaxed text-muted-foreground">
                        Dziękujemy. Przeanalizujemy wymagania i odezwiemy się w ciągu 24 godzin.
                    </p>
                </div>

                <div className="grid gap-3">
                    <h4 className="text-sm font-medium">Co dalej</h4>
                    <ol className="grid border-t border-l border-border sm:grid-cols-3">
                        {briefNextSteps.map((item, index) => (
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
                        Wypełnij ponownie
                    </Button>
                </div>
            </div>
        );
    }

    const current = briefSteps[step - 1];
    const StepBody = stepComponents[step];
    const isLastStep = step === BRIEF_TOTAL_STEPS;
    const headingId = 'brief-step-heading';

    return (
        <div ref={rootRef}>
            <form onSubmit={handleSubmit} noValidate aria-labelledby={headingId} className="grid gap-8">
                <div className="grid gap-5">
                    <div className="flex items-center gap-4">
                        <p aria-hidden="true" className="shrink-0 text-sm text-muted-foreground tabular-nums">
                            Krok {step} z {BRIEF_TOTAL_STEPS}
                        </p>
                        <Progress
                            value={(step / BRIEF_TOTAL_STEPS) * 100}
                            aria-label="Postęp briefu"
                            getValueLabel={() => `Krok ${step} z ${BRIEF_TOTAL_STEPS}`}
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
                            <span className="sr-only">
                                Krok {step} z {BRIEF_TOTAL_STEPS}:{' '}
                            </span>
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
                            Wstecz
                        </Button>
                    )}
                    <SubmitButton processing={form.processing} className="ml-auto min-w-28 max-md:h-11">
                        {isLastStep ? 'Wyślij brief' : 'Dalej'}
                    </SubmitButton>
                </div>
            </form>
        </div>
    );
}
