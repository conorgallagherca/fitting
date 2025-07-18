import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Profile interfaces for type safety and AI integration
export interface UserProfile {
  id: string
  email: string
  name?: string | null
  image?: string | null
  age?: number
  
  // Core fitness profile for AI personalization
  fitnessLevel: 'beginner' | 'intermediate' | 'advanced'
  
  // Goals array - Critical for AI workout focus and exercise selection
  // These drive the AI's decision-making for workout types, intensity, and progression
  goals: ('muscle_gain' | 'weight_loss' | 'endurance' | 'strength' | 'flexibility' | 'general_fitness')[]
  
  // Equipment availability - Determines feasible exercises for AI generation
  // AI uses this to filter exercise database and ensure realistic workout plans
  equipment: ('bodyweight' | 'dumbbells' | 'barbell' | 'resistance_bands' | 'pull_up_bar' | 'yoga_mat' | 'cardio_machine')[]
  
  // Workout preferences - Fine-tune AI personalization
  preferences: {
    duration: number // Target workout duration in minutes
    intensity: 'low' | 'moderate' | 'high'
    workoutTime: 'morning' | 'afternoon' | 'evening'
    restDays: string[] // Days of week for rest
    injuries?: string[] // Injury considerations for exercise modifications
  }
  
  // Gamification data for motivation and progression
  streak: number
  longestStreak: number
  totalWorkouts: number
  level: number
  xp: number
  
  // Timestamps for data freshness and analytics
  createdAt: string
  updatedAt: string
  lastActiveAt?: string
}

// Streak data for progress visualization
export interface StreakData {
  date: string
  streak: number
  workoutsCompleted: number
}

interface ProfileState {
  // Core profile data - cached for performance and offline access
  profile: UserProfile | null
  
  // Loading states for UI feedback
  isLoading: boolean
  isUpdating: boolean
  
  // Streak data for charts - cached to avoid repeated API calls
  streakData: StreakData[]
  streakDataLoaded: boolean
  
  // Error handling
  error: string | null
  
  // Actions for profile management
  setProfile: (profile: UserProfile) => void
  updateProfile: (updates: Partial<UserProfile>) => Promise<boolean>
  fetchProfile: () => Promise<void>
  
  // Streak data management
  setStreakData: (data: StreakData[]) => void
  fetchStreakData: () => Promise<void>
  
  // Cache management - prevents unnecessary API calls
  clearCache: () => void
  refreshProfile: () => Promise<void>
  
  // Error handling
  setError: (error: string | null) => void
  clearError: () => void
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set, get) => ({
      // Initial state
      profile: null,
      isLoading: false,
      isUpdating: false,
      streakData: [],
      streakDataLoaded: false,
      error: null,

      // Set profile in cache - used after successful API calls
      setProfile: (profile) => {
        set({ 
          profile: { ...profile, updatedAt: new Date().toISOString() }, 
          isLoading: false, 
          error: null
        })
      },

      // Update profile via API - Core function for profile management
      // This is called from the profile form and triggers AI re-personalization
      updateProfile: async (updates) => {
        const { profile } = get()
        if (!profile) return false

        set({ isUpdating: true, error: null })

        try {
          // API call to update profile in database
          const response = await fetch('/api/profile/update', {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(updates),
          })

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || 'Failed to update profile')
          }

          const updatedProfile = await response.json()
          
          // Update cache with new data - this triggers UI re-renders
          // and ensures AI gets fresh data for next workout generation
          set({ 
            profile: updatedProfile.user,
            isUpdating: false,
            error: null
          })

          return true
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Update failed'
          set({ 
            isUpdating: false, 
            error: errorMessage 
          })
          return false
        }
      },

      // Fetch profile from API - with caching strategy
      // Only fetches if cache is empty or stale to optimize performance
      fetchProfile: async () => {
        const { profile } = get()
        
        // Cache strategy: Skip fetch if we have recent data (less than 5 minutes old)
        if (profile?.updatedAt) {
          const lastUpdate = new Date(profile.updatedAt)
          const now = new Date()
          const minutesSinceUpdate = (now.getTime() - lastUpdate.getTime()) / (1000 * 60)
          
          if (minutesSinceUpdate < 5) {
            console.log('Using cached profile data (fresh)')
            return
          }
        }

        set({ isLoading: true, error: null })

        try {
          const response = await fetch('/api/profile')
          
          if (!response.ok) {
            throw new Error('Failed to fetch profile')
          }

          const data = await response.json()
          set({ 
            profile: data.profile,
            isLoading: false,
            error: null
          })
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to load profile'
          set({ 
            isLoading: false, 
            error: errorMessage 
          })
        }
      },

      // Streak data management for progress charts
      setStreakData: (data) => {
        set({ streakData: data, streakDataLoaded: true })
      },

      // Fetch streak data for progress visualization
      // Cached separately as it's expensive to calculate and doesn't change often
      fetchStreakData: async () => {
        const { streakDataLoaded } = get()
        
        // Avoid unnecessary fetches if data already loaded
        if (streakDataLoaded) return

        try {
          // For now, generate mock data
          // TODO: Replace with actual API call when database is connected
          const mockStreakData: StreakData[] = Array.from({ length: 30 }, (_, i) => {
            const date = new Date()
            date.setDate(date.getDate() - (29 - i))
            
            return {
              date: date.toISOString().split('T')[0],
              streak: Math.max(0, Math.floor(Math.random() * 15) - 3),
              workoutsCompleted: Math.floor(Math.random() * 2)
            }
          })

          set({ 
            streakData: mockStreakData,
            streakDataLoaded: true
          })
        } catch (error) {
          console.error('Failed to fetch streak data:', error)
        }
      },

      // Cache management
      clearCache: () => {
        set({ 
          profile: null, 
          streakData: [], 
          streakDataLoaded: false,
          error: null 
        })
      },

      // Force refresh - useful after major profile changes
      refreshProfile: async () => {
        set({ profile: null, streakDataLoaded: false })
        await get().fetchProfile()
        await get().fetchStreakData()
      },

      // Error handling
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),
    }),
    {
      name: 'profile-storage',
      // Only persist essential data to localStorage
      partialize: (state) => ({ 
        profile: state.profile,
        streakData: state.streakData,
        streakDataLoaded: state.streakDataLoaded
      }),
    }
  )
)

// Helper function to get AI-relevant profile data
// This extracts key information that the AI uses for workout personalization
export const getAIProfileData = (profile: UserProfile | null) => {
  if (!profile) return null

  return {
    fitnessLevel: profile.fitnessLevel,
    goals: profile.goals,
    equipment: profile.equipment,
    preferences: profile.preferences,
    experience: {
      totalWorkouts: profile.totalWorkouts,
      level: profile.level,
      streak: profile.streak
    }
  }
} 