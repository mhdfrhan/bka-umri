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
import type { NavItem } from '@/types';
import { cn, toUrl } from '@/lib/utils';

export function NavMain({ items = [] }: { items: NavItem[] }) {
    const { isCurrentUrl, isCurrentOrParentUrl } = useCurrentUrl();

    return (
        <SidebarGroup className="px-2.5 py-0 group-data-[collapsible=icon]:px-2">
            <SidebarGroupLabel className="px-3 text-neutral-400 font-semibold tracking-wider uppercase text-[10px] mb-2 group-data-[collapsible=icon]:opacity-0">
                Menu Utama
            </SidebarGroupLabel>
            <SidebarMenu className="gap-1.5">
                {items.map((item) => {
                    const hrefString = toUrl(item.href);
                    const isActive = hrefString === '/admin' 
                        ? isCurrentUrl(item.href)
                        : (isCurrentOrParentUrl(item.href) || item.items?.some((subItem) => isCurrentOrParentUrl(subItem.href)));
                    
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
                                                "transition-all duration-200 rounded-xl h-10 px-3 font-medium relative overflow-hidden outline-none",
                                                "group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0",
                                                isActive 
                                                    ? "bg-emerald-50/80 text-emerald-800 font-semibold border-l-[3px] border-emerald-600 rounded-r-xl rounded-l-none pl-2 shadow-xs group-data-[collapsible=icon]:border-l-0 group-data-[collapsible=icon]:rounded-xl group-data-[collapsible=icon]:p-2" 
                                                    : "text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100/70"
                                            )}
                                        >
                                            {item.icon && <item.icon className={cn("size-[18px] transition-transform duration-200 group-hover/collapsible:scale-105", isActive ? "text-emerald-600" : "text-neutral-400")} />}
                                            <span className="group-data-[collapsible=icon]:hidden">{item.title}</span>
                                            {item.badge && <SidebarMenuBadge className="ml-auto mr-4">{item.badge}</SidebarMenuBadge>}
                                            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 text-neutral-400 group-data-[collapsible=icon]:hidden" />
                                        </SidebarMenuButton>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent className="collapsible-dropdown-content">
                                        <div className="collapsible-dropdown-inner">
                                            <SidebarMenuSub className="border-l border-neutral-100 ml-5 pl-2 mt-1 gap-1">
                                                {item.items.map((subItem) => {
                                                    const isSubActive = subItem.href === '/admin' ? isCurrentUrl(subItem.href) : isCurrentOrParentUrl(subItem.href);
                                                    return (
                                                        <SidebarMenuSubItem key={subItem.title}>
                                                            <SidebarMenuSubButton
                                                                asChild
                                                                isActive={isSubActive}
                                                                className={cn(
                                                                    "transition-all duration-200 rounded-lg h-8 px-3 font-medium outline-none",
                                                                    isSubActive
                                                                        ? "text-emerald-700 font-semibold bg-emerald-50/40 border-l-2 border-emerald-600 rounded-l-none pl-2.5"
                                                                        : "text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100/40"
                                                                )}
                                                            >
                                                                <Link href={subItem.href} prefetch>
                                                                    {subItem.icon && <subItem.icon className="mr-2 size-4" />}
                                                                    <span>{subItem.title}</span>
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
                                    "transition-all duration-200 rounded-xl h-10 px-3 font-medium relative overflow-hidden outline-none",
                                    "group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0",
                                    isActive 
                                        ? "bg-emerald-50/80 text-emerald-800 font-semibold border-l-[3px] border-emerald-600 rounded-r-xl rounded-l-none pl-2 shadow-xs group-data-[collapsible=icon]:border-l-0 group-data-[collapsible=icon]:rounded-xl group-data-[collapsible=icon]:p-2" 
                                        : "text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100/70"
                                )}
                            >
                                <Link 
                                    href={item.href} 
                                    prefetch 
                                    className="flex items-center gap-3 w-full group-data-[collapsible=icon]:gap-0 group-data-[collapsible=icon]:justify-center"
                                >
                                    {item.icon && <item.icon className={cn("size-[18px] transition-transform duration-200 group-hover:scale-105", isActive ? "text-emerald-600" : "text-neutral-400")} />}
                                    <span className="group-data-[collapsible=icon]:hidden">{item.title}</span>
                                    {item.badge && (
                                        <span className="ml-auto text-[9px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200/50 px-1.5 py-0.5 rounded-full group-data-[collapsible=icon]:hidden">
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
