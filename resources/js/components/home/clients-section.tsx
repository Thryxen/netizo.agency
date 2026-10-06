import { ArrowUpRightIcon } from 'lucide-react';
import { ExternalLink } from '@/components/home/external-link';
import { Pixel } from '@/components/home/pixel';
import { bleedClassName, gutterClassName, Rivet, Section, SectionHeading } from '@/components/home/section';
import { CountUp, Marquee } from '@/components/motion';
import { cn } from '@/lib/utils';
import type { Client } from '@/types/home';

/** Below this many clients a loop would show the same name side by side, so the static grid stays. */
const MARQUEE_MIN_CLIENTS = 3;

/** Availability is quoted once, in the hero; these figures don't repeat it. */
const STATS = [
    { value: '30M+', label: 'zapytań miesięcznie obsługują nasze systemy' },
    { value: '250K+', label: 'linii kodu w produkcji' },
] as const;

const cellClassName = cn('flex h-full min-h-28 items-end bg-background py-6 md:min-h-36 lg:py-8', gutterClassName);

/**
 * Empty cells that complete the last row of the client grid (2 columns below lg, 4 from lg),
 * so the 1px gaps over bg-border never leave a grey hole.
 */
function fillerCount(count: number, columns: number): number {
    return (columns - (count % columns)) % columns;
}

/**
 * One bleed block, rail to rail like the services grid: the client wordmarks (a marquee band; the wordmark grid under
 * reduced motion, without JS and for fewer than three clients), then the stats row. The section drops its bottom
 * padding so the block's last row meets the next section's hairline.
 */
export function ClientsSection({ clients }: { clients: Client[] }) {
    const hasClients = clients.length > 0;
    const showsMarquee = clients.length >= MARQUEE_MIN_CLIENTS;

    return (
        <Section id="klienci" labelledBy="klienci-heading" containerClassName="pb-0 md:pb-0">
            <SectionHeading
                id="klienci-heading"
                title={hasClients ? 'Zaufali nam' : 'Nasze wdrożenia w liczbach'}
                lead={hasClients ? 'Firmy, z którymi budujemy i rozwijamy produkty.' : undefined}
            />

            <div className={cn('relative border-t border-border', bleedClassName)}>
                <Rivet side="left" />
                <Rivet side="right" />
                <div className="grid gap-px bg-border">
                    {hasClients && !showsMarquee && <ClientGrid clients={clients} />}
                    {showsMarquee && (
                        <Marquee
                            duration={40}
                            fallback={<ClientGrid clients={clients} />}
                            className="bg-background [--marquee-gap:2rem] [--mask-fade:2rem] md:[--marquee-gap:3rem] md:[--mask-fade:3rem]"
                            rowClassName="py-10 md:py-14"
                        >
                            {/* Bit first: at the loop's start the first name clears the edge fade (gap + bit > --mask-fade). */}
                            <ul className="flex items-center gap-[var(--marquee-gap)]">
                                {clients.map((client) => (
                                    <li key={client.id} className="flex shrink-0 items-center gap-[var(--marquee-gap)]">
                                        <Pixel size="md" className="bg-foreground/25" />
                                        <ClientWordmark client={client} />
                                    </li>
                                ))}
                            </ul>
                        </Marquee>
                    )}

                    <ul aria-label="Voxbit w liczbach" className="grid grid-cols-2 gap-px">
                        {STATS.map((stat) => (
                            <li key={stat.value} className={cn('flex flex-col gap-3 bg-background py-8 lg:py-10', gutterClassName)}>
                                <CountUp value={stat.value} className="font-pixel text-4xl leading-none md:text-5xl" />
                                <span className="leading-snug text-muted-foreground">{stat.label}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </Section>
    );
}

/** A client name in the marquee band; links out (with an arrow) when the client has a site. */
function ClientWordmark({ client }: { client: Client }) {
    const name = <span className="text-[1.75rem] leading-none font-semibold tracking-tight whitespace-nowrap md:text-[2.75rem]">{client.name}</span>;

    if (!client.url) {
        return <span className="text-foreground/80">{name}</span>;
    }

    return (
        <ExternalLink
            href={client.url}
            className="group inline-flex items-start gap-1 rounded-sm text-foreground/80 transition-colors hover:text-foreground focus-visible:text-foreground focus-visible:outline-2 focus-visible:outline-offset-4"
        >
            {name}
            <ArrowUpRightIcon aria-hidden="true" className="size-4 text-muted-foreground transition-colors group-hover:text-foreground md:size-5" />
        </ExternalLink>
    );
}

/** The static wordmark grid: 2 columns below lg, 4 from lg, shared hairlines. */
function ClientGrid({ clients }: { clients: Client[] }) {
    const mobileFillers = fillerCount(clients.length, 2);
    const desktopFillers = fillerCount(clients.length, 4);

    return (
        <ul className="grid grid-cols-2 gap-px bg-border lg:grid-cols-4">
            {clients.map((client) => (
                <li key={client.id} className="min-w-0">
                    <ClientCell client={client} />
                </li>
            ))}
            {Array.from({ length: desktopFillers }, (_, index) => (
                <li key={`filler-${index}`} aria-hidden="true" className={cn('bg-background', index >= mobileFillers && 'hidden lg:block')} />
            ))}
        </ul>
    );
}

function ClientCell({ client }: { client: Client }) {
    const name = (
        <span className="min-w-0 text-[clamp(0.9375rem,4.1vw,1.25rem)] leading-tight font-semibold tracking-tight [overflow-wrap:anywhere] lg:text-xl xl:text-2xl">
            {client.name}
        </span>
    );

    if (!client.url) {
        return <div className={cellClassName}>{name}</div>;
    }

    return (
        <ExternalLink
            href={client.url}
            className={cn(cellClassName, 'group relative transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:-outline-offset-2')}
        >
            {name}
            <ArrowUpRightIcon
                aria-hidden="true"
                className="absolute top-4 right-4 size-4 text-muted-foreground transition-colors group-hover:text-foreground md:top-5 md:right-5"
            />
        </ExternalLink>
    );
}
