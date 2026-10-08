import { arrayMove } from '@dnd-kit/sortable';
import { router } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';

import { useSelection } from '@/hooks/use-selection';

type Orderable = { id: number; isActive: boolean };

export type StatusFilter = 'all' | 'active' | 'inactive';

type Options<T extends Orderable> = {
    records: T[];
    reorderUrl: string;
    searchText: (record: T) => string;
};

/**
 * State of a short, fully loaded, manually ordered list (projects, clients): client-side search and status
 * filter, selection, and optimistic drag-and-drop ordering saved through the reorder endpoint.
 */
export function useRecordList<T extends Orderable>({ records, reorderUrl, searchText }: Options<T>) {
    const [rows, setRows] = useState(records);
    const [search, setSearchValue] = useState('');
    const [status, setStatusValue] = useState<StatusFilter>('all');
    const selection = useSelection();
    const { retain, clear } = selection;

    useEffect(() => {
        setRows(records);
        retain(records.map((record) => record.id));
    }, [records, retain]);

    // A bulk action only touches what the user sees, so changing the filters starts a new selection.
    const setSearch = (value: string): void => {
        setSearchValue(value);
        clear();
    };

    const setStatus = (value: StatusFilter): void => {
        setStatusValue(value);
        clear();
    };

    const visibleRows = useMemo(() => {
        const needle = search.trim().toLowerCase();

        return rows.filter((row) => {
            if (status === 'active' && !row.isActive) {
                return false;
            }

            if (status === 'inactive' && row.isActive) {
                return false;
            }

            return needle === '' || searchText(row).toLowerCase().includes(needle);
        });
    }, [rows, search, status, searchText]);

    const canReorder = search.trim() === '' && status === 'all';

    const move = (activeId: number | string, overId: number | string): void => {
        const from = rows.findIndex((row) => row.id === activeId);
        const to = rows.findIndex((row) => row.id === overId);

        if (from === -1 || to === -1 || from === to) {
            return;
        }

        const previous = rows;
        const next = arrayMove(rows, from, to);

        setRows(next);

        router.post(
            reorderUrl,
            { ids: next.map((row) => row.id) },
            { preserveScroll: true, preserveState: true, onError: () => setRows(previous) },
        );
    };

    return { rows, visibleRows, search, setSearch, status, setStatus, canReorder, move, selection };
}
