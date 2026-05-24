import * as React from "react"
import { UploadCloudIcon, XIcon, FileIcon, ImageIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export interface FileUploadProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange"> {
  label?: string
  description?: string
  onChange?: (file: File | null) => void
  value?: File | null | string
  error?: string
  className?: string
}

export function FileUpload({
  label = "Pilih Berkas",
  description = "Klik atau tarik & letakkan berkas di sini",
  onChange,
  value,
  error,
  className,
  accept,
  ...props
}: FileUploadProps) {
  const [isDragging, setIsDragging] = React.useState(false)
  const [preview, setPreview] = React.useState<string | null>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    if (!value) {
      setPreview(null)
      return
    }

    if (typeof value === "string") {
      setPreview(value)
    } else if (value instanceof File) {
      if (value.type.startsWith("image/")) {
        const objectUrl = URL.createObjectURL(value)
        setPreview(objectUrl)
        return () => URL.revokeObjectURL(objectUrl)
      } else {
        setPreview(null)
      }
    }
  }, [value])

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0]
      if (onChange) onChange(file)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      if (onChange) onChange(file)
    }
  }

  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (inputRef.current) {
      inputRef.current.value = ""
    }
    if (onChange) onChange(null)
  }

  const isImage = preview !== null
  const hasValue = value !== null && value !== undefined && value !== ""
  const fileName = value instanceof File ? value.name : typeof value === "string" ? value.split("/").pop() : ""

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div
        className={cn(
          "relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 transition-colors",
          isDragging ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50",
          error ? "border-destructive bg-destructive/5" : "",
          hasValue ? "border-solid p-4" : ""
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !hasValue && inputRef.current?.click()}
      >
        <input
          type="file"
          ref={inputRef}
          className="hidden"
          accept={accept}
          onChange={handleChange}
          {...props}
        />

        {!hasValue ? (
          <div className="flex flex-col items-center justify-center text-center">
            <div className="mb-3 rounded-full bg-muted p-3">
              <UploadCloudIcon className="size-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground">{label}</p>
            <p className="mt-1 text-xs text-muted-foreground">{description}</p>
          </div>
        ) : (
          <div className="flex w-full items-center justify-between gap-4">
            <div className="flex items-center gap-3 overflow-hidden">
              {isImage ? (
                <div className="flex size-12 shrink-0 items-center justify-center rounded-lg border bg-muted object-cover overflow-hidden">
                  <img src={preview!} alt="Preview" className="size-full object-cover" />
                </div>
              ) : (
                <div className="flex size-12 shrink-0 items-center justify-center rounded-lg border bg-muted">
                  <FileIcon className="size-6 text-muted-foreground" />
                </div>
              )}
              <div className="flex flex-col overflow-hidden">
                <span className="truncate text-sm font-medium text-foreground">{fileName}</span>
                <span className="text-xs text-muted-foreground">Berhasil diunggah</span>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={handleRemove}
            >
              <XIcon className="size-4" />
            </Button>
          </div>
        )}
      </div>
      {error && <p className="text-xs font-medium text-destructive">{error}</p>}
    </div>
  )
}
