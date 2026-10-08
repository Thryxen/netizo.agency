import { Link, router } from '@inertiajs/react';
import { Trash2Icon } from 'lucide-react';
import { useState } from 'react';

import { AdminLayout } from '@/components/admin/admin-layout';
import { ConfirmDeleteDialog } from '@/components/admin/confirm-delete-dialog';
import { CopyButton, DetailItem, DetailList } from '@/components/admin/detail';
import { Button } from '@/components/ui/button';
import { adminRoutes } from '@/lib/admin-routes';
import type { AdminMessage } from '@/types/admin';

export default function MessageShow({ message }: { message: AdminMessage }) {
    const [confirming, setConfirming] = useState(false);
    const [processing, setProcessing] = useState(false);

    return (
        <AdminLayout
            title={message.name}
            breadcrumbs={[{ title: 'Wiadomości', href: adminRoutes.messages.index }]}
            actions={
                <Button type="button" variant="outline" onClick={() => setConfirming(true)}>
                    <Trash2Icon />
                    Usuń
                </Button>
            }
        >
            <div className="grid max-w-3xl gap-8">
                <DetailList>
                    <DetailItem label="Imię i nazwisko">{message.name}</DetailItem>
                    <DetailItem label="E-mail">
                        <span className="inline-flex items-center gap-1">
                            <a href={`mailto:${message.email}`} className="underline-offset-4 hover:underline">
                                {message.email}
                            </a>
                            <CopyButton value={message.email} label="adres e-mail" />
                        </span>
                    </DetailItem>
                    <DetailItem label="Temat" empty="Brak tematu">
                        {message.subject}
                    </DetailItem>
                    <DetailItem label="Data wysłania">{message.createdAt}</DetailItem>
                </DetailList>

                <section className="grid gap-2">
                    <h2 className="text-sm text-muted-foreground">Treść wiadomości</h2>
                    <p className="rounded-md border p-4 text-sm leading-relaxed whitespace-pre-line">{message.message}</p>
                </section>

                <div>
                    <Button asChild variant="ghost">
                        <Link href={adminRoutes.messages.index}>Wróć do listy</Link>
                    </Button>
                </div>
            </div>

            <ConfirmDeleteDialog
                open={confirming}
                onOpenChange={setConfirming}
                title="Usunąć wiadomość?"
                description={`Wiadomość od ${message.name} zostanie usunięta. Tej operacji nie można cofnąć.`}
                processing={processing}
                onConfirm={() =>
                    router.delete(adminRoutes.messages.destroy(message.id), {
                        onStart: () => setProcessing(true),
                        onFinish: () => setProcessing(false),
                    })
                }
            />
        </AdminLayout>
    );
}
