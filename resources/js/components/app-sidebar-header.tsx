import { usePage } from '@inertiajs/react';
import { ChevronsUpDown, ShieldAlert, ShieldCheck } from 'lucide-react';
import { Breadcrumbs } from '@/components/breadcrumbs';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { UserInfo } from '@/components/user-info';
import { UserMenuContent } from '@/components/user-menu-content';
import type { BreadcrumbItem as BreadcrumbItemType } from '@/types';
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
                <SidebarTrigger className="-ml-1 rounded-lg p-1 text-neutral-600 transition-all hover:bg-emerald-50 hover:text-emerald-700" />
                <div className="h-4 w-px bg-neutral-200" />
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>

            {user && (
                <div className="flex items-center gap-4">
                    <div className="hidden items-center sm:flex">
                        {isSuperAdmin && (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200/60 bg-amber-50 px-2.5 py-0.5 text-xs font-semibold tracking-wider text-amber-700 uppercase shadow-xs">
                                <ShieldAlert className="size-3 text-amber-600" />
                                Super Admin
                            </span>
                        )}
                        {!isSuperAdmin && isStandardAdmin && (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200/60 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold tracking-wider text-emerald-700 uppercase shadow-xs">
                                <ShieldCheck className="size-3 text-emerald-600" />
                                Admin
                            </span>
                        )}
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="flex max-w-[200px] items-center gap-2 rounded-xl border border-neutral-200/60 px-3 py-1.5 text-left transition-all outline-none hover:bg-neutral-50">
                                <UserInfo user={user} />
                                <ChevronsUpDown className="ml-1 size-3.5 shrink-0 text-neutral-400" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            className="mt-1 w-56 rounded-xl border border-neutral-200 shadow-lg"
                            align="end"
                        >
                            <UserMenuContent user={user} />
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )}
        </header>
    );
}
