import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Dashboard interfaces for workout and user stats management
export interface WorkoutExercise {
  exercise: string
  sets: number
  reps: number | string
  weight?: number | string
  restTime: number
  targetMuscles: string[]
  instructions?: string
  modifications?: string[]
}

export interface TodaysWorkout {
  id: string
  routine: WorkoutExercise[]
  workoutType: string
  completed: boolean
  date: string
  generatedBy: string
}

export interface GeneratedWorkout {
  exercises: WorkoutExercise[]
  warmup: WorkoutExercise[]
  cooldown: WorkoutExercise[]
  estimatedDuration: number
  workoutType: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  focus: string[]
}

export interface UserStats {
  streak: number
  totalWorkouts: number
  level: number
  xp: number
  longestStreak: number
  todaysProgress?: {
    workoutCompleted: boolean
    exercisesCompleted: number
    totalExercises: number
  }
}

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  unlocked: boolean
  unlockedAt?: string
  progress?: number
  maxProgress?: number
}

interface DashboardState {
  // Core workout data
  todaysWorkout: TodaysWorkout | null
  generatedWorkout: GeneratedWorkout | null
  userStats: UserStats | null
  
  // UI state
  isLoading: boolean
  isStartingWorkout: boolean
  error: string | null
  
  // Workout logging state
  isLoggingWorkout: boolean
  hasLoggedToday: boolean
  workoutStartTime: string | null
  workoutDuration: number
  
  // Gamification
  achievements: Achievement[]
  newAchievements: Achievement[]
  showConfetti: boolean
  
  // Workout session state
  currentExerciseIndex: number
  isWorkoutActive: boolean
  
  // Exercise tracking
  exerciseProgress: Array<{
    exerciseId: string
    plannedSets: number
    completedSets: number
    plannedReps: number | string
    actualReps: number | string
    notes?: string
  }>
  
  // Actions
  fetchTodaysWorkout: () => Promise<void>
  startWorkout: () => void
  completeExercise: (exerciseIndex: number) => void
  completeWorkout: () => Promise<void>
  
  // Workout logging actions
  logExerciseCompletion: (exerciseIndex: number, actualReps: number | string, notes?: string) => void
  submitWorkoutLog: (feedback: {
    difficulty: number
    enjoyment: number
    energy: number
    notes?: string
    quickReaction?: 'too_easy' | 'perfect' | 'too_hard' | 'loved_it' | 'hated_it'
  }) => Promise<void>
  
  // Gamification actions
  checkForNewAchievements: (newStats: UserStats) => void
  dismissConfetti: () => void
  clearNewAchievements: () => void
  
  // Utility actions
  setError: (error: string | null) => void
  resetWorkoutSession: () => void
}

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set, get) => ({
      // Initial state
      todaysWorkout: null,
      generatedWorkout: null,
      userStats: null,
      isLoading: false,
      isStartingWorkout: false,
      error: null,
      achievements: getDefaultAchievements(),
      newAchievements: [],
      showConfetti: false,
      currentExerciseIndex: 0,
      isWorkoutActive: false,
      workoutStartTime: null,
      isLoggingWorkout: false,
      hasLoggedToday: false,
      workoutDuration: 0,
      exerciseProgress: [],

      // Fetch today's workout - Core dashboard data loading
      fetchTodaysWorkout: async () => {
        set({ isLoading: true, error: null })

        try {
          const response = await fetch('/api/get-today-workout')
          
          if (!response.ok) {
            throw new Error('Failed to fetch today\'s workout')
          }

          const data = await response.json()
          
          // Check for streak increases and trigger celebrations
          const { userStats } = get()
          const newStats = data.userStats
          
          if (userStats && newStats.streak > userStats.streak) {
            // Streak increased! Show confetti
            set({ showConfetti: true })
            get().checkForNewAchievements(newStats)
          }
          
          set({
            todaysWorkout: data.workout,
            generatedWorkout: data.generatedWorkout,
            userStats: newStats,
            isLoading: false,
            error: null
          })

        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to load workout'
          set({
            isLoading: false,
            error: errorMessage
          })
        }
      },

      // Start workout session
      startWorkout: () => {
        const { generatedWorkout } = get()
        if (!generatedWorkout) return

        const exerciseProgress = generatedWorkout.exercises.map((exercise, index) => ({
          exerciseId: `exercise-${index}`,
          plannedSets: exercise.sets,
          completedSets: 0,
          plannedReps: exercise.reps,
          actualReps: exercise.reps,
          notes: ''
        }))

        set({
          isWorkoutActive: true,
          workoutStartTime: new Date().toISOString(),
          currentExerciseIndex: 0,
          isStartingWorkout: false,
          exerciseProgress
        })
      },

      // Complete individual exercise
      completeExercise: (exerciseIndex: number) => {
        const { currentExerciseIndex, generatedWorkout } = get()
        
        if (exerciseIndex === currentExerciseIndex && generatedWorkout) {
          const nextIndex = exerciseIndex + 1
          const isLastExercise = nextIndex >= generatedWorkout.exercises.length
          
          set({
            currentExerciseIndex: isLastExercise ? exerciseIndex : nextIndex
          })
        }
      },

      // Complete entire workout
      completeWorkout: async () => {
        const { todaysWorkout, userStats } = get()
        
        if (!todaysWorkout || !userStats) return

        try {
          // API call to mark workout as completed
          const response = await fetch('/api/complete-workout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ workoutId: todaysWorkout.id })
          })

          if (!response.ok) {
            throw new Error('Failed to complete workout')
          }

          const result = await response.json()
          
          // Update local state with new stats
          set({
            userStats: result.userStats,
            showConfetti: true
          })

          // Check for new achievements
          get().checkForNewAchievements(result.userStats)

        } catch (error) {
          console.error('Error completing workout:', error)
          set({ error: 'Failed to complete workout' })
        }
      },

      // Log exercise completion with actual performance data
      logExerciseCompletion: (exerciseIndex: number, actualReps: number | string, notes?: string) => {
        const { exerciseProgress } = get()
        
        const updatedProgress = exerciseProgress.map((exercise, index) => {
          if (index === exerciseIndex) {
            return {
              ...exercise,
              actualReps,
              notes: notes || exercise.notes,
              completedSets: exercise.completedSets + 1
            }
          }
          return exercise
        })

        set({ exerciseProgress: updatedProgress })
      },

      // Submit workout log with feedback
      submitWorkoutLog: async (feedback) => {
        const { todaysWorkout, exerciseProgress, workoutStartTime } = get()
        
        if (!todaysWorkout) return

        set({ isLoggingWorkout: true })

        try {
          const workoutData = {
            workoutId: todaysWorkout.id,
            startTime: workoutStartTime,
            endTime: new Date().toISOString(),
            exerciseProgress,
            feedback,
            completionPercentage: calculateCompletionPercentage(exerciseProgress)
          }

          const response = await fetch('/api/log-workout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(workoutData)
          })

          if (!response.ok) {
            throw new Error('Failed to log workout')
          }

          const result = await response.json()
          
          // Update stats and trigger celebrations
          set({
            userStats: result.stats,
            showConfetti: result.newBadges && result.newBadges.length > 0,
            hasLoggedToday: true
          })

        } catch (error) {
          console.error('Error logging workout:', error)
          set({ error: 'Failed to log workout' })
        } finally {
          set({ isLoggingWorkout: false })
        }
      },

      // Check for new achievements based on updated stats
      checkForNewAchievements: (newStats: UserStats) => {
        const { achievements } = get()
        
        const newAchievements: Achievement[] = []
        
        // Check for streak achievements
        if (newStats.streak === 7 && !achievements.find(a => a.id === 'week_warrior')) {
          newAchievements.push({
            id: 'week_warrior',
            title: 'Week Warrior',
            description: 'Complete 7 workouts in a row',
            icon: '🔥',
            unlocked: true,
            unlockedAt: new Date().toISOString()
          })
        }
        
        if (newStats.streak === 30 && !achievements.find(a => a.id === 'month_master')) {
          newAchievements.push({
            id: 'month_master',
            title: 'Month Master',
            description: 'Complete 30 workouts in a row',
            icon: '👑',
            unlocked: true,
            unlockedAt: new Date().toISOString()
          })
        }
        
        // Check for workout count achievements
        if (newStats.totalWorkouts === 10 && !achievements.find(a => a.id === 'dedicated_10')) {
          newAchievements.push({
            id: 'dedicated_10',
            title: 'Dedicated',
            description: 'Complete your first 10 workouts',
            icon: '💪',
            unlocked: true,
            unlockedAt: new Date().toISOString()
          })
        }
        
        if (newStats.totalWorkouts === 50 && !achievements.find(a => a.id === 'fitness_fanatic')) {
          newAchievements.push({
            id: 'fitness_fanatic',
            title: 'Fitness Fanatic',
            description: 'Complete 50 workouts',
            icon: '🏆',
            unlocked: true,
            unlockedAt: new Date().toISOString()
          })
        }
        
        // Check for level achievements
        if (newStats.level === 5 && !achievements.find(a => a.id === 'level_5_legend')) {
          newAchievements.push({
            id: 'level_5_legend',
            title: 'Level 5 Legend',
            description: 'Reach level 5',
            icon: '⭐',
            unlocked: true,
            unlockedAt: new Date().toISOString()
          })
        }
        
        if (newAchievements.length > 0) {
          set({
            achievements: [...achievements, ...newAchievements],
            newAchievements: [...get().newAchievements, ...newAchievements]
          })
        }
      },

      // Dismiss confetti celebration
      dismissConfetti: () => {
        set({ showConfetti: false })
      },

      // Clear new achievements list
      clearNewAchievements: () => {
        set({ newAchievements: [] })
      },

      // Set error message
      setError: (error: string | null) => {
        set({ error })
      },

      // Reset workout session state
      resetWorkoutSession: () => {
        set({
          isWorkoutActive: false,
          currentExerciseIndex: 0,
          workoutStartTime: null,
          exerciseProgress: [],
          workoutDuration: 0
        })
      }
    }),
    {
      name: 'dashboard-storage',
      partialize: (state) => ({
        userStats: state.userStats,
        achievements: state.achievements,
        hasLoggedToday: state.hasLoggedToday
      })
    }
  )
)

// Helper function to calculate completion percentage
function calculateCompletionPercentage(exerciseProgress: DashboardState['exerciseProgress']): number {
  if (exerciseProgress.length === 0) return 0
  
  const totalSets = exerciseProgress.reduce((total, exercise) => total + exercise.plannedSets, 0)
  const completedSets = exerciseProgress.reduce((total, exercise) => total + exercise.completedSets, 0)
  
  return Math.round((completedSets / totalSets) * 100)
}

// Default achievements list
function getDefaultAchievements(): Achievement[] {
  return [
    {
      id: 'first_workout',
      title: 'First Step',
      description: 'Complete your very first workout',
      icon: '🌟',
      unlocked: false
    },
    {
      id: 'week_warrior',
      title: 'Week Warrior',
      description: 'Complete 7 workouts in a row',
      icon: '🔥',
      unlocked: false
    },
    {
      id: 'month_master',
      title: 'Month Master',
      description: 'Complete 30 workouts in a row',
      icon: '👑',
      unlocked: false
    },
    {
      id: 'dedicated_10',
      title: 'Dedicated',
      description: 'Complete your first 10 workouts',
      icon: '💪',
      unlocked: false
    },
    {
      id: 'fitness_fanatic',
      title: 'Fitness Fanatic',
      description: 'Complete 50 workouts',
      icon: '🏆',
      unlocked: false
    },
    {
      id: 'level_5_legend',
      title: 'Level 5 Legend',
      description: 'Reach level 5',
      icon: '⭐',
      unlocked: false
    }
  ]
} 