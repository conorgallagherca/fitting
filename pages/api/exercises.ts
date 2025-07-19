import { NextApiRequest, NextApiResponse } from 'next'
import { exercises, filterExercises, getRandomExercises } from '@/lib/exercises'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { 
        category, 
        muscleGroups, 
        equipment, 
        difficulty, 
        limit, 
        random,
        search 
      } = req.query

      let filteredExercises = exercises

      // Apply filters if provided
      if (category || muscleGroups || equipment || difficulty) {
        const filters: any = {}
        if (category) filters.category = category as string
        if (muscleGroups) filters.muscleGroups = (muscleGroups as string).split(',')
        if (equipment) filters.equipment = (equipment as string).split(',')
        if (difficulty) filters.difficulty = difficulty as string

        filteredExercises = filterExercises(filters)
      }

      // Apply search filter
      if (search) {
        const searchTerm = search as string
        filteredExercises = filteredExercises.filter(exercise =>
          exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          exercise.muscleGroups.some(mg => mg.toLowerCase().includes(searchTerm.toLowerCase())) ||
          exercise.instructions.toLowerCase().includes(searchTerm.toLowerCase())
        )
      }

      // Get random exercises if requested
      if (random === 'true') {
        const count = limit ? parseInt(limit as string) : 10
        filteredExercises = getRandomExercises(count, req.query)
      }

      // Apply limit if provided
      if (limit && random !== 'true') {
        const limitNum = parseInt(limit as string)
        filteredExercises = filteredExercises.slice(0, limitNum)
      }

      return res.status(200).json({
        success: true,
        data: filteredExercises,
        count: filteredExercises.length,
        total: exercises.length
      })

    } catch (error) {
      console.error('Error fetching exercises:', error)
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch exercises'
      })
    }
  }

  return res.status(405).json({
    success: false,
    error: 'Method not allowed'
  })
} 