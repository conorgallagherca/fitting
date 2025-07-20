'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useSession } from 'next-auth/react'
import { useProfileStore } from '@/lib/profile-store'

interface OnboardingData {
  name?: string
  age?: number
  fitnessLevel: 'beginner' | 'intermediate' | 'advanced'
  goals: ('muscle_gain' | 'weight_loss' | 'endurance' | 'strength' | 'flexibility' | 'general_fitness')[]
  equipment: ('bodyweight' | 'dumbbells' | 'barbell' | 'resistance_bands' | 'pull_up_bar' | 'yoga_mat' | 'cardio_machine')[]
  preferences: {
    duration: number
    intensity: 'low' | 'moderate' | 'high'
    workoutTime: 'morning' | 'afternoon' | 'evening'
    restDays: string[]
    injuries?: string[]
  }
}

const fitnessLevels = [
  { value: 'beginner', label: 'Beginner', description: 'New to fitness or returning after a break', icon: '🌱' },
  { value: 'intermediate', label: 'Intermediate', description: 'Regular exercise routine, some experience', icon: '💪' },
  { value: 'advanced', label: 'Advanced', description: 'Consistent training, looking to push limits', icon: '🏆' }
]

const goals = [
  { value: 'weight_loss', label: 'Weight Loss', icon: '⚖️' },
  { value: 'muscle_gain', label: 'Muscle Gain', icon: '💪' },
  { value: 'strength', label: 'Strength', icon: '🏋️' },
  { value: 'endurance', label: 'Endurance', icon: '🏃' },
  { value: 'flexibility', label: 'Flexibility', icon: '🧘' },
  { value: 'general_fitness', label: 'General Fitness', icon: '🌟' }
]

const equipment = [
  { value: 'bodyweight', label: 'Bodyweight Only', icon: '👤' },
  { value: 'dumbbells', label: 'Dumbbells', icon: '🏋️' },
  { value: 'resistance_bands', label: 'Resistance Bands', icon: '🎯' },
  { value: 'yoga_mat', label: 'Yoga Mat', icon: '🧘' },
  { value: 'pull_up_bar', label: 'Pull-up Bar', icon: '🏋️‍♂️' },
  { value: 'cardio_machine', label: 'Cardio Machine', icon: '🏃‍♀️' }
]

const workoutTimes = [
  { value: 'morning', label: 'Morning', icon: '🌅' },
  { value: 'afternoon', label: 'Afternoon', icon: '☀️' },
  { value: 'evening', label: 'Evening', icon: '🌆' }
]

const intensities = [
  { value: 'low', label: 'Low', description: 'Gentle, recovery-focused', color: 'bg-green-100 text-green-800' },
  { value: 'moderate', label: 'Moderate', description: 'Balanced challenge', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'high', label: 'High', description: 'Intense, pushing limits', color: 'bg-red-100 text-red-800' }
]

const daysOfWeek = [
  { value: 'monday', label: 'Mon' },
  { value: 'tuesday', label: 'Tue' },
  { value: 'wednesday', label: 'Wed' },
  { value: 'thursday', label: 'Thu' },
  { value: 'friday', label: 'Fri' },
  { value: 'saturday', label: 'Sat' },
  { value: 'sunday', label: 'Sun' }
]

export default function OnboardingWizard() {
  const router = useRouter()
  const { data: session } = useSession()
  const { setProfile } = useProfileStore()
  
  const [currentStep, setCurrentStep] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    fitnessLevel: 'beginner',
    goals: ['general_fitness'],
    equipment: ['bodyweight'],
    preferences: {
      duration: 30,
      intensity: 'moderate',
      workoutTime: 'evening',
      restDays: ['sunday'],
      injuries: []
    }
  })

  const steps = [
    { title: 'Welcome', description: 'Let\'s get to know you' },
    { title: 'Fitness Level', description: 'Where are you in your journey?' },
    { title: 'Goals', description: 'What do you want to achieve?' },
    { title: 'Equipment', description: 'What do you have available?' },
    { title: 'Preferences', description: 'How do you like to work out?' },
    { title: 'Generating', description: 'Creating your first workout...' }
  ]

  useEffect(() => {
    setProgress(((currentStep + 1) / steps.length) * 100)
  }, [currentStep, steps.length])

  const updateOnboardingData = (updates: Partial<OnboardingData>) => {
    setOnboardingData(prev => ({
      ...prev,
      ...updates,
      preferences: {
        ...prev.preferences,
        ...(updates.preferences || {})
      }
    }))
  }

  const handleNext = () => {
    if (currentStep === steps.length - 2) {
      // Final step - submit onboarding data
      handleSubmitOnboarding()
    } else {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handleBack = () => {
    setCurrentStep(prev => Math.max(0, prev - 1))
  }

  const handleSubmitOnboarding = async () => {
    setIsLoading(true)
    setCurrentStep(steps.length - 1) // Show generating step

    try {
      const response = await fetch('/api/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...onboardingData,
          name: session?.user?.name
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to complete onboarding')
      }

      const result = await response.json()
      
      // Update profile store
      setProfile(result.user)
      
      // Redirect to dashboard after a brief delay
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)

    } catch (error) {
      console.error('Onboarding error:', error)
      // Handle error - could show error message and retry
    } finally {
      setIsLoading(false)
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-6"
          >
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-3xl font-bold text-slate-800 dark:text-white">
              Welcome to FitLingo!
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-md mx-auto">
              Let's create your personalized fitness experience. This will only take a few minutes.
            </p>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                💡 We'll use this information to generate your first AI-powered workout!
              </p>
            </div>
          </motion.div>
        )

      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="text-center">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
                What's your fitness level?
              </h2>
              <p className="text-slate-600 dark:text-slate-300">
                This helps us create the perfect workout intensity for you
              </p>
            </div>
            
            <div className="grid gap-4">
              {fitnessLevels.map((level) => (
                <button
                  key={level.value}
                  onClick={() => updateOnboardingData({ fitnessLevel: level.value as any })}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    onboardingData.fitnessLevel === level.value
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-slate-200 dark:border-slate-700 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{level.icon}</span>
                    <div className="text-left">
                      <div className="font-semibold text-slate-800 dark:text-white">
                        {level.label}
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        {level.description}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="text-center">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
                What are your fitness goals?
              </h2>
              <p className="text-slate-600 dark:text-slate-300">
                Select all that apply - we'll create workouts tailored to your objectives
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {goals.map((goal) => (
                <button
                  key={goal.value}
                  onClick={() => {
                    const currentGoals = onboardingData.goals
                    const newGoals = currentGoals.includes(goal.value as any)
                      ? currentGoals.filter(g => g !== goal.value)
                      : [...currentGoals, goal.value as any]
                    updateOnboardingData({ goals: newGoals })
                  }}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    onboardingData.goals.includes(goal.value as any)
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-slate-200 dark:border-slate-700 hover:border-blue-300'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-1">{goal.icon}</div>
                    <div className="text-sm font-medium text-slate-800 dark:text-white">
                      {goal.label}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="text-center">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
                What equipment do you have?
              </h2>
              <p className="text-slate-600 dark:text-slate-300">
                We'll create workouts using only what you have available
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {equipment.map((item) => (
                <button
                  key={item.value}
                  onClick={() => {
                    const currentEquipment = onboardingData.equipment
                    const newEquipment = currentEquipment.includes(item.value as any)
                      ? currentEquipment.filter(e => e !== item.value)
                      : [...currentEquipment, item.value as any]
                    updateOnboardingData({ equipment: newEquipment })
                  }}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    onboardingData.equipment.includes(item.value as any)
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-slate-200 dark:border-slate-700 hover:border-blue-300'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-1">{item.icon}</div>
                    <div className="text-sm font-medium text-slate-800 dark:text-white">
                      {item.label}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )

      case 4:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="text-center">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
                Workout Preferences
              </h2>
              <p className="text-slate-600 dark:text-slate-300">
                Let's customize your workout experience
              </p>
            </div>
            
            <div className="space-y-6">
              {/* Duration */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Workout Duration: {onboardingData.preferences.duration} minutes
                </label>
                <input
                  type="range"
                  min="15"
                  max="90"
                  step="5"
                  value={onboardingData.preferences.duration}
                  onChange={(e) => updateOnboardingData({
                    preferences: { ...onboardingData.preferences, duration: parseInt(e.target.value) }
                  })}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>15 min</span>
                  <span>90 min</span>
                </div>
              </div>

              {/* Intensity */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                  Preferred Intensity
                </label>
                <div className="grid gap-3">
                  {intensities.map((intensity) => (
                    <button
                      key={intensity.value}
                      onClick={() => updateOnboardingData({
                        preferences: { ...onboardingData.preferences, intensity: intensity.value as any }
                      })}
                      className={`p-3 rounded-lg border-2 transition-all text-left ${
                        onboardingData.preferences.intensity === intensity.value
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-slate-200 dark:border-slate-700 hover:border-blue-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-slate-800 dark:text-white">
                            {intensity.label}
                          </div>
                          <div className="text-sm text-slate-600 dark:text-slate-400">
                            {intensity.description}
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${intensity.color}`}>
                          {intensity.label}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Workout Time */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                  Preferred Workout Time
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {workoutTimes.map((time) => (
                    <button
                      key={time.value}
                      onClick={() => updateOnboardingData({
                        preferences: { ...onboardingData.preferences, workoutTime: time.value as any }
                      })}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        onboardingData.preferences.workoutTime === time.value
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-slate-200 dark:border-slate-700 hover:border-blue-300'
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-xl mb-1">{time.icon}</div>
                        <div className="text-sm font-medium text-slate-800 dark:text-white">
                          {time.label}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Rest Days */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                  Rest Days
                </label>
                <div className="grid grid-cols-7 gap-2">
                  {daysOfWeek.map((day) => (
                    <button
                      key={day.value}
                      onClick={() => {
                        const currentRestDays = onboardingData.preferences.restDays
                        const newRestDays = currentRestDays.includes(day.value)
                          ? currentRestDays.filter(d => d !== day.value)
                          : [...currentRestDays, day.value]
                        updateOnboardingData({
                          preferences: { ...onboardingData.preferences, restDays: newRestDays }
                        })
                      }}
                      className={`p-2 rounded-lg border-2 transition-all ${
                        onboardingData.preferences.restDays.includes(day.value)
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-slate-200 dark:border-slate-700 hover:border-blue-300'
                      }`}
                    >
                      <div className="text-xs font-medium text-slate-800 dark:text-white">
                        {day.label}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )

      case 5:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-6"
          >
            <div className="text-6xl mb-4">🤖</div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
              Creating Your First Workout
            </h2>
            <p className="text-slate-600 dark:text-slate-300">
              Our AI is analyzing your preferences and generating a personalized workout plan...
            </p>
            
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
            
            <div className="space-y-2 text-sm text-slate-500">
              <div>✅ Profile created</div>
              <div>✅ Preferences saved</div>
              <div>🔄 Generating workout...</div>
            </div>
          </motion.div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Step {currentStep + 1} of {steps.length}
            </span>
            <span className="text-sm text-slate-500">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
            <motion.div
              className="bg-blue-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8">
          {renderStep()}
        </div>

        {/* Navigation */}
        {currentStep < steps.length - 1 && (
          <div className="flex justify-between mt-8">
            <button
              onClick={handleBack}
              disabled={currentStep === 0}
              className="px-6 py-3 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Back
            </button>
            
            <button
              onClick={handleNext}
              disabled={isLoading || 
                (currentStep === 1 && !onboardingData.fitnessLevel) ||
                (currentStep === 2 && onboardingData.goals.length === 0) ||
                (currentStep === 3 && onboardingData.equipment.length === 0)
              }
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {currentStep === steps.length - 2 ? 'Create My Workout' : 'Continue'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
} 