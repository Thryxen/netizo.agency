import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { localeNames, locales, useAlternates, useLocale } from '@/lib/i18n';
import { cn } from '@/lib/utils';

type LanguageSwitcherProps = {
    /** `button`: a ghost button (headers); `link`: a muted text link (footer). */
    variant?: 'button' | 'link';
    className?: string;
    /** Visibility of the short form, the code ("EN"); hidden by default. */
    codeClassName?: string;
    /** Visibility of the long form, the name ("English"); shown by default. */
    nameClassName?: string;
};

const linkClassName = cn(
    'inline-flex min-h-11 items-center gap-1.5 rounded-sm text-sm text-muted-foreground transition-colors hover:text-foreground md:min-h-0',
    'outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50',
);

/**
 * A globe and the other language, named in that language ("English" on the Polish site, "Polski" on the English one),
 * so a visitor recognises their own language. Where space is tight the name gives way to its code ("EN"); the
 * accessible name is always the full name. It links to the same page in the other language: a full page load on
 * purpose, so the head (title, hreflang), `<html lang>` and the cookie banner follow the language.
 */
export function LanguageSwitcher({ variant = 'button', className, codeClassName = 'hidden', nameClassName }: LanguageSwitcherProps) {
    const locale = useLocale();
    const alternates = useAlternates();
    const other = locales.find((candidate) => candidate !== locale) ?? locale;
    const href = alternates[other];

    if (!href) {
        return null;
    }

    const children = (
        <>
            <Globe aria-hidden="true" className="size-4" />
            <span className="sr-only">{localeNames[other]}</span>
            <span aria-hidden="true" className={cn('text-[0.8125rem] font-semibold tracking-[0.04em] uppercase', codeClassName)}>
                {other}
            </span>
            <span aria-hidden="true" className={nameClassName}>
                {localeNames[other]}
            </span>
        </>
    );

    if (variant === 'link') {
        return (
            <a href={href} hrefLang={other} lang={other} className={cn(linkClassName, className)}>
                {children}
            </a>
        );
    }

    return (
        <Button variant="ghost" asChild className={cn('gap-1.5 px-2.5 has-[>svg]:px-2.5', className)}>
            <a href={href} hrefLang={other} lang={other}>
                {children}
            </a>
        </Button>
    );
}
