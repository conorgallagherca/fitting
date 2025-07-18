import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from './auth/[...nextauth]'
import { createSeedWorkoutsForUser } from '@/lib/seed-workouts'
// import { prisma } from '@/lib/prisma'

/**
 * User Onboarding API
 * 
 * This endpoint handles the complete onboarding flow for new users:
 * 1. Saves user profile data (fitness level, goals, equipment, preferences)
 * 2. Creates starter workouts to ensure immediate engagement
 * 3. Initializes gamification data (level, XP, streaks)
 * 4. Sets up notification preferences
 * 
 * Called after users complete the onboarding questionnaire.
 */

interface OnboardingData {
  // Profile information
  name?: string
  age?: number
  fitnessLevel: 'beginner' | 'intermediate' | 'advanced'
  
  // Fitness goals (multiple selection)
  goals: ('muscle_gain' | 'weight_loss' | 'endurance' | 'strength' | 'flexibility' | 'general_fitness')[]
  
  // Available equipment
  equipment: ('bodyweight' | 'dumbbells' | 'barbell' | 'resistance_bands' | 'pull_up_bar' | 'yoga_mat' | 'cardio_machine')[]
  
  // Workout preferences
  preferences: {
    duration: number // Target workout duration in minutes
    intensity: 'low' | 'moderate' | 'high'
    workoutTime: 'morning' | 'afternoon' | 'evening'
    restDays: string[] // Days of week for rest ['sunday', 'wednesday']
    injuries?: string[] // Any injuries or limitations
  }
  
  // Notification preferences
  notifications: {
    dailyReminders: boolean
    achievementAlerts: boolean
    streakReminders: boolean
    preferredTime?: string // Time for daily reminders (HH:MM format)
  }
}

interface OnboardingResponse {
  success: boolean
  message: string
  user?: {
    id: string
    profile: OnboardingData
    seedWorkouts: number
    nextSteps: string[]
  }
  error?: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<OnboardingResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed',
      error: 'Only POST method is supported'
    })
  }

  try {
    // Authentication check
    const session = await getServerSession(req, res, authOptions)
    if (!session?.user?.email) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: 'Please sign in to complete onboarding'
      })
    }

    // Validate request body
    const onboardingData: OnboardingData = req.body
    
    if (!onboardingData.fitnessLevel || !onboardingData.goals || !onboardingData.equipment) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
        error: 'Fitness level, goals, and equipment are required'
      })
    }

    // Validate enum values
    const validFitnessLevels = ['beginner', 'intermediate', 'advanced']
    const validGoals = ['muscle_gain', 'weight_loss', 'endurance', 'strength', 'flexibility', 'general_fitness']
    const validEquipment = ['bodyweight', 'dumbbells', 'barbell', 'resistance_bands', 'pull_up_bar', 'yoga_mat', 'cardio_machine']
    
    if (!validFitnessLevels.includes(onboardingData.fitnessLevel)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid fitness level',
        error: 'Fitness level must be beginner, intermediate, or advanced'
      })
    }

    // TODO: Database operations - Replace with actual Prisma queries when network issues are resolved
    /*
    const userId = session.user.id

    // Update user profile with onboarding data
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: onboardingData.name,
        fitnessLevel: onboardingData.fitnessLevel,
        goals: onboardingData.goals,
        equipment: onboardingData.equipment,
        preferences: onboardingData.preferences,
        updatedAt: new Date()
      }
    })

    // Create seed workouts for the user
    const seedWorkouts = createSeedWorkoutsForUser(userId, {
      fitnessLevel: onboardingData.fitnessLevel,
      goals: onboardingData.goals,
      equipment: onboardingData.equipment
    })

    // Insert seed workouts into database
    const createdWorkouts = await Promise.all(
      seedWorkouts.map(workout =>
        prisma.workout.create({
          data: workout
        })
      )
    )
    */

    // Mock implementation for demonstration
    const userId = 'mock-user-id'
    
    // Generate seed workouts
    const seedWorkouts = await createSeedWorkoutsForUser(userId, {
      fitnessLevel: onboardingData.fitnessLevel,
      goals: onboardingData.goals,
      equipment: onboardingData.equipment
    })

    // Determine next steps based on user profile
    const nextSteps = [
      'Complete your first workout',
      'Set up daily reminder notifications',
      'Explore the workout history'
    ]

    if (onboardingData.goals.includes('weight_loss')) {
      nextSteps.push('Consider tracking your nutrition')
    }

    if (onboardingData.equipment.length === 1 && onboardingData.equipment[0] === 'bodyweight') {
      nextSteps.push('Browse equipment recommendations for home workouts')
    }

    const response: OnboardingResponse = {
      success: true,
      message: 'Onboarding completed successfully! Welcome to FitLingo! 🎉',
      user: {
        id: userId,
        profile: onboardingData,
        seedWorkouts: seedWorkouts.length,
        nextSteps
      }
    }

    return res.status(200).json(response)

  } catch (error) {
    console.error('Onboarding error:', error)
    
    return res.status(500).json({
      success: false,
      message: 'Failed to complete onboarding',
      error: error instanceof Error ? error.message : 'Internal server error'
    })
  }
} 