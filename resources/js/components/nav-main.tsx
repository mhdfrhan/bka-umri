import { Link } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    SidebarMenuBadge,
} from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { cn, toUrl } from '@/lib/utils';
import type { NavItem } from '@/types';

export function NavMain({ items = [] }: { items: NavItem[] }) {
    const { isCurrentUrl, isCurrentOrParentUrl } = useCurrentUrl();

    return (
        <SidebarGroup className="px-2.5 py-0 group-data-[collapsible=icon]:px-2">
            <SidebarGroupLabel className="mb-2 px-3 text-[10px] font-semibold tracking-wider text-neutral-400 uppercase group-data-[collapsible=icon]:opacity-0">
                Menu Utama
            </SidebarGroupLabel>
            <SidebarMenu className="gap-1.5">
                {items.map((item) => {
                    const hrefString = toUrl(item.href);
                    const isActive =
                        hrefString === '/admin'
                            ? isCurrentUrl(item.href)
                            : isCurrentOrParentUrl(item.href) ||
                              item.items?.some((subItem) =>
                                  isCurrentOrParentUrl(subItem.href),
                              );

                    if (item.items && item.items.length > 0) {
                        return (
                            <Collapsible
                                key={item.title}
                                asChild
                                defaultOpen={isActive}
                                className="group/collapsible"
                            >
                                <SidebarMenuItem>
                                    <CollapsibleTrigger asChild>
                                        <SidebarMenuButton
                                            tooltip={item.title}
                                            isActive={isActive}
                                            className={cn(
                                                'relative h-10 overflow-hidden rounded-xl px-3 font-medium transition-all duration-200 outline-none',
                                                'group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0',
                                                isActive
                                                    ? 'rounded-l-none rounded-r-xl border-l-[3px] border-emerald-600 bg-emerald-50/80 pl-2 font-semibold text-emerald-800 shadow-xs group-data-[collapsible=icon]:rounded-xl group-data-[collapsible=icon]:border-l-0 group-data-[collapsible=icon]:p-2'
                                                    : 'text-neutral-500 hover:bg-neutral-100/70 hover:text-neutral-900',
                                            )}
                                        >
                                            {item.icon && (
                                                <item.icon
                                                    className={cn(
                                                        'size-[18px] transition-transform duration-200 group-hover/collapsible:scale-105',
                                                        isActive
                                                            ? 'text-emerald-600'
                                                            : 'text-neutral-400',
                                                    )}
                                                />
                                            )}
                                            <span className="group-data-[collapsible=icon]:hidden">
                                                {item.title}
                                            </span>
                                            {item.badge && (
                                                <SidebarMenuBadge className="mr-4 ml-auto">
                                                    {item.badge}
                                                </SidebarMenuBadge>
                                            )}
                                            <ChevronRight className="ml-auto text-neutral-400 transition-transform duration-200 group-data-[collapsible=icon]:hidden group-data-[state=open]/collapsible:rotate-90" />
                                        </SidebarMenuButton>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent className="collapsible-dropdown-content">
                                        <div className="collapsible-dropdown-inner">
                                            <SidebarMenuSub className="mt-1 ml-5 gap-1 border-l border-neutral-100 pl-2">
                                                {item.items.map((subItem) => {
                                                    const isSubActive =
                                                        subItem.href ===
                                                        '/admin'
                                                            ? isCurrentUrl(
                                                                  subItem.href,
                                                              )
                                                            : isCurrentOrParentUrl(
                                                                  subItem.href,
                                                              );

                                                    return (
                                                        <SidebarMenuSubItem
                                                            key={subItem.title}
                                                        >
                                                            <SidebarMenuSubButton
                                                                asChild
                                                                isActive={
                                                                    isSubActive
                                                                }
                                                                className={cn(
                                                                    'h-8 rounded-lg px-3 font-medium transition-all duration-200 outline-none',
                                                                    isSubActive
                                                                        ? 'rounded-l-none border-l-2 border-emerald-600 bg-emerald-50/40 pl-2.5 font-semibold text-emerald-700'
                                                                        : 'text-neutral-500 hover:bg-neutral-100/40 hover:text-neutral-900',
                                                                )}
                                                            >
                                                                <Link
                                                                    href={
                                                                        subItem.href
                                                                    }
                                                                    prefetch
                                                                >
                                                                    {subItem.icon && (
                                                                        <subItem.icon className="mr-2 size-4" />
                                                                    )}
                                                                    <span>
                                                                        {
                                                                            subItem.title
                                                                        }
                                                                    </span>
                                                                </Link>
                                                            </SidebarMenuSubButton>
                                                        </SidebarMenuSubItem>
                                                    );
                                                })}
                                            </SidebarMenuSub>
                                        </div>
                                    </CollapsibleContent>
                                </SidebarMenuItem>
                            </Collapsible>
                        );
                    }

                    return (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton
                                asChild
                                isActive={isActive}
                                tooltip={{ children: item.title }}
                                className={cn(
                                    'relative h-10 overflow-hidden rounded-xl px-3 font-medium transition-all duration-200 outline-none',
                                    'group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0',
                                    isActive
                                        ? 'rounded-l-none rounded-r-xl border-l-[3px] border-emerald-600 bg-emerald-50/80 pl-2 font-semibold text-emerald-800 shadow-xs group-data-[collapsible=icon]:rounded-xl group-data-[collapsible=icon]:border-l-0 group-data-[collapsible=icon]:p-2'
                                        : 'text-neutral-500 hover:bg-neutral-100/70 hover:text-neutral-900',
                                )}
                            >
                                <Link
                                    href={item.href}
                                    prefetch
                                    className="flex w-full items-center gap-3 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0"
                                >
                                    {item.icon && (
                                        <item.icon
                                            className={cn(
                                                'size-[18px] transition-transform duration-200 group-hover:scale-105',
                                                isActive
                                                    ? 'text-emerald-600'
                                                    : 'text-neutral-400',
                                            )}
                                        />
                                    )}
                                    <span className="group-data-[collapsible=icon]:hidden">
                                        {item.title}
                                    </span>
                                    {item.badge && (
                                        <span className="ml-auto rounded-full border border-amber-200/50 bg-amber-50 px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-amber-700 uppercase group-data-[collapsible=icon]:hidden">
                                            {item.badge}
                                        </span>
                                    )}
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    );
                })}
            </SidebarMenu>
        </SidebarGroup>
    );
}
