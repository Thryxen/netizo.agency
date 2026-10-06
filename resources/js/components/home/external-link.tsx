import type { ComponentProps } from 'react';

type ExternalLinkProps = Omit<ComponentProps<'a'>, 'target'> & { href: string };

/**
 * Link that opens in a new tab and tells screen-reader users so. `rel` defaults to "noopener noreferrer";
 * pass `rel="noopener"` where the destination should still see the referrer (our own client panel).
 */
export function ExternalLink({ rel = 'noopener noreferrer', children, ...props }: ExternalLinkProps) {
    return (
        <a target="_blank" rel={rel} {...props}>
            {children}
            <span className="sr-only"> (otwiera się w nowej karcie)</span>
        </a>
    );
}
