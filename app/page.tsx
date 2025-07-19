'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import AIAssistant3D from '@/components/AIAssistant3D'

export default function Home() {
  const [currentFeature, setCurrentFeature] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 })

  const features = [
    {
      icon: "🤖",
      title: "AI-Powered Workouts",
      description: "Get personalized workouts created by advanced AI that adapts to your fitness level, goals, and available equipment.",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: "🎮",
      title: "Gamified Experience",
      description: "Earn XP, maintain streaks, and unlock achievements. Stay motivated with Duolingo-style progression and rewards.",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: "📊",
      title: "Smart Analytics",
      description: "Track your progress with detailed analytics, performance metrics, and insights that help you optimize your fitness journey.",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: "🎯",
      title: "Personal Goals",
      description: "Set and achieve your fitness goals with AI-guided recommendations and adaptive workout plans.",
      color: "from-orange-500 to-red-500"
    }
  ]

  useEffect(() => {
    setIsVisible(true)
    setWindowSize({
      width: window.innerWidth,
      height: window.innerHeight
    })
    
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length)
    }, 4000)
    
    return () => clearInterval(interval)
  }, [features.length])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden">
      {/* Animated background particles */}
      {windowSize.width > 0 && (
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full opacity-20"
              animate={{
                x: [0, Math.random() * windowSize.width],
                y: [0, Math.random() * windowSize.height],
                opacity: [0.2, 0.8, 0.2],
              }}
              transition={{
                duration: Math.random() * 10 + 10,
                repeat: Infinity,
                ease: "linear",
              }}
              style={{
                left: Math.random() * 100 + "%",
                top: Math.random() * 100 + "%",
              }}
            />
          ))}
        </div>
      )}

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 py-20">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: isVisible ? 1 : 0, x: isVisible ? 0 : -50 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-center lg:text-left"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="mb-6"
              >
                <span className="inline-block px-4 py-2 rounded-full bg-gradient-to-r from-green-500/20 to-blue-500/20 border border-green-500/30 text-green-400 text-sm font-medium mb-4">
                  🚀 AI-Powered Fitness Revolution
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 30 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="text-5xl lg:text-7xl font-bold mb-6 leading-tight"
              >
                <span className="bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
                  Meet Your
                </span>
                <br />
                <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
                  AI Fitness Coach
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="text-xl lg:text-2xl text-gray-300 mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0"
              >
                Transform your fitness journey with a personal AI assistant that creates 
                custom workouts, tracks your progress, and keeps you motivated with 
                gamified challenges.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
                transition={{ duration: 0.8, delay: 1 }}
                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
              >
                <Link href="/auth/signup">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-4 rounded-xl bg-gradient-to-r from-green-500 to-blue-600 text-white text-lg font-semibold shadow-2xl shadow-green-500/25 hover:shadow-green-500/40 transition-all duration-300"
                  >
                    🚀 Get Started Free
                  </motion.button>
                </Link>
                
                <Link href="/auth/login">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-4 rounded-xl border-2 border-green-500/50 text-green-400 text-lg font-semibold hover:bg-green-500/10 transition-all duration-300 backdrop-blur-sm"
                  >
                    🔐 Sign In
                  </motion.button>
                </Link>
              </motion.div>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
                transition={{ duration: 0.8, delay: 1.2 }}
                className="flex justify-center lg:justify-start gap-8 mt-12"
              >
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">10K+</div>
                  <div className="text-gray-400 text-sm">Active Users</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">500+</div>
                  <div className="text-gray-400 text-sm">Workouts</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">95%</div>
                  <div className="text-gray-400 text-sm">Success Rate</div>
                </div>
              </motion.div>
            </motion.div>

            {/* Right side - 3D AI Assistant */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: isVisible ? 1 : 0, x: isVisible ? 0 : 50 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="relative"
            >
              <div className="relative z-10">
                <AIAssistant3D />
              </div>
              
              {/* Floating elements around the 3D scene */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-10 left-10 w-16 h-16 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-full backdrop-blur-sm border border-green-500/30"
              />
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute bottom-20 right-10 w-12 h-12 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full backdrop-blur-sm border border-purple-500/30"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 relative">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
              Why Choose FitLingo?
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Experience the future of fitness with AI-powered personalization and gamified motivation
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
                className="relative group"
              >
                <div className={`p-8 rounded-2xl bg-gradient-to-br ${feature.color} bg-opacity-10 border border-white/10 backdrop-blur-sm hover:bg-opacity-20 transition-all duration-300`}>
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold mb-3 text-white">{feature.title}</h3>
                  <p className="text-gray-300 leading-relaxed">{feature.description}</p>
                </div>
                
                {/* Glow effect */}
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300 -z-10`} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 relative">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
              Ready to Transform Your Fitness?
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands of users who are already achieving their fitness goals with their personal AI coach.
            </p>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link href="/auth/signup">
                <button className="px-12 py-6 rounded-2xl bg-gradient-to-r from-green-500 to-blue-600 text-white text-xl font-bold shadow-2xl shadow-green-500/25 hover:shadow-green-500/40 transition-all duration-300">
                  🚀 Start Your Free Journey
                </button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
