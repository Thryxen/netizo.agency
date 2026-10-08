import { Head, Link, usePage } from '@inertiajs/react';
import { Fragment, type ReactNode } from 'react';

import { AdminSidebar } from '@/components/admin/admin-sidebar';
import { FlashNotice } from '@/components/admin/flash-notice';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import type { AdminSharedProps } from '@/types/admin';

type AdminLayoutProps = {
    title: string;
    /** Parent pages shown before the title, e.g. the list above an edit form. */
    breadcrumbs?: { title: string; href: string }[];
    /** Page actions shown on the right of the top bar. */
    actions?: ReactNode;
    children: ReactNode;
};

export function AdminLayout({ title, breadcrumbs = [], actions, children }: AdminLayoutProps) {
    const { sidebarOpen } = usePage<AdminSharedProps>().props;

    return (
        <SidebarProvider defaultOpen={sidebarOpen}>
            <Head title={`${title} – Panel Netizo`} />

            <AdminSidebar />

            <SidebarInset className="min-w-0">
                <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
                    <div className="flex items-center gap-2 px-4">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
                        <Breadcrumb>
                            <BreadcrumbList>
                                {breadcrumbs.map((crumb) => (
                                    <Fragment key={crumb.href}>
                                        <BreadcrumbItem className="hidden md:block">
                                            <BreadcrumbLink asChild>
                                                <Link href={crumb.href}>{crumb.title}</Link>
                                            </BreadcrumbLink>
                                        </BreadcrumbItem>
                                        <BreadcrumbSeparator className="hidden md:block" />
                                    </Fragment>
                                ))}
                                <BreadcrumbItem>
                                    <BreadcrumbPage>{title}</BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                    <div className="ml-auto flex items-center gap-2 px-4">{actions}</div>
                </header>

                <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                    <FlashNotice />
                    {children}
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
