import * as React from "react"
import { cn } from "@/lib/utils"

export interface PageHeroProps {
  title: string
  description?: string
  className?: string
  children?: React.ReactNode // Usually for breadcrumbs
}

export function PageHero({ title, description, className, children }: PageHeroProps) {
  return (
    <div className={cn("relative w-full bg-primary py-12 md:py-16 text-primary-foreground overflow-hidden", className)}>
      {/* Optional decorative background pattern */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,white_1px,transparent_1px)] bg-[size:24px_24px]" />
      
      <div className="container relative z-10 mx-auto px-4 md:px-6 flex flex-col items-center text-center">
        {children && (
          <div className="mb-6 flex justify-center w-full">
            {children}
          </div>
        )}
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl text-white">
          {title}
        </h1>
        {description && (
          <p className="mt-4 max-w-[700px] text-base sm:text-lg text-emerald-100/90">
            {description}
          </p>
        )}
      </div>
    </div>
  )
}
