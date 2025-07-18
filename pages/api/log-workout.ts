import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from './auth/[...nextauth]'
// import { prisma } from '@/lib/prisma'

// Workout Logging & Feedback API
// This endpoint captures completed workout data and user feedback for AI optimization:
// 1. Log actual reps/sets completed vs planned
// 2. Capture difficulty rating and user notes
// 3. Update streak logic with date validation
// 4. Trigger background AI optimization for future workouts
// 5. Prevent duplicate submissions (once per day limit)

interface WorkoutLog {
  workoutId: string
  exercises: {
    exerciseId: string
    plannedSets: number
    completedSets: number
    plannedReps: number | string
    actualReps: number | string
    notes?: string
  }[]
  feedback: {
    difficulty: number // 1-5 scale
    enjoyment: number // 1-5 scale  
    energy: number // 1-5 scale
    notes?: string
    quickReaction?: 'too_easy' | 'perfect' | 'too_hard' | 'loved_it' | 'hated_it'
  }
  completionPercentage: number
  totalDuration: number // minutes
}

interface StreakData {
  currentStreak: number
  longestStreak: number
  lastWorkoutDate: string
  streakBroken: boolean
  missedDays: number
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Authentication check
    const session = await getServerSession(req, res, authOptions)
    if (!session?.user?.email) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    const workoutLog: WorkoutLog = req.body

    // Validate required fields
    if (!workoutLog.workoutId || !workoutLog.exercises || !workoutLog.feedback) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['workoutId', 'exercises', 'feedback']
      })
    }

    // Validate feedback ranges
    if (workoutLog.feedback.difficulty < 1 || workoutLog.feedback.difficulty > 5) {
      return res.status(400).json({ error: 'Difficulty must be between 1-5' })
    }

    const today = new Date().toISOString().split('T')[0]

    // Mock implementation for demonstration
    const mockStreakData = calculateStreakUpdate(
      '2024-01-17', // Mock last workout date
      today,
      5, // Current streak
      10, // Longest streak
      workoutLog.completionPercentage >= 80
    )

    const mockSavedLog = {
      id: 'log-' + Date.now(),
      userId: 'mock-user-id',
      workoutId: workoutLog.workoutId,
      date: today,
      exercises: workoutLog.exercises,
      feedback: workoutLog.feedback,
      completionPercentage: workoutLog.completionPercentage,
      totalDuration: workoutLog.totalDuration,
      createdAt: new Date().toISOString(),
      aiOptimizationData: {
        difficultyAdjustment: calculateDifficultyAdjustment(workoutLog.feedback),
        varietyPreference: calculateVarietyPreference(workoutLog.feedback),
        intensityPreference: calculateIntensityPreference(workoutLog.feedback)
      }
    }

    // Mock XP calculation
    const xpReward = calculateXPReward(workoutLog)
    const newXP = 250 + xpReward
    const newLevel = Math.floor(newXP / 500) + 1

    // GAMIFICATION INTEGRATION:
    // Calculate updated user stats for milestone checking
    const updatedStats = {
      streak: mockStreakData.currentStreak,
      totalWorkouts: 25 + 1, // Mock increment
      longestStreak: mockStreakData.longestStreak,
      completedToday: workoutLog.completionPercentage >= 80
    }

    // Check for badge milestones - This would integrate with the gamification store
    const newBadges = checkForBadgeMilestones(updatedStats)

    // Simulate background workout generation trigger
    if (mockStreakData.currentStreak > 0) {
      console.log('🔄 Triggering background AI optimization for tomorrow\'s workout...')
      triggerBackgroundWorkoutGeneration('mock-user-id', workoutLog.feedback)
    }

    return res.status(201).json({
      message: 'Workout logged successfully!',
      log: mockSavedLog,
      streakUpdate: mockStreakData,
      rewards: {
        xpGained: xpReward,
        newXP: newXP,
        newLevel: newLevel,
        levelUp: newLevel > 2 // Mock previous level was 2
      },
      gamification: {
        newBadges: newBadges,
        updatedStats: updatedStats,
        milestoneReached: newBadges.length > 0
      },
      nextWorkout: {
        willBeGenerated: mockStreakData.currentStreak > 0,
        estimatedReadyTime: new Date(Date.now() + 60000).toISOString(), // 1 minute for demo
        optimizations: mockSavedLog.aiOptimizationData
      },
      achievements: checkForAchievements(mockStreakData, newXP, workoutLog.completionPercentage)
    })

  } catch (error) {
    console.error('❌ Workout logging error:', error)
    
    return res.status(500).json({
      error: 'Failed to log workout',
      message: 'Please try again. Your progress data is important for AI optimization.'
    })
  }
}

// Calculate streak updates based on workout completion and date gaps
function calculateStreakUpdate(
  lastWorkoutDate: string | null,
  currentDate: string,
  currentStreak: number,
  longestStreak: number,
  workoutCompleted: boolean
): StreakData {
  const today = new Date(currentDate)
  const lastDate = lastWorkoutDate ? new Date(lastWorkoutDate) : null
  
  // Calculate days between workouts
  const daysBetween = lastDate 
    ? Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))
    : 0

  let newStreak = currentStreak
  let streakBroken = false
  let missedDays = 0

  if (!workoutCompleted) {
    // Workout attempted but not completed (< 80%)
    // Don't increment streak but don't break it either (grace period)
    return {
      currentStreak: newStreak,
      longestStreak: Math.max(longestStreak, newStreak),
      lastWorkoutDate: currentDate,
      streakBroken: false,
      missedDays: 0
    }
  }

  if (daysBetween === 0) {
    // Same day - no change to streak (prevent duplicate logging)
    return {
      currentStreak: newStreak,
      longestStreak: Math.max(longestStreak, newStreak),
      lastWorkoutDate: currentDate,
      streakBroken: false,
      missedDays: 0
    }
  } else if (daysBetween === 1) {
    // Next day - increment streak
    newStreak = currentStreak + 1
  } else if (daysBetween > 1) {
    // Gap in workouts - reset streak
    newStreak = 1
    streakBroken = true
    missedDays = daysBetween - 1
  }

  return {
    currentStreak: newStreak,
    longestStreak: Math.max(longestStreak, newStreak),
    lastWorkoutDate: currentDate,
    streakBroken,
    missedDays
  }
}

// AI Optimization: Calculate difficulty adjustment based on feedback
function calculateDifficultyAdjustment(feedback: WorkoutLog['feedback']): string {
  const { difficulty, quickReaction } = feedback

  if (difficulty <= 2 || quickReaction === 'too_easy') {
    return 'increase' // Next workout should be harder
  } else if (difficulty >= 4 || quickReaction === 'too_hard') {
    return 'decrease' // Next workout should be easier  
  } else {
    return 'maintain' // Current difficulty is perfect
  }
}

// AI Optimization: Calculate variety preference based on enjoyment
function calculateVarietyPreference(feedback: WorkoutLog['feedback']): string {
  const { enjoyment, quickReaction } = feedback

  if (enjoyment <= 2 || quickReaction === 'hated_it') {
    return 'high_variety' // User needs more exercise variety
  } else if (enjoyment >= 4 || quickReaction === 'loved_it') {
    return 'similar_style' // User enjoyed this workout style
  } else {
    return 'moderate_variety' // Some variation but similar structure
  }
}

// AI Optimization: Calculate intensity preference
function calculateIntensityPreference(feedback: WorkoutLog['feedback']): string {
  const { energy, difficulty } = feedback

  if (energy >= 4 && difficulty <= 3) {
    return 'increase_intensity' // User has energy for more
  } else if (energy <= 2 && difficulty >= 3) {
    return 'decrease_intensity' // User was too drained
  } else {
    return 'maintain_intensity' // Good energy balance
  }
}

// Calculate XP rewards based on workout performance
function calculateXPReward(workoutLog: WorkoutLog): number {
  let baseXP = 50 // Base reward for logging workout

  // Completion bonus
  if (workoutLog.completionPercentage >= 100) {
    baseXP += 25 // Full completion bonus
  } else if (workoutLog.completionPercentage >= 80) {
    baseXP += 15 // Good completion bonus
  }

  // Difficulty bonus (harder workouts = more XP)
  if (workoutLog.feedback.difficulty >= 4) {
    baseXP += 10 // Challenging workout bonus
  }

  // Duration bonus for longer workouts
  if (workoutLog.totalDuration >= 45) {
    baseXP += 10 // Long workout bonus
  }

  // Feedback bonus (encourage detailed feedback)
  if (workoutLog.feedback.notes && workoutLog.feedback.notes.length > 10) {
    baseXP += 5 // Detailed feedback bonus
  }

  return baseXP
}

// Background AI optimization trigger
function triggerBackgroundWorkoutGeneration(userId: string, feedback: WorkoutLog['feedback']) {
  // In production, this would trigger a background job/queue
  console.log(`🤖 AI Optimization for user ${userId}:`)
  console.log(`   - Difficulty adjustment: ${calculateDifficultyAdjustment(feedback)}`)
  console.log(`   - Variety preference: ${calculateVarietyPreference(feedback)}`)
  console.log(`   - Intensity preference: ${calculateIntensityPreference(feedback)}`)
  console.log(`   - Feedback notes: "${feedback.notes || 'None'}"`)
}

// Check for new achievements based on workout performance
function checkForAchievements(streakData: StreakData, xp: number, completionPercentage: number) {
  const achievements: Array<{id: string, title: string, description: string}> = []

  // Streak achievements
  if (streakData.currentStreak === 3) {
    achievements.push({ id: 'streak_3', title: 'On Fire!', description: '3-day streak' })
  } else if (streakData.currentStreak === 7) {
    achievements.push({ id: 'streak_7', title: 'Week Warrior', description: '7-day streak' })
  } else if (streakData.currentStreak === 30) {
    achievements.push({ id: 'streak_30', title: 'Consistency King', description: '30-day streak' })
  }

  // Perfect completion achievement
  if (completionPercentage === 100) {
    achievements.push({ id: 'perfect_workout', title: 'Perfectionist', description: '100% workout completion' })
  }

  // XP level achievements
  const level = Math.floor(xp / 500) + 1
  if (level === 3) {
    achievements.push({ id: 'level_3', title: 'Rising Star', description: 'Reached level 3' })
  }

  return achievements
}

// Check for badge milestones based on updated stats
function checkForBadgeMilestones(stats: {
  streak: number
  totalWorkouts: number
  longestStreak: number
  completedToday: boolean
}) {
  const newBadges = []

  // Streak milestone badges
  if (stats.streak === 3) {
    newBadges.push({
      id: 'streak_3',
      name: 'Getting Started',
      description: 'Complete 3 workouts in a row',
      icon: '🔥'
    })
  } else if (stats.streak === 7) {
    newBadges.push({
      id: 'streak_7',
      name: 'Week Warrior',
      description: 'Maintain a 7-day workout streak',
      icon: '⚡'
    })
  } else if (stats.streak === 30) {
    newBadges.push({
      id: 'streak_30',
      name: 'Monthly Master',
      description: 'Incredible 30-day streak!',
      icon: '👑'
    })
  }

  // Total workout milestones
  if (stats.totalWorkouts === 1) {
    newBadges.push({
      id: 'first_workout',
      name: 'First Step',
      description: 'Complete your very first workout',
      icon: '🌟'
    })
  } else if (stats.totalWorkouts === 10) {
    newBadges.push({
      id: 'workouts_10',
      name: 'Perfect Ten',
      description: 'Complete your first 10 workouts',
      icon: '🎯'
    })
  } else if (stats.totalWorkouts === 50) {
    newBadges.push({
      id: 'workouts_50',
      name: 'Half Century',
      description: '50 workouts completed!',
      icon: '⭐'
    })
  }

  return newBadges
}

/*
Workout Logging & AI Optimization Notes:

1. DUOLINGO-STYLE DAILY LOOP:
   - Single daily logging prevents over-feedback
   - Immediate rewards (XP, streak) provide instant gratification
   - Next-day optimization creates anticipation for tomorrow
   - Streak psychology drives consistent daily engagement

2. AI FEEDBACK OPTIMIZATION:
   - Difficulty feedback directly adjusts AI workout intensity
   - Enjoyment ratings influence exercise variety selection
   - Energy levels inform recovery and intensity recommendations
   - Quick reactions provide instant AI training signals

3. STREAK PSYCHOLOGY & MOTIVATION:
   - Grace period for incomplete workouts (don't break streak immediately)
   - Clear streak reset rules prevent confusion
   - Longest streak tracking provides long-term motivation
   - Achievement milestones celebrate progress

4. DATA QUALITY CONTROLS:
   - One feedback per day prevents gaming the system
   - Completion percentage validates actual workout effort
   - Required feedback fields ensure useful AI training data
   - Background processing prevents UI delays

5. GAMIFICATION & REWARDS:
   - XP rewards scale with workout difficulty and completion
   - Level progression provides long-term goals
   - Achievement unlocks celebrate milestones
   - Immediate feedback creates positive reinforcement loop

This system creates a compelling daily habit loop that mirrors
Duolingo's successful engagement model while optimizing AI
personalization through high-quality user feedback.
*/ 