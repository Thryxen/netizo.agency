import { Head, useForm, usePage } from '@inertiajs/react';
import { useRef, type FormEvent } from 'react';

import { FormField } from '@/components/admin/form-field';
import { TurnstileWidget, type TurnstileWidgetHandle } from '@/components/admin/turnstile-widget';
import { Logo } from '@/components/home/logo';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { adminRoutes } from '@/lib/admin-routes';

export default function Login() {
    const { errors: pageErrors, turnstileSiteKey } = usePage<{ errors: Record<string, string>; turnstileSiteKey: string | null }>().props;
    const turnstile = useRef<TurnstileWidgetHandle>(null);
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
        turnstile_token: '',
    });
    const awaitingTurnstile = turnstileSiteKey !== null && data.turnstile_token === '';

    const submit = (event: FormEvent<HTMLFormElement>): void => {
        event.preventDefault();

        post(adminRoutes.login, {
            onFinish: () => {
                reset('password');
                turnstile.current?.reset();
            },
        });
    };

    return (
        <main className="flex min-h-svh items-center justify-center p-6 md:p-10">
            <Head title="Logowanie – Panel Netizo" />

            <form onSubmit={submit} className="flex w-full max-w-sm flex-col gap-6" noValidate>
                <div className="flex flex-col items-center gap-2 text-center">
                    <Logo className="mb-2 h-10 w-auto" title="Netizo" />
                    <h1 className="text-xl font-semibold">Panel administracyjny</h1>
                    <p className="text-sm text-muted-foreground">Zaloguj się, aby zarządzać treściami i zgłoszeniami.</p>
                </div>

                {pageErrors?.form ? (
                    <Alert variant="destructive">
                        <AlertDescription>{pageErrors.form}</AlertDescription>
                    </Alert>
                ) : null}

                <FormField label="Adres e-mail" htmlFor="email" error={errors.email}>
                    <Input
                        id="email"
                        type="email"
                        autoComplete="email"
                        autoFocus
                        required
                        value={data.email}
                        aria-invalid={Boolean(errors.email)}
                        onChange={(event) => setData('email', event.target.value)}
                    />
                </FormField>

                <FormField label="Hasło" htmlFor="password" error={errors.password}>
                    <Input
                        id="password"
                        type="password"
                        autoComplete="current-password"
                        required
                        value={data.password}
                        aria-invalid={Boolean(errors.password)}
                        onChange={(event) => setData('password', event.target.value)}
                    />
                </FormField>

                <div className="flex items-center gap-2">
                    <Checkbox id="remember" checked={data.remember} onCheckedChange={(checked) => setData('remember', checked === true)} />
                    <Label htmlFor="remember" className="font-normal">
                        Zapamiętaj mnie
                    </Label>
                </div>

                {turnstileSiteKey ? (
                    <div className="grid gap-2">
                        <TurnstileWidget
                            ref={turnstile}
                            siteKey={turnstileSiteKey}
                            action="admin_login"
                            onTokenChange={(token) => setData('turnstile_token', token)}
                        />
                        {errors.turnstile_token ? (
                            <p className="text-sm text-destructive" role="alert">
                                {errors.turnstile_token}
                            </p>
                        ) : null}
                    </div>
                ) : null}

                <Button type="submit" disabled={processing || awaitingTurnstile}>
                    Zaloguj się
                </Button>
            </form>
        </main>
    );
}
