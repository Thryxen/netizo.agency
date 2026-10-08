import { ChevronDownIcon, ChevronUpIcon, ChevronsUpDownIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { TableHead } from '@/components/ui/table';
import type { LeadFilters } from '@/types/admin';

type SortHeaderProps = {
    column: string;
    label: string;
    filters: Pick<LeadFilters, 'sort' | 'direction'>;
    onSort: (column: string) => void;
};

export function SortHeader({ column, label, filters, onSort }: SortHeaderProps) {
    const active = filters.sort === column;
    const Icon = !active ? ChevronsUpDownIcon : filters.direction === 'asc' ? ChevronUpIcon : ChevronDownIcon;

    return (
        <TableHead aria-sort={active ? (filters.direction === 'asc' ? 'ascending' : 'descending') : 'none'}>
            <Button type="button" variant="ghost" size="sm" className="-ml-3" onClick={() => onSort(column)}>
                {label}
                <Icon className="opacity-70" />
            </Button>
        </TableHead>
    );
}
