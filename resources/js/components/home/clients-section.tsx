import { ArrowUpRightIcon } from 'lucide-react';
import { ExternalLink } from '@/components/home/external-link';
import { Pixel } from '@/components/home/pixel';
import { bleedClassName, gutterClassName, Rivet, Section, SectionHeading } from '@/components/home/section';
import { CountUp, Marquee } from '@/components/motion';
import { cn } from '@/lib/utils';
import type { Client } from '@/types/home';

/** Below this many clients a loop would show the same name side by side, so the static list stays. */
const MARQUEE_MIN_CLIENTS = 3;

/** Availability is quoted once, in the hero; these figures don't repeat it. */
const STATS = [
    { value: '30M+', label: 'zapytań miesięcznie obsługują nasze systemy' },
    { value: '250K+', label: 'linii kodu w produkcji' },
] as const;

/**
 * The heading band, then one bleed block rail to rail like the services grid: the client wordmarks, a bit before each
 * (a marquee band; the wrapped wordmark list under reduced motion, without JS and for fewer than three clients).
 * Type only, no images.
 *
 * The stats are one list placed by breakpoint: from lg in the heading band's right half (beside the H2), below lg a
 * row of shared-border cells under the wordmarks, flush to the next section's hairline. The section drops its bottom
 * padding so the band's last row meets that hairline.
 */
export function ClientsSection({ clients }: { clients: Client[] }) {
    const hasClients = clients.length > 0;
    const showsMarquee = clients.length >= MARQUEE_MIN_CLIENTS;

    return (
        <Section id="klienci" labelledBy="klienci-heading" containerClassName="pb-0 md:pb-0">
            <div className="flex flex-col lg:grid lg:grid-cols-12 lg:gap-x-16">
                <SectionHeading
                    id="klienci-heading"
                    title={hasClients ? 'Zaufali nam' : 'Nasze wdrożenia w liczbach'}
                    lead={hasClients ? 'Firmy, z którymi budujemy i rozwijamy produkty.' : undefined}
                    className="lg:col-span-6"
                />

                <ul
                    aria-label="Voxbit w liczbach"
                    className={cn(
                        'order-last grid grid-cols-2 gap-px border-t border-border bg-border',
                        bleedClassName,
                        'lg:order-none lg:col-span-6 lg:mx-0 lg:mb-16 lg:gap-x-10 lg:self-end lg:border-t-0 lg:bg-transparent',
                    )}
                >
                    {STATS.map((stat) => (
                        <li key={stat.value} className={cn('flex flex-col gap-3 bg-background py-8', gutterClassName, 'lg:bg-transparent lg:p-0')}>
                            <CountUp value={stat.value} className="font-pixel text-4xl leading-none md:text-5xl" />
                            <span className="leading-snug text-muted-foreground">{stat.label}</span>
                        </li>
                    ))}
                </ul>

                {hasClients && (
                    <div className={cn('relative border-t border-border lg:col-span-12', bleedClassName)}>
                        <Rivet side="left" />
                        <Rivet side="right" />
                        {showsMarquee ? (
                            <Marquee
                                duration={40}
                                fallback={<ClientList clients={clients} />}
                                className="bg-background [--marquee-gap:2rem] [--mask-fade:2rem] md:[--marquee-gap:3rem] md:[--mask-fade:3rem]"
                                rowClassName="py-10 md:py-14"
                            >
                                {/* Bit first, spaced like the static list (a bullet before its name, not a separator between names). */}
                                <ul className="flex items-center gap-[var(--marquee-gap)]">
                                    {clients.map((client) => (
                                        <li key={client.id} className="flex shrink-0 items-center gap-3 md:gap-4">
                                            <ClientBit />
                                            <ClientWordmark client={client} />
                                        </li>
                                    ))}
                                </ul>
                            </Marquee>
                        ) : (
                            <ClientList clients={clients} />
                        )}
                    </div>
                )}
            </div>
        </Section>
    );
}

function ClientBit() {
    return <Pixel size="md" className="bg-foreground/25" />;
}

/** A client name, large and semibold; links out (with an arrow) when the client has a site. */
function ClientWordmark({ client }: { client: Client }) {
    const name = <span className="text-2xl leading-none font-semibold tracking-tight whitespace-nowrap md:text-[2rem]">{client.name}</span>;

    if (!client.url) {
        return <span className="text-foreground/80">{name}</span>;
    }

    return (
        <ExternalLink
            href={client.url}
            className="group -my-2 inline-flex items-start gap-1 rounded-sm py-2 text-foreground/80 transition-colors hover:text-foreground focus-visible:text-foreground focus-visible:outline-2 focus-visible:outline-offset-4"
        >
            {name}
            <ArrowUpRightIcon aria-hidden="true" className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground md:size-5" />
        </ExternalLink>
    );
}

/** The static wordmarks in the band's gutter: one column on phones, two from sm (no lone name on a row), one row from xl. */
function ClientList({ clients }: { clients: Client[] }) {
    return (
        <ul
            className={cn(
                'grid grid-cols-1 gap-y-5 bg-background py-10 sm:grid-cols-[repeat(2,max-content)] sm:gap-x-12 md:gap-y-8 md:py-14 xl:flex xl:flex-wrap xl:items-center',
                gutterClassName,
            )}
        >
            {clients.map((client) => (
                <li key={client.id} className="flex min-w-0 items-center gap-3 md:gap-4">
                    <ClientBit />
                    <ClientWordmark client={client} />
                </li>
            ))}
        </ul>
    );
}
