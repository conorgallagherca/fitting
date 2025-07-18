'use client'

import { SessionProvider } from 'next-auth/react'
import ThemeProvider from './ThemeProvider'
import { Toaster } from 'react-hot-toast'

interface ProvidersProps {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <ThemeProvider>
        {children}
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'var(--background)',
              color: 'var(--foreground)',
              border: '1px solid var(--border)'
            }
          }}
        />
      </ThemeProvider>
    </SessionProvider>
  )
} 