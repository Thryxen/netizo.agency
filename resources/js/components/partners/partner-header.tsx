import { Logo } from '@/components/home/logo';
import { Container } from '@/components/home/section';
import { ThemeToggle } from '@/components/home/theme-toggle';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/** The page's own sections; "Dołącz" has the button. */
const SECTIONS = [
    { id: 'jak-to-dziala', label: 'Jak to działa' },
    { id: 'kalkulator', label: 'Kalkulator' },
    { id: 'zasady', label: 'Zasady' },
    { id: 'faq', label: 'FAQ' },
];

const focusRing = 'outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50';

/**
 * Header of the partner programme page: the logo leads back to the home page, the page's name sits beside it, and
 * the section links (lg+) and the join button stay on this page.
 */
export function PartnerHeader() {
    return (
        <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-md supports-[backdrop-filter]:bg-background/85">
            <Container className="flex h-(--header-height) items-center gap-2">
                <a href="/" aria-label="Netizo – strona główna" className={cn('-ml-1 inline-flex min-h-11 shrink-0 items-center rounded-sm p-1 lg:min-h-0', focusRing)}>
                    <Logo className="h-9" />
                </a>
                <span className="ml-2 hidden border-l border-border pl-4 text-sm font-medium text-muted-foreground sm:inline">Program partnerski</span>

                <nav aria-label="Sekcje strony" className="ml-8 hidden lg:block xl:ml-10">
                    <ul className="flex items-center gap-1">
                        {SECTIONS.map(({ id, label }) => (
                            <li key={id}>
                                <a
                                    href={`#${id}`}
                                    className={cn('inline-flex h-9 items-center rounded-md px-2.5 text-sm font-medium text-foreground/70 transition-colors hover:text-foreground', focusRing)}
                                >
                                    {label}
                                </a>
                            </li>
                        ))}
                    </ul>
                </nav>

                <div className="ml-auto flex items-center gap-1 sm:gap-2">
                    <ThemeToggle className="size-11 lg:size-9" />
                    <Button asChild className="max-lg:h-11">
                        <a href="#dolacz">
                            <span className="sm:hidden">Dołącz</span>
                            <span className="hidden sm:inline">Dołącz do programu</span>
                        </a>
                    </Button>
                </div>
            </Container>
        </header>
    );
}
