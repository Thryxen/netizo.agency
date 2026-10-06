import { Monitor, Moon, Sun } from 'lucide-react';
import type { ComponentType, SVGProps } from 'react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { type Appearance, useAppearance } from '@/hooks/use-appearance';
import { cn } from '@/lib/utils';

const OPTIONS: { value: Appearance; label: string; icon: ComponentType<SVGProps<SVGSVGElement>> }[] = [
    { value: 'light', label: 'Jasny', icon: Sun },
    { value: 'dark', label: 'Ciemny', icon: Moon },
    { value: 'system', label: 'Systemowy', icon: Monitor },
];

const isAppearance = (value: string): value is Appearance => OPTIONS.some((option) => option.value === value);

export function ThemeToggle({ className }: { className?: string }) {
    const { appearance, updateAppearance } = useAppearance();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Zmień motyw" className={cn('relative', className)}>
                    {/* Icon follows the <html class="dark"> set before paint, so SSR and hydration always agree. */}
                    <Sun aria-hidden="true" className="dark:hidden" />
                    <Moon aria-hidden="true" className="hidden dark:block" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-40">
                <DropdownMenuRadioGroup value={appearance} onValueChange={(value) => isAppearance(value) && updateAppearance(value)}>
                    {OPTIONS.map(({ value, label, icon: Icon }) => (
                        <DropdownMenuRadioItem key={value} value={value}>
                            <Icon aria-hidden="true" />
                            {label}
                        </DropdownMenuRadioItem>
                    ))}
                </DropdownMenuRadioGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
