import * as React from "react"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Link from "@tiptap/extension-link"
import Underline from "@tiptap/extension-underline"
import ImageExtension from "@tiptap/extension-image"
import TextAlign from "@tiptap/extension-text-align"
import { NodeSelection } from "@tiptap/pm/state"
import { cn } from "@/lib/utils"
import {
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
  StrikethroughIcon,
  LinkIcon,
  ListIcon,
  ListOrderedIcon,
  QuoteIcon,
  Heading1Icon,
  Heading2Icon,
  Heading3Icon,
  Heading4Icon,
  AlignLeftIcon,
  AlignCenterIcon,
  AlignRightIcon,
  AlignJustifyIcon,
  ImageIcon,
  FolderIcon,
} from "lucide-react"
import { ImageUploadModal } from "@/components/admin/image-upload-modal"
import { AssetPickerModal } from "@/components/admin/asset-picker-modal"
import { toast } from "sonner"

export interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  error?: string
  className?: string
}

export function RichTextEditor({ value, onChange, error, className }: RichTextEditorProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null)
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const [isAssetPickerOpen, setIsAssetPickerOpen] = React.useState(false)

  const handleTriggerImageUpload = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setIsModalOpen(true)
    }
    e.target.value = "" // Reset
  }

  const previousContentRef = React.useRef<string>(value)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4],
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        alignments: ['left', 'center', 'right', 'justify'],
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-primary underline",
        },
      }),
      ImageExtension.configure({
        HTMLAttributes: {
          class: "max-w-full rounded-xl my-4",
          loading: "lazy",
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
      handleClickOn(view, pos, node, nodePos, event, direct) {
        if (node.type.name === "image") {
          const selection = NodeSelection.create(view.state.doc, nodePos);
          view.dispatch(view.state.tr.setSelection(selection));
          return true;
        }
        return false;
      },
    },
    onUpdate: ({ editor }) => {
      const newHtml = editor.getHTML()

      // Detect removed images and delete them from server storage immediately
      const extractSrcs = (html: string): string[] => {
        const srcs: string[] = []
        const parser = new DOMParser()
        const doc = parser.parseFromString(html, 'text/html')
        doc.querySelectorAll('img').forEach(img => {
          const src = img.getAttribute('src')
          if (src && (src.startsWith('/storage/') || src.includes('/storage/'))) {
            srcs.push(src)
          }
        })
        return srcs
      }

      const oldSrcs = extractSrcs(previousContentRef.current)
      const newSrcs = extractSrcs(newHtml)
      const removedSrcs = oldSrcs.filter(src => !newSrcs.includes(src))

      if (removedSrcs.length > 0) {
        const csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || ''
        removedSrcs.forEach(url => {
          fetch('/admin/editor-image', {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              'X-CSRF-TOKEN': csrfToken,
              'X-Requested-With': 'XMLHttpRequest',
            },
            body: JSON.stringify({ url }),
          }).catch(() => {
            // Silent fail — cleanup will happen again on save
          })
        })
      }

      previousContentRef.current = newHtml
      onChange(newHtml)
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
      "flex flex-col rounded-xl border border-input bg-surface transition-colors focus-within:border-primary focus-within:ring-[3px] focus-within:ring-primary/20",
      error ? "border-destructive focus-within:border-destructive focus-within:ring-destructive/20" : "",
      className
    )}>
      <div className="sticky top-0 z-10 flex flex-wrap items-center gap-1 rounded-t-xl border-b border-border bg-muted/80 p-2 backdrop-blur-sm">
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
          title="Underline"
        >
          <UnderlineIcon className="size-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={cn("flex size-8 items-center justify-center rounded-md hover:bg-muted text-muted-foreground transition-colors", editor.isActive("strike") ? "bg-muted text-foreground" : "")}
          title="Strikethrough"
        >
          <StrikethroughIcon className="size-4" />
        </button>
        <div className="h-4 w-[1px] bg-border mx-1" />
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={cn("flex size-8 items-center justify-center rounded-md hover:bg-muted text-muted-foreground transition-colors", editor.isActive("heading", { level: 1 }) ? "bg-muted text-foreground" : "")}
          title="Heading 1"
        >
          <Heading1Icon className="size-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={cn("flex size-8 items-center justify-center rounded-md hover:bg-muted text-muted-foreground transition-colors", editor.isActive("heading", { level: 2 }) ? "bg-muted text-foreground" : "")}
          title="Heading 2"
        >
          <Heading2Icon className="size-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={cn("flex size-8 items-center justify-center rounded-md hover:bg-muted text-muted-foreground transition-colors", editor.isActive("heading", { level: 3 }) ? "bg-muted text-foreground" : "")}
          title="Heading 3"
        >
          <Heading3Icon className="size-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
          className={cn("flex size-8 items-center justify-center rounded-md hover:bg-muted text-muted-foreground transition-colors", editor.isActive("heading", { level: 4 }) ? "bg-muted text-foreground" : "")}
          title="Heading 4"
        >
          <Heading4Icon className="size-4" />
        </button>
        <div className="h-4 w-[1px] bg-border mx-1" />
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={cn("flex size-8 items-center justify-center rounded-md hover:bg-muted text-muted-foreground transition-colors", editor.isActive("bulletList") ? "bg-muted text-foreground" : "")}
          title="Bullet List"
        >
          <ListIcon className="size-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={cn("flex size-8 items-center justify-center rounded-md hover:bg-muted text-muted-foreground transition-colors", editor.isActive("orderedList") ? "bg-muted text-foreground" : "")}
          title="Numbered List"
        >
          <ListOrderedIcon className="size-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={cn("flex size-8 items-center justify-center rounded-md hover:bg-muted text-muted-foreground transition-colors", editor.isActive("blockquote") ? "bg-muted text-foreground" : "")}
          title="Blockquote"
        >
          <QuoteIcon className="size-4" />
        </button>
        <div className="h-4 w-[1px] bg-border mx-1" />
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={cn("flex size-8 items-center justify-center rounded-md hover:bg-muted text-muted-foreground transition-colors", editor.isActive({ textAlign: 'left' }) ? "bg-muted text-foreground" : "")}
          title="Align Left"
        >
          <AlignLeftIcon className="size-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={cn("flex size-8 items-center justify-center rounded-md hover:bg-muted text-muted-foreground transition-colors", editor.isActive({ textAlign: 'center' }) ? "bg-muted text-foreground" : "")}
          title="Align Center"
        >
          <AlignCenterIcon className="size-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={cn("flex size-8 items-center justify-center rounded-md hover:bg-muted text-muted-foreground transition-colors", editor.isActive({ textAlign: 'right' }) ? "bg-muted text-foreground" : "")}
          title="Align Right"
        >
          <AlignRightIcon className="size-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
          className={cn("flex size-8 items-center justify-center rounded-md hover:bg-muted text-muted-foreground transition-colors", editor.isActive({ textAlign: 'justify' }) ? "bg-muted text-foreground" : "")}
          title="Justify"
        >
          <AlignJustifyIcon className="size-4" />
        </button>
        <div className="h-4 w-[1px] bg-border mx-1" />
        <button
          type="button"
          onClick={toggleLink}
          className={cn("flex size-8 items-center justify-center rounded-md hover:bg-muted text-muted-foreground transition-colors", editor.isActive("link") ? "bg-muted text-foreground" : "")}
        >
          <LinkIcon className="size-4" />
        </button>
        <button
          type="button"
          onClick={handleTriggerImageUpload}
          className="flex size-8 items-center justify-center rounded-md hover:bg-muted text-muted-foreground transition-colors"
          title="Unggah Gambar"
        >
          <ImageIcon className="size-4" />
        </button>
        <button
          type="button"
          onClick={() => setIsAssetPickerOpen(true)}
          className="flex size-8 items-center justify-center rounded-md hover:bg-muted text-muted-foreground transition-colors"
          title="Sisipkan dari Aset Media"
        >
          <FolderIcon className="size-4" />
        </button>
      </div>
      <EditorContent editor={editor} className="bg-transparent" />
      {error && <p className="p-3 pt-0 text-xs font-medium text-destructive">{error}</p>}

      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />

      <ImageUploadModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedFile(null)
        }}
        file={selectedFile}
        onConfirm={async (result) => {
          try {
            const response = await fetch('/admin/editor-upload', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
                'X-Requested-With': 'XMLHttpRequest',
              },
              body: JSON.stringify({
                image: result.base64,
                name: result.name,
              }),
            });
            if (!response.ok) throw new Error();
            const data = await response.json();
            editor.chain().focus().setImage({ src: data.url, alt: result.name }).run();
            toast.success('Gambar berhasil diunggah & disisipkan!');
          } catch (e) {
            toast.error('Gagal mengunggah gambar ke server.');
          } finally {
            setIsModalOpen(false)
            setSelectedFile(null)
          }
        }}
      />

      <AssetPickerModal
        isOpen={isAssetPickerOpen}
        onClose={() => setIsAssetPickerOpen(false)}
        onSelect={(url) => {
          editor.chain().focus().setImage({ src: url }).run()
          setIsAssetPickerOpen(false)
        }}
      />
    </div>
  )
}
