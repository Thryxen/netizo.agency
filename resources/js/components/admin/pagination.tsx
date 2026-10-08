import { Link } from '@inertiajs/react';

import { Button } from '@/components/ui/button';
import type { Paginated } from '@/types/admin';

/** Laravel paginator links: the first entry is "previous", the last "next", the rest are pages or an ellipsis. */
export function Pagination({ paginator }: { paginator: Paginated<unknown> }) {
    if (paginator.total === 0) {
        return null;
    }

    const previous = paginator.links[0];
    const next = paginator.links[paginator.links.length - 1];
    const pages = paginator.links.slice(1, -1);

    return (
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
            <span>
                {paginator.from}–{paginator.to} z {paginator.total}
            </span>
            {paginator.last_page > 1 ? (
                <nav className="flex items-center gap-1" aria-label="Paginacja">
                    {previous?.url ? (
                        <Button asChild variant="outline" size="sm">
                            <Link href={previous.url} preserveScroll>
                                Poprzednia
                            </Link>
                        </Button>
                    ) : (
                        <Button variant="outline" size="sm" disabled>
                            Poprzednia
                        </Button>
                    )}
                    {pages.map((page, index) =>
                        page.url ? (
                            <Button key={`${page.label}-${index}`} asChild variant={page.active ? 'default' : 'outline'} size="sm">
                                <Link href={page.url} preserveScroll aria-current={page.active ? 'page' : undefined}>
                                    {page.label}
                                </Link>
                            </Button>
                        ) : (
                            <span key={`${page.label}-${index}`} className="px-2">
                                …
                            </span>
                        ),
                    )}
                    {next?.url ? (
                        <Button asChild variant="outline" size="sm">
                            <Link href={next.url} preserveScroll>
                                Następna
                            </Link>
                        </Button>
                    ) : (
                        <Button variant="outline" size="sm" disabled>
                            Następna
                        </Button>
                    )}
                </nav>
            ) : null}
        </div>
    );
}
