import { createInertiaApp } from '@inertiajs/react';
import { initializeTheme } from '@/hooks/use-appearance';
import { resolvePage } from '@/lib/pages';

void createInertiaApp({
    resolve: resolvePage,
    strictMode: true,
    progress: {
        color: 'var(--foreground)',
        showSpinner: false,
    },
});

initializeTheme();
