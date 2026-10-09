import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppearance } from '@/hooks/use-appearance';
import { localized, useCopy } from '@/lib/i18n';
import { cn } from '@/lib/utils';

const COPY = localized({
    pl: { dark: 'Włącz ciemny motyw', light: 'Włącz jasny motyw' },
    en: { dark: 'Switch to dark theme', light: 'Switch to light theme' },
});

/**
 * One click switches light ↔ dark (saved for the next visits). The icon shows what the click does: a moon on the
 * light page, a sun on the dark one. Icon and label follow the <html class="dark"> set before paint, so the server
 * render and hydration always agree.
 */
export function ThemeToggle({ className }: { className?: string }) {
    const { toggleAppearance } = useAppearance();
    const copy = useCopy(COPY);

    return (
        <Button variant="ghost" size="icon" onClick={toggleAppearance} className={cn('relative overflow-hidden', className)}>
            <span className="sr-only dark:hidden">{copy.dark}</span>
            <span className="sr-only hidden dark:inline">{copy.light}</span>
            <Moon
                aria-hidden="true"
                className="transition-[rotate,scale,opacity] duration-300 ease-out motion-reduce:transition-none dark:scale-50 dark:-rotate-90 dark:opacity-0"
            />
            <Sun
                aria-hidden="true"
                className="absolute scale-50 rotate-90 opacity-0 transition-[rotate,scale,opacity] duration-300 ease-out motion-reduce:transition-none dark:scale-100 dark:rotate-0 dark:opacity-100"
            />
        </Button>
    );
}
