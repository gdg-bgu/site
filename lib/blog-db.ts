import 'server-only'
import { cache } from 'react'
import { connectToDatabase } from '@/lib/mongodb'
import { BlogModel } from '@/lib/models/Blog'
import { Blog, BlogStatus, Category, blogs } from '@/lib/blog-data'

function normalizeAuthor(raw: any) {
  if (typeof raw === 'string') {
    return {
      name: raw,
      role: 'Contributor',
      initials: raw.split(' ').map((n) => n[0]).slice(0, 2).join(''),
      color: 'var(--google-blue)',
    }
  }
  return {
    name: raw?.name || 'GDG Member',
    role: raw?.role || 'Member',
    initials: raw?.initials || 'MB',
    color: raw?.color || 'var(--google-blue)',
    avatar: raw?.avatar || raw?.image || undefined,
  }
}

export const getAllBlogs = cache(async (): Promise<Blog[]> => {
  const db = await connectToDatabase()
  if (db) {
    const docs = await BlogModel.find({})
      .select('-content -contentHtml')
      .sort({ createdAt: -1 })
      .lean()
    return docs.map((doc: any) => ({
      slug: doc.slug,
      title: doc.title,
      description: doc.description || doc.excerpt || '',
      cover: doc.cover || doc.coverImage || '/placeholder.svg',
      category: doc.category as Category,
      author: normalizeAuthor(doc.author),
      date: doc.date || (doc.createdAt ? new Date(doc.createdAt).toISOString() : new Date().toISOString()),
      readingTime: doc.readingTime || 3,
      status: (doc.status === 'published' ? 'Published' : doc.status === 'draft' ? 'Draft' : doc.status) as BlogStatus,
      views: doc.views || 0,
      featured: doc.featured || false,
      content: [],
    }))
  }
  return blogs
})

export const publishedBlogs = cache(async (): Promise<Blog[]> => {
  const db = await connectToDatabase()
  if (db) {
    const docs = await BlogModel.find({
      status: { $in: ['Published', 'published'] as any },
    })
      .select('-content -contentHtml')
      .sort({ createdAt: -1 })
      .lean()
    return docs.map((doc: any) => ({
      slug: doc.slug,
      title: doc.title,
      description: doc.description || doc.excerpt || '',
      cover: doc.cover || doc.coverImage || '/placeholder.svg',
      category: doc.category as Category,
      author: normalizeAuthor(doc.author),
      date: doc.date || (doc.createdAt ? new Date(doc.createdAt).toISOString() : new Date().toISOString()),
      readingTime: doc.readingTime || 3,
      status: (doc.status === 'published' ? 'Published' : doc.status === 'draft' ? 'Draft' : doc.status) as BlogStatus,
      views: doc.views || 0,
      featured: doc.featured || false,
      content: [],
    }))
  }
  return blogs.filter((b) => b.status === 'Published')
})

export const featuredBlogs = cache(async (): Promise<Blog[]> => {
  const allPublished = await publishedBlogs()
  return allPublished.filter((b) => b.featured)
})

export const getBlog = cache(async (slug: string): Promise<Blog | null> => {
  const db = await connectToDatabase()
  if (db) {
    const doc: any = await BlogModel.findOne({ slug }).lean()
    if (doc) {
      // Increment views count asynchronously in background
      BlogModel.updateOne({ slug }, { $inc: { views: 1 } }).catch(() => {})
      return {
        slug: doc.slug,
        title: doc.title,
        description: doc.description || doc.excerpt || '',
        cover: doc.cover || doc.coverImage || '/placeholder.svg',
        category: doc.category as Category,
        author: normalizeAuthor(doc.author),
        date: doc.date || (doc.createdAt ? new Date(doc.createdAt).toISOString() : new Date().toISOString()),
        readingTime: doc.readingTime || 3,
        status: (doc.status === 'published' ? 'Published' : doc.status === 'draft' ? 'Draft' : doc.status) as BlogStatus,
        views: (doc.views || 0) + 1,
        featured: doc.featured || false,
        content: doc.content || [],
        contentHtml: doc.contentHtml || (Array.isArray(doc.content) ? doc.content.flatMap((s: any) => s.body || []).join('') : undefined),
        contentMdx: doc.contentMdx,
      }
    }
    return null
  }
  return blogs.find((b) => b.slug === slug) || null
})

export async function relatedBlogs(current: Blog, count = 3): Promise<Blog[]> {
  const db = await connectToDatabase()
  if (db) {
    const docs = await BlogModel.find({
      slug: { $ne: current.slug },
      status: { $in: ['Published', 'published'] as any },
    })
      .select('-content -contentHtml')
      .sort({ createdAt: -1 })
      .limit(6)
      .lean()

    const mapped = docs.map((doc: any) => ({
      slug: doc.slug,
      title: doc.title,
      description: doc.description || doc.excerpt || '',
      cover: doc.cover || doc.coverImage || '/placeholder.svg',
      category: doc.category as Category,
      author: normalizeAuthor(doc.author),
      date: doc.date || (doc.createdAt ? new Date(doc.createdAt).toISOString() : new Date().toISOString()),
      readingTime: doc.readingTime || 3,
      status: (doc.status === 'published' ? 'Published' : doc.status === 'draft' ? 'Draft' : doc.status) as BlogStatus,
      views: doc.views || 0,
      featured: doc.featured || false,
      content: [],
    }))

    return mapped
      .sort((a, b) => (a.category === current.category ? -1 : 1))
      .slice(0, count)
  }

  return blogs
    .filter((b) => b.slug !== current.slug)
    .sort((a, b) => (a.category === current.category ? -1 : 1))
    .slice(0, count)
}
