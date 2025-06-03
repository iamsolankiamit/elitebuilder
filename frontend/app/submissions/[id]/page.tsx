'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Github, 
  FileText, 
  Video, 
  Trophy, 
  Clock, 
  CheckCircle, 
  XCircle, 
  CalendarDays,
  User,
  Edit,
  Trash2,
  ExternalLink
} from 'lucide-react';

import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { AuthGuard } from '@/components/auth/auth-guard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EvaluationStatus } from '@/components/evaluation/evaluation-status';
import { useSubmission, useDeleteSubmission } from '@/hooks/use-challenges';
import type { Submission } from '@/lib/types';

export default function SubmissionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const submissionId = parseInt(params.id as string);
  
  const { data: submission, isLoading } = useSubmission(submissionId);
  const deleteSubmissionMutation = useDeleteSubmission();
  
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const getStatusIcon = (status: Submission['status']) => {
    switch (status) {
      case 'SCORED':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'UNDER_REVIEW':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'PENDING':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'REJECTED':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
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

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    if (score >= 50) return 'text-orange-600';
    return 'text-red-600';
  };

  const handleDelete = async () => {
    if (!submission) return;
    
    try {
      await deleteSubmissionMutation.mutateAsync(submission.id);
      router.push('/submissions');
    } catch (error) {
      console.error('Failed to delete submission:', error);
    }
  };

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

  if (!submission) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Submission Not Found</h1>
            <p className="text-muted-foreground mb-4">The submission you're looking for doesn't exist.</p>
            <Button asChild>
              <Link href="/submissions">Back to Submissions</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1">
        <AuthGuard>
          {/* Header */}
          <section className="bg-gradient-to-br from-background via-background to-primary/5 py-12">
            <div className="container">
              <div className="max-w-4xl mx-auto">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => router.back()}
                    className="mb-6"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h1 className="text-3xl font-bold mb-2">
                        Challenge #{submission.challengeId} Submission
                      </h1>
                      <p className="text-muted-foreground">
                        Submitted on {new Date(submission.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {submission.score && (
                        <Badge variant="outline" className="bg-primary/10 text-lg px-3 py-1">
                          <Trophy className="h-4 w-4 mr-2" />
                          <span className={getScoreColor(submission.score)}>
                            {submission.score}/100
                          </span>
                        </Badge>
                      )}
                      <Badge 
                        variant={getStatusColor(submission.status)} 
                        className="flex items-center gap-2 text-sm px-3 py-1"
                      >
                        {getStatusIcon(submission.status)}
                        {submission.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </section>

          {/* Content */}
          <section className="py-12">
            <div className="container">
              <div className="max-w-4xl mx-auto space-y-8">
                {/* Status and Score Card */}
                {submission.score && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                  >
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Trophy className="h-5 w-5" />
                          Score & Evaluation
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-center">
                          <div className="text-center">
                            <div className={`text-6xl font-bold mb-2 ${getScoreColor(submission.score)}`}>
                              {submission.score}
                            </div>
                            <div className="text-2xl text-muted-foreground mb-4">out of 100</div>
                            <div className="text-sm text-muted-foreground">
                              {submission.score >= 90 ? 'Excellent work!' :
                               submission.score >= 70 ? 'Good performance!' :
                               submission.score >= 50 ? 'Needs improvement' :
                               'Requires significant improvement'}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {/* Evaluation Status */}
                {(submission.status === 'PENDING' || submission.status === 'UNDER_REVIEW') && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: submission.score ? 0.2 : 0.1 }}
                  >
                    <EvaluationStatus submission={submission} />
                  </motion.div>
                )}

                {/* Submission Links */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: submission.score ? 0.3 : (submission.status === 'PENDING' || submission.status === 'UNDER_REVIEW') ? 0.2 : 0.1 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>Submission Files</CardTitle>
                      <CardDescription>
                        Access your submitted repository, pitch deck, and demo video
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <a
                          href={submission.repoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group relative p-6 rounded-lg border hover:bg-muted/50 transition-all duration-300 hover:shadow-md"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <Github className="h-8 w-8 text-muted-foreground group-hover:text-foreground transition-colors" />
                            <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          <h3 className="font-medium mb-2">Repository</h3>
                          <p className="text-sm text-muted-foreground">
                            View the source code and implementation
                          </p>
                        </a>

                        <a
                          href={submission.pitchDeck}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group relative p-6 rounded-lg border hover:bg-muted/50 transition-all duration-300 hover:shadow-md"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <FileText className="h-8 w-8 text-muted-foreground group-hover:text-foreground transition-colors" />
                            <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          <h3 className="font-medium mb-2">Pitch Deck</h3>
                          <p className="text-sm text-muted-foreground">
                            View the presentation and solution overview
                          </p>
                        </a>

                        <a
                          href={submission.demoVideo}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group relative p-6 rounded-lg border hover:bg-muted/50 transition-all duration-300 hover:shadow-md"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <Video className="h-8 w-8 text-muted-foreground group-hover:text-foreground transition-colors" />
                            <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          <h3 className="font-medium mb-2">Demo Video</h3>
                          <p className="text-sm text-muted-foreground">
                            Watch the product demonstration
                          </p>
                        </a>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Submission Details */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>Submission Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Submission ID</label>
                            <p className="text-lg">{submission.id}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Challenge ID</label>
                            <p className="text-lg">#{submission.challengeId}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Status</label>
                            <div className="flex items-center gap-2 mt-1">
                              {getStatusIcon(submission.status)}
                              <span className="capitalize">{submission.status.replace('_', ' ')}</span>
                            </div>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Submitted By</label>
                            <div className="flex items-center gap-2 mt-1">
                              <User className="h-4 w-4" />
                              <span>{submission.user.name || submission.user.username}</span>
                            </div>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Submitted At</label>
                            <div className="flex items-center gap-2 mt-1">
                              <CalendarDays className="h-4 w-4" />
                              <span>{new Date(submission.createdAt).toLocaleString()}</span>
                            </div>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                            <div className="flex items-center gap-2 mt-1">
                              <CalendarDays className="h-4 w-4" />
                              <span>{new Date(submission.updatedAt).toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Actions */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="flex justify-between items-center"
                >
                  <Button asChild variant="outline">
                    <Link href={`/challenges/${submission.challengeId}`}>
                      View Challenge
                    </Link>
                  </Button>
                  
                  <div className="flex gap-3">
                    {submission.status === 'PENDING' && (
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/submissions/${submission.id}/edit`}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Submission
                        </Link>
                      </Button>
                    )}
                    
                    {!showDeleteConfirm ? (
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => setShowDeleteConfirm(true)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setShowDeleteConfirm(false)}
                        >
                          Cancel
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={handleDelete}
                          disabled={deleteSubmissionMutation.isPending}
                        >
                          {deleteSubmissionMutation.isPending ? 'Deleting...' : 'Confirm Delete'}
                        </Button>
                      </div>
                    )}
                  </div>
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