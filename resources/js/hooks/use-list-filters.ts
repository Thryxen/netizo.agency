import { router } from '@inertiajs/react';
import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Filters of a server-side list. The state is the source of truth after mount; every change reloads the list
 * through the query string (search is debounced), keeping the scroll position and replacing the history entry.
 */
export function useListFilters<T extends Record<string, string>>(path: string, initial: T) {
    const [values, setValues] = useState<T>(initial);
    const timer = useRef<number | undefined>(undefined);

    useEffect(() => () => window.clearTimeout(timer.current), []);

    const visit = useCallback(
        (next: T): void => {
            const query = Object.fromEntries(Object.entries(next).filter(([, value]) => value !== ''));

            router.get(path, query, { preserveState: true, preserveScroll: true, replace: true });
        },
        [path],
    );

    const update = useCallback(
        (patch: Partial<T>, debounce = false): void => {
            const next = { ...values, ...patch };

            setValues(next);
            window.clearTimeout(timer.current);

            if (debounce) {
                timer.current = window.setTimeout(() => visit(next), 300);

                return;
            }

            visit(next);
        },
        [values, visit],
    );

    /** Clicking the active column flips the direction; a new column starts ascending (dates start descending). */
    const toggleSort = useCallback(
        (column: string): void => {
            if (values.sort === column) {
                update({ direction: values.direction === 'asc' ? 'desc' : 'asc' } as unknown as Partial<T>);

                return;
            }

            update({ sort: column, direction: column === 'created_at' ? 'desc' : 'asc' } as unknown as Partial<T>);
        },
        [update, values.direction, values.sort],
    );

    return { values, update, toggleSort };
}
