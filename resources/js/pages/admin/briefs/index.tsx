import { Link, router } from '@inertiajs/react';
import { EyeIcon, Trash2Icon } from 'lucide-react';
import { useEffect, useState } from 'react';

import { AdminLayout } from '@/components/admin/admin-layout';
import { briefLabel, briefLabels } from '@/components/admin/brief-labels';
import { BulkBar } from '@/components/admin/bulk-bar';
import { ConfirmDeleteDialog } from '@/components/admin/confirm-delete-dialog';
import { ListToolbar } from '@/components/admin/list-toolbar';
import { Pagination } from '@/components/admin/pagination';
import { SortHeader } from '@/components/admin/sort-header';
import { budgetOptions, timelineOptions, type BriefOption } from '@/components/home/brief/brief-options';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useListFilters } from '@/hooks/use-list-filters';
import { useSelection } from '@/hooks/use-selection';
import { adminRoutes } from '@/lib/admin-routes';
import type { AdminBriefRow, BriefFilters, Paginated } from '@/types/admin';

type Props = { briefs: Paginated<AdminBriefRow>; filters: BriefFilters };

function OptionFilter({ id, label, value, options, onChange }: { id: string; label: string; value: string; options: BriefOption[]; onChange: (value: string) => void }) {
    return (
        <div className="grid gap-1.5">
            <Label htmlFor={id}>{label}</Label>
            <Select value={value || 'all'} onValueChange={(next) => onChange(next === 'all' ? '' : next)}>
                <SelectTrigger id={id} className="w-44">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Wszystkie</SelectItem>
                    {options.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                            {option.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}

export default function BriefsIndex({ briefs, filters }: Props) {
    const { values, update, toggleSort } = useListFilters<BriefFilters>(adminRoutes.briefs.index, filters);
    const { selected, toggle, toggleAll, clear } = useSelection();
    const [deleting, setDeleting] = useState<AdminBriefRow | null>(null);
    const [bulkOpen, setBulkOpen] = useState(false);
    const [processing, setProcessing] = useState(false);

    useEffect(clear, [briefs.data, clear]);

    const rowIds = briefs.data.map((brief) => brief.id);
    const allSelected = rowIds.length > 0 && rowIds.every((id) => selected.includes(id));
    const someSelected = rowIds.some((id) => selected.includes(id));
    const hasActiveFilters = values.search !== '' || values.from !== '' || values.until !== '' || values.budget !== '' || values.timeline !== '';

    const deleteOne = (): void => {
        if (!deleting) {
            return;
        }

        router.delete(adminRoutes.briefs.destroy(deleting.id), {
            preserveScroll: true,
            onStart: () => setProcessing(true),
            onFinish: () => {
                setProcessing(false);
                setDeleting(null);
            },
        });
    };

    const deleteSelected = (): void => {
        router.delete(adminRoutes.briefs.index, {
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
        <AdminLayout title="Briefy">
            <ListToolbar
                values={values}
                onChange={(patch, debounce) => update(patch, debounce)}
                searchLabel="Szukaj briefu"
                hasActiveFilters={hasActiveFilters}
                onReset={() => update({ search: '', from: '', until: '', budget: '', timeline: '' })}
            >
                <OptionFilter id="brief-budget" label="Budżet" value={values.budget} options={budgetOptions} onChange={(budget) => update({ budget })} />
                <OptionFilter id="brief-timeline" label="Termin" value={values.timeline} options={timelineOptions} onChange={(timeline) => update({ timeline })} />
            </ListToolbar>

            <BulkBar count={selected.length} onDelete={() => setBulkOpen(true)} />

            <div className="overflow-x-auto rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-10">
                                <Checkbox
                                    aria-label="Zaznacz wszystkie briefy na stronie"
                                    checked={allSelected ? true : someSelected ? 'indeterminate' : false}
                                    onCheckedChange={() => toggleAll(rowIds)}
                                />
                            </TableHead>
                            <SortHeader column="name" label="Nadawca" filters={values} onSort={toggleSort} />
                            <SortHeader column="email" label="E-mail" filters={values} onSort={toggleSort} />
                            <SortHeader column="company" label="Firma" filters={values} onSort={toggleSort} />
                            <TableHead>Typ projektu</TableHead>
                            <SortHeader column="budget" label="Budżet" filters={values} onSort={toggleSort} />
                            <SortHeader column="timeline" label="Termin" filters={values} onSort={toggleSort} />
                            <SortHeader column="created_at" label="Data" filters={values} onSort={toggleSort} />
                            <TableHead className="w-24" />
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {briefs.data.map((brief) => {
                            const budget = briefLabel('budget', brief.budget);
                            const types = briefLabels('types', brief.types.slice(0, 2));

                            return (
                                <TableRow key={brief.id}>
                                    <TableCell>
                                        <Checkbox
                                            aria-label={`Zaznacz: ${brief.name}`}
                                            checked={selected.includes(brief.id)}
                                            onCheckedChange={() => toggle(brief.id)}
                                        />
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        <Link href={adminRoutes.briefs.show(brief.id)} className="hover:underline">
                                            {brief.name}
                                        </Link>
                                    </TableCell>
                                    <TableCell>{brief.email}</TableCell>
                                    <TableCell className="text-muted-foreground">{brief.company ?? '—'}</TableCell>
                                    <TableCell className="max-w-56 truncate text-muted-foreground">{types ? `${types}${brief.types.length > 2 ? '…' : ''}` : '—'}</TableCell>
                                    <TableCell>{budget ? <Badge variant="secondary">{budget}</Badge> : <span className="text-muted-foreground">—</span>}</TableCell>
                                    <TableCell className="text-muted-foreground">{briefLabel('timeline', brief.timeline) ?? '—'}</TableCell>
                                    <TableCell className="whitespace-nowrap text-muted-foreground">{brief.createdAt}</TableCell>
                                    <TableCell>
                                        <div className="flex justify-end gap-1">
                                            <Button asChild variant="ghost" size="icon-sm">
                                                <Link href={adminRoutes.briefs.show(brief.id)} aria-label={`Zobacz: ${brief.name}`}>
                                                    <EyeIcon />
                                                </Link>
                                            </Button>
                                            <Button type="button" variant="ghost" size="icon-sm" aria-label={`Usuń: ${brief.name}`} onClick={() => setDeleting(brief)}>
                                                <Trash2Icon />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                        {briefs.data.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                                    Brak briefów do wyświetlenia.
                                </TableCell>
                            </TableRow>
                        ) : null}
                    </TableBody>
                </Table>
            </div>

            <Pagination paginator={briefs} />

            <ConfirmDeleteDialog
                open={deleting !== null}
                onOpenChange={(open) => !open && setDeleting(null)}
                title="Usunąć brief?"
                description={deleting ? `Brief od ${deleting.name} zostanie usunięty. Tej operacji nie można cofnąć.` : ''}
                onConfirm={deleteOne}
                processing={processing}
            />
            <ConfirmDeleteDialog
                open={bulkOpen}
                onOpenChange={setBulkOpen}
                title="Usunąć zaznaczone briefy?"
                description={`Zostanie usuniętych briefów: ${selected.length}. Tej operacji nie można cofnąć.`}
                onConfirm={deleteSelected}
                processing={processing}
            />
        </AdminLayout>
    );
}
