import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppearance } from '@/hooks/use-appearance';
import { cn } from '@/lib/utils';

/**
 * One click switches light ↔ dark (saved for the next visits). The icon shows what the click does: a moon on the
 * light page, a sun on the dark one. Icon and label follow the <html class="dark"> set before paint, so the server
 * render and hydration always agree.
 */
export function ThemeToggle({ className }: { className?: string }) {
    const { toggleAppearance } = useAppearance();

    return (
        <Button variant="ghost" size="icon" onClick={toggleAppearance} className={cn('relative overflow-hidden', className)}>
            <span className="sr-only dark:hidden">Włącz ciemny motyw</span>
            <span className="sr-only hidden dark:inline">Włącz jasny motyw</span>
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
