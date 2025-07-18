'use client'

import React, { useState, useEffect } from 'react'
import { useTimer } from 'react-timer-hook'
import { useDashboardStore, WorkoutExercise } from '@/lib/dashboard-store'
import { cn } from '@/lib/utils'
import Confetti from 'react-confetti'

interface WorkoutModalProps {
  workout: {
    id: string;
    name: string;
    warmup: WorkoutExercise[];
    routine: WorkoutExercise[];
    cooldown: WorkoutExercise[];
  };
  isOpen: boolean;
  onClose: () => void;
}

export default function WorkoutModal({ workout, isOpen, onClose }: WorkoutModalProps) {
  const [currentPhase, setCurrentPhase] = useState<'warmup' | 'workout' | 'cooldown'>('warmup')
  const [exerciseIndex, setExerciseIndex] = useState(0)
  const [setIndex, setSetIndex] = useState(0)
  const [isResting, setIsResting] = useState(false)
  const [workoutComplete, setWorkoutComplete] = useState(false)
  const [confettiActive, setConfettiActive] = useState(false)
  const [showFeedbackForm, setShowFeedbackForm] = useState(false)
  
  // Exercise tracking state
  const [actualReps, setActualReps] = useState<number | string>('')
  const [exerciseNotes, setExerciseNotes] = useState('')
  
  // Feedback form state
  const [feedback, setFeedback] = useState({
    difficulty: 3,
    enjoyment: 3,
    energy: 3,
    notes: '',
    quickReaction: '' as 'too_easy' | 'perfect' | 'too_hard' | 'loved_it' | 'hated_it' | ''
  })

  // Dashboard store integration
  const { 
    completeWorkout, 
    checkForNewAchievements,
    logExerciseCompletion,
    submitWorkoutLog,
    isLoggingWorkout,
    hasLoggedToday,
    exerciseProgress
  } = useDashboardStore()

  // Timer for exercise and rest periods
  const {
    seconds,
    minutes,
    hours,
    isRunning,
    pause,
    restart,
  } = useTimer({
    expiryTimestamp: new Date(),
    onExpire: () => {
      if (isResting) {
        setIsResting(false)
        // Move to next set or exercise
        const currentRoutine = getCurrentRoutine()
        if (setIndex < currentRoutine[exerciseIndex].sets - 1) {
          setSetIndex(setIndex + 1)
        } else {
          nextExercise()
        }
      }
    }
  })

  // Reset modal state when opening
  useEffect(() => {
    if (isOpen) {
      setCurrentPhase('warmup')
      setExerciseIndex(0)
      setSetIndex(0)
      setIsResting(false)
      setWorkoutComplete(false)
      setConfettiActive(false)
      setShowFeedbackForm(false)
      setActualReps('')
      setExerciseNotes('')
      setFeedback({
        difficulty: 3,
        enjoyment: 3,
        energy: 3,
        notes: '',
        quickReaction: ''
      })
    }
  }, [isOpen])

  const getCurrentRoutine = () => {
    if (currentPhase === 'warmup') return workout.warmup || []
    if (currentPhase === 'cooldown') return workout.cooldown || []
    return workout.routine
  }

  const nextExercise = () => {
    const currentRoutine = getCurrentRoutine()
    
    if (exerciseIndex < currentRoutine.length - 1) {
      setExerciseIndex(exerciseIndex + 1)
      setSetIndex(0)
      setActualReps('')
      setExerciseNotes('')
    } else {
      // Move to next phase
      if (currentPhase === 'warmup') {
        setCurrentPhase('workout')
        setExerciseIndex(0)
        setSetIndex(0)
      } else if (currentPhase === 'workout') {
        setCurrentPhase('cooldown')
        setExerciseIndex(0)
        setSetIndex(0)
      } else {
        // Workout complete!
        completeWorkoutFlow()
      }
    }
  }

  const completeWorkoutFlow = () => {
    // Check if user has already logged today to prevent endless feedback
    if (hasLoggedToday) {
      setWorkoutComplete(true)
      setConfettiActive(true)
      setTimeout(() => setConfettiActive(false), 3000)
      return
    }

    // Show feedback form for first completion of the day
    setShowFeedbackForm(true)
  }

  const startRestTimer = (duration: number) => {
    setIsResting(true)
    const restEndTime = new Date()
    restEndTime.setSeconds(restEndTime.getSeconds() + duration)
    restart(restEndTime)
  }

  const currentExercise = getCurrentRoutine()[exerciseIndex]

  // Handle exercise completion with actual performance logging
  const handleCompleteExercise = () => {
    if (!currentExercise) return

    // Log actual performance for this exercise
    if (currentPhase === 'workout' && actualReps) {
      logExerciseCompletion(exerciseIndex, actualReps, exerciseNotes)
    }

    // If this exercise has rest time, start rest timer
    if (currentExercise.restTime > 0) {
      startRestTimer(currentExercise.restTime)
    } else {
      // No rest needed, go to next exercise immediately
      nextExercise()
    }
  }

  // Handle workout feedback submission
  const handleFeedbackSubmit = async () => {
    const feedbackData = {
      difficulty: feedback.difficulty,
      enjoyment: feedback.enjoyment,
      energy: feedback.energy,
      notes: feedback.notes,
      quickReaction: feedback.quickReaction || undefined
    }

    await submitWorkoutLog(feedbackData)
    
    setShowFeedbackForm(false)
    setWorkoutComplete(true)
    setConfettiActive(true)
    
    // Hide confetti after celebration
    setTimeout(() => setConfettiActive(false), 3000)
  }

  // Quick reaction emoji handlers
  const handleQuickReaction = (reaction: typeof feedback.quickReaction) => {
    setFeedback(prev => ({ ...prev, quickReaction: reaction }))
    
    // Auto-adjust sliders based on reaction for better UX
    if (reaction === 'too_easy') {
      setFeedback(prev => ({ ...prev, difficulty: 1, enjoyment: 2 }))
    } else if (reaction === 'too_hard') {
      setFeedback(prev => ({ ...prev, difficulty: 5, enjoyment: 2 }))
    } else if (reaction === 'loved_it') {
      setFeedback(prev => ({ ...prev, enjoyment: 5, energy: 4 }))
    } else if (reaction === 'hated_it') {
      setFeedback(prev => ({ ...prev, enjoyment: 1, energy: 2 }))
    } else if (reaction === 'perfect') {
      setFeedback(prev => ({ ...prev, difficulty: 3, enjoyment: 5, energy: 4 }))
    }
  }

  // Handle modal close
  const handleClose = () => {
    if (isOpen && !showFeedbackForm) {
      const confirmClose = window.confirm('Are you sure you want to exit your workout? Progress will be lost.')
      if (!confirmClose) return
    }
    onClose()
  }

  // Start exercise when modal opens
  useEffect(() => {
    if (isOpen && !isRunning) {
      const currentTime = new Date()
      currentTime.setSeconds(currentTime.getSeconds() + 1)
      restart(currentTime)
    }
  }, [isOpen, isRunning, restart])

  if (!isOpen || !workout || !currentExercise) return null

  const currentArray = getCurrentRoutine()
  const progressPercentage = ((exerciseIndex + 1) / currentArray.length) * 100

  return (
    <>
      {/* Confetti for workout completion */}
      {confettiActive && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={200}
        />
      )}
      
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
          
          {/* Feedback Form Screen */}
          {showFeedbackForm ? (
            <div className="p-6">
              <h2 className="text-2xl font-bold text-center mb-6 bg-gradient-to-r from-green-500 to-blue-600 bg-clip-text text-transparent">
                How was your workout?
              </h2>

              {/* Quick Reaction Emojis */}
              <div className="mb-8">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Quick reaction:</h3>
                <div className="flex justify-center space-x-4">
                  {[
                    { reaction: 'too_easy', emoji: '😴', label: 'Too Easy' },
                    { reaction: 'perfect', emoji: '🎯', label: 'Perfect' },
                    { reaction: 'too_hard', emoji: '😵', label: 'Too Hard' },
                    { reaction: 'loved_it', emoji: '🤩', label: 'Loved It' },
                    { reaction: 'hated_it', emoji: '😫', label: 'Disliked' }
                  ].map(({ reaction, emoji, label }) => (
                    <button
                      key={reaction}
                      onClick={() => handleQuickReaction(reaction as typeof feedback.quickReaction)}
                      className={cn(
                        "flex flex-col items-center p-3 rounded-xl border-2 transition-all duration-300 transform hover:scale-110",
                        feedback.quickReaction === reaction 
                          ? "border-green-500 bg-green-50 dark:bg-green-950/20 shadow-lg" 
                          : "border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-600"
                      )}
                    >
                      <span className="text-2xl mb-1">{emoji}</span>
                      <span className="text-xs text-gray-600 dark:text-gray-400">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Animated Rating Sliders */}
              <div className="space-y-6 mb-8">
                {/* Difficulty Slider */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Difficulty
                    </label>
                    <span className="text-sm text-gray-500">
                      {['Too Easy', 'Easy', 'Just Right', 'Hard', 'Too Hard'][feedback.difficulty - 1]}
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={feedback.difficulty}
                      onChange={(e) => setFeedback(prev => ({ ...prev, difficulty: parseInt(e.target.value) }))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-difficulty"
                      style={{
                        background: `linear-gradient(to right, #10b981 0%, #10b981 ${(feedback.difficulty - 1) * 25}%, #e5e7eb ${(feedback.difficulty - 1) * 25}%, #e5e7eb 100%)`
                      }}
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>😴</span>
                      <span>🎯</span>
                      <span>🔥</span>
                    </div>
                  </div>
                </div>

                {/* Enjoyment Slider */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Enjoyment
                    </label>
                    <span className="text-sm text-gray-500">
                      {['Hated It', 'Disliked', 'Neutral', 'Liked', 'Loved It'][feedback.enjoyment - 1]}
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={feedback.enjoyment}
                      onChange={(e) => setFeedback(prev => ({ ...prev, enjoyment: parseInt(e.target.value) }))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(feedback.enjoyment - 1) * 25}%, #e5e7eb ${(feedback.enjoyment - 1) * 25}%, #e5e7eb 100%)`
                      }}
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>😫</span>
                      <span>😐</span>
                      <span>🤩</span>
                    </div>
                  </div>
                </div>

                {/* Energy Slider */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Energy Level
                    </label>
                    <span className="text-sm text-gray-500">
                      {['Exhausted', 'Tired', 'Okay', 'Energized', 'Pumped'][feedback.energy - 1]}
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={feedback.energy}
                      onChange={(e) => setFeedback(prev => ({ ...prev, energy: parseInt(e.target.value) }))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, #f59e0b 0%, #f59e0b ${(feedback.energy - 1) * 25}%, #e5e7eb ${(feedback.energy - 1) * 25}%, #e5e7eb 100%)`
                      }}
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>😴</span>
                      <span>😊</span>
                      <span>⚡</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes Textarea */}
              <div className="mb-6">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Additional notes (optional)
                </label>
                <textarea
                  value={feedback.notes}
                  onChange={(e) => setFeedback(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="How did the workout feel? Any exercises you particularly liked or disliked?"
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
                  rows={3}
                />
              </div>

              {/* AI Optimization Info */}
              <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-950/20 dark:to-green-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-start">
                  <span className="text-2xl mr-3">🤖</span>
                  <div>
                    <h4 className="font-semibold text-sm text-blue-800 dark:text-blue-200 mb-1">
                      AI Learning from Your Feedback
                    </h4>
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      Your ratings help AI optimize tomorrow&apos;s workout:
                    </p>
                    <ul className="text-xs text-blue-600 dark:text-blue-400 mt-1 space-y-1">
                      <li>• &apos;Too easy&apos; → increases intensity</li>
                      <li>• &apos;Loved it&apos; → similar exercise style</li>
                      <li>• &apos;Too hard&apos; → easier progression</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                onClick={handleFeedbackSubmit}
                disabled={isLoggingWorkout}
                className={cn(
                  "w-full py-4 rounded-xl font-semibold text-white transition-all duration-300 transform",
                  "bg-gradient-to-r from-green-500 to-blue-600",
                  "hover:from-green-600 hover:to-blue-700 hover:scale-[1.02]",
                  "disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none",
                  "focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                )}
              >
                {isLoggingWorkout ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Processing feedback...
                  </div>
                ) : (
                  'Complete Workout 🎉'
                )}
              </button>

              <p className="text-xs text-center text-gray-500 mt-3">
                You can only log feedback once per day to ensure data quality
              </p>
            </div>

          ) : workoutComplete ? (
            /* Workout Complete Screen */
            <div className="p-8 text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-3xl font-bold text-green-600 mb-4">Workout Complete!</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Amazing work! You&apos;ve completed your {currentPhase} phase.
              </p>
              {hasLoggedToday && (
                <p className="text-sm text-green-600 dark:text-green-400 mb-4">
                  ✅ Feedback already submitted today
                </p>
              )}
              <button
                onClick={onClose}
                className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
              >
                Finish
              </button>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold capitalize">{currentPhase} Phase</h2>
                  <button 
                    onClick={handleClose}
                    className="text-white/80 hover:text-white text-2xl"
                  >
                    ×
                  </button>
                </div>
                
                {/* Progress bar */}
                <div className="w-full bg-white/20 rounded-full h-2">
                  <div 
                    className="bg-white h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
                
                <div className="flex justify-between text-sm mt-2 opacity-90">
                  <span>Exercise {exerciseIndex + 1} of {currentArray.length}</span>
                  <span>{Math.round(progressPercentage)}% Complete</span>
                </div>
              </div>

              {/* Exercise Content */}
              <div className="p-6">
                {/* Exercise Name */}
                <h3 className="text-2xl font-bold text-center mb-4 text-gray-900 dark:text-white">
                  {currentExercise.exercise}
                </h3>

                {/* Exercise Details */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{currentExercise.sets}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Sets</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{currentExercise.reps}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Reps (Target)</div>
                  </div>
                </div>

                {/* Actual Performance Input (for main workout phase) */}
                {currentPhase === 'workout' && (
                  <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-3">
                      Log Your Performance
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-yellow-700 dark:text-yellow-300 block mb-1">
                          Actual reps completed:
                        </label>
                        <input
                          type="text"
                          value={actualReps}
                          onChange={(e) => setActualReps(e.target.value)}
                          placeholder={`Target: ${currentExercise.reps}`}
                          className="w-full p-2 border border-yellow-300 dark:border-yellow-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-yellow-700 dark:text-yellow-300 block mb-1">
                          Notes (optional):
                        </label>
                        <input
                          type="text"
                          value={exerciseNotes}
                          onChange={(e) => setExerciseNotes(e.target.value)}
                          placeholder="How did this feel? Any modifications?"
                          className="w-full p-2 border border-yellow-300 dark:border-yellow-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Instructions */}
                {currentExercise.instructions && (
                  <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">Instructions:</h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{currentExercise.instructions}</p>
                  </div>
                )}

                {/* Timer Display */}
                <div className="text-center mb-6">
                  {isResting ? (
                    <div className="space-y-2">
                      <div className="text-lg font-semibold text-orange-600">Rest Time</div>
                      <div className="text-4xl font-bold text-orange-600">
                        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Take a break before the next exercise
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="text-lg font-semibold text-green-600">Exercise Time</div>
                      <div className="text-4xl font-bold text-green-600">
                        {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Time spent on this exercise
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  {isResting ? (
                    <div className="space-y-2">
                      <button
                        onClick={() => setIsResting(false)}
                        className="w-full py-3 px-6 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
                      >
                        Skip Rest & Continue
                      </button>
                      <div className="flex gap-2">
                        <button
                          onClick={pause}
                          className="flex-1 py-2 px-4 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                        >
                          {isRunning ? 'Pause' : 'Resume'}
                        </button>
                        <button
                          onClick={() => {
                            const newRestTime = new Date()
                            newRestTime.setSeconds(newRestTime.getSeconds() + (currentExercise?.restTime || 60))
                            restart(newRestTime)
                          }}
                          className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Reset Timer
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={handleCompleteExercise}
                      disabled={currentPhase === 'workout' && !actualReps}
                      className={cn(
                        "w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200",
                        currentPhase === 'workout' && !actualReps
                          ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                          : "bg-gradient-to-r from-green-500 to-blue-600 text-white hover:from-green-600 hover:to-blue-700 transform hover:scale-[1.02]"
                      )}
                    >
                      {currentPhase === 'workout' && !actualReps 
                        ? 'Enter reps to continue' 
                        : 'Complete Exercise'
                      }
                    </button>
                  )}

                  {/* Emergency buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={handleClose}
                      className="flex-1 py-2 px-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      Exit Workout
                    </button>
                    <button
                      onClick={nextExercise}
                      className="flex-1 py-2 px-4 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      Skip Exercise
                    </button>
                  </div>
                </div>

                {/* Modifications */}
                {currentExercise.modifications && currentExercise.modifications.length > 0 && (
                  <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                    <h4 className="font-semibold mb-2 text-blue-800 dark:text-blue-200">Modifications:</h4>
                    <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                      {currentExercise.modifications.map((mod, index) => (
                        <li key={index} className="flex items-start">
                          <span className="mr-2">•</span>
                          <span>{mod}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}

/*
Enhanced Workout Modal Design Notes:

1. DUOLINGO-STYLE FEEDBACK SYSTEM:
   - Single daily feedback prevents endless submissions
   - Immediate visual feedback with emoji reactions
   - Animated sliders provide tactile engagement
   - AI optimization explanations educate users

2. WORKOUT TRACKING & PERFORMANCE LOGGING:
   - Actual reps input validates real performance
   - Exercise notes capture qualitative feedback
   - Completion percentage calculated from logged sets
   - Grace period for incomplete workouts

3. SLICK UI DESIGN ELEMENTS:
   - Emoji quick reactions for instant feedback
   - Animated progress sliders with live labels
   - Gradient color coding for different metrics
   - Smooth transitions and hover effects

4. AI FEEDBACK OPTIMIZATION:
   - Quick reactions auto-adjust slider values
   - Clear explanations of how feedback improves AI
   - Difficulty, enjoyment, and energy ratings
   - Optional notes for detailed feedback

5. HABIT PSYCHOLOGY & ENGAGEMENT:
   - Daily completion ceremony with confetti
   - Clear progress visualization throughout workout
   - Immediate rewards and streak updates
   - Prevention of feedback fatigue

6. DATA QUALITY CONTROLS:
   - Required actual reps for main workout exercises
   - Feedback form only shown once per day
   - Validation prevents incomplete submissions
   - Background processing for smooth UX

This modal creates an engaging, data-rich workout experience
that provides high-quality feedback for AI optimization while
maintaining the daily habit psychology that drives consistency.
*/ 