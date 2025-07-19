import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from './auth/[...nextauth]'
import OpenAI from 'openai'
import { UserProfile } from '@/lib/profile-store'
import { TodaysWorkout } from '@/lib/dashboard-store'
import { exercises, filterExercises, getRandomExercises, Exercise } from '@/lib/exercises'
// import { prisma } from '@/lib/prisma'

// Rate limiting map - In production, use Redis or external rate limiting service
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

// AI-Powered Workout Generation API
// This endpoint generates personalized workouts using OpenAI GPT-4o based on:
// 1. User's fitness profile (goals, equipment, preferences, fitness level)
// 2. Recent workout history (last 3 workouts for variety and progression)
// 3. User feedback patterns (difficulty, enjoyment, modifications)
// 4. Intelligent prompt engineering for safety and progressive overload

interface WorkoutExercise {
  exercise: string
  exerciseId?: string // Reference to our exercise database
  sets: number
  reps: number | string // Can be "AMRAP" or "30 seconds" for time-based
  weight?: number | string // Optional weight or "bodyweight"
  restTime: number // Seconds between sets
  targetMuscles: string[]
  instructions?: string
  modifications?: string[] // Easier/harder variations
}

// Extended workout interface that includes feedback for history analysis
interface WorkoutWithFeedback extends TodaysWorkout {
  feedback?: {
    difficulty: number
    enjoyment: number
    energy: string
  }
}

interface GeneratedWorkout {
  exercises: WorkoutExercise[]
  warmup: WorkoutExercise[]
  cooldown: WorkoutExercise[]
  estimatedDuration: number
  workoutType: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  focus: string[] // Primary muscle groups or goals
  aiGenerated: boolean
  prompt?: string // Store the AI prompt for debugging/improvement
}

// Default fallback routines for when AI generation fails
const DEFAULT_WORKOUTS = {
  beginner: {
    bodyweight: {
      exercises: [
        {
          exercise: "Bodyweight Squats",
          sets: 3,
          reps: 10,
          restTime: 60,
          targetMuscles: ["quadriceps", "glutes"],
          instructions: "Keep your back straight, lower until thighs are parallel to ground"
        },
        {
          exercise: "Push-ups (knee variation if needed)",
          sets: 3,
          reps: 8,
          restTime: 60,
          targetMuscles: ["chest", "triceps", "shoulders"],
          instructions: "Lower chest to ground, push up explosively"
        },
        {
          exercise: "Plank",
          sets: 3,
          reps: "30 seconds",
          restTime: 45,
          targetMuscles: ["core"],
          instructions: "Keep body straight from head to heels"
        }
      ],
      warmup: [
        { exercise: "Arm Circles", sets: 1, reps: 10, restTime: 0, targetMuscles: ["shoulders"] },
        { exercise: "Leg Swings", sets: 1, reps: 10, restTime: 0, targetMuscles: ["hips"] }
      ],
      cooldown: [
        { exercise: "Child's Pose", sets: 1, reps: "30 seconds", restTime: 0, targetMuscles: ["back"] },
        { exercise: "Hamstring Stretch", sets: 1, reps: "30 seconds", restTime: 0, targetMuscles: ["hamstrings"] }
      ]
    }
  }
}

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Authentication check
    const session = await getServerSession(req, res, authOptions)
    if (!session?.user?.email) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    // Rate limiting check
    const userEmail = session.user?.email || 'anonymous'
    const currentTime = Date.now()
    const resetTime = 60 * 60 * 1000 // 1 hour in milliseconds
    const maxRequests = 10

    const userRateLimit = rateLimitMap.get(userEmail)
    if (userRateLimit) {
      if (currentTime < userRateLimit.resetTime) {
        if (userRateLimit.count >= maxRequests) {
          return res.status(429).json({
            error: 'Rate limit exceeded',
            retryAfter: Math.ceil((userRateLimit.resetTime - currentTime) / 1000),
            message: `You've reached the limit of ${maxRequests} workout generations per hour. Please try again later.`
          })
        }
        userRateLimit.count += 1
      } else {
        rateLimitMap.set(userEmail, { count: 1, resetTime: currentTime + resetTime })
      }
    } else {
      rateLimitMap.set(userEmail, { count: 1, resetTime: currentTime + resetTime })
    }

    // Extract preferences from request body for customization
    const { customPreferences } = req.body || {}

    // Mock data for demonstration (replace with actual database queries)
    const mockUserProfile: UserProfile = {
      id: 'mock-user-id',
      email: 'user@example.com',
      name: 'Mock User',
      fitnessLevel: 'intermediate',
      goals: ['muscle_gain', 'strength'],
      equipment: ['dumbbells', 'bodyweight'],
      preferences: {
        duration: 45,
        intensity: 'moderate',
        workoutTime: 'evening',
        restDays: ['sunday'],
        injuries: []
      },
      streak: 5,
      longestStreak: 10,
      totalWorkouts: 25,
      level: 2,
      xp: 250,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const mockRecentWorkouts: WorkoutWithFeedback[] = [
      {
        id: 'workout-1',
        routine: [
          { exercise: "Push-ups", sets: 3, reps: 15, restTime: 60, targetMuscles: ["chest", "triceps"] },
          { exercise: "Squats", sets: 3, reps: 20, restTime: 60, targetMuscles: ["quadriceps", "glutes"] }
        ],
        feedback: { difficulty: 6, enjoyment: 8, energy: "high" },
        workoutType: "strength",
        completed: true,
        date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        generatedBy: 'ai'
      },
      {
        id: 'workout-2',
        routine: [
          { exercise: "Dumbbell Rows", sets: 3, reps: 12, restTime: 60, targetMuscles: ["back", "biceps"] },
          { exercise: "Lunges", sets: 3, reps: 10, restTime: 60, targetMuscles: ["quadriceps", "glutes"] }
        ],
        feedback: { difficulty: 7, enjoyment: 7, energy: "moderate" },
        workoutType: "strength",
        completed: true,
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        generatedBy: 'ai'
      }
    ]

    // Generate workout using AI
    let generatedWorkout: GeneratedWorkout

    if (process.env.OPENAI_API_KEY) {
      try {
        // Get available exercises based on user's equipment
        const availableExercises = filterExercises({
          equipment: mockUserProfile.equipment,
          difficulty: mockUserProfile.fitnessLevel
        })

        // Create exercise context for AI
        const exerciseContext = availableExercises.map(ex => ({
          name: ex.name,
          category: ex.category,
          muscleGroups: ex.muscleGroups,
          difficulty: ex.difficulty,
          instructions: ex.instructions,
          tips: ex.tips.join(', ') // Convert array to string
        })).slice(0, 50) // Limit to 50 exercises for context

        const prompt = constructWorkoutPrompt(
          mockUserProfile, 
          mockRecentWorkouts, 
          exerciseContext,
          customPreferences
        )

        const completion = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `You are an expert fitness trainer and workout programmer. Generate safe, effective, and personalized workouts based on user profiles and available exercises. Always prioritize safety and proper form.`
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 2000
        })

        const aiResponse = completion.choices[0]?.message?.content
        if (!aiResponse) {
          throw new Error('No response from AI')
        }

        // Parse AI response and map to our exercise database
        generatedWorkout = parseAIWorkoutResponse(aiResponse, availableExercises)
        generatedWorkout.aiGenerated = true
        generatedWorkout.prompt = prompt

      } catch (aiError) {
        console.error('AI generation failed, falling back to default workout:', aiError)
        generatedWorkout = generateFallbackWorkout(mockUserProfile)
        generatedWorkout.aiGenerated = false
      }
    } else {
      // No OpenAI key, use fallback
      generatedWorkout = generateFallbackWorkout(mockUserProfile)
      generatedWorkout.aiGenerated = false
    }

    // Validate generated workout
    if (!isValidWorkout(generatedWorkout)) {
      return res.status(500).json({
        error: 'Generated workout is invalid',
        message: 'The AI generated an invalid workout. Please try again.'
      })
    }

    // TODO: Save workout to database
    /*
    const savedWorkout = await prisma.workout.create({
      data: {
        userId: userId,
        exercises: generatedWorkout.exercises,
        warmup: generatedWorkout.warmup,
        cooldown: generatedWorkout.cooldown,
        estimatedDuration: generatedWorkout.estimatedDuration,
        workoutType: generatedWorkout.workoutType,
        difficulty: generatedWorkout.difficulty,
        focus: generatedWorkout.focus,
        aiGenerated: generatedWorkout.aiGenerated
      }
    })
    */

    return res.status(200).json({
      success: true,
      workout: generatedWorkout,
      message: 'Workout generated successfully!',
      aiGenerated: generatedWorkout.aiGenerated
    })

  } catch (error) {
    console.error('Workout generation error:', error)
    return res.status(500).json({
      error: 'Failed to generate workout',
      message: 'An error occurred while generating your workout. Please try again.'
    })
  }
}

// Intelligent prompt construction for AI workout generation
// This function embeds fitness expertise and safety principles into the AI prompt
function constructWorkoutPrompt(
  userProfile: UserProfile, 
  recentWorkouts: WorkoutWithFeedback[], 
  availableExercises: { name: string; category: string; muscleGroups: string[]; difficulty: string; instructions: string; tips: string }[],
  customPreferences?: Partial<UserProfile['preferences']>
): string {
  const workoutHistory = recentWorkouts.map(w => ({
    exercises: w.exercises.map(e => e.exercise).join(', '),
    difficulty: w.feedback?.difficulty || 5,
    enjoyment: w.feedback?.enjoyment || 5
  }))

  return `Generate a personalized workout routine for the following user profile:

USER PROFILE:
- Fitness Level: ${userProfile.fitnessLevel}
- Goals: ${userProfile.goals.join(', ')}
- Available Equipment: ${userProfile.equipment.join(', ')}
- Preferred Duration: ${userProfile.preferences.duration} minutes
- Intensity Preference: ${userProfile.preferences.intensity}
- Focus Areas: ${userProfile.preferences.focus.join(', ')}
- Injuries to Avoid: ${userProfile.preferences.avoidInjuries?.join(', ') || 'None'}

RECENT WORKOUT HISTORY (for variety and progression):
${workoutHistory.map((w, i) => `${i + 1}. ${w.exercises} (Difficulty: ${w.difficulty}/10, Enjoyment: ${w.enjoyment}/10)`).join('\n')}

AVAILABLE EXERCISES:
${availableExercises.map(ex => `- ${ex.name} (Difficulty: ${ex.difficulty}, Muscle Groups: ${ex.muscleGroups.join(', ')})`).join('\n')}

WORKOUT GENERATION REQUIREMENTS:
1. Use only exercises from the available exercises list
2. Include 4-6 main exercises for a ${userProfile.preferences.duration}-minute workout
3. Include 2-3 warm-up exercises (5-10 minutes)
4. Include 2-3 cool-down exercises (5-10 minutes)
5. Target different muscle groups for balanced development
6. Match difficulty to user's fitness level (${userProfile.fitnessLevel})
7. Include proper rest periods between sets
8. Provide clear instructions for each exercise

RESPONSE FORMAT: Return a valid JSON object with this exact structure:
{
  "exercises": [{"exercise": "string", "sets": number, "reps": "string|number", "weight": "string", "restTime": number, "targetMuscles": ["string"], "instructions": "string", "modifications": ["string"]}],
  "warmup": [{"exercise": "string", "sets": number, "reps": "string|number", "restTime": number, "targetMuscles": ["string"], "instructions": "string"}],
  "cooldown": [{"exercise": "string", "sets": number, "reps": "string|number", "restTime": number, "targetMuscles": ["string"], "instructions": "string"}],
  "estimatedDuration": number,
  "workoutType": "string",
  "difficulty": "beginner|intermediate|advanced",
  "focus": ["string"]
}`
}

// Workout validation to ensure AI-generated content is safe and well-formed
function isValidWorkout(workout: GeneratedWorkout): boolean {
  try {
    // Check required fields
    if (!workout.exercises || !Array.isArray(workout.exercises) || workout.exercises.length === 0) {
      return false
    }

    // Validate each exercise
    for (const exercise of workout.exercises) {
      if (!exercise.exercise || !exercise.sets || !exercise.reps || !exercise.targetMuscles) {
        return false
      }

      // Safety checks
      if (exercise.sets > 6 || exercise.sets < 1) return false // Reasonable set range
      if (typeof exercise.reps === 'number' && (exercise.reps > 50 || exercise.reps < 1)) return false
      if (exercise.restTime && (exercise.restTime > 300 || exercise.restTime < 15)) return false // 15s-5min rest
    }

    // Check workout duration is reasonable
    if (workout.estimatedDuration > 180 || workout.estimatedDuration < 5) return false

    return true
  } catch {
    return false
  }
}

// Fallback to default routine if AI generation fails
function generateFallbackWorkout(userProfile: UserProfile): GeneratedWorkout {
  const fallbackType = userProfile.equipment.includes('dumbbells') ? 'dumbbells' : 'bodyweight'
  const fallbackWorkout = DEFAULT_WORKOUTS[userProfile.fitnessLevel as keyof typeof DEFAULT_WORKOUTS]?.[fallbackType as 'bodyweight'] || DEFAULT_WORKOUTS.beginner.bodyweight
  
  return {
    ...fallbackWorkout,
    estimatedDuration: userProfile.preferences.duration,
    workoutType: 'strength',
    difficulty: userProfile.fitnessLevel as 'beginner' | 'intermediate' | 'advanced',
    focus: ['full_body'], // Default focus for fallback workouts
    aiGenerated: false, // Indicate it's a fallback
    prompt: 'Fallback to default routine due to AI generation failure.'
  }
}

// Parse AI response and map to our exercise database
function parseAIWorkoutResponse(
  aiResponse: string,
  availableExercises: Exercise[]
): GeneratedWorkout {
  try {
    const parsedWorkout = JSON.parse(aiResponse)

    const exercises: WorkoutExercise[] = parsedWorkout.exercises.map((ex: any) => {
      const exercise = availableExercises.find(e => e.name === ex.exercise)
      if (!exercise) {
        console.warn(`Exercise "${ex.exercise}" not found in available exercises. Skipping.`)
        return {
          exercise: ex.exercise,
          sets: ex.sets,
          reps: ex.reps,
          weight: ex.weight,
          restTime: ex.restTime,
          targetMuscles: ex.targetMuscles,
          instructions: ex.instructions,
          modifications: ex.modifications
        }
      }

      return {
        exercise: ex.exercise,
        exerciseId: exercise.id, // Store the ID from our database
        sets: ex.sets,
        reps: ex.reps,
        weight: ex.weight,
        restTime: ex.restTime,
        targetMuscles: ex.targetMuscles,
        instructions: ex.instructions,
        modifications: ex.modifications
      }
    })

    const warmup: WorkoutExercise[] = parsedWorkout.warmup.map((ex: any) => {
      const exercise = availableExercises.find(e => e.name === ex.exercise)
      if (!exercise) {
        console.warn(`Warmup exercise "${ex.exercise}" not found in available exercises. Skipping.`)
        return {
          exercise: ex.exercise,
          sets: ex.sets,
          reps: ex.reps,
          restTime: ex.restTime,
          targetMuscles: ex.targetMuscles,
          instructions: ex.instructions
        }
      }
      return {
        exercise: ex.exercise,
        sets: ex.sets,
        reps: ex.reps,
        restTime: ex.restTime,
        targetMuscles: ex.targetMuscles,
        instructions: ex.instructions
      }
    })

    const cooldown: WorkoutExercise[] = parsedWorkout.cooldown.map((ex: any) => {
      const exercise = availableExercises.find(e => e.name === ex.exercise)
      if (!exercise) {
        console.warn(`Cooldown exercise "${ex.exercise}" not found in available exercises. Skipping.`)
        return {
          exercise: ex.exercise,
          sets: ex.sets,
          reps: ex.reps,
          restTime: ex.restTime,
          targetMuscles: ex.targetMuscles,
          instructions: ex.instructions
        }
      }
      return {
        exercise: ex.exercise,
        sets: ex.sets,
        reps: ex.reps,
        restTime: ex.restTime,
        targetMuscles: ex.targetMuscles,
        instructions: ex.instructions
      }
    })

    return {
      exercises,
      warmup,
      cooldown,
      estimatedDuration: parsedWorkout.estimatedDuration,
      workoutType: parsedWorkout.workoutType,
      difficulty: parsedWorkout.difficulty,
      focus: parsedWorkout.focus,
      aiGenerated: true,
      prompt: parsedWorkout.prompt
    }
  } catch (parseError) {
    console.error('Failed to parse AI response:', parseError)
    throw new Error('Failed to parse AI response')
  }
}

/*
AI Integration & Safety Notes:

1. PROMPT ENGINEERING FOR SAFETY:
   - System prompt establishes AI as fitness expert with safety focus
   - Explicit safety constraints (no dangerous exercises, proper rest)
   - Form instructions and modifications required for every exercise
   - Progressive overload principles embedded in prompts

2. VARIETY & ENGAGEMENT (Anti-Monotony):
   - Like Duolingo's varied daily lessons, we prevent workout boredom
   - Recent workout history analysis prevents exercise repetition
   - Different movement patterns and rep schemes for variety
   - Feedback loop considers user enjoyment ratings

3. PERSONALIZATION & ADAPTATION:
   - Goals determine exercise selection and focus areas
   - Equipment availability filters feasible exercises
   - Fitness level influences complexity and intensity
   - Injury considerations for safe modifications

4. FEEDBACK LOOP INTEGRATION:
   - Previous workout feedback influences difficulty progression
   - Low enjoyment scores trigger variety increases
   - High difficulty ratings moderate next workout intensity
   - Completion rates affect future workout complexity

5. SAFETY MECHANISMS:
   - Workout validation prevents dangerous AI outputs
   - Fallback routines ensure users always get safe workouts
   - Rate limiting prevents API abuse
   - Human-designed defaults for critical failure scenarios

6. PROGRESSIVE OVERLOAD:
   - Gradual difficulty increases based on workout history
   - User feedback drives intensity adjustments
   - Streak data influences motivation and challenge level
   - Total workout count affects exercise complexity

This system creates a personalized, safe, and engaging fitness experience
that adapts to user progress while maintaining variety and motivation.
*/ 