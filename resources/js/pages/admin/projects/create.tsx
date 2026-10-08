import { AdminLayout } from '@/components/admin/admin-layout';
import { ProjectForm } from '@/components/admin/project-form';
import { adminRoutes } from '@/lib/admin-routes';

export default function ProjectCreate({ nextSortOrder }: { nextSortOrder: number }) {
    return (
        <AdminLayout title="Nowy projekt" breadcrumbs={[{ title: 'Projekty', href: adminRoutes.projects.index }]}>
            <ProjectForm nextSortOrder={nextSortOrder} />
        </AdminLayout>
    );
}
