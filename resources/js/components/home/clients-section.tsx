import { ClientCard } from '@/components/home/scenes/client-card';
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

/**
 * The heading band, then one bleed block rail to rail like the services grid: the client cards (a marquee band; the
 * card grid under reduced motion, without JS and for fewer than three clients). Each card is a photo of the client's
 * world carrying one live chip from its product (spec v7).
 *
 * The stats are one list placed by breakpoint: from lg in the heading band's right half (beside the H2), below lg a
 * row of shared-border cells under the cards, flush to the next section's hairline. The section drops its bottom
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
                    className="lg:col-span-7"
                />

                <ul
                    aria-label="Voxbit w liczbach"
                    className={cn(
                        'order-last grid grid-cols-2 gap-px border-t border-border bg-border',
                        bleedClassName,
                        'lg:order-none lg:col-span-5 lg:mx-0 lg:mb-16 lg:gap-x-10 lg:self-end lg:border-t-0 lg:bg-transparent',
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
                                duration={44}
                                fallback={<ClientGrid clients={clients} />}
                                className="bg-background [--marquee-gap:1rem] [--mask-fade:1.5rem] md:[--marquee-gap:1.5rem] md:[--mask-fade:2.5rem]"
                                rowClassName="items-stretch py-8 md:py-10"
                            >
                                <ul className="flex items-stretch gap-[var(--marquee-gap)]">
                                    {clients.map((client, index) => (
                                        <li key={client.id} className="flex w-[18rem] shrink-0 md:w-[19.5rem]">
                                            <ClientCard client={client} index={index} className="w-full" />
                                        </li>
                                    ))}
                                </ul>
                            </Marquee>
                        ) : (
                            <ClientGrid clients={clients} />
                        )}
                    </div>
                )}
            </div>
        </Section>
    );
}

/** The static card grid: 2 columns below lg, 4 from lg, in the band's gutter. */
function ClientGrid({ clients }: { clients: Client[] }) {
    return (
        <ul className={cn('grid grid-cols-2 gap-3 bg-background py-8 sm:gap-4 md:py-10 lg:grid-cols-4', gutterClassName)}>
            {clients.map((client, index) => (
                <li key={client.id} className="flex min-w-0">
                    <ClientCard client={client} index={index} className="w-full" />
                </li>
            ))}
        </ul>
    );
}
