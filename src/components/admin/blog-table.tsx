'use client'

import { useMemo, useState, useTransition } from 'react'
import Link from 'next/link'
import { Eye, MoreHorizontal, Pencil, Search, Trash2, Archive, Send } from 'lucide-react'
import type { Blog, BlogStatus } from '@/lib/blog-data'
import { formatDate } from '@/lib/blog-data'
import { deleteBlogAction, togglePublishBlogAction } from '@/app/actions/blog-actions'
import { Input } from '@/components/ui/input'
import { AuthorTag } from '@/components/author-tag'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

const statusStyles: Record<BlogStatus, string> = {
  Published: 'bg-[var(--google-green)]/12 text-[var(--google-green)]',
  Draft: 'bg-[var(--google-yellow)]/15 text-[color-mix(in_oklch,var(--google-yellow),black_25%)]',
  Archived: 'bg-muted text-muted-foreground',
}

function StatusBadge({ status }: { status: BlogStatus }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium', statusStyles[status])}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  )
}

const tabs: Array<{ label: string; value: 'All' | BlogStatus }> = [
  { label: 'All', value: 'All' },
  { label: 'Published', value: 'Published' },
  { label: 'Drafts', value: 'Draft' },
  { label: 'Archived', value: 'Archived' },
]

export function BlogTable({
  blogs,
  initialStatus = 'All',
  title = 'Manage blogs',
}: {
  blogs: Blog[]
  initialStatus?: 'All' | BlogStatus
  title?: string
}) {
  const [status, setStatus] = useState<'All' | BlogStatus>(initialStatus)
  const [query, setQuery] = useState('')
  const [isPending, startTransition] = useTransition()

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return blogs.filter((b) => {
      const matchStatus = status === 'All' || b.status === status
      const matchQuery = q === '' || b.title.toLowerCase().includes(q) || b.author.name.toLowerCase().includes(q)
      return matchStatus && matchQuery
    })
  }, [blogs, status, query])

  return (
    <div className="rounded-2xl border border-border bg-card">
      <div className="flex flex-col gap-4 border-b border-border p-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-foreground">{title}</h2>
          <p className="text-sm text-muted-foreground">{filtered.length} entries</p>
        </div>
        <div className="relative w-full lg:w-72">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search blogs..."
            className="h-10 rounded-full pl-10"
            aria-label="Search blogs"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-1 border-b border-border p-3">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setStatus(tab.value)}
            aria-pressed={status === tab.value}
            className={cn(
              'rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
              status === tab.value ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="min-w-[260px]">Title</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Views</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((blog) => (
              <TableRow key={blog.slug}>
                <TableCell>
                  <Link
                    href={`/blog/${blog.slug}`}
                    className="line-clamp-1 font-medium text-foreground hover:text-primary"
                  >
                    {blog.title}
                  </Link>
                  <span className="text-xs text-muted-foreground">{blog.category}</span>
                </TableCell>
                <TableCell>
                  <AuthorTag author={blog.author} />
                </TableCell>
                <TableCell>
                  <StatusBadge status={blog.status} />
                </TableCell>
                <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                  {formatDate(blog.date)}
                </TableCell>
                <TableCell className="text-right text-sm tabular-nums text-muted-foreground">
                  {blog.views.toLocaleString()}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground"
                      aria-label={`Actions for ${blog.title}`}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/blog/${blog.slug}`}>
                          <Eye style={{ width: 16, height: 16 }} />
                          View
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/blogs/edit/${blog.slug}`}>
                          <Pencil style={{ width: 16, height: 16 }} />
                          Edit
                        </Link>
                      </DropdownMenuItem>
                      {blog.status !== 'Published' && (
                        <DropdownMenuItem
                          onClick={() => {
                            startTransition(async () => {
                              await togglePublishBlogAction(blog.slug, blog.status)
                            })
                          }}
                        >
                          <Send style={{ width: 16, height: 16 }} />
                          Publish
                        </DropdownMenuItem>
                      )}
                      {blog.status === 'Published' && (
                        <DropdownMenuItem
                          onClick={() => {
                            startTransition(async () => {
                              await togglePublishBlogAction(blog.slug, blog.status)
                            })
                          }}
                        >
                          <Archive style={{ width: 16, height: 16 }} />
                          Unpublish (Draft)
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete "${blog.title}"?`)) {
                            startTransition(async () => {
                              await deleteBlogAction(blog.slug)
                            })
                          }
                        }}
                      >
                        <Trash2 style={{ width: 16, height: 16 }} />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {filtered.length === 0 && (
          <div className="py-16 text-center text-sm text-muted-foreground">No blogs match your filters.</div>
        )}
      </div>
    </div>
  )
}
