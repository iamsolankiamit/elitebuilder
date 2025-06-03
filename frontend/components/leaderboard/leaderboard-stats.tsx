'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Users, Trophy, TrendingUp, Award } from 'lucide-react'
import { leaderboardApi } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface LeaderboardStats {
  totalUsers: number
  totalSubmissions: number
  avgCareerScore: number
  topPerformers: number
}

export function LeaderboardStats() {
  const [stats, setStats] = useState<LeaderboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await leaderboardApi.getLeaderboardStats()
        setStats(response)
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch leaderboard stats')
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num)
  }

  if (loading || error || !stats) {
    return null
  }

  const statCards = [
    {
      title: 'Total Builders',
      value: formatNumber(stats.totalUsers),
      icon: Users,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50/50 dark:bg-blue-950/30',
      borderColor: 'border-blue-200/50 dark:border-blue-700/50'
    },
    {
      title: 'Total Submissions',
      value: formatNumber(stats.totalSubmissions),
      icon: TrendingUp,
      color: 'text-green-500',
      bgColor: 'bg-green-50/50 dark:bg-green-950/30',
      borderColor: 'border-green-200/50 dark:border-green-700/50'
    },
    {
      title: 'Avg Career Score',
      value: formatNumber(Math.round(stats.avgCareerScore)),
      icon: Trophy,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-50/50 dark:bg-yellow-950/30',
      borderColor: 'border-yellow-200/50 dark:border-yellow-700/50'
    },
    {
      title: 'Top Performers',
      value: formatNumber(stats.topPerformers),
      icon: Award,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50/50 dark:bg-purple-950/30',
      borderColor: 'border-purple-200/50 dark:border-purple-700/50'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className={`${stat.bgColor} ${stat.borderColor} border`}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {stat.value}
                  </p>
                </div>
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
} 