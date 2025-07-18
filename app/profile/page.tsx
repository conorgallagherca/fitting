'use client'

import React, { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useProfileStore } from '@/lib/profile-store'
import { useGamificationStore } from '@/lib/gamification-store'
import BadgeDisplay from '@/components/BadgeDisplay'
import { cn } from '@/lib/utils'

// Form data interface for React Hook Form
interface ProfileFormData {
  age: number
  fitnessLevel: 'beginner' | 'intermediate' | 'advanced'
  goals: ('muscle_gain' | 'weight_loss' | 'endurance' | 'strength' | 'flexibility' | 'general_fitness')[]
  equipment: ('bodyweight' | 'dumbbells' | 'barbell' | 'resistance_bands' | 'pull_up_bar' | 'yoga_mat' | 'cardio_machine')[]
  duration: number
  intensity: 'low' | 'moderate' | 'high'
  workoutTime: 'morning' | 'afternoon' | 'evening'
  restDays: string[]
  injuries: string[]
}

// Goal options for the dropdown - These directly influence AI workout generation
const goalOptions = [
  { value: 'muscle_gain', label: 'Muscle Gain', description: 'Build lean muscle mass' },
  { value: 'weight_loss', label: 'Weight Loss', description: 'Burn fat and lose weight' },
  { value: 'endurance', label: 'Endurance', description: 'Improve cardiovascular fitness' },
  { value: 'strength', label: 'Strength', description: 'Increase overall strength' },
  { value: 'flexibility', label: 'Flexibility', description: 'Improve mobility and flexibility' },
  { value: 'general_fitness', label: 'General Fitness', description: 'Overall health and wellness' }
] as const

// Equipment options - AI uses these to filter feasible exercises
const equipmentOptions = [
  { value: 'bodyweight', label: 'Bodyweight', description: 'No equipment needed' },
  { value: 'dumbbells', label: 'Dumbbells', description: 'Adjustable or fixed weights' },
  { value: 'barbell', label: 'Barbell', description: 'Olympic or standard barbell' },
  { value: 'resistance_bands', label: 'Resistance Bands', description: 'Elastic resistance bands' },
  { value: 'pull_up_bar', label: 'Pull-up Bar', description: 'For hanging exercises' },
  { value: 'yoga_mat', label: 'Yoga Mat', description: 'For floor exercises' },
  { value: 'cardio_machine', label: 'Cardio Machine', description: 'Treadmill, bike, etc.' }
] as const

// Days of the week for rest day selection
const dayOptions = [
  { value: 'monday', label: 'Monday' },
  { value: 'tuesday', label: 'Tuesday' },
  { value: 'wednesday', label: 'Wednesday' },
  { value: 'thursday', label: 'Thursday' },
  { value: 'friday', label: 'Friday' },
  { value: 'saturday', label: 'Saturday' },
  { value: 'sunday', label: 'Sunday' }
]

export default function ProfilePage() {
  const { status } = useSession()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  // Zustand store for profile management
  const { 
    profile, 
    isLoading, 
    error, 
    streakData,
    fetchProfile, 
    fetchStreakData,
    updateProfile,
    clearError 
  } = useProfileStore()

  // Zustand store for gamification
  const {
    badges,
    updateNotificationSettings,
    requestNotificationPermission,
    scheduleDailyReminder,
    notifications
  } = useGamificationStore()

  // React Hook Form setup with validation
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isDirty }
  } = useForm<ProfileFormData>({
    defaultValues: {
      age: 25,
      fitnessLevel: 'beginner',
      goals: ['general_fitness'],
      equipment: ['bodyweight'],
      duration: 30,
      intensity: 'moderate',
      workoutTime: 'evening',
      restDays: ['sunday'],
      injuries: []
    }
  })

  // Authentication check
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    }
  }, [status, router])

  // Load profile data on component mount
  useEffect(() => {
    if (status === 'authenticated') {
      fetchProfile()
      fetchStreakData()
    }
  }, [status, fetchProfile, fetchStreakData])

  // Populate form when profile data loads
  useEffect(() => {
    if (profile) {
      setValue('age', profile.age || 25)
      setValue('fitnessLevel', profile.fitnessLevel || 'beginner')
      setValue('goals', profile.goals || ['general_fitness'])
      setValue('equipment', profile.equipment || ['bodyweight'])
      setValue('duration', profile.preferences?.duration || 30)
      setValue('intensity', profile.preferences?.intensity || 'moderate')
      setValue('workoutTime', profile.preferences?.workoutTime || 'evening')
      setValue('restDays', profile.preferences?.restDays || ['sunday'])
      setValue('injuries', profile.preferences?.injuries || [])
    }
  }, [profile, setValue])

  // Form submission handler
  const onSubmit = async (data: ProfileFormData) => {
    setIsSubmitting(true)
    clearError()
    setSuccessMessage('')

    try {
      // Transform form data for API
      const updateData = {
        age: data.age,
        fitnessLevel: data.fitnessLevel,
        goals: data.goals,
        equipment: data.equipment,
        preferences: {
          duration: data.duration,
          intensity: data.intensity,
          workoutTime: data.workoutTime,
          restDays: data.restDays,
          injuries: data.injuries
        }
      }

      const success = await updateProfile(updateData)
      
      if (success) {
        setSuccessMessage('Profile updated successfully! AI will personalize your next workout.')
      }
    } catch (err) {
      console.error('Profile update failed:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Loading state
  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50/50 to-blue-50/50 dark:from-green-950/20 dark:to-blue-950/20 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-green-500 to-blue-600 bg-clip-text text-transparent">
            Your Fitness Profile
          </h1>
          <p className="text-muted-foreground mt-2">
            Customize your profile to get AI-powered workouts tailored to your goals and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Form - Takes up 2 columns */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {/* Basic Information Card */}
              <div className="bg-card/50 backdrop-blur border rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <span className="text-2xl mr-2">👤</span>
                  Basic Information
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Age Input */}
                  <div className="space-y-2">
                    <label htmlFor="age" className="text-sm font-medium">
                      Age
                    </label>
                    <input
                      {...register('age', { 
                        required: 'Age is required',
                        min: { value: 13, message: 'Must be at least 13' },
                        max: { value: 120, message: 'Must be under 120' },
                        valueAsNumber: true
                      })}
                      type="number"
                      className={cn(
                        "w-full px-4 py-3 rounded-lg border bg-background/50 transition-all duration-200",
                        "focus:ring-2 focus:ring-green-500 focus:border-green-500",
                        "hover:border-green-300 dark:hover:border-green-700",
                        errors.age && "border-red-500 focus:ring-red-500 focus:border-red-500"
                      )}
                      placeholder="Enter your age"
                    />
                    {errors.age && (
                      <p className="text-sm text-red-500">{errors.age.message}</p>
                    )}
                  </div>

                  {/* Fitness Level Radio Buttons */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Fitness Level</label>
                    <Controller
                      name="fitnessLevel"
                      control={control}
                      rules={{ required: 'Fitness level is required' }}
                      render={({ field }) => (
                        <div className="space-y-2">
                          {(['beginner', 'intermediate', 'advanced'] as const).map((level) => (
                            <label key={level} className="flex items-center space-x-3 cursor-pointer group">
                              <input
                                type="radio"
                                value={level}
                                checked={field.value === level}
                                onChange={(e) => field.onChange(e.target.value)}
                                className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500"
                              />
                              <span className="text-sm capitalize group-hover:text-green-600 transition-colors">
                                {level}
                              </span>
                            </label>
                          ))}
                        </div>
                      )}
                    />
                    {errors.fitnessLevel && (
                      <p className="text-sm text-red-500">{errors.fitnessLevel.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Goals Card */}
              <div className="bg-card/50 backdrop-blur border rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <span className="text-2xl mr-2">🎯</span>
                  Fitness Goals
                  <span className="text-sm text-muted-foreground ml-2">(Select multiple)</span>
                </h2>
                
                <Controller
                  name="goals"
                  control={control}
                  rules={{ 
                    required: 'At least one goal is required',
                    validate: (value) => value.length > 0 || 'At least one goal is required'
                  }}
                  render={({ field }) => (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {goalOptions.map((goal) => (
                        <label key={goal.value} className="flex items-start space-x-3 cursor-pointer group">
                          <input
                            type="checkbox"
                            value={goal.value}
                            checked={field.value.includes(goal.value)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                field.onChange([...field.value, goal.value])
                              } else {
                                field.onChange(field.value.filter(v => v !== goal.value))
                              }
                            }}
                            className="mt-1 w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                          />
                          <div className="flex-1">
                            <span className="text-sm font-medium group-hover:text-green-600 transition-colors">
                              {goal.label}
                            </span>
                            <p className="text-xs text-muted-foreground">
                              {goal.description}
                            </p>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                />
                {errors.goals && (
                  <p className="text-sm text-red-500 mt-2">{errors.goals.message}</p>
                )}
              </div>

              {/* Equipment Card */}
              <div className="bg-card/50 backdrop-blur border rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <span className="text-2xl mr-2">🏋️</span>
                  Available Equipment
                </h2>
                
                <Controller
                  name="equipment"
                  control={control}
                  rules={{ 
                    required: 'At least one equipment option is required',
                    validate: (value) => value.length > 0 || 'At least one equipment option is required'
                  }}
                  render={({ field }) => (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {equipmentOptions.map((equipment) => (
                        <label key={equipment.value} className="flex items-start space-x-3 cursor-pointer group">
                          <input
                            type="checkbox"
                            value={equipment.value}
                            checked={field.value.includes(equipment.value)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                field.onChange([...field.value, equipment.value])
                              } else {
                                field.onChange(field.value.filter(v => v !== equipment.value))
                              }
                            }}
                            className="mt-1 w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                          />
                          <div className="flex-1">
                            <span className="text-sm font-medium group-hover:text-green-600 transition-colors">
                              {equipment.label}
                            </span>
                            <p className="text-xs text-muted-foreground">
                              {equipment.description}
                            </p>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                />
                {errors.equipment && (
                  <p className="text-sm text-red-500 mt-2">{errors.equipment.message}</p>
                )}
              </div>

              {/* Preferences Card */}
              <div className="bg-card/50 backdrop-blur border rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <span className="text-2xl mr-2">⚙️</span>
                  Workout Preferences
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Duration */}
                  <div className="space-y-2">
                    <label htmlFor="duration" className="text-sm font-medium">
                      Workout Duration (minutes)
                    </label>
                    <input
                      {...register('duration', { 
                        required: 'Duration is required',
                        min: { value: 5, message: 'Minimum 5 minutes' },
                        max: { value: 180, message: 'Maximum 180 minutes' },
                        valueAsNumber: true
                      })}
                      type="number"
                      className={cn(
                        "w-full px-4 py-3 rounded-lg border bg-background/50 transition-all duration-200",
                        "focus:ring-2 focus:ring-green-500 focus:border-green-500",
                        "hover:border-green-300 dark:hover:border-green-700",
                        errors.duration && "border-red-500 focus:ring-red-500 focus:border-red-500"
                      )}
                      placeholder="30"
                    />
                    {errors.duration && (
                      <p className="text-sm text-red-500">{errors.duration.message}</p>
                    )}
                  </div>

                  {/* Intensity */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Intensity Level</label>
                    <Controller
                      name="intensity"
                      control={control}
                      render={({ field }) => (
                        <select
                          {...field}
                          className="w-full px-4 py-3 rounded-lg border bg-background/50 transition-all duration-200 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        >
                          <option value="low">Low - Easy pace</option>
                          <option value="moderate">Moderate - Challenging but sustainable</option>
                          <option value="high">High - Push your limits</option>
                        </select>
                      )}
                    />
                  </div>

                  {/* Workout Time */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Preferred Workout Time</label>
                    <Controller
                      name="workoutTime"
                      control={control}
                      render={({ field }) => (
                        <select
                          {...field}
                          className="w-full px-4 py-3 rounded-lg border bg-background/50 transition-all duration-200 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        >
                          <option value="morning">Morning</option>
                          <option value="afternoon">Afternoon</option>
                          <option value="evening">Evening</option>
                        </select>
                      )}
                    />
                  </div>

                  {/* Rest Days */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Rest Days</label>
                    <Controller
                      name="restDays"
                      control={control}
                      render={({ field }) => (
                        <div className="space-y-2">
                          {dayOptions.map((day) => (
                            <label key={day.value} className="flex items-center space-x-2 cursor-pointer">
                              <input
                                type="checkbox"
                                value={day.value}
                                checked={field.value.includes(day.value)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    field.onChange([...field.value, day.value])
                                  } else {
                                    field.onChange(field.value.filter(v => v !== day.value))
                                  }
                                }}
                                className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                              />
                              <span className="text-sm">{day.label}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex flex-col space-y-4">
                {error && (
                  <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                  </div>
                )}
                
                {successMessage && (
                  <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <p className="text-sm text-green-600 dark:text-green-400">{successMessage}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting || !isDirty}
                  className={cn(
                    "w-full px-6 py-4 rounded-lg font-semibold text-white transition-all duration-200",
                    "bg-gradient-to-r from-green-500 to-blue-600",
                    "hover:from-green-600 hover:to-blue-700 transform hover:scale-[1.02]",
                    "disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none",
                    "focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                  )}
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Updating Profile...
                    </span>
                  ) : (
                    'Update Profile'
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Progress Section - Takes up 1 column */}
          <div className="space-y-6">
            {/* Profile Summary */}
            <div className="bg-card/50 backdrop-blur border rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <span className="text-2xl mr-2">📊</span>
                Progress Overview
              </h2>
              
              {profile && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Current Streak</span>
                    <span className="text-2xl font-bold text-green-600">{profile.streak} days</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Best Streak</span>
                    <span className="text-lg font-semibold">{profile.longestStreak} days</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total Workouts</span>
                    <span className="text-lg font-semibold">{profile.totalWorkouts}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Level</span>
                    <span className="text-lg font-semibold flex items-center">
                      Level {profile.level}
                      <span className="ml-2 text-sm text-muted-foreground">({profile.xp} XP)</span>
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Streak Chart */}
            <div className="bg-card/50 backdrop-blur border rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Streak Progress</h3>
              
              {streakData.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={streakData}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip 
                        labelFormatter={(value) => new Date(value).toLocaleDateString()}
                        formatter={(value, name) => [value, name === 'streak' ? 'Streak Days' : 'Workouts']}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="streak" 
                        stroke="#10b981" 
                        strokeWidth={3}
                        dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, fill: '#059669' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <p>Complete your first workout to see progress!</p>
                </div>
              )}
            </div>

            {/* AI Personalization Info */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 border rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <span className="text-2xl mr-2">🤖</span>
                AI Personalization
              </h3>
              
              <div className="space-y-3 text-sm">
                <p className="text-muted-foreground">
                  Your profile data helps our AI create personalized workouts:
                </p>
                
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">•</span>
                    <span>Goals determine exercise focus and progression</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    <span>Equipment availability filters exercise options</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">•</span>
                    <span>Preferences adjust workout structure and timing</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    <span>Progress data influences difficulty progression</span>
                  </li>
                </ul>
                
                <p className="text-xs text-muted-foreground mt-4">
                  Profile changes trigger AI re-personalization for your next workout.
                </p>
              </div>
            </div>

            {/* Badges Section */}
            <div className="bg-card/50 backdrop-blur border rounded-xl p-6">
              <h3 className="text-xl font-semibold mb-6">Badge Collection 🏆</h3>
              <BadgeDisplay badges={badges} size="large" />
              
              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Badges represent your fitness journey milestones and achievements
                </p>
              </div>
            </div>

            {/* Notification Settings */}
            <div className="bg-card/50 backdrop-blur border rounded-xl p-6">
              <h3 className="text-xl font-semibold mb-6">Daily Reminders 🔔</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Workout Reminders</div>
                    <div className="text-sm text-muted-foreground">
                      Get daily notifications to maintain your streak
                    </div>
                  </div>
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
                      onChange={(e) => updateNotificationSettings({ time: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-800"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      We'll send you a friendly reminder at this time each day
                    </p>
                  </div>
                )}
                
                {notifications.permission !== 'granted' && (
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <div className="flex items-start">
                      <span className="text-blue-500 mr-2">🔔</span>
                      <div>
                        <div className="text-sm font-medium text-blue-800 dark:text-blue-200">
                          Enable notifications for the best experience
                        </div>
                        <div className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                          Stay consistent with gentle daily reminders
                        </div>
                        <button
                          onClick={async () => {
                            const granted = await requestNotificationPermission()
                            if (granted) {
                              updateNotificationSettings({ enabled: true })
                              scheduleDailyReminder()
                            }
                          }}
                          className="mt-2 px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                        >
                          Enable Notifications
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 