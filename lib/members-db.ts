import 'server-only'
import { cache } from 'react'
import { connectToDatabase } from '@/lib/mongodb'
import { MemberModel } from '@/lib/models/Member'
import { INITIAL_MEMBER_WHITELIST, Member, MemberRole } from '@/lib/members'

let isSeeded = false

async function ensureMembersSeeded() {
  if (isSeeded) return
  const db = await connectToDatabase()
  if (!db) return
  try {
    for (const m of INITIAL_MEMBER_WHITELIST) {
      await MemberModel.findOneAndUpdate(
        { email: m.email.toLowerCase() },
        {
          $setOnInsert: {
            id: m.id,
            name: m.name,
            email: m.email.toLowerCase(),
            role: m.role,
            systemRole: m.systemRole,
            avatar: m.avatar,
            isAllowed: m.isAllowed ?? true,
          },
        },
        { upsert: true }
      )
    }
    isSeeded = true
  } catch (err) {
    console.error('Error seeding members:', err)
  }
}

export const getAllMembers = cache(async (): Promise<Member[]> => {
  const db = await connectToDatabase()
  if (db) {
    await ensureMembersSeeded()
    const members = await MemberModel.find({ isAllowed: { $ne: false } }).lean()
    return members.map((m) => ({
      id: m.id || (m._id as any).toString(),
      name: m.name,
      email: m.email,
      role: m.role,
      systemRole: m.systemRole as MemberRole,
      avatar: m.avatar,
      isAllowed: m.isAllowed ?? true,
    }))
  }
  return INITIAL_MEMBER_WHITELIST
})

export const getMemberByEmail = cache(async (email: string | null | undefined): Promise<Member | null> => {
  if (!email) return null
  const normalizedEmail = email.trim().toLowerCase()

  const db = await connectToDatabase()
  if (db) {
    await ensureMembersSeeded()
    const memberDoc = await MemberModel.findOne({ email: normalizedEmail }).lean()
    if (memberDoc) {
      if (memberDoc.isAllowed === false) return null
      return {
        id: memberDoc.id || (memberDoc._id as any).toString(),
        name: memberDoc.name,
        email: memberDoc.email,
        role: memberDoc.role,
        systemRole: memberDoc.systemRole as MemberRole,
        avatar: memberDoc.avatar,
        isAllowed: memberDoc.isAllowed ?? true,
      }
    }
  }

  const staticMember = INITIAL_MEMBER_WHITELIST.find((m) => m.email.toLowerCase() === normalizedEmail)
  if (staticMember && staticMember.isAllowed !== false) {
    return staticMember
  }

  return null
})

export async function isAllowedMember(email: string | null | undefined): Promise<boolean> {
  const member = await getMemberByEmail(email)
  return member !== null
}

export async function addMemberToWhitelist(data: {
  name: string
  email: string
  role?: string
  systemRole?: MemberRole
  avatar?: string
}): Promise<{ success: boolean; error?: string }> {
  const normalizedEmail = data.email.trim().toLowerCase()
  const db = await connectToDatabase()

  if (db) {
    try {
      await MemberModel.findOneAndUpdate(
        { email: normalizedEmail },
        {
          id: data.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '-'),
          name: data.name,
          email: normalizedEmail,
          role: data.role || 'GDG Member',
          systemRole: data.systemRole || 'member',
          avatar: data.avatar || '',
          isAllowed: true,
        },
        { upsert: true, returnDocument: 'after' }
      )
      return { success: true }
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to add member to MongoDB' }
    }
  }

  return { success: false, error: 'MongoDB connection is not configured.' }
}

export async function removeMemberFromWhitelist(email: string): Promise<{ success: boolean; error?: string }> {
  const normalizedEmail = email.trim().toLowerCase()
  const db = await connectToDatabase()

  if (db) {
    try {
      await MemberModel.findOneAndUpdate({ email: normalizedEmail }, { isAllowed: false })
      return { success: true }
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to remove member' }
    }
  }

  return { success: false, error: 'MongoDB connection is not configured.' }
}
