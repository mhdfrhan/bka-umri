import * as React from "react"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: React.ReactNode
  className?: string
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-[320px] flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface p-8 text-center sm:p-12",
        className
      )}
    >
      <div className="mb-4 rounded-full bg-muted/50 p-4">
        <Icon className="size-12 text-muted-foreground" aria-hidden="true" />
      </div>
      <h3 className="mb-2 text-xl font-semibold text-foreground">
        {title}
      </h3>
      <p className="mb-6 max-w-sm text-base text-muted-foreground">
        {description}
      </p>
      {action && <div>{action}</div>}
    </div>
  )
}
