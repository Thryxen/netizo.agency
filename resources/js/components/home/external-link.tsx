import type { ComponentProps } from 'react';
import { localized, useCopy } from '@/lib/i18n';

const COPY = localized({
    pl: { newTab: ' (otwiera się w nowej karcie)' },
    en: { newTab: ' (opens in a new tab)' },
});

type ExternalLinkProps = Omit<ComponentProps<'a'>, 'target'> & { href: string };

/**
 * Link that opens in a new tab and tells screen-reader users so. `rel` defaults to "noopener noreferrer";
 * pass `rel="noopener"` where the destination should still see the referrer (our own client panel).
 */
export function ExternalLink({ rel = 'noopener noreferrer', children, ...props }: ExternalLinkProps) {
    const copy = useCopy(COPY);

    return (
        <a target="_blank" rel={rel} {...props}>
            {children}
            <span className="sr-only">{copy.newTab}</span>
        </a>
    );
}
