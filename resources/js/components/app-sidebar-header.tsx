import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import type { BreadcrumbItem as BreadcrumbItemType } from '@/types';
import { usePage } from '@inertiajs/react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { UserInfo } from '@/components/user-info';
import { UserMenuContent } from '@/components/user-menu-content';
import { ChevronsUpDown, ShieldAlert, ShieldCheck } from 'lucide-react';
import type { Auth } from '@/types';

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    const { auth } = usePage().props as unknown as { auth: Auth };
    const user = auth.user;
    
    const isSuperAdmin = user?.roles?.includes('super_admin');
    const isStandardAdmin = user?.roles?.includes('admin');
    
    return (
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-neutral-200 bg-white px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-6">
            <div className="flex items-center gap-3">
                <SidebarTrigger className="-ml-1 text-neutral-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg p-1 transition-all" />
                <div className="h-4 w-px bg-neutral-200" />
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>
            
            {user && (
                <div className="flex items-center gap-4">
                    <div className="hidden sm:flex items-center">
                        {isSuperAdmin && (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 border border-amber-200/60 shadow-xs uppercase tracking-wider">
                                <ShieldAlert className="size-3 text-amber-600" />
                                Super Admin
                            </span>
                        )}
                        {!isSuperAdmin && isStandardAdmin && (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200/60 shadow-xs uppercase tracking-wider">
                                <ShieldCheck className="size-3 text-emerald-600" />
                                Admin
                            </span>
                        )}
                    </div>
                    
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="flex items-center gap-2 hover:bg-neutral-50 px-3 py-1.5 rounded-xl border border-neutral-200/60 transition-all text-left max-w-[200px] outline-none">
                                <UserInfo user={user} />
                                <ChevronsUpDown className="size-3.5 text-neutral-400 shrink-0 ml-1" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56 rounded-xl mt-1 shadow-lg border border-neutral-200" align="end">
                            <UserMenuContent user={user} />
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )}
        </header>
    );
}
