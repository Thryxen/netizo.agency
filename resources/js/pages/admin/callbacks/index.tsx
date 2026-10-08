import { router } from '@inertiajs/react';
import { Trash2Icon } from 'lucide-react';
import { useEffect, useState } from 'react';

import { AdminLayout } from '@/components/admin/admin-layout';
import { BulkBar } from '@/components/admin/bulk-bar';
import { ConfirmDeleteDialog } from '@/components/admin/confirm-delete-dialog';
import { CopyButton } from '@/components/admin/detail';
import { ListToolbar } from '@/components/admin/list-toolbar';
import { Pagination } from '@/components/admin/pagination';
import { SortHeader } from '@/components/admin/sort-header';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useListFilters } from '@/hooks/use-list-filters';
import { useSelection } from '@/hooks/use-selection';
import { adminRoutes } from '@/lib/admin-routes';
import type { AdminCallbackRow, LeadFilters, Paginated } from '@/types/admin';

type Props = { callbacks: Paginated<AdminCallbackRow>; filters: LeadFilters };

export default function CallbacksIndex({ callbacks, filters }: Props) {
    const { values, update, toggleSort } = useListFilters<LeadFilters>(adminRoutes.callbacks.index, filters);
    const { selected, toggle, toggleAll, clear } = useSelection();
    const [deleting, setDeleting] = useState<AdminCallbackRow | null>(null);
    const [bulkOpen, setBulkOpen] = useState(false);
    const [processing, setProcessing] = useState(false);

    useEffect(clear, [callbacks.data, clear]);

    const rowIds = callbacks.data.map((callback) => callback.id);
    const allSelected = rowIds.length > 0 && rowIds.every((id) => selected.includes(id));
    const someSelected = rowIds.some((id) => selected.includes(id));
    const hasActiveFilters = values.search !== '' || values.from !== '' || values.until !== '';

    const deleteOne = (): void => {
        if (!deleting) {
            return;
        }

        router.delete(adminRoutes.callbacks.destroy(deleting.id), {
            preserveScroll: true,
            onStart: () => setProcessing(true),
            onFinish: () => {
                setProcessing(false);
                setDeleting(null);
            },
        });
    };

    const deleteSelected = (): void => {
        router.delete(adminRoutes.callbacks.index, {
            data: { ids: selected },
            preserveScroll: true,
            onStart: () => setProcessing(true),
            onSuccess: clear,
            onFinish: () => {
                setProcessing(false);
                setBulkOpen(false);
            },
        });
    };

    return (
        <AdminLayout title="Prośby o kontakt">
            <ListToolbar
                values={values}
                onChange={update}
                searchLabel="Szukaj numeru"
                hasActiveFilters={hasActiveFilters}
                onReset={() => update({ search: '', from: '', until: '' })}
            />

            <BulkBar count={selected.length} onDelete={() => setBulkOpen(true)} />

            <div className="overflow-x-auto rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-10">
                                <Checkbox
                                    aria-label="Zaznacz wszystkie prośby na stronie"
                                    checked={allSelected ? true : someSelected ? 'indeterminate' : false}
                                    onCheckedChange={() => toggleAll(rowIds)}
                                />
                            </TableHead>
                            <SortHeader column="phone" label="Numer telefonu" filters={values} onSort={toggleSort} />
                            <SortHeader column="created_at" label="Data zgłoszenia" filters={values} onSort={toggleSort} />
                            <TableHead className="w-16" />
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {callbacks.data.map((callback) => (
                            <TableRow key={callback.id}>
                                <TableCell>
                                    <Checkbox
                                        aria-label={`Zaznacz: ${callback.phone}`}
                                        checked={selected.includes(callback.id)}
                                        onCheckedChange={() => toggle(callback.id)}
                                    />
                                </TableCell>
                                <TableCell>
                                    <span className="inline-flex items-center gap-1">
                                        <a href={`tel:${callback.phone.replace(/\s+/g, '')}`} className="font-medium hover:underline">
                                            {callback.phone}
                                        </a>
                                        <CopyButton value={callback.phone} label="numer telefonu" />
                                    </span>
                                </TableCell>
                                <TableCell className="whitespace-nowrap text-muted-foreground">{callback.createdAt}</TableCell>
                                <TableCell>
                                    <div className="flex justify-end">
                                        <Button type="button" variant="ghost" size="icon-sm" aria-label={`Usuń: ${callback.phone}`} onClick={() => setDeleting(callback)}>
                                            <Trash2Icon />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                        {callbacks.data.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                    Brak próśb o kontakt do wyświetlenia.
                                </TableCell>
                            </TableRow>
                        ) : null}
                    </TableBody>
                </Table>
            </div>

            <Pagination paginator={callbacks} />

            <ConfirmDeleteDialog
                open={deleting !== null}
                onOpenChange={(open) => !open && setDeleting(null)}
                title="Usunąć prośbę o kontakt?"
                description={deleting ? `Prośba o kontakt z numeru ${deleting.phone} zostanie usunięta. Tej operacji nie można cofnąć.` : ''}
                onConfirm={deleteOne}
                processing={processing}
            />
            <ConfirmDeleteDialog
                open={bulkOpen}
                onOpenChange={setBulkOpen}
                title="Usunąć zaznaczone prośby o kontakt?"
                description={`Zostanie usuniętych próśb o kontakt: ${selected.length}. Tej operacji nie można cofnąć.`}
                onConfirm={deleteSelected}
                processing={processing}
            />
        </AdminLayout>
    );
}
