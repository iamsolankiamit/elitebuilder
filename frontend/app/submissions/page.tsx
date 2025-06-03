'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { CalendarDays, Filter, Search, Plus, Eye, Github, FileText, Video, Trophy, Clock, CheckCircle, XCircle } from 'lucide-react';

import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { AuthGuard } from '@/components/auth/auth-guard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMySubmissions } from '@/hooks/use-challenges';
import type { Submission } from '@/lib/types';

export default function SubmissionsPage() {
  const { data: submissions, isLoading } = useMySubmissions();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');

  const filteredSubmissions = submissions?.filter((submission) => {
    const matchesSearch = searchQuery === '' || 
      submission.challengeId.toString().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || submission.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'score':
        return (b.score || 0) - (a.score || 0);
      default:
        return 0;
    }
  }) || [];

  const getStatusIcon = (status: Submission['status']) => {
    switch (status) {
      case 'SCORED':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'UNDER_REVIEW':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'PENDING':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'REJECTED':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: Submission['status']) => {
    switch (status) {
      case 'SCORED':
        return 'success';
      case 'UNDER_REVIEW':
        return 'warning';
      case 'PENDING':
        return 'secondary';
      case 'REJECTED':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const stats = {
    total: submissions?.length || 0,
    scored: submissions?.filter(s => s.status === 'SCORED').length || 0,
    pending: submissions?.filter(s => s.status === 'PENDING' || s.status === 'UNDER_REVIEW').length || 0,
    avgScore: submissions?.length 
      ? Math.round(submissions.filter(s => s.score).reduce((acc, s) => acc + (s.score || 0), 0) / submissions.filter(s => s.score).length) || 0
      : 0,
  };

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
                  My Submissions
                </h1>
                <p className="text-xl text-muted-foreground mb-8">
                  Track all your challenge submissions and their progress
                </p>
                
                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
                  <div className="bg-background/50 backdrop-blur-sm rounded-lg p-4 border">
                    <div className="text-2xl font-bold text-foreground">{stats.total}</div>
                    <div className="text-sm text-muted-foreground">Total</div>
                  </div>
                  <div className="bg-background/50 backdrop-blur-sm rounded-lg p-4 border">
                    <div className="text-2xl font-bold text-green-600">{stats.scored}</div>
                    <div className="text-sm text-muted-foreground">Scored</div>
                  </div>
                  <div className="bg-background/50 backdrop-blur-sm rounded-lg p-4 border">
                    <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                    <div className="text-sm text-muted-foreground">Pending</div>
                  </div>
                  <div className="bg-background/50 backdrop-blur-sm rounded-lg p-4 border">
                    <div className="text-2xl font-bold text-primary">{stats.avgScore}</div>
                    <div className="text-sm text-muted-foreground">Avg Score</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </section>

          {/* Filters and Search */}
          <section className="py-8 border-b">
            <div className="container">
              <div className="max-w-4xl mx-auto">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                  {/* Search */}
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by challenge ID..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  {/* Filters */}
                  <div className="flex gap-4">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-40">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="PENDING">Pending</SelectItem>
                        <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
                        <SelectItem value="SCORED">Scored</SelectItem>
                        <SelectItem value="REJECTED">Rejected</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="newest">Newest</SelectItem>
                        <SelectItem value="oldest">Oldest</SelectItem>
                        <SelectItem value="score">Score</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* New Submission Button */}
                  <Button asChild>
                    <Link href="/challenges">
                      <Plus className="mr-2 h-4 w-4" />
                      New Submission
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </section>

          {/* Submissions List */}
          <section className="py-12">
            <div className="container">
              <div className="max-w-4xl mx-auto">
                {isLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Card key={i} className="animate-pulse">
                        <CardContent className="p-6">
                          <div className="space-y-3">
                            <div className="h-4 bg-muted rounded w-1/2"></div>
                            <div className="h-3 bg-muted rounded w-1/3"></div>
                            <div className="h-3 bg-muted rounded w-2/3"></div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : filteredSubmissions.length > 0 ? (
                  <div className="space-y-6">
                    {filteredSubmissions.map((submission, index) => (
                      <motion.div
                        key={submission.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                      >
                        <Card className="card-hover">
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <div className="space-y-1">
                                <CardTitle className="text-lg">
                                  Challenge #{submission.challengeId}
                                </CardTitle>
                                <CardDescription>
                                  Submitted on {new Date(submission.createdAt).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </CardDescription>
                              </div>
                              <div className="flex items-center gap-2">
                                {submission.score && (
                                  <Badge variant="outline" className="bg-primary/10">
                                    <Trophy className="h-3 w-3 mr-1" />
                                    {submission.score}/100
                                  </Badge>
                                )}
                                <Badge variant={getStatusColor(submission.status)} className="flex items-center gap-1">
                                  {getStatusIcon(submission.status)}
                                  {submission.status.replace('_', ' ')}
                                </Badge>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              {/* Submission Links */}
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <a
                                  href={submission.repoUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                                >
                                  <Github className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-sm font-medium">Repository</span>
                                </a>
                                <a
                                  href={submission.pitchDeck}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                                >
                                  <FileText className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-sm font-medium">Pitch Deck</span>
                                </a>
                                <a
                                  href={submission.demoVideo}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                                >
                                  <Video className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-sm font-medium">Demo Video</span>
                                </a>
                              </div>

                              {/* Actions */}
                              <div className="flex justify-between items-center pt-4 border-t">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <CalendarDays className="h-4 w-4" />
                                  Last updated {new Date(submission.updatedAt).toLocaleDateString()}
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    asChild
                                  >
                                    <Link href={`/submissions/${submission.id}`}>
                                      <Eye className="mr-2 h-4 w-4" />
                                      View Details
                                    </Link>
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    asChild
                                  >
                                    <Link href={`/challenges/${submission.challengeId}`}>
                                      View Challenge
                                    </Link>
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-center py-16"
                  >
                    <div className="max-w-md mx-auto">
                      <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                        <Trophy className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-medium mb-2">No submissions found</h3>
                      <p className="text-muted-foreground mb-6">
                        {searchQuery || statusFilter !== 'all' 
                          ? 'Try adjusting your filters or search terms.'
                          : 'Start by participating in a challenge and submitting your solution.'}
                      </p>
                      <Button asChild>
                        <Link href="/challenges">
                          <Plus className="mr-2 h-4 w-4" />
                          Browse Challenges
                        </Link>
                      </Button>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </section>
        </AuthGuard>
      </main>
      
      <Footer />
    </div>
  );
} 