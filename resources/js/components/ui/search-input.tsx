import * as React from "react"
import { SearchIcon } from "lucide-react"
import { Input, InputProps } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export function SearchInput({ className, ...props }: InputProps) {
  return (
    <div className={cn("relative flex w-full items-center", className)}>
      <SearchIcon className="absolute left-3.5 size-4 text-muted-foreground" aria-hidden="true" />
      <Input
        type="search"
        className="pl-10"
        {...props}
      />
    </div>
  )
}
