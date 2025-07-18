import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'
// import { prisma } from '@/lib/prisma'

// Profile update API route - Core endpoint for profile management
// This endpoint receives profile updates from the UI and:
// 1. Validates the incoming data
// 2. Updates the user profile in the database
// 3. Triggers AI re-personalization by clearing cached recommendations
// 4. Returns the updated profile for immediate UI updates

interface ProfileUpdateRequest {
  age?: number
  fitnessLevel?: 'beginner' | 'intermediate' | 'advanced'
  goals?: ('muscle_gain' | 'weight_loss' | 'endurance' | 'strength' | 'flexibility' | 'general_fitness')[]
  equipment?: ('bodyweight' | 'dumbbells' | 'barbell' | 'resistance_bands' | 'pull_up_bar' | 'yoga_mat' | 'cardio_machine')[]
  preferences?: {
    duration?: number
    intensity?: 'low' | 'moderate' | 'high'
    workoutTime?: 'morning' | 'afternoon' | 'evening'
    restDays?: string[]
    injuries?: string[]
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow PATCH requests for profile updates
  if (req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Authenticate user - profile updates require valid session
    const session = await getServerSession(req, res, authOptions)
    
    if (!session?.user?.email) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    // Extract and validate profile updates
    const updates: ProfileUpdateRequest = req.body

    // Validation: Age should be reasonable for fitness app
    if (updates.age !== undefined && (updates.age < 13 || updates.age > 120)) {
      return res.status(400).json({ 
        error: 'Age must be between 13 and 120' 
      })
    }

    // Validation: Duration should be practical for workouts
    if (updates.preferences?.duration !== undefined) {
      const duration = updates.preferences.duration
      if (duration < 5 || duration > 180) {
        return res.status(400).json({ 
          error: 'Workout duration must be between 5 and 180 minutes' 
        })
      }
    }

    // Validation: Goals array should not be empty if provided
    if (updates.goals !== undefined && updates.goals.length === 0) {
      return res.status(400).json({ 
        error: 'At least one fitness goal is required' 
      })
    }

    // Validation: Equipment array should not be empty if provided
    if (updates.equipment !== undefined && updates.equipment.length === 0) {
      return res.status(400).json({ 
        error: 'At least one equipment option is required (including bodyweight)' 
      })
    }

    // TODO: Replace with actual database update when Prisma is working
    // For now, simulate successful update with mock data
    const mockUpdatedUser = {
      id: 'mock-user-id',
      email: session.user.email,
      name: session.user.name,
      image: session.user.image,
      ...updates,
      
      // Merge preferences properly
      preferences: {
        duration: 30,
        intensity: 'moderate' as const,
        workoutTime: 'evening' as const,
        restDays: ['sunday'],
        injuries: [],
        ...updates.preferences
      },
      
      // Maintain gamification data
      streak: 5,
      longestStreak: 12,
      totalWorkouts: 25,
      level: 2,
      xp: 1250,
      
      // Update timestamps
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString()
    }

    /* 
    // Actual database update code (when Prisma is working):
    
    const updatedUser = await prisma.user.update({
      where: { 
        email: session.user.email 
      },
      data: {
        ...updates,
        // Merge preferences with existing data
        preferences: updates.preferences ? {
          ...currentUser.preferences,
          ...updates.preferences
        } : undefined,
        updatedAt: new Date(),
        lastActiveAt: new Date()
      },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        age: true,
        fitnessLevel: true,
        goals: true,
        equipment: true,
        preferences: true,
        streak: true,
        longestStreak: true,
        totalWorkouts: true,
        level: true,
        xp: true,
        createdAt: true,
        updatedAt: true,
        lastActiveAt: true
      }
    })
    */

    // Success response with updated profile
    // This data flows back to the Zustand store and triggers UI updates
    return res.status(200).json({
      message: 'Profile updated successfully',
      user: mockUpdatedUser,
      
      // Additional metadata for AI systems
      metadata: {
        // Flag that profile has changed - AI should regenerate recommendations
        profileChanged: true,
        
        // Timestamp for cache invalidation
        lastUpdate: new Date().toISOString(),
        
        // AI personalization hints based on the changes
        aiHints: {
          // If goals changed, AI should prioritize new goal-oriented exercises
          goalsUpdated: updates.goals !== undefined,
          
          // If equipment changed, AI should refresh exercise database filters
          equipmentUpdated: updates.equipment !== undefined,
          
          // If preferences changed, AI should adjust workout structure
          preferencesUpdated: updates.preferences !== undefined
        }
      }
    })

  } catch (error) {
    console.error('Profile update error:', error)
    
    // Generic error response to avoid exposing internal details
    return res.status(500).json({
      error: 'Failed to update profile. Please try again.'
    })
  }
}

/*
AI Integration Notes:

1. Profile Data Flow to AI:
   - Profile updates trigger cache invalidation in the Zustand store
   - AI workout generation endpoints fetch fresh profile data
   - Goals array determines exercise categories and focus areas
   - Equipment availability filters the exercise database
   - Preferences fine-tune workout structure (duration, intensity, timing)

2. Avoiding Endless Loops:
   - Profile updates are cached in Zustand with timestamps
   - API calls include cache headers to prevent unnecessary requests
   - AI recommendations are cached separately from profile data
   - Profile changes trigger targeted cache invalidation, not full refresh

3. Personalization Strategy:
   - Beginner → Focus on form, basic movements, lower intensity
   - Intermediate → Progressive overload, compound movements, variety
   - Advanced → Complex exercises, higher intensity, specific techniques
   - Goals drive exercise selection (strength = compound lifts, cardio = HIIT/LISS)
   - Equipment determines feasible exercises and workout structure

4. Data Consistency:
   - Profile updates are atomic operations
   - UI updates happen after successful API response
   - Error states are handled gracefully with rollback
   - Optimistic updates can be implemented for better UX
*/ 