import { ArrowUpRightIcon, CalendarCheck, FileCheck2, type LucideIcon, Trees, Users } from 'lucide-react';
import { ExternalLink } from '@/components/home/external-link';
import { Pixel } from '@/components/home/pixel';
import { photo, type PhotoName } from '@/lib/photos';
import { cn } from '@/lib/utils';
import type { Client } from '@/types/home';
import { ChipIcon, SceneChip, sceneProps, useSceneArrival } from './scene-parts';

type ClientWorld = {
    /** Matched against the client's site host and name (lower case). */
    key: string;
    photo: PhotoName;
    /** Crop of the square photo, e.g. `object-[50%_40%]`. */
    position?: string;
    /** The one live chip: what the client's product does (verified against the project data). */
    icon: LucideIcon;
    title: string;
    detail: string;
};

/**
 * The worlds of the real clients: TreePro (tree felling, a lead form), Vetly (online vet bookings), KrainaMT2 (the
 * Metin2 community portal, "7K+ społeczność Discord") and leasing od ręki (leasing for vehicles up to 3,5 t, an
 * application form).
 */
const WORLDS: ClientWorld[] = [
    { key: 'treepro', photo: 'world-trees', icon: Trees, title: 'Nowe zapytanie o wycinkę', detail: 'Formularz kontaktowy' },
    { key: 'vetly', photo: 'world-pets', position: 'object-[40%_50%]', icon: CalendarCheck, title: 'Wizyta umówiona w 30 s', detail: 'Rezerwacja online' },
    { key: 'krainamt2', photo: 'world-gaming', icon: Users, title: '7K+ osób na Discordzie', detail: 'Społeczność portalu' },
    { key: 'leasingodreki', photo: 'world-cars', position: 'object-[45%_50%]', icon: FileCheck2, title: 'Wniosek wysłany', detail: 'Leasing, auto do 3,5 t' },
];

function hostOf(url: string | null): string {
    if (!url) {
        return '';
    }

    try {
        return new URL(url).hostname.replace(/^www\./, '');
    } catch {
        return url.toLowerCase();
    }
}

/** The client's world by its site host, then by its name; none for a client we have no photo for. */
export function clientWorld(client: Client): ClientWorld | undefined {
    const candidates = [hostOf(client.url), client.name.toLowerCase()];

    return WORLDS.find(({ key }) => candidates.some((candidate) => candidate.includes(key)));
}

/** The chip arrives once, on the card's first view; the delay grows per card, so the chips on a row arrive in turn. */
const ARRIVE_MS = 300;
const ARRIVE_STAGGER_MS = 250;

type ClientCardProps = {
    client: Client;
    /** Position in the set: staggers the chip. */
    index: number;
    className?: string;
};

/**
 * A client in the Klienci band: a photo of the client's world with one live chip from its product, and the wordmark
 * on a solid band below (a link out, with an arrow, when the client has a site). A client without a photo gets a
 * plain card. The marquee is the motion: the photo is a plain image (a pixel reveal would sit unresolved at the band's
 * edge) and the chip slides in once, on the card's first view, then stays.
 */
export function ClientCard({ client, index, className }: ClientCardProps) {
    const world = clientWorld(client);
    const image = world ? photo(world.photo) : undefined;
    const { ref, shown, active } = useSceneArrival<HTMLDivElement>(ARRIVE_MS + index * ARRIVE_STAGGER_MS);

    /** Narrow cards (the static grid on phones and at lg): a smaller wordmark, and the chip drops its icon and detail. */
    const name = (
        <span className="min-w-0 truncate text-sm leading-none font-semibold tracking-tight @min-[15rem]/card:text-lg @min-[19rem]/card:text-xl">
            {client.name}
        </span>
    );
    const cardClassName = cn('@container/card group/card flex flex-col overflow-hidden border bg-background', className);

    const picture = (
        <div ref={ref} {...sceneProps(active)} className="relative aspect-square overflow-hidden border-b bg-muted">
            {world && image ? (
                <>
                    <img
                        src={image.src}
                        srcSet={image.srcSet}
                        width={image.width}
                        height={image.height}
                        data-photo=""
                        sizes="(min-width: 768px) 312px, 288px"
                        alt=""
                        loading="lazy"
                        decoding="async"
                        draggable={false}
                        className={cn('absolute inset-0 size-full object-cover', world.position)}
                    />
                    <SceneChip
                        show={shown}
                        from="above"
                        leading={<ChipIcon icon={world.icon} className="hidden @min-[15rem]/card:flex" />}
                        title={<span className="whitespace-normal @min-[15rem]/card:whitespace-nowrap">{world.title}</span>}
                        detail={<span className="hidden @min-[15rem]/card:inline">{world.detail}</span>}
                        className="absolute top-2 left-2 max-w-[calc(100%-1rem)] p-2 @min-[15rem]/card:top-3 @min-[15rem]/card:left-3 @min-[15rem]/card:max-w-[calc(100%-1.5rem)] @min-[15rem]/card:p-2.5 @min-[15rem]/card:pr-3"
                    />
                </>
            ) : (
                <span className="absolute inset-0 flex items-center justify-center">
                    <Pixel size="lg" className="bg-foreground/25" />
                </span>
            )}
        </div>
    );

    const band = 'flex h-12 items-center gap-3 px-3 text-foreground/80 @min-[15rem]/card:h-16 @min-[15rem]/card:px-4';

    if (!client.url) {
        return (
            <div className={cardClassName}>
                {picture}
                <span className={band}>{name}</span>
            </div>
        );
    }

    return (
        <ExternalLink href={client.url} className={cn(cardClassName, 'outline-offset-2 focus-visible:outline-2')}>
            {picture}
            <span className={cn(band, 'justify-between transition-colors group-hover/card:text-foreground')}>
                {name}
                <ArrowUpRightIcon
                    aria-hidden="true"
                    className="size-4 shrink-0 text-muted-foreground transition-colors group-hover/card:text-foreground @min-[19rem]/card:size-5"
                />
            </span>
        </ExternalLink>
    );
}
