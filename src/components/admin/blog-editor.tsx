"use client"

import type React from "react"

import { useMemo, useRef, useState } from "react"
import dynamic from "next/dynamic"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Calendar, Clock, Eye, Save, Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { CategoryBadge } from "@/components/blog-card"
import { AuthorTag } from "@/components/author-tag"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { categories, categoryColor, type Category, type Blog } from "@/lib/blog-data"

import { useTransition } from "react"
import { createBlogAction, updateBlogAction } from "@/app/actions/blog-actions"

import "react-quill-new/dist/quill.snow.css"

// Quill touches `document` directly, so it must be loaded client-side only.
const ReactQuill = dynamic(() => import("react-quill-new"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[320px] items-center justify-center rounded-xl border bg-muted/30 text-sm text-muted-foreground">
      Loading editor...
    </div>
  ),
})

const quillModules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["blockquote", "code-block"],
    ["link", "image"],
    ["clean"],
  ],
}

const quillFormats = [
  "header",
  "bold",
  "italic",
  "underline",
  "strike",
  "list",
  "blockquote",
  "code-block",
  "link",
  "image",
]

const coverByCategory: Record<Category, string> = {
  "Web Development": "/images/blog-web.png",
  "AI/ML": "/images/blog-ai.png",
  Cloud: "/images/blog-cloud.png",
  Android: "/images/blog-android.png",
  Events: "/images/blog-events.png",
}

// Rough read-time estimate from rendered HTML — strips tags before counting words.
function estimateReadTime(html: string) {
  const text = html.replace(/<[^>]*>/g, " ")
  const words = text.trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / 200))
}

interface BlogEditorProps {
  initialBlog?: Blog
}

export function BlogEditor({ initialBlog }: BlogEditorProps = {}) {
  const isEditing = Boolean(initialBlog)

  const [title, setTitle] = useState(initialBlog?.title || "")
  const [excerpt, setExcerpt] = useState(initialBlog?.description || "")
  const [category, setCategory] = useState<Category>(initialBlog?.category || "Web Development")
  const [tagsInput, setTagsInput] = useState("")
  const [content, setContent] = useState(
    initialBlog?.contentHtml || initialBlog?.content?.[0]?.body?.join("\n\n") || ""
  )
  const [status, setStatus] = useState<"draft" | "published">(
    initialBlog?.status === "Draft" ? "draft" : "published"
  )
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

  const [customCover, setCustomCover] = useState<string | null>(initialBlog?.cover || null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const tags = useMemo(
    () =>
      tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    [tagsInput],
  )

  const readTime = useMemo(() => estimateReadTime(content), [content])

  const cover = customCover || coverByCategory[category]
  const accent = categoryColor[category]

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 10 * 1024 * 1024) {
      setError("Image file size should be less than 10MB.")
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new window.Image()
      img.onload = () => {
        const MAX_WIDTH = 1200
        const MAX_HEIGHT = 800
        let width = img.width
        let height = img.height

        if (width > MAX_WIDTH) {
          height = Math.round((height * MAX_WIDTH) / width)
          width = MAX_WIDTH
        }
        if (height > MAX_HEIGHT) {
          width = Math.round((width * MAX_HEIGHT) / height)
          height = MAX_HEIGHT
        }

        const canvas = document.createElement("canvas")
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext("2d")
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height)
          const compressedBase64 = canvas.toDataURL("image/jpeg", 0.85)
          setCustomCover(compressedBase64)
          setError(null)
        } else if (typeof event.target?.result === "string") {
          setCustomCover(event.target.result)
          setError(null)
        }
      }
      if (typeof event.target?.result === "string") {
        img.src = event.target.result
      }
    }
    reader.readAsDataURL(file)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const formData = new FormData()
    formData.append("title", title)
    formData.append("description", excerpt)
    formData.append("category", category)
    formData.append("cover", cover)
    formData.append("status", status === "published" ? "Published" : "Draft")
    formData.append("content", content)
    formData.append("contentMdx", content)

    startTransition(async () => {
      const res = isEditing && initialBlog
        ? await updateBlogAction(initialBlog.slug, formData)
        : await createBlogAction(formData)
      if (res?.error) {
        setError(res.error)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="icon" className="rounded-full">
            <Link href="/admin/blogs" aria-label="Back to blogs">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-balance">
              {isEditing ? "Edit blog post" : "Create blog post"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {isEditing ? "Update and save changes to your post." : "Draft, preview, and publish to the community."}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsPreviewOpen(true)}
            className="gap-2 bg-transparent"
          >
            <Eye className="h-4 w-4" />
            Preview
          </Button>
          <Button type="submit" disabled={isPending} className="gap-2">
            <Save className="h-4 w-4" />
            {isPending ? "Saving..." : isEditing ? "Update Post" : "Publish Post"}
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive font-medium">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_23rem]">
        <div className="flex flex-col gap-6">
          <div className="rounded-2xl border bg-card p-6">
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="An unmissable, specific headline"
                  className="h-11 text-base"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="excerpt">Excerpt</Label>
                <Textarea
                  id="excerpt"
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="A short summary shown on cards and previews."
                  rows={2}
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border bg-card p-6">
            <div className="mb-3 flex items-center justify-between">
              <Label htmlFor="content">Content</Label>
              <span className="text-xs text-muted-foreground">{readTime} min read</span>
            </div>
            <div className="quill-wrapper rounded-xl border overflow-hidden [&_.ql-toolbar]:rounded-t-xl [&_.ql-toolbar]:border-x-0 [&_.ql-toolbar]:border-t-0 [&_.ql-container]:rounded-b-xl [&_.ql-container]:border-x-0 [&_.ql-container]:border-b-0 [&_.ql-editor]:min-h-[320px] [&_.ql-editor]:text-sm [&_.ql-editor]:leading-relaxed [&_.ql-editor.ql-blank::before]:!text-white [&_.ql-editor.ql-blank::before]:!not-italic">
              <ReactQuill
                id="content"
                theme="snow"
                value={content}
                onChange={setContent}
                modules={quillModules}
                formats={quillFormats}
                placeholder="Start writing your thoughts here..."
              />
            </div>
          </div>
        </div>

        <aside className="flex flex-col gap-6">
          <div className="rounded-2xl border bg-card p-6">
            <h2 className="mb-4 text-sm font-semibold">Publishing</h2>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="status">Status</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as "draft" | "published")}>
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="category">Category</Label>
                <Select value={category} onValueChange={(v) => setCategory(v as Category)}>
                  <SelectTrigger id="category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="tags">Tags</Label>
                <Input
                  id="tags"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="nextjs, react, performance"
                />
                {tags.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {tags.map((t) => (
                      <Badge key={t} variant="secondary" className="rounded-full font-normal">
                        {t}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border bg-card p-6">
            <h2 className="mb-4 text-sm font-semibold">Cover image</h2>
            <div className="relative aspect-[16/10] overflow-hidden rounded-xl border">
              <Image src={cover || "/placeholder.svg"} alt="Cover preview" fill className="object-cover" />
              <span
                className="absolute left-3 top-3 rounded-full border border-border/60 bg-background/90 px-2.5 py-0.5 text-xs font-medium"
                style={{ color: accent }}
              >
                {category}
              </span>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <div className="mt-3 flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="w-full gap-2 bg-transparent"
              >
                <Upload className="h-4 w-4" />
                {customCover ? "Change cover" : "Upload cover"}
              </Button>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {customCover ? "Custom cover uploaded." : "Auto-selected from category. Upload your own to override."}
            </p>
          </div>
        </aside>
      </div>

      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 rounded-3xl border border-border bg-background shadow-2xl">
          <div className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-background/95 backdrop-blur-md px-6 py-4">
            <div className="flex items-center gap-3">
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-sm font-semibold text-foreground">Live Article Preview</span>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setIsPreviewOpen(false)}
              className="rounded-full h-8 w-8 hover:bg-muted"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="p-6 md:p-10">
            <article className="max-w-3xl mx-auto">
              <div className="mb-4">
                <CategoryBadge category={category} />
              </div>

              <h1 className="text-balance text-3xl md:text-4xl font-bold leading-[1.15] tracking-tight text-foreground">
                {title || "Untitled Blog Post"}
              </h1>

              <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
                {excerpt || "No summary provided yet."}
              </p>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-y border-border py-4 my-6">
                <AuthorTag
                  author={
                    initialBlog?.author || {
                      name: "GDG Member",
                      role: "Contributor",
                      initials: "MB",
                      color: "var(--google-blue)",
                    }
                  }
                  size="lg"
                  showRole
                />
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    {readTime} min read
                  </span>
                </div>
              </div>

              <div
                className="prose dark:prose-invert max-w-none text-[17px] leading-8 text-foreground/85 [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:my-4 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:mt-8 [&_h2]:mb-4 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:mt-6 [&_h3]:mb-3 [&_p]:mt-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-4 [&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:pl-4 [&_blockquote]:italic [&_img]:rounded-2xl [&_img]:my-4 [&_pre]:bg-muted [&_pre]:p-4 [&_pre]:rounded-xl [&_pre]:overflow-x-auto [&_code]:font-mono [&_code]:text-sm"
                dangerouslySetInnerHTML={{
                  __html: content || '<p class="text-muted-foreground italic">Start writing content in the editor to preview it here...</p>',
                }}
              />
            </article>
          </div>
        </DialogContent>
      </Dialog>
    </form>
  )
}