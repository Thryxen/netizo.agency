import { LanguageSwitcher } from '@/components/home/language-switcher';
import { Logo } from '@/components/home/logo';
import { Container } from '@/components/home/section';
import { ThemeToggle } from '@/components/home/theme-toggle';
import { Button } from '@/components/ui/button';
import { localized, useCopy } from '@/lib/i18n';
import { type PartnerSection, usePartnerSections } from '@/lib/sections';
import { usePageUrls } from '@/lib/site';
import { cn } from '@/lib/utils';

const COPY = localized({
    pl: {
        home: 'Netizo – strona główna',
        pageName: 'Program partnerski',
        sectionsNav: 'Sekcje strony',
        sections: [
            { key: 'howItWorks', label: 'Jak to działa' },
            { key: 'calculator', label: 'Kalkulator' },
            { key: 'rules', label: 'Zasady' },
            { key: 'faq', label: 'FAQ' },
        ] as { key: PartnerSection; label: string }[],
        joinShort: 'Dołącz',
        join: 'Dołącz do programu',
    },
    en: {
        home: 'Netizo – home page',
        pageName: 'Partner program',
        sectionsNav: 'Page sections',
        sections: [
            { key: 'howItWorks', label: 'How it works' },
            { key: 'calculator', label: 'Calculator' },
            { key: 'rules', label: 'Terms' },
            { key: 'faq', label: 'FAQ' },
        ],
        joinShort: 'Join',
        join: 'Join the program',
    },
});

const focusRing = 'outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50';

/**
 * Header of the partner programme page: the logo leads back to the home page, the page's name sits beside it, and
 * the section links (lg+) and the join button stay on this page ("Dołącz" has the button, so it is not in the links).
 */
export function PartnerHeader() {
    const copy = useCopy(COPY);
    const sectionIds = usePartnerSections();
    const pageUrls = usePageUrls();

    return (
        <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-md supports-[backdrop-filter]:bg-background/85">
            <Container className="flex h-(--header-height) items-center gap-2">
                <a href={pageUrls.home} aria-label={copy.home} className={cn('-ml-1 inline-flex min-h-11 shrink-0 items-center rounded-sm p-1 lg:min-h-0', focusRing)}>
                    <Logo className="h-9 max-[359px]:h-7" />
                </a>
                <span className="ml-2 hidden border-l border-border pl-4 text-sm font-medium text-muted-foreground sm:inline">{copy.pageName}</span>

                <nav aria-label={copy.sectionsNav} className="ml-8 hidden lg:block xl:ml-10">
                    <ul className="flex items-center gap-1">
                        {copy.sections.map(({ key, label }) => (
                            <li key={key}>
                                <a
                                    href={`#${sectionIds[key]}`}
                                    className={cn('inline-flex h-9 items-center rounded-md px-2.5 text-sm font-medium text-foreground/70 transition-colors hover:text-foreground', focusRing)}
                                >
                                    {label}
                                </a>
                            </li>
                        ))}
                    </ul>
                </nav>

                <div className="ml-auto flex items-center gap-1 sm:gap-2">
                    <LanguageSwitcher className="max-lg:h-11" codeClassName="md:hidden lg:inline xl:hidden" nameClassName="hidden md:inline lg:hidden xl:inline" />
                    {/* Phones: no room beside the language switcher and the join button (the choice made on the home page sticks). */}
                    <ThemeToggle className="hidden size-11 sm:inline-flex lg:size-9" />
                    <Button asChild className="max-lg:h-11">
                        <a href={`#${sectionIds.join}`}>
                            <span className="sm:hidden">{copy.joinShort}</span>
                            <span className="hidden sm:inline">{copy.join}</span>
                        </a>
                    </Button>
                </div>
            </Container>
        </header>
    );
}
