import { NextApiRequest, NextApiResponse } from 'next'
import { hash } from 'bcryptjs'
import { addMockUser } from './[...nextauth]'
// import bcrypt from 'bcryptjs'
// import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { email, password, name } = req.body

  if (!email || !password) {
    return res.status(400).json({ message: 'Missing required fields' })
  }

  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' })
  }

  try {
    // Check if user already exists
    /*
    const existingUser = await prisma.user.findUnique({
      where: {
        email: email
      }
    })

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' })
    }
    */

    // Mock check for existing users
    const mockUsers = ['demo@fitlingo.com', 'user@example.com']
    if (mockUsers.includes(email)) {
      return res.status(400).json({ message: 'User already exists' })
    }

    // Hash password
    const hashedPassword = await hash(password, 12)

    // Create user in database
    /*
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      }
    })
    */

    // Mock user creation (password would be stored as hashedPassword in real implementation)
    const mockUser = {
      id: 'mock-' + Date.now(),
      email,
      password: hashedPassword, // Store hashed password for authentication
      name: name || null,
      image: null
    }

    // Add user to NextAuth mock users list for immediate authentication
    addMockUser(mockUser)

    return res.status(201).json({
      message: 'User created successfully',
      user: {
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        image: mockUser.image
      }
    })

  } catch (error) {
    console.error('Signup error:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
} 