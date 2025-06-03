'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Heart, Crown, Trophy, Medal, Star, TrendingUp, Award } from 'lucide-react'
import { 
  LeaderboardResponse, 
  LeaderboardEntry
} from '@/lib/types'
import { leaderboardApi } from '@/lib/api'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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

export default function SponsorFavoritesPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)

  const fetchLeaderboard = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await leaderboardApi.getSponsorFavorites({
        page,
        limit: 50,
      })
      setLeaderboard(response)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch sponsor favorites')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLeaderboard()
  }, [page])

  const LeaderboardEntry = ({ entry, index }: { entry: LeaderboardEntry; index: number }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="p-6 rounded-lg border bg-gradient-to-r from-pink-50/20 to-rose-50/20 border-pink-200/30 dark:from-pink-900/10 dark:to-rose-900/10 dark:border-pink-700/30 transition-all hover:shadow-lg"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex-shrink-0 flex items-center space-x-2">
            {getRankIcon(entry.rank)}
            <Heart className="h-5 w-5 text-pink-500" />
          </div>
          
          <div className="flex items-center space-x-3">
            {entry.user.avatar ? (
              <img
                src={entry.user.avatar}
                alt={entry.user.username}
                className="h-12 w-12 rounded-full object-cover border-2 border-border"
              />
            ) : (
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center text-white font-bold border-2 border-border">
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
              
              <div className="flex items-center space-x-2 mt-2">
                <Badge variant="secondary" className="bg-pink-100/50 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300">
                  <Award className="h-3 w-3 mr-1" />
                  Sponsor Favorite
                </Badge>
                {entry.badges.length > 0 && (
                  <div className="flex gap-1">
                    {entry.badges.slice(0, 2).map((badge) => (
                      <Badge key={badge.id} variant="outline" className="text-xs">
                        {badge.name}
                      </Badge>
                    ))}
                    {entry.badges.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{entry.badges.length - 2}
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="text-right">
          <div className="flex items-center space-x-6">
            <div>
              <p className="text-2xl font-bold text-primary">
                {formatScore(entry.careerScore)}
              </p>
              <p className="text-xs text-muted-foreground">Career Score</p>
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

      {/* Recent Submissions */}
      {entry.recentSubmissions && entry.recentSubmissions.length > 0 && (
        <div className="mt-4 pt-4 border-t border-pink-200/30 dark:border-pink-700/30">
          <h4 className="text-sm font-medium text-muted-foreground mb-2">Recent Submissions</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {entry.recentSubmissions.slice(0, 3).map((submission) => (
              <div key={submission.id} className="bg-white/20 dark:bg-white/5 rounded-lg p-3 text-sm border border-border/50">
                <p className="font-medium truncate text-foreground">{submission.challengeTitle}</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-muted-foreground">
                    {submission.score ? `${formatScore(submission.score)} pts` : 'Pending'}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(submission.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
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
              <Heart className="h-8 w-8 text-pink-500" />
              <h1 className="text-4xl font-bold gradient-text">Sponsor Favorites</h1>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Submissions that have captured the attention and admiration of our sponsor companies
            </p>
          </motion.div>

          {/* Info Card */}
          <Card className="border-pink-200/30 bg-gradient-to-r from-pink-50/20 to-rose-50/20 dark:from-pink-900/10 dark:to-rose-900/10 dark:border-pink-700/30">
            <CardContent className="pt-6">
              <div className="flex items-start space-x-4">
                <Award className="h-6 w-6 text-pink-500 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg mb-2 text-foreground">What makes a Sponsor Favorite?</h3>
                  <p className="text-muted-foreground">
                    These builders have created submissions that stood out to our sponsor companies for their 
                    innovation, technical excellence, business potential, or creative problem-solving approach. 
                    Being featured here often leads to direct opportunities with top tech companies.
                  </p>
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
              <div className="space-y-6">
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
                <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No sponsor favorites yet</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Keep building amazing projects to catch the attention of our sponsors!
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  )
} 