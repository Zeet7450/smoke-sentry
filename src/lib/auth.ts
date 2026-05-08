import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { users } from '@/lib/schema'
import type { NextAuthOptions } from 'next-auth'

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId:     process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: 'select_account',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const email = String(credentials.email).toLowerCase().trim()
        const password = String(credentials.password)

        try {
          const user = await db.select().from(users)
            .where(eq(users.email, email))
            .limit(1)

          if (!user[0]) return null
          if (!user[0].password) return null  // Google user, no password

          const isValid = await bcrypt.compare(password, user[0].password)
          if (!isValid) return null

          return {
            id: user[0].id,
            name: user[0].name,
            email: user[0].email,
            image: user[0].image
          }
        } catch (error) {
          return null
        }
      }
    })
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google' && user.email) {
        const email = user.email.toLowerCase().trim()

        try {
          const existingUser = await db.select()
            .from(users)
            .where(eq(users.email, email))
            .limit(1)

          if (existingUser[0]) {
            // Update existing user with Google data (account linking)
            await db.update(users)
              .set({
                name: user.name ?? existingUser[0].name,
                image: user.image ?? existingUser[0].image,
                emailVerified: existingUser[0].emailVerified ?? Date.now(),
              })
              .where(eq(users.email, email))
          } else {
            // Create new user from Google
            await db.insert(users).values({
              id: user.id,
              name: user.name,
              email: email,
              image: user.image,
              emailVerified: Date.now(),
            })
          }
          return true
        } catch (error) {
          console.error('[Auth] Error with Google sign in:', error)
          // Don't block login even if database operations fail
          return true
        }
      }
      return true
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
      }
      if (account) {
        token.provider = account.provider
      }
      return token
    },
    async session({ session, token }) {
      if (session.user && token?.id) {
        session.user.id = token.id as string
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith(baseUrl)) return url
      if (url.startsWith('/')) return `${baseUrl}${url}`
      return `${baseUrl}/dashboard`
    },
  },
  pages: {
    signIn: '/login',
    error:  '/login',
  },
  debug: true,
  secret: process.env.NEXTAUTH_SECRET,
}
