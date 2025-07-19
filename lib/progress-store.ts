import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Progress tracking interfaces for individual exercise performance
export interface ExerciseProgress {
  exerciseId: string
  exerciseName: string
  muscleGroups: string[]
  category: string
  history: ExerciseSession[]
  personalBests: {
    maxWeight: number
    maxReps: number
    maxVolume: number
    maxSets: number
  }
  trends: {
    weightProgression: Array<{ date: string; weight: number }>
    volumeProgression: Array<{ date: string; volume: number }>
    frequencyProgression: Array<{ date: string; frequency: number }>
  }
}

export interface ExerciseSession {
  id: string
  exerciseId: string
  exerciseName: string
  date: string
  workoutId: string
  sets: Array<{
    setNumber: number
    weight?: number
    reps: number | string
    completed: boolean
    notes?: string
  }>
  totalVolume: number
  notes?: string
  difficulty: number
  enjoyment: number
}

export interface ProgressStats {
  totalExercises: number
  exercisesWithProgress: number
  totalSessions: number
  averageVolume: number
  mostImprovedExercise: string
  consistencyScore: number
  strengthGains: Array<{
    exercise: string
    improvement: number
    timeframe: string
  }>
}

interface ProgressState {
  // Core progress data
  exerciseProgress: Record<string, ExerciseProgress>
  stats: ProgressStats | null
  
  // UI state
  isLoading: boolean
  error: string | null
  
  // Actions
  logExerciseSession: (session: Omit<ExerciseSession, 'id'>) => Promise<void>
  getExerciseProgress: (exerciseId: string) => ExerciseProgress | null
  getProgressStats: () => ProgressStats
  fetchExerciseHistory: (exerciseId: string) => Promise<void>
  updatePersonalBest: (exerciseId: string, type: 'weight' | 'reps' | 'volume', value: number) => void
  calculateStats: () => void
  
  // Utility actions
  setError: (error: string | null) => void
  clearProgress: () => void
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      // Initial state
      exerciseProgress: {},
      stats: null,
      isLoading: false,
      error: null,

      // Log exercise session with detailed performance data
      logExerciseSession: async (session) => {
        const { exerciseProgress } = get()
        const sessionId = `session-${Date.now()}`
        const newSession = { ...session, id: sessionId }
        
        // Calculate total volume
        const totalVolume = newSession.sets.reduce((sum, set) => {
          const weight = set.weight || 0
          const reps = typeof set.reps === 'number' ? set.reps : 0
          return sum + (weight * reps)
        }, 0)
        
        newSession.totalVolume = totalVolume

        // Update exercise progress
        const exerciseId = newSession.exerciseId || 'unknown'
        const existingProgress = exerciseProgress[exerciseId] || {
          exerciseId,
          exerciseName: newSession.exerciseName || 'Unknown Exercise',
          muscleGroups: [],
          category: 'strength',
          history: [],
          personalBests: { maxWeight: 0, maxReps: 0, maxVolume: 0, maxSets: 0 },
          trends: { weightProgression: [], volumeProgression: [], frequencyProgression: [] }
        }

        // Update history
        const updatedHistory = [...existingProgress.history, newSession].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        )

        // Update personal bests
        const maxWeight = Math.max(existingProgress.personalBests.maxWeight, 
          ...newSession.sets.map(s => s.weight || 0))
        const maxReps = Math.max(existingProgress.personalBests.maxReps,
          ...newSession.sets.map(s => typeof s.reps === 'number' ? s.reps : 0))
        const maxVolume = Math.max(existingProgress.personalBests.maxVolume, totalVolume)
        const maxSets = Math.max(existingProgress.personalBests.maxSets, newSession.sets.length)

        // Update trends
        const weightProgression = [...existingProgress.trends.weightProgression, {
          date: newSession.date,
          weight: Math.max(...newSession.sets.map(s => s.weight || 0))
        }].slice(-20) // Keep last 20 sessions

        const volumeProgression = [...existingProgress.trends.volumeProgression, {
          date: newSession.date,
          volume: totalVolume
        }].slice(-20)

        const updatedProgress: ExerciseProgress = {
          ...existingProgress,
          history: updatedHistory,
          personalBests: { maxWeight, maxReps, maxVolume, maxSets },
          trends: {
            weightProgression,
            volumeProgression,
            frequencyProgression: existingProgress.trends.frequencyProgression
          }
        }

        set({
          exerciseProgress: {
            ...exerciseProgress,
            [exerciseId]: updatedProgress
          }
        })

        // Recalculate stats
        get().calculateStats()
      },

      // Get progress for specific exercise
      getExerciseProgress: (exerciseId: string) => {
        const { exerciseProgress } = get()
        return exerciseProgress[exerciseId] || null
      },

      // Calculate comprehensive progress statistics
      getProgressStats: () => {
        const { exerciseProgress } = get()
        const exercises = Object.values(exerciseProgress)
        
        if (exercises.length === 0) {
          return {
            totalExercises: 0,
            exercisesWithProgress: 0,
            totalSessions: 0,
            averageVolume: 0,
            mostImprovedExercise: '',
            consistencyScore: 0,
            strengthGains: []
          }
        }

        const totalSessions = exercises.reduce((sum, ex) => sum + ex.history.length, 0)
        const averageVolume = exercises.reduce((sum, ex) => {
          const avgVolume = ex.history.reduce((s, h) => s + h.totalVolume, 0) / ex.history.length
          return sum + avgVolume
        }, 0) / exercises.length

        // Calculate consistency score (sessions per week average)
        const now = new Date()
        const fourWeeksAgo = new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000)
        const recentSessions = exercises.reduce((sum, ex) => {
          const recent = ex.history.filter(h => new Date(h.date) >= fourWeeksAgo)
          return sum + recent.length
        }, 0)
        const consistencyScore = Math.min(100, (recentSessions / 4) * 25) // 4 sessions per week = 100%

        // Find most improved exercise
        const strengthGains = exercises
          .filter(ex => ex.history.length >= 2)
          .map(ex => {
            const recent = ex.history.slice(0, 3) // Last 3 sessions
            const older = ex.history.slice(-3) // 3 sessions before that
            const recentAvg = recent.reduce((sum, h) => sum + h.totalVolume, 0) / recent.length
            const olderAvg = older.reduce((sum, h) => sum + h.totalVolume, 0) / older.length
            const improvement = ((recentAvg - olderAvg) / olderAvg) * 100
            return { exercise: ex.exerciseName, improvement, timeframe: '4 weeks' }
          })
          .filter(gain => gain.improvement > 0)
          .sort((a, b) => b.improvement - a.improvement)

        const mostImprovedExercise = strengthGains[0]?.exercise || ''

        return {
          totalExercises: exercises.length,
          exercisesWithProgress: exercises.filter(ex => ex.history.length > 0).length,
          totalSessions,
          averageVolume: Math.round(averageVolume),
          mostImprovedExercise,
          consistencyScore: Math.round(consistencyScore),
          strengthGains: strengthGains.slice(0, 5) // Top 5 improvements
        }
      },

      // Fetch exercise history from API
      fetchExerciseHistory: async (exerciseId: string) => {
        set({ isLoading: true, error: null })

        try {
          const response = await fetch(`/api/exercise-progress/${exerciseId}`)
          
          if (!response.ok) {
            throw new Error('Failed to fetch exercise history')
          }

          const data = await response.json()
          
          set({
            exerciseProgress: {
              ...get().exerciseProgress,
              [exerciseId]: data.progress
            },
            isLoading: false,
            error: null
          })

        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to load exercise history'
          set({
            isLoading: false,
            error: errorMessage
          })
        }
      },

      // Update personal best for an exercise
      updatePersonalBest: (exerciseId: string, type: 'weight' | 'reps' | 'volume', value: number) => {
        const { exerciseProgress } = get()
        const progress = exerciseProgress[exerciseId]
        
        if (!progress) return

        const updatedProgress = {
          ...progress,
          personalBests: {
            ...progress.personalBests,
            [type === 'weight' ? 'maxWeight' : type === 'reps' ? 'maxReps' : 'maxVolume']: value
          }
        }

        set({
          exerciseProgress: {
            ...exerciseProgress,
            [exerciseId]: updatedProgress
          }
        })
      },

      // Calculate and update stats
      calculateStats: () => {
        const stats = get().getProgressStats()
        set({ stats })
      },

      // Utility actions
      setError: (error: string | null) => set({ error }),
      clearProgress: () => set({ exerciseProgress: {}, stats: null })
    }),
    {
      name: 'fitlingo-progress',
      partialize: (state) => ({ 
        exerciseProgress: state.exerciseProgress,
        stats: state.stats
      })
    }
  )
) 