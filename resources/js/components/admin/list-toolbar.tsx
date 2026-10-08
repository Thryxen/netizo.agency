import { SearchIcon, XIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { LeadFilters } from '@/types/admin';

type ListToolbarProps = {
    values: LeadFilters;
    onChange: (patch: Partial<LeadFilters>, debounce?: boolean) => void;
    searchLabel: string;
    /** Extra filters shown after the date range (e.g. selects). */
    children?: ReactNode;
    onReset: () => void;
    hasActiveFilters: boolean;
};

export function ListToolbar({ values, onChange, searchLabel, children, onReset, hasActiveFilters }: ListToolbarProps) {
    return (
        <div className="flex flex-wrap items-end gap-3">
            <div className="grid min-w-56 flex-1 gap-1.5">
                <Label htmlFor="list-search">{searchLabel}</Label>
                <div className="relative">
                    <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        id="list-search"
                        type="search"
                        className="pl-9"
                        value={values.search}
                        onChange={(event) => onChange({ search: event.target.value }, true)}
                    />
                </div>
            </div>
            <div className="grid gap-1.5">
                <Label htmlFor="list-from">Od</Label>
                <Input id="list-from" type="date" value={values.from} max={values.until || undefined} onChange={(event) => onChange({ from: event.target.value })} />
            </div>
            <div className="grid gap-1.5">
                <Label htmlFor="list-until">Do</Label>
                <Input id="list-until" type="date" value={values.until} min={values.from || undefined} onChange={(event) => onChange({ until: event.target.value })} />
            </div>
            {children}
            {hasActiveFilters ? (
                <Button type="button" variant="ghost" onClick={onReset}>
                    <XIcon />
                    Wyczyść filtry
                </Button>
            ) : null}
        </div>
    );
}
