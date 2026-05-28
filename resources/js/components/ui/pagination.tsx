import * as React from "react"
import { Link } from "@inertiajs/react"
import { ChevronLeftIcon, ChevronRightIcon, MoreHorizontalIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export interface PaginationLink {
  url: string | null
  label: string
  active: boolean
}

export interface PaginationProps {
  links: PaginationLink[]
  className?: string
}

export function Pagination({ links, className }: PaginationProps) {
  // Return null if there's only "Previous" and "Next"
  if (!links || links.length <= 3) return null

  return (
    <nav className={cn("flex justify-center", className)} aria-label="Pagination">
      <ul className="flex items-center gap-1 sm:gap-2">
        {links.map((link, i) => {
          const isFirst = i === 0
          const isLast = i === links.length - 1
          const isDots = link.label === "..."

          const isDisabled = !link.url
          const isActive = link.active

          if (isDots) {
            return (
              <li key={`dots-${i}`}>
                <span className="flex h-9 w-9 items-center justify-center text-[#9EAAB2]">
                  <MoreHorizontalIcon className="size-4" />
                </span>
              </li>
            )
          }

          return (
            <li key={`link-${i}`}>
              {isDisabled ? (
                <span
                  className={cn(
                    "flex h-9 min-w-9 items-center justify-center rounded-full px-3 text-sm font-medium",
                    "text-[#9EAAB2] opacity-50",
                    isFirst || isLast ? "px-2 sm:px-3" : ""
                  )}
                  aria-disabled="true"
                >
                  {isFirst && <ChevronLeftIcon className="size-4 sm:mr-1" />}
                  <span className={cn(isFirst || isLast ? "hidden sm:inline-block" : "")}>
                    {isFirst ? "Prev" : isLast ? "Next" : link.label}
                  </span>
                  {isLast && <ChevronRightIcon className="size-4 sm:ml-1" />}
                </span>
              ) : (
                <Link
                  href={link.url!}
                  className={cn(
                    "flex h-9 min-w-9 items-center justify-center rounded-full px-3 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-[#0a6c32] text-white shadow-sm hover:bg-[#085627]"
                      : "text-[#5C6B73] hover:bg-[#e6f4ea] hover:text-[#0a6c32]",
                    isFirst || isLast ? "px-2 sm:px-3" : ""
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  {isFirst && <ChevronLeftIcon className="size-4 sm:mr-1" />}
                  <span className={cn(isFirst || isLast ? "hidden sm:inline-block" : "")}>
                    {isFirst ? "Prev" : isLast ? "Next" : link.label}
                  </span>
                  {isLast && <ChevronRightIcon className="size-4 sm:ml-1" />}
                </Link>
              )}
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
