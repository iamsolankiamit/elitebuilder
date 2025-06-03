'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Code, 
  Brain, 
  Smartphone, 
  BarChart, 
  Server, 
  Zap, 
  Crown, 
  Trophy, 
  Medal,
  Star,
  TrendingUp
} from 'lucide-react'
import { 
  LeaderboardResponse, 
  LeaderboardEntry, 
  LeaderboardCategory, 
  LeaderboardPeriod,
  SortBy 
} from '@/lib/types'
import { leaderboardApi } from '@/lib/api'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import Link from 'next/link'

const categoryConfig = {
  [LeaderboardCategory.OVERALL]: { 
    icon: Crown, 
    label: 'Overall', 
    description: 'Top builders across all categories',
    color: 'text-yellow-500'
  },
  [LeaderboardCategory.AI_ML]: { 
    icon: Brain, 
    label: 'AI/ML', 
    description: 'Machine learning and AI specialists',
    color: 'text-purple-500'
  },
  [LeaderboardCategory.WEB_DEV]: { 
    icon: Code, 
    label: 'Web Dev', 
    description: 'Frontend and backend web developers',
    color: 'text-blue-500'
  },
  [LeaderboardCategory.MOBILE]: { 
    icon: Smartphone, 
    label: 'Mobile', 
    description: 'iOS and Android app developers',
    color: 'text-green-500'
  },
  [LeaderboardCategory.DATA_SCIENCE]: { 
    icon: BarChart, 
    label: 'Data Science', 
    description: 'Data analysts and scientists',
    color: 'text-orange-500'
  },
  [LeaderboardCategory.DEVOPS]: { 
    icon: Server, 
    label: 'DevOps', 
    description: 'Infrastructure and deployment experts',
    color: 'text-red-500'
  },
  [LeaderboardCategory.BLOCKCHAIN]: { 
    icon: Zap, 
    label: 'Blockchain', 
    description: 'Crypto and blockchain developers',
    color: 'text-amber-500'
  },
}

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1:
      return <Crown className="h-6 w-6 text-yellow-500" />
    case 2:
      return <Trophy className="h-6 w-6 text-gray-400" />
    case 3:
      return <Medal className="h-6 w-6 text-amber-600" />
    default:
      return <span className="text-lg font-bold text-foreground">#{rank}</span>
  }
}

const formatScore = (score: number) => {
  return new Intl.NumberFormat().format(Math.round(score))
}

const formatPercentage = (value: number) => {
  return `${(value * 100).toFixed(1)}%`
}

export default function CategoriesPage() {
  const [leaderboards, setLeaderboards] = useState<Record<LeaderboardCategory, LeaderboardResponse | null>>({
    [LeaderboardCategory.OVERALL]: null,
    [LeaderboardCategory.AI_ML]: null,
    [LeaderboardCategory.WEB_DEV]: null,
    [LeaderboardCategory.MOBILE]: null,
    [LeaderboardCategory.DATA_SCIENCE]: null,
    [LeaderboardCategory.DEVOPS]: null,
    [LeaderboardCategory.BLOCKCHAIN]: null,
  })
  const [loading, setLoading] = useState<Record<LeaderboardCategory, boolean>>({
    [LeaderboardCategory.OVERALL]: true,
    [LeaderboardCategory.AI_ML]: false,
    [LeaderboardCategory.WEB_DEV]: false,
    [LeaderboardCategory.MOBILE]: false,
    [LeaderboardCategory.DATA_SCIENCE]: false,
    [LeaderboardCategory.DEVOPS]: false,
    [LeaderboardCategory.BLOCKCHAIN]: false,
  })
  const [error, setError] = useState<Record<LeaderboardCategory, string | null>>({
    [LeaderboardCategory.OVERALL]: null,
    [LeaderboardCategory.AI_ML]: null,
    [LeaderboardCategory.WEB_DEV]: null,
    [LeaderboardCategory.MOBILE]: null,
    [LeaderboardCategory.DATA_SCIENCE]: null,
    [LeaderboardCategory.DEVOPS]: null,
    [LeaderboardCategory.BLOCKCHAIN]: null,
  })
  const [activeCategory, setActiveCategory] = useState<LeaderboardCategory>(LeaderboardCategory.OVERALL)
  const [period, setPeriod] = useState<LeaderboardPeriod>(LeaderboardPeriod.ALL_TIME)
  const [sortBy, setSortBy] = useState<SortBy>(SortBy.CAREER_SCORE)

  const fetchLeaderboard = async (category: LeaderboardCategory) => {
    try {
      setLoading(prev => ({ ...prev, [category]: true }))
      setError(prev => ({ ...prev, [category]: null }))
      
      const response = await leaderboardApi.getCategoryLeaderboard(category, {
        page: 1,
        limit: 20,
        period,
        sortBy,
      })
      
      setLeaderboards(prev => ({ ...prev, [category]: response }))
    } catch (err: any) {
      setError(prev => ({ 
        ...prev, 
        [category]: err.response?.data?.message || 'Failed to fetch leaderboard' 
      }))
    } finally {
      setLoading(prev => ({ ...prev, [category]: false }))
    }
  }

  useEffect(() => {
    if (!leaderboards[activeCategory]) {
      fetchLeaderboard(activeCategory)
    }
  }, [activeCategory, period, sortBy])

  const handleCategoryChange = (category: LeaderboardCategory) => {
    setActiveCategory(category)
    if (!leaderboards[category]) {
      fetchLeaderboard(category)
    }
  }

  const LeaderboardEntry = ({ entry, index }: { entry: LeaderboardEntry; index: number }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`p-4 rounded-lg border transition-all hover:shadow-lg ${
        entry.rank <= 3 ? 'bg-gradient-to-r from-yellow-50/10 to-amber-50/10 border-yellow-200/30 dark:from-yellow-900/20 dark:to-amber-900/20 dark:border-yellow-700/30' : 'bg-card hover:bg-muted/50 border-border'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex-shrink-0">
            {getRankIcon(entry.rank)}
          </div>
          
          <div className="flex items-center space-x-3">
            {entry.user.avatar ? (
              <img
                src={entry.user.avatar}
                alt={entry.user.username}
                className="h-10 w-10 rounded-full object-cover border-2 border-border"
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold border border-border">
                {entry.user.username.charAt(0).toUpperCase()}
              </div>
            )}
            
            <div>
              <h3 className="font-semibold text-foreground">
                {entry.user.name || entry.user.username}
              </h3>
              <p className="text-sm text-muted-foreground">
                @{entry.user.username}
              </p>
            </div>
          </div>
        </div>
        
        <div className="text-right">
          <div className="flex items-center space-x-4">
            <div>
              <p className="text-xl font-bold text-primary">
                {formatScore(entry.careerScore)}
              </p>
              <p className="text-xs text-muted-foreground">Score</p>
            </div>
            
            <div className="text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-3 w-3" />
                <span className="text-foreground">{entry.submissionCount}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )

  const CategoryLeaderboard = ({ category }: { category: LeaderboardCategory }) => {
    const leaderboard = leaderboards[category]
    const isLoading = loading[category]
    const errorMsg = error[category]

    if (isLoading) {
      return (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      )
    }

    if (errorMsg) {
      return (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-red-500 mb-4">{errorMsg}</p>
            <Button onClick={() => fetchLeaderboard(category)}>Try Again</Button>
          </CardContent>
        </Card>
      )
    }

    if (!leaderboard || leaderboard.entries.length === 0) {
      return (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No data available for this category</p>
          </CardContent>
        </Card>
      )
    }

    return (
      <div className="space-y-4">
        {leaderboard.entries.map((entry, index) => (
          <LeaderboardEntry key={entry.user.id} entry={entry} index={index} />
        ))}
      </div>
    )
  }

  const currentConfig = categoryConfig[activeCategory]

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1">
        <div className="container mx-auto py-8 space-y-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-4"
          >
            <h1 className="text-4xl font-bold gradient-text">Category Leaderboards</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover top performers in each technology category
            </p>
          </motion.div>

          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-sm font-medium mb-2 block text-foreground">Period</label>
                  <Select
                    value={period}
                    onValueChange={(value: LeaderboardPeriod) => {
                      setPeriod(value)
                      // Reset all leaderboards to force refetch
                      setLeaderboards({
                        [LeaderboardCategory.OVERALL]: null,
                        [LeaderboardCategory.AI_ML]: null,
                        [LeaderboardCategory.WEB_DEV]: null,
                        [LeaderboardCategory.MOBILE]: null,
                        [LeaderboardCategory.DATA_SCIENCE]: null,
                        [LeaderboardCategory.DEVOPS]: null,
                        [LeaderboardCategory.BLOCKCHAIN]: null,
                      })
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={LeaderboardPeriod.ALL_TIME}>All Time</SelectItem>
                      <SelectItem value={LeaderboardPeriod.YEARLY}>This Year</SelectItem>
                      <SelectItem value={LeaderboardPeriod.MONTHLY}>This Month</SelectItem>
                      <SelectItem value={LeaderboardPeriod.WEEKLY}>This Week</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex-1">
                  <label className="text-sm font-medium mb-2 block text-foreground">Sort By</label>
                  <Select
                    value={sortBy}
                    onValueChange={(value: SortBy) => {
                      setSortBy(value)
                      // Reset all leaderboards to force refetch
                      setLeaderboards({
                        [LeaderboardCategory.OVERALL]: null,
                        [LeaderboardCategory.AI_ML]: null,
                        [LeaderboardCategory.WEB_DEV]: null,
                        [LeaderboardCategory.MOBILE]: null,
                        [LeaderboardCategory.DATA_SCIENCE]: null,
                        [LeaderboardCategory.DEVOPS]: null,
                        [LeaderboardCategory.BLOCKCHAIN]: null,
                      })
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={SortBy.CAREER_SCORE}>Career Score</SelectItem>
                      <SelectItem value={SortBy.SUBMISSION_COUNT}>Submission Count</SelectItem>
                      <SelectItem value={SortBy.AVERAGE_SCORE}>Average Score</SelectItem>
                      <SelectItem value={SortBy.WIN_RATE}>Win Rate</SelectItem>
                      <SelectItem value={SortBy.RECENT_ACTIVITY}>Recent Activity</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Category Navigation */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
                {Object.entries(categoryConfig).map(([category, config]) => {
                  const Icon = config.icon
                  const isActive = category === activeCategory
                  return (
                    <Button
                      key={category}
                      variant={isActive ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleCategoryChange(category as LeaderboardCategory)}
                      className="flex items-center space-x-2 justify-start"
                    >
                      <Icon className={`h-4 w-4 ${config.color}`} />
                      <span className="hidden sm:inline">{config.label}</span>
                    </Button>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Active Category Leaderboard */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-3">
                <currentConfig.icon className={`h-6 w-6 ${currentConfig.color}`} />
                <span>{currentConfig.label} Leaderboard</span>
              </CardTitle>
              <p className="text-muted-foreground">{currentConfig.description}</p>
            </CardHeader>
            <CardContent>
              <CategoryLeaderboard category={activeCategory} />
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  )
} 