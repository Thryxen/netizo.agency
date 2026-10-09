import { Link, router } from '@inertiajs/react';
import { Trash2Icon } from 'lucide-react';
import { useState } from 'react';

import { AdminLayout } from '@/components/admin/admin-layout';
import { ConfirmDeleteDialog } from '@/components/admin/confirm-delete-dialog';
import { CopyButton, DetailItem, DetailList } from '@/components/admin/detail';
import { partnerTypeLabel } from '@/components/partners/partner-options';
import { Button } from '@/components/ui/button';
import { adminRoutes } from '@/lib/admin-routes';
import type { AdminPartner } from '@/types/admin';

export default function PartnerShow({ partner }: { partner: AdminPartner }) {
    const [confirming, setConfirming] = useState(false);
    const [processing, setProcessing] = useState(false);

    return (
        <AdminLayout
            title={partner.name}
            breadcrumbs={[{ title: 'Partnerzy', href: adminRoutes.partners.index }]}
            actions={
                <Button type="button" variant="outline" onClick={() => setConfirming(true)}>
                    <Trash2Icon />
                    Usuń
                </Button>
            }
        >
            <div className="grid max-w-3xl gap-8">
                <DetailList>
                    <DetailItem label="Imię i nazwisko">{partner.name}</DetailItem>
                    <DetailItem label="E-mail">
                        <span className="inline-flex items-center gap-1">
                            <a href={`mailto:${partner.email}`} className="underline-offset-4 hover:underline">
                                {partner.email}
                            </a>
                            <CopyButton value={partner.email} label="adres e-mail" />
                        </span>
                    </DetailItem>
                    <DetailItem label="Telefon">
                        {partner.phone ? (
                            <span className="inline-flex items-center gap-1">
                                <a href={`tel:${partner.phone.replace(/[^\d+]/g, '')}`} className="underline-offset-4 hover:underline">
                                    {partner.phone}
                                </a>
                                <CopyButton value={partner.phone} label="numer telefonu" />
                            </span>
                        ) : null}
                    </DetailItem>
                    <DetailItem label="Kim jest">{partnerTypeLabel(partner.partnerType)}</DetailItem>
                    <DetailItem label="Data zgłoszenia">{partner.createdAt}</DetailItem>
                </DetailList>

                <section className="grid gap-2">
                    <h2 className="text-sm text-muted-foreground">Kogo chce polecać</h2>
                    {partner.message ? (
                        <p className="rounded-md border p-4 text-sm leading-relaxed whitespace-pre-line">{partner.message}</p>
                    ) : (
                        <p className="text-sm text-muted-foreground">Nie podano</p>
                    )}
                </section>

                <div>
                    <Button asChild variant="ghost">
                        <Link href={adminRoutes.partners.index}>Wróć do listy</Link>
                    </Button>
                </div>
            </div>

            <ConfirmDeleteDialog
                open={confirming}
                onOpenChange={setConfirming}
                title="Usunąć zgłoszenie?"
                description={`Zgłoszenie od ${partner.name} zostanie usunięte. Tej operacji nie można cofnąć.`}
                processing={processing}
                onConfirm={() =>
                    router.delete(adminRoutes.partners.destroy(partner.id), {
                        onStart: () => setProcessing(true),
                        onFinish: () => setProcessing(false),
                    })
                }
            />
        </AdminLayout>
    );
}
