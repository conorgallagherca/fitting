'use client'

import React, { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useDashboardStore } from '@/lib/dashboard-store'
import { useGamificationStore } from '@/lib/gamification-store'
import { useProfileStore } from '@/lib/profile-store'
import BadgeDisplay, { BadgeCelebrationModal } from '@/components/BadgeDisplay'
import { cn } from '@/lib/utils'

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  // Store hooks
  const {
    todaysWorkout,
    userStats,
    isLoading,
    error,
    showConfetti,
    fetchTodaysWorkout,
    startWorkout,
    dismissConfetti
  } = useDashboardStore()
  
  const {
    badges,
    unlockedBadges,
    newBadges,
    notifications,
    showBadgeModal,
    celebrationQueue,
    requestNotificationPermission,
    updateNotificationSettings,
    scheduleDailyReminder,
    dismissBadgeModal,
    clearNewBadges,
    testStreakMilestone,
    testWorkoutMilestone
  } = useGamificationStore()
  
  const { profile } = useProfileStore()
  
  // Local state
  const [showNotificationSetup, setShowNotificationSetup] = useState(false)

  // Authentication check
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    }
  }, [status, router])

  // Load dashboard data
  useEffect(() => {
    if (status === 'authenticated') {
      fetchTodaysWorkout()
    }
  }, [status, fetchTodaysWorkout])

  // Auto-dismiss confetti after 3 seconds
  useEffect(() => {
    if (showConfetti) {
      const timer = setTimeout(dismissConfetti, 3000)
      return () => clearTimeout(timer)
    }
  }, [showConfetti, dismissConfetti])

  // Handle notification permission request
  const handleEnableNotifications = async () => {
    const granted = await requestNotificationPermission()
    if (granted) {
      updateNotificationSettings({ enabled: true })
      scheduleDailyReminder()
      setShowNotificationSetup(false)
    }
  }

  // Handle notification time change
  const handleNotificationTimeChange = (time: string) => {
    updateNotificationSettings({ time })
  }

  // Testing functions for development
  const handleTestStreak = () => {
    const streakLength = parseInt(prompt('Enter streak length to test:') || '7')
    testStreakMilestone(streakLength)
  }

  const handleTestWorkouts = () => {
    const totalWorkouts = parseInt(prompt('Enter total workouts to test:') || '10')
    testWorkoutMilestone(totalWorkouts)
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    )
  }

  const currentBadge = celebrationQueue[0] || null

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50/50 to-blue-50/50 dark:from-green-950/20 dark:to-blue-950/20 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        
        {/* Header with user greeting */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-green-500 to-blue-600 bg-clip-text text-transparent">
            Welcome back{profile?.name ? `, ${profile.name}` : ''}! 👋
          </h1>
          <p className="text-muted-foreground mt-2">
            Ready to crush your fitness goals today?
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main content area - Today's workout */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Today's Workout Card */}
            <div className="bg-card/50 backdrop-blur border rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-4">Today's Workout</h2>
              
              {todaysWorkout ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-medium capitalize">{todaysWorkout.workoutType || 'Mixed'} Workout</h3>
                      <p className="text-sm text-muted-foreground">
                        Generated workout • {todaysWorkout.routine?.length || 0} exercises
                      </p>
                    </div>
                    <div className="text-right">
                      {todaysWorkout.completed ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200">
                          ✅ Completed
                        </span>
                      ) : (
                        <button
                          onClick={startWorkout}
                          className="px-6 py-2 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-lg font-medium hover:from-green-600 hover:to-blue-700 transition-all"
                        >
                          Start Workout 💪
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {/* Exercise preview */}
                  {todaysWorkout.routine && (
                    <div>
                      <h4 className="font-medium mb-2">Exercise Preview:</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {todaysWorkout.routine.slice(0, 4).map((exercise, index) => (
                          <div key={index} className="flex items-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                            <span className="text-2xl mr-3">💪</span>
                            <div>
                              <div className="font-medium text-sm">{exercise.exercise}</div>
                              <div className="text-xs text-muted-foreground">
                                {exercise.sets} sets × {exercise.reps}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      {todaysWorkout.routine.length > 4 && (
                        <p className="text-sm text-muted-foreground mt-2">
                          +{todaysWorkout.routine.length - 4} more exercises
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">🏋️‍♂️</div>
                  <div className="text-lg text-gray-600 dark:text-gray-400">
                    You&apos;re all caught up! Check back tomorrow for a new workout.
                  </div>
                </div>
              )}
            </div>

            {/* Stats Cards */}
            {userStats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-card/50 backdrop-blur border rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-orange-600">{userStats.streak}</div>
                  <div className="text-sm text-muted-foreground">Day Streak 🔥</div>
                </div>
                <div className="bg-card/50 backdrop-blur border rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{userStats.totalWorkouts}</div>
                  <div className="text-sm text-muted-foreground">Total Workouts</div>
                </div>
                <div className="bg-card/50 backdrop-blur border rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{userStats.level}</div>
                  <div className="text-sm text-muted-foreground">Level</div>
                </div>
                <div className="bg-card/50 backdrop-blur border rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">{userStats.xp}</div>
                  <div className="text-sm text-muted-foreground">XP Points</div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Badges and notifications */}
          <div className="space-y-6">
            
            {/* Badge Collection */}
            <div className="bg-card/50 backdrop-blur border rounded-xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Badge Collection 🏆</h3>
                {newBadges.length > 0 && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200">
                    {newBadges.length} new!
                  </span>
                )}
              </div>
              
              <BadgeDisplay 
                badges={badges} 
                size="medium" 
                maxDisplay={12}
                className="mb-4"
              />
              
              {unlockedBadges.length > 0 && (
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    Keep going! {badges.length - unlockedBadges.length} more badges to unlock
                  </p>
                </div>
              )}
            </div>

            {/* Notification Settings */}
            <div className="bg-card/50 backdrop-blur border rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Daily Reminders 🔔</h3>
              
              {notifications.permission === 'granted' ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Workout reminders</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifications.enabled}
                        onChange={(e) => updateNotificationSettings({ enabled: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
                    </label>
                  </div>
                  
                  {notifications.enabled && (
                    <div>
                      <label className="block text-sm font-medium mb-2">Reminder time</label>
                      <input
                        type="time"
                        value={notifications.time}
                        onChange={(e) => handleNotificationTimeChange(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-800"
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-4">
                    Get daily workout reminders to build your habit!
                  </p>
                  <button
                    onClick={handleEnableNotifications}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
                  >
                    Enable Notifications
                  </button>
                </div>
              )}
            </div>

            {/* Development Testing (remove in production) */}
            {process.env.NODE_ENV === 'development' && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
                <h4 className="text-sm font-semibold mb-2">🧪 Testing Tools</h4>
                <div className="space-y-2">
                  <button
                    onClick={handleTestStreak}
                    className="w-full px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 rounded text-xs hover:bg-yellow-200 dark:hover:bg-yellow-900/50 transition-colors"
                  >
                    Test Streak Badge
                  </button>
                  <button
                    onClick={handleTestWorkouts}
                    className="w-full px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 rounded text-xs hover:bg-yellow-200 dark:hover:bg-yellow-900/50 transition-colors"
                  >
                    Test Workout Badge
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Badge celebration modal */}
      <BadgeCelebrationModal
        badge={currentBadge}
        isOpen={showBadgeModal}
        onClose={() => {
          dismissBadgeModal()
          clearNewBadges()
        }}
      />

      {/* Confetti animation */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-40">
          {/* Simple CSS-based confetti animation */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="animate-ping text-4xl">🎉</div>
          </div>
        </div>
      )}
    </div>
  )
}

/*
Dashboard Integration Notes:

1. GAMIFICATION INTEGRATION:
   - Badge display shows progress and achievements
   - New badge notifications with celebration modal
   - Testing tools for milestone verification
   - Streak tracking and visual feedback

2. NOTIFICATION SYSTEM:
   - Browser notification permission request
   - Daily reminder time customization
   - Toggle for enabling/disabling reminders
   - Visual feedback for notification status

3. MOTIVATION MECHANICS:
   - Immediate badge feedback after workout completion
   - Progress visualization through stats cards
   - Visual celebrations with confetti effects
   - Clear progress indicators and next steps

4. USER EXPERIENCE:
   - Clean dashboard layout with sidebar for gamification
   - Responsive design for mobile and desktop
   - Smooth animations and transitions
   - Development testing tools for badge verification

5. HABIT FORMATION:
   - Daily workout call-to-action
   - Streak visualization as primary motivator
   - Badge collection encourages consistency
   - Notification reminders maintain engagement

This dashboard creates a motivating daily experience that encourages
habit formation through visual progress, achievements, and reminders.
*/ 