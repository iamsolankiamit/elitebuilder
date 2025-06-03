import { Test, TestingModule } from '@nestjs/testing';
import { Job } from 'bull';
import { EvaluationProcessor } from '../evaluation.processor';
import { EvaluationService, EvaluationJob } from '../evaluation.service';
import { DockerService } from '../docker.service';
import { ScoringService } from '../scoring.service';
import { PrismaService } from '../../prisma/prisma.service';
import { SubmissionStatus } from '../../submissions/types';
import * as fs from 'fs/promises';
import { spawn } from 'child_process';

// Mock external dependencies
jest.mock('fs/promises');
jest.mock('child_process');

const mockFs = fs as jest.Mocked<typeof fs>;
const mockSpawn = spawn as jest.MockedFunction<typeof spawn>;

describe('EvaluationProcessor Integration', () => {
  let processor: EvaluationProcessor;
  let evaluationService: EvaluationService;
  let dockerService: DockerService;
  let scoringService: ScoringService;
  let prismaService: PrismaService;

  const mockSubmission = {
    id: 1,
    challengeId: 1,
    repoUrl: 'https://github.com/test/awesome-ai-project',
    pitchDeck: 'https://example.com/deck.pdf',
    demoVideo: 'https://example.com/demo.mp4',
    challenge: {
      id: 1,
      title: 'AI Chat Assistant Challenge',
      rubric: JSON.stringify({
        technical: 'Must demonstrate working AI integration',
        presentation: 'Clear demo and pitch deck required',
        innovation: 'Novel approach to conversational AI',
        usability: 'Intuitive user interface',
      }),
      deadline: new Date('2025-12-31'),
    },
    user: {
      id: 1,
      name: 'John Doe',
      username: 'johndoe',
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EvaluationProcessor,
        {
          provide: EvaluationService,
          useValue: {
            updateEvaluationResult: jest.fn(),
          },
        },
        {
          provide: DockerService,
          useValue: {
            detectProjectType: jest.fn(),
            buildImage: jest.fn(),
            runTests: jest.fn(),
          },
        },
        {
          provide: ScoringService,
          useValue: {
            scoreSubmission: jest.fn(),
          },
        },
        {
          provide: PrismaService,
          useValue: {
            submission: {
              findUnique: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    processor = module.get<EvaluationProcessor>(EvaluationProcessor);
    evaluationService = module.get<EvaluationService>(EvaluationService);
    dockerService = module.get<DockerService>(DockerService);
    scoringService = module.get<ScoringService>(ScoringService);
    prismaService = module.get<PrismaService>(PrismaService);

    // Clear all mocks
    jest.clearAllMocks();

    // Setup default mock implementations
    setupDefaultMocks();
  });

  const setupDefaultMocks = () => {
    // Mock fs operations
    mockFs.rm.mockResolvedValue(undefined);
    mockFs.mkdir.mockResolvedValue(undefined);
    mockFs.writeFile.mockResolvedValue(undefined);

    // Mock git clone success
    mockSpawn.mockImplementation((command: string, args: string[]) => {
      const mockProcess: any = {
        stdout: { on: jest.fn() },
        stderr: { on: jest.fn() },
        on: jest.fn((event, callback) => {
          if (event === 'close') {
            setTimeout(() => callback(0), 10); // Success
          }
        }),
        kill: jest.fn(),
      };
      return mockProcess;
    });

    // Mock submission lookup
    (prismaService.submission.findUnique as jest.Mock).mockResolvedValue(mockSubmission);

    // Mock Docker service responses
    (dockerService.detectProjectType as jest.Mock).mockResolvedValue({
      type: 'node',
      hasDockerfile: false,
      packageFiles: ['package.json'],
    });

    (dockerService.buildImage as jest.Mock).mockResolvedValue({
      success: true,
      logs: 'Build completed successfully',
      imageId: 'submission-test:latest',
    });

    (dockerService.runTests as jest.Mock).mockResolvedValue({
      success: true,
      score: 85,
      logs: 'All tests passed',
      results: {
        totalScore: 85,
        testsCovered: 15,
        testsPass: true,
        hasReadme: true,
        hasTests: true,
        hasDependencies: true,
        followsProjectStructure: true,
        hasUserInterface: true,
        codeQuality: { score: 9 },
        userExperience: { score: 4 },
      },
    });

    // Mock scoring service
    (scoringService.scoreSubmission as jest.Mock).mockResolvedValue({
      totalScore: 88,
      breakdown: {
        technical: 36,
        presentation: 22,
        innovation: 16,
        usability: 14,
      },
      feedback: 'Excellent submission with strong technical implementation',
      recommendations: ['Consider adding more advanced AI features'],
    });
  };

  const createMockJob = (data: EvaluationJob): Job<EvaluationJob> => {
    return {
      data,
      progress: jest.fn(),
      id: 'test-job-id',
      queue: {} as any,
    } as unknown as Job<EvaluationJob>;
  };

  describe('handleEvaluation', () => {
    it('should successfully complete end-to-end evaluation', async () => {
      const jobData: EvaluationJob = {
        submissionId: 1,
        challengeId: 1,
        repoUrl: 'https://github.com/test/awesome-ai-project',
        pitchDeck: 'https://example.com/deck.pdf',
        demoVideo: 'https://example.com/demo.mp4',
      };

      const job = createMockJob(jobData);

      await processor.handleEvaluation(job);

      // Verify the evaluation flow
      expect(job.progress).toHaveBeenCalledWith(10); // Clone step
      expect(job.progress).toHaveBeenCalledWith(20); // Download pack
      expect(job.progress).toHaveBeenCalledWith(30); // Detect project
      expect(job.progress).toHaveBeenCalledWith(40); // Build image
      expect(job.progress).toHaveBeenCalledWith(60); // Run tests
      expect(job.progress).toHaveBeenCalledWith(80); // Calculate score
      expect(job.progress).toHaveBeenCalledWith(100); // Update results

      // Verify service calls
      expect(dockerService.detectProjectType).toHaveBeenCalled();
      expect(dockerService.buildImage).toHaveBeenCalled();
      expect(dockerService.runTests).toHaveBeenCalled();
      expect(scoringService.scoreSubmission).toHaveBeenCalledWith(
        'https://github.com/test/awesome-ai-project',
        'https://example.com/deck.pdf',
        'https://example.com/demo.mp4',
        expect.any(String),
        expect.any(Object),
        true
      );

      expect(evaluationService.updateEvaluationResult).toHaveBeenCalledWith({
        submissionId: 1,
        score: 88,
        status: SubmissionStatus.SCORED,
        feedback: 'Excellent submission with strong technical implementation',
        metrics: {
          technicalScore: 36,
          presentationScore: 22,
          innovationScore: 16,
          usabilityScore: 14,
        },
        executionLogs: 'All tests passed',
        buildSuccess: true,
        testResults: expect.any(Object),
      });
    });

    it('should handle build failures gracefully', async () => {
      // Mock build failure
      (dockerService.buildImage as jest.Mock).mockResolvedValue({
        success: false,
        logs: 'Docker build failed: package.json not found',
        error: 'Build error',
      });

      const jobData: EvaluationJob = {
        submissionId: 1,
        challengeId: 1,
        repoUrl: 'https://github.com/test/broken-project',
        pitchDeck: 'https://example.com/deck.pdf',
        demoVideo: 'https://example.com/demo.mp4',
      };

      const job = createMockJob(jobData);

      await processor.handleEvaluation(job);

      // Should update with failure status
      expect(evaluationService.updateEvaluationResult).toHaveBeenCalledWith({
        submissionId: 1,
        score: 0,
        status: SubmissionStatus.REJECTED,
        feedback: expect.stringContaining('Build failed'),
        metrics: {
          technicalScore: 0,
          presentationScore: 0,
          innovationScore: 0,
          usabilityScore: 0,
        },
        executionLogs: expect.stringContaining('Docker build failed'),
        buildSuccess: false,
        testResults: {},
      });

      // Should not run tests on build failure
      expect(dockerService.runTests).not.toHaveBeenCalled();
      expect(scoringService.scoreSubmission).not.toHaveBeenCalled();
    });

    it('should handle git clone failures', async () => {
      // Mock git clone failure
      mockSpawn.mockImplementation(() => {
        const mockProcess: any = {
          stdout: { on: jest.fn() },
          stderr: { on: jest.fn() },
          on: jest.fn((event, callback) => {
            if (event === 'close') {
              setTimeout(() => callback(1), 10); // Failure
            }
          }),
          kill: jest.fn(),
        };
        return mockProcess;
      });

      const jobData: EvaluationJob = {
        submissionId: 1,
        challengeId: 1,
        repoUrl: 'https://github.com/test/nonexistent-repo',
        pitchDeck: 'https://example.com/deck.pdf',
        demoVideo: 'https://example.com/demo.mp4',
      };

      const job = createMockJob(jobData);

      await processor.handleEvaluation(job);

      // Should handle the error and update submission
      expect(evaluationService.updateEvaluationResult).toHaveBeenCalledWith({
        submissionId: 1,
        score: 0,
        status: SubmissionStatus.REJECTED,
        feedback: expect.stringContaining('Evaluation error'),
        metrics: {
          technicalScore: 0,
          presentationScore: 0,
          innovationScore: 0,
          usabilityScore: 0,
        },
        executionLogs: expect.any(String),
        buildSuccess: false,
        testResults: {},
      });
    });

    it('should handle missing submission gracefully', async () => {
      (prismaService.submission.findUnique as jest.Mock).mockResolvedValue(null);

      const jobData: EvaluationJob = {
        submissionId: 999,
        challengeId: 1,
        repoUrl: 'https://github.com/test/repo',
        pitchDeck: 'https://example.com/deck.pdf',
        demoVideo: 'https://example.com/demo.mp4',
      };

      const job = createMockJob(jobData);

      await processor.handleEvaluation(job);

      // Should handle missing submission error
      expect(evaluationService.updateEvaluationResult).toHaveBeenCalledWith({
        submissionId: 999,
        score: 0,
        status: SubmissionStatus.REJECTED,
        feedback: expect.stringContaining('Evaluation error'),
        metrics: {
          technicalScore: 0,
          presentationScore: 0,
          innovationScore: 0,
          usabilityScore: 0,
        },
        executionLogs: expect.stringContaining('Submission 999 not found'),
        buildSuccess: false,
        testResults: {},
      });
    });

    it('should evaluate project with challenge pack', async () => {
      const jobData: EvaluationJob = {
        submissionId: 1,
        challengeId: 1,
        repoUrl: 'https://github.com/test/repo',
        pitchDeck: 'https://example.com/deck.pdf',
        demoVideo: 'https://example.com/demo.mp4',
        challengePackUrl: 'https://example.com/challenge-pack.zip',
      };

      const job = createMockJob(jobData);

      await processor.handleEvaluation(job);

      // Should proceed normally with challenge pack
      expect(dockerService.buildImage).toHaveBeenCalledWith(
        expect.stringContaining('submission-1'),
        expect.stringContaining('challenge-1'),
        expect.any(Object)
      );

      expect(evaluationService.updateEvaluationResult).toHaveBeenCalledWith(
        expect.objectContaining({
          status: SubmissionStatus.SCORED,
          score: 88,
        })
      );
    });

    it('should evaluate Python project correctly', async () => {
      (dockerService.detectProjectType as jest.Mock).mockResolvedValue({
        type: 'python',
        hasDockerfile: true,
        packageFiles: ['requirements.txt', 'pyproject.toml'],
      });

      const jobData: EvaluationJob = {
        submissionId: 1,
        challengeId: 1,
        repoUrl: 'https://github.com/test/python-ai-project',
        pitchDeck: 'https://example.com/deck.pdf',
        demoVideo: 'https://example.com/demo.mp4',
      };

      const job = createMockJob(jobData);

      await processor.handleEvaluation(job);

      expect(dockerService.detectProjectType).toHaveBeenCalled();
      expect(dockerService.buildImage).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        expect.objectContaining({
          type: 'python',
          hasDockerfile: true,
        })
      );
    });

    it('should cleanup resources after evaluation', async () => {
      const jobData: EvaluationJob = {
        submissionId: 1,
        challengeId: 1,
        repoUrl: 'https://github.com/test/repo',
        pitchDeck: 'https://example.com/deck.pdf',
        demoVideo: 'https://example.com/demo.mp4',
      };

      const job = createMockJob(jobData);

      await processor.handleEvaluation(job);

      // Should cleanup the repo directory
      expect(mockFs.rm).toHaveBeenCalledWith(
        expect.stringContaining('submission-1'),
        { recursive: true, force: true }
      );
    });

    it('should handle test execution timeout', async () => {
      (dockerService.runTests as jest.Mock).mockResolvedValue({
        success: false,
        score: 0,
        logs: 'Tests timed out after 30 minutes',
        results: {},
        error: 'Execution timeout',
      });

      const jobData: EvaluationJob = {
        submissionId: 1,
        challengeId: 1,
        repoUrl: 'https://github.com/test/slow-project',
        pitchDeck: 'https://example.com/deck.pdf',
        demoVideo: 'https://example.com/demo.mp4',
      };

      const job = createMockJob(jobData);

      await processor.handleEvaluation(job);

      // Should still complete evaluation with low score
      expect(evaluationService.updateEvaluationResult).toHaveBeenCalledWith(
        expect.objectContaining({
          status: SubmissionStatus.SCORED,
          buildSuccess: true,
          executionLogs: 'Tests timed out after 30 minutes',
        })
      );
    });
  });

  describe('downloadChallengePack', () => {
    it('should create default challenge pack when URL not provided', async () => {
      const packPath = await (processor as any).downloadChallengePack(null, 1);

      expect(mockFs.mkdir).toHaveBeenCalledWith(
        expect.stringContaining('challenge-1'),
        { recursive: true }
      );
      expect(mockFs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('entrypoint.sh'),
        expect.stringContaining('Starting evaluation'),
        { mode: 0o755 }
      );
      expect(packPath).toContain('challenge-1');
    });
  });

  describe('cleanup', () => {
    it('should clean up resources without throwing', async () => {
      mockFs.rm.mockRejectedValue(new Error('Permission denied'));

      // Should not throw even if cleanup fails
      await expect((processor as any).cleanup(1)).resolves.toBeUndefined();
    });
  });
}); 