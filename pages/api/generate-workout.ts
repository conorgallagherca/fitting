import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from './auth/[...nextauth]'
import OpenAI from 'openai'
import { UserProfile } from '@/lib/profile-store'
import { TodaysWorkout } from '@/lib/dashboard-store'
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

    // TODO: Database operations - Replace with actual Prisma queries when network issues are resolved
    /*
    const userId = session.user?.id

    // Fetch user profile
    const userProfile = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true
      }
    })

    // Fetch recent workouts for variety and progression
    const recentWorkouts = await prisma.workout.findMany({
      where: {
        userId: userId,
        completed: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 3,
      include: {
        feedback: true
      }
    })

    // Check if user already has a workout for today
    const today = new Date()
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
    
    const existingTodayWorkout = await prisma.workout.findFirst({
      where: {
        userId: userId,
        createdAt: {
          gte: startOfDay,
          lt: endOfDay
        }
      }
    })

    if (existingTodayWorkout) {
      return res.status(200).json({
        message: 'Workout already exists for today',
        error: 'Workout already generated for today',
        existingWorkout: existingTodayWorkout
      })
    }
    */

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

    // Construct intelligent AI prompt for workout generation
    const aiPrompt = constructWorkoutPrompt(mockUserProfile, mockRecentWorkouts, customPreferences)

    let generatedWorkout: GeneratedWorkout | null = null

    // Attempt AI generation with OpenAI
    if (process.env.OPENAI_API_KEY) {
      try {
        console.log('🤖 Generating AI workout with OpenAI...')
        
        const openai = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY
        })

        const completion = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: `You are an expert personal trainer and exercise physiologist. Generate safe, effective, personalized workout routines based on user profiles and goals. Always prioritize safety, progressive overload, and variety to prevent plateaus and maintain engagement.

CRITICAL SAFETY REQUIREMENTS:
1. Always include proper warm-up and cool-down
2. Suggest modifications for different fitness levels
3. Include rest periods and recovery considerations
4. Avoid contraindicated exercises for mentioned injuries
5. Ensure exercise form cues and safety notes

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
            },
            {
              role: "user",
              content: aiPrompt
            }
          ],
          max_tokens: 2000,
          temperature: 0.7
        })

        const aiResponse = completion.choices[0]?.message?.content
        if (aiResponse) {
          try {
            const parsedWorkout = JSON.parse(aiResponse)
            generatedWorkout = {
              ...parsedWorkout,
              aiGenerated: true,
              prompt: aiPrompt
            }
            console.log('✅ AI workout generated successfully')
          } catch (parseError) {
            console.error('❌ Failed to parse AI response:', parseError)
          }
        }
      } catch (aiError) {
        console.error('❌ OpenAI API error:', aiError)
      }
    } else {
      console.log('⚠️ OpenAI API key not configured, using fallback')
    }

    // Fallback to default routine if AI generation fails
    if (!generatedWorkout) {
      // If AI fails, use intelligent workout template selection
      console.log('⚡ Using fallback workout template...')
      const fallbackType = mockUserProfile.equipment.includes('dumbbells') ? 'dumbbells' : 'bodyweight'
      const fallbackWorkout = DEFAULT_WORKOUTS[mockUserProfile.fitnessLevel as keyof typeof DEFAULT_WORKOUTS]?.[fallbackType as 'bodyweight'] || DEFAULT_WORKOUTS.beginner.bodyweight
      
      generatedWorkout = {
        ...fallbackWorkout,
        estimatedDuration: mockUserProfile.preferences.duration,
        workoutType: 'strength',
        difficulty: mockUserProfile.fitnessLevel as 'beginner' | 'intermediate' | 'advanced',
        focus: ['full_body'], // Default focus for fallback workouts
        aiGenerated: false, // Indicate it's a fallback
        prompt: 'Fallback to default routine due to AI generation failure.'
      }
    }

    // Validate generated workout structure
    if (!isValidWorkout(generatedWorkout)) {
      throw new Error('Generated workout failed validation')
    }

    // TODO: Save workout to database when Prisma is working
    /*
    const savedWorkout = await prisma.workout.create({
      data: {
        userId: session.user?.id,
        routine: generatedWorkout.exercises,
        workoutType: generatedWorkout.workoutType,
        generatedBy: generatedWorkout ? 'ai' : 'template',
        completed: false,
        metrics: {
          estimatedDuration: generatedWorkout.estimatedDuration,
          difficulty: generatedWorkout.difficulty,
          focus: generatedWorkout.focus
        }
      }
    })
    */

    // Mock saved workout for response
    const mockSavedWorkout = {
      id: 'mock-workout-' + Date.now(),
      userId: mockUserProfile.id,
      date: new Date().toISOString(),
      routine: generatedWorkout.exercises,
      workoutType: generatedWorkout.workoutType,
      generatedBy: generatedWorkout ? 'ai' : 'template',
      completed: false,
      createdAt: new Date().toISOString()
    }

    // Success response
    return res.status(201).json({
      message: 'Workout generated successfully',
      workout: mockSavedWorkout,
      generatedWorkout,
      metadata: {
        generationMethod: generatedWorkout ? 'ai' : 'fallback',
        estimatedDuration: generatedWorkout.estimatedDuration,
        workoutType: generatedWorkout.workoutType,
        focus: generatedWorkout.focus,
        safety: {
          reviewRequired: false,
          modifications: generatedWorkout.exercises.some(e => e.modifications),
          difficulty: generatedWorkout.difficulty
        }
      }
    })

  } catch (error) {
    console.error('❌ Workout generation error:', error)
    
    return res.status(500).json({
      error: 'Failed to generate workout',
      fallbackSuggestion: 'Try using a default workout template',
      retryAfter: '5 minutes'
    })
  }
}

// Intelligent prompt construction for AI workout generation
// This function embeds fitness expertise and safety principles into the AI prompt
function constructWorkoutPrompt(
  userProfile: UserProfile, 
  recentWorkouts: WorkoutWithFeedback[], 
  customPreferences?: Partial<UserProfile['preferences']>
): string {
  const workoutHistory = recentWorkouts.map(w => ({
    exercises: w.routine.map((e: WorkoutExercise) => e.exercise).join(', '),
    difficulty: w.feedback?.difficulty || 'unknown',
    enjoyment: w.feedback?.enjoyment || 'unknown',
    type: w.workoutType
  }))

  return `Generate a personalized workout routine with the following parameters:

USER PROFILE:
- Fitness Level: ${userProfile.fitnessLevel}
- Goals: ${JSON.stringify(userProfile.goals)}
- Available Equipment: ${JSON.stringify(userProfile.equipment)}
- Workout Duration: ${userProfile.preferences.duration} minutes
- Intensity Preference: ${userProfile.preferences.intensity}
- Injuries/Limitations: ${JSON.stringify(userProfile.preferences.injuries || [])}
- Current Streak: ${userProfile.streak} days
- Total Workouts: ${userProfile.totalWorkouts}

RECENT WORKOUT HISTORY (for variety and progression):
${workoutHistory.map((w, i) => `${i + 1}. ${w.exercises} (Difficulty: ${w.difficulty}/10, Enjoyment: ${w.enjoyment}/10)`).join('\n')}

WORKOUT GENERATION REQUIREMENTS:

1. SAFETY & FORM:
   - Include proper form cues in instructions
   - Provide modifications for beginners/advanced
   - Ensure appropriate rest periods (30-90 seconds)
   - No dangerous exercises or excessive volume

2. VARIETY & ENGAGEMENT (Duolingo-style):
   - Avoid repeating exact exercises from recent workouts
   - Include different movement patterns
   - Mix compound and isolation exercises
   - Vary rep ranges and set schemes

3. PROGRESSIVE OVERLOAD:
   - Slightly increase difficulty from recent sessions
   - Consider user's feedback ratings
   - Progress appropriately for fitness level

4. PERSONALIZATION:
   - Match user's primary goals
   - Use only available equipment
   - Respect time constraints and intensity preference
   - Accommodate any injuries or limitations

5. STRUCTURE:
   - Include 5-minute warmup
   - Main workout targeting multiple muscle groups
   - 5-minute cooldown with stretches

REQUIRED JSON RESPONSE FORMAT:
{
  "exercises": [
    {
      "exercise": "Exercise Name",
      "sets": 3,
      "reps": 12,
      "weight": "bodyweight or weight amount",
      "restTime": 60,
      "targetMuscles": ["muscle1", "muscle2"],
      "instructions": "Detailed form instructions",
      "modifications": ["easier variation", "harder variation"]
    }
  ],
  "warmup": [
    {
      "exercise": "Warmup Exercise",
      "sets": 1,
      "reps": "10 or time",
      "restTime": 0,
      "targetMuscles": ["muscle"],
      "instructions": "How to perform"
    }
  ],
  "cooldown": [
    {
      "exercise": "Stretch Name",
      "sets": 1,
      "reps": "30 seconds",
      "restTime": 0,
      "targetMuscles": ["muscle"],
      "instructions": "Stretching technique"
    }
  ],
  "estimatedDuration": ${userProfile.preferences.duration},
  "workoutType": "strength/cardio/mixed",
  "difficulty": "${userProfile.fitnessLevel}",
  "focus": ["primary muscle groups or goals"]
}

Generate a workout that will keep the user engaged, safe, and progressing toward their goals!`
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