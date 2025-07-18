'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useTheme } from 'next-themes'
import { useSession, signOut } from 'next-auth/react'

/**
 * Navigation Bar Component
 * 
 * This component provides the main navigation for the FitLingo app.
 * Features include:
 * - Responsive design with mobile menu
 * - Theme toggle integration
 * - Authentication-aware navigation
 * - Modern glassmorphism styling
 * 
 * Modern Design Trends:
 * - Sticky navigation with backdrop blur
 * - Smooth animations and micro-interactions
 * - Gradient text for branding
 * - Responsive mobile-first design
 * 
 * Dependencies:
 * - next-themes for theme management
 * - next-auth for authentication state
 * - Tailwind CSS for styling
 */
export default function Navbar() {
  const [mounted, setMounted] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const { data: session, status } = useSession()

  // Ensure component is mounted before showing theme toggle
  // Prevents hydration mismatches
  useEffect(() => {
    setMounted(true)
  }, [])

  // Handle user sign out with confirmation
  const handleSignOut = async () => {
    if (confirm('Are you sure you want to sign out?')) {
      await signOut({ callbackUrl: '/' })
    }
  }

  // Close mobile menu when clicking outside or on navigation
  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  // Navigation links for authenticated users
  const navigationLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/workouts', label: 'Workouts', icon: '💪' },
    { href: '/history', label: 'History', icon: '📈' },
    { href: '/profile', label: 'Profile', icon: '👤' },
    { href: '/settings', label: 'Settings', icon: '⚙️' },
  ]

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          
          {/* Logo and Brand */}
          <Link 
            href="/" 
            className="flex items-center space-x-2 font-bold text-xl bg-gradient-to-r from-green-500 to-blue-600 bg-clip-text text-transparent hover:from-green-600 hover:to-blue-700 transition-all duration-200"
            onClick={closeMobileMenu}
          >
            <span className="text-2xl">🏋️‍♂️</span>
            <span>FitLingo</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {status === 'authenticated' && (
              <>
                {navigationLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-center space-x-1 text-foreground/80 hover:text-foreground transition-colors duration-200 hover:scale-105"
                  >
                    <span className="text-sm">{link.icon}</span>
                    <span>{link.label}</span>
                  </Link>
                ))}
              </>
            )}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            
            {/* Theme Toggle */}
            {mounted && (
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2 rounded-lg bg-background hover:bg-accent transition-colors duration-200 hover:scale-110"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? '☀️' : '🌙'}
              </button>
            )}

            {/* Authentication Actions */}
            {status === 'loading' ? (
              <div className="w-8 h-8 rounded-full bg-accent animate-pulse" />
            ) : session ? (
              <div className="flex items-center space-x-2">
                {/* Mobile Menu Button */}
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="md:hidden p-2 rounded-lg hover:bg-accent transition-colors"
                  aria-label="Toggle mobile menu"
                >
                  <div className="w-5 h-5 flex flex-col justify-center space-y-1">
                    <div className={`h-0.5 w-full bg-current transition-all duration-200 ${isMobileMenuOpen ? 'rotate-45 translate-y-1' : ''}`} />
                    <div className={`h-0.5 w-full bg-current transition-all duration-200 ${isMobileMenuOpen ? 'opacity-0' : ''}`} />
                    <div className={`h-0.5 w-full bg-current transition-all duration-200 ${isMobileMenuOpen ? '-rotate-45 -translate-y-1' : ''}`} />
                  </div>
                </button>

                {/* User Avatar/Info */}
                <div className="hidden md:flex items-center space-x-3">
                  {session.user?.image ? (
                    <img
                      src={session.user.image}
                      alt={session.user.name || 'User'}
                      className="w-8 h-8 rounded-full border-2 border-border"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-blue-600 flex items-center justify-center text-white text-sm font-medium">
                      {session.user?.name?.[0] || session.user?.email?.[0] || 'U'}
                    </div>
                  )}
                  
                  <button
                    onClick={handleSignOut}
                    className="px-4 py-2 rounded-lg bg-red-100 hover:bg-red-200 dark:bg-red-900/20 dark:hover:bg-red-900/30 text-red-700 dark:text-red-300 text-sm font-medium transition-colors duration-200"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              /* Guest Actions */
              <div className="flex items-center space-x-2">
                <Link
                  href="/auth/login"
                  className="px-4 py-2 text-foreground/80 hover:text-foreground transition-colors duration-200"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-green-500 to-blue-600 text-white hover:from-green-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-105 font-medium"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && session && (
          <div className="md:hidden absolute top-16 left-0 right-0 bg-background/95 backdrop-blur border-b border-border shadow-lg">
            <div className="container mx-auto px-4 py-4">
              <div className="flex flex-col space-y-4">
                
                {/* Mobile Navigation Links */}
                {navigationLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={closeMobileMenu}
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-accent transition-colors duration-200"
                  >
                    <span className="text-lg">{link.icon}</span>
                    <span className="font-medium">{link.label}</span>
                  </Link>
                ))}

                {/* Mobile User Info */}
                <div className="border-t border-border pt-4 mt-4">
                  <div className="flex items-center space-x-3 mb-4">
                    {session.user?.image ? (
                      <img
                        src={session.user.image}
                        alt={session.user.name || 'User'}
                        className="w-10 h-10 rounded-full border-2 border-border"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-blue-600 flex items-center justify-center text-white font-medium">
                        {session.user?.name?.[0] || session.user?.email?.[0] || 'U'}
                      </div>
                    )}
                    <div>
                      <div className="font-medium">{session.user?.name || 'User'}</div>
                      <div className="text-sm text-muted-foreground">{session.user?.email}</div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => {
                      closeMobileMenu()
                      handleSignOut()
                    }}
                    className="w-full px-4 py-3 rounded-lg bg-red-100 hover:bg-red-200 dark:bg-red-900/20 dark:hover:bg-red-900/30 text-red-700 dark:text-red-300 font-medium transition-colors duration-200"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

/*
Navbar Component Architecture Notes:

1. RESPONSIVE DESIGN:
   - Mobile-first approach with hamburger menu
   - Proper breakpoints using Tailwind's md: prefix
   - Touch-friendly button sizes on mobile
   - Smooth animations for mobile menu toggle

2. ACCESSIBILITY:
   - Proper ARIA labels for interactive elements
   - Keyboard navigation support
   - Screen reader friendly structure
   - High contrast hover states

3. AUTHENTICATION INTEGRATION:
   - Conditional rendering based on auth status
   - User avatar with fallback initials
   - Secure sign-out with confirmation
   - Loading states during auth transitions

4. MODERN DESIGN:
   - Glassmorphism with backdrop blur
   - Gradient branding elements
   - Micro-interactions with hover effects
   - Consistent spacing and typography

5. PERFORMANCE:
   - Mounted state prevents hydration issues
   - Optimized re-renders with proper state management
   - Efficient event handling
   - Minimal DOM manipulation

The navbar provides intuitive navigation while maintaining
the app's modern aesthetic and ensuring accessibility across
all device types and interaction methods.
*/ 