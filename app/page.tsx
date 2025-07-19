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
      color: "bg-blue-500"
    },
    {
      icon: "🎮",
      title: "Gamified Experience",
      description: "Earn XP, maintain streaks, and unlock achievements. Stay motivated with Duolingo-style progression and rewards.",
      color: "bg-purple-500"
    },
    {
      icon: "📊",
      title: "Smart Analytics",
      description: "Track your progress with detailed analytics, performance metrics, and insights that help you optimize your fitness journey.",
      color: "bg-green-500"
    },
    {
      icon: "🎯",
      title: "Personal Goals",
      description: "Set and achieve your fitness goals with AI-guided recommendations and adaptive workout plans.",
      color: "bg-orange-500"
    }
  ]

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Fitness Enthusiast",
      avatar: "👩‍💼",
      content: "FitLingo completely transformed my fitness routine. The AI coach understands exactly what I need and keeps me motivated with fun challenges!",
      rating: 5
    },
    {
      name: "Marcus Rodriguez",
      role: "Busy Professional",
      avatar: "👨‍💻",
      content: "As someone with a hectic schedule, FitLingo's quick, effective workouts are perfect. The progress tracking keeps me accountable.",
      rating: 5
    },
    {
      name: "Emma Thompson",
      role: "Yoga Instructor",
      avatar: "🧘‍♀️",
      content: "I love how FitLingo adapts to my fitness level and available equipment. The gamification makes working out actually fun!",
      rating: 5
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 overflow-hidden">
      {/* Animated background particles */}
      {windowSize.width > 0 && (
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-blue-400 dark:bg-blue-300 rounded-full opacity-30"
              animate={{
                x: [0, Math.random() * windowSize.width],
                y: [0, Math.random() * windowSize.height],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: Math.random() * 15 + 15,
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
                <span className="inline-block px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300 text-sm font-medium mb-4">
                  🚀 AI-Powered Fitness Revolution
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 30 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="text-5xl lg:text-7xl font-bold mb-6 leading-tight"
              >
                <span className="text-slate-800 dark:text-white">
                  Meet Your
                </span>
                <br />
                <span className="text-blue-600 dark:text-blue-400">
                  AI Fitness Coach
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="text-xl lg:text-2xl text-slate-600 dark:text-slate-300 mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0"
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
                    className="px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold shadow-lg transition-all duration-300"
                  >
                    🚀 Get Started Free
                  </motion.button>
                </Link>
                
                <Link href="/auth/login">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-4 rounded-xl border-2 border-blue-600 text-blue-600 dark:text-blue-400 text-lg font-semibold hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-300"
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
                  <div className="text-2xl font-bold text-slate-800 dark:text-white">10K+</div>
                  <div className="text-slate-600 dark:text-slate-400 text-sm">Active Users</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-800 dark:text-white">500+</div>
                  <div className="text-slate-600 dark:text-slate-400 text-sm">Workouts</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-800 dark:text-white">95%</div>
                  <div className="text-slate-600 dark:text-slate-400 text-sm">Success Rate</div>
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
                className="absolute top-10 left-10 w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full backdrop-blur-sm border border-blue-200 dark:border-blue-700"
              />
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute bottom-20 right-10 w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full backdrop-blur-sm border border-purple-200 dark:border-purple-700"
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
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-slate-800 dark:text-white">
              Why Choose FitLingo?
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
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
                <div className="p-8 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className={`w-16 h-16 rounded-xl ${feature.color} flex items-center justify-center text-2xl mb-4`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-white">{feature.title}</h3>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 bg-white dark:bg-slate-800">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-slate-800 dark:text-white">
              What Our Users Say
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
              Join thousands of satisfied users who have transformed their fitness journey
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="bg-slate-50 dark:bg-slate-700 p-8 rounded-2xl border border-slate-200 dark:border-slate-600"
              >
                {/* Rating */}
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i} className="text-yellow-400 text-xl">⭐</span>
                  ))}
                </div>
                
                {/* Content */}
                <p className="text-slate-700 dark:text-slate-300 mb-6 leading-relaxed italic">
                  "{testimonial.content}"
                </p>
                
                {/* Author */}
                <div className="flex items-center">
                  <div className="text-3xl mr-4">{testimonial.avatar}</div>
                  <div>
                    <div className="font-semibold text-slate-800 dark:text-white">{testimonial.name}</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">{testimonial.role}</div>
                  </div>
                </div>
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
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-slate-800 dark:text-white">
              Ready to Transform Your Fitness?
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 mb-8 max-w-2xl mx-auto">
              Join thousands of users who are already achieving their fitness goals with their personal AI coach.
            </p>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link href="/auth/signup">
                <button className="px-12 py-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xl font-bold shadow-lg transition-all duration-300">
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
