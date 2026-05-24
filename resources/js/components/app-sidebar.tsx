import { Link } from '@inertiajs/react';
import { 
    LayoutGrid, 
    Newspaper, 
    Megaphone, 
    Images, 
    FileText, 
    Users, 
    Settings,
    Building2
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import type { NavItem } from '@/types';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Berita',
        href: '/admin/berita',
        icon: Newspaper,
    },
    {
        title: 'Pengumuman',
        href: '/admin/pengumuman',
        icon: Megaphone,
    },
    {
        title: 'Dokumentasi',
        href: '/admin/dokumentasi',
        icon: Images,
    },
    {
        title: 'Profil Organisasi',
        href: '#',
        icon: Building2,
        items: [
            {
                title: 'Tentang Kami',
                href: '/admin/profil/tentang',
            },
            {
                title: 'Visi & Misi',
                href: '/admin/profil/visi-misi',
            },
            {
                title: 'Struktur Organisasi',
                href: '/admin/profil/struktur',
            }
        ]
    },
    {
        title: 'Dokumen Penting',
        href: '/admin/dokumen',
        icon: FileText,
    },
    {
        title: 'Pengguna',
        href: '/admin/users',
        icon: Users,
        badge: 'Super',
    },
    {
        title: 'Pengaturan Web',
        href: '/admin/settings',
        icon: Settings,
        badge: 'Super',
    },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
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
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
