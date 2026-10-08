import { SearchIcon } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { StatusFilter } from '@/hooks/use-record-list';

type RecordToolbarProps = {
    search: string;
    onSearch: (value: string) => void;
    status: StatusFilter;
    onStatus: (value: StatusFilter) => void;
    searchLabel: string;
    canReorder: boolean;
};

/** Search and status filter of a fully loaded, manually ordered list; dragging is only available without filters. */
export function RecordToolbar({ search, onSearch, status, onStatus, searchLabel, canReorder }: RecordToolbarProps) {
    return (
        <div className="flex flex-wrap items-end gap-3">
            <div className="grid min-w-56 flex-1 gap-1.5">
                <Label htmlFor="record-search">{searchLabel}</Label>
                <div className="relative">
                    <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input id="record-search" type="search" className="pl-9" value={search} onChange={(event) => onSearch(event.target.value)} />
                </div>
            </div>
            <div className="grid gap-1.5">
                <Label htmlFor="record-status">Status</Label>
                <Select value={status} onValueChange={(value) => onStatus(value as StatusFilter)}>
                    <SelectTrigger id="record-status" className="w-44">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Wszystkie</SelectItem>
                        <SelectItem value="active">Aktywne</SelectItem>
                        <SelectItem value="inactive">Nieaktywne</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            {!canReorder ? <p className="basis-full text-sm text-muted-foreground">Przeciąganie działa, gdy nie ma wyszukiwania ani filtra.</p> : null}
        </div>
    );
}
