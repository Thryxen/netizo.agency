import { AdminLayout } from '@/components/admin/admin-layout';
import { ClientForm } from '@/components/admin/client-form';
import { adminRoutes } from '@/lib/admin-routes';
import type { AdminClient } from '@/types/admin';

export default function ClientEdit({ client }: { client: AdminClient }) {
    return (
        <AdminLayout title={client.name} breadcrumbs={[{ title: 'Klienci', href: adminRoutes.clients.index }]}>
            <ClientForm client={client} />
        </AdminLayout>
    );
}
