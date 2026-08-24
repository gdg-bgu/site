import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { ArrowLeft, Calendar, Clock, Eye, Pencil } from 'lucide-react'
import { SiteNavbar } from '@/components/site-navbar'
import { SiteFooter } from '@/components/site-footer'
import { TableOfContents } from '@/components/blog/table-of-contents'
import { ReadingProgress } from '@/components/blog/reading-progress'
import { CategoryBadge, BlogCard } from '@/components/blog-card'
import { AuthorTag } from '@/components/author-tag'
import { formatDate } from '@/lib/blog-data'
import { MDXRemote } from 'next-mdx-remote/rsc'
import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug'
import rehypeHighlight from 'rehype-highlight'
import { mdxComponents } from '@/components/mdx-components'
import { getAllBlogs, getBlog, publishedBlogs, relatedBlogs } from '@/lib/blog-db'

export const revalidate = 3600 // regenerate every hour

export async function generateStaticParams() {
  const blogs = await publishedBlogs()
  return blogs.map((b) => ({ slug: b.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const blog = await getBlog(slug)
  if (!blog) return { title: 'Article not found — GDG BGU' }
  return {
    title: `${blog.title} — GDG BGU`,
    description: blog.description,
  }
}

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const blog = await getBlog(slug)
  if (!blog) notFound()

  const session = await getSession()
  const canEdit = Boolean(session?.user)
  const related = await relatedBlogs(blog)

  return (
    <div className="flex min-h-dvh flex-col overflow-x-clip">
      <ReadingProgress />
      <SiteNavbar />
      <main className="flex-1">
        <article className="mx-auto max-w-6xl px-5 pt-8 pb-16 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[220px_1fr]">
            <aside className="hidden lg:block">
              <div className="sticky top-24">
                <TableOfContents sections={blog.content} />
              </div>
            </aside>

            <div className="w-full min-w-0 max-w-3xl">
              <header className="mb-10">
                <div className="flex items-center justify-between">
                  <Link
                    href="/blog"
                    className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to all articles
                  </Link>

                  {canEdit && (
                    <Link
                      href={`/admin/blogs/edit/${blog.slug}`}
                      className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-medium text-foreground shadow-sm transition-colors hover:bg-primary hover:text-white"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Edit article
                    </Link>
                  )}
                </div>

                <div className="mt-6">
                  <CategoryBadge category={blog.category} />
                </div>

                <h1 className="mt-4 text-balance text-3xl font-semibold leading-[1.15] tracking-tight text-foreground sm:text-4xl md:text-5xl">
                  {blog.title}
                </h1>
                <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">{blog.description}</p>

                <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-y border-border py-4">
                  <AuthorTag author={blog.author} size="lg" showRole />
                  <div className="flex flex-wrap items-center gap-5 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar className="h-4 w-4" />
                      {formatDate(blog.date)}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="h-4 w-4" />
                      {blog.readingTime} min read
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Eye className="h-4 w-4" />
                      {blog.views.toLocaleString()} views
                    </span>
                  </div>
                </div>
              </header>

              {blog.contentMdx ? (
                <div className="prose dark:prose-invert max-w-none text-[17px] leading-8 text-foreground/85">
                  <MDXRemote
                    source={blog.contentMdx}
                    components={mdxComponents}
                    options={{
                      mdxOptions: {
                        remarkPlugins: [remarkGfm],
                        rehypePlugins: [rehypeSlug, rehypeHighlight],
                      },
                    }}
                  />
                </div>
              ) : blog.contentHtml ? (
                <div
                  className="prose dark:prose-invert max-w-none text-[17px] leading-8 text-foreground/85 [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:my-4 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:mt-8 [&_h2]:mb-4 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:mt-6 [&_h3]:mb-3 [&_p]:mt-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-4 [&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:pl-4 [&_blockquote]:italic [&_img]:rounded-2xl [&_img]:my-4 [&_pre]:bg-muted [&_pre]:p-4 [&_pre]:rounded-xl [&_pre]:overflow-x-auto [&_code]:font-mono [&_code]:text-sm"
                  dangerouslySetInnerHTML={{ __html: blog.contentHtml }}
                />
              ) : (
                blog.content.map((section) => (
                  <section key={section.id} id={section.id} className="scroll-mt-24 pb-10">
                    {section.heading && (
                      <h2 className="text-pretty text-2xl font-semibold tracking-tight text-foreground">
                        {section.heading}
                      </h2>
                    )}
                    {section.body.map((paragraph, i) => (
                      <div
                        key={i}
                        className="prose dark:prose-invert max-w-none mt-4 text-[17px] leading-8 text-foreground/85"
                        dangerouslySetInnerHTML={{ __html: paragraph }}
                      />
                    ))}
                  </section>
                ))
              )}

              <div className="mt-10 flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-secondary/40 p-6">
                <AuthorTag author={blog.author} size="lg" showRole />
                <p className="w-full text-sm leading-relaxed text-muted-foreground sm:mt-2">
                  {blog.author.name} contributes to the GDG On Campus BGU journal, sharing hands-on lessons from
                  workshops and community projects.
                </p>
              </div>
            </div>
          </div>
        </article>

        <section className="border-t border-border bg-secondary/40">
          <div className="mx-auto max-w-6xl px-5 py-16 lg:px-8 lg:py-20">
            <h2 className="text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Related articles
            </h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <BlogCard key={item.slug} blog={item} />
              ))}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
