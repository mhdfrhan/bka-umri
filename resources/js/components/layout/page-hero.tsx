import * as React from 'react';
import { cn } from '@/lib/utils';

export interface PageHeroProps {
    title: string;
    description?: string;
    className?: string;
    children?: React.ReactNode; // Usually for breadcrumbs
}

export function PageHero({
    title,
    description,
    className,
    children,
}: PageHeroProps) {
    return (
        <div
            className={cn(
                'relative w-full overflow-hidden bg-primary py-12 text-primary-foreground md:py-16',
                className,
            )}
        >
            {/* Optional decorative background pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,white_1px,transparent_1px)] bg-[size:24px_24px] opacity-10" />

            <div className="relative z-10 container mx-auto flex flex-col items-center px-4 text-center md:px-6">
                {children && (
                    <div className="mb-6 flex w-full justify-center">
                        {children}
                    </div>
                )}
                <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
                    {title}
                </h1>
                {description && (
                    <p className="mt-4 max-w-[700px] text-base text-emerald-100/90 sm:text-lg">
                        {description}
                    </p>
                )}
            </div>
        </div>
    );
}
