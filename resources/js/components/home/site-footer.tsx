import { ExternalLink } from '@/components/home/external-link';
import { LogoMark } from '@/components/home/logo';
import { Container, Rivet } from '@/components/home/section';
import { clientPanelUrl, contact, infoLinks } from '@/lib/site';
import { cn } from '@/lib/utils';

/** Links are 44px tall touch targets below md; from md they collapse to the text line. */
const linkClass = cn(
    'inline-flex min-h-11 items-center rounded-sm text-muted-foreground transition-colors hover:text-foreground md:min-h-0',
    'outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50',
);

export function SiteFooter() {
    return (
        <footer className="border-t border-border">
            <Container className="py-14 md:py-16">
                <Rivet side="left" />
                <Rivet side="right" />
                <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8">
                    <div className="sm:col-span-2 lg:col-span-6">
                        <a href="#" aria-label="Voxbit – strona główna" className={cn(linkClass, '-ml-1 p-1 text-foreground')}>
                            <LogoMark className="h-10" />
                        </a>
                        <p className="mt-4 max-w-sm leading-relaxed text-pretty text-muted-foreground">
                            Strony WWW, aplikacje i systemy dla firm. Leszno, Wielkopolska – działamy w całej Polsce.
                        </p>
                    </div>

                    <nav aria-labelledby="footer-info-heading" className="lg:col-span-3">
                        <h2 id="footer-info-heading" className="text-sm font-medium">
                            Informacje
                        </h2>
                        <ul className="mt-2 flex flex-col text-sm md:mt-4 md:gap-3">
                            <li>
                                <ExternalLink href={clientPanelUrl} rel="noopener" className={linkClass}>
                                    Panel klienta
                                </ExternalLink>
                            </li>
                            {infoLinks.map(({ href, label }) => (
                                <li key={href}>
                                    <a href={href} className={linkClass}>
                                        {label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    <div className="lg:col-span-3">
                        <h2 className="text-sm font-medium">Kontakt</h2>
                        <ul className="mt-2 flex flex-col text-sm md:mt-4 md:gap-3">
                            <li>
                                <a href={`mailto:${contact.email}`} className={linkClass}>
                                    {contact.email}
                                </a>
                            </li>
                            <li>
                                <a href={contact.phone.href} className={cn(linkClass, 'whitespace-nowrap')}>
                                    {contact.phone.display}
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
            </Container>

            <div className="border-t border-border">
                <Container className="py-6">
                    <Rivet side="left" />
                    <Rivet side="right" />
                    {/* The SSR server and the browser may disagree on the year around New Year (or across time zones). */}
                    <p suppressHydrationWarning className="text-sm text-muted-foreground">
                        © {new Date().getFullYear()} Voxbit. Wszelkie prawa zastrzeżone.
                    </p>
                </Container>
            </div>
        </footer>
    );
}
