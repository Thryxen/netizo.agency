import { Link, router } from '@inertiajs/react';
import { PencilIcon, PlusIcon, Trash2Icon } from 'lucide-react';
import { useState } from 'react';

import { AdminLayout } from '@/components/admin/admin-layout';
import { BulkBar } from '@/components/admin/bulk-bar';
import { ConfirmDeleteDialog } from '@/components/admin/confirm-delete-dialog';
import { RecordToolbar } from '@/components/admin/record-toolbar';
import { SortableArea, SortableTableRow } from '@/components/admin/sortable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useRecordList } from '@/hooks/use-record-list';
import { adminRoutes } from '@/lib/admin-routes';
import type { AdminClient } from '@/types/admin';

const searchText = (client: AdminClient): string => `${client.name} ${client.url ?? ''}`;

export default function ClientsIndex({ clients }: { clients: AdminClient[] }) {
    const list = useRecordList({ records: clients, reorderUrl: adminRoutes.clients.reorder, searchText });
    const { selected, toggle, toggleAll, clear } = list.selection;
    const [deleting, setDeleting] = useState<AdminClient | null>(null);
    const [bulkOpen, setBulkOpen] = useState(false);
    const [processing, setProcessing] = useState(false);

    const rowIds = list.visibleRows.map((client) => client.id);
    const allSelected = rowIds.length > 0 && rowIds.every((id) => selected.includes(id));
    const someSelected = rowIds.some((id) => selected.includes(id));

    const deleteOne = (): void => {
        if (!deleting) {
            return;
        }

        router.delete(adminRoutes.clients.destroy(deleting.id), {
            preserveScroll: true,
            onStart: () => setProcessing(true),
            onFinish: () => {
                setProcessing(false);
                setDeleting(null);
            },
        });
    };

    const deleteSelected = (): void => {
        router.delete(adminRoutes.clients.index, {
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
        <AdminLayout
            title="Klienci"
            actions={
                <Button asChild>
                    <Link href={adminRoutes.clients.create}>
                        <PlusIcon />
                        Nowy klient
                    </Link>
                </Button>
            }
        >
            <RecordToolbar
                search={list.search}
                onSearch={list.setSearch}
                status={list.status}
                onStatus={list.setStatus}
                searchLabel="Szukaj klienta"
                canReorder={list.canReorder}
            />

            <BulkBar count={selected.length} onDelete={() => setBulkOpen(true)} />

            <div className="overflow-x-auto rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-10" />
                            <TableHead className="w-10">
                                <Checkbox
                                    aria-label="Zaznacz wszystkich klientów"
                                    checked={allSelected ? true : someSelected ? 'indeterminate' : false}
                                    onCheckedChange={() => toggleAll(rowIds)}
                                />
                            </TableHead>
                            <TableHead className="w-14">#</TableHead>
                            <TableHead>Nazwa</TableHead>
                            <TableHead>Link</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Aktualizacja</TableHead>
                            <TableHead className="w-24" />
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <SortableArea ids={rowIds} onMove={list.move}>
                            {list.visibleRows.map((client) => (
                                <SortableTableRow key={client.id} id={client.id} disabled={!list.canReorder}>
                                    <TableCell className="w-10">
                                        <Checkbox
                                            aria-label={`Zaznacz: ${client.name}`}
                                            checked={selected.includes(client.id)}
                                            onCheckedChange={() => toggle(client.id)}
                                        />
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">{client.sortOrder}</TableCell>
                                    <TableCell className="font-medium">
                                        <Link href={adminRoutes.clients.edit(client.id)} className="hover:underline">
                                            {client.name}
                                        </Link>
                                    </TableCell>
                                    <TableCell className="max-w-64 truncate text-muted-foreground">{client.url ?? 'Brak linku'}</TableCell>
                                    <TableCell>
                                        <Badge variant={client.isActive ? 'secondary' : 'outline'}>{client.isActive ? 'Aktywny' : 'Nieaktywny'}</Badge>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">{client.updatedAt}</TableCell>
                                    <TableCell>
                                        <div className="flex justify-end gap-1">
                                            <Button asChild variant="ghost" size="icon-sm">
                                                <Link href={adminRoutes.clients.edit(client.id)} aria-label={`Edytuj: ${client.name}`}>
                                                    <PencilIcon />
                                                </Link>
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon-sm"
                                                aria-label={`Usuń: ${client.name}`}
                                                onClick={() => setDeleting(client)}
                                            >
                                                <Trash2Icon />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </SortableTableRow>
                            ))}
                        </SortableArea>
                        {list.visibleRows.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                                    Brak klientów do wyświetlenia.
                                </TableCell>
                            </TableRow>
                        ) : null}
                    </TableBody>
                </Table>
            </div>

            <ConfirmDeleteDialog
                open={deleting !== null}
                onOpenChange={(open) => !open && setDeleting(null)}
                title="Usunąć klienta?"
                description={deleting ? `Klient „${deleting.name}” zniknie z listy i ze strony głównej. Tej operacji nie można cofnąć.` : ''}
                onConfirm={deleteOne}
                processing={processing}
            />
            <ConfirmDeleteDialog
                open={bulkOpen}
                onOpenChange={setBulkOpen}
                title="Usunąć zaznaczonych klientów?"
                description={`Zostanie usuniętych klientów: ${selected.length}. Tej operacji nie można cofnąć.`}
                onConfirm={deleteSelected}
                processing={processing}
            />
        </AdminLayout>
    );
}
