'use client'

import React, { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useDashboardStore } from '@/lib/dashboard-store'
import { useGamificationStore } from '@/lib/gamification-store'
import { useProfileStore } from '@/lib/profile-store'
import BadgeDisplay, { BadgeCelebrationModal } from '@/components/BadgeDisplay'
import WorkoutSession from '@/components/WorkoutSession'
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
  const [showWorkoutSession, setShowWorkoutSession] = useState(false)

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

  // Handle workout session
  const handleStartWorkout = () => {
    setShowWorkoutSession(true)
  }

  const handleWorkoutComplete = () => {
    setShowWorkoutSession(false)
    // Refresh dashboard data after workout completion
    fetchTodaysWorkout()
  }

  const handleWorkoutExit = () => {
    setShowWorkoutSession(false)
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

  // Show workout session if active
  if (showWorkoutSession) {
    return (
      <WorkoutSession
        onComplete={handleWorkoutComplete}
        onExit={handleWorkoutExit}
      />
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
                          onClick={handleStartWorkout}
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
            {!notifications.enabled && (
              <div className="bg-card/50 backdrop-blur border rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-3">Stay Motivated 🔔</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Get daily reminders to keep your streak going!
                </p>
                <button
                  onClick={handleEnableNotifications}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Enable Notifications
                </button>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-card/50 backdrop-blur border rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => router.push('/workouts')}
                  className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                >
                  Browse Exercises
                </button>
                <button
                  onClick={() => router.push('/history')}
                  className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                >
                  View History
                </button>
                <button
                  onClick={() => router.push('/profile')}
                  className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                >
                  Update Profile
                </button>
              </div>
            </div>

            {/* Development Testing (remove in production) */}
            {process.env.NODE_ENV === 'development' && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
                <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">Dev Testing</h4>
                <div className="space-y-2">
                  <button
                    onClick={handleTestStreak}
                    className="w-full px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700 transition-colors"
                  >
                    Test Streak
                  </button>
                  <button
                    onClick={handleTestWorkouts}
                    className="w-full px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700 transition-colors"
                  >
                    Test Workouts
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Badge Celebration Modal */}
      <BadgeCelebrationModal
        isOpen={showBadgeModal}
        badge={currentBadge}
        onClose={dismissBadgeModal}
      />

      {/* Confetti Effect */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-blue-400/20 animate-pulse"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="text-6xl animate-bounce">🎉</div>
          </div>
        </div>
      )}
    </div>
  )
} 