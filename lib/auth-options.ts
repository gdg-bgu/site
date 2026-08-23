import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { getMemberByEmail, isAllowedMember } from '@/lib/members-db'

declare module 'next-auth' {
  interface Session {
    user?: {
      name?: string | null
      email?: string | null
      image?: string | null
      role?: string
      systemRole?: string
      avatar?: string
    }
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || 'dummy-google-client-id',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'dummy-google-client-secret',
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      if (!user?.email) return false
      // Strict Whitelist Check: User's Google email must be in MongoDB or INITIAL_MEMBER_WHITELIST
      const allowed = await isAllowedMember(user.email)
      return allowed
    },
    async jwt({ token, user }) {
      if (user) {
        token.email = user.email
        if (user.image) {
          token.picture = user.image
        }
      }
      return token
    },
    async session({ session, token }) {
      const email = session?.user?.email || (token?.email as string | undefined)
      if (email) {
        const member = await getMemberByEmail(email)
        if (session.user) {
          if (token.picture) {
            session.user.image = token.picture as string
          }
          if (member) {
            session.user.role = member.role
            session.user.systemRole = member.systemRole
            session.user.avatar = member.avatar || session.user.image || (token.picture as string) || undefined
          } else {
            session.user.avatar = session.user.image || (token.picture as string) || undefined
          }
        }
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      try {
        if (url.startsWith('/')) {
          return new URL(url, baseUrl).toString()
        }
        if (new URL(url).origin === new URL(baseUrl).origin) {
          return url
        }
      } catch {
        // Fallback to baseUrl if URL parsing fails
      }
      return baseUrl
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET || 'gdg-bgu-secret-key-change-in-production',
}
