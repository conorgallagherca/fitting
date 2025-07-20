'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useDashboardStore } from '@/lib/dashboard-store'
import { useGamificationStore } from '@/lib/gamification-store'
import { useProfileStore } from '@/lib/profile-store'
import { WorkoutExercise } from '@/lib/dashboard-store'
import { FiPlay, FiPause, FiSkipForward, FiCheck, FiX, FiMessageCircle, FiClock, FiTarget } from 'react-icons/fi'

interface WorkoutSessionProps {
  onComplete: () => void
  onExit: () => void
}

interface ExerciseSet {
  setNumber: number
  weight?: number
  reps?: number
  completed: boolean
  notes?: string
}

interface ExerciseProgress {
  exerciseId: string
  exercise: WorkoutExercise
  sets: ExerciseSet[]
  currentSet: number
  isCompleted: boolean
  startTime: string
  endTime?: string
}

export default function WorkoutSession({ onComplete, onExit }: WorkoutSessionProps) {
  const router = useRouter()
  const { todaysWorkout, userStats, completeWorkout } = useDashboardStore()
  const { testWorkoutMilestone } = useGamificationStore()
  const { profile } = useProfileStore()
  
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0)
  const [exerciseProgress, setExerciseProgress] = useState<ExerciseProgress[]>([])
  const [isWorkoutActive, setIsWorkoutActive] = useState(false)
  const [workoutStartTime, setWorkoutStartTime] = useState<Date | null>(null)
  const [currentTime, setCurrentTime] = useState<Date>(new Date())
  const [restTimer, setRestTimer] = useState<number | null>(null)
  const [showAIChat, setShowAIChat] = useState(false)
  const [aiMessage, setAiMessage] = useState('')
  const [aiResponse, setAiResponse] = useState('')
  const [isAiLoading, setIsAiLoading] = useState(false)
  
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const restTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Initialize exercise progress when workout starts
  useEffect(() => {
    if (todaysWorkout?.routine) {
      const progress = todaysWorkout.routine.map((exercise, index) => ({
        exerciseId: `exercise-${index}`,
        exercise,
        sets: Array.from({ length: exercise.sets }, (_, i) => ({
          setNumber: i + 1,
          weight: undefined,
          reps: undefined,
          completed: false,
          notes: ''
        })),
        currentSet: 0,
        isCompleted: false,
        startTime: new Date().toISOString()
      }))
      setExerciseProgress(progress)
    }
  }, [todaysWorkout])

  // Update current time every second
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  // Handle rest timer
  useEffect(() => {
    if (restTimer && restTimer > 0) {
      restTimerRef.current = setTimeout(() => {
        setRestTimer(restTimer - 1)
      }, 1000)
    } else if (restTimer === 0) {
      setRestTimer(null)
    }

    return () => {
      if (restTimerRef.current) clearTimeout(restTimerRef.current)
    }
  }, [restTimer])

  const startWorkout = () => {
    setIsWorkoutActive(true)
    setWorkoutStartTime(new Date())
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getWorkoutDuration = (): number => {
    if (!workoutStartTime) return 0
    return Math.floor((currentTime.getTime() - workoutStartTime.getTime()) / 1000)
  }

  const updateSetData = (exerciseIndex: number, setIndex: number, data: Partial<ExerciseSet>) => {
    setExerciseProgress(prev => prev.map((exercise, idx) => {
      if (idx === exerciseIndex) {
        const updatedSets = exercise.sets.map((set, setIdx) => {
          if (setIdx === setIndex) {
            return { ...set, ...data }
          }
          return set
        })
        return { ...exercise, sets: updatedSets }
      }
      return exercise
    }))
  }

  const completeSet = (exerciseIndex: number, setIndex: number) => {
    updateSetData(exerciseIndex, setIndex, { completed: true })
    
    const currentExercise = exerciseProgress[exerciseIndex]
    if (setIndex < currentExercise.sets.length - 1) {
      // Start rest timer for next set
      setRestTimer(currentExercise.exercise.restTime)
    } else {
      // Exercise completed, move to next
      completeExercise(exerciseIndex)
    }
  }

  const completeExercise = (exerciseIndex: number) => {
    setExerciseProgress(prev => prev.map((exercise, idx) => {
      if (idx === exerciseIndex) {
        return { ...exercise, isCompleted: true, endTime: new Date().toISOString() }
      }
      return exercise
    }))

    if (exerciseIndex < exerciseProgress.length - 1) {
      setCurrentExerciseIndex(exerciseIndex + 1)
      // Start rest timer for next exercise
      const nextExercise = exerciseProgress[exerciseIndex + 1]
      setRestTimer(nextExercise.exercise.restTime)
    } else {
      // All exercises completed
      finishWorkout()
    }
  }

  const skipRest = () => {
    setRestTimer(null)
  }

  const finishWorkout = async () => {
    setIsWorkoutActive(false)
    
    // Calculate workout stats
    const completedExercises = exerciseProgress.filter(ex => ex.isCompleted).length
    const totalSets = exerciseProgress.reduce((total, ex) => total + ex.sets.length, 0)
    const completedSets = exerciseProgress.reduce((total, ex) => 
      total + ex.sets.filter(set => set.completed).length, 0
    )

    // Update user stats
    if (userStats) {
      const newStats = {
        ...userStats,
        streak: userStats.streak + 1,
        totalWorkouts: userStats.totalWorkouts + 1,
        xp: userStats.xp + 50 + (completedExercises * 10), // Base XP + bonus for exercises
        longestStreak: Math.max(userStats.longestStreak, userStats.streak + 1)
      }

      // Check for level up
      const newLevel = Math.floor(newStats.xp / 500) + 1
      if (newLevel > newStats.level) {
        newStats.level = newLevel
      }

      // Test milestone achievements
      testWorkoutMilestone(newStats.totalWorkouts)
    }

    // Save workout data
    await saveWorkoutData()

    // Show completion screen briefly
    setTimeout(() => {
      onComplete()
    }, 3000)
  }

  const saveWorkoutData = async () => {
    try {
      const workoutData = {
        workoutId: todaysWorkout?.id,
        startTime: workoutStartTime?.toISOString(),
        endTime: new Date().toISOString(),
        duration: getWorkoutDuration(),
        exerciseProgress,
        completedExercises: exerciseProgress.filter(ex => ex.isCompleted).length,
        totalExercises: exerciseProgress.length
      }

      const response = await fetch('/api/log-workout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(workoutData)
      })

      if (!response.ok) {
        console.error('Failed to save workout data')
      }
    } catch (error) {
      console.error('Error saving workout:', error)
    }
  }

  const askAI = async () => {
    if (!aiMessage.trim()) return

    setIsAiLoading(true)
    try {
      const currentExercise = exerciseProgress[currentExerciseIndex]
      const response = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: aiMessage,
          context: {
            exercise: currentExercise.exercise.exercise,
            fitnessLevel: profile?.fitnessLevel,
            currentSet: currentExercise.currentSet + 1,
            totalSets: currentExercise.sets.length
          }
        })
      })

      if (response.ok) {
        const data = await response.json()
        setAiResponse(data.response)
      }
    } catch (error) {
      setAiResponse('Sorry, I\'m having trouble connecting right now. Try again in a moment.')
    } finally {
      setIsAiLoading(false)
    }
  }

  const currentExercise = exerciseProgress[currentExerciseIndex]
  const isLastExercise = currentExerciseIndex === exerciseProgress.length - 1
  const allExercisesCompleted = exerciseProgress.every(ex => ex.isCompleted)

  if (!todaysWorkout || !currentExercise) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading workout...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-slate-800 dark:text-white">
              {isWorkoutActive ? 'Workout in Progress' : 'Ready to Start'}
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {isWorkoutActive ? `Duration: ${formatTime(getWorkoutDuration())}` : 'Tap start when ready'}
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            {!isWorkoutActive && (
              <button
                onClick={startWorkout}
                className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                <FiPlay className="inline mr-2" />
                Start Workout
              </button>
            )}
            
            <button
              onClick={onExit}
              className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400 mb-1">
            <span>Exercise {currentExerciseIndex + 1} of {exerciseProgress.length}</span>
            <span>{Math.round(((currentExerciseIndex + 1) / exerciseProgress.length) * 100)}%</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
            <motion.div
              className="bg-blue-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${((currentExerciseIndex + 1) / exerciseProgress.length) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      </div>

      {/* Rest Timer */}
      {restTimer && restTimer > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800 p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <FiClock className="text-blue-600" />
              <span className="text-blue-800 dark:text-blue-200 font-medium">
                Rest Time: {formatTime(restTimer)}
              </span>
            </div>
            <button
              onClick={skipRest}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Skip Rest
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Exercise Details */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Current Exercise */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                    {currentExercise.exercise.exercise}
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400">
                    {currentExercise.exercise.targetMuscles.join(', ')}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-slate-500">Target</div>
                  <div className="font-semibold">
                    {currentExercise.exercise.sets} sets × {currentExercise.exercise.reps}
                  </div>
                </div>
              </div>

              {currentExercise.exercise.instructions && (
                <div className="mb-4 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    {currentExercise.exercise.instructions}
                  </p>
                </div>
              )}

              {/* Sets */}
              <div className="space-y-3">
                {currentExercise.sets.map((set, setIndex) => (
                  <div
                    key={setIndex}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      set.completed
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                        : setIndex === currentExercise.currentSet
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-medium">Set {set.setNumber}</span>
                      {set.completed && (
                        <FiCheck className="text-green-600 w-5 h-5" />
                      )}
                    </div>

                    {!set.completed && setIndex === currentExercise.currentSet && (
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Weight (lbs)
                          </label>
                          <input
                            type="number"
                            value={set.weight || ''}
                            onChange={(e) => updateSetData(currentExerciseIndex, setIndex, { 
                              weight: e.target.value ? parseFloat(e.target.value) : undefined 
                            })}
                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                            placeholder="0"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Reps
                          </label>
                          <input
                            type="number"
                            value={set.reps || ''}
                            onChange={(e) => updateSetData(currentExerciseIndex, setIndex, { 
                              reps: e.target.value ? parseInt(e.target.value) : undefined 
                            })}
                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                            placeholder="0"
                          />
                        </div>
                      </div>
                    )}

                    {set.completed && (
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        {set.weight ? `${set.weight} lbs × ` : ''}{set.reps} reps
                      </div>
                    )}

                    {!set.completed && setIndex === currentExercise.currentSet && (
                      <button
                        onClick={() => completeSet(currentExerciseIndex, setIndex)}
                        disabled={!set.weight || !set.reps}
                        className="w-full px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Complete Set
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Exercise Actions */}
              <div className="flex justify-between mt-6">
                <button
                  onClick={() => setCurrentExerciseIndex(Math.max(0, currentExerciseIndex - 1))}
                  disabled={currentExerciseIndex === 0}
                  className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ← Previous
                </button>

                {currentExercise.isCompleted && !isLastExercise && (
                  <button
                    onClick={() => setCurrentExerciseIndex(currentExerciseIndex + 1)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    Next Exercise →
                  </button>
                )}

                {allExercisesCompleted && (
                  <button
                    onClick={finishWorkout}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                  >
                    Finish Workout 🎉
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* AI Assistant */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-slate-800 dark:text-white">AI Assistant</h3>
                <button
                  onClick={() => setShowAIChat(!showAIChat)}
                  className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
                >
                  <FiMessageCircle className="w-5 h-5" />
                </button>
              </div>

              <AnimatePresence>
                {showAIChat && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-3"
                  >
                    <textarea
                      value={aiMessage}
                      onChange={(e) => setAiMessage(e.target.value)}
                      placeholder="Ask about form, modifications, or anything else..."
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm resize-none"
                      rows={3}
                    />
                    
                    <button
                      onClick={askAI}
                      disabled={!aiMessage.trim() || isAiLoading}
                      className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isAiLoading ? 'Thinking...' : 'Ask AI'}
                    </button>

                    {aiResponse && (
                      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <p className="text-sm text-slate-700 dark:text-slate-300">{aiResponse}</p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Workout Stats */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
              <h3 className="font-semibold text-slate-800 dark:text-white mb-3">Workout Stats</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Duration:</span>
                  <span className="font-medium">{formatTime(getWorkoutDuration())}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Exercises:</span>
                  <span className="font-medium">{exerciseProgress.filter(ex => ex.isCompleted).length}/{exerciseProgress.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Sets Completed:</span>
                  <span className="font-medium">
                    {exerciseProgress.reduce((total, ex) => 
                      total + ex.sets.filter(set => set.completed).length, 0
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Exercise List */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
              <h3 className="font-semibold text-slate-800 dark:text-white mb-3">Exercise List</h3>
              <div className="space-y-2">
                {exerciseProgress.map((exercise, index) => (
                  <button
                    key={exercise.exerciseId}
                    onClick={() => setCurrentExerciseIndex(index)}
                    className={`w-full text-left p-2 rounded-lg transition-colors ${
                      index === currentExerciseIndex
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200'
                        : exercise.isCompleted
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{exercise.exercise.exercise}</span>
                      {exercise.isCompleted && <FiCheck className="w-4 h-4" />}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 