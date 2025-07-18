/**
 * Seed Workouts for New Users
 * 
 * This module provides starter workouts for new users to ensure they have
 * engaging content from day one. These templates are designed to be:
 * 1. Accessible to all fitness levels
 * 2. Require minimal equipment
 * 3. Demonstrate the app's capabilities
 * 4. Encourage habit formation
 * 
 * The seed workouts are automatically created when a user completes onboarding.
 */

interface SeedExercise {
  exercise: string
  sets: number
  reps: number | string
  weight?: number | string
  restTime: number
  targetMuscles: string[]
  instructions?: string
  modifications?: string[]
  difficulty: number // 1-10 scale
}

interface SeedWorkout {
  name: string
  description: string
  workoutType: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimatedDuration: number
  equipment: string[]
  tags: string[]
  exercises: SeedExercise[]
  warmup: SeedExercise[]
  cooldown: SeedExercise[]
}

// Beginner-friendly starter workouts
export const SEED_WORKOUTS: Record<string, SeedWorkout> = {
  // Day 1: Gentle introduction to movement
  welcome_bodyweight: {
    name: "Welcome to FitLingo!",
    description: "A gentle introduction to get you moving. Perfect for your first workout!",
    workoutType: "strength",
    difficulty: "beginner",
    estimatedDuration: 20,
    equipment: ["bodyweight"],
    tags: ["beginner", "full_body", "bodyweight", "starter"],
    warmup: [
      {
        exercise: "Arm Circles",
        sets: 1,
        reps: "10 each direction",
        restTime: 0,
        targetMuscles: ["shoulders"],
        instructions: "Slowly circle your arms forward and backward",
        difficulty: 1
      },
      {
        exercise: "Leg Swings",
        sets: 1,
        reps: "10 each leg",
        restTime: 0,
        targetMuscles: ["hips", "legs"],
        instructions: "Hold onto something for balance, swing leg front to back",
        difficulty: 1
      },
      {
        exercise: "Cat-Cow Stretch",
        sets: 1,
        reps: "8",
        restTime: 0,
        targetMuscles: ["spine", "core"],
        instructions: "On hands and knees, arch and round your back slowly",
        difficulty: 1
      }
    ],
    exercises: [
      {
        exercise: "Wall Push-ups",
        sets: 2,
        reps: "8-12",
        restTime: 60,
        targetMuscles: ["chest", "arms", "shoulders"],
        instructions: "Stand arm's length from wall, hands flat against wall at shoulder height",
        modifications: ["Move feet closer to wall for easier", "Try incline push-ups on stairs for harder"],
        difficulty: 2
      },
      {
        exercise: "Chair Squats",
        sets: 2,
        reps: "8-12",
        restTime: 60,
        targetMuscles: ["legs", "glutes"],
        instructions: "Sit back onto chair, then stand up without using hands",
        modifications: ["Use hands for assistance", "Hold at bottom for 2 seconds"],
        difficulty: 2
      },
      {
        exercise: "Modified Plank",
        sets: 2,
        reps: "15-30 seconds",
        restTime: 60,
        targetMuscles: ["core", "shoulders"],
        instructions: "On knees and forearms, keep straight line from knees to head",
        modifications: ["Start on knees", "Progress to full plank"],
        difficulty: 3
      },
      {
        exercise: "Standing Marches",
        sets: 2,
        reps: "10 each leg",
        restTime: 45,
        targetMuscles: ["core", "legs"],
        instructions: "Lift knees toward chest alternately while standing",
        modifications: ["Hold onto something for balance"],
        difficulty: 2
      }
    ],
    cooldown: [
      {
        exercise: "Shoulder Rolls",
        sets: 1,
        reps: "10 forward, 10 backward",
        restTime: 0,
        targetMuscles: ["shoulders"],
        instructions: "Slowly roll shoulders in circles",
        difficulty: 1
      },
      {
        exercise: "Forward Fold",
        sets: 1,
        reps: "Hold 30 seconds",
        restTime: 0,
        targetMuscles: ["hamstrings", "back"],
        instructions: "Gently fold forward, let arms hang",
        modifications: ["Bend knees if tight hamstrings"],
        difficulty: 1
      },
      {
        exercise: "Deep Breathing",
        sets: 1,
        reps: "5 deep breaths",
        restTime: 0,
        targetMuscles: ["diaphragm"],
        instructions: "Breathe in for 4 counts, hold for 4, out for 6",
        difficulty: 1
      }
    ]
  },

  // Day 2: Building movement patterns
  movement_foundations: {
    name: "Movement Foundations",
    description: "Building basic movement patterns that form the foundation of fitness",
    workoutType: "strength",
    difficulty: "beginner",
    estimatedDuration: 25,
    equipment: ["bodyweight"],
    tags: ["beginner", "movement", "foundational"],
    warmup: [
      {
        exercise: "Gentle Neck Rolls",
        sets: 1,
        reps: "5 each direction",
        restTime: 0,
        targetMuscles: ["neck"],
        instructions: "Slowly and gently roll head in circles",
        difficulty: 1
      },
      {
        exercise: "Hip Circles",
        sets: 1,
        reps: "8 each direction",
        restTime: 0,
        targetMuscles: ["hips"],
        instructions: "Hands on hips, make circles with your hips",
        difficulty: 1
      },
      {
        exercise: "Ankle Rolls",
        sets: 1,
        reps: "8 each foot",
        restTime: 0,
        targetMuscles: ["ankles"],
        instructions: "Lift one foot, make circles with your ankle",
        difficulty: 1
      }
    ],
    exercises: [
      {
        exercise: "Bodyweight Squats",
        sets: 2,
        reps: "10-15",
        restTime: 60,
        targetMuscles: ["legs", "glutes", "core"],
        instructions: "Feet hip-width apart, sit back like sitting in a chair",
        modifications: ["Use chair for support", "Go deeper for challenge"],
        difficulty: 3
      },
      {
        exercise: "Incline Push-ups",
        sets: 2,
        reps: "6-10",
        restTime: 60,
        targetMuscles: ["chest", "arms", "core"],
        instructions: "Hands on elevated surface (couch, stairs), push up at an angle",
        modifications: ["Higher surface = easier", "Lower surface = harder"],
        difficulty: 3
      },
      {
        exercise: "Dead Bug",
        sets: 2,
        reps: "8 each side",
        restTime: 60,
        targetMuscles: ["core", "coordination"],
        instructions: "Lying on back, extend opposite arm and leg slowly",
        modifications: ["Just move arms", "Add light weights"],
        difficulty: 3
      },
      {
        exercise: "Glute Bridges",
        sets: 2,
        reps: "12-15",
        restTime: 45,
        targetMuscles: ["glutes", "hamstrings"],
        instructions: "Lying on back, squeeze glutes and lift hips up",
        modifications: ["Hold at top for 2 seconds", "Single leg for challenge"],
        difficulty: 2
      }
    ],
    cooldown: [
      {
        exercise: "Child's Pose",
        sets: 1,
        reps: "Hold 45 seconds",
        restTime: 0,
        targetMuscles: ["back", "hips"],
        instructions: "Sit back on heels, reach arms forward on ground",
        difficulty: 1
      },
      {
        exercise: "Seated Spinal Twist",
        sets: 1,
        reps: "30 seconds each side",
        restTime: 0,
        targetMuscles: ["spine", "back"],
        instructions: "Sitting, gently twist to each side",
        difficulty: 1
      }
    ]
  },

  // Day 3: Gentle cardio introduction
  cardio_starter: {
    name: "Gentle Cardio Introduction",
    description: "Get your heart pumping with fun, low-impact movements",
    workoutType: "cardio",
    difficulty: "beginner",
    estimatedDuration: 15,
    equipment: ["bodyweight"],
    tags: ["beginner", "cardio", "low_impact"],
    warmup: [
      {
        exercise: "Marching in Place",
        sets: 1,
        reps: "30 seconds",
        restTime: 0,
        targetMuscles: ["legs", "cardiovascular"],
        instructions: "Gentle marching, lift knees comfortably",
        difficulty: 1
      },
      {
        exercise: "Arm Swings",
        sets: 1,
        reps: "15 forward, 15 backward",
        restTime: 0,
        targetMuscles: ["shoulders", "arms"],
        instructions: "Swing arms across your body and back",
        difficulty: 1
      }
    ],
    exercises: [
      {
        exercise: "Step Touch",
        sets: 3,
        reps: "30 seconds",
        restTime: 30,
        targetMuscles: ["legs", "cardiovascular"],
        instructions: "Step to one side, touch other foot, step back",
        modifications: ["Add arm movements", "Increase speed gradually"],
        difficulty: 2
      },
      {
        exercise: "Modified Jumping Jacks",
        sets: 3,
        reps: "20 seconds",
        restTime: 40,
        targetMuscles: ["full_body", "cardiovascular"],
        instructions: "Step side to side while raising arms overhead",
        modifications: ["No jumping, just step", "Add small jump if comfortable"],
        difficulty: 3
      },
      {
        exercise: "Knee Lifts",
        sets: 3,
        reps: "20 seconds",
        restTime: 40,
        targetMuscles: ["core", "legs", "cardiovascular"],
        instructions: "Lift knees toward chest alternately",
        modifications: ["Hold onto something for balance", "Lift knees higher"],
        difficulty: 2
      }
    ],
    cooldown: [
      {
        exercise: "Walk in Place",
        sets: 1,
        reps: "60 seconds",
        restTime: 0,
        targetMuscles: ["legs"],
        instructions: "Slow, gentle walking motion to bring heart rate down",
        difficulty: 1
      },
      {
        exercise: "Standing Side Stretch",
        sets: 1,
        reps: "30 seconds each side",
        restTime: 0,
        targetMuscles: ["sides", "back"],
        instructions: "Reach one arm overhead and lean to the opposite side",
        difficulty: 1
      }
    ]
  }
}

// Helper function to get appropriate seed workouts based on user profile
export function getSeedWorkoutsForUser(userProfile: {
  fitnessLevel: string
  goals: string[]
  equipment: string[]
}): SeedWorkout[] {
  const { fitnessLevel, goals, equipment } = userProfile
  
  // Always start with the welcome workout
  const seedWorkouts = [SEED_WORKOUTS.welcome_bodyweight]
  
  // Add movement foundations for all users
  seedWorkouts.push(SEED_WORKOUTS.movement_foundations)
  
  // Add cardio starter for cardio-focused users or general fitness
  if (goals.includes('endurance') || goals.includes('general_fitness') || goals.includes('weight_loss')) {
    seedWorkouts.push(SEED_WORKOUTS.cardio_starter)
  }
  
  return seedWorkouts
}

// Function to create seed workouts in database for new user
export async function createSeedWorkoutsForUser(
  userId: string,
  userProfile: {
    fitnessLevel: string
    goals: string[]
    equipment: string[]
  }
) {
  // This function would be called after user completes onboarding
  // Implementation would depend on database setup
  const seedWorkouts = getSeedWorkoutsForUser(userProfile)
  
  // In a real implementation, this would create database records
  // For now, return the workouts for the calling code to handle
  return seedWorkouts.map((workout, index) => ({
    userId,
    date: new Date(Date.now() + index * 24 * 60 * 60 * 1000), // Space out over consecutive days
    routine: [
      ...workout.warmup.map(ex => ({ ...ex, category: 'warmup' })),
      ...workout.exercises.map(ex => ({ ...ex, category: 'main' })),
      ...workout.cooldown.map(ex => ({ ...ex, category: 'cooldown' }))
    ],
    workoutType: workout.workoutType,
    completed: false,
    duration: null,
    feedback: {},
    generatedBy: 'template',
    tags: workout.tags,
    templateId: `seed_${Object.keys(SEED_WORKOUTS).find(key => SEED_WORKOUTS[key] === workout)}`,
    metrics: {
      estimatedDuration: workout.estimatedDuration,
      difficulty: workout.difficulty,
      equipment: workout.equipment
    },
    createdAt: new Date(),
    updatedAt: new Date()
  }))
}

// Motivational messages for seed workouts
export const SEED_WORKOUT_MESSAGES = {
  welcome: [
    "Welcome to your fitness journey! 🎉",
    "Every expert was once a beginner 💪",
    "Your first step is the hardest - you've got this! 🌟"
  ],
  encouragement: [
    "Building healthy habits one day at a time 📈",
    "Consistency beats perfection every time ✨",
    "Your body can do it. It's your mind you need to convince 🧠"
  ],
  celebration: [
    "Look at you go! 🔥",
    "Momentum is building! 🚀",
    "You're stronger than you think! 💎"
  ]
}

export default SEED_WORKOUTS 