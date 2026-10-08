import { AdminLayout } from '@/components/admin/admin-layout';
import { ClientForm } from '@/components/admin/client-form';
import { adminRoutes } from '@/lib/admin-routes';

export default function ClientCreate({ nextSortOrder }: { nextSortOrder: number }) {
    return (
        <AdminLayout title="Nowy klient" breadcrumbs={[{ title: 'Klienci', href: adminRoutes.clients.index }]}>
            <ClientForm nextSortOrder={nextSortOrder} />
        </AdminLayout>
    );
}
