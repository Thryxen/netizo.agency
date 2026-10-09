import { Menu, Phone, XIcon } from 'lucide-react';
import { type MouseEvent, type RefObject, useEffect, useRef, useState } from 'react';
import { ExternalLink } from '@/components/home/external-link';
import { useHomeUi } from '@/components/home/home-ui-context';
import { InfoLinkLabel } from '@/components/home/info-link-label';
import { LanguageSwitcher } from '@/components/home/language-switcher';
import { Logo } from '@/components/home/logo';
import { Container } from '@/components/home/section';
import { ThemeToggle } from '@/components/home/theme-toggle';
import { Button } from '@/components/ui/button';
import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { type Locale, type Localized, localized, useCopy } from '@/lib/i18n';
import { goToSection } from '@/lib/in-page-navigation';
import { type HomeSection, homeSections } from '@/lib/sections';
import { clientPanelUrl, contact, useInfoLinks } from '@/lib/site';
import { cn } from '@/lib/utils';

type NavSection = { id: string; label: string };

const COPY = localized({
    pl: {
        sections: {
            services: 'Usługi',
            projects: 'Projekty',
            mission: 'Misja',
            clients: 'Klienci',
            process: 'Proces',
            panel: 'Panel klienta',
            faq: 'FAQ',
            newsletter: 'Newsletter',
            contact: 'Kontakt',
        } satisfies Record<HomeSection, string>,
        home: 'Netizo – strona główna',
        sectionsNav: 'Sekcje strony',
        callback: 'Zamów rozmowę telefoniczną',
        clientPanel: 'Panel klienta',
        quote: 'Wyceń projekt',
        openMenu: 'Otwórz menu',
        menu: 'Menu',
        closeMenu: 'Zamknij menu',
        logIn: 'Zaloguj się do panelu',
    },
    en: {
        sections: {
            services: 'Services',
            projects: 'Projects',
            mission: 'Mission',
            clients: 'Clients',
            process: 'Process',
            panel: 'Client portal',
            faq: 'FAQ',
            newsletter: 'Newsletter',
            contact: 'Contact',
        },
        home: 'Netizo – home page',
        sectionsNav: 'Page sections',
        callback: 'Request a phone call',
        clientPanel: 'Client portal',
        quote: 'Get a quote',
        openMenu: 'Open menu',
        menu: 'Menu',
        closeMenu: 'Close menu',
        logIn: 'Log in to the portal',
    },
});

const SECTION_KEYS = Object.keys(homeSections.pl) as HomeSection[];
const DESKTOP_SECTION_KEYS: HomeSection[] = ['services', 'projects', 'process', 'faq', 'contact'];

const navSections = (locale: Locale, keys: HomeSection[]): NavSection[] =>
    keys.map((key) => ({ id: homeSections[locale][key], label: COPY[locale].sections[key] }));

/** Every anchored section in page order, and the ones in the desktop bar, in each language. */
const SECTIONS: Localized<NavSection[]> = { pl: navSections('pl', SECTION_KEYS), en: navSections('en', SECTION_KEYS) };
const DESKTOP_SECTIONS: Localized<NavSection[]> = { pl: navSections('pl', DESKTOP_SECTION_KEYS), en: navSections('en', DESKTOP_SECTION_KEYS) };

const focusRing = 'outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50';

const isScrolledToEnd = (): boolean => window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;

/**
 * Tracks which section sits at the top of the viewport, just under the sticky header.
 * The observed band starts 2px below the header so a section that has just scrolled past
 * (edge-adjacent counts as intersecting) does not stay active after an anchor jump.
 * At the very end of the page the last section wins: on tall viewports its top may never reach the band.
 */
function useActiveSection(headerRef: RefObject<HTMLElement | null>, sections: NavSection[]): string | null {
    const [activeId, setActiveId] = useState<string | null>(null);

    useEffect(() => {
        const lastSectionId = sections[sections.length - 1].id;
        if (typeof IntersectionObserver === 'undefined') {
            return;
        }

        const elements = sections.map(({ id }) => document.getElementById(id)).filter((element): element is HTMLElement => element !== null);
        const visible = new Map<string, boolean>();
        const headerHeight = headerRef.current?.offsetHeight ?? 64;

        const update = (): void => {
            setActiveId(isScrolledToEnd() ? lastSectionId : (sections.find(({ id }) => visible.get(id))?.id ?? null));
        };

        const observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    visible.set(entry.target.id, entry.isIntersecting);
                }

                update();
            },
            { rootMargin: `-${headerHeight + 2}px 0px -55% 0px`, threshold: 0 },
        );

        elements.forEach((element) => observer.observe(element));

        // The observer stays silent while no section crosses the band, so reaching the end needs its own check.
        let frame = 0;
        const handleScroll = (): void => {
            if (frame === 0) {
                frame = window.requestAnimationFrame(() => {
                    frame = 0;
                    update();
                });
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            observer.disconnect();
            window.removeEventListener('scroll', handleScroll);
            window.cancelAnimationFrame(frame);
        };
    }, [headerRef, sections]);

    return activeId;
}

export function SiteHeader() {
    const { openContact, openCallback } = useHomeUi();
    const copy = useCopy(COPY);
    const sections = useCopy(SECTIONS);
    const desktopSections = useCopy(DESKTOP_SECTIONS);
    const infoLinks = useInfoLinks();
    const headerRef = useRef<HTMLElement>(null);
    const activeId = useActiveSection(headerRef, sections);
    const [menuOpen, setMenuOpen] = useState(false);
    /**
     * Action to run once the sheet has fully closed. Radix releases the scroll lock on unmount and
     * then restores focus to the trigger in a timeout; running from onCloseAutoFocus (and preventing
     * that restore) is the one point where both scrolling and moving focus stick.
     */
    const afterCloseRef = useRef<(() => void) | null>(null);

    const closeMenuThen = (action: () => void): void => {
        afterCloseRef.current = action;
        setMenuOpen(false);
    };

    const handleSheetLinkClick = (event: MouseEvent<HTMLAnchorElement>, id: string): void => {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) {
            return;
        }

        event.preventDefault();
        closeMenuThen(() => goToSection(id));
    };

    return (
        <header ref={headerRef} className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-md supports-[backdrop-filter]:bg-background/85">
            <Container className="flex h-(--header-height) items-center gap-2">
                <a href="#" aria-label={copy.home} className={cn('-ml-1 inline-flex min-h-11 shrink-0 items-center rounded-sm p-1 lg:min-h-0', focusRing)}>
                    <Logo className="h-9 max-[359px]:h-7" />
                </a>

                <nav aria-label={copy.sectionsNav} className="ml-8 hidden lg:block xl:ml-12">
                    <ul className="flex items-center gap-1">
                        {desktopSections.map(({ id, label }) => {
                            const active = activeId === id;

                            return (
                                <li key={id}>
                                    <a
                                        href={`#${id}`}
                                        aria-current={active ? 'true' : undefined}
                                        className={cn(
                                            'inline-flex h-9 items-center rounded-md px-2.5 text-sm font-medium transition-colors',
                                            active ? 'text-foreground' : 'text-foreground/70 hover:text-foreground',
                                            focusRing,
                                        )}
                                    >
                                        {label}
                                    </a>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                <div className="ml-auto flex items-center gap-1 sm:gap-2">
                    <LanguageSwitcher className="max-lg:h-11" codeClassName="sm:hidden lg:inline xl:hidden" nameClassName="hidden sm:inline lg:hidden xl:inline" />
                    {/* Phones: the theme toggle moves into the menu, so the language switcher fits beside the logo. */}
                    <ThemeToggle className="hidden size-11 sm:inline-flex lg:size-9" />
                    <Button
                        variant="ghost"
                        size="icon"
                        className="size-11 lg:hidden"
                        aria-label={copy.callback}
                        onClick={(event) => openCallback(event.currentTarget)}
                    >
                        <Phone aria-hidden="true" />
                    </Button>
                    <Button variant="ghost" asChild className="hidden lg:inline-flex">
                        <ExternalLink href={clientPanelUrl} rel="noopener">
                            {copy.clientPanel}
                        </ExternalLink>
                    </Button>
                    <Button className="hidden sm:inline-flex max-lg:h-11" onClick={() => openContact('brief')}>
                        {copy.quote}
                    </Button>

                    <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="-mr-2.5 size-11 lg:hidden" aria-label={copy.openMenu}>
                                <Menu aria-hidden="true" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent
                            side="right"
                            showCloseButton={false}
                            aria-describedby={undefined}
                            className="w-[88%] gap-0 p-0 sm:max-w-sm"
                            onCloseAutoFocus={(event) => {
                                const action = afterCloseRef.current;

                                if (action) {
                                    event.preventDefault();
                                    afterCloseRef.current = null;
                                    action();
                                }
                            }}
                        >
                            <div className="flex h-(--header-height) shrink-0 items-center justify-between border-b border-border pr-2 pl-4">
                                <SheetTitle className="text-base">{copy.menu}</SheetTitle>
                                <SheetClose asChild>
                                    <Button variant="ghost" size="icon" className="size-11" aria-label={copy.closeMenu}>
                                        <XIcon aria-hidden="true" />
                                    </Button>
                                </SheetClose>
                            </div>

                            <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain">
                                <nav aria-label={copy.sectionsNav}>
                                    <ul className="divide-y divide-border border-b border-border">
                                        {sections.map(({ id, label }) => {
                                            const active = activeId === id;

                                            return (
                                                <li key={id}>
                                                    <a
                                                        href={`#${id}`}
                                                        aria-current={active ? 'true' : undefined}
                                                        onClick={(event) => handleSheetLinkClick(event, id)}
                                                        className={cn(
                                                            'flex items-center px-4 py-3.5 text-lg font-medium tracking-tight transition-colors hover:bg-accent focus-visible:bg-accent',
                                                            active ? 'text-foreground' : 'text-foreground/70 hover:text-foreground',
                                                            focusRing,
                                                            'focus-visible:ring-inset',
                                                        )}
                                                    >
                                                        {label}
                                                    </a>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </nav>

                                <ul className="flex flex-col px-2 py-3 text-sm">
                                    <li>
                                        <ExternalLink
                                            href={clientPanelUrl}
                                            rel="noopener"
                                            className={cn('flex h-11 items-center rounded-md px-2 text-muted-foreground hover:text-foreground', focusRing)}
                                        >
                                            {copy.logIn}
                                        </ExternalLink>
                                    </li>
                                    {infoLinks.map((link) => (
                                        <li key={link.href}>
                                            <a
                                                href={link.href}
                                                hrefLang={link.hrefLang}
                                                className={cn('flex h-11 items-center rounded-md px-2 text-muted-foreground hover:text-foreground', focusRing)}
                                            >
                                                <InfoLinkLabel link={link} />
                                            </a>
                                        </li>
                                    ))}
                                </ul>

                                <div className="mt-auto flex flex-col gap-1 border-t border-border px-4 pt-4 pb-2">
                                    <Button size="lg" className="h-11 w-full" onClick={() => closeMenuThen(() => openContact('brief'))}>
                                        {copy.quote}
                                    </Button>
                                    <div className="flex items-center justify-between gap-3">
                                        <a
                                            href={`mailto:${contact.email}`}
                                            className={cn('inline-flex min-h-11 items-center rounded-sm text-sm text-muted-foreground hover:text-foreground', focusRing)}
                                        >
                                            {contact.email}
                                        </a>
                                        <ThemeToggle className="-mr-2.5 size-11 sm:hidden" />
                                    </div>
                                </div>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </Container>
        </header>
    );
}
