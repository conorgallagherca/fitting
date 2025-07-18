'use client'

import React, { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import { useGamificationStore } from '@/lib/gamification-store'
import { useProfileStore } from '@/lib/profile-store'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

/**
 * Settings Page Component
 * 
 * This component handles app-wide user preferences including:
 * - Dark mode toggle with next-themes integration
 * - Notification settings for workout reminders
 * - Data management (clear cache, export data)
 * - Account preferences
 * 
 * Modern Design Trends:
 * - Clean typography with proper spacing
 * - Micro-interactions with smooth transitions
 * - Card-based layout for better organization
 * - Accessible form controls with proper labels
 * 
 * Dependencies:
 * - next-themes for dark mode management
 * - Zustand stores for app state
 * - react-hot-toast for user feedback
 */
export default function SettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { theme, setTheme, systemTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Store hooks for app state management
  const {
    notifications,
    updateNotificationSettings,
    requestNotificationPermission,
    scheduleDailyReminder,
    clearNewBadges
  } = useGamificationStore()

  const {
    clearCache: clearProfileCache,
    refreshProfile
  } = useProfileStore()

  // Ensure component is mounted before showing theme controls
  // This prevents hydration mismatches with SSR
  useEffect(() => {
    setMounted(true)
  }, [])

  // Authentication check with redirect
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    }
  }, [status, router])

  // Handle notification permission request with user feedback
  const handleNotificationToggle = async (enabled: boolean) => {
    if (enabled && notifications.permission !== 'granted') {
      const granted = await requestNotificationPermission()
      
      if (granted) {
        updateNotificationSettings({ enabled: true })
        scheduleDailyReminder()
        toast.success('Notifications enabled! 🔔')
      } else {
        toast.error('Notification permission denied')
      }
    } else {
      updateNotificationSettings({ enabled })
      if (enabled) {
        scheduleDailyReminder()
        toast.success('Daily reminders scheduled')
      } else {
        toast.success('Notifications disabled')
      }
    }
  }

  // Handle notification time change with immediate scheduling
  const handleNotificationTimeChange = (time: string) => {
    updateNotificationSettings({ time })
    if (notifications.enabled) {
      scheduleDailyReminder()
      toast.success(`Reminder time updated to ${time}`)
    }
  }

  // Clear all app data with confirmation
  const handleClearData = () => {
    if (confirm('Are you sure you want to clear all cached data? This will not delete your account.')) {
      clearProfileCache()
      clearNewBadges()
      toast.success('Cache cleared successfully')
    }
  }

  // Export user data (placeholder for future implementation)
  const handleExportData = () => {
    toast.success('Data export feature coming soon!')
  }

  // Show loading spinner during authentication
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50/50 to-blue-50/50 dark:from-green-950/20 dark:to-blue-950/20 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-green-500 to-blue-600 bg-clip-text text-transparent">
            Settings
          </h1>
          <p className="text-muted-foreground mt-2">
            Customize your FitLingo experience
          </p>
        </div>

        <div className="space-y-6">
          
          {/* Appearance Settings */}
          <div className="bg-card/50 backdrop-blur border rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <span className="text-2xl mr-3">🎨</span>
              Appearance
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-3">Theme</label>
                <div className="grid grid-cols-3 gap-3">
                  {/* Light Theme Option */}
                  <button
                    onClick={() => setTheme('light')}
                    className={cn(
                      'p-4 border-2 rounded-lg transition-all duration-200 text-left',
                      'hover:scale-105 hover:shadow-md',
                      theme === 'light'
                        ? 'border-green-500 bg-green-50 dark:bg-green-950/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-green-300'
                    )}
                    disabled={!mounted}
                  >
                    <div className="flex items-center justify-center mb-2">
                      <div className="w-8 h-8 bg-white border border-gray-300 rounded flex items-center justify-center">
                        ☀️
                      </div>
                    </div>
                    <div className="text-sm font-medium text-center">Light</div>
                  </button>

                  {/* Dark Theme Option */}
                  <button
                    onClick={() => setTheme('dark')}
                    className={cn(
                      'p-4 border-2 rounded-lg transition-all duration-200 text-left',
                      'hover:scale-105 hover:shadow-md',
                      theme === 'dark'
                        ? 'border-green-500 bg-green-50 dark:bg-green-950/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-green-300'
                    )}
                    disabled={!mounted}
                  >
                    <div className="flex items-center justify-center mb-2">
                      <div className="w-8 h-8 bg-gray-800 border border-gray-600 rounded flex items-center justify-center">
                        🌙
                      </div>
                    </div>
                    <div className="text-sm font-medium text-center">Dark</div>
                  </button>

                  {/* System Theme Option */}
                  <button
                    onClick={() => setTheme('system')}
                    className={cn(
                      'p-4 border-2 rounded-lg transition-all duration-200 text-left',
                      'hover:scale-105 hover:shadow-md',
                      theme === 'system'
                        ? 'border-green-500 bg-green-50 dark:bg-green-950/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-green-300'
                    )}
                    disabled={!mounted}
                  >
                    <div className="flex items-center justify-center mb-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-white to-gray-800 border border-gray-400 rounded flex items-center justify-center">
                        🖥️
                      </div>
                    </div>
                    <div className="text-sm font-medium text-center">System</div>
                  </button>
                </div>
                
                {mounted && theme === 'system' && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Currently using: {systemTheme} mode
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="bg-card/50 backdrop-blur border rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <span className="text-2xl mr-3">🔔</span>
              Notifications
            </h2>
            
            <div className="space-y-6">
              {/* Daily Reminders Toggle */}
              <div className="flex items-center justify-between">
                <div className="flex-1 mr-4">
                  <div className="font-medium">Daily Workout Reminders</div>
                  <div className="text-sm text-muted-foreground">
                    Get notified to maintain your streak
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications.enabled}
                    onChange={(e) => handleNotificationToggle(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
                </label>
              </div>

              {/* Notification Time Picker */}
              {notifications.enabled && (
                <div className="pl-4 border-l-2 border-green-200 dark:border-green-800">
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Reminder Time
                      </label>
                      <input
                        type="time"
                        value={notifications.time}
                        onChange={(e) => handleNotificationTimeChange(e.target.value)}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-background dark:bg-gray-800 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        We'll send you a friendly reminder at this time each day
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Permission Status */}
              {notifications.permission !== 'granted' && (
                <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                  <div className="flex items-start">
                    <span className="text-amber-600 mr-2">⚠️</span>
                    <div>
                      <div className="text-sm font-medium text-amber-800 dark:text-amber-200">
                        Browser notifications not enabled
                      </div>
                      <div className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                        Enable browser notifications to receive workout reminders
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Data Management */}
          <div className="bg-card/50 backdrop-blur border rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <span className="text-2xl mr-3">💾</span>
              Data Management
            </h2>
            
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleClearData}
                  className="flex-1 px-4 py-2 bg-orange-100 hover:bg-orange-200 dark:bg-orange-900/20 dark:hover:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-lg transition-colors duration-200 font-medium"
                >
                  Clear Cache
                </button>
                <button
                  onClick={handleExportData}
                  className="flex-1 px-4 py-2 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg transition-colors duration-200 font-medium"
                >
                  Export Data
                </button>
              </div>
              
              <div className="text-xs text-muted-foreground">
                <p>• Clear Cache: Removes locally stored data (workouts, progress)</p>
                <p>• Export Data: Download your workout history and progress data</p>
              </div>
            </div>
          </div>

          {/* Account Information */}
          <div className="bg-card/50 backdrop-blur border rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <span className="text-2xl mr-3">👤</span>
              Account
            </h2>
            
            <div className="space-y-4">
              {session?.user && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Email</span>
                    <span className="font-medium">{session.user.email}</span>
                  </div>
                  
                  {session.user.name && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Name</span>
                      <span className="font-medium">{session.user.name}</span>
                    </div>
                  )}
                </div>
              )}
              
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => router.push('/profile')}
                  className="w-full px-4 py-2 bg-green-100 hover:bg-green-200 dark:bg-green-900/20 dark:hover:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg transition-colors duration-200 font-medium"
                >
                  Edit Profile
                </button>
              </div>
            </div>
          </div>

          {/* App Information */}
          <div className="bg-card/50 backdrop-blur border rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <span className="text-2xl mr-3">ℹ️</span>
              About FitLingo
            </h2>
            
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>
                FitLingo is your AI-powered fitness companion, designed to make daily workouts 
                as engaging as learning a new language.
              </p>
              
              <div className="flex justify-between items-center py-2">
                <span>Version</span>
                <span className="font-mono">0.1.0</span>
              </div>
              
              <div className="flex justify-between items-center py-2">
                <span>Build</span>
                <span className="font-mono">MVP-2024</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

/*
Settings Page Architecture Notes:

1. THEME MANAGEMENT:
   - Uses next-themes for robust dark mode support
   - System theme detection for automatic switching
   - localStorage persistence handled by next-themes
   - Prevents hydration mismatches with mounted state

2. NOTIFICATION SETTINGS:
   - Integrates with gamification store for reminder management
   - Handles browser permission requests gracefully
   - Real-time scheduling updates with user feedback
   - Clear permission status indicators

3. USER EXPERIENCE:
   - Card-based layout for better organization
   - Micro-interactions with hover effects and transitions
   - Toast notifications for immediate feedback
   - Responsive design with proper breakpoints

4. DATA MANAGEMENT:
   - Cache clearing functionality for troubleshooting
   - Future-ready export functionality
   - Clear user communication about data operations

5. MODERN DESIGN TRENDS:
   - Clean typography with proper font weights
   - Consistent spacing using Tailwind utilities
   - Subtle gradients and backdrop blur effects
   - Accessible form controls with proper labeling

This component serves as the central hub for user preferences
and maintains consistency with the overall app design language.
*/ 