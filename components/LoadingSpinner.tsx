import React from 'react'
import { cn } from '@/lib/utils'

/**
 * Loading Spinner Component
 * 
 * A reusable loading indicator component with multiple variants and sizes.
 * 
 * Modern Design Principles:
 * - Smooth animations with CSS transforms
 * - Accessible with proper ARIA labels
 * - Customizable sizes and colors
 * - Subtle but visible loading states
 * 
 * This component is used throughout the app for:
 * - Page loading states
 * - Button loading states
 * - Data fetching indicators
 * - Form submission feedback
 */

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'spinner' | 'dots' | 'pulse' | 'bars'
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error'
  className?: string
  label?: string
}

export default function LoadingSpinner({ 
  size = 'md', 
  variant = 'spinner',
  color = 'primary',
  className,
  label = 'Loading...'
}: LoadingSpinnerProps) {
  
  // Size mappings for different spinner variants
  const sizeClasses = {
    sm: {
      spinner: 'w-4 h-4',
      dots: 'space-x-1',
      pulse: 'w-8 h-2',
      bars: 'h-6'
    },
    md: {
      spinner: 'w-6 h-6',
      dots: 'space-x-1.5',
      pulse: 'w-12 h-3',
      bars: 'h-8'
    },
    lg: {
      spinner: 'w-8 h-8',
      dots: 'space-x-2',
      pulse: 'w-16 h-4',
      bars: 'h-10'
    },
    xl: {
      spinner: 'w-12 h-12',
      dots: 'space-x-3',
      pulse: 'w-20 h-5',
      bars: 'h-12'
    }
  }

  // Color mappings with theme support
  const colorClasses = {
    primary: 'text-green-500 border-green-500',
    secondary: 'text-blue-500 border-blue-500',
    success: 'text-emerald-500 border-emerald-500',
    warning: 'text-yellow-500 border-yellow-500',
    error: 'text-red-500 border-red-500'
  }

  // Render different spinner variants
  const renderSpinner = () => {
    switch (variant) {
      case 'spinner':
        return (
          <div
            className={cn(
              'animate-spin rounded-full border-2 border-transparent border-t-current',
              sizeClasses[size].spinner,
              colorClasses[color],
              className
            )}
            role="status"
            aria-label={label}
          >
            <span className="sr-only">{label}</span>
          </div>
        )

      case 'dots':
        return (
          <div 
            className={cn('flex items-center', sizeClasses[size].dots, className)}
            role="status"
            aria-label={label}
          >
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={cn(
                  'w-2 h-2 rounded-full animate-pulse',
                  colorClasses[color].split(' ')[0].replace('text-', 'bg-')
                )}
                style={{
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: '1s'
                }}
              />
            ))}
            <span className="sr-only">{label}</span>
          </div>
        )

      case 'pulse':
        return (
          <div
            className={cn(
              'animate-pulse rounded-full',
              sizeClasses[size].pulse,
              colorClasses[color].split(' ')[0].replace('text-', 'bg-'),
              className
            )}
            role="status"
            aria-label={label}
          >
            <span className="sr-only">{label}</span>
          </div>
        )

      case 'bars':
        return (
          <div 
            className={cn('flex items-end space-x-1', sizeClasses[size].bars, className)}
            role="status"
            aria-label={label}
          >
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={cn(
                  'w-1 animate-pulse rounded-sm',
                  colorClasses[color].split(' ')[0].replace('text-', 'bg-')
                )}
                style={{
                  height: `${25 + (i % 2) * 50}%`,
                  animationDelay: `${i * 0.15}s`,
                  animationDuration: '1.2s'
                }}
              />
            ))}
            <span className="sr-only">{label}</span>
          </div>
        )

      default:
        return null
    }
  }

  return renderSpinner()
}

/**
 * Page Loading Component
 * 
 * Full-screen loading overlay for page transitions
 */
export function PageLoading({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-50/50 to-blue-50/50 dark:from-green-950/20 dark:to-blue-950/20">
      <LoadingSpinner size="xl" variant="spinner" />
      <p className="mt-4 text-muted-foreground text-sm">{message}</p>
    </div>
  )
}

/**
 * Button Loading Component
 * 
 * Inline loading indicator for buttons and small elements
 */
export function ButtonLoading({ size = 'sm' }: { size?: 'sm' | 'md' }) {
  return (
    <LoadingSpinner 
      size={size} 
      variant="spinner" 
      color="primary"
      className="text-current"
    />
  )
}

/**
 * Card Loading Component
 * 
 * Loading state for card components with skeleton effect
 */
export function CardLoading({ className }: { className?: string }) {
  return (
    <div className={cn('bg-card/50 backdrop-blur border rounded-xl p-6 animate-pulse', className)}>
      <div className="space-y-4">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
        </div>
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
      </div>
    </div>
  )
}

/**
 * Data Loading Component
 * 
 * Loading state for data tables and lists
 */
export function DataLoading({ rows = 3, className }: { rows?: number; className?: string }) {
  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="flex space-x-4">
            <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
            <div className="flex-1 space-y-2 py-1">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

/*
Loading Components Architecture Notes:

1. ACCESSIBILITY:
   - All loading states include proper ARIA labels
   - Screen reader announcements for loading status
   - Semantic HTML with role="status"
   - Hidden text for assistive technology

2. PERFORMANCE:
   - CSS-only animations for smooth performance
   - Minimal DOM nodes for efficiency
   - Hardware-accelerated transforms
   - Optimized animation durations

3. DESIGN CONSISTENCY:
   - Matches app color scheme and theme
   - Consistent sizing system across variants
   - Respects dark mode preferences
   - Subtle but noticeable animations

4. FLEXIBILITY:
   - Multiple size variants for different contexts
   - Color theming for different states
   - Customizable with className prop
   - Specialized components for common use cases

5. MODERN PATTERNS:
   - Skeleton loading for better perceived performance
   - Pulse animations for smooth visual feedback
   - Contextual loading states (button, card, page)
   - Progressive disclosure of loading information

These components provide consistent loading feedback throughout
the application while maintaining accessibility and performance.
*/ 