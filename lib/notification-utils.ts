// Notification utility for FitLingo
// Handles browser notifications for workout reminders and badge unlocks
// Designed to be simple, non-intrusive, and habit-building focused

export interface NotificationOptions {
  title: string
  body: string
  icon?: string
  badge?: string
  tag?: string
  requireInteraction?: boolean
}

// Check if browser supports notifications
export function isNotificationSupported(): boolean {
  return 'Notification' in window
}

// Get current notification permission status
export function getNotificationPermission(): NotificationPermission {
  if (!isNotificationSupported()) {
    return 'denied'
  }
  return Notification.permission
}

// Request notification permission from user
export async function requestNotificationPermission(): Promise<boolean> {
  if (!isNotificationSupported()) {
    console.warn('Notifications not supported in this browser')
    return false
  }

  try {
    const permission = await Notification.requestPermission()
    return permission === 'granted'
  } catch (error) {
    console.error('Failed to request notification permission:', error)
    return false
  }
}

// Send a notification with proper error handling
export function sendNotification(options: NotificationOptions): Notification | null {
  if (!isNotificationSupported()) {
    console.warn('Notifications not supported')
    return null
  }

  if (Notification.permission !== 'granted') {
    console.warn('Notification permission not granted')
    return null
  }

  try {
    const notification = new Notification(options.title, {
      body: options.body,
      icon: options.icon || '/favicon.ico',
      badge: options.badge || '/favicon.ico',
      tag: options.tag,
      requireInteraction: options.requireInteraction || false
    })

    // Auto-close notification after 5 seconds unless it requires interaction
    if (!options.requireInteraction) {
      setTimeout(() => notification.close(), 5000)
    }

    return notification
  } catch (error) {
    console.error('Failed to send notification:', error)
    return null
  }
}

// Preset notification types for FitLingo

// Daily workout reminder - The core habit-building notification
export function sendWorkoutReminder(): Notification | null {
  return sendNotification({
    title: 'FitLingo Workout Reminder',
    body: 'Time for your daily workout! Keep that streak alive! 🔥',
    tag: 'daily-workout-reminder',
    requireInteraction: true
  })
}

// Badge unlock notification - Celebration moment
export function sendBadgeUnlockNotification(badgeName: string, description: string): Notification | null {
  return sendNotification({
    title: `🏆 Badge Unlocked: ${badgeName}!`,
    body: description,
    tag: `badge-unlock-${badgeName.toLowerCase().replace(/\s+/g, '-')}`,
    requireInteraction: false
  })
}

// Streak milestone notification - Extra motivation
export function sendStreakMilestoneNotification(streakDays: number): Notification | null {
  const milestoneEmojis: Record<number, string> = {
    3: '🔥',
    7: '⚡',
    14: '💪',
    30: '👑',
    100: '🏆'
  }

  const emoji = milestoneEmojis[streakDays] || '🎯'
  
  return sendNotification({
    title: `${emoji} ${streakDays}-Day Streak!`,
    body: `Amazing consistency! You've completed ${streakDays} workouts in a row!`,
    tag: `streak-milestone-${streakDays}`,
    requireInteraction: false
  })
}

// Gentle nudge for users who haven't worked out
export function sendEncouragementNotification(): Notification | null {
  const encouragingMessages = [
    "Your body will thank you for just 15 minutes today! 💪",
    "Every workout counts, no matter how small! 🌟",
    "Ready to feel amazing? Your workout is waiting! ✨",
    "Turn today into a victory - one exercise at a time! 🎯"
  ]

  const randomMessage = encouragingMessages[Math.floor(Math.random() * encouragingMessages.length)]

  return sendNotification({
    title: 'FitLingo Check-in',
    body: randomMessage,
    tag: 'encouragement-notification',
    requireInteraction: false
  })
}

// Schedule a notification for a specific time
export function scheduleNotification(
  options: NotificationOptions,
  scheduledTime: Date
): NodeJS.Timeout | null {
  const now = new Date()
  const delay = scheduledTime.getTime() - now.getTime()

  if (delay <= 0) {
    console.warn('Cannot schedule notification in the past')
    return null
  }

  const timeoutId = setTimeout(() => {
    sendNotification(options)
  }, delay)

  return timeoutId
}

// Clear a scheduled notification
export function clearScheduledNotification(timeoutId: NodeJS.Timeout): void {
  clearTimeout(timeoutId)
}

// Service worker registration for background notifications
// This is more advanced but critical for true habit-building apps
export async function registerNotificationServiceWorker(): Promise<boolean> {
  if (!('serviceWorker' in navigator)) {
    console.warn('Service workers not supported')
    return false
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js')
    console.log('Service worker registered for notifications:', registration)
    return true
  } catch (error) {
    console.error('Service worker registration failed:', error)
    return false
  }
}

/*
Notification Utility Design Notes:

1. HABIT FORMATION PSYCHOLOGY:
   - Daily reminders at consistent times build routines
   - Positive reinforcement through badge notifications
   - Non-intrusive design respects user attention
   - Milestone celebrations maintain motivation

2. TECHNICAL IMPLEMENTATION:
   - Graceful degradation when notifications not supported
   - Proper permission handling with user consent
   - Error handling for notification failures
   - Auto-closing notifications to avoid annoyance

3. DUOLINGO INSPIRATION:
   - Consistent daily reminder timing
   - Encouraging rather than guilt-inducing messages
   - Visual celebrations for achievements
   - Optional notifications respect user preferences

4. INTEGRATION POINTS:
   - Called from gamification store for badge unlocks
   - Scheduled from user settings for daily reminders
   - Triggered by milestone achievements
   - Coordinated with service worker for background operation

5. USER EXPERIENCE FOCUS:
   - Easy permission request flow
   - Clear notification purposes
   - Customizable timing preferences
   - Respectful of user's attention and battery

This utility supports the core FitLingo motivation loop without
being pushy or annoying. It enhances habit formation through
timely, positive notifications that celebrate progress.
*/ 