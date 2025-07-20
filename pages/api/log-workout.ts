import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from './auth/[...nextauth]'
import { useGamificationStore } from '@/lib/gamification-store'

interface ExerciseSet {
  setNumber: number
  weight?: number
  reps?: number
  completed: boolean
  notes?: string
}

interface ExerciseProgress {
  exerciseId: string
  exercise: {
    exercise: string
    sets: number
    reps: number | string
    weight?: number | string
    restTime: number
    targetMuscles: string[]
    instructions?: string
    modifications?: string[]
  }
  sets: ExerciseSet[]
  currentSet: number
  isCompleted: boolean
  startTime: string
  endTime?: string
}

interface WorkoutLogData {
  workoutId?: string
  startTime: string
  endTime: string
  duration: number
  exerciseProgress: ExerciseProgress[]
  completedExercises: number
  totalExercises: number
  feedback?: {
    difficulty: number
    enjoyment: number
    energy: number
    notes?: string
  }
}

interface WorkoutLogResponse {
  success: boolean
  message: string
  workoutLog?: any
  stats?: {
    streak: number
    totalWorkouts: number
    level: number
    xp: number
    newBadges?: string[]
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<WorkoutLogResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    })
  }

  try {
    // Authenticate user
    const session = await getServerSession(req, res, authOptions)
    
    if (!session?.user?.email) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      })
    }

    const workoutData: WorkoutLogData = req.body

    // Validate required fields
    if (!workoutData.startTime || !workoutData.endTime || !workoutData.exerciseProgress) {
      return res.status(400).json({
        success: false,
        message: 'Missing required workout data'
      })
    }

    // Calculate workout statistics
    const totalSets = workoutData.exerciseProgress.reduce((total, ex) => total + ex.sets.length, 0)
    const completedSets = workoutData.exerciseProgress.reduce((total, ex) => 
      total + ex.sets.filter(set => set.completed).length, 0
    )
    const totalWeight = workoutData.exerciseProgress.reduce((total, ex) => 
      total + ex.sets.reduce((setTotal, set) => 
        setTotal + (set.weight || 0) * (set.reps || 0), 0
      ), 0
    )

    // Create workout log entry
    const workoutLog = {
      id: `workout-${Date.now()}`,
      userId: session.user.email,
      workoutId: workoutData.workoutId,
      startTime: workoutData.startTime,
      endTime: workoutData.endTime,
      duration: workoutData.duration,
      exerciseProgress: workoutData.exerciseProgress,
      completedExercises: workoutData.completedExercises,
      totalExercises: workoutData.totalExercises,
      completedSets,
      totalSets,
      totalWeight,
      feedback: workoutData.feedback,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // TODO: Save to database when Prisma is connected
    /*
    const savedWorkout = await prisma.workoutLog.create({
      data: {
        userId: session.user.id,
        workoutId: workoutData.workoutId,
        startTime: new Date(workoutData.startTime),
        endTime: new Date(workoutData.endTime),
        duration: workoutData.duration,
        exerciseProgress: workoutData.exerciseProgress,
        completedExercises: workoutData.completedExercises,
        totalExercises: workoutData.totalExercises,
        completedSets,
        totalSets,
        totalWeight,
        feedback: workoutData.feedback
      }
    })
    */

    // Update user stats (mock implementation)
    const mockUserStats = {
      streak: 5, // This would be fetched from database
      totalWorkouts: 25,
      level: 2,
      xp: 250
    }

    // Calculate new stats
    const newStats = {
      streak: mockUserStats.streak + 1,
      totalWorkouts: mockUserStats.totalWorkouts + 1,
      level: mockUserStats.level,
      xp: mockUserStats.xp + 50 + (workoutData.completedExercises * 10)
    }

    // Check for level up
    const newLevel = Math.floor(newStats.xp / 500) + 1
    if (newLevel > newStats.level) {
      newStats.level = newLevel
    }

    // TODO: Update user stats in database
    /*
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        streak: newStats.streak,
        totalWorkouts: newStats.totalWorkouts,
        level: newStats.level,
        xp: newStats.xp,
        lastActiveAt: new Date()
      }
    })
    */

    // Check for achievements/badges
    const newBadges: string[] = []
    
    // Streak milestones
    if (newStats.streak === 7) newBadges.push('week_warrior')
    if (newStats.streak === 30) newBadges.push('month_master')
    if (newStats.streak === 100) newBadges.push('century_club')
    
    // Workout milestones
    if (newStats.totalWorkouts === 10) newBadges.push('dedicated_10')
    if (newStats.totalWorkouts === 50) newBadges.push('fitness_fanatic')
    if (newStats.totalWorkouts === 100) newBadges.push('century_strong')
    
    // Level milestones
    if (newStats.level === 5) newBadges.push('level_5_legend')
    if (newStats.level === 10) newBadges.push('level_10_master')
    
    // Special achievements
    if (workoutData.duration > 3600) newBadges.push('endurance_elite') // 1+ hour workout
    if (completedSets > 20) newBadges.push('volume_victor') // 20+ sets
    if (totalWeight > 10000) newBadges.push('weight_warrior') // 10k+ lbs lifted

    // TODO: Save badges to database
    /*
    if (newBadges.length > 0) {
      await prisma.userBadge.createMany({
        data: newBadges.map(badgeId => ({
          userId: session.user.id,
          badgeId,
          unlockedAt: new Date()
        }))
      })
    }
    */

    return res.status(200).json({
      success: true,
      message: 'Workout logged successfully!',
      workoutLog,
      stats: {
        streak: newStats.streak,
        totalWorkouts: newStats.totalWorkouts,
        level: newStats.level,
        xp: newStats.xp,
        newBadges
      }
    })

  } catch (error) {
    console.error('Log workout error:', error)
    return res.status(500).json({
      success: false,
      message: 'Internal server error while logging workout'
    })
  }
} 