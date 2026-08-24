import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { connectToDatabase } from '@/lib/mongodb'
import { BlogModel } from '@/lib/models/Blog'

export async function GET() {
  const session = await getSession()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const db = await connectToDatabase()
  if (!db) {
    return NextResponse.json({ error: 'Database connection failed' }, { status: 500 })
  }

  try {
    const blogs = await BlogModel.find({}).sort({ createdAt: -1 }).lean()
    return NextResponse.json(blogs, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch blogs' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const db = await connectToDatabase()
  if (!db) {
    return NextResponse.json({ error: 'Database connection failed' }, { status: 500 })
  }

  try {
    const body = await req.json()
    const blog = await BlogModel.create(body)
    return NextResponse.json(blog, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to create blog post' }, { status: 500 })
  }
}