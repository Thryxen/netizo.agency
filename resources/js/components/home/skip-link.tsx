import { localized, useCopy } from '@/lib/i18n';

const COPY = localized({
    pl: { label: 'Przejdź do treści' },
    en: { label: 'Skip to content' },
});

/** The first stop of the keyboard: hidden until focused, then jumps past the header to <main id="main-content">. */
export function SkipLink() {
    const copy = useCopy(COPY);

    return (
        <a
            href="#main-content"
            className="sr-only rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-foreground shadow-sm focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:px-4 focus:py-2 focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
        >
            {copy.label}
        </a>
    );
}
