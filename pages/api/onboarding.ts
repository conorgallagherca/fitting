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
  notifications?: {
    dailyReminders: boolean
    achievementAlerts: boolean
    streakReminders: boolean
    preferredTime?: string // Time for daily reminders (HH:MM format)
  }
}

interface OnboardingResponse {
  success: boolean
  message: string
  user: any
  firstWorkout?: any
  nextSteps?: string[]
  metadata?: {
    profileCreated: boolean
    firstWorkoutGenerated: boolean
    userSegment: string
    primaryGoal: string
    equipmentLevel: number
    lastUpdate: string
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<OnboardingResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed',
      user: null
    })
  }

  try {
    // Authenticate user
    const session = await getServerSession(req, res, authOptions)
    
    if (!session?.user?.email) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        user: null
      })
    }

    // Extract and validate onboarding data
    const onboardingData: OnboardingData = req.body

    // Validation
    if (!onboardingData.fitnessLevel) {
      return res.status(400).json({
        success: false,
        message: 'Fitness level is required',
        user: null
      })
    }

    if (!onboardingData.goals || onboardingData.goals.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one fitness goal is required',
        user: null
      })
    }

    if (!onboardingData.equipment || onboardingData.equipment.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one equipment option is required',
        user: null
      })
    }

    if (!onboardingData.preferences?.duration || onboardingData.preferences.duration < 15) {
      return res.status(400).json({
        success: false,
        message: 'Workout duration must be at least 15 minutes',
        user: null
      })
    }

    // TODO: Database operations - Replace with actual Prisma queries when database is connected
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

    // Create mock user profile with onboarding data
    const mockUser = {
      id: userId,
      email: session.user.email,
      name: onboardingData.name || session.user.name,
      image: session.user.image,
      fitnessLevel: onboardingData.fitnessLevel,
      goals: onboardingData.goals,
      equipment: onboardingData.equipment,
      preferences: onboardingData.preferences,
      streak: 0,
      longestStreak: 0,
      totalWorkouts: 0,
      level: 1,
      xp: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString()
    }

    // Generate first AI workout using the workout generation API
    let firstWorkout = null
    try {
      const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
      const workoutResponse = await fetch(`${baseUrl}/api/generate-workout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': req.headers.cookie || ''
        },
        body: JSON.stringify({
          fitnessLevel: onboardingData.fitnessLevel,
          goals: onboardingData.goals,
          equipment: onboardingData.equipment,
          duration: onboardingData.preferences.duration,
          intensity: onboardingData.preferences.intensity
        })
      })

      if (workoutResponse.ok) {
        const workoutData = await workoutResponse.json()
        firstWorkout = workoutData.workout
      }
    } catch (error) {
      console.error('Error generating AI workout:', error)
      // Fallback to first seed workout if AI generation fails
      firstWorkout = seedWorkouts[0] || null
    }

    // Determine user segment and metadata
    const primaryGoal = onboardingData.goals[0]
    const equipmentLevel = onboardingData.equipment.length
    const userSegment = `${onboardingData.fitnessLevel}_${primaryGoal}`

    // Generate next steps based on user profile
    const nextSteps = [
      'Complete your first workout to earn XP and level up!',
      'Set up your workout schedule in the calendar',
      'Explore the exercise library to discover new moves',
      'Connect with friends to share your fitness journey'
    ]

    if (onboardingData.preferences.intensity === 'high') {
      nextSteps.push('Consider adding recovery days to prevent burnout')
    }

    if (onboardingData.equipment.includes('bodyweight')) {
      nextSteps.push('Try our bodyweight-only workout challenges')
    }

    return res.status(200).json({
      success: true,
      message: 'Onboarding completed successfully!',
      user: mockUser,
      firstWorkout,
      nextSteps,
      metadata: {
        profileCreated: true,
        firstWorkoutGenerated: !!firstWorkout,
        userSegment,
        primaryGoal,
        equipmentLevel,
        lastUpdate: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Onboarding error:', error)
    return res.status(500).json({
      success: false,
      message: 'Internal server error during onboarding',
      user: null
    })
  }
}