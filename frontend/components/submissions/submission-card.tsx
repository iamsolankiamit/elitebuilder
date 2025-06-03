'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Trophy, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Github, 
  FileText, 
  Video, 
  Eye, 
  CalendarDays,
  ExternalLink
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EvaluationStatus } from '@/components/evaluation/evaluation-status';
import type { Submission } from '@/lib/types';

interface SubmissionCardProps {
  submission: Submission;
  showChallenge?: boolean;
  compact?: boolean;
  index?: number;
}

export function SubmissionCard({ 
  submission, 
  showChallenge = true, 
  compact = false, 
  index = 0 
}: SubmissionCardProps) {
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

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
      >
        <Card className="card-hover">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">
                  Challenge #{submission.challengeId}
                </p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(submission.createdAt)}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                {submission.score && (
                  <Badge variant="outline" className="text-xs">
                    {submission.score}/100
                  </Badge>
                )}
                {(submission.status === 'PENDING' || submission.status === 'UNDER_REVIEW') ? (
                  <EvaluationStatus submission={submission} compact />
                ) : (
                  <Badge 
                    variant={getStatusColor(submission.status)} 
                    className="flex items-center gap-1 text-xs"
                  >
                    {getStatusIcon(submission.status)}
                    {submission.status.replace('_', ' ')}
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Card className="card-hover">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-lg">
                {showChallenge ? `Challenge #${submission.challengeId}` : `Submission #${submission.id}`}
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <a
                href={submission.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-2 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <Github className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                <span className="text-sm font-medium">Repository</span>
                <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
              </a>
              <a
                href={submission.pitchDeck}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-2 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <FileText className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                <span className="text-sm font-medium">Pitch Deck</span>
                <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
              </a>
              <a
                href={submission.demoVideo}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-2 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <Video className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                <span className="text-sm font-medium">Demo Video</span>
                <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
              </a>
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center pt-4 border-t">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CalendarDays className="h-4 w-4" />
                Last updated {formatDate(submission.updatedAt)}
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
                {showChallenge && (
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                  >
                    <Link href={`/challenges/${submission.challengeId}`}>
                      View Challenge
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
} 