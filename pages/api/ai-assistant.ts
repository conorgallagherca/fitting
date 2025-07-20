import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from './auth/[...nextauth]'
import OpenAI from 'openai'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

interface AIAssistantRequest {
  message: string
  context: {
    exercise: string
    fitnessLevel?: string
    currentSet?: number
    totalSets?: number
  }
}

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

    const { message, context }: AIAssistantRequest = req.body

    if (!message.trim()) {
      return res.status(400).json({ error: 'Message is required' })
    }

    // Construct context-aware prompt
    const systemPrompt = `You are FitLingo, an AI fitness assistant helping users during their workouts. You provide:

1. **Form guidance**: Clear, step-by-step instructions for proper exercise form
2. **Modifications**: Easier or harder variations based on user's fitness level
3. **Safety tips**: Important safety considerations and injury prevention
4. **Motivation**: Encouraging words to keep users going
5. **Quick answers**: Concise, actionable advice

Current context:
- Exercise: ${context.exercise}
- Fitness level: ${context.fitnessLevel || 'Not specified'}
- Set progress: ${context.currentSet || 0}/${context.totalSets || 0}

Keep responses concise (2-3 sentences max) and actionable. Focus on immediate help for the current exercise.`

    const userPrompt = `User question: "${message}"

Please provide helpful, specific guidance for this workout situation.`

    if (!process.env.OPENAI_API_KEY) {
      // Fallback response when OpenAI is not configured
      return res.status(200).json({
        response: "I'm here to help with your workout! For form guidance, modifications, or motivation, please make sure your OpenAI API key is configured in the environment variables."
      })
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      max_tokens: 150,
      temperature: 0.7,
    })

    const response = completion.choices[0]?.message?.content || "I'm having trouble processing your request right now. Please try again."

    return res.status(200).json({
      response: response.trim()
    })

  } catch (error) {
    console.error('AI Assistant error:', error)
    
    // Provide helpful fallback responses
    const fallbackResponses = [
      "Great question! Focus on maintaining proper form and breathing steadily throughout the movement.",
      "You're doing great! Remember to engage your core and keep your movements controlled.",
      "Keep pushing through! If you need to modify the exercise, that's perfectly fine - listen to your body.",
      "Excellent work! Make sure you're feeling the exercise in the target muscle group.",
      "Stay strong! Remember that consistency is key to seeing progress."
    ]
    
    const randomResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)]
    
    return res.status(200).json({
      response: randomResponse
    })
  }
} 