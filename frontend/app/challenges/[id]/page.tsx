'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { 
  Calendar, 
  DollarSign, 
  Users, 
  Trophy, 
  ExternalLink, 
  Download,
  UserPlus,
  UserMinus,
  Upload,
  Edit,
  Trash2
} from 'lucide-react';

import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useChallenge, useJoinChallenge, useLeaveChallenge, useDeleteChallenge } from '@/hooks/use-challenges';
import { useAuth } from '@/hooks/use-auth';

function SubmissionCard({ submission }: { submission: any }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SCORED': return 'success';
      case 'UNDER_REVIEW': return 'warning';
      case 'REJECTED': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {submission.user.avatar && (
              <img
                src={submission.user.avatar}
                alt={submission.user.username}
                className="w-10 h-10 rounded-full"
              />
            )}
            <div>
              <p className="font-semibold">{submission.user.name || submission.user.username}</p>
              <p className="text-sm text-muted-foreground">
                Submitted {new Date(submission.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {submission.score && (
              <Badge variant="success" className="font-bold">
                {submission.score}/100
              </Badge>
            )}
            <Badge variant={getStatusColor(submission.status)}>
              {submission.status.replace('_', ' ')}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <a href={submission.repoUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" />
              Repository
            </a>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <a href={submission.pitchDeck} target="_blank" rel="noopener noreferrer">
              <Download className="mr-2 h-4 w-4" />
              Pitch Deck
            </a>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <a href={submission.demoVideo} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" />
              Demo Video
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ChallengePage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const challengeId = parseInt(params.id as string);
  
  const { data: challenge, isLoading, error } = useChallenge(challengeId);
  const joinMutation = useJoinChallenge();
  const leaveMutation = useLeaveChallenge();
  const deleteMutation = useDeleteChallenge();

  const [activeTab, setActiveTab] = useState<'overview' | 'submissions' | 'leaderboard'>('overview');

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !challenge) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Challenge Not Found</h1>
            <p className="text-muted-foreground mb-4">The challenge you're looking for doesn't exist.</p>
            <Button asChild>
              <Link href="/challenges">Back to Challenges</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const isExpired = new Date(challenge.deadline) < new Date();
  const isCreator = user?.id === challenge.creatorId;
  const canEdit = isCreator && !isExpired;
  const canDelete = isCreator && challenge._count.submissions === 0;

  const handleJoin = async () => {
    try {
      await joinMutation.mutateAsync(challengeId);
    } catch (error) {
      console.error('Failed to join challenge:', error);
    }
  };

  const handleLeave = async () => {
    try {
      await leaveMutation.mutateAsync(challengeId);
    } catch (error) {
      console.error('Failed to leave challenge:', error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this challenge? This action cannot be undone.')) {
      try {
        await deleteMutation.mutateAsync(challengeId);
        router.push('/challenges');
      } catch (error) {
        console.error('Failed to delete challenge:', error);
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-background via-background to-primary/5 py-16">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-4xl mx-auto"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <h1 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">
                    {challenge.title}
                  </h1>
                  <p className="text-xl text-muted-foreground mb-6">
                    {challenge.description}
                  </p>
                </div>
                
                {isExpired && (
                  <Badge variant="destructive" className="text-lg px-4 py-2">
                    Expired
                  </Badge>
                )}
              </div>

              {/* Challenge Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <p className="text-2xl font-bold">{challenge._count.participants}</p>
                  <p className="text-sm text-muted-foreground">Participants</p>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Trophy className="h-6 w-6 text-primary" />
                  </div>
                  <p className="text-2xl font-bold">{challenge._count.submissions}</p>
                  <p className="text-sm text-muted-foreground">Submissions</p>
                </div>
                
                {challenge.prize && (
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <DollarSign className="h-6 w-6 text-green-500" />
                    </div>
                    <p className="text-2xl font-bold text-green-500">
                      ${challenge.prize.toLocaleString()}
                    </p>
                    <p className="text-sm text-muted-foreground">Prize</p>
                  </div>
                )}
                
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Calendar className="h-6 w-6 text-primary" />
                  </div>
                  <p className="text-2xl font-bold">
                    {Math.max(0, Math.ceil((new Date(challenge.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {isExpired ? 'Expired' : 'Days Left'}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4">
                {isAuthenticated && !isExpired && !isCreator && (
                  <>
                    {challenge.isParticipating ? (
                      <Button
                        onClick={handleLeave}
                        disabled={leaveMutation.isPending || challenge.hasSubmitted}
                        variant="outline"
                      >
                        <UserMinus className="mr-2 h-4 w-4" />
                        {leaveMutation.isPending ? 'Leaving...' : 'Leave Challenge'}
                      </Button>
                    ) : (
                      <Button
                        onClick={handleJoin}
                        disabled={joinMutation.isPending}
                        className="hover-lift glow-on-hover"
                      >
                        <UserPlus className="mr-2 h-4 w-4" />
                        {joinMutation.isPending ? 'Joining...' : 'Join Challenge'}
                      </Button>
                    )}
                    
                    {challenge.isParticipating && !challenge.hasSubmitted && (
                      <Button asChild>
                        <Link href={`/challenges/${challengeId}/submit`}>
                          <Upload className="mr-2 h-4 w-4" />
                          Submit Solution
                        </Link>
                      </Button>
                    )}
                  </>
                )}

                {canEdit && (
                  <Button variant="outline" asChild>
                    <Link href={`/challenges/${challengeId}/edit`}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Challenge
                    </Link>
                  </Button>
                )}

                {canDelete && (
                  <Button
                    variant="outline"
                    onClick={handleDelete}
                    disabled={deleteMutation.isPending}
                    className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    {deleteMutation.isPending ? 'Deleting...' : 'Delete Challenge'}
                  </Button>
                )}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Tabs */}
        <section className="border-b">
          <div className="container">
            <div className="flex gap-8">
              {['overview', 'submissions', 'leaderboard'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`py-4 px-2 border-b-2 transition-colors capitalize ${
                    activeTab === tab
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Tab Content */}
        <section className="py-12">
          <div className="container">
            {activeTab === 'overview' && (
              <div className="max-w-4xl mx-auto space-y-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Challenge Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="font-semibold mb-2">Description</h3>
                      <p className="text-muted-foreground whitespace-pre-wrap">
                        {challenge.description}
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold mb-2">Evaluation Rubric</h3>
                      <p className="text-muted-foreground whitespace-pre-wrap">
                        {challenge.rubric}
                      </p>
                    </div>
                    
                    {challenge.dataset && (
                      <div>
                        <h3 className="font-semibold mb-2">Dataset</h3>
                        <Button variant="outline" asChild>
                          <a href={challenge.dataset} target="_blank" rel="noopener noreferrer">
                            <Download className="mr-2 h-4 w-4" />
                            Download Dataset
                          </a>
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Challenge Creator</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4">
                      {challenge.creator.avatar && (
                        <img
                          src={challenge.creator.avatar}
                          alt={challenge.creator.username}
                          className="w-16 h-16 rounded-full"
                        />
                      )}
                      <div>
                        <p className="font-semibold text-lg">
                          {challenge.creator.name || challenge.creator.username}
                        </p>
                        <p className="text-muted-foreground">@{challenge.creator.username}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'submissions' && (
              <div className="max-w-4xl mx-auto">
                <div className="space-y-6">
                  {challenge.submissions && challenge.submissions.length > 0 ? (
                    challenge.submissions.map((submission) => (
                      <SubmissionCard key={submission.id} submission={submission} />
                    ))
                  ) : (
                    <Card>
                      <CardContent className="text-center py-12">
                        <p className="text-muted-foreground">No submissions yet.</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'leaderboard' && (
              <div className="max-w-4xl mx-auto">
                <Card>
                  <CardHeader>
                    <CardTitle>Leaderboard</CardTitle>
                    <CardDescription>Top performers in this challenge</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {challenge.submissions && challenge.submissions.length > 0 ? (
                      <div className="space-y-4">
                        {challenge.submissions
                          .filter(s => s.score !== null && s.status === 'SCORED')
                          .sort((a, b) => (b.score || 0) - (a.score || 0))
                          .map((submission, index) => (
                            <div key={submission.id} className="flex items-center justify-between p-4 rounded-lg border">
                              <div className="flex items-center gap-4">
                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold">
                                  {index + 1}
                                </div>
                                {submission.user.avatar && (
                                  <img
                                    src={submission.user.avatar}
                                    alt={submission.user.username}
                                    className="w-10 h-10 rounded-full"
                                  />
                                )}
                                <div>
                                  <p className="font-semibold">
                                    {submission.user.name || submission.user.username}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    Submitted {new Date(submission.createdAt).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              <Badge variant="success" className="text-lg px-3 py-1">
                                {submission.score}/100
                              </Badge>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <p className="text-center text-muted-foreground py-8">
                        No scored submissions yet.
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
} 