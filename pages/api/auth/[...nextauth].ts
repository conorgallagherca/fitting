import NextAuth, { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
// import { PrismaAdapter } from '@next-auth/prisma-adapter'
// import { prisma } from '@/lib/prisma'
import { compare } from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  // adapter: PrismaAdapter(prisma),
  providers: [
    // Email and password authentication
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // In production, fetch user from database and verify password
        /*
        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          }
        })

        if (!user || !await compare(credentials.password, user.password)) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image
        }
        */

        // Mock authentication for development
        const mockUsers = [
          {
            id: '1',
            email: 'user@example.com',
            password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeVMpYxNPq4wGoZTW', // secret123
            name: 'Test User',
            image: null
          }
        ]

        const mockUser = mockUsers.find(u => u.email === credentials.email)
        if (!mockUser) {
          return null
        }

        const isPasswordValid = await compare(credentials.password, mockUser.password)
        if (!isPasswordValid) {
          return null
        }

        return {
          id: mockUser.id,
          email: mockUser.email,
          name: mockUser.name,
          image: mockUser.image
        }
      }
    }),

    // Google OAuth provider
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    })
  ],

  session: {
    strategy: 'jwt',
  },

  pages: {
    signIn: '/auth/login',
  },

  callbacks: {
    async signIn({ user, account }) {
      // Allow sign in for all verified users
      if (account?.provider === 'credentials') {
        // Credentials provider - user already verified in authorize function
        return true
      }
      
      if (account?.provider === 'google') {
        // TODO: Create user in database when Prisma is working
        return true
      }
      
      return true
    },
    
    async session({ session, token }) {
      // Attach user ID to session for client-side use
      if (token?.sub && session?.user) {
        (session.user as { id?: string }).id = token.sub
      }
      return session
    },
  },

  // Enable debug messages in development
  debug: process.env.NODE_ENV === 'development',
}

export default NextAuth(authOptions) 