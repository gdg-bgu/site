import { cache } from 'react'
import { getServerSession } from 'next-auth/next'
import { cookies } from 'next/headers'
import { authOptions } from '@/lib/auth-options'
import { getMemberByEmail } from '@/lib/members-db'
import { Member } from '@/lib/members'

const SESSION_COOKIE_NAME = 'gdg_member_session'

export interface Session {
  user: Member
}

export const getSession = cache(async (): Promise<Session | null> => {
  // 1. Try NextAuth session
  try {
    const nextAuthSession = await getServerSession(authOptions)
    if (nextAuthSession?.user?.email) {
      const member = await getMemberByEmail(nextAuthSession.user.email)
      if (member) {
        return { user: member }
      }
    }
  } catch {
    // Fall back to cookie session if NextAuth session throws
  }

  // 2. Cookie session fallback
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value

  if (!sessionCookie) return null

  try {
    const data = JSON.parse(sessionCookie)
    const member = await getMemberByEmail(data.email)
    if (!member) return null

    return { user: member }
  } catch {
    return null
  }
})

export async function createSession(email: string): Promise<boolean> {
  const member = await getMemberByEmail(email)
  if (!member) return false

  const cookieStore = await cookies()
  const sessionData = JSON.stringify({ email: member.email, loggedInAt: Date.now() })

  cookieStore.set(SESSION_COOKIE_NAME, sessionData, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  })

  return true
}

export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE_NAME)
}
