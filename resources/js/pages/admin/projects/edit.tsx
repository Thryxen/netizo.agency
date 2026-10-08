import { AdminLayout } from '@/components/admin/admin-layout';
import { ProjectForm } from '@/components/admin/project-form';
import { adminRoutes } from '@/lib/admin-routes';
import type { AdminProject } from '@/types/admin';

export default function ProjectEdit({ project }: { project: AdminProject }) {
    return (
        <AdminLayout title={project.title} breadcrumbs={[{ title: 'Projekty', href: adminRoutes.projects.index }]}>
            <ProjectForm project={project} />
        </AdminLayout>
    );
}
