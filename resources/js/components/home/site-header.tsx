import { Menu, Phone, XIcon } from 'lucide-react';
import { type MouseEvent, type RefObject, useEffect, useRef, useState } from 'react';
import { ExternalLink } from '@/components/home/external-link';
import { useHomeUi } from '@/components/home/home-ui-context';
import { Logo } from '@/components/home/logo';
import { Container } from '@/components/home/section';
import { ThemeToggle } from '@/components/home/theme-toggle';
import { Button } from '@/components/ui/button';
import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { goToSection } from '@/lib/in-page-navigation';
import { clientPanelUrl, contact, infoLinks } from '@/lib/site';
import { cn } from '@/lib/utils';

type NavSection = { id: string; label: string };

/** Every anchored section, in page order. */
const SECTIONS: NavSection[] = [
    { id: 'uslugi', label: 'Usługi' },
    { id: 'projekty', label: 'Projekty' },
    { id: 'misja', label: 'Misja' },
    { id: 'klienci', label: 'Klienci' },
    { id: 'proces', label: 'Proces' },
    { id: 'panel', label: 'Panel klienta' },
    { id: 'faq', label: 'FAQ' },
    { id: 'newsletter', label: 'Newsletter' },
    { id: 'kontakt', label: 'Kontakt' },
];

const DESKTOP_SECTION_IDS = new Set(['uslugi', 'projekty', 'proces', 'faq', 'kontakt']);
const DESKTOP_SECTIONS = SECTIONS.filter(({ id }) => DESKTOP_SECTION_IDS.has(id));

const LAST_SECTION_ID = SECTIONS[SECTIONS.length - 1].id;

const focusRing = 'outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50';

const isScrolledToEnd = (): boolean => window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;

/**
 * Tracks which section sits at the top of the viewport, just under the sticky header.
 * The observed band starts 2px below the header so a section that has just scrolled past
 * (edge-adjacent counts as intersecting) does not stay active after an anchor jump.
 * At the very end of the page the last section wins: on tall viewports its top may never reach the band.
 */
function useActiveSection(headerRef: RefObject<HTMLElement | null>): string | null {
    const [activeId, setActiveId] = useState<string | null>(null);

    useEffect(() => {
        if (typeof IntersectionObserver === 'undefined') {
            return;
        }

        const elements = SECTIONS.map(({ id }) => document.getElementById(id)).filter((element): element is HTMLElement => element !== null);
        const visible = new Map<string, boolean>();
        const headerHeight = headerRef.current?.offsetHeight ?? 64;

        const update = (): void => {
            setActiveId(isScrolledToEnd() ? LAST_SECTION_ID : (SECTIONS.find(({ id }) => visible.get(id))?.id ?? null));
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
    }, [headerRef]);

    return activeId;
}

export function SiteHeader() {
    const { openContact, openCallback } = useHomeUi();
    const headerRef = useRef<HTMLElement>(null);
    const activeId = useActiveSection(headerRef);
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
                <a href="#" aria-label="Netizo – strona główna" className={cn('-ml-1 inline-flex min-h-11 shrink-0 items-center rounded-sm p-1 lg:min-h-0', focusRing)}>
                    <Logo className="h-9" />
                </a>

                <nav aria-label="Sekcje strony" className="ml-8 hidden lg:block xl:ml-12">
                    <ul className="flex items-center gap-1">
                        {DESKTOP_SECTIONS.map(({ id, label }) => {
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
                    <ThemeToggle className="size-11 lg:size-9" />
                    <Button
                        variant="ghost"
                        size="icon"
                        className="size-11 lg:hidden"
                        aria-label="Zamów rozmowę telefoniczną"
                        onClick={(event) => openCallback(event.currentTarget)}
                    >
                        <Phone aria-hidden="true" />
                    </Button>
                    <Button variant="ghost" asChild className="hidden lg:inline-flex">
                        <ExternalLink href={clientPanelUrl} rel="noopener">
                            Panel klienta
                        </ExternalLink>
                    </Button>
                    <Button className="hidden sm:inline-flex max-lg:h-11" onClick={() => openContact('brief')}>
                        Wyceń projekt
                    </Button>

                    <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="-mr-2.5 size-11 lg:hidden" aria-label="Otwórz menu">
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
                                <SheetTitle className="text-base">Menu</SheetTitle>
                                <SheetClose asChild>
                                    <Button variant="ghost" size="icon" className="size-11" aria-label="Zamknij menu">
                                        <XIcon aria-hidden="true" />
                                    </Button>
                                </SheetClose>
                            </div>

                            <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain">
                                <nav aria-label="Sekcje strony">
                                    <ul className="divide-y divide-border border-b border-border">
                                        {SECTIONS.map(({ id, label }) => {
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
                                            Zaloguj się do panelu
                                        </ExternalLink>
                                    </li>
                                    {infoLinks.map(({ href, label }) => (
                                        <li key={href}>
                                            <a
                                                href={href}
                                                className={cn('flex h-11 items-center rounded-md px-2 text-muted-foreground hover:text-foreground', focusRing)}
                                            >
                                                {label}
                                            </a>
                                        </li>
                                    ))}
                                </ul>

                                <div className="mt-auto flex flex-col gap-1 border-t border-border px-4 pt-4 pb-2">
                                    <Button size="lg" className="h-11 w-full" onClick={() => closeMenuThen(() => openContact('brief'))}>
                                        Wyceń projekt
                                    </Button>
                                    <a
                                        href={`mailto:${contact.email}`}
                                        className={cn('inline-flex min-h-11 items-center self-start rounded-sm text-sm text-muted-foreground hover:text-foreground', focusRing)}
                                    >
                                        {contact.email}
                                    </a>
                                </div>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </Container>
        </header>
    );
}
