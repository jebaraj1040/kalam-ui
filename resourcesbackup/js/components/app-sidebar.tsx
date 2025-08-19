import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { GalleryThumbnailsIcon, LayoutGrid, LayoutTemplate, PanelTopIcon, SquarePlus } from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: route('admin.dashboard'),
        icon: LayoutGrid,
    },
    {
        title: 'Components',
        href: '/components',
        icon: SquarePlus,
    },
    {
        title: 'Templates',
        href: '/templates',
        icon: LayoutTemplate,
    },
    {
        title: 'Pages',
        href: '/pages',
        icon: PanelTopIcon,
    },
    // {
    //     title: 'Group Component',
    //     href: '/group-component',
    //     icon: LayoutGrid,
    // },
    {
        title: 'Media',
        href: '/media',
        icon: GalleryThumbnailsIcon,
    },
];

const footerNavItems: NavItem[] = [
    // {
    //     title: 'Sites',
    //     href: '/sites',
    //     icon: Folder,
    // },
    // {
    //     title: 'Documentation',
    //     href: 'https://laravel.com/docs/starter-kits#react',
    //     icon: BookOpen,
    // },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={route('admin.dashboard')}>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
