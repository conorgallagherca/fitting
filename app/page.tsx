import React from 'react'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative px-4 py-20 md:py-32 bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-green-500 to-blue-600 bg-clip-text text-transparent">
              Your AI Fitness Companion
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed">
              Transform your fitness journey with AI-powered workouts, gamified progress tracking, 
              and personalized coaching that adapts to your goals.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/auth/signup"
                className="px-8 py-4 rounded-lg bg-gradient-to-r from-green-500 to-blue-600 text-white text-lg font-semibold hover:from-green-600 hover:to-blue-700 transition-all transform hover:scale-105"
              >
                Start Your Journey
              </Link>
              <Link
                href="/demo"
                className="px-8 py-4 rounded-lg border border-green-500 text-green-600 dark:text-green-400 text-lg font-semibold hover:bg-green-50 dark:hover:bg-green-950/20 transition-all"
              >
                See Demo
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Why Choose FitLingo?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* AI-Powered Workouts */}
            <div className="p-6 rounded-lg border bg-card text-card-foreground shadow-sm">
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="text-xl font-semibold mb-3">AI-Generated Workouts</h3>
              <p className="text-muted-foreground">
                Get personalized workouts created by advanced AI that adapts to your fitness level, 
                goals, and available equipment.
              </p>
            </div>

            {/* Gamification */}
            <div className="p-6 rounded-lg border bg-card text-card-foreground shadow-sm">
              <div className="text-4xl mb-4">🎮</div>
              <h3 className="text-xl font-semibold mb-3">Gamified Experience</h3>
              <p className="text-muted-foreground">
                Earn XP, maintain streaks, and unlock achievements. Stay motivated with 
                Duolingo-style progression and rewards.
              </p>
            </div>

            {/* Progress Tracking */}
            <div className="p-6 rounded-lg border bg-card text-card-foreground shadow-sm">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-semibold mb-3">Smart Analytics</h3>
              <p className="text-muted-foreground">
                Track your progress with detailed analytics, performance metrics, and 
                insights that help you optimize your fitness journey.
              </p>
            </div>

            {/* Personalization */}
            <div className="p-6 rounded-lg border bg-card text-card-foreground shadow-sm">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold mb-3">Personal Goals</h3>
              <p className="text-muted-foreground">
                Set and achieve your fitness goals with AI-guided recommendations 
                and adaptive workout plans.
              </p>
            </div>

            {/* Community */}
            <div className="p-6 rounded-lg border bg-card text-card-foreground shadow-sm">
              <div className="text-4xl mb-4">👥</div>
              <h3 className="text-xl font-semibold mb-3">Social Challenges</h3>
              <p className="text-muted-foreground">
                Join challenges, compete with friends, and stay motivated through 
                community support and friendly competition.
              </p>
            </div>

            {/* Equipment Flexibility */}
            <div className="p-6 rounded-lg border bg-card text-card-foreground shadow-sm">
              <div className="text-4xl mb-4">🏠</div>
              <h3 className="text-xl font-semibold mb-3">Any Equipment</h3>
              <p className="text-muted-foreground">
                From bodyweight exercises to full gym setups, get workouts tailored 
                to whatever equipment you have available.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-green-500/10 to-blue-500/10">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Transform Your Fitness?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of users who are already achieving their fitness goals with FitLingo.
          </p>
          <Link
            href="/auth/signup"
            className="inline-block px-8 py-4 rounded-lg bg-gradient-to-r from-green-500 to-blue-600 text-white text-lg font-semibold hover:from-green-600 hover:to-blue-700 transition-all transform hover:scale-105"
          >
            Get Started Free
          </Link>
        </div>
      </section>
    </div>
  )
}
