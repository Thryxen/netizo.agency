import { type InfoLink } from '@/lib/site';

/**
 * Label of a footer/menu link; a link to a page that exists in Polish only (on the English site) gets a small "PL"
 * after the label, read out as "(in Polish)".
 */
export function InfoLinkLabel({ link }: { link: InfoLink }) {
    if (!link.hrefLang) {
        return link.label;
    }

    return (
        <>
            {link.label}
            <span aria-hidden="true" className="ml-1.5 font-mono text-[0.6875rem] tracking-[0.08em] text-muted-foreground/70 uppercase">
                {link.hrefLang}
            </span>
            <span className="sr-only"> (in Polish)</span>
        </>
    );
}
