import { useHttp } from '@inertiajs/react';
import { Languages, LoaderCircle } from 'lucide-react';
import { useState } from 'react';

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { adminRoutes } from '@/lib/admin-routes';

type Metric = { value: string; label: string };

/** The Polish copy of the project, as it is in the form. */
export type ProjectCopy = {
    category: string;
    description: string;
    full_description: string;
    metrics: Metric[];
    challenges: string[];
    solutions: string[];
};

/** The English fields of the form, as the server returns them (Admin\ProjectTranslationController). */
export type EnglishProjectCopy = {
    category_en: string;
    description_en: string;
    full_description_en: string;
    metrics_en: Metric[];
    challenges_en: string[];
    solutions_en: string[];
};

type ProjectTranslationProps = {
    source: ProjectCopy;
    /** Whether any English field is filled: translating replaces it, so it asks first. */
    hasEnglishCopy: boolean;
    onTranslated: (copy: EnglishProjectCopy) => void;
};

const FAILED = 'Nie udało się przetłumaczyć. Spróbuj ponownie za chwilę.';

function messageFrom(body: string | undefined, status: number): string {
    if (status === 429) {
        return 'Zbyt wiele tłumaczeń w krótkim czasie. Spróbuj ponownie za minutę.';
    }

    try {
        const message: unknown = JSON.parse(body ?? '')?.message;

        return typeof message === 'string' && message !== '' ? message : FAILED;
    } catch {
        return FAILED;
    }
}

/**
 * "Przetłumacz z polskiego": sends the Polish copy from the form (saved or not) to the translator and puts the result
 * into the English fields. Nothing is saved until the project is.
 */
export function ProjectTranslation({ source, hasEnglishCopy, onTranslated }: ProjectTranslationProps) {
    const http = useHttp<ProjectCopy, EnglishProjectCopy>(source);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [failure, setFailure] = useState<string | null>(null);
    const [translated, setTranslated] = useState(false);

    const validationError = Object.values(http.errors as Record<string, string | undefined>).find(Boolean);
    const error = failure ?? validationError;

    const translate = (): void => {
        setConfirmOpen(false);
        setFailure(null);
        setTranslated(false);
        http.transform(() => source);
        http.post(adminRoutes.projects.translate, {
            onSuccess: (copy) => {
                onTranslated(copy);
                setTranslated(true);
            },
            onHttpException: (response) => {
                setFailure(messageFrom(response.data, response.status));
            },
            onNetworkError: () => {
                setFailure('Brak połączenia z serwerem. Sprawdź internet i spróbuj ponownie.');
            },
        }).catch(() => {
            // Handled by onHttpException / onNetworkError above.
        });
    };

    return (
        <div className="grid gap-2 rounded-lg border p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="max-w-xl text-sm text-muted-foreground">
                    Tłumaczenie polskiej wersji (Claude Haiku przez OpenRouter) trafi do pól poniżej. Przejrzyj je i popraw, zanim zapiszesz projekt.
                </p>
                <Button type="button" variant="outline" disabled={http.processing} onClick={() => (hasEnglishCopy ? setConfirmOpen(true) : translate())}>
                    {http.processing ? <LoaderCircle aria-hidden="true" className="animate-spin" /> : <Languages aria-hidden="true" />}
                    {http.processing ? 'Tłumaczę…' : 'Przetłumacz z polskiego'}
                </Button>
            </div>
            <p aria-live="polite" className="text-sm empty:hidden">
                {error ? <span className="text-destructive">{error}</span> : translated && !http.processing ? 'Gotowe. Sprawdź tłumaczenie i zapisz projekt.' : null}
            </p>

            <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Zastąpić wersję angielską?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Pola wersji angielskiej zostaną zastąpione nowym tłumaczeniem polskiej treści. Nic nie zapisze się, dopóki nie zapiszesz projektu.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Anuluj</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(event) => {
                                event.preventDefault();
                                translate();
                            }}
                        >
                            Przetłumacz
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
