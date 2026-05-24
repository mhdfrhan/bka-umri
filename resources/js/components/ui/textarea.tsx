import * as React from "react"

import { cn } from "@/lib/utils"

export interface TextareaProps
  extends React.ComponentProps<"textarea"> {
  error?: boolean;
}

function Textarea({ className, error, ...props }: TextareaProps) {
  return (
    <textarea
      data-slot="textarea"
      aria-invalid={error ? "true" : undefined}
      className={cn(
        "border-input placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground flex min-h-[80px] w-full rounded-lg border-[1.5px] bg-transparent px-3.5 py-2.5 text-base shadow-xs transition-[color,box-shadow,border-color] outline-none disabled:cursor-not-allowed disabled:bg-[#f0f0f0] disabled:opacity-100 md:text-sm",
        "focus-visible:border-primary focus-visible:ring-primary/20 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
