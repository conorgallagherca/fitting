import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import { Providers } from '@/components/Providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'FitLingo - Your AI Fitness Companion',
    template: '%s | FitLingo'
  },
  description: 'Transform your fitness journey with AI-powered workouts and Duolingo-style motivation. Build healthy habits, track progress, and achieve your goals.',
  keywords: ['fitness', 'workout', 'AI', 'health', 'exercise', 'gamification', 'habits'],
  authors: [{ name: 'FitLingo Team' }],
  creator: 'FitLingo',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://fitlingo.vercel.app',
    title: 'FitLingo - Your AI Fitness Companion',
    description: 'Transform your fitness journey with AI-powered workouts and Duolingo-style motivation.',
    siteName: 'FitLingo',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'FitLingo - AI Fitness Companion'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FitLingo - Your AI Fitness Companion',
    description: 'Transform your fitness journey with AI-powered workouts and Duolingo-style motivation.',
    images: ['/og-image.png'],
    creator: '@fitlingo'
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
            <Navbar />
            <main className="container mx-auto px-4 py-8">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  )
}
