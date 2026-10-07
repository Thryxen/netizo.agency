import { useForm } from '@inertiajs/react';
import { type FormEvent, useEffect, useRef, useState } from 'react';
import { FieldError, fieldError, FormErrorAlert, formLevelError, invalidProps, SubmitButton } from '@/components/home/brief/fields';
import { NewsletterScene } from '@/components/home/scenes/newsletter-scene';
import { bleedClassName, gutterClassName, Section, SectionHeading } from '@/components/home/section';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { endpoints } from '@/lib/endpoints';
import { cn } from '@/lib/utils';

const perks = ['Trendy technologiczne', 'Case studies projektów', 'Praktyczne porady dla firm'];

function NewsletterForm() {
    const form = useForm<{ email: string }>(() => ({ email: '' }));
    const [subscribed, setSubscribed] = useState(false);
    const successRef = useRef<HTMLParagraphElement>(null);
    const emailInputRef = useRef<HTMLInputElement>(null);
    const pendingFocus = useRef<'success' | 'invalid' | null>(null);

    useEffect(() => {
        const target = pendingFocus.current;

        if (target === null) {
            return;
        }

        pendingFocus.current = null;

        if (target === 'success') {
            successRef.current?.focus();
        } else {
            emailInputRef.current?.focus();
        }
    }, [subscribed, form.errors]);

    const emailError = fieldError(form.errors, 'email');
    const formError = formLevelError(form.errors);
    const noteId = 'newsletter-note';

    const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
        event.preventDefault();

        if (form.processing) {
            return;
        }

        form.post(endpoints.newsletter, {
            preserveScroll: true,
            onSuccess: () => {
                form.reset();
                pendingFocus.current = 'success';
                setSubscribed(true);
            },
            onError: (serverErrors) => {
                if ('email' in serverErrors) {
                    pendingFocus.current = 'invalid';
                }
            },
        });
    };

    if (subscribed) {
        return (
            <p ref={successRef} tabIndex={-1} role="status" className="text-lg leading-relaxed font-medium outline-none">
                Zapisano. Pierwszy numer trafi do Ciebie w przyszłym miesiącu.
            </p>
        );
    }

    return (
        <form onSubmit={handleSubmit} noValidate aria-label="Zapis do newslettera" className="grid gap-3">
            <Label htmlFor="newsletter-email" className="sr-only">
                Adres e-mail
            </Label>
            <div className="flex flex-col gap-2 sm:flex-row">
                <Input
                    ref={emailInputRef}
                    id="newsletter-email"
                    name="email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    placeholder="ty@firma.pl"
                    maxLength={255}
                    value={form.data.email}
                    onChange={(event) => {
                        form.setData('email', event.target.value);

                        if (emailError) {
                            form.clearErrors('email');
                        }
                    }}
                    aria-required="true"
                    className="h-11 sm:flex-1 md:h-10"
                    {...invalidProps('newsletter-email', emailError, noteId)}
                />
                <SubmitButton processing={form.processing} pendingLabel="Zapisywanie…" size="lg" className="max-md:h-11 sm:min-w-32">
                    Zapisz się
                </SubmitButton>
            </div>
            <FieldError fieldId="newsletter-email" message={emailError} />
            <FormErrorAlert message={formError} />
            <p id={noteId} className="text-sm text-muted-foreground">
                Zero spamu. Możesz wypisać się w dowolnym momencie.
            </p>
        </form>
    );
}

/**
 * A bleed split band: heading + perks on the left; on the right the photo scene (an issue arriving on a phone) over
 * the form, all sharing hairlines. Below lg: heading, a wide crop of the scene, the form. The section's own top
 * hairline and the next section's hairline are the band's edges (no container padding).
 */
export function NewsletterSection() {
    return (
        <Section id="newsletter" labelledBy="newsletter-heading" containerClassName="py-0 md:py-0">
            <div className={cn('grid gap-px bg-border lg:grid-cols-12', bleedClassName)}>
                <SectionHeading
                    id="newsletter-heading"
                    title="Newsletter raz w miesiącu"
                    lead="Przegląd najważniejszych trendów, case studies i praktyczne porady dla firm."
                    className={cn('mb-0 bg-background pt-20 pb-12 md:mb-0 md:pt-28 md:pb-16 lg:col-span-6 lg:row-span-2 lg:pb-28 xl:col-span-7', gutterClassName)}
                >
                    <ul className="mt-8 grid list-disc gap-3 pl-5 marker:text-muted-foreground" aria-label="Co znajdziesz w newsletterze">
                        {perks.map((perk) => (
                            <li key={perk} className="pl-1">
                                {perk}
                            </li>
                        ))}
                    </ul>
                </SectionHeading>

                <NewsletterScene className="aspect-[16/9] sm:aspect-[21/9] lg:col-span-6 lg:aspect-auto lg:min-h-64 xl:col-span-5" />

                <div className={cn('flex flex-col justify-center bg-background py-12 md:py-14 lg:col-span-6 lg:py-12 xl:col-span-5', gutterClassName)}>
                    <NewsletterForm />
                </div>
            </div>
        </Section>
    );
}
