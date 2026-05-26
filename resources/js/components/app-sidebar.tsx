import { Link } from '@inertiajs/react';
import {
    LayoutDashboard,
    Home,
    Briefcase,
    Newspaper,
    Megaphone,
    Images,
    Building2,
    FolderDown,
    Users,
    Settings2,
    Image,
    Activity,
    Cpu,
    ShieldAlert,
    Globe,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavMain } from '@/components/nav-main';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import type { NavItem } from '@/types';

const mainNavItems: NavItem[] = [
    {
        title: 'Kembali ke Home',
        href: '/',
        icon: Globe,
    },
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutDashboard,
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
            },
        ],
    },
    {
        title: 'Kelola Beranda',
        href: '/admin/beranda',
        icon: Home,
    },
    {
        title: 'Kelola Bidang',
        href: '/admin/bidang',
        icon: Briefcase,
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
        title: 'Aset Media',
        href: '/admin/aset',
        icon: Image,
    },
    {
        title: 'Dokumen Penting',
        href: '/admin/dokumen',
        icon: FolderDown,
    },
    {
        title: 'Pengguna',
        href: '/admin/users',
        icon: Users,
        badge: 'Super',
    },
    {
        title: 'Log Aktivitas',
        href: '/admin/logs',
        icon: Activity,
        badge: 'Super',
    },
    {
        title: 'Audit Keamanan',
        href: '/admin/security-audit',
        icon: ShieldAlert,
        badge: 'Super',
    },
    {
        title: 'Performa Server',
        href: '/admin/monitoring',
        icon: Cpu,
        badge: 'Super',
    },
    {
        title: 'Pengaturan Web',
        href: '/admin/settings',
        icon: Settings2,
        badge: 'Super',
    },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" className="border-r border-neutral-200">
            <SidebarHeader className="flex items-center justify-start border-b border-neutral-100 p-4 transition-all duration-300 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-2">
                <Link
                    href={dashboard()}
                    prefetch
                    className="flex w-full items-center justify-center outline-none group-data-[collapsible=icon]:h-8 group-data-[collapsible=icon]:w-8"
                >
                    <AppLogo />
                </Link>
            </SidebarHeader>

            <SidebarContent className="py-4">
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter className="border-t border-neutral-100 p-4 transition-all duration-300 group-data-[collapsible=icon]:p-2">
                <div className="flex items-center gap-2 text-[11px] font-medium text-neutral-400 group-data-[collapsible=icon]:justify-center">
                    <div className="size-2 shrink-0 animate-pulse rounded-full bg-emerald-600" />
                    <span className="group-data-[collapsible=icon]:hidden">
                        BKA UMRI Portal
                    </span>
                </div>
            </SidebarFooter>
        </Sidebar>
    );
}
