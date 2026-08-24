import { notFound } from "next/navigation"
import { BlogEditor } from "@/components/admin/blog-editor"
import { getBlog } from "@/lib/blog-db"

export default async function EditBlogPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const blog = await getBlog(slug)

  if (!blog) {
    notFound()
  }

  return <BlogEditor initialBlog={blog} />
}
