'use client';

import { motion } from 'framer-motion';
import { Clock, Play, CheckCircle, XCircle, TrendingUp } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQueueStats } from '@/hooks/use-evaluation';

export function QueueStats() {
  const { data: stats, isLoading } = useQueueStats();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Evaluation Queue
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return null;
  }

  const total = stats.waiting + stats.active + stats.completed + stats.failed;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Evaluation Queue
          </CardTitle>
          <CardDescription>
            Real-time evaluation system statistics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/20">
                <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.waiting}</div>
                <div className="text-xs text-muted-foreground">Waiting</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20">
                <Play className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.active}</div>
                <div className="text-xs text-muted-foreground">Active</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/20">
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.completed}</div>
                <div className="text-xs text-muted-foreground">Completed</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/20">
                <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.failed}</div>
                <div className="text-xs text-muted-foreground">Failed</div>
              </div>
            </div>
          </div>

          {total > 0 && (
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Total evaluations:</span>
                <Badge variant="outline">{total}</Badge>
              </div>
              
              {stats.waiting > 0 && (
                <div className="flex items-center justify-between text-sm mt-2">
                  <span className="text-muted-foreground">Estimated wait time:</span>
                  <Badge variant="secondary">
                    ~{Math.max(1, Math.ceil(stats.waiting * 2))} min
                  </Badge>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
} 