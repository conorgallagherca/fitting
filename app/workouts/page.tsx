'use client'

import { useState, useEffect } from 'react'
import { exercises, exerciseCategories, filterExercises, Exercise } from '@/lib/exercises'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useProgressStore } from '@/lib/progress-store'
import ExerciseProgressChart from '@/components/ExerciseProgressChart'
import { Search, Filter, TrendingUp, Calendar, Target, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function WorkoutsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>(exercises)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedMuscleGroups, setSelectedMuscleGroups] = useState<string[]>([])
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([])
  const [selectedDifficulty, setSelectedDifficulty] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null)
  const [showProgressModal, setShowProgressModal] = useState(false)

  const { 
    exerciseProgress, 
    stats, 
    getExerciseProgress, 
    fetchExerciseHistory,
    isLoading: progressLoading 
  } = useProgressStore()

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    }
  }, [status, router])

  // Filter exercises based on search and filters
  useEffect(() => {
    let filtered = exercises

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(exercise =>
        exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exercise.muscleGroups.some(mg => mg.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // Apply other filters
    const filters: any = {}
    if (selectedCategory) filters.category = selectedCategory
    if (selectedMuscleGroups.length > 0) filters.muscleGroups = selectedMuscleGroups
    if (selectedEquipment.length > 0) filters.equipment = selectedEquipment
    if (selectedDifficulty) filters.difficulty = selectedDifficulty

    filtered = filterExercises(filters)
    setFilteredExercises(filtered)
  }, [searchTerm, selectedCategory, selectedMuscleGroups, selectedEquipment, selectedDifficulty])

  const handleExerciseClick = async (exercise: Exercise) => {
    setSelectedExercise(exercise)
    setShowProgressModal(true)
    
    // Fetch exercise history if not already loaded
    const progress = getExerciseProgress(exercise.id)
    if (!progress) {
      await fetchExerciseHistory(exercise.id)
    }
  }

  const getExerciseProgressData = (exerciseId: string) => {
    return exerciseProgress[exerciseId] || null
  }

  const getProgressStats = () => {
    if (!stats) return null
    
    return {
      totalExercises: stats.totalExercises,
      exercisesWithProgress: stats.exercisesWithProgress,
      totalSessions: stats.totalSessions,
      averageVolume: stats.averageVolume,
      mostImprovedExercise: stats.mostImprovedExercise,
      consistencyScore: stats.consistencyScore
    }
  }

  const progressStats = getProgressStats()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Exercise Library
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Browse exercises and track your progress
          </p>
        </div>

        {/* Progress Overview */}
        {progressStats && (
          <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Exercises</p>
                  <p className="text-xl font-bold">{progressStats.totalExercises}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">With Progress</p>
                  <p className="text-xl font-bold">{progressStats.exercisesWithProgress}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Sessions</p>
                  <p className="text-xl font-bold">{progressStats.totalSessions}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                  <Zap className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Avg Volume</p>
                  <p className="text-xl font-bold">{progressStats.averageVolume} lbs</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search exercises..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <Filter className="w-5 h-5" />
              Filters
            </button>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Categories</option>
                    {exerciseCategories.categories.map((category) => (
                      <option key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Difficulty Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Difficulty
                  </label>
                  <select
                    value={selectedDifficulty}
                    onChange={(e) => setSelectedDifficulty(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Levels</option>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>

                {/* Equipment Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Equipment
                  </label>
                  <select
                    value={selectedEquipment[0] || ''}
                    onChange={(e) => setSelectedEquipment(e.target.value ? [e.target.value] : [])}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Equipment</option>
                    <option value="bodyweight">Bodyweight</option>
                    <option value="dumbbells">Dumbbells</option>
                    <option value="barbell">Barbell</option>
                    <option value="resistance_bands">Resistance Bands</option>
                    <option value="pull_up_bar">Pull-up Bar</option>
                    <option value="yoga_mat">Yoga Mat</option>
                    <option value="cardio_machine">Cardio Machine</option>
                  </select>
                </div>

                {/* Muscle Groups Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Muscle Group
                  </label>
                  <select
                    value={selectedMuscleGroups[0] || ''}
                    onChange={(e) => setSelectedMuscleGroups(e.target.value ? [e.target.value] : [])}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Muscle Groups</option>
                    <option value="chest">Chest</option>
                    <option value="back">Back</option>
                    <option value="shoulders">Shoulders</option>
                    <option value="biceps">Biceps</option>
                    <option value="triceps">Triceps</option>
                    <option value="quadriceps">Quadriceps</option>
                    <option value="hamstrings">Hamstrings</option>
                    <option value="glutes">Glutes</option>
                    <option value="core">Core</option>
                    <option value="calves">Calves</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Exercise Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExercises.map((exercise) => {
            const progress = getExerciseProgressData(exercise.id)
            const hasProgress = progress && progress.history.length > 0
            
            return (
              <div
                key={exercise.id}
                onClick={() => handleExerciseClick(exercise)}
                className={cn(
                  "bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-105",
                  hasProgress && "ring-2 ring-blue-500 ring-opacity-50"
                )}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                      {exercise.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                      {exercise.category}
                    </p>
                  </div>
                  {hasProgress && (
                    <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                      <TrendingUp className="w-4 h-4" />
                      <span className="text-xs font-medium">Progress</span>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  {/* Muscle Groups */}
                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                      Target Muscles
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {exercise.muscleGroups.slice(0, 3).map((muscle) => (
                        <span
                          key={muscle}
                          className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs text-gray-700 dark:text-gray-300 rounded-full"
                        >
                          {muscle}
                        </span>
                      ))}
                      {exercise.muscleGroups.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs text-gray-700 dark:text-gray-300 rounded-full">
                          +{exercise.muscleGroups.length - 3}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Equipment & Difficulty */}
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "px-2 py-1 text-xs font-medium rounded-full",
                        exercise.difficulty === 'beginner' && "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
                        exercise.difficulty === 'intermediate' && "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
                        exercise.difficulty === 'advanced' && "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                      )}>
                        {exercise.difficulty}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {exercise.equipment.join(', ')}
                    </div>
                  </div>

                  {/* Progress Preview */}
                  {hasProgress && (
                    <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Max Weight:</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {progress.personalBests.maxWeight} lbs
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Sessions:</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {progress.history.length}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Progress Modal */}
        {showProgressModal && selectedExercise && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {selectedExercise.name}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 capitalize">
                      {selectedExercise.category} • {selectedExercise.difficulty}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowProgressModal(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  >
                    ✕
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                {progressLoading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Exercise Info */}
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <h3 className="font-semibold mb-2">Exercise Details</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        {selectedExercise.instructions}
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Muscle Groups:</span>
                          <p className="font-medium">{selectedExercise.muscleGroups.join(', ')}</p>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Equipment:</span>
                          <p className="font-medium">{selectedExercise.equipment.join(', ')}</p>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Difficulty:</span>
                          <p className="font-medium capitalize">{selectedExercise.difficulty}</p>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Calories/min:</span>
                          <p className="font-medium">{selectedExercise.caloriesPerMinute || 'N/A'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Progress Chart */}
                    {getExerciseProgressData(selectedExercise.id) ? (
                      <ExerciseProgressChart 
                        progress={getExerciseProgressData(selectedExercise.id)!} 
                      />
                    ) : (
                      <div className="text-center py-12">
                        <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                          No Progress Data Yet
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          Complete a workout with this exercise to start tracking your progress.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 