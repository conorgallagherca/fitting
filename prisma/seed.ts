import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

/**
 * FitLingo Database Seed Script
 * 
 * This script populates the database with realistic sample data for development and testing.
 * It demonstrates the flexibility of our JSON-based schema and provides a foundation for
 * AI workout generation and analysis.
 * 
 * Seeding Strategy:
 * 1. Create diverse user profiles with different fitness levels and goals
 * 2. Generate realistic workout history with varied routines and feedback
 * 3. Populate workout templates for AI baseline generation
 * 4. Ensure data relationships and constraints are properly maintained
 * 
 * Data Population Philosophy:
 * - Realistic user diversity for testing recommendation algorithms
 * - Comprehensive workout variety to train AI systems
 * - Rich feedback data to simulate real user interactions
 * - Template variety to provide AI with proven workout structures
 * 
 * AI Training Benefits:
 * - Historical workout patterns for progression analysis
 * - User feedback correlations for personalization
 * - Equipment and goal combinations for recommendation logic
 * - Completion patterns for adherence prediction
 */

const prisma = new PrismaClient()

// Workout routine templates for realistic data generation
const workoutRoutines = {
  beginnerBodyweight: [
    {
      exercise: "Push-ups",
      sets: 2,
      reps: 8,
      restTime: 60,
      notes: "Knee variation if needed",
      targetMuscles: ["chest", "triceps", "shoulders"],
      difficulty: 3
    },
    {
      exercise: "Bodyweight Squats",
      sets: 2,
      reps: 12,
      restTime: 45,
      notes: "Focus on form and depth",
      targetMuscles: ["quadriceps", "glutes", "calves"],
      difficulty: 2
    },
    {
      exercise: "Plank",
      sets: 2,
      duration: 30,
      restTime: 45,
      notes: "Hold steady, breathe normally",
      targetMuscles: ["core", "shoulders"],
      difficulty: 3
    }
  ],
  
  intermediateStrength: [
    {
      exercise: "Dumbbell Bench Press",
      sets: 3,
      reps: 10,
      weight: 25,
      restTime: 90,
      notes: "Control the weight, full range of motion",
      targetMuscles: ["chest", "triceps", "shoulders"],
      difficulty: 6
    },
    {
      exercise: "Goblet Squats",
      sets: 3,
      reps: 12,
      weight: 20,
      restTime: 60,
      notes: "Hold dumbbell at chest level",
      targetMuscles: ["quadriceps", "glutes", "core"],
      difficulty: 5
    },
    {
      exercise: "Dumbbell Rows",
      sets: 3,
      reps: 10,
      weight: 20,
      restTime: 60,
      notes: "Each arm, focus on squeezing shoulder blades",
      targetMuscles: ["back", "biceps"],
      difficulty: 5
    }
  ],
  
  cardioHIIT: [
    {
      exercise: "Jumping Jacks",
      sets: 4,
      duration: 45,
      restTime: 15,
      notes: "High intensity, maintain form",
      targetMuscles: ["full_body"],
      difficulty: 4
    },
    {
      exercise: "Mountain Climbers",
      sets: 4,
      duration: 30,
      restTime: 15,
      notes: "Keep core tight, fast pace",
      targetMuscles: ["core", "shoulders", "legs"],
      difficulty: 6
    },
    {
      exercise: "Burpees",
      sets: 3,
      reps: 8,
      restTime: 30,
      notes: "Full body movement, pace yourself",
      targetMuscles: ["full_body"],
      difficulty: 8
    }
  ],
  
  yogaFlexibility: [
    {
      exercise: "Downward Dog",
      sets: 3,
      duration: 60,
      restTime: 15,
      notes: "Stretch through shoulders and hamstrings",
      targetMuscles: ["shoulders", "hamstrings", "calves"],
      difficulty: 3
    },
    {
      exercise: "Warrior II",
      sets: 2,
      duration: 45,
      restTime: 15,
      notes: "Each side, focus on alignment",
      targetMuscles: ["legs", "core", "shoulders"],
      difficulty: 4
    },
    {
      exercise: "Child's Pose",
      sets: 1,
      duration: 90,
      restTime: 0,
      notes: "Relaxation and gentle stretch",
      targetMuscles: ["back", "hips"],
      difficulty: 1
    }
  ]
}

// Sample user feedback variations for realistic AI training data
const feedbackTemplates = [
  {
    difficulty: 6,
    enjoyment: 8,
    energy: "high",
    soreness: "mild",
    mood: "motivated",
    notes: "Felt strong today, could increase weight next time",
    modifications: [],
    skippedExercises: [],
    favoriteExercises: ["squats"]
  },
  {
    difficulty: 8,
    enjoyment: 6,
    energy: "medium",
    soreness: "moderate",
    mood: "determined",
    notes: "Challenging workout, needed extra rest between sets",
    modifications: [
      { exercise: "Push-ups", change: "knee variation" }
    ],
    skippedExercises: [],
    favoriteExercises: []
  },
  {
    difficulty: 4,
    enjoyment: 9,
    energy: "high",
    soreness: "none",
    mood: "energized",
    notes: "Perfect difficulty level, felt great throughout",
    modifications: [],
    skippedExercises: [],
    favoriteExercises: ["plank", "jumping jacks"]
  },
  {
    difficulty: 7,
    enjoyment: 7,
    energy: "medium",
    soreness: "mild",
    mood: "accomplished",
    notes: "Good progression from last week",
    modifications: [],
    skippedExercises: ["burpees"],
    favoriteExercises: ["dumbbell rows"]
  }
]

/**
 * Main seeding function that orchestrates the data population process
 * 
 * Execution Order:
 * 1. Clear existing data (development only)
 * 2. Create workout templates for AI baseline
 * 3. Create diverse user profiles
 * 4. Generate realistic workout history
 * 5. Verify data integrity and relationships
 */
async function main() {
  console.log('🌱 Starting FitLingo database seeding...')
  
  // Clear existing data for clean development environment
  console.log('🧹 Cleaning existing data...')
  await prisma.workout.deleteMany()
  await prisma.workoutTemplate.deleteMany()
  await prisma.user.deleteMany()
  
  // Create workout templates for AI generation baseline
  console.log('📋 Creating workout templates...')
  await createWorkoutTemplates()
  
  // Create diverse user profiles for testing
  console.log('👥 Creating sample users...')
  const users = await createSampleUsers()
  
  // Generate realistic workout history
  console.log('💪 Generating workout history...')
  await createWorkoutHistory(users)
  
  console.log('✅ Database seeding completed successfully!')
  console.log(`📊 Summary:`)
  console.log(`   - ${users.length} users created`)
  console.log(`   - ${await prisma.workoutTemplate.count()} workout templates`)
  console.log(`   - ${await prisma.workout.count()} workout sessions`)
  console.log('🚀 Ready for AI-powered workout generation!')
}

/**
 * Creates a comprehensive set of workout templates for AI generation
 * 
 * Template Strategy:
 * - Cover all major workout categories (strength, cardio, flexibility)
 * - Multiple difficulty levels for progression
 * - Various equipment requirements for accessibility
 * - Proven exercise combinations for safety and effectiveness
 */
async function createWorkoutTemplates() {
  const templates = [
    // Beginner Templates
    {
      name: "Beginner Bodyweight Basics",
      description: "Perfect starting point for fitness beginners using only bodyweight exercises",
      category: "strength",
      difficulty: "beginner",
      duration: 20,
      equipment: ["bodyweight"],
      routine: workoutRoutines.beginnerBodyweight,
      tags: ["bodyweight", "beginner_friendly", "home_workout"],
      targetGoals: ["general_fitness", "strength", "endurance"],
      createdBy: "system"
    },
    {
      name: "Gentle Yoga Flow",
      description: "Relaxing yoga sequence for flexibility and stress relief",
      category: "flexibility",
      difficulty: "beginner",
      duration: 25,
      equipment: ["yoga_mat"],
      routine: workoutRoutines.yogaFlexibility,
      tags: ["yoga", "flexibility", "stress_relief", "beginner_friendly"],
      targetGoals: ["flexibility", "general_fitness"],
      createdBy: "system"
    },
    
    // Intermediate Templates
    {
      name: "Dumbbell Strength Builder",
      description: "Comprehensive strength training with dumbbells for muscle building",
      category: "strength",
      difficulty: "intermediate",
      duration: 35,
      equipment: ["dumbbells"],
      routine: workoutRoutines.intermediateStrength,
      tags: ["dumbbells", "muscle_building", "strength"],
      targetGoals: ["muscle_gain", "strength"],
      createdBy: "system"
    },
    {
      name: "HIIT Cardio Blast",
      description: "High-intensity interval training for fat burning and conditioning",
      category: "cardio",
      difficulty: "intermediate",
      duration: 25,
      equipment: ["bodyweight"],
      routine: workoutRoutines.cardioHIIT,
      tags: ["hiit", "cardio", "fat_burning", "bodyweight"],
      targetGoals: ["weight_loss", "endurance"],
      createdBy: "system"
    },
    
    // Advanced Templates
    {
      name: "Advanced Full Body Circuit",
      description: "Challenging circuit combining strength and cardio for experienced athletes",
      category: "mixed",
      difficulty: "advanced",
      duration: 45,
      equipment: ["dumbbells", "resistance_bands"],
      routine: [
        ...workoutRoutines.intermediateStrength.map(ex => ({ ...ex, sets: ex.sets + 1, weight: (ex.weight || 0) + 10 })),
        ...workoutRoutines.cardioHIIT.slice(0, 2)
      ],
      tags: ["circuit", "full_body", "advanced", "strength_cardio"],
      targetGoals: ["muscle_gain", "endurance", "strength"],
      createdBy: "system"
    }
  ]
  
  for (const template of templates) {
    await prisma.workoutTemplate.create({
      data: template
    })
  }
}

/**
 * Creates diverse user profiles representing different fitness demographics
 * 
 * User Diversity Strategy:
 * - Multiple fitness levels (beginner to advanced)
 * - Varied goals and equipment access
 * - Different activity patterns and streaks
 * - Realistic preference combinations for AI training
 */
async function createSampleUsers() {
  const hashedPassword = await bcrypt.hash('password123', 12)
  
  const users = [
    // User 1: Fitness Beginner - Perfect for testing onboarding and progression
    {
      email: "sarah.beginnnr@example.com",
      name: "Sarah Johnson",
      password: hashedPassword,
      fitnessLevel: "beginner",
      goals: ["weight_loss", "general_fitness"],
      preferences: {
        workoutDuration: 20,
        workoutTime: "morning",
        intensity: "low",
        restDays: ["sunday"],
        injuries: [],
        musicPreference: "upbeat"
      },
      equipment: ["bodyweight", "yoga_mat"],
      streak: 3,
      longestStreak: 7,
      totalWorkouts: 12,
      level: 2,
      xp: 240,
      lastActiveAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
    },
    
    // User 2: Intermediate Enthusiast - Active user with workout history for AI analysis
    {
      email: "mike.fit@example.com",
      name: "Mike Chen",
      password: hashedPassword,
      fitnessLevel: "intermediate",
      goals: ["muscle_gain", "strength"],
      preferences: {
        workoutDuration: 45,
        workoutTime: "evening",
        intensity: "moderate",
        restDays: ["sunday", "wednesday"],
        injuries: ["knee"],
        musicPreference: "rock"
      },
      equipment: ["dumbbells", "resistance_bands", "gym_access"],
      streak: 15,
      longestStreak: 23,
      totalWorkouts: 87,
      level: 5,
      xp: 1740,
      lastActiveAt: new Date() // Active today
    },
    
    // User 3: Advanced Athlete - Power user for testing advanced features
    {
      email: "alex.athlete@example.com",
      name: "Alex Rodriguez",
      password: hashedPassword,
      fitnessLevel: "advanced",
      goals: ["strength", "endurance", "muscle_gain"],
      preferences: {
        workoutDuration: 60,
        workoutTime: "morning",
        intensity: "high",
        restDays: ["sunday"],
        injuries: [],
        musicPreference: "electronic"
      },
      equipment: ["dumbbells", "barbell", "kettlebell", "gym_access", "resistance_bands"],
      streak: 42,
      longestStreak: 56,
      totalWorkouts: 234,
      level: 12,
      xp: 4680,
      lastActiveAt: new Date()
    }
  ]
  
  const createdUsers = []
  for (const userData of users) {
    const user = await prisma.user.create({
      data: userData
    })
    createdUsers.push(user)
  }
  
  return createdUsers
}

/**
 * Generates realistic workout history for AI training and analysis
 * 
 * History Generation Strategy:
 * - Varied workout types and difficulties
 * - Realistic progression patterns
 * - Rich feedback data for AI learning
 * - Completion patterns that reflect real user behavior
 * 
 * AI Training Value:
 * - User preference patterns
 * - Exercise progression tracking
 * - Feedback correlation analysis
 * - Adherence and completion prediction
 */
async function createWorkoutHistory(users: any[]) {
  // Focus on Mike (intermediate user) for comprehensive workout history
  const mikeUser = users.find(u => u.email === "mike.fit@example.com")
  
  if (!mikeUser) return
  
  // Generate 5 realistic workout sessions over the past 2 weeks
  const workoutDates = [
    new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 2 weeks ago
    new Date(Date.now() - 11 * 24 * 60 * 60 * 1000), // 11 days ago
    new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),  // 8 days ago
    new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),  // 5 days ago
    new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),  // 2 days ago
  ]
  
  const workoutSessions = [
    {
      date: workoutDates[0],
      routine: workoutRoutines.beginnerBodyweight,
      workoutType: "strength",
      completed: true,
      duration: 25,
      feedback: {
        ...feedbackTemplates[0],
        notes: "First week back to working out, felt good to start moving again"
      },
      generatedBy: "template",
      tags: ["bodyweight", "beginner"],
      metrics: { totalVolume: 480, caloriesBurned: 120 }
    },
    {
      date: workoutDates[1],
      routine: workoutRoutines.intermediateStrength,
      workoutType: "strength",
      completed: true,
      duration: 38,
      feedback: {
        ...feedbackTemplates[1],
        notes: "Moved up to dumbbells, form felt solid"
      },
      generatedBy: "ai",
      tags: ["dumbbells", "strength"],
      metrics: { totalVolume: 1200, caloriesBurned: 180 }
    },
    {
      date: workoutDates[2],
      routine: workoutRoutines.cardioHIIT,
      workoutType: "cardio",
      completed: true,
      duration: 22,
      feedback: {
        ...feedbackTemplates[2],
        notes: "Cardio day was perfect, great energy boost"
      },
      generatedBy: "template",
      tags: ["hiit", "cardio"],
      metrics: { totalVolume: 0, caloriesBurned: 280 }
    },
    {
      date: workoutDates[3],
      routine: workoutRoutines.intermediateStrength.map(ex => ({ 
        ...ex, 
        weight: (ex.weight || 0) + 5 // Progressive overload
      })),
      workoutType: "strength",
      completed: true,
      duration: 42,
      feedback: {
        ...feedbackTemplates[3],
        notes: "Increased weight this week, feeling stronger"
      },
      generatedBy: "ai",
      tags: ["dumbbells", "progression"],
      metrics: { totalVolume: 1350, caloriesBurned: 195 }
    },
    {
      date: workoutDates[4],
      routine: [
        ...workoutRoutines.yogaFlexibility,
        {
          exercise: "Foam Rolling",
          sets: 1,
          duration: 300,
          restTime: 0,
          notes: "Recovery and mobility work",
          targetMuscles: ["full_body"],
          difficulty: 2
        }
      ],
      workoutType: "flexibility",
      completed: true,
      duration: 30,
      feedback: {
        difficulty: 3,
        enjoyment: 8,
        energy: "medium",
        soreness: "none",
        mood: "relaxed",
        notes: "Great recovery session, feeling loose and mobile",
        modifications: [],
        skippedExercises: [],
        favoriteExercises: ["downward dog"]
      },
      generatedBy: "template",
      tags: ["yoga", "recovery"],
      metrics: { totalVolume: 0, caloriesBurned: 85 }
    }
  ]
  
  // Create workout records with proper completion timestamps
  for (let i = 0; i < workoutSessions.length; i++) {
    const session = workoutSessions[i]
    const completedAt = new Date(session.date.getTime() + (session.duration * 60 * 1000))
    
    await prisma.workout.create({
      data: {
        userId: mikeUser.id,
        date: session.date,
        completedAt: session.completed ? completedAt : null,
        routine: session.routine,
        completed: session.completed,
        duration: session.duration,
        feedback: session.feedback,
        workoutType: session.workoutType,
        tags: session.tags,
        generatedBy: session.generatedBy,
        metrics: session.metrics
      }
    })
  }
  
  // Create a few workouts for other users as well
  await createAdditionalWorkouts(users)
}

/**
 * Creates additional workout data for other users to demonstrate variety
 */
async function createAdditionalWorkouts(users: any[]) {
  const sarahUser = users.find(u => u.email === "sarah.beginnnr@example.com")
  const alexUser = users.find(u => u.email === "alex.athlete@example.com")
  
  // Sarah's recent beginner workout
  if (sarahUser) {
    await prisma.workout.create({
      data: {
        userId: sarahUser.id,
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + (20 * 60 * 1000)),
        routine: workoutRoutines.beginnerBodyweight,
        completed: true,
        duration: 18,
        feedback: {
          difficulty: 4,
          enjoyment: 9,
          energy: "high",
          soreness: "mild",
          mood: "proud",
          notes: "Completed my first full workout! Feeling accomplished",
          modifications: [{ exercise: "Push-ups", change: "knee variation" }],
          skippedExercises: [],
          favoriteExercises: ["squats"]
        },
        workoutType: "strength",
        tags: ["beginner", "bodyweight"],
        generatedBy: "template",
        metrics: { totalVolume: 360, caloriesBurned: 95 }
      }
    })
  }
  
  // Alex's advanced workout
  if (alexUser) {
    await prisma.workout.create({
      data: {
        userId: alexUser.id,
        date: new Date(),
        completedAt: new Date(Date.now() + (55 * 60 * 1000)),
        routine: [
          {
            exercise: "Barbell Deadlift",
            sets: 4,
            reps: 6,
            weight: 185,
            restTime: 180,
            notes: "Focus on form, controlled movement",
            targetMuscles: ["hamstrings", "glutes", "back", "core"],
            difficulty: 9
          },
          {
            exercise: "Pull-ups",
            sets: 3,
            reps: 12,
            restTime: 120,
            notes: "Full range of motion",
            targetMuscles: ["back", "biceps"],
            difficulty: 7
          },
          {
            exercise: "Kettlebell Swings",
            sets: 3,
            reps: 20,
            weight: 35,
            restTime: 90,
            notes: "Explosive hip drive",
            targetMuscles: ["glutes", "hamstrings", "shoulders"],
            difficulty: 6
          }
        ],
        completed: true,
        duration: 52,
        feedback: {
          difficulty: 8,
          enjoyment: 9,
          energy: "high",
          soreness: "moderate",
          mood: "accomplished",
          notes: "Great session, hit all my target weights",
          modifications: [],
          skippedExercises: [],
          favoriteExercises: ["deadlift", "kettlebell swings"]
        },
        workoutType: "strength",
        tags: ["advanced", "barbell", "kettlebell"],
        generatedBy: "ai",
        metrics: { totalVolume: 3600, caloriesBurned: 425 }
      }
    })
  }
}

// Execute the seeding process
main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

/**
 * Seed Script Summary and AI Training Value:
 * 
 * 1. Data Diversity:
 *    - 3 users across all fitness levels (beginner, intermediate, advanced)
 *    - Multiple workout types (strength, cardio, flexibility, mixed)
 *    - Varied equipment combinations and goals
 * 
 * 2. AI Training Benefits:
 *    - Rich feedback data for personalization algorithms
 *    - Exercise progression patterns for difficulty scaling
 *    - User preference correlations for recommendation systems
 *    - Completion patterns for adherence prediction
 * 
 * 3. Template Foundation:
 *    - 5 workout templates covering major categories
 *    - Proven exercise combinations for safety
 *    - Multiple difficulty levels for progression
 *    - Equipment variety for accessibility
 * 
 * 4. Real-world Simulation:
 *    - Realistic workout progressions and weights
 *    - Authentic user feedback and modifications
 *    - Natural completion patterns and timing
 *    - Equipment constraints and preferences
 * 
 * This seed data provides a solid foundation for:
 * - Testing AI workout generation algorithms
 * - Developing personalization features
 * - Training recommendation systems
 * - Validating user experience flows
 * - Demonstrating app capabilities to stakeholders
 */ 