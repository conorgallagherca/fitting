import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// History interfaces for workout tracking and calendar display
export interface WorkoutHistoryItem {
  id: string
  date: string
  workoutType: string
  completed: boolean
  completionPercentage: number
  duration: number
  exerciseCount: number
  generatedBy: 'ai' | 'template' | 'manual'
  feedback?: {
    difficulty: number
    enjoyment: number
    energy: number
    notes?: string
    quickReaction?: string
  }
  routine: Array<{
    exercise: string
    sets: number
    reps: number | string
    weight?: number | string
    targetMuscles: string[]
    actualReps?: number | string
    notes?: string
  }>
}

export interface WorkoutStats {
  totalWorkouts: number
  completedWorkouts: number
  averageDifficulty: number
  averageEnjoyment: number
  averageDuration: number
  currentStreak: number
  longestStreak: number
  totalExercisesSessions: number
  favoriteWorkoutType: string
  workoutsByMonth: Array<{
    month: string
    count: number
  }>
  difficultyTrend: Array<{
    date: string
    difficulty: number
  }>
}

interface HistoryState {
  // Core history data
  workouts: WorkoutHistoryItem[]
  stats: WorkoutStats | null
  
  // UI state
  isLoading: boolean
  error: string | null
  lastFetched: string | null
  
  // Calendar state
  selectedDate: Date | null
  selectedWorkout: WorkoutHistoryItem | null
  calendarMonth: Date
  
  // Filtering and pagination
  filters: {
    includeIncomplete: boolean
    detailLevel: 'summary' | 'full'
    startDate?: string
    endDate?: string
  }
  
  // Actions
  fetchHistory: (options?: {
    startDate?: string
    endDate?: string
    limit?: number
    includeIncomplete?: boolean
    detailLevel?: 'summary' | 'full'
    forceRefresh?: boolean
  }) => Promise<void>
  
  selectDate: (date: Date) => void
  selectWorkout: (workoutId: string | null) => void
  setCalendarMonth: (month: Date) => void
  updateFilters: (filters: Partial<HistoryState['filters']>) => void
  
  // Utility actions
  getWorkoutByDate: (date: string) => WorkoutHistoryItem | null
  getWorkoutsForMonth: (month: Date) => WorkoutHistoryItem[]
  clearCache: () => void
  setError: (error: string | null) => void
}

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set, get) => ({
      // Initial state
      workouts: [],
      stats: null,
      isLoading: false,
      error: null,
      lastFetched: null,
      selectedDate: null,
      selectedWorkout: null,
      calendarMonth: new Date(),
      filters: {
        includeIncomplete: true,
        detailLevel: 'summary'
      },

      // Fetch workout history with intelligent caching
      fetchHistory: async (options = {}) => {
        const {
          startDate,
          endDate,
          limit = 50,
          includeIncomplete = true,
          detailLevel = 'summary',
          forceRefresh = false
        } = options

        const { lastFetched, workouts } = get()
        
        // Check if we need to fetch (cache validity)
        const cacheAge = lastFetched ? Date.now() - new Date(lastFetched).getTime() : Infinity
        const isCacheStale = cacheAge > 5 * 60 * 1000 // 5 minutes
        
        if (!forceRefresh && workouts.length > 0 && !isCacheStale) {
          // Use cached data if fresh enough
          return
        }

        set({ isLoading: true, error: null })

        try {
          // Build query parameters
          const params = new URLSearchParams({
            limit: limit.toString(),
            includeIncomplete: includeIncomplete.toString(),
            detailLevel
          })

          if (startDate) params.append('startDate', startDate)
          if (endDate) params.append('endDate', endDate)

          const response = await fetch(`/api/history?${params.toString()}`)
          
          if (!response.ok) {
            throw new Error('Failed to fetch workout history')
          }

          const data = await response.json()
          
          set({
            workouts: data.workouts,
            stats: data.stats,
            isLoading: false,
            error: null,
            lastFetched: new Date().toISOString(),
            filters: {
              includeIncomplete,
              detailLevel,
              startDate,
              endDate
            }
          })

          console.log('📊 History loaded:', data.workouts.length, 'workouts')

        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to load history'
          set({
            isLoading: false,
            error: errorMessage
          })
          console.error('❌ History fetch error:', error)
        }
      },

      // Calendar date selection
      selectDate: (date: Date) => {
        const dateString = date.toISOString().split('T')[0]
        const workout = get().getWorkoutByDate(dateString)
        
        set({
          selectedDate: date,
          selectedWorkout: workout
        })
      },

      // Workout selection
      selectWorkout: (workoutId: string | null) => {
        const { workouts } = get()
        const workout = workoutId ? workouts.find(w => w.id === workoutId) || null : null
        
        set({ selectedWorkout: workout })
      },

      // Calendar month navigation
      setCalendarMonth: (month: Date) => {
        set({ calendarMonth: month })
        
        // Fetch data for the new month if needed
        const startDate = new Date(month.getFullYear(), month.getMonth(), 1).toISOString().split('T')[0]
        const endDate = new Date(month.getFullYear(), month.getMonth() + 1, 0).toISOString().split('T')[0]
        
        get().fetchHistory({ startDate, endDate })
      },

      // Update filtering options
      updateFilters: (newFilters) => {
        const { filters } = get()
        const updatedFilters = { ...filters, ...newFilters }
        
        set({ filters: updatedFilters })
        
        // Refetch with new filters
        get().fetchHistory({
          ...updatedFilters,
          forceRefresh: true
        })
      },

      // Get workout for specific date
      getWorkoutByDate: (date: string) => {
        const { workouts } = get()
        return workouts.find(workout => workout.date === date) || null
      },

      // Get workouts for calendar month
      getWorkoutsForMonth: (month: Date) => {
        const { workouts } = get()
        const monthStart = new Date(month.getFullYear(), month.getMonth(), 1)
        const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0)
        
        return workouts.filter(workout => {
          const workoutDate = new Date(workout.date)
          return workoutDate >= monthStart && workoutDate <= monthEnd
        })
      },

      // Clear cached data
      clearCache: () => {
        set({
          workouts: [],
          stats: null,
          lastFetched: null,
          selectedDate: null,
          selectedWorkout: null,
          error: null
        })
      },

      // Set error state
      setError: (error) => set({ error })
    }),
    {
      name: 'history-storage',
      partialize: (state) => ({
        workouts: state.workouts,
        stats: state.stats,
        lastFetched: state.lastFetched,
        filters: state.filters
      })
    }
  )
)

/*
History Store Architecture Notes:

1. INTELLIGENT CACHING STRATEGY:
   - 5-minute cache validity for fresh data
   - Persistent storage for offline access
   - Automatic cache invalidation on filter changes
   - Force refresh option for manual updates

2. CALENDAR INTEGRATION:
   - Month-based data fetching for performance
   - Date selection with workout lookup
   - Easy navigation between months
   - Lazy-loading for smooth UX

3. AI ANALYSIS SUPPORT:
   - Complete workout history for pattern recognition
   - Recent workout data feeds AI generation
   - Statistical trends for difficulty adjustment
   - Exercise preference tracking

4. PERFORMANCE OPTIMIZATION:
   - Selective data loading (summary vs full detail)
   - Client-side filtering for instant results
   - Minimal API requests through smart caching
   - Lightweight state for mobile performance

5. USER EXPERIENCE FEATURES:
   - Smooth calendar navigation
   - Instant workout detail access
   - Progress statistics visualization
   - Error handling with user feedback

This store enables efficient history browsing while maintaining
the app's lightweight feel and supporting AI analysis needs.
The caching strategy minimizes server load while ensuring
users have quick access to their workout progress.
*/ 