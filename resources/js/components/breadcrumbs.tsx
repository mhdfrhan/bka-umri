import { Link } from '@inertiajs/react';
import { Fragment } from 'react';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import type { BreadcrumbItem as BreadcrumbItemType } from '@/types';
import { cn } from '@/lib/utils';

export function Breadcrumbs({
    breadcrumbs,
    variant = 'admin',
}: {
    breadcrumbs: BreadcrumbItemType[];
    variant?: 'admin' | 'public';
}) {
    const isPublic = variant === 'public';

    return (
        <>
            {breadcrumbs.length > 0 && (
                <Breadcrumb>
                    <BreadcrumbList
                        className={cn(
                            'text-xs sm:gap-2',
                            isPublic ? 'text-white/90' : 'text-neutral-500',
                        )}
                    >
                        {breadcrumbs.map((item, index) => {
                            const isLast = index === breadcrumbs.length - 1;

                            return (
                                <Fragment key={index}>
                                    <BreadcrumbItem>
                                        {isLast ? (
                                            <BreadcrumbPage
                                                className={cn(
                                                    'font-bold tracking-wide',
                                                    isPublic
                                                        ? 'text-amber-300'
                                                        : 'text-emerald-700',
                                                )}
                                            >
                                                {item.title}
                                            </BreadcrumbPage>
                                        ) : (
                                            <BreadcrumbLink
                                                asChild
                                                className={cn(
                                                    'font-semibold transition-colors',
                                                    isPublic
                                                        ? 'text-white/85 underline-offset-4 hover:text-white hover:underline'
                                                        : 'text-neutral-500 hover:text-neutral-800',
                                                )}
                                            >
                                                <Link href={item.href}>
                                                    {item.title}
                                                </Link>
                                            </BreadcrumbLink>
                                        )}
                                    </BreadcrumbItem>
                                    {!isLast && (
                                        <BreadcrumbSeparator
                                            className={cn(
                                                '[&>svg]:size-3',
                                                isPublic
                                                    ? 'text-white/60'
                                                    : 'text-neutral-300',
                                            )}
                                        />
                                    )}
                                </Fragment>
                            );
                        })}
                    </BreadcrumbList>
                </Breadcrumb>
            )}
        </>
    );
}
