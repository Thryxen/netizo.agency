import { Link, usePage } from '@inertiajs/react';
import { BriefcaseIcon, Building2Icon, FileTextIcon, MailIcon, PhoneIcon, type LucideIcon } from 'lucide-react';
import type { ComponentProps } from 'react';

import { NavUser } from '@/components/admin/nav-user';
import { Logo, LogoMark } from '@/components/home/logo';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
} from '@/components/ui/sidebar';
import { adminRoutes } from '@/lib/admin-routes';
import type { AdminSharedProps } from '@/types/admin';

type NavItem = { title: string; href: string; icon: LucideIcon };

const groups: { label: string; items: NavItem[] }[] = [
    {
        label: 'Treści',
        items: [
            { title: 'Projekty', href: adminRoutes.projects.index, icon: BriefcaseIcon },
            { title: 'Klienci', href: adminRoutes.clients.index, icon: Building2Icon },
        ],
    },
    {
        label: 'Kontakt',
        items: [
            { title: 'Wiadomości', href: adminRoutes.messages.index, icon: MailIcon },
            { title: 'Briefy', href: adminRoutes.briefs.index, icon: FileTextIcon },
            { title: 'Prośby o kontakt', href: adminRoutes.callbacks.index, icon: PhoneIcon },
        ],
    },
];

export function AdminSidebar(props: ComponentProps<typeof Sidebar>) {
    const page = usePage<AdminSharedProps>();
    const { auth } = page.props;
    const path = page.url.split('?')[0];

    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild size="lg" tooltip="Panel Netizo" className="h-auto py-2 group-data-[collapsible=icon]:justify-center">
                            <Link href={adminRoutes.projects.index}>
                                <LogoMark className="hidden h-5 w-auto group-data-[collapsible=icon]:block" aria-hidden />
                                <span className="flex flex-col gap-1 group-data-[collapsible=icon]:hidden">
                                    <Logo className="h-6 w-auto self-start" title="Netizo" />
                                    <span className="text-xs text-sidebar-foreground/70">Panel administracyjny</span>
                                </span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                {groups.map((group) => (
                    <SidebarGroup key={group.label}>
                        <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
                        <SidebarMenu>
                            {group.items.map((item) => (
                                <SidebarMenuItem key={item.href}>
                                    <SidebarMenuButton asChild isActive={path === item.href || path.startsWith(`${item.href}/`)} tooltip={item.title}>
                                        <Link href={item.href}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroup>
                ))}
            </SidebarContent>
            <SidebarFooter>{auth.user ? <NavUser user={auth.user} /> : null}</SidebarFooter>
            <SidebarRail />
        </Sidebar>
    );
}
