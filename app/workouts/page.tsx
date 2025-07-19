'use client'

import { useState, useEffect } from 'react'
import { exercises, exerciseCategories, filterExercises, Exercise } from '@/lib/exercises'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

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

  const toggleMuscleGroup = (muscleGroup: string) => {
    setSelectedMuscleGroups(prev =>
      prev.includes(muscleGroup)
        ? prev.filter(mg => mg !== muscleGroup)
        : [...prev, muscleGroup]
    )
  }

  const toggleEquipment = (equipment: string) => {
    setSelectedEquipment(prev =>
      prev.includes(equipment)
        ? prev.filter(eq => eq !== equipment)
        : [...prev, equipment]
    )
  }

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedCategory('')
    setSelectedMuscleGroups([])
    setSelectedEquipment([])
    setSelectedDifficulty('')
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
      case 'advanced': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'strength': return '💪'
      case 'cardio': return '❤️'
      case 'flexibility': return '🧘'
      case 'balance': return '⚖️'
      default: return '🏋️'
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">Exercise Library</h1>
          <p className="text-muted-foreground text-lg">
            Discover {exercises.length}+ exercises to build your perfect workout
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search exercises..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 pl-12 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
            />
            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground">
              🔍
            </span>
          </div>

          {/* Filter Toggle */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 border border-border rounded-lg bg-background hover:bg-accent transition-colors"
            >
              {showFilters ? 'Hide' : 'Show'} Filters
            </button>
            {(searchTerm || selectedCategory || selectedMuscleGroups.length > 0 || selectedEquipment.length > 0 || selectedDifficulty) && (
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-primary hover:underline"
              >
                Clear All Filters
              </button>
            )}
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="bg-card border rounded-lg p-6 space-y-6">
              {/* Category Filter */}
              <div>
                <h3 className="font-semibold mb-3">Category</h3>
                <div className="flex flex-wrap gap-2">
                  {exerciseCategories.categories.map(category => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(selectedCategory === category ? '' : category)}
                      className={`px-3 py-1 rounded-full text-sm transition-colors ${
                        selectedCategory === category
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-accent text-accent-foreground hover:bg-accent/80'
                      }`}
                    >
                      {getCategoryIcon(category)} {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Muscle Groups Filter */}
              <div>
                <h3 className="font-semibold mb-3">Muscle Groups</h3>
                <div className="flex flex-wrap gap-2">
                  {exerciseCategories.muscleGroups.map(muscleGroup => (
                    <button
                      key={muscleGroup}
                      onClick={() => toggleMuscleGroup(muscleGroup)}
                      className={`px-3 py-1 rounded-full text-sm transition-colors ${
                        selectedMuscleGroups.includes(muscleGroup)
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-accent text-accent-foreground hover:bg-accent/80'
                      }`}
                    >
                      {muscleGroup}
                    </button>
                  ))}
                </div>
              </div>

              {/* Equipment Filter */}
              <div>
                <h3 className="font-semibold mb-3">Equipment</h3>
                <div className="flex flex-wrap gap-2">
                  {exerciseCategories.equipment.map(equipment => (
                    <button
                      key={equipment}
                      onClick={() => toggleEquipment(equipment)}
                      className={`px-3 py-1 rounded-full text-sm transition-colors ${
                        selectedEquipment.includes(equipment)
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-accent text-accent-foreground hover:bg-accent/80'
                      }`}
                    >
                      {equipment}
                    </button>
                  ))}
                </div>
              </div>

              {/* Difficulty Filter */}
              <div>
                <h3 className="font-semibold mb-3">Difficulty</h3>
                <div className="flex flex-wrap gap-2">
                  {exerciseCategories.difficulties.map(difficulty => (
                    <button
                      key={difficulty}
                      onClick={() => setSelectedDifficulty(selectedDifficulty === difficulty ? '' : difficulty)}
                      className={`px-3 py-1 rounded-full text-sm transition-colors ${
                        selectedDifficulty === difficulty
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-accent text-accent-foreground hover:bg-accent/80'
                      }`}
                    >
                      {difficulty}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            Showing {filteredExercises.length} of {exercises.length} exercises
          </p>
        </div>

        {/* Exercise Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExercises.map((exercise) => (
            <div
              key={exercise.id}
              className="bg-card border rounded-lg p-6 hover:shadow-lg transition-all duration-200 hover:scale-105"
            >
              {/* Exercise Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {exercise.name}
                  </h3>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{getCategoryIcon(exercise.category)}</span>
                    <span className="text-sm text-muted-foreground capitalize">
                      {exercise.category}
                    </span>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(exercise.difficulty)}`}>
                  {exercise.difficulty}
                </span>
              </div>

              {/* Muscle Groups */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Muscle Groups</h4>
                <div className="flex flex-wrap gap-1">
                  {exercise.muscleGroups.map((muscleGroup) => (
                    <span
                      key={muscleGroup}
                      className="px-2 py-1 bg-accent text-accent-foreground rounded text-xs"
                    >
                      {muscleGroup}
                    </span>
                  ))}
                </div>
              </div>

              {/* Equipment */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Equipment</h4>
                <div className="flex flex-wrap gap-1">
                  {exercise.equipment.map((equipment) => (
                    <span
                      key={equipment}
                      className="px-2 py-1 bg-secondary text-secondary-foreground rounded text-xs"
                    >
                      {equipment}
                    </span>
                  ))}
                </div>
              </div>

              {/* Exercise Details */}
              <div className="mb-4">
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {exercise.instructions}
                </p>
              </div>

              {/* Exercise Stats */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                {exercise.sets && exercise.reps && (
                  <div>
                    <span className="text-muted-foreground">Sets/Reps:</span>
                    <div className="font-medium">{exercise.sets} × {exercise.reps}</div>
                  </div>
                )}
                {exercise.duration && (
                  <div>
                    <span className="text-muted-foreground">Duration:</span>
                    <div className="font-medium">{Math.round(exercise.duration / 60)} min</div>
                  </div>
                )}
                {exercise.caloriesPerMinute && (
                  <div>
                    <span className="text-muted-foreground">Calories/min:</span>
                    <div className="font-medium">{exercise.caloriesPerMinute}</div>
                  </div>
                )}
                {exercise.restTime && (
                  <div>
                    <span className="text-muted-foreground">Rest:</span>
                    <div className="font-medium">{exercise.restTime}s</div>
                  </div>
                )}
              </div>

              {/* Tips */}
              {exercise.tips.length > 0 && (
                <div className="mt-4 pt-4 border-t border-border">
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Tips</h4>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    {exercise.tips.slice(0, 2).map((tip, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-primary">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Action Button */}
              <div className="mt-4 pt-4 border-t border-border">
                <button className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                  Add to Workout
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredExercises.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏋️‍♂️</div>
            <h3 className="text-xl font-semibold text-foreground mb-2">No exercises found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search terms or filters
            </p>
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  )
} 