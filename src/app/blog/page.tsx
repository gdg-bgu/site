import type { Metadata } from 'next'
import { getSession } from '@/lib/auth'
import { SiteNavbar } from '@/components/site-navbar'
import { SiteFooter } from '@/components/site-footer'
import { BlogExplorer } from '@/components/blog/blog-explorer'
import { categories, type Category } from '@/lib/blog-data'
import { publishedBlogs } from '@/lib/blog-db'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Blog — GDG On Campus BGU',
  description: 'Technical blogs, tutorials, and event recaps from the GDG BGU developer community.',
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>
}) {
  const { category } = await searchParams
  const initialCategory = categories.includes(category as Category) ? (category as Category) : undefined
  const blogs = await publishedBlogs()
  const session = await getSession()
  const canEdit = Boolean(session?.user)

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteNavbar />
      <main className="flex-1">
        <section className="relative overflow-hidden border-b border-border">
          <div className="pointer-events-none absolute inset-0 bg-grid [mask-image:radial-gradient(ellipse_at_top,black,transparent_75%)]" />
          <div className="relative mx-auto max-w-6xl px-5 py-16 lg:px-8 lg:py-20">
            <p className="text-sm font-medium text-primary">The GDG BGU journal</p>
            <h1 className="mt-3 text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              Latest from GDG BGU
            </h1>
            <p className="mt-4 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground">
              Tutorials, deep dives, and event recaps written by students, for students. Filter by topic or search
              for exactly what you need.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-12 lg:px-8 lg:py-16">
          <BlogExplorer blogs={blogs} initialCategory={initialCategory} canEdit={canEdit} />
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
