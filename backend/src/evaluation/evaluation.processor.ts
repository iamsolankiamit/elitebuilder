import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { EvaluationJob, EvaluationResult, EvaluationService } from './evaluation.service';
import { DockerService } from './docker.service';
import { ScoringService } from './scoring.service';
import { SubmissionStatus } from '../submissions/types';
import { PrismaService } from '../prisma/prisma.service';
import * as fs from 'fs/promises';
import * as path from 'path';
import { spawn } from 'child_process';

@Processor('evaluation')
export class EvaluationProcessor {
  private readonly logger = new Logger(EvaluationProcessor.name);

  constructor(
    private evaluationService: EvaluationService,
    private dockerService: DockerService,
    private scoringService: ScoringService,
    private prisma: PrismaService,
  ) {}

  @Process('evaluate-submission')
  async handleEvaluation(job: Job<EvaluationJob>): Promise<void> {
    const { submissionId, challengeId, repoUrl, pitchDeck, demoVideo, challengePackUrl } = job.data;
    
    this.logger.log(`Starting evaluation for submission ${submissionId}`);
    
    try {
      // Step 1: Clone repository
      await job.progress(10);
      this.logger.log(`Cloning repository: ${repoUrl}`);
      const repoPath = await this.cloneRepository(repoUrl, submissionId);
      
      // Step 2: Download challenge pack (if exists)
      await job.progress(20);
      let challengePackPath: string | undefined;
      if (challengePackUrl) {
        this.logger.log(`Downloading challenge pack: ${challengePackUrl}`);
        challengePackPath = await this.downloadChallengePack(challengePackUrl, challengeId);
      }
      
      // Step 3: Detect project type
      await job.progress(30);
      this.logger.log(`Detecting project type for submission ${submissionId}`);
      const projectInfo = await this.dockerService.detectProjectType(repoPath);
      this.logger.log(`Detected project type: ${projectInfo.type}, hasDockerfile: ${projectInfo.hasDockerfile}`);
      
      // Step 4: Build Docker image
      await job.progress(40);
      this.logger.log(`Building Docker image for submission ${submissionId}`);
      const buildResult = await this.dockerService.buildImage(repoPath, challengePackPath || '', projectInfo);
      
      if (!buildResult.success) {
        this.logger.error(`Build failed for submission ${submissionId}: ${buildResult.error}`);
        await this.handleEvaluationFailure(submissionId, 'Build failed', buildResult.logs || buildResult.error || 'Unknown build error');
        return;
      }
      
      this.logger.log(`Build successful for submission ${submissionId}, image: ${buildResult.imageId}`);
      
      // Step 5: Run tests
      await job.progress(60);
      this.logger.log(`Running tests for submission ${submissionId}`);
      const testResult = await this.dockerService.runTests(buildResult.imageId!);
      
      // Step 6: Calculate score
      await job.progress(80);
      this.logger.log(`Calculating score for submission ${submissionId}`);
      const submission = await this.getSubmissionDetails(submissionId);
      const scoringResult = await this.scoringService.scoreSubmission(
        submission.repoUrl,
        submission.pitchDeck,
        submission.demoVideo,
        submission.challenge.rubric,
        testResult.results,
        buildResult.success,
      );
      
      // Step 7: Update submission with results
      await job.progress(100);
      this.logger.log(`Updating submission ${submissionId} with score ${scoringResult.totalScore}`);
      const evaluationResult: EvaluationResult = {
        submissionId,
        score: scoringResult.totalScore,
        status: SubmissionStatus.SCORED,
        feedback: scoringResult.feedback,
        metrics: {
          technicalScore: scoringResult.breakdown.technical,
          presentationScore: scoringResult.breakdown.presentation,
          innovationScore: scoringResult.breakdown.innovation,
          usabilityScore: scoringResult.breakdown.usability,
        },
        executionLogs: testResult.logs,
        buildSuccess: buildResult.success,
        testResults: testResult.results,
      };
      
      await this.evaluationService.updateEvaluationResult(evaluationResult);
      
      this.logger.log(`Evaluation completed successfully for submission ${submissionId} with score ${scoringResult.totalScore}`);
      
    } catch (error: any) {
      this.logger.error(`Evaluation failed for submission ${submissionId}: ${error.message}`, error.stack);
      await this.handleEvaluationFailure(submissionId, 'Evaluation error', error.message);
    } finally {
      // Cleanup
      await this.cleanup(submissionId);
    }
  }

  private async cloneRepository(repoUrl: string, submissionId: number): Promise<string> {
    const repoPath = `/tmp/repos/submission-${submissionId}`;
    
    // Ensure directory exists and is clean
    await fs.rm(repoPath, { recursive: true, force: true }).catch(() => {});
    await fs.mkdir(path.dirname(repoPath), { recursive: true });
    
    const result = await this.runCommand('git', ['clone', '--depth', '1', repoUrl, repoPath]);
    
    if (!result.success) {
      throw new Error(`Failed to clone repository: ${result.output}`);
    }
    
    return repoPath;
  }

  private async downloadChallengePack(challengePackUrl: string, challengeId: number): Promise<string> {
    // For now, we'll create a basic challenge pack since we don't have S3 setup
    // In production, this would download from S3 or similar storage
    const packPath = `/tmp/packs/challenge-${challengeId}`;
    
    await fs.rm(packPath, { recursive: true, force: true }).catch(() => {});
    await fs.mkdir(packPath, { recursive: true });
    
    // Create basic test structure
    await fs.mkdir(path.join(packPath, 'tests'), { recursive: true });
    
    // Create basic entrypoint script
    const entrypoint = `#!/bin/bash
set -e

echo "Starting evaluation for challenge ${challengeId}..."

# Run basic checks
echo "Checking project structure..."
ls -la /app

# Create results directory
mkdir -p /results

# Basic scoring (placeholder - would be replaced with actual tests)
cat > /results/score.json << 'EOF'
{
  "totalScore": 75,
  "testsCovered": 10,
  "testsPass": true,
  "codeQuality": {
    "score": 8
  },
  "userExperience": {
    "score": 3
  }
}
EOF

echo "Evaluation completed for challenge ${challengeId}"
`;
    
    await fs.writeFile(path.join(packPath, 'entrypoint.sh'), entrypoint, { mode: 0o755 });
    
    // Create eval config
    const evalConfig = `timeout: 1800
healthcheck:
  enabled: false
environment:
  NODE_ENV: test
  PYTHONPATH: /app
  CHALLENGE_ID: ${challengeId}
`;
    
    await fs.writeFile(path.join(packPath, 'eval_config.yaml'), evalConfig);
    
    return packPath;
  }

  private async getSubmissionDetails(submissionId: number): Promise<any> {
    const submission = await this.prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        challenge: {
          select: {
            id: true,
            title: true,
            rubric: true,
            deadline: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
      },
    });

    if (!submission) {
      throw new Error(`Submission ${submissionId} not found`);
    }

    return submission;
  }

  private async handleEvaluationFailure(submissionId: number, reason: string, logs: string): Promise<void> {
    this.logger.error(`Handling evaluation failure for submission ${submissionId}: ${reason}`);
    
    const result: EvaluationResult = {
      submissionId,
      score: 0,
      status: SubmissionStatus.REJECTED,
      feedback: `Evaluation failed: ${reason}\n\nDetails:\n${logs}`,
      metrics: {
        technicalScore: 0,
        presentationScore: 0,
        innovationScore: 0,
        usabilityScore: 0,
      },
      executionLogs: logs,
      buildSuccess: false,
      testResults: {},
    };
    
    await this.evaluationService.updateEvaluationResult(result);
  }

  private async cleanup(submissionId: number): Promise<void> {
    try {
      const repoPath = `/tmp/repos/submission-${submissionId}`;
      await fs.rm(repoPath, { recursive: true, force: true });
      this.logger.log(`Cleaned up repository for submission ${submissionId}`);
    } catch (error: any) {
      this.logger.warn(`Failed to cleanup submission ${submissionId}: ${error.message}`);
    }
  }

  private async runCommand(
    command: string,
    args: string[],
    timeoutMs: number = 60000
  ): Promise<{ success: boolean; output: string }> {
    return new Promise((resolve) => {
      const process = spawn(command, args);
      let output = '';
      let timeoutId: NodeJS.Timeout;

      const cleanup = () => {
        if (timeoutId) clearTimeout(timeoutId);
        if (!process.killed) {
          process.kill('SIGTERM');
          setTimeout(() => {
            if (!process.killed) {
              process.kill('SIGKILL');
            }
          }, 5000);
        }
      };

      timeoutId = setTimeout(() => {
        cleanup();
        resolve({
          success: false,
          output: output + '\n[TIMEOUT] Process exceeded time limit',
        });
      }, timeoutMs);

      process.stdout.on('data', (data) => {
        output += data.toString();
      });

      process.stderr.on('data', (data) => {
        output += data.toString();
      });

      process.on('close', (code) => {
        if (timeoutId) clearTimeout(timeoutId);
        resolve({
          success: code === 0,
          output,
        });
      });

      process.on('error', (error) => {
        if (timeoutId) clearTimeout(timeoutId);
        resolve({
          success: false,
          output: output + `\n[ERROR] Process error: ${error.message}`,
        });
      });
    });
  }
} 