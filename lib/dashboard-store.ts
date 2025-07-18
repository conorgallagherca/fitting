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
          // TODO: API call to mark workout as completed
          // const response = await fetch('/api/complete-workout', {
          //   method: 'POST',
          //   headers: { 'Content-Type': 'application/json' },
          //   body: JSON.stringify({ workoutId: todaysWorkout.id })
          // })

          // Simulate workout completion and stats update
          const updatedStats: UserStats = {
            ...userStats,
            streak: userStats.streak + 1,
            totalWorkouts: userStats.totalWorkouts + 1,
            xp: userStats.xp + 50, // Award XP for completion
            longestStreak: Math.max(userStats.longestStreak, userStats.streak + 1),
            todaysProgress: {
              workoutCompleted: true,
              exercisesCompleted: get().generatedWorkout?.exercises.length || 0,
              totalExercises: get().generatedWorkout?.exercises.length || 0
            }
          }

          // Check for level up
          const newLevel = Math.floor(updatedStats.xp / 500) + 1
          if (newLevel > updatedStats.level) {
            updatedStats.level = newLevel
            set({ showConfetti: true })
          }

          // Update completed workout
          const completedWorkout = {
            ...todaysWorkout,
            completed: true
          }

          set({
            todaysWorkout: completedWorkout,
            userStats: updatedStats,
            isWorkoutActive: false,
            workoutStartTime: null,
            currentExerciseIndex: 0
          })

          // Check for new achievements
          get().checkForNewAchievements(updatedStats)

        } catch (error) {
          console.error('Failed to complete workout:', error)
          set({ error: 'Failed to save workout completion' })
        }
      },

      // Log individual exercise completion with actual performance
      logExerciseCompletion: (exerciseIndex: number, actualReps: number | string, notes?: string) => {
        const { exerciseProgress } = get()
        
        const updatedProgress = exerciseProgress.map((exercise, index) => {
          if (index === exerciseIndex) {
            return {
              ...exercise,
              completedSets: exercise.completedSets + 1,
              actualReps: actualReps,
              notes: notes || exercise.notes
            }
          }
          return exercise
        })

        set({ exerciseProgress: updatedProgress })
      },

      // Submit complete workout log with feedback
      submitWorkoutLog: async (feedback) => {
        const { todaysWorkout, exerciseProgress, workoutStartTime, userStats } = get()
        
        if (!todaysWorkout || !workoutStartTime) {
          set({ error: 'No active workout to log' })
          return
        }

        set({ isLoggingWorkout: true, error: null })

        try {
          // Calculate workout duration
          const duration = Math.round((Date.now() - new Date(workoutStartTime).getTime()) / (1000 * 60))
          
          // Calculate completion percentage
          const totalPlannedSets = exerciseProgress.reduce((sum, ex) => sum + ex.plannedSets, 0)
          const totalCompletedSets = exerciseProgress.reduce((sum, ex) => sum + ex.completedSets, 0)
          const completionPercentage = Math.round((totalCompletedSets / totalPlannedSets) * 100)

          const workoutLog = {
            workoutId: todaysWorkout.id,
            exercises: exerciseProgress,
            feedback,
            completionPercentage,
            totalDuration: duration
          }

          const response = await fetch('/api/log-workout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(workoutLog)
          })

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.message || 'Failed to log workout')
          }

          const data = await response.json()
          
          // Update user stats with new streak and XP
          const updatedStats: UserStats = {
            ...userStats!,
            streak: data.streakUpdate.currentStreak,
            longestStreak: data.streakUpdate.longestStreak,
            totalWorkouts: (userStats?.totalWorkouts || 0) + 1,
            xp: data.rewards.newXP,
            level: data.rewards.newLevel,
            todaysProgress: {
              workoutCompleted: true,
              exercisesCompleted: totalCompletedSets,
              totalExercises: totalPlannedSets
            }
          }

          // Update completed workout
          const completedWorkout = {
            ...todaysWorkout,
            completed: true
          }

          set({
            todaysWorkout: completedWorkout,
            userStats: updatedStats,
            isWorkoutActive: false,
            isLoggingWorkout: false,
            hasLoggedToday: true,
            workoutStartTime: null,
            currentExerciseIndex: 0,
            exerciseProgress: []
          })

          // GAMIFICATION INTEGRATION:
          // Check for milestone achievements after successful workout completion
          // This is where the badge system gets triggered
          const gamificationStore = await import('./gamification-store').then(m => m.useGamificationStore)
          
          // Check for new badges based on updated stats
          const milestoneStats = {
            streak: updatedStats.streak,
            totalWorkouts: updatedStats.totalWorkouts,
            longestStreak: updatedStats.longestStreak,
            completedToday: true
          }
          
          const newBadges = gamificationStore.getState().checkMilestones(milestoneStats)
          
          // Show rewards and achievements
          if (data.achievements && data.achievements.length > 0) {
            set({ 
              newAchievements: [...get().newAchievements, ...data.achievements],
              showConfetti: true 
            })
          }

          // Show confetti for badge unlocks
          if (newBadges.length > 0) {
            set({ showConfetti: true })
          }

          if (data.rewards.levelUp) {
            set({ showConfetti: true })
          }

          // Check for streak celebrations
          if (data.streakUpdate.currentStreak > (userStats?.streak || 0)) {
            set({ showConfetti: true })
          }

          console.log('🎉 Workout logged successfully!')
          console.log(`💪 Completion: ${completionPercentage}%`)
          console.log(`🔥 Streak: ${data.streakUpdate.currentStreak} days`)
          console.log(`⭐ XP Gained: ${data.rewards.xpGained}`)
          
          if (newBadges.length > 0) {
            console.log(`🏆 New badges unlocked:`, newBadges.map(b => b.name))
          }

        } catch (error) {
          console.error('Failed to log workout:', error)
          set({ 
            error: error instanceof Error ? error.message : 'Failed to log workout',
            isLoggingWorkout: false
          })
        }
      },

      // Check for and unlock new achievements
      checkForNewAchievements: (newStats: UserStats) => {
        const { achievements } = get()
        const newlyUnlocked: Achievement[] = []

        const updatedAchievements = achievements.map(achievement => {
          if (achievement.unlocked) return achievement

          let shouldUnlock = false

          // Achievement logic
          switch (achievement.id) {
            case 'first_workout':
              shouldUnlock = newStats.totalWorkouts >= 1
              break
            case 'streak_3':
              shouldUnlock = newStats.streak >= 3
              break
            case 'streak_7':
              shouldUnlock = newStats.streak >= 7
              break
            case 'streak_30':
              shouldUnlock = newStats.streak >= 30
              break
            case 'level_2':
              shouldUnlock = newStats.level >= 2
              break
            case 'level_5':
              shouldUnlock = newStats.level >= 5
              break
            case 'workouts_10':
              shouldUnlock = newStats.totalWorkouts >= 10
              break
            case 'workouts_50':
              shouldUnlock = newStats.totalWorkouts >= 50
              break
          }

          if (shouldUnlock) {
            const unlockedAchievement = {
              ...achievement,
              unlocked: true,
              unlockedAt: new Date().toISOString()
            }
            newlyUnlocked.push(unlockedAchievement)
            return unlockedAchievement
          }

          return achievement
        })

        if (newlyUnlocked.length > 0) {
          set({
            achievements: updatedAchievements,
            newAchievements: [...get().newAchievements, ...newlyUnlocked],
            showConfetti: true
          })
        }
      },

      // Dismiss confetti animation
      dismissConfetti: () => {
        set({ showConfetti: false })
      },

      // Clear new achievements notifications
      clearNewAchievements: () => {
        set({ newAchievements: [] })
      },

      // Utility actions
      setError: (error) => set({ error }),
      
      resetWorkoutSession: () => {
        set({
          isWorkoutActive: false,
          workoutStartTime: null,
          currentExerciseIndex: 0,
          isStartingWorkout: false
        })
      }
    }),
    {
      name: 'dashboard-storage',
      partialize: (state) => ({
        userStats: state.userStats,
        achievements: state.achievements,
        todaysWorkout: state.todaysWorkout
      })
    }
  )
)

// Default achievements for gamification
function getDefaultAchievements(): Achievement[] {
  return [
    {
      id: 'first_workout',
      title: 'Getting Started',
      description: 'Complete your first workout',
      icon: '🎯',
      unlocked: false
    },
    {
      id: 'streak_3',
      title: 'On a Roll',
      description: 'Maintain a 3-day workout streak',
      icon: '🔥',
      unlocked: false
    },
    {
      id: 'streak_7',
      title: 'Week Warrior',
      description: 'Complete 7 days in a row',
      icon: '⚡',
      unlocked: false
    },
    {
      id: 'streak_30',
      title: 'Consistency King',
      description: 'Achieve a 30-day streak',
      icon: '👑',
      unlocked: false
    },
    {
      id: 'level_2',
      title: 'Level Up',
      description: 'Reach fitness level 2',
      icon: '📈',
      unlocked: false
    },
    {
      id: 'level_5',
      title: 'Fitness Expert',
      description: 'Reach fitness level 5',
      icon: '🏆',
      unlocked: false
    },
    {
      id: 'workouts_10',
      title: 'Dedicated',
      description: 'Complete 10 total workouts',
      icon: '💪',
      unlocked: false
    },
    {
      id: 'workouts_50',
      title: 'Fitness Enthusiast',
      description: 'Complete 50 total workouts',
      icon: '🌟',
      unlocked: false
    }
  ]
}

/*
Dashboard Store Architecture Notes:

1. REACTIVE STATE MANAGEMENT:
   - Zustand provides lightweight, reactive state updates
   - Automatic UI re-renders when workout data changes
   - Persistent storage for offline access and consistency
   - Optimistic updates for smooth user experience

2. GAMIFICATION PSYCHOLOGY:
   - Achievement system provides milestone rewards
   - Streak tracking builds daily habits (Duolingo approach)
   - XP and levels create sense of progression
   - Confetti animations celebrate success moments

3. WORKOUT SESSION FLOW:
   - Track current exercise progress through workout
   - Timer integration for rest periods and exercise duration
   - Completion states for individual exercises and full workout
   - Session management with start/pause/complete actions

4. DATA FRESHNESS STRATEGY:
   - Fetch today's workout on dashboard load
   - Cache workout data for offline access
   - Automatic generation if no workout exists
   - Real-time updates for workout completion

5. USER ENGAGEMENT OPTIMIZATION:
   - Minimize loading states with cached data
   - Immediate feedback for all user actions
   - Progressive disclosure of workout information
   - Celebration animations for motivation

This store design creates an engaging, responsive dashboard
that builds lasting fitness habits through smart gamification.
*/ 