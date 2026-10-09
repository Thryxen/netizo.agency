import { Link, router } from '@inertiajs/react';
import { EyeIcon, Trash2Icon } from 'lucide-react';
import { useEffect, useState } from 'react';

import { AdminLayout } from '@/components/admin/admin-layout';
import { BulkBar } from '@/components/admin/bulk-bar';
import { ConfirmDeleteDialog } from '@/components/admin/confirm-delete-dialog';
import { ListToolbar } from '@/components/admin/list-toolbar';
import { Pagination } from '@/components/admin/pagination';
import { SortHeader } from '@/components/admin/sort-header';
import { partnerTypeLabel } from '@/components/partners/partner-options';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useListFilters } from '@/hooks/use-list-filters';
import { useSelection } from '@/hooks/use-selection';
import { adminRoutes } from '@/lib/admin-routes';
import type { AdminPartnerRow, LeadFilters, Paginated } from '@/types/admin';

type Props = { partners: Paginated<AdminPartnerRow>; filters: LeadFilters };

export default function PartnersIndex({ partners, filters }: Props) {
    const { values, update, toggleSort } = useListFilters<LeadFilters>(adminRoutes.partners.index, filters);
    const { selected, toggle, toggleAll, clear } = useSelection();
    const [deleting, setDeleting] = useState<AdminPartnerRow | null>(null);
    const [bulkOpen, setBulkOpen] = useState(false);
    const [processing, setProcessing] = useState(false);

    useEffect(clear, [partners.data, clear]);

    const rowIds = partners.data.map((partner) => partner.id);
    const allSelected = rowIds.length > 0 && rowIds.every((id) => selected.includes(id));
    const someSelected = rowIds.some((id) => selected.includes(id));
    const hasActiveFilters = values.search !== '' || values.from !== '' || values.until !== '';

    const deleteOne = (): void => {
        if (!deleting) {
            return;
        }

        router.delete(adminRoutes.partners.destroy(deleting.id), {
            preserveScroll: true,
            onStart: () => setProcessing(true),
            onFinish: () => {
                setProcessing(false);
                setDeleting(null);
            },
        });
    };

    const deleteSelected = (): void => {
        router.delete(adminRoutes.partners.index, {
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
        <AdminLayout title="Partnerzy">
            <ListToolbar
                values={values}
                onChange={update}
                searchLabel="Szukaj zgłoszeń"
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
                                    aria-label="Zaznacz wszystkie zgłoszenia na stronie"
                                    checked={allSelected ? true : someSelected ? 'indeterminate' : false}
                                    onCheckedChange={() => toggleAll(rowIds)}
                                />
                            </TableHead>
                            <SortHeader column="name" label="Imię i nazwisko" filters={values} onSort={toggleSort} />
                            <SortHeader column="email" label="E-mail" filters={values} onSort={toggleSort} />
                            <TableHead>Telefon</TableHead>
                            <SortHeader column="partner_type" label="Kim jest" filters={values} onSort={toggleSort} />
                            <SortHeader column="created_at" label="Data" filters={values} onSort={toggleSort} />
                            <TableHead className="w-24" />
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {partners.data.map((partner) => (
                            <TableRow key={partner.id}>
                                <TableCell>
                                    <Checkbox
                                        aria-label={`Zaznacz: ${partner.name}`}
                                        checked={selected.includes(partner.id)}
                                        onCheckedChange={() => toggle(partner.id)}
                                    />
                                </TableCell>
                                <TableCell className="font-medium">
                                    <Link href={adminRoutes.partners.show(partner.id)} className="hover:underline">
                                        {partner.name}
                                    </Link>
                                </TableCell>
                                <TableCell>{partner.email}</TableCell>
                                <TableCell className="whitespace-nowrap text-muted-foreground">{partner.phone ?? 'Nie podano'}</TableCell>
                                <TableCell className="text-muted-foreground">{partnerTypeLabel(partner.partnerType)}</TableCell>
                                <TableCell className="whitespace-nowrap text-muted-foreground">{partner.createdAt}</TableCell>
                                <TableCell>
                                    <div className="flex justify-end gap-1">
                                        <Button asChild variant="ghost" size="icon-sm">
                                            <Link href={adminRoutes.partners.show(partner.id)} aria-label={`Zobacz: ${partner.name}`}>
                                                <EyeIcon />
                                            </Link>
                                        </Button>
                                        <Button type="button" variant="ghost" size="icon-sm" aria-label={`Usuń: ${partner.name}`} onClick={() => setDeleting(partner)}>
                                            <Trash2Icon />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                        {partners.data.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                                    Brak zgłoszeń do wyświetlenia.
                                </TableCell>
                            </TableRow>
                        ) : null}
                    </TableBody>
                </Table>
            </div>

            <Pagination paginator={partners} />

            <ConfirmDeleteDialog
                open={deleting !== null}
                onOpenChange={(open) => !open && setDeleting(null)}
                title="Usunąć zgłoszenie?"
                description={deleting ? `Zgłoszenie od ${deleting.name} zostanie usunięte. Tej operacji nie można cofnąć.` : ''}
                onConfirm={deleteOne}
                processing={processing}
            />
            <ConfirmDeleteDialog
                open={bulkOpen}
                onOpenChange={setBulkOpen}
                title="Usunąć zaznaczone zgłoszenia?"
                description={`Zostanie usuniętych zgłoszeń: ${selected.length}. Tej operacji nie można cofnąć.`}
                onConfirm={deleteSelected}
                processing={processing}
            />
        </AdminLayout>
    );
}
