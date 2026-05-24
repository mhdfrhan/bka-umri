import * as React from "react"
import { Badge } from "@/components/ui/badge"

export type StatusType = "published" | "draft" | "archived" | "pending"

export interface StatusBadgeProps extends React.ComponentProps<typeof Badge> {
  status: StatusType
  label?: string
}

export function StatusBadge({ status, label, ...props }: StatusBadgeProps) {
  const statusConfig: Record<StatusType, { variant: "success" | "neutral" | "error" | "warning"; defaultLabel: string }> = {
    published: { variant: "success", defaultLabel: "Dipublikasikan" },
    draft: { variant: "neutral", defaultLabel: "Draf" },
    archived: { variant: "error", defaultLabel: "Diarsipkan" },
    pending: { variant: "warning", defaultLabel: "Menunggu" },
  }

  const config = statusConfig[status]

  return (
    <Badge variant={config.variant} {...props}>
      {label || config.defaultLabel}
    </Badge>
  )
}
