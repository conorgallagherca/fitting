'use client'

import React, { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Calendar from 'react-calendar'
import { useHistoryStore, WorkoutHistoryItem } from '@/lib/history-store'
import { cn } from '@/lib/utils'
import 'react-calendar/dist/Calendar.css'

// Custom calendar tile content for workout days
interface CalendarTileProps {
  date: Date
  view: string
}

export default function HistoryPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const {
    workouts,
    stats,
    isLoading,
    error,
    selectedDate,
    selectedWorkout,
    calendarMonth,
    fetchHistory,
    selectDate,
    setCalendarMonth,
    getWorkoutByDate,
    updateFilters,
    filters
  } = useHistoryStore()

  const [showDetailedView, setShowDetailedView] = useState(false)

  // Authentication check
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    }
  }, [status, router])

  // Load initial history data
  useEffect(() => {
    if (status === 'authenticated') {
      fetchHistory()
    }
  }, [status, fetchHistory])

  // Calendar tile content for highlighting workout days
  const tileContent = ({ date, view }: CalendarTileProps) => {
    if (view !== 'month') return null
    
    const dateString = date.toISOString().split('T')[0]
    const workout = getWorkoutByDate(dateString)
    
    if (!workout) return null

    return (
      <div className="flex justify-center mt-1">
        <div 
          className={cn(
            "w-2 h-2 rounded-full",
            workout.completed 
              ? "bg-green-500" 
              : "bg-yellow-500"
          )}
        />
      </div>
    )
  }

  // Calendar tile class names for styling workout days
  const tileClassName = ({ date, view }: CalendarTileProps) => {
    if (view !== 'month') return ''
    
    const dateString = date.toISOString().split('T')[0]
    const workout = getWorkoutByDate(dateString)
    const isSelected = selectedDate?.toISOString().split('T')[0] === dateString
    
    const classes = []
    
    if (workout) {
      classes.push('workout-day')
      if (workout.completed) {
        classes.push('completed-workout')
      } else {
        classes.push('incomplete-workout')
      }
    }
    
    if (isSelected) {
      classes.push('selected-day')
    }
    
    return classes.join(' ')
  }

  // Handle calendar date click
  const handleDateClick = (value: any) => {
    if (value instanceof Date) {
      selectDate(value)
    }
  }

  // Handle month navigation
  const handleActiveStartDateChange = ({ activeStartDate }: { activeStartDate: Date | null }) => {
    if (activeStartDate) {
      setCalendarMonth(activeStartDate)
    }
  }

  // Format duration for display
  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50/50 to-blue-50/50 dark:from-green-950/20 dark:to-blue-950/20 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-green-500 to-blue-600 bg-clip-text text-transparent">
            Workout History
          </h1>
          <p className="text-muted-foreground mt-2">
            Track your fitness journey and analyze your progress over time
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calendar and Stats - Takes up 2 columns */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Statistics Cards */}
            {stats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-card/50 backdrop-blur border rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{stats.totalWorkouts}</div>
                  <div className="text-sm text-muted-foreground">Total Workouts</div>
                </div>
                <div className="bg-card/50 backdrop-blur border rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{stats.currentStreak}</div>
                  <div className="text-sm text-muted-foreground">Current Streak</div>
                </div>
                <div className="bg-card/50 backdrop-blur border rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-orange-600">{stats.averageDifficulty.toFixed(1)}</div>
                  <div className="text-sm text-muted-foreground">Avg Difficulty</div>
                </div>
                <div className="bg-card/50 backdrop-blur border rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">{formatDuration(stats.averageDuration)}</div>
                  <div className="text-sm text-muted-foreground">Avg Duration</div>
                </div>
              </div>
            )}

            {/* Calendar */}
            <div className="bg-card/50 backdrop-blur border rounded-xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Calendar View</h2>
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span>Completed</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span>Incomplete</span>
                  </div>
                </div>
              </div>
              
              <div className="calendar-container">
                <Calendar
                  value={selectedDate}
                  onChange={handleDateClick}
                  onActiveStartDateChange={handleActiveStartDateChange}
                  tileContent={tileContent}
                  tileClassName={tileClassName}
                  className="w-full"
                  prev2Label={null}
                  next2Label={null}
                />
              </div>
            </div>

            {/* Filter Controls */}
            <div className="bg-card/50 backdrop-blur border rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">View Options</h3>
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.includeIncomplete}
                    onChange={(e) => updateFilters({ includeIncomplete: e.target.checked })}
                    className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  />
                  <span className="text-sm">Include incomplete workouts</span>
                </label>
                
                <button
                  onClick={() => setShowDetailedView(!showDetailedView)}
                  className={cn(
                    "px-3 py-1 rounded-lg text-sm transition-colors",
                    showDetailedView
                      ? "bg-green-600 text-white"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                  )}
                >
                  {showDetailedView ? 'Simple View' : 'Detailed View'}
                </button>
              </div>
            </div>
          </div>

          {/* Workout Details - Takes up 1 column */}
          <div className="space-y-6">
            {/* Selected Date Info */}
            {selectedDate && (
              <div className="bg-card/50 backdrop-blur border rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4">
                  {selectedDate.toLocaleDateString('en-US', { 
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </h3>
                
                {selectedWorkout ? (
                  <WorkoutSummaryCard 
                    workout={selectedWorkout} 
                    showDetailed={showDetailedView}
                  />
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <div className="text-4xl mb-2">🗓️</div>
                    <p>No workout on this day</p>
                    <p className="text-sm mt-1">Why not schedule one for next time?</p>
                  </div>
                )}
              </div>
            )}

            {/* AI Analysis Info */}
            <div className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-950/20 dark:to-green-950/20 border rounded-xl p-6">
              <div className="flex items-start">
                <span className="text-2xl mr-3">🤖</span>
                <div>
                  <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                    AI Progress Analysis
                  </h4>
                  <div className="text-sm text-blue-700 dark:text-blue-300 space-y-2">
                    <p>Your workout history helps AI optimize future sessions:</p>
                    <ul className="space-y-1 text-xs">
                      <li>• <strong>Pattern Recognition:</strong> Identifies your preferred exercise types</li>
                      <li>• <strong>Difficulty Progression:</strong> Tracks improvement over time</li>
                      <li>• <strong>Recovery Analysis:</strong> Optimizes workout frequency</li>
                      <li>• <strong>Variety Balancing:</strong> Prevents workout monotony</li>
                    </ul>
                    {stats && (
                      <p className="text-xs mt-3 font-medium">
                        📊 {stats.totalWorkouts} workouts analyzed • 
                        Favorite: {stats.favoriteWorkoutType} • 
                        Completion rate: {Math.round((stats.completedWorkouts / stats.totalWorkouts) * 100)}%
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            {stats && (
              <div className="bg-card/50 backdrop-blur border rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4">Progress Insights</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Completion Rate</span>
                    <span className="font-semibold">
                      {Math.round((stats.completedWorkouts / stats.totalWorkouts) * 100)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Longest Streak</span>
                    <span className="font-semibold">{stats.longestStreak} days</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total Exercise Sets</span>
                    <span className="font-semibold">{stats.totalExercisesSessions}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Favorite Type</span>
                    <span className="font-semibold capitalize">{stats.favoriteWorkoutType}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Custom Calendar Styles */}
      <style jsx global>{`
        .calendar-container .react-calendar {
          width: 100%;
          background: transparent;
          border: none;
          font-family: inherit;
        }
        
        .calendar-container .react-calendar__tile {
          background: transparent;
          border: 1px solid transparent;
          border-radius: 8px;
          padding: 0.75rem;
          transition: all 0.2s ease;
          position: relative;
        }
        
        .calendar-container .react-calendar__tile:hover {
          background: rgba(34, 197, 94, 0.1);
          border-color: rgba(34, 197, 94, 0.2);
        }
        
        .calendar-container .react-calendar__tile.workout-day {
          font-weight: 600;
        }
        
        .calendar-container .react-calendar__tile.completed-workout {
          background: rgba(34, 197, 94, 0.1);
          color: rgb(34, 197, 94);
          border-color: rgba(34, 197, 94, 0.3);
        }
        
        .calendar-container .react-calendar__tile.incomplete-workout {
          background: rgba(245, 158, 11, 0.1);
          color: rgb(245, 158, 11);
          border-color: rgba(245, 158, 11, 0.3);
        }
        
        .calendar-container .react-calendar__tile.selected-day {
          background: rgba(59, 130, 246, 0.2) !important;
          border-color: rgb(59, 130, 246) !important;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
        }
        
        .calendar-container .react-calendar__navigation button {
          background: transparent;
          border: 1px solid rgba(156, 163, 175, 0.3);
          border-radius: 8px;
          padding: 0.5rem 1rem;
          margin: 0 0.25rem;
          transition: all 0.2s ease;
        }
        
        .calendar-container .react-calendar__navigation button:hover {
          background: rgba(34, 197, 94, 0.1);
          border-color: rgba(34, 197, 94, 0.3);
        }
      `}</style>
    </div>
  )
}

// Workout Summary Card Component
interface WorkoutSummaryCardProps {
  workout: WorkoutHistoryItem
  showDetailed: boolean
}

function WorkoutSummaryCard({ workout, showDetailed }: WorkoutSummaryCardProps) {
  const getStatusColor = (completed: boolean, percentage: number) => {
    if (completed) return 'text-green-600'
    if (percentage >= 80) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getStatusText = (completed: boolean, percentage: number) => {
    if (completed) return 'Completed'
    if (percentage >= 80) return 'Nearly Complete'
    return 'Incomplete'
  }

  return (
    <div className="space-y-4">
      {/* Workout Header */}
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-semibold capitalize">{workout.workoutType} Workout</h4>
          <p className="text-sm text-muted-foreground">
            {workout.duration} min • {workout.exerciseCount} exercises
          </p>
        </div>
        <div className="text-right">
          <div className={cn("font-semibold", getStatusColor(workout.completed, workout.completionPercentage))}>
            {getStatusText(workout.completed, workout.completionPercentage)}
          </div>
          <div className="text-sm text-muted-foreground">
            {workout.completionPercentage}% complete
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div 
          className={cn(
            "h-2 rounded-full transition-all duration-300",
            workout.completed ? "bg-green-500" : 
            workout.completionPercentage >= 80 ? "bg-yellow-500" : "bg-red-500"
          )}
          style={{ width: `${workout.completionPercentage}%` }}
        />
      </div>

      {/* Exercise List */}
      <div>
        <h5 className="font-medium mb-2">Exercises</h5>
        <div className="space-y-2">
          {workout.routine.slice(0, showDetailed ? undefined : 3).map((exercise, index) => (
            <div key={index} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
              <div>
                <span className="font-medium text-sm">{exercise.exercise}</span>
                <div className="text-xs text-muted-foreground">
                  {exercise.sets} sets × {exercise.reps}
                  {exercise.actualReps && exercise.actualReps !== exercise.reps && (
                    <span className="ml-1 text-blue-600">
                      (actual: {exercise.actualReps})
                    </span>
                  )}
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                {exercise.targetMuscles.slice(0, 2).join(', ')}
              </div>
            </div>
          ))}
          
          {!showDetailed && workout.routine.length > 3 && (
            <div className="text-center">
              <span className="text-sm text-muted-foreground">
                +{workout.routine.length - 3} more exercises
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Feedback (if available and detailed view) */}
      {showDetailed && workout.feedback && (
        <div>
          <h5 className="font-medium mb-2">Feedback</h5>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded">
              <div className="text-sm font-medium">Difficulty</div>
              <div className="text-lg">{workout.feedback.difficulty}/5</div>
            </div>
            <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded">
              <div className="text-sm font-medium">Enjoyment</div>
              <div className="text-lg">{workout.feedback.enjoyment}/5</div>
            </div>
            <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded">
              <div className="text-sm font-medium">Energy</div>
              <div className="text-lg">{workout.feedback.energy}/5</div>
            </div>
          </div>
          
          {workout.feedback.notes && (
            <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded">
              <div className="text-sm font-medium mb-1">Notes</div>
              <div className="text-sm text-muted-foreground">"{workout.feedback.notes}"</div>
            </div>
          )}
        </div>
      )}

      {/* Generated By */}
      <div className="flex justify-between items-center text-xs text-muted-foreground">
        <span>Generated by: {workout.generatedBy.toUpperCase()}</span>
        <span>{new Date(workout.date).toLocaleDateString()}</span>
      </div>
    </div>
  )
}

/*
History Page Design Notes:

1. CALENDAR-CENTRIC VISUALIZATION:
   - React Calendar with custom styling for workout days
   - Green dots for completed workouts, yellow for incomplete
   - Hover effects and smooth animations
   - Month navigation with automatic data fetching

2. PROGRESS TRACKING & ANALYTICS:
   - Comprehensive statistics dashboard
   - Completion rates and streak tracking
   - Average difficulty and duration metrics
   - AI analysis insights panel

3. LAZY-LOADING & PERFORMANCE:
   - Intelligent caching with 5-minute validity
   - Month-based data fetching
   - Summary vs detailed view toggle
   - Lightweight initial load

4. AI INTEGRATION BENEFITS:
   - History data feeds AI workout generation
   - Pattern recognition for exercise preferences
   - Difficulty progression analysis
   - Recovery and frequency optimization

5. USER EXPERIENCE FEATURES:
   - Minimal modern design with grid layout
   - Smooth hover effects on calendar days
   - Detailed workout summaries on click
   - Filter controls for customization

This page provides comprehensive workout history visualization
while maintaining app lightweight feel through smart caching
and lazy-loading. The data directly supports AI analysis
and user motivation through progress tracking.
*/ 