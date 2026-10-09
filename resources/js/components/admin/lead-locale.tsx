import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { LeadLocale } from '@/types/admin';

const LABELS: Record<LeadLocale, string> = { pl: 'Polski', en: 'Angielski' };

/** "Polski" / "Angielski": the language of the site a lead came from (detail views). */
export function leadLocaleLabel(locale: LeadLocale): string {
    return LABELS[locale] ?? locale;
}

/**
 * A small muted "EN" next to a lead sent from the English site, so the reply goes out in English. Polish leads (the
 * usual case) get nothing.
 */
export function LeadLocaleBadge({ locale, className }: { locale: LeadLocale; className?: string }) {
    if (locale !== 'en') {
        return null;
    }

    return (
        <Badge variant="outline" title="Z angielskiej wersji strony" className={cn('ml-2 px-1.5 py-0 align-middle text-[0.625rem] font-medium tracking-wide text-muted-foreground', className)}>
            EN
            <span className="sr-only"> (z angielskiej wersji strony)</span>
        </Badge>
    );
}
