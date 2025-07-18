'use client'

import React, { useState } from 'react'
import { Badge } from '@/lib/gamification-store'
import { cn } from '@/lib/utils'

interface BadgeDisplayProps {
  badges: Badge[]
  size?: 'small' | 'medium' | 'large'
  maxDisplay?: number
  className?: string
}

export default function BadgeDisplay({ badges, size = 'medium', maxDisplay, className }: BadgeDisplayProps) {
  const [hoveredBadge, setHoveredBadge] = useState<string | null>(null)

  const unlockedBadges = badges.filter(b => b.unlocked)
  const lockedBadges = badges.filter(b => !b.unlocked)
  const displayBadges = [...unlockedBadges, ...lockedBadges].slice(0, maxDisplay)

  const sizeClasses = {
    small: 'w-8 h-8 text-lg',
    medium: 'w-12 h-12 text-2xl',
    large: 'w-16 h-16 text-3xl'
  }

  const rarityColors = {
    common: 'bg-gray-100 dark:bg-gray-700 border-gray-300',
    rare: 'bg-blue-100 dark:bg-blue-900/30 border-blue-300',
    epic: 'bg-purple-100 dark:bg-purple-900/30 border-purple-300',
    legendary: 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300'
  }

  return (
    <div className={cn('relative', className)}>
      {/* Progress indicator */}
      <div className="mb-4 text-center">
        <div className="text-sm text-muted-foreground">
          {unlockedBadges.length} of {badges.length} badges earned
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
          <div 
            className="bg-gradient-to-r from-green-500 to-blue-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${(unlockedBadges.length / badges.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Badge grid */}
      <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
        {displayBadges.map((badge) => (
          <div
            key={badge.id}
            className="relative group"
            onMouseEnter={() => setHoveredBadge(badge.id)}
            onMouseLeave={() => setHoveredBadge(null)}
          >
            <div
              className={cn(
                'flex items-center justify-center rounded-xl border-2 transition-all duration-200 cursor-pointer',
                sizeClasses[size],
                badge.unlocked 
                  ? rarityColors[badge.rarity]
                  : 'bg-gray-50 dark:bg-gray-800 border-gray-200 grayscale opacity-50',
                'hover:scale-110 hover:shadow-lg'
              )}
            >
              <span className={badge.unlocked ? 'scale-100' : 'scale-75'}>
                {badge.icon}
              </span>
            </div>

            {/* Earned indicator */}
            {badge.unlocked && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
            )}

            {/* Tooltip */}
            {hoveredBadge === badge.id && (
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-10">
                <div className="bg-black text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap">
                  <div className="font-semibold">{badge.name}</div>
                  <div className="text-gray-300">{badge.description}</div>
                  {badge.unlocked && badge.unlockedAt && (
                    <div className="text-gray-400 text-xs mt-1">
                      Earned {new Date(badge.unlockedAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {maxDisplay && badges.length > maxDisplay && (
        <div className="text-center mt-4 text-sm text-muted-foreground">
          +{badges.length - maxDisplay} more badges
        </div>
      )}
    </div>
  )
}

// Badge celebration modal
interface BadgeCelebrationModalProps {
  badge: Badge | null
  isOpen: boolean
  onClose: () => void
}

export function BadgeCelebrationModal({ badge, isOpen, onClose }: BadgeCelebrationModalProps) {
  if (!isOpen || !badge) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
        <div className="text-6xl mb-4 animate-bounce">{badge.icon}</div>
        <h2 className="text-2xl font-bold text-green-600 mb-2">Badge Unlocked! 🎉</h2>
        <h3 className="text-xl font-semibold mb-2">{badge.name}</h3>
        <p className="text-muted-foreground mb-6">{badge.description}</p>
        <button
          onClick={onClose}
          className="px-6 py-2 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-lg font-medium hover:from-green-600 hover:to-blue-700 transition-all"
        >
          Awesome! 🎯
        </button>
      </div>
    </div>
  )
} 