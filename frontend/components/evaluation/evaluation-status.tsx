'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  RefreshCw, 
  Play,
  Loader2,
  Info
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useEvaluationStatus, useRetryEvaluation } from '@/hooks/use-evaluation';
import type { Submission } from '@/lib/types';

interface EvaluationStatusProps {
  submission: Submission;
  showDetails?: boolean;
  compact?: boolean;
}

export function EvaluationStatus({ 
  submission, 
  showDetails = true, 
  compact = false 
}: EvaluationStatusProps) {
  const [showLogs, setShowLogs] = useState(false);
  const { data: evaluationStatus, isLoading } = useEvaluationStatus(
    submission.id,
    submission.status === 'PENDING' || submission.status === 'UNDER_REVIEW'
  );
  const retryEvaluationMutation = useRetryEvaluation();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'waiting':
        return <Clock className="h-4 w-4 text-yellow-500 animate-pulse" />;
      case 'active':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'waiting':
        return 'warning';
      case 'active':
        return 'secondary';
      case 'completed':
        return 'success';
      case 'failed':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getStatusMessage = (status: string, position?: number, estimatedTime?: number) => {
    switch (status) {
      case 'waiting':
        return position 
          ? `Position ${position} in queue${estimatedTime ? ` (${Math.ceil(estimatedTime / 60)} min estimated)` : ''}`
          : 'Waiting for evaluation to start';
      case 'active':
        return 'Evaluation in progress...';
      case 'completed':
        return 'Evaluation completed successfully';
      case 'failed':
        return 'Evaluation failed';
      default:
        return 'Unknown status';
    }
  };

  const handleRetryEvaluation = async () => {
    try {
      await retryEvaluationMutation.mutateAsync(submission.id);
    } catch (error) {
      console.error('Failed to retry evaluation:', error);
    }
  };

  // If submission is scored, don't show evaluation status
  if (submission.status === 'SCORED') {
    return null;
  }

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        ) : evaluationStatus ? (
          <>
            {getStatusIcon(evaluationStatus.status)}
            <span className="text-sm text-muted-foreground">
              {evaluationStatus.status === 'active' ? 'Evaluating...' : 
               evaluationStatus.status === 'waiting' ? 'In queue' :
               evaluationStatus.status}
            </span>
          </>
        ) : (
          <Badge variant="secondary" className="text-xs">
            {submission.status.replace('_', ' ')}
          </Badge>
        )}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">Evaluation Status</CardTitle>
              {isLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
            </div>
            
            {evaluationStatus?.status === 'failed' && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleRetryEvaluation}
                disabled={retryEvaluationMutation.isPending}
              >
                {retryEvaluationMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Retry
              </Button>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {evaluationStatus ? (
            <>
              {/* Status Badge */}
              <div className="flex items-center gap-3">
                <Badge 
                  variant={getStatusColor(evaluationStatus.status)} 
                  className="flex items-center gap-2 px-3 py-1"
                >
                  {getStatusIcon(evaluationStatus.status)}
                  {evaluationStatus.status.charAt(0).toUpperCase() + evaluationStatus.status.slice(1)}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {getStatusMessage(
                    evaluationStatus.status, 
                    evaluationStatus.position, 
                    evaluationStatus.estimatedTime
                  )}
                </span>
              </div>

              {/* Progress Bar for Active Evaluation */}
              {evaluationStatus.status === 'active' && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Evaluating submission...</span>
                    <span className="text-muted-foreground">Please wait</span>
                  </div>
                  <Progress value={undefined} className="h-2" />
                </div>
              )}

              {/* Queue Position */}
              {evaluationStatus.status === 'waiting' && evaluationStatus.position && (
                <div className="bg-muted/50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 text-sm">
                    <Info className="h-4 w-4 text-blue-500" />
                    <span>
                      Your submission is #{evaluationStatus.position} in the evaluation queue.
                      {evaluationStatus.estimatedTime && (
                        <> Estimated wait time: {Math.ceil(evaluationStatus.estimatedTime / 60)} minutes.</>
                      )}
                    </span>
                  </div>
                </div>
              )}

              {/* Error Details */}
              {evaluationStatus.status === 'failed' && evaluationStatus.error && (
                <div className="bg-destructive/10 p-3 rounded-lg border border-destructive/20">
                  <div className="flex items-start gap-2">
                    <XCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-destructive">Evaluation Failed</p>
                      <p className="text-sm text-destructive/80">{evaluationStatus.error}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Logs */}
              {showDetails && evaluationStatus.logs && (
                <Collapsible open={showLogs} onOpenChange={setShowLogs}>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="flex items-center gap-2">
                      <Info className="h-4 w-4" />
                      {showLogs ? 'Hide' : 'Show'} Evaluation Logs
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-3">
                    <div className="bg-muted p-3 rounded-lg">
                      <pre className="text-xs text-muted-foreground whitespace-pre-wrap overflow-x-auto">
                        {evaluationStatus.logs}
                      </pre>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              )}
            </>
          ) : (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <AlertCircle className="h-4 w-4" />
              <span>Evaluation status unavailable</span>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
} 