'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Crown, Trophy, Medal, Star, TrendingUp } from 'lucide-react'
import { 
  LeaderboardResponse, 
  LeaderboardEntry, 
  LeaderboardCategory, 
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

const getCurrentMonth = () => {
  return new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

export default function MonthlyChampionsPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [category, setCategory] = useState<LeaderboardCategory>(LeaderboardCategory.OVERALL)
  const [sortBy, setSortBy] = useState<SortBy>(SortBy.CAREER_SCORE)

  const fetchLeaderboard = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await leaderboardApi.getMonthlyLeaderboard({
        page,
        limit: 50,
        category,
        sortBy,
      })
      setLeaderboard(response)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch monthly leaderboard')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLeaderboard()
  }, [page, category, sortBy])

  const handleFilterChange = () => {
    setPage(1) // Reset to first page when filters change
  }

  const LeaderboardEntry = ({ entry, index }: { entry: LeaderboardEntry; index: number }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`p-6 rounded-lg border transition-all hover:shadow-lg ${
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
                className="h-12 w-12 rounded-full object-cover border-2 border-border"
              />
            ) : (
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold border-2 border-border">
                {entry.user.username.charAt(0).toUpperCase()}
              </div>
            )}
            
            <div>
              <h3 className="font-semibold text-lg text-foreground">
                {entry.user.name || entry.user.username}
              </h3>
              <p className="text-sm text-muted-foreground">
                @{entry.user.username}
                {entry.user.location && ` • ${entry.user.location}`}
              </p>
              
              {entry.badges.length > 0 && (
                <div className="flex gap-1 mt-2">
                  {entry.badges.slice(0, 3).map((badge) => (
                    <Badge key={badge.id} variant="secondary" className="text-xs">
                      {badge.name}
                    </Badge>
                  ))}
                  {entry.badges.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{entry.badges.length - 3}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="text-right">
          <div className="flex items-center space-x-6">
            <div>
              <p className="text-2xl font-bold text-primary">
                {formatScore(entry.monthlyScore || entry.careerScore)}
              </p>
              <p className="text-xs text-muted-foreground">Monthly Score</p>
            </div>
            
            <div className="text-sm text-muted-foreground space-y-1">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4" />
                <span className="text-foreground">{entry.submissionCount} submissions</span>
              </div>
              <div className="flex items-center space-x-2">
                <Star className="h-4 w-4" />
                <span className="text-foreground">{formatScore(entry.averageScore)} avg score</span>
              </div>
              <div className="flex items-center space-x-2">
                <Trophy className="h-4 w-4" />
                <span className="text-foreground">{formatPercentage(entry.winRate)} win rate</span>
              </div>
            </div>
            
            {entry.user.githubUrl && (
              <Button variant="outline" size="sm" asChild>
                <Link href={entry.user.githubUrl} target="_blank">
                  View Profile
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )

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
            <div className="flex items-center justify-center space-x-3">
              <Calendar className="h-8 w-8 text-primary" />
              <h1 className="text-4xl font-bold gradient-text">Monthly Champions</h1>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Top performers for {getCurrentMonth()}
            </p>
          </motion.div>

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Filter by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block text-foreground">Category</label>
                  <Select
                    value={category}
                    onValueChange={(value: LeaderboardCategory) => {
                      setCategory(value)
                      handleFilterChange()
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={LeaderboardCategory.OVERALL}>Overall</SelectItem>
                      <SelectItem value={LeaderboardCategory.AI_ML}>AI/ML</SelectItem>
                      <SelectItem value={LeaderboardCategory.WEB_DEV}>Web Development</SelectItem>
                      <SelectItem value={LeaderboardCategory.MOBILE}>Mobile</SelectItem>
                      <SelectItem value={LeaderboardCategory.DATA_SCIENCE}>Data Science</SelectItem>
                      <SelectItem value={LeaderboardCategory.DEVOPS}>DevOps</SelectItem>
                      <SelectItem value={LeaderboardCategory.BLOCKCHAIN}>Blockchain</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block text-foreground">Sort By</label>
                  <Select
                    value={sortBy}
                    onValueChange={(value: SortBy) => {
                      setSortBy(value)
                      handleFilterChange()
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={SortBy.CAREER_SCORE}>Monthly Score</SelectItem>
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

          {/* Leaderboard */}
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-red-500 mb-4">{error}</p>
                <Button onClick={fetchLeaderboard}>Try Again</Button>
              </CardContent>
            </Card>
          ) : leaderboard ? (
            <>
              <div className="space-y-4">
                {leaderboard.entries.map((entry, index) => (
                  <LeaderboardEntry key={entry.user.id} entry={entry} index={index} />
                ))}
              </div>

              {/* Pagination */}
              {leaderboard.pagination.totalPages > 1 && (
                <div className="flex justify-center space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <span className="flex items-center px-4 text-foreground">
                    Page {page} of {leaderboard.pagination.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setPage(page + 1)}
                    disabled={page === leaderboard.pagination.totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No monthly champions data available</p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  )
} 