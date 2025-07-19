import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'
import { getExerciseById } from '@/lib/exercises'
// import { prisma } from '@/lib/prisma'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Authentication check
    const session = await getServerSession(req, res, authOptions)
    if (!session?.user?.email) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    const { exerciseId } = req.query

    if (!exerciseId || typeof exerciseId !== 'string') {
      return res.status(400).json({ error: 'Exercise ID is required' })
    }

    // Get exercise details
    const exercise = getExerciseById(exerciseId)
    if (!exercise) {
      return res.status(404).json({ error: 'Exercise not found' })
    }

    // TODO: Replace with actual database query when Prisma is connected
    /*
    const exerciseHistory = await prisma.exerciseSession.findMany({
      where: {
        userId: session.user.id,
        exerciseId: exerciseId
      },
      orderBy: {
        date: 'desc'
      },
      take: 50 // Limit to last 50 sessions
    })
    */

    // Mock exercise progress data for demonstration
    const mockProgress = generateMockExerciseProgress(exerciseId, exercise.name)

    return res.status(200).json({
      success: true,
      progress: mockProgress
    })

  } catch (error) {
    console.error('Exercise progress fetch error:', error)
    return res.status(500).json({
      error: 'Failed to fetch exercise progress',
      message: 'An error occurred while fetching exercise progress.'
    })
  }
}

// Generate mock exercise progress data for demonstration
function generateMockExerciseProgress(exerciseId: string, exerciseName: string) {
  const now = new Date()
  const history = []
  
  // Generate 15-25 sessions over the past 3 months
  const sessionCount = Math.floor(Math.random() * 11) + 15 // 15-25 sessions
  
  for (let i = 0; i < sessionCount; i++) {
    const daysAgo = Math.floor(Math.random() * 90) // Random day in past 3 months
    const date = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000)
    
    // Progressive overload simulation
    const baseWeight = 20 + (i * 2) + Math.floor(Math.random() * 10) // Gradual weight increase
    const baseReps = 8 + Math.floor(Math.random() * 4) // 8-12 reps
    
    const sets = []
    const setCount = 3 + Math.floor(Math.random() * 2) // 3-4 sets
    
    for (let set = 1; set <= setCount; set++) {
      const weight = baseWeight + (set - 1) * 2 // Slight weight increase per set
      const reps = baseReps - (set - 1) * 1 // Slight rep decrease per set
      
      sets.push({
        setNumber: set,
        weight: weight,
        reps: Math.max(6, reps), // Minimum 6 reps
        completed: true,
        notes: Math.random() > 0.8 ? 'Felt strong today' : undefined
      })
    }
    
    const totalVolume = sets.reduce((sum, set) => sum + (set.weight * set.reps), 0)
    
    history.push({
      id: `session-${exerciseId}-${i}`,
      exerciseId,
      exerciseName,
      date: date.toISOString(),
      workoutId: `workout-${i}`,
      sets,
      totalVolume,
      notes: Math.random() > 0.7 ? 'Great form today' : undefined,
      difficulty: 3 + Math.floor(Math.random() * 3), // 3-5 difficulty
      enjoyment: 3 + Math.floor(Math.random() * 3) // 3-5 enjoyment
    })
  }
  
  // Sort by date (newest first)
  history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  
  // Calculate personal bests
  const maxWeight = Math.max(...history.flatMap(h => h.sets.map(s => s.weight)))
  const maxReps = Math.max(...history.flatMap(h => h.sets.map(s => s.reps)))
  const maxVolume = Math.max(...history.map(h => h.totalVolume))
  const maxSets = Math.max(...history.map(h => h.sets.length))
  
  // Generate trends
  const weightProgression = history.slice(0, 20).map(h => ({
    date: h.date,
    weight: Math.max(...h.sets.map(s => s.weight))
  }))
  
  const volumeProgression = history.slice(0, 20).map(h => ({
    date: h.date,
    volume: h.totalVolume
  }))
  
  // Calculate frequency progression (sessions per week)
  const frequencyProgression = []
  for (let week = 0; week < 12; week++) {
    const weekStart = new Date(now.getTime() - week * 7 * 24 * 60 * 60 * 1000)
    const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000)
    
    const sessionsInWeek = history.filter(h => {
      const sessionDate = new Date(h.date)
      return sessionDate >= weekStart && sessionDate < weekEnd
    }).length
    
    frequencyProgression.push({
      date: weekStart.toISOString(),
      frequency: sessionsInWeek
    })
  }
  
  return {
    exerciseId,
    exerciseName,
    muscleGroups: ['chest', 'triceps', 'shoulders'], // Mock muscle groups
    category: 'strength',
    history,
    personalBests: {
      maxWeight,
      maxReps,
      maxVolume,
      maxSets
    },
    trends: {
      weightProgression,
      volumeProgression,
      frequencyProgression
    }
  }
} 