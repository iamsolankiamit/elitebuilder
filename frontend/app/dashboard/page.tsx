'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Trophy, Upload, Star, Plus } from 'lucide-react';

import { AuthGuard } from '@/components/auth/auth-guard';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useMySubmissions } from '@/hooks/use-challenges';
import { useAuth } from '@/hooks/use-auth';

export default function Dashboard() {
  const { user } = useAuth();
  const { data: submissions, isLoading: submissionsLoading } = useMySubmissions();

  const completedSubmissions = submissions?.filter(s => s.status === 'SCORED') || [];
  const pendingSubmissions = submissions?.filter(s => s.status !== 'SCORED') || [];
  const wonChallenges = completedSubmissions.filter(s => (s.score || 0) >= 90).length;

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <AuthGuard>
          <div className="container py-12">
            <div className="max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
                <p className="text-muted-foreground mb-8">
                  Welcome back, {user?.name || user?.username}! Here's your challenge activity.
                </p>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  <Card className="card-hover">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">My Submissions</CardTitle>
                      <Upload className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {submissionsLoading ? '...' : submissions?.length || 0}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {pendingSubmissions.length} pending review
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <Card className="card-hover">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Career Score</CardTitle>
                      <Star className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{user?.careerScore || 0}</div>
                      <p className="text-xs text-muted-foreground">
                        Your overall rating
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <Card className="card-hover">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">High Scores</CardTitle>
                      <Trophy className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{wonChallenges}</div>
                      <p className="text-xs text-muted-foreground">
                        Submissions with 90+ score
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Submissions */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Submissions</CardTitle>
                      <CardDescription>
                        Your latest challenge submissions
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {submissionsLoading ? (
                        <div className="space-y-3">
                          {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="animate-pulse">
                              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                              <div className="h-3 bg-muted rounded w-1/2"></div>
                            </div>
                          ))}
                        </div>
                      ) : submissions && submissions.length > 0 ? (
                        <div className="space-y-4">
                          {submissions.slice(0, 5).map((submission) => (
                            <div key={submission.id} className="flex items-center justify-between">
                              <div className="space-y-1">
                                <p className="text-sm font-medium leading-none">
                                  Challenge #{submission.challengeId}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  Submitted {new Date(submission.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="flex items-center space-x-2">
                                {submission.score && (
                                  <Badge variant="success" className="text-xs">
                                    {submission.score}/100
                                  </Badge>
                                )}
                                <Badge 
                                  variant={
                                    submission.status === 'SCORED' ? 'success' :
                                    submission.status === 'UNDER_REVIEW' ? 'warning' :
                                    submission.status === 'REJECTED' ? 'destructive' : 'secondary'
                                  }
                                  className="text-xs"
                                >
                                  {submission.status.replace('_', ' ')}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-muted-foreground mb-4">
                            You haven't submitted to any challenges yet.
                          </p>
                          <Button asChild>
                            <Link href="/challenges">
                              <Plus className="mr-2 h-4 w-4" />
                              Browse Challenges
                            </Link>
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Quick Actions */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>Quick Actions</CardTitle>
                      <CardDescription>
                        Jump into your next challenge
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Button asChild className="w-full justify-start" variant="outline">
                        <Link href="/challenges">
                          <Trophy className="mr-2 h-4 w-4" />
                          Browse All Challenges
                        </Link>
                      </Button>
                      
                      <Button asChild className="w-full justify-start" variant="outline">
                        <Link href="/challenges/create">
                          <Plus className="mr-2 h-4 w-4" />
                          Create New Challenge
                        </Link>
                      </Button>
                      
                      <Button asChild className="w-full justify-start" variant="outline">
                        <Link href="/leaderboard">
                          <Star className="mr-2 h-4 w-4" />
                          View Leaderboard
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </div>
          </div>
        </AuthGuard>
      </main>
      <Footer />
    </div>
  );
} 