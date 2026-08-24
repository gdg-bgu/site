export type Category = 'Web Development' | 'AI/ML' | 'Cloud' | 'Android' | 'Events'

export type BlogStatus = 'Published' | 'Draft' | 'Archived'

export type Author = {
  name: string
  role: string
  initials: string
  color: string
  avatar?: string
  image?: string
}

export type Section = {
  id: string
  heading: string
  body: string[]
}

export type Blog = {
  slug: string
  title: string
  description: string
  cover: string
  category: Category
  author: Author
  date: string
  readingTime: number
  status: BlogStatus
  views: number
  featured?: boolean
  content: Section[]
  contentHtml?: string
  contentMdx?: string
}

export const categories: Category[] = [
  'Web Development',
  'AI/ML',
  'Cloud',
  'Android',
  'Events',
]

export const categoryColor: Record<Category, string> = {
  'Web Development': 'var(--google-blue)',
  'AI/ML': 'var(--google-green)',
  Cloud: 'var(--google-yellow)',
  Android: 'var(--google-green)',
  Events: 'var(--google-red)',
}

export const blogs: Blog[] = []

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export const communityStats = [
  { label: 'Community Members', value: '150+', color: 'var(--google-blue)' },
  { label: 'Blogs Published', value: '0', color: 'var(--google-green)' },
  { label: 'Workshops Hosted', value: '12', color: 'var(--google-yellow)' },
  { label: 'Events This Year', value: '3', color: 'var(--google-red)' },
]
