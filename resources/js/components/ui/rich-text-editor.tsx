import * as React from "react"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Link from "@tiptap/extension-link"
import Underline from "@tiptap/extension-underline"
import { cn } from "@/lib/utils"
import {
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
  LinkIcon,
  ListIcon,
  ListOrderedIcon,
  QuoteIcon,
  Heading2Icon,
  Heading3Icon,
} from "lucide-react"

export interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  error?: string
  className?: string
}

export function RichTextEditor({ value, onChange, error, className }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3],
        },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-primary underline",
        },
      }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-sm sm:prose-base max-w-none focus:outline-none min-h-[200px] px-4 py-3",
          "prose-p:my-2 prose-headings:my-4 prose-ul:my-2 prose-ol:my-2 prose-li:my-0",
          "focus:ring-0"
        ),
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  React.useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value, { emitUpdate: false })
    }
  }, [value, editor])

  if (!editor) return null

  const toggleLink = () => {
    const previousUrl = editor.getAttributes("link").href
    const url = window.prompt("URL", previousUrl)
    if (url === null) return
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run()
      return
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run()
  }

  return (
    <div className={cn(
      "flex flex-col rounded-xl border border-input bg-surface overflow-hidden transition-colors focus-within:border-primary focus-within:ring-[3px] focus-within:ring-primary/20",
      error ? "border-destructive focus-within:border-destructive focus-within:ring-destructive/20" : "",
      className
    )}>
      <div className="flex flex-wrap items-center gap-1 border-b border-border bg-muted/30 p-2">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={cn("flex size-8 items-center justify-center rounded-md hover:bg-muted text-muted-foreground transition-colors", editor.isActive("bold") ? "bg-muted text-foreground" : "")}
        >
          <BoldIcon className="size-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={cn("flex size-8 items-center justify-center rounded-md hover:bg-muted text-muted-foreground transition-colors", editor.isActive("italic") ? "bg-muted text-foreground" : "")}
        >
          <ItalicIcon className="size-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={cn("flex size-8 items-center justify-center rounded-md hover:bg-muted text-muted-foreground transition-colors", editor.isActive("underline") ? "bg-muted text-foreground" : "")}
        >
          <UnderlineIcon className="size-4" />
        </button>
        <div className="h-4 w-[1px] bg-border mx-1" />
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={cn("flex size-8 items-center justify-center rounded-md hover:bg-muted text-muted-foreground transition-colors", editor.isActive("heading", { level: 2 }) ? "bg-muted text-foreground" : "")}
        >
          <Heading2Icon className="size-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={cn("flex size-8 items-center justify-center rounded-md hover:bg-muted text-muted-foreground transition-colors", editor.isActive("heading", { level: 3 }) ? "bg-muted text-foreground" : "")}
        >
          <Heading3Icon className="size-4" />
        </button>
        <div className="h-4 w-[1px] bg-border mx-1" />
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={cn("flex size-8 items-center justify-center rounded-md hover:bg-muted text-muted-foreground transition-colors", editor.isActive("bulletList") ? "bg-muted text-foreground" : "")}
        >
          <ListIcon className="size-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={cn("flex size-8 items-center justify-center rounded-md hover:bg-muted text-muted-foreground transition-colors", editor.isActive("orderedList") ? "bg-muted text-foreground" : "")}
        >
          <ListOrderedIcon className="size-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={cn("flex size-8 items-center justify-center rounded-md hover:bg-muted text-muted-foreground transition-colors", editor.isActive("blockquote") ? "bg-muted text-foreground" : "")}
        >
          <QuoteIcon className="size-4" />
        </button>
        <div className="h-4 w-[1px] bg-border mx-1" />
        <button
          type="button"
          onClick={toggleLink}
          className={cn("flex size-8 items-center justify-center rounded-md hover:bg-muted text-muted-foreground transition-colors", editor.isActive("link") ? "bg-muted text-foreground" : "")}
        >
          <LinkIcon className="size-4" />
        </button>
      </div>
      <EditorContent editor={editor} className="bg-transparent" />
      {error && <p className="p-3 pt-0 text-xs font-medium text-destructive">{error}</p>}
    </div>
  )
}
