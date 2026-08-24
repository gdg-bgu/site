import { FileText, CheckCircle2, FileEdit, Eye, TrendingUp } from 'lucide-react'
import { getAllBlogs } from '@/lib/blog-db'
import type { Blog } from '@/lib/blog-data'

export async function StatCards({ blogs: initialBlogs }: { blogs?: Blog[] } = {}) {
  const blogs = initialBlogs || (await getAllBlogs())
  const total = blogs.length
  const published = blogs.filter((b) => b.status === 'Published').length
  const drafts = blogs.filter((b) => b.status === 'Draft').length
  const views = blogs.reduce((sum, b) => sum + (b.views || 0), 0)

  const stats = [
    { label: 'Total Blogs', value: total.toString(), icon: FileText, color: 'var(--google-blue)', trend: 'Saved in MongoDB' },
    { label: 'Published', value: published.toString(), icon: CheckCircle2, color: 'var(--google-green)', trend: 'Live on Site' },
    { label: 'Drafts', value: drafts.toString(), icon: FileEdit, color: 'var(--google-yellow)', trend: 'In progress' },
    { label: 'Total Views', value: views.toLocaleString(), icon: Eye, color: 'var(--google-red)', trend: 'Cumulative Views' },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <div key={stat.label} className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <span
                className="flex h-10 w-10 items-center justify-center rounded-xl text-white"
                style={{ backgroundColor: stat.color }}
              >
                <Icon style={{ width: 18, height: 18 }} />
              </span>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="mt-4 text-3xl font-semibold tracking-tight text-foreground">{stat.value}</p>
            <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
            <p className="mt-3 text-xs font-medium" style={{ color: stat.color }}>
              {stat.trend}
            </p>
          </div>
        )
      })}
    </div>
  )
}
