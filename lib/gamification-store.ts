import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Badge system for Duolingo-style motivation
// Simple but effective badge types that encourage habit formation
export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  category: 'streak' | 'milestone' | 'achievement'
  requirement: {
    type: 'streak' | 'total_workouts' | 'perfect_weeks' | 'consistency'
    value: number
  }
  unlocked: boolean
  unlockedAt?: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
}

// Notification preferences for daily workout reminders
export interface NotificationSettings {
  enabled: boolean
  time: string // Format: "HH:MM"
  permission: 'default' | 'granted' | 'denied'
  lastSent?: string
}

// Motivation mechanics inspired by Duolingo
// Focus on streaks and consistency rather than complex achievements
interface GamificationState {
  // Badge system - Core motivation mechanic
  badges: Badge[]
  unlockedBadges: Badge[]
  newBadges: Badge[] // Recently unlocked for celebration
  
  // Notifications for habit building
  notifications: NotificationSettings
  dailyReminderActive: boolean
  
  // Streak motivation data
  streakFreezeUsed: boolean
  streakFreezeAvailable: boolean
  
  // Celebration states
  showBadgeModal: boolean
  showStreakCelebration: boolean
  celebrationQueue: Badge[]
  
  // Actions
  checkMilestones: (stats: {
    streak: number
    totalWorkouts: number
    longestStreak: number
    completedToday: boolean
  }) => Badge[]
  
  unlockBadge: (badgeId: string) => void
  dismissBadgeModal: () => void
  clearNewBadges: () => void
  
  // Notification management
  requestNotificationPermission: () => Promise<boolean>
  updateNotificationSettings: (settings: Partial<NotificationSettings>) => void
  scheduleDailyReminder: () => void
  sendWorkoutReminder: () => void
  sendBadgeNotification: (badge: Badge) => void
  
  // Streak management
  useStreakFreeze: () => boolean
  resetStreakFreeze: () => void
  
  // Testing utilities for manual milestone checking
  testStreakMilestone: (streakLength: number) => void
  testWorkoutMilestone: (totalWorkouts: number) => void
}

// Default badge definitions - Minimal but motivating
// Inspired by Duolingo's approach: simple, visual, rewarding
const createDefaultBadges = (): Badge[] => [
  // Streak badges - Primary motivation mechanic
  {
    id: 'streak_3',
    name: 'Getting Started',
    description: 'Complete 3 workouts in a row',
    icon: '🔥',
    category: 'streak',
    requirement: { type: 'streak', value: 3 },
    unlocked: false,
    rarity: 'common'
  },
  {
    id: 'streak_7',
    name: 'Week Warrior',
    description: 'Maintain a 7-day workout streak',
    icon: '⚡',
    category: 'streak',
    requirement: { type: 'streak', value: 7 },
    unlocked: false,
    rarity: 'common'
  },
  {
    id: 'streak_14',
    name: 'Two Week Champion',
    description: 'Keep going for 14 days straight',
    icon: '💪',
    category: 'streak',
    requirement: { type: 'streak', value: 14 },
    unlocked: false,
    rarity: 'rare'
  },
  {
    id: 'streak_30',
    name: 'Monthly Master',
    description: 'Incredible 30-day streak!',
    icon: '👑',
    category: 'streak',
    requirement: { type: 'streak', value: 30 },
    unlocked: false,
    rarity: 'epic'
  },
  {
    id: 'streak_100',
    name: 'Centurion',
    description: 'Legendary 100-day streak',
    icon: '🏆',
    category: 'streak',
    requirement: { type: 'streak', value: 100 },
    unlocked: false,
    rarity: 'legendary'
  },
  
  // Milestone badges - Total workout achievements
  {
    id: 'workouts_10',
    name: 'Perfect Ten',
    description: 'Complete your first 10 workouts',
    icon: '🎯',
    category: 'milestone',
    requirement: { type: 'total_workouts', value: 10 },
    unlocked: false,
    rarity: 'common'
  },
  {
    id: 'workouts_50',
    name: 'Half Century',
    description: '50 workouts completed!',
    icon: '⭐',
    category: 'milestone',
    requirement: { type: 'total_workouts', value: 50 },
    unlocked: false,
    rarity: 'rare'
  },
  {
    id: 'workouts_100',
    name: 'Century Club',
    description: '100 workouts - you\'re unstoppable!',
    icon: '💯',
    category: 'milestone',
    requirement: { type: 'total_workouts', value: 100 },
    unlocked: false,
    rarity: 'epic'
  },
  
  // Special achievements
  {
    id: 'first_workout',
    name: 'First Step',
    description: 'Complete your very first workout',
    icon: '🌟',
    category: 'achievement',
    requirement: { type: 'total_workouts', value: 1 },
    unlocked: false,
    rarity: 'common'
  },
  {
    id: 'comeback_kid',
    name: 'Comeback Kid',
    description: 'Return after missing a day',
    icon: '🔄',
    category: 'achievement',
    requirement: { type: 'streak', value: 1 }, // Special logic handled separately
    unlocked: false,
    rarity: 'rare'
  }
]

export const useGamificationStore = create<GamificationState>()(
  persist(
    (set, get) => ({
      // Initial state
      badges: createDefaultBadges(),
      unlockedBadges: [],
      newBadges: [],
      
      notifications: {
        enabled: false,
        time: '18:00', // 6 PM default
        permission: 'default'
      },
      dailyReminderActive: false,
      
      streakFreezeUsed: false,
      streakFreezeAvailable: true,
      
      showBadgeModal: false,
      showStreakCelebration: false,
      celebrationQueue: [],

      // Core milestone checking - Called after each workout
      // This is the heart of the motivation system
      checkMilestones: (stats) => {
        const { badges, unlockedBadges } = get()
        const newlyUnlocked: Badge[] = []

        // Check each badge for unlock conditions
        const updatedBadges = badges.map(badge => {
          if (badge.unlocked) return badge

          let shouldUnlock = false

          // Milestone checking logic - Simple but effective
          switch (badge.requirement.type) {
            case 'streak':
              shouldUnlock = stats.streak >= badge.requirement.value
              break
            case 'total_workouts':
              shouldUnlock = stats.totalWorkouts >= badge.requirement.value
              break
          }

          // Special badge logic
          if (badge.id === 'comeback_kid' && !badge.unlocked) {
            // Unlock if user had a streak break but is back to day 1
            shouldUnlock = stats.streak === 1 && stats.totalWorkouts > 1
          }

          if (shouldUnlock) {
            const unlockedBadge = {
              ...badge,
              unlocked: true,
              unlockedAt: new Date().toISOString()
            }
            newlyUnlocked.push(unlockedBadge)
            return unlockedBadge
          }

          return badge
        })

        if (newlyUnlocked.length > 0) {
          set({
            badges: updatedBadges,
            unlockedBadges: [...unlockedBadges, ...newlyUnlocked],
            newBadges: [...get().newBadges, ...newlyUnlocked],
            showBadgeModal: true,
            celebrationQueue: newlyUnlocked
          })

          // Send browser notification for new badges
          if (get().notifications.enabled) {
            newlyUnlocked.forEach(badge => {
              get().sendBadgeNotification(badge)
            })
          }
        }

        return newlyUnlocked
      },

      // Badge management
      unlockBadge: (badgeId) => {
        const { badges } = get()
        const badge = badges.find(b => b.id === badgeId)
        if (!badge || badge.unlocked) return

        const unlockedBadge = {
          ...badge,
          unlocked: true,
          unlockedAt: new Date().toISOString()
        }

        const updatedBadges = badges.map(b => 
          b.id === badgeId ? unlockedBadge : b
        )

        set({
          badges: updatedBadges,
          unlockedBadges: [...get().unlockedBadges, unlockedBadge],
          newBadges: [...get().newBadges, unlockedBadge],
          showBadgeModal: true
        })
      },

      dismissBadgeModal: () => {
        set({ showBadgeModal: false, celebrationQueue: [] })
      },

      clearNewBadges: () => {
        set({ newBadges: [] })
      },

      // Notification system for habit building
      requestNotificationPermission: async () => {
        if (!('Notification' in window)) {
          console.warn('This browser does not support notifications')
          return false
        }

        try {
          const permission = await Notification.requestPermission()
          
          set(state => ({
            notifications: {
              ...state.notifications,
              permission: permission
            }
          }))

          if (permission === 'granted') {
            get().scheduleDailyReminder()
            return true
          }
          
          return false
        } catch (error) {
          console.error('Failed to request notification permission:', error)
          return false
        }
      },

      updateNotificationSettings: (settings) => {
        set(state => ({
          notifications: {
            ...state.notifications,
            ...settings
          }
        }))

        // Reschedule reminder if time changed
        if (settings.time && get().notifications.enabled) {
          get().scheduleDailyReminder()
        }
      },

      // Daily reminder system - Critical for habit formation
      scheduleDailyReminder: () => {
        const { notifications } = get()
        
        if (!notifications.enabled || notifications.permission !== 'granted') {
          return
        }

        // Clear existing reminder
        if (get().dailyReminderActive) {
          // In a real app, you'd clear the scheduled notification here
          set({ dailyReminderActive: false })
        }

        // Schedule daily reminder
        const [hours, minutes] = notifications.time.split(':').map(Number)
        const now = new Date()
        const reminderTime = new Date()
        
        reminderTime.setHours(hours, minutes, 0, 0)
        
        // If time has passed today, schedule for tomorrow
        if (reminderTime.getTime() <= now.getTime()) {
          reminderTime.setDate(reminderTime.getDate() + 1)
        }

        const timeUntilReminder = reminderTime.getTime() - now.getTime()
        
        setTimeout(() => {
          get().sendWorkoutReminder()
          // Reschedule for next day
          get().scheduleDailyReminder()
        }, timeUntilReminder)

        set({ dailyReminderActive: true })
      },

      sendWorkoutReminder: () => {
        const { notifications } = get()
        
        if (notifications.permission !== 'granted') return

        // Check if reminder already sent today
        const today = new Date().toDateString()
        if (notifications.lastSent === today) return

        new Notification('FitLingo Workout Reminder', {
          body: 'Time for your daily workout! Keep that streak alive! 🔥',
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          tag: 'daily-workout-reminder',
          requireInteraction: true
        })

        set(state => ({
          notifications: {
            ...state.notifications,
            lastSent: today
          }
        }))
      },

      // Helper method for badge notifications
      sendBadgeNotification: (badge: Badge) => {
        if (get().notifications.permission !== 'granted') return

        new Notification(`Badge Unlocked: ${badge.name}!`, {
          body: badge.description,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          tag: `badge-${badge.id}`,
          requireInteraction: false
        })
      },

      // Streak freeze system (Duolingo-inspired)
      useStreakFreeze: () => {
        const { streakFreezeAvailable, streakFreezeUsed } = get()
        
        if (!streakFreezeAvailable || streakFreezeUsed) {
          return false
        }

        set({ 
          streakFreezeUsed: true,
          streakFreezeAvailable: false 
        })
        
        return true
      },

      resetStreakFreeze: () => {
        set({ 
          streakFreezeUsed: false,
          streakFreezeAvailable: true 
        })
      },

      // Testing utilities for manual milestone verification
      testStreakMilestone: (streakLength) => {
        console.log(`🧪 Testing streak milestone: ${streakLength} days`)
        const testStats = {
          streak: streakLength,
          totalWorkouts: 25,
          longestStreak: Math.max(streakLength, 10),
          completedToday: true
        }
        
        const newBadges = get().checkMilestones(testStats)
        console.log(`✅ Unlocked ${newBadges.length} badges:`, newBadges.map(b => b.name))
      },

      testWorkoutMilestone: (totalWorkouts) => {
        console.log(`🧪 Testing workout milestone: ${totalWorkouts} total`)
        const testStats = {
          streak: 5,
          totalWorkouts: totalWorkouts,
          longestStreak: 15,
          completedToday: true
        }
        
        const newBadges = get().checkMilestones(testStats)
        console.log(`✅ Unlocked ${newBadges.length} badges:`, newBadges.map(b => b.name))
      }
    }),
    {
      name: 'gamification-storage',
      partialize: (state) => ({
        badges: state.badges,
        unlockedBadges: state.unlockedBadges,
        notifications: state.notifications,
        streakFreezeUsed: state.streakFreezeUsed,
        streakFreezeAvailable: state.streakFreezeAvailable
      })
    }
  )
)

/*
Gamification Store Architecture Notes:

1. MOTIVATION PSYCHOLOGY (Duolingo-inspired):
   - Streaks are the primary motivation mechanic
   - Badges provide visual progress milestones
   - Daily notifications maintain engagement
   - Simple badge system prevents overwhelm

2. HABIT FORMATION FOCUS:
   - Daily workout reminders at consistent time
   - Streak freeze as safety net (reduces anxiety)
   - Immediate positive feedback on milestone completion
   - Visual progress through badge collection

3. TECHNICAL IMPLEMENTATION:
   - Browser Notifications API for reminders
   - Zustand persistence for offline badge access
   - Simple milestone checking logic
   - Testing utilities for development verification

4. INTEGRATION WITH WORKOUT SYSTEM:
   - checkMilestones() called after each workout log
   - Badge unlocks trigger celebrations in UI
   - Notification system independent of workout flow
   - Streak data syncs with user profile stats

5. USER EXPERIENCE PRINCIPLES:
   - Minimal cognitive load - simple badge categories
   - Immediate feedback - notifications and celebrations
   - Progressive difficulty - badges get harder to earn
   - Recovery mechanisms - streak freeze for missed days

This system enhances habit formation without complex gamification
that might distract from the core fitness goals. The focus is on
consistency and positive reinforcement rather than competition.
*/ 