'use client'

import React, { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'
import { ExerciseProgress } from '@/lib/progress-store'
import { cn } from '@/lib/utils'
import { TrendingUp, Trophy, Target, Calendar, Zap } from 'lucide-react'

interface ExerciseProgressChartProps {
  progress: ExerciseProgress
  className?: string
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6']

export default function ExerciseProgressChart({ progress, className }: ExerciseProgressChartProps) {
  const [activeTab, setActiveTab] = useState<'weight' | 'volume' | 'overview'>('overview')

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    })
  }

  const formatWeight = (weight: number) => `${weight} lbs`
  const formatVolume = (volume: number) => `${volume} lbs`
  const formatReps = (reps: number) => `${reps} reps`

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-semibold">{formatDate(label)}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Personal Bests */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Max Weight</p>
              <p className="text-2xl font-bold">{formatWeight(progress.personalBests.maxWeight)}</p>
            </div>
            <Trophy className="w-8 h-8 opacity-80" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Max Reps</p>
              <p className="text-2xl font-bold">{formatReps(progress.personalBests.maxReps)}</p>
            </div>
            <Target className="w-8 h-8 opacity-80" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Max Volume</p>
              <p className="text-2xl font-bold">{formatVolume(progress.personalBests.maxVolume)}</p>
            </div>
            <Zap className="w-8 h-8 opacity-80" />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Total Sessions</p>
              <p className="text-2xl font-bold">{progress.history.length}</p>
            </div>
            <Calendar className="w-8 h-8 opacity-80" />
          </div>
        </div>
      </div>

      {/* Recent Performance */}
      <div className="bg-card/50 backdrop-blur border rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Recent Performance
        </h3>
        
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={progress.trends.volumeProgression.slice(-10)}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                tickFormatter={formatDate}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="volume" 
                stroke="#10b981" 
                strokeWidth={3}
                dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: '#059669' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Session Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card/50 backdrop-blur border rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Weight Progression</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={progress.trends.weightProgression.slice(-8)}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 10 }}
                  tickFormatter={formatDate}
                />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="weight" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card/50 backdrop-blur border rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Session Frequency</h3>
          <div className="h-48 flex items-center justify-center">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">
                {Math.round(progress.history.length / Math.max(1, (new Date().getTime() - new Date(progress.history[progress.history.length - 1]?.date || Date.now()).getTime()) / (1000 * 60 * 60 * 24 * 7)) * 10) / 10}
              </div>
              <p className="text-muted-foreground">sessions per week</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderWeightChart = () => (
    <div className="space-y-6">
      <div className="bg-card/50 backdrop-blur border rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">Weight Progression Over Time</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={progress.trends.weightProgression}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                tickFormatter={formatDate}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="weight" 
                stroke="#3b82f6" 
                strokeWidth={3}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: '#2563eb' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )

  const renderVolumeChart = () => (
    <div className="space-y-6">
      <div className="bg-card/50 backdrop-blur border rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">Volume Progression Over Time</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={progress.trends.volumeProgression}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                tickFormatter={formatDate}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="volume" 
                stroke="#10b981" 
                strokeWidth={3}
                dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: '#059669' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )

  return (
    <div className={cn("space-y-6", className)}>
      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-muted/50 rounded-lg p-1">
        <button
          onClick={() => setActiveTab('overview')}
          className={cn(
            "flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors",
            activeTab === 'overview'
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('weight')}
          className={cn(
            "flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors",
            activeTab === 'weight'
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          Weight
        </button>
        <button
          onClick={() => setActiveTab('volume')}
          className={cn(
            "flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors",
            activeTab === 'volume'
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          Volume
        </button>
      </div>

      {/* Chart Content */}
      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'weight' && renderWeightChart()}
      {activeTab === 'volume' && renderVolumeChart()}
    </div>
  )
} 