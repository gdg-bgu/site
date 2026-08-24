'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { connectToDatabase } from '@/lib/mongodb'
import { BlogModel } from '@/lib/models/Blog'
import { Category, BlogStatus } from '@/lib/blog-data'

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export async function createBlogAction(formData: FormData) {
  const session = await getSession()
  if (!session?.user) {
    return { error: 'Unauthorized. You must be signed in.' }
  }

  const title = formData.get('title')?.toString()?.trim()
  const description = formData.get('description')?.toString()?.trim()
  const category = formData.get('category')?.toString() as Category
  const cover = formData.get('cover')?.toString()?.trim() || '/placeholder.svg'
  const rawStatus = formData.get('status')?.toString()?.toLowerCase()
  const status: BlogStatus = rawStatus === 'draft' ? 'Draft' : 'Published'
  const featured = formData.get('featured') === 'true' || formData.get('featured') === 'on'
  const contentBody = formData.get('content')?.toString()?.trim() || ''

  if (!title || !description || !category) {
    return { error: 'Title, description, and category are required.' }
  }

  const baseSlug = slugify(title)
  let slug = baseSlug
  let count = 1

  const db = await connectToDatabase()
  if (!db) {
    return { error: 'Database connection error. Please check MONGODB_URI.' }
  }

  while (await BlogModel.findOne({ slug })) {
    slug = `${baseSlug}-${count++}`
  }

  const paragraphs = contentBody.split('\n\n').filter(Boolean)
  const sections = [
    {
      id: 'section-1',
      heading: 'Overview',
      body: paragraphs.length > 0 ? paragraphs : [description],
    },
  ]

  const wordCount = contentBody.split(/\s+/).filter(Boolean).length
  const readingTime = Math.max(1, Math.ceil(wordCount / 200))

  const authorInitials = session.user.name
    ? session.user.name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
    : 'MB'

  const authorObj = {
    name: session.user.name || 'GDG Member',
    role: session.user.role || 'Member',
    initials: authorInitials,
    color: 'var(--google-blue)',
    avatar: session.user.avatar || (session.user as any).image || undefined,
  }

  const contentMdx = formData.get('contentMdx')?.toString()?.trim() || contentBody

  try {
    await BlogModel.create({
      slug,
      title,
      description,
      excerpt: description,
      cover,
      coverImage: cover,
      category,
      author: authorObj,
      date: new Date().toISOString(),
      readingTime,
      status,
      views: 0,
      featured,
      content: sections,
      contentHtml: contentBody,
      contentMdx,
    })

    revalidatePath('/')
    revalidatePath('/blog')
    revalidatePath('/admin')
    revalidatePath('/admin/blogs')
  } catch (err: any) {
    return { error: err.message || 'Failed to create blog post in MongoDB.' }
  }

  redirect('/admin/blogs')
}

export async function deleteBlogAction(slug: string) {
  const session = await getSession()
  if (!session?.user) {
    return { error: 'Unauthorized.' }
  }

  const db = await connectToDatabase()
  if (!db) return { error: 'MongoDB database not connected.' }

  try {
    await BlogModel.deleteOne({ slug })
    revalidatePath('/')
    revalidatePath('/blog')
    revalidatePath('/admin')
    revalidatePath('/admin/blogs')
    return { success: true }
  } catch (err: any) {
    return { error: err.message || 'Failed to delete blog post.' }
  }
}

export async function togglePublishBlogAction(slug: string, currentStatus: BlogStatus) {
  const session = await getSession()
  if (!session?.user) {
    return { error: 'Unauthorized.' }
  }

  const newStatus: BlogStatus = currentStatus === 'Published' ? 'Draft' : 'Published'

  const db = await connectToDatabase()
  if (!db) return { error: 'MongoDB database not connected.' }

  try {
    await BlogModel.updateOne({ slug }, { status: newStatus })
    revalidatePath('/')
    revalidatePath('/blog')
    revalidatePath('/admin')
    revalidatePath('/admin/blogs')
    return { success: true, status: newStatus }
  } catch (err: any) {
    return { error: err.message || 'Failed to update blog status.' }
  }
}

export async function updateBlogAction(originalSlug: string, formData: FormData) {
  const session = await getSession()
  if (!session?.user) {
    return { error: 'Unauthorized. You must be signed in.' }
  }

  const title = formData.get('title')?.toString()?.trim()
  const description = formData.get('description')?.toString()?.trim()
  const category = formData.get('category')?.toString() as Category
  const cover = formData.get('cover')?.toString()?.trim() || '/placeholder.svg'
  const rawStatus = formData.get('status')?.toString()?.toLowerCase()
  const status: BlogStatus = rawStatus === 'draft' ? 'Draft' : 'Published'
  const contentBody = formData.get('content')?.toString()?.trim() || ''

  if (!title || !description || !category) {
    return { error: 'Title, description, and category are required.' }
  }

  const db = await connectToDatabase()
  if (!db) {
    return { error: 'Database connection error. Please check MONGODB_URI.' }
  }

  const paragraphs = contentBody.split('\n\n').filter(Boolean)
  const sections = [
    {
      id: 'section-1',
      heading: 'Overview',
      body: paragraphs.length > 0 ? paragraphs : [description],
    },
  ]

  const wordCount = contentBody.split(/\s+/).filter(Boolean).length
  const readingTime = Math.max(1, Math.ceil(wordCount / 200))

  const contentMdx = formData.get('contentMdx')?.toString()?.trim() || contentBody

  try {
    const existing = await BlogModel.findOne({ slug: originalSlug })
    if (!existing) {
      return { error: 'Blog post not found.' }
    }

    await BlogModel.updateOne(
      { slug: originalSlug },
      {
        title,
        description,
        excerpt: description,
        cover,
        coverImage: cover,
        category,
        readingTime,
        status,
        content: sections,
        contentHtml: contentBody,
        contentMdx,
      }
    )

    revalidatePath('/')
    revalidatePath('/blog')
    revalidatePath(`/blog/${originalSlug}`)
    revalidatePath('/admin')
    revalidatePath('/admin/blogs')
  } catch (err: any) {
    return { error: err.message || 'Failed to update blog post in MongoDB.' }
  }

  redirect('/admin/blogs')
}
