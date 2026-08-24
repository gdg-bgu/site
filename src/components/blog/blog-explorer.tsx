'use client'

import { useMemo, useState } from 'react'
import { Search, SlidersHorizontal } from 'lucide-react'
import type { Blog, Category } from '@/lib/blog-data'
import { categories, categoryColor } from '@/lib/blog-data'
import { BlogCard } from '@/components/blog-card'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

type Filter = 'All' | Category

export function BlogExplorer({
  blogs,
  initialCategory,
  canEdit = false,
}: {
  blogs: Blog[]
  initialCategory?: Category
  canEdit?: boolean
}) {
  const [query, setQuery] = useState('')
  const [active, setActive] = useState<Filter>(initialCategory ?? 'All')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return blogs.filter((blog) => {
      const matchesCategory = active === 'All' || blog.category === active
      const matchesQuery =
        q === '' ||
        blog.title.toLowerCase().includes(q) ||
        blog.description.toLowerCase().includes(q) ||
        blog.author.name.toLowerCase().includes(q)
      return matchesCategory && matchesQuery
    })
  }, [blogs, active, query])

  const filters: Filter[] = ['All', ...categories]

  return (
    <div>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-md">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search articles, topics, or authors..."
            className="h-12 rounded-full border-border bg-card pl-11 text-base shadow-sm"
            aria-label="Search articles"
          />
        </div>
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <SlidersHorizontal className="h-4 w-4" />
          {filtered.length} {filtered.length === 1 ? 'article' : 'articles'}
        </p>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {filters.map((filter) => {
          const isActive = active === filter
          const color = filter === 'All' ? 'var(--primary)' : categoryColor[filter as Category]
          return (
            <button
              key={filter}
              type="button"
              onClick={() => setActive(filter)}
              aria-pressed={isActive}
              className={cn(
                'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all',
                isActive
                  ? 'border-transparent text-white shadow-sm'
                  : 'border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground',
              )}
              style={isActive ? { backgroundColor: color } : undefined}
            >
              {filter !== 'All' && (
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: isActive ? 'white' : color }}
                />
              )}
              {filter}
            </button>
          )
        })}
      </div>

      {filtered.length > 0 ? (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((blog) => (
            <BlogCard key={blog.slug} blog={blog} canEdit={canEdit} />
          ))}
        </div>
      ) : (
        <div className="mt-16 flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-20 text-center">
          <Search className="h-8 w-8 text-muted-foreground" />
          <p className="mt-4 text-lg font-medium text-foreground">No articles found</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Try a different search term or category filter.
          </p>
        </div>
      )}
    </div>
  )
}
