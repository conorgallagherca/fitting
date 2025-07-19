export interface Exercise {
  id: string
  name: string
  category: 'strength' | 'cardio' | 'flexibility' | 'balance'
  muscleGroups: string[]
  equipment: string[]
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  instructions: string
  tips: string[]
  videoUrl?: string
  imageUrl?: string
  caloriesPerMinute?: number
  sets?: number
  reps?: number
  duration?: number // in seconds
  restTime?: number // in seconds
}

export const exercises: Exercise[] = [
  // BODYWEIGHT EXERCISES
  {
    id: 'pushup',
    name: 'Push-ups',
    category: 'strength',
    muscleGroups: ['chest', 'triceps', 'shoulders'],
    equipment: ['bodyweight'],
    difficulty: 'intermediate',
    instructions: 'Start in a plank position with hands slightly wider than shoulders. Lower your body until chest nearly touches the ground, then push back up.',
    tips: ['Keep your core tight', 'Maintain a straight line from head to heels', 'Breathe steadily'],
    caloriesPerMinute: 8,
    sets: 3,
    reps: 10,
    restTime: 60
  },
  {
    id: 'pullup',
    name: 'Pull-ups',
    category: 'strength',
    muscleGroups: ['back', 'biceps'],
    equipment: ['pull-up bar'],
    difficulty: 'advanced',
    instructions: 'Hang from a pull-up bar with hands shoulder-width apart. Pull your body up until your chin is over the bar, then lower back down.',
    tips: ['Engage your back muscles', 'Avoid swinging', 'Full range of motion'],
    caloriesPerMinute: 10,
    sets: 3,
    reps: 8,
    restTime: 90
  },
  {
    id: 'squat',
    name: 'Bodyweight Squats',
    category: 'strength',
    muscleGroups: ['quadriceps', 'glutes', 'hamstrings'],
    equipment: ['bodyweight'],
    difficulty: 'beginner',
    instructions: 'Stand with feet shoulder-width apart. Lower your body as if sitting back into a chair, keeping knees behind toes.',
    tips: ['Keep chest up', 'Push through heels', 'Go parallel to ground'],
    caloriesPerMinute: 6,
    sets: 3,
    reps: 15,
    restTime: 60
  },
  {
    id: 'lunges',
    name: 'Walking Lunges',
    category: 'strength',
    muscleGroups: ['quadriceps', 'glutes', 'hamstrings'],
    equipment: ['bodyweight'],
    difficulty: 'intermediate',
    instructions: 'Step forward with one leg and lower your body until both knees are bent at 90 degrees. Push back up and repeat with other leg.',
    tips: ['Keep torso upright', 'Don\'t let front knee go past toes', 'Alternate legs'],
    caloriesPerMinute: 7,
    sets: 3,
    reps: 20,
    restTime: 60
  },
  {
    id: 'plank',
    name: 'Plank',
    category: 'strength',
    muscleGroups: ['core', 'shoulders'],
    equipment: ['bodyweight'],
    difficulty: 'beginner',
    instructions: 'Hold a push-up position with arms straight, body in a straight line from head to heels.',
    tips: ['Engage your core', 'Don\'t let hips sag', 'Breathe steadily'],
    caloriesPerMinute: 4,
    duration: 60,
    restTime: 30
  },
  {
    id: 'burpees',
    name: 'Burpees',
    category: 'cardio',
    muscleGroups: ['full body'],
    equipment: ['bodyweight'],
    difficulty: 'advanced',
    instructions: 'Start standing, drop into a squat, kick feet back into plank, do a push-up, jump feet back to squat, then jump up.',
    tips: ['Maintain form throughout', 'Land softly', 'Keep moving'],
    caloriesPerMinute: 12,
    sets: 3,
    reps: 10,
    restTime: 90
  },
  {
    id: 'mountain-climbers',
    name: 'Mountain Climbers',
    category: 'cardio',
    muscleGroups: ['core', 'shoulders'],
    equipment: ['bodyweight'],
    difficulty: 'intermediate',
    instructions: 'Start in plank position, rapidly alternate bringing knees toward chest.',
    tips: ['Keep hips level', 'Maintain plank position', 'Move quickly'],
    caloriesPerMinute: 10,
    duration: 45,
    restTime: 30
  },
  {
    id: 'jumping-jacks',
    name: 'Jumping Jacks',
    category: 'cardio',
    muscleGroups: ['full body'],
    equipment: ['bodyweight'],
    difficulty: 'beginner',
    instructions: 'Jump while raising arms overhead and spreading legs apart, then return to starting position.',
    tips: ['Land softly', 'Keep rhythm steady', 'Engage core'],
    caloriesPerMinute: 8,
    duration: 60,
    restTime: 30
  },
  {
    id: 'wall-sit',
    name: 'Wall Sit',
    category: 'strength',
    muscleGroups: ['quadriceps', 'glutes'],
    equipment: ['bodyweight', 'wall'],
    difficulty: 'beginner',
    instructions: 'Lean against a wall and slide down until thighs are parallel to ground, hold position.',
    tips: ['Keep back against wall', 'Thighs parallel to ground', 'Hold as long as possible'],
    caloriesPerMinute: 5,
    duration: 45,
    restTime: 60
  },
  {
    id: 'dips',
    name: 'Tricep Dips',
    category: 'strength',
    muscleGroups: ['triceps', 'chest', 'shoulders'],
    equipment: ['bodyweight', 'chair'],
    difficulty: 'intermediate',
    instructions: 'Sit on edge of chair, place hands beside hips, slide off and lower body by bending elbows.',
    tips: ['Keep elbows close to body', 'Lower until upper arms are parallel', 'Push back up'],
    caloriesPerMinute: 6,
    sets: 3,
    reps: 12,
    restTime: 60
  },

  // DUMBBELL EXERCISES
  {
    id: 'dumbbell-press',
    name: 'Dumbbell Chest Press',
    category: 'strength',
    muscleGroups: ['chest', 'triceps', 'shoulders'],
    equipment: ['dumbbells', 'bench'],
    difficulty: 'intermediate',
    instructions: 'Lie on bench, hold dumbbells at chest level, press up until arms are straight, then lower.',
    tips: ['Keep feet flat on ground', 'Control the movement', 'Don\'t lock elbows'],
    caloriesPerMinute: 7,
    sets: 3,
    reps: 12,
    restTime: 90
  },
  {
    id: 'dumbbell-rows',
    name: 'Dumbbell Rows',
    category: 'strength',
    muscleGroups: ['back', 'biceps'],
    equipment: ['dumbbells'],
    difficulty: 'intermediate',
    instructions: 'Bend forward at hips, hold dumbbell in one hand, pull elbow back toward hip.',
    tips: ['Keep back straight', 'Pull with your back', 'Don\'t rotate torso'],
    caloriesPerMinute: 6,
    sets: 3,
    reps: 12,
    restTime: 60
  },
  {
    id: 'dumbbell-squats',
    name: 'Dumbbell Squats',
    category: 'strength',
    muscleGroups: ['quadriceps', 'glutes', 'hamstrings'],
    equipment: ['dumbbells'],
    difficulty: 'intermediate',
    instructions: 'Hold dumbbells at sides, perform squat as with bodyweight squats.',
    tips: ['Keep chest up', 'Push through heels', 'Maintain form'],
    caloriesPerMinute: 8,
    sets: 3,
    reps: 12,
    restTime: 90
  },
  {
    id: 'dumbbell-deadlift',
    name: 'Dumbbell Deadlift',
    category: 'strength',
    muscleGroups: ['hamstrings', 'glutes', 'back'],
    equipment: ['dumbbells'],
    difficulty: 'intermediate',
    instructions: 'Hold dumbbells in front of thighs, hinge at hips to lower weights, then stand back up.',
    tips: ['Keep back straight', 'Push hips back', 'Don\'t round back'],
    caloriesPerMinute: 7,
    sets: 3,
    reps: 10,
    restTime: 90
  },
  {
    id: 'dumbbell-shoulder-press',
    name: 'Dumbbell Shoulder Press',
    category: 'strength',
    muscleGroups: ['shoulders', 'triceps'],
    equipment: ['dumbbells'],
    difficulty: 'intermediate',
    instructions: 'Hold dumbbells at shoulder level, press up overhead until arms are straight.',
    tips: ['Keep core tight', 'Don\'t arch back', 'Control the movement'],
    caloriesPerMinute: 6,
    sets: 3,
    reps: 10,
    restTime: 90
  },

  // BARBELL EXERCISES
  {
    id: 'barbell-squat',
    name: 'Barbell Squat',
    category: 'strength',
    muscleGroups: ['quadriceps', 'glutes', 'hamstrings'],
    equipment: ['barbell', 'rack'],
    difficulty: 'advanced',
    instructions: 'Place barbell on upper back, stand with feet shoulder-width, squat down and back up.',
    tips: ['Keep chest up', 'Push through heels', 'Maintain bar path'],
    caloriesPerMinute: 10,
    sets: 4,
    reps: 8,
    restTime: 120
  },
  {
    id: 'barbell-deadlift',
    name: 'Barbell Deadlift',
    category: 'strength',
    muscleGroups: ['hamstrings', 'glutes', 'back'],
    equipment: ['barbell'],
    difficulty: 'advanced',
    instructions: 'Stand over barbell, grip with hands shoulder-width, lift by extending hips and knees.',
    tips: ['Keep back straight', 'Push through heels', 'Keep bar close to body'],
    caloriesPerMinute: 9,
    sets: 4,
    reps: 6,
    restTime: 120
  },
  {
    id: 'barbell-bench-press',
    name: 'Barbell Bench Press',
    category: 'strength',
    muscleGroups: ['chest', 'triceps', 'shoulders'],
    equipment: ['barbell', 'bench'],
    difficulty: 'advanced',
    instructions: 'Lie on bench, lower barbell to chest, press back up to starting position.',
    tips: ['Keep feet flat', 'Control the descent', 'Don\'t bounce off chest'],
    caloriesPerMinute: 8,
    sets: 4,
    reps: 8,
    restTime: 120
  },

  // CARDIO EXERCISES
  {
    id: 'running',
    name: 'Running',
    category: 'cardio',
    muscleGroups: ['legs', 'core'],
    equipment: ['treadmill', 'outdoor'],
    difficulty: 'beginner',
    instructions: 'Run at a comfortable pace, maintaining good posture and breathing rhythm.',
    tips: ['Start slow', 'Maintain good form', 'Stay hydrated'],
    caloriesPerMinute: 12,
    duration: 1800, // 30 minutes
    restTime: 300
  },
  {
    id: 'cycling',
    name: 'Cycling',
    category: 'cardio',
    muscleGroups: ['legs'],
    equipment: ['bike', 'stationary bike'],
    difficulty: 'beginner',
    instructions: 'Pedal at a steady pace, maintaining good posture and breathing.',
    tips: ['Adjust seat height', 'Keep cadence steady', 'Stay hydrated'],
    caloriesPerMinute: 10,
    duration: 1800,
    restTime: 300
  },
  {
    id: 'rowing',
    name: 'Rowing',
    category: 'cardio',
    muscleGroups: ['full body'],
    equipment: ['rowing machine'],
    difficulty: 'intermediate',
    instructions: 'Start with legs extended, pull handle toward chest while extending legs.',
    tips: ['Use legs first', 'Keep back straight', 'Control the movement'],
    caloriesPerMinute: 11,
    duration: 1200,
    restTime: 300
  },

  // FLEXIBILITY EXERCISES
  {
    id: 'hamstring-stretch',
    name: 'Hamstring Stretch',
    category: 'flexibility',
    muscleGroups: ['hamstrings'],
    equipment: ['bodyweight'],
    difficulty: 'beginner',
    instructions: 'Sit on ground, extend one leg, reach toward toes while keeping back straight.',
    tips: ['Don\'t bounce', 'Breathe deeply', 'Hold for 30 seconds'],
    duration: 30,
    restTime: 15
  },
  {
    id: 'hip-flexor-stretch',
    name: 'Hip Flexor Stretch',
    category: 'flexibility',
    muscleGroups: ['hip flexors'],
    equipment: ['bodyweight'],
    difficulty: 'beginner',
    instructions: 'Kneel on one knee, push hips forward while keeping back straight.',
    tips: ['Keep back straight', 'Don\'t overstretch', 'Hold position'],
    duration: 30,
    restTime: 15
  },
  {
    id: 'shoulder-stretch',
    name: 'Shoulder Stretch',
    category: 'flexibility',
    muscleGroups: ['shoulders'],
    equipment: ['bodyweight'],
    difficulty: 'beginner',
    instructions: 'Bring one arm across chest, hold with other arm, feel stretch in shoulder.',
    tips: ['Don\'t force the stretch', 'Hold gently', 'Breathe steadily'],
    duration: 30,
    restTime: 15
  }
]

// Exercise categories for filtering
export const exerciseCategories = {
  categories: ['strength', 'cardio', 'flexibility', 'balance'],
  muscleGroups: ['chest', 'back', 'shoulders', 'biceps', 'triceps', 'quadriceps', 'hamstrings', 'glutes', 'core', 'calves'],
  equipment: ['bodyweight', 'dumbbells', 'barbell', 'bench', 'pull-up bar', 'treadmill', 'bike', 'rowing machine'],
  difficulties: ['beginner', 'intermediate', 'advanced']
}

// Helper functions
export const filterExercises = (filters: {
  category?: string
  muscleGroups?: string[]
  equipment?: string[]
  difficulty?: string
}) => {
  return exercises.filter(exercise => {
    if (filters.category && exercise.category !== filters.category) return false
    if (filters.muscleGroups && !filters.muscleGroups.some(mg => exercise.muscleGroups.includes(mg))) return false
    if (filters.equipment && !filters.equipment.some(eq => exercise.equipment.includes(eq))) return false
    if (filters.difficulty && exercise.difficulty !== filters.difficulty) return false
    return true
  })
}

export const getExerciseById = (id: string) => {
  return exercises.find(exercise => exercise.id === id)
}

export const getRandomExercises = (count: number, filters?: any) => {
  const filtered = filters ? filterExercises(filters) : exercises
  const shuffled = [...filtered].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
} 