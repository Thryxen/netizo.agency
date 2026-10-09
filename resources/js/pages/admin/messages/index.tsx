import { Link, router } from '@inertiajs/react';
import { EyeIcon, Trash2Icon } from 'lucide-react';
import { useEffect, useState } from 'react';

import { AdminLayout } from '@/components/admin/admin-layout';
import { BulkBar } from '@/components/admin/bulk-bar';
import { ConfirmDeleteDialog } from '@/components/admin/confirm-delete-dialog';
import { LeadLocaleBadge } from '@/components/admin/lead-locale';
import { ListToolbar } from '@/components/admin/list-toolbar';
import { Pagination } from '@/components/admin/pagination';
import { SortHeader } from '@/components/admin/sort-header';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useListFilters } from '@/hooks/use-list-filters';
import { useSelection } from '@/hooks/use-selection';
import { adminRoutes } from '@/lib/admin-routes';
import type { AdminMessageRow, LeadFilters, Paginated } from '@/types/admin';

type Props = { messages: Paginated<AdminMessageRow>; filters: LeadFilters };

export default function MessagesIndex({ messages, filters }: Props) {
    const { values, update, toggleSort } = useListFilters<LeadFilters>(adminRoutes.messages.index, filters);
    const { selected, toggle, toggleAll, clear } = useSelection();
    const [deleting, setDeleting] = useState<AdminMessageRow | null>(null);
    const [bulkOpen, setBulkOpen] = useState(false);
    const [processing, setProcessing] = useState(false);

    useEffect(clear, [messages.data, clear]);

    const rowIds = messages.data.map((message) => message.id);
    const allSelected = rowIds.length > 0 && rowIds.every((id) => selected.includes(id));
    const someSelected = rowIds.some((id) => selected.includes(id));
    const hasActiveFilters = values.search !== '' || values.from !== '' || values.until !== '';

    const deleteOne = (): void => {
        if (!deleting) {
            return;
        }

        router.delete(adminRoutes.messages.destroy(deleting.id), {
            preserveScroll: true,
            onStart: () => setProcessing(true),
            onFinish: () => {
                setProcessing(false);
                setDeleting(null);
            },
        });
    };

    const deleteSelected = (): void => {
        router.delete(adminRoutes.messages.index, {
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
        <AdminLayout title="Wiadomości">
            <ListToolbar
                values={values}
                onChange={update}
                searchLabel="Szukaj wiadomości"
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
                                    aria-label="Zaznacz wszystkie wiadomości na stronie"
                                    checked={allSelected ? true : someSelected ? 'indeterminate' : false}
                                    onCheckedChange={() => toggleAll(rowIds)}
                                />
                            </TableHead>
                            <SortHeader column="name" label="Nadawca" filters={values} onSort={toggleSort} />
                            <SortHeader column="email" label="E-mail" filters={values} onSort={toggleSort} />
                            <SortHeader column="subject" label="Temat" filters={values} onSort={toggleSort} />
                            <TableHead>Wiadomość</TableHead>
                            <SortHeader column="created_at" label="Data" filters={values} onSort={toggleSort} />
                            <TableHead className="w-24" />
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {messages.data.map((message) => (
                            <TableRow key={message.id}>
                                <TableCell>
                                    <Checkbox
                                        aria-label={`Zaznacz: ${message.name}`}
                                        checked={selected.includes(message.id)}
                                        onCheckedChange={() => toggle(message.id)}
                                    />
                                </TableCell>
                                <TableCell className="font-medium">
                                    <Link href={adminRoutes.messages.show(message.id)} className="hover:underline">
                                        {message.name}
                                    </Link>
                                    <LeadLocaleBadge locale={message.locale} />
                                </TableCell>
                                <TableCell>{message.email}</TableCell>
                                <TableCell className="text-muted-foreground">{message.subject ?? 'Brak tematu'}</TableCell>
                                <TableCell className="max-w-72 truncate text-muted-foreground">{message.excerpt}</TableCell>
                                <TableCell className="whitespace-nowrap text-muted-foreground">{message.createdAt}</TableCell>
                                <TableCell>
                                    <div className="flex justify-end gap-1">
                                        <Button asChild variant="ghost" size="icon-sm">
                                            <Link href={adminRoutes.messages.show(message.id)} aria-label={`Zobacz: ${message.name}`}>
                                                <EyeIcon />
                                            </Link>
                                        </Button>
                                        <Button type="button" variant="ghost" size="icon-sm" aria-label={`Usuń: ${message.name}`} onClick={() => setDeleting(message)}>
                                            <Trash2Icon />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                        {messages.data.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                                    Brak wiadomości do wyświetlenia.
                                </TableCell>
                            </TableRow>
                        ) : null}
                    </TableBody>
                </Table>
            </div>

            <Pagination paginator={messages} />

            <ConfirmDeleteDialog
                open={deleting !== null}
                onOpenChange={(open) => !open && setDeleting(null)}
                title="Usunąć wiadomość?"
                description={deleting ? `Wiadomość od ${deleting.name} zostanie usunięta. Tej operacji nie można cofnąć.` : ''}
                onConfirm={deleteOne}
                processing={processing}
            />
            <ConfirmDeleteDialog
                open={bulkOpen}
                onOpenChange={setBulkOpen}
                title="Usunąć zaznaczone wiadomości?"
                description={`Zostanie usuniętych wiadomości: ${selected.length}. Tej operacji nie można cofnąć.`}
                onConfirm={deleteSelected}
                processing={processing}
            />
        </AdminLayout>
    );
}
