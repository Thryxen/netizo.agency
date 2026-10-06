import { useForm } from '@inertiajs/react';
import { XIcon } from 'lucide-react';
import { type FormEvent, useEffect, useRef, useState } from 'react';
import { Field, fieldError, FormErrorAlert, formLevelError, invalidProps, SubmitButton } from '@/components/home/brief/fields';
import { useHomeUi } from '@/components/home/home-ui-context';
import { Pixel } from '@/components/home/pixel';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { endpoints } from '@/lib/endpoints';
import { contact } from '@/lib/site';

function CallbackForm() {
    const form = useForm<{ phone: string }>(() => ({ phone: '' }));
    const [submitted, setSubmitted] = useState(false);
    const successRef = useRef<HTMLParagraphElement>(null);
    const phoneInputRef = useRef<HTMLInputElement>(null);
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
            phoneInputRef.current?.focus();
        }
    }, [submitted, form.errors]);

    const phoneError = fieldError(form.errors, 'phone');
    const formError = formLevelError(form.errors);

    const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
        event.preventDefault();

        if (form.processing) {
            return;
        }

        form.post(endpoints.callback, {
            preserveScroll: true,
            onSuccess: () => {
                form.reset();
                pendingFocus.current = 'success';
                setSubmitted(true);
            },
            onError: (serverErrors) => {
                if ('phone' in serverErrors) {
                    pendingFocus.current = 'invalid';
                }
            },
        });
    };

    if (submitted) {
        return (
            <div className="grid gap-6">
                <p ref={successRef} tabIndex={-1} role="status" className="flex items-center gap-3 font-medium outline-none">
                    <Pixel size="md" />
                    Dziękujemy, oddzwonimy wkrótce.
                </p>
                <DialogClose asChild>
                    <Button type="button" variant="outline" className="w-full max-md:h-11">
                        Zamknij
                    </Button>
                </DialogClose>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} noValidate aria-label="Oddzwonimy do Ciebie" className="grid gap-5">
            <Field fieldId="callback-phone" label="Numer telefonu" required error={phoneError}>
                <Input
                    ref={phoneInputRef}
                    id="callback-phone"
                    name="phone"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="+48 000 000 000"
                    maxLength={255}
                    value={form.data.phone}
                    onChange={(event) => {
                        form.setData('phone', event.target.value);

                        if (phoneError) {
                            form.clearErrors('phone');
                        }
                    }}
                    aria-required="true"
                    {...invalidProps('callback-phone', phoneError)}
                />
            </Field>

            <FormErrorAlert message={formError} />

            <SubmitButton processing={form.processing} className="w-full max-md:h-11">
                Zadzwońcie do mnie
            </SubmitButton>

            <p className="text-center text-sm text-muted-foreground">
                Wolisz zadzwonić od razu?{' '}
                <a
                    href={contact.phone.href}
                    className="rounded-sm font-medium whitespace-nowrap text-foreground underline-offset-4 outline-none hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/50"
                >
                    {contact.phone.display}
                </a>
            </p>
        </form>
    );
}

/** "Oddzwonimy do Ciebie" dialog, bound to `callbackOpen` from the home UI context. */
export function CallbackDialog() {
    const { callbackOpen, setCallbackOpen, callbackReturnFocusRef } = useHomeUi();

    // Fresh form state every time the dialog opens (adjusting state during render, not in an effect).
    const [session, setSession] = useState(0);
    const [wasOpen, setWasOpen] = useState(callbackOpen);

    if (callbackOpen !== wasOpen) {
        setWasOpen(callbackOpen);

        if (callbackOpen) {
            setSession((value) => value + 1);
        }
    }

    /** No DialogTrigger is used, so Radix can't restore focus itself: send it back to the button that opened the dialog. */
    const handleCloseAutoFocus = (event: Event): void => {
        const returnTarget = callbackReturnFocusRef.current;
        callbackReturnFocusRef.current = null;

        if (returnTarget?.isConnected) {
            event.preventDefault();
            returnTarget.focus();
        }
    };

    return (
        <Dialog open={callbackOpen} onOpenChange={setCallbackOpen}>
            <DialogContent showCloseButton={false} onCloseAutoFocus={handleCloseAutoFocus} className="gap-6 sm:max-w-md">
                <DialogHeader className="pr-8 text-left">
                    <DialogTitle className="text-xl tracking-tight">Oddzwonimy do Ciebie</DialogTitle>
                    <DialogDescription>Zostaw numer telefonu, a oddzwonimy najszybciej, jak to możliwe.</DialogDescription>
                </DialogHeader>

                <CallbackForm key={session} />

                <DialogClose asChild>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="absolute top-3 right-3 text-muted-foreground hover:text-foreground max-md:top-2 max-md:right-2 max-md:size-11"
                    >
                        <XIcon aria-hidden="true" />
                        <span className="sr-only">Zamknij</span>
                    </Button>
                </DialogClose>
            </DialogContent>
        </Dialog>
    );
}
