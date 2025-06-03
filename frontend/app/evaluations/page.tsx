'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Activity,
  RefreshCw,
  AlertTriangle,
  Users,
  Calendar
} from 'lucide-react';

import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { AuthGuard } from '@/components/auth/auth-guard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { QueueStats } from '@/components/evaluation/queue-stats';
import { useQueueStats } from '@/hooks/use-evaluation';
import { useMySubmissions } from '@/hooks/use-challenges';

export default function EvaluationsPage() {
  const { data: queueStats, isLoading: queueLoading } = useQueueStats();
  const { data: submissions, isLoading: submissionsLoading } = useMySubmissions();

  const pendingSubmissions = submissions?.filter(s => 
    s.status === 'PENDING' || s.status === 'UNDER_REVIEW'
  ) || [];

  const evaluatedSubmissions = submissions?.filter(s => 
    s.status === 'SCORED' || s.status === 'REJECTED'
  ) || [];

  const recentEvaluations = evaluatedSubmissions
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1">
        <AuthGuard>
          {/* Hero Section */}
          <section className="bg-gradient-to-br from-background via-background to-primary/5 py-16">
            <div className="container">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-4xl mx-auto text-center"
              >
                <h1 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">
                  Evaluation Dashboard
                </h1>
                <p className="text-xl text-muted-foreground mb-8">
                  Monitor evaluation progress and system performance in real-time
                </p>
              </motion.div>
            </div>
          </section>

          {/* Dashboard Content */}
          <section className="py-12">
            <div className="container">
              <div className="max-w-6xl mx-auto space-y-8">
                {/* System Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                  >
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Queue Status</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {queueLoading ? '...' : queueStats ? 'Active' : 'Unknown'}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          System operational
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">My Pending</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {submissionsLoading ? '...' : pendingSubmissions.length}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Awaiting evaluation
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  >
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Completed</CardTitle>
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {submissionsLoading ? '...' : evaluatedSubmissions.length}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Total evaluated
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                  >
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg. Score</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {submissionsLoading ? '...' : 
                           evaluatedSubmissions.length > 0 
                             ? Math.round(evaluatedSubmissions
                                 .filter(s => s.score)
                                 .reduce((acc, s) => acc + (s.score || 0), 0) / 
                                 evaluatedSubmissions.filter(s => s.score).length) || 0
                             : 0
                          }
                        </div>
                        <p className="text-xs text-muted-foreground">
                          My average
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>

                {/* Queue Statistics */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                >
                  <QueueStats />
                </motion.div>

                {/* Recent Evaluations */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                  >
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <CheckCircle className="h-5 w-5" />
                          Recent Evaluations
                        </CardTitle>
                        <CardDescription>
                          Your latest evaluated submissions
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
                        ) : recentEvaluations.length > 0 ? (
                          <div className="space-y-4">
                            {recentEvaluations.map((submission) => (
                              <div key={submission.id} className="flex items-center justify-between p-3 rounded-lg border">
                                <div className="space-y-1">
                                  <p className="text-sm font-medium">
                                    Challenge #{submission.challengeId}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    Evaluated {new Date(submission.updatedAt).toLocaleDateString()}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2">
                                  {submission.score && (
                                    <Badge variant="outline">
                                      {submission.score}/100
                                    </Badge>
                                  )}
                                  <Badge 
                                    variant={submission.status === 'SCORED' ? 'success' : 'destructive'}
                                    className="text-xs"
                                  >
                                    {submission.status === 'SCORED' ? 'Completed' : 'Rejected'}
                                  </Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <CheckCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <p className="text-muted-foreground mb-4">
                              No evaluations completed yet
                            </p>
                            <Button asChild variant="outline">
                              <Link href="/submissions">View Submissions</Link>
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.7 }}
                  >
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Clock className="h-5 w-5" />
                          Pending Evaluations
                        </CardTitle>
                        <CardDescription>
                          Submissions currently being evaluated
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {submissionsLoading ? (
                          <div className="space-y-3">
                            {Array.from({ length: 2 }).map((_, i) => (
                              <div key={i} className="animate-pulse">
                                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                                <div className="h-3 bg-muted rounded w-1/2"></div>
                              </div>
                            ))}
                          </div>
                        ) : pendingSubmissions.length > 0 ? (
                          <div className="space-y-4">
                            {pendingSubmissions.map((submission) => (
                              <div key={submission.id} className="flex items-center justify-between p-3 rounded-lg border">
                                <div className="space-y-1">
                                  <p className="text-sm font-medium">
                                    Challenge #{submission.challengeId}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    Submitted {new Date(submission.createdAt).toLocaleDateString()}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge 
                                    variant={submission.status === 'PENDING' ? 'secondary' : 'warning'}
                                    className="text-xs"
                                  >
                                    {submission.status.replace('_', ' ')}
                                  </Badge>
                                  <Button asChild variant="ghost" size="sm">
                                    <Link href={`/submissions/${submission.id}`}>
                                      View
                                    </Link>
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <p className="text-muted-foreground mb-4">
                              No pending evaluations
                            </p>
                            <Button asChild variant="outline">
                              <Link href="/challenges">Submit to Challenge</Link>
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>

                {/* Quick Actions */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.8 }}
                  className="flex flex-wrap gap-4 justify-center"
                >
                  <Button asChild>
                    <Link href="/submissions">
                      View All Submissions
                    </Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link href="/challenges">
                      Browse Challenges
                    </Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link href="/dashboard">
                      Back to Dashboard
                    </Link>
                  </Button>
                </motion.div>
              </div>
            </div>
          </section>
        </AuthGuard>
      </main>
      
      <Footer />
    </div>
  );
} 