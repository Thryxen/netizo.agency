import { Phone } from 'lucide-react';
import { useHomeUi } from '@/components/home/home-ui-context';
import { Button } from '@/components/ui/button';
import { localized, useCopy } from '@/lib/i18n';
import { cn } from '@/lib/utils';

const COPY = localized({
    pl: { label: 'Zamów rozmowę telefoniczną' },
    en: { label: 'Request a phone call' },
});

/**
 * Floating square "bit" that opens the callback dialog. Sits below the cookie banner (z-index 45)
 * and the header (z-40), lifted above the banner while it shows (`--cookie-banner-height`, set by the
 * cookie-consent view); hidden while the dialog is open and refocused when it closes.
 * Desktop only: below lg the header's phone button is the callback trigger, so the FAB would be a
 * duplicate that permanently covers content in the narrow gutter. Below xl it hugs the viewport edge, so it stays
 * clear of the content column, which runs closer to the edge there.
 */
export function CallbackFab() {
    const { callbackOpen, openCallback } = useHomeUi();
    const copy = useCopy(COPY);

    return (
        <Button
            aria-label={copy.label}
            onClick={(event) => openCallback(event.currentTarget)}
            className={cn(
                'fixed right-[max(0.5rem,env(safe-area-inset-right))] bottom-[calc(max(1.25rem,env(safe-area-inset-bottom))_+_var(--cookie-banner-height,0px))] z-30 size-[52px] rounded-none p-0 ring-4 ring-background max-lg:hidden xl:right-[max(1.25rem,env(safe-area-inset-right))]',
                callbackOpen && 'hidden',
            )}
        >
            <Phone aria-hidden="true" className="size-5" />
        </Button>
    );
}
