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
import type { AdminProjectRow } from '@/types/admin';

const searchText = (project: AdminProjectRow): string => `${project.title} ${project.category} ${project.url}`;

export default function ProjectsIndex({ projects }: { projects: AdminProjectRow[] }) {
    const list = useRecordList({ records: projects, reorderUrl: adminRoutes.projects.reorder, searchText });
    const { selected, toggle, toggleAll, clear } = list.selection;
    const [deleting, setDeleting] = useState<AdminProjectRow | null>(null);
    const [bulkOpen, setBulkOpen] = useState(false);
    const [processing, setProcessing] = useState(false);

    const rowIds = list.visibleRows.map((project) => project.id);
    const allSelected = rowIds.length > 0 && rowIds.every((id) => selected.includes(id));
    const someSelected = rowIds.some((id) => selected.includes(id));

    const deleteOne = (): void => {
        if (!deleting) {
            return;
        }

        router.delete(adminRoutes.projects.destroy(deleting.id), {
            preserveScroll: true,
            onStart: () => setProcessing(true),
            onFinish: () => {
                setProcessing(false);
                setDeleting(null);
            },
        });
    };

    const deleteSelected = (): void => {
        router.delete(adminRoutes.projects.index, {
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
            title="Projekty"
            actions={
                <Button asChild>
                    <Link href={adminRoutes.projects.create}>
                        <PlusIcon />
                        Nowy projekt
                    </Link>
                </Button>
            }
        >
            <RecordToolbar
                search={list.search}
                onSearch={list.setSearch}
                status={list.status}
                onStatus={list.setStatus}
                searchLabel="Szukaj projektu"
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
                                    aria-label="Zaznacz wszystkie projekty"
                                    checked={allSelected ? true : someSelected ? 'indeterminate' : false}
                                    onCheckedChange={() => toggleAll(rowIds)}
                                />
                            </TableHead>
                            <TableHead className="w-24">Miniaturka</TableHead>
                            <TableHead className="w-14">#</TableHead>
                            <TableHead>Nazwa</TableHead>
                            <TableHead>Kategoria</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Aktualizacja</TableHead>
                            <TableHead className="w-24" />
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <SortableArea ids={rowIds} onMove={list.move}>
                            {list.visibleRows.map((project) => (
                                <SortableTableRow key={project.id} id={project.id} disabled={!list.canReorder}>
                                    <TableCell className="w-10">
                                        <Checkbox
                                            aria-label={`Zaznacz: ${project.title}`}
                                            checked={selected.includes(project.id)}
                                            onCheckedChange={() => toggle(project.id)}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        {project.thumbnailUrl ? (
                                            <img src={project.thumbnailUrl} alt="" className="h-10 w-18 rounded border object-cover object-top" loading="lazy" />
                                        ) : (
                                            <div className="h-10 w-18 rounded border bg-muted" />
                                        )}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">{project.sortOrder}</TableCell>
                                    <TableCell className="font-medium">
                                        <Link href={adminRoutes.projects.edit(project.id)} className="hover:underline">
                                            {project.title}
                                        </Link>
                                        <span className="block text-xs font-normal text-muted-foreground">{project.url}</span>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{project.category}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={project.isActive ? 'secondary' : 'outline'}>{project.isActive ? 'Aktywny' : 'Nieaktywny'}</Badge>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">{project.updatedAt}</TableCell>
                                    <TableCell>
                                        <div className="flex justify-end gap-1">
                                            <Button asChild variant="ghost" size="icon-sm">
                                                <Link href={adminRoutes.projects.edit(project.id)} aria-label={`Edytuj: ${project.title}`}>
                                                    <PencilIcon />
                                                </Link>
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon-sm"
                                                aria-label={`Usuń: ${project.title}`}
                                                onClick={() => setDeleting(project)}
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
                                <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                                    Brak projektów do wyświetlenia.
                                </TableCell>
                            </TableRow>
                        ) : null}
                    </TableBody>
                </Table>
            </div>

            <ConfirmDeleteDialog
                open={deleting !== null}
                onOpenChange={(open) => !open && setDeleting(null)}
                title="Usunąć projekt?"
                description={deleting ? `Projekt „${deleting.title}” zniknie z listy i ze strony głównej. Tej operacji nie można cofnąć.` : ''}
                onConfirm={deleteOne}
                processing={processing}
            />
            <ConfirmDeleteDialog
                open={bulkOpen}
                onOpenChange={setBulkOpen}
                title="Usunąć zaznaczone projekty?"
                description={`Zostanie usuniętych projektów: ${selected.length}. Tej operacji nie można cofnąć.`}
                onConfirm={deleteSelected}
                processing={processing}
            />
        </AdminLayout>
    );
}
