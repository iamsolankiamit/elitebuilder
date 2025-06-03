import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { PrismaService } from '../prisma/prisma.service';
import { SubmissionStatus } from '../submissions/types';

export interface EvaluationJob {
  submissionId: number;
  challengeId: number;
  repoUrl: string;
  pitchDeck: string;
  demoVideo: string;
  challengePackUrl?: string;
}

export interface EvaluationResult {
  submissionId: number;
  score: number;
  status: SubmissionStatus;
  feedback: string;
  metrics: {
    technicalScore: number;
    presentationScore: number;
    innovationScore: number;
    usabilityScore: number;
  };
  executionLogs: string;
  buildSuccess: boolean;
  testResults: any;
}

@Injectable()
export class EvaluationService {
  private readonly logger = new Logger(EvaluationService.name);

  constructor(
    @InjectQueue('evaluation') private evaluationQueue: Queue,
    private prisma: PrismaService,
  ) {}

  async queueEvaluation(submissionId: number): Promise<void> {
    const submission = await this.prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        challenge: {
          select: {
            id: true,
            title: true,
            rubric: true,
            dataset: true,
          },
        },
      },
    });

    if (!submission) {
      throw new NotFoundException('Submission not found');
    }

    // Update status to UNDER_REVIEW
    await this.prisma.submission.update({
      where: { id: submissionId },
      data: { status: SubmissionStatus.UNDER_REVIEW },
    });

    // Add to evaluation queue
    const job: EvaluationJob = {
      submissionId: submission.id,
      challengeId: submission.challengeId,
      repoUrl: submission.repoUrl,
      pitchDeck: submission.pitchDeck,
      demoVideo: submission.demoVideo,
      challengePackUrl: submission.challenge.dataset || undefined, // Handle null properly
    };

    await this.evaluationQueue.add('evaluate-submission', job, {
      priority: this.calculatePriority(submission),
      delay: 0,
    });

    this.logger.log(`Queued evaluation for submission ${submissionId}`);
  }

  async updateEvaluationResult(result: EvaluationResult): Promise<void> {
    await this.prisma.submission.update({
      where: { id: result.submissionId },
      data: {
        score: result.score,
        status: result.status,
        updatedAt: new Date(),
      },
    });

    // TODO: Send notification to user about evaluation completion
    this.logger.log(`Updated submission ${result.submissionId} with score ${result.score}`);
  }

  async getEvaluationStatus(submissionId: number): Promise<any> {
    const jobs = await this.evaluationQueue.getJobs(['active', 'waiting', 'completed', 'failed']);
    const submissionJob = jobs.find(job => job.data.submissionId === submissionId);

    return {
      submissionId,
      status: submissionJob ? 'processing' : 'not_found',
      progress: submissionJob?.progress() || 0,
      logs: submissionJob?.returnvalue?.logs || null,
    };
  }

  async getQueueStats(): Promise<any> {
    const waiting = await this.evaluationQueue.getWaiting();
    const active = await this.evaluationQueue.getActive();
    const completed = await this.evaluationQueue.getCompleted();
    const failed = await this.evaluationQueue.getFailed();

    return {
      waiting: waiting.length,
      active: active.length,
      completed: completed.length,
      failed: failed.length,
    };
  }

  private calculatePriority(submission: any): number {
    // Higher priority for challenges with closer deadlines
    const timeToDeadline = new Date(submission.challenge.deadline).getTime() - Date.now();
    const daysToDeadline = timeToDeadline / (1000 * 60 * 60 * 24);
    
    if (daysToDeadline < 1) return 10; // Critical
    if (daysToDeadline < 3) return 8;  // High
    if (daysToDeadline < 7) return 5;  // Medium
    return 1; // Low
  }
} 