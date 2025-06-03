import { Test, TestingModule } from '@nestjs/testing';
import { getQueueToken } from '@nestjs/bull';
import { NotFoundException } from '@nestjs/common';
import { EvaluationService, EvaluationResult } from '../evaluation.service';
import { PrismaService } from '../../prisma/prisma.service';
import { SubmissionStatus } from '../../submissions/types';

describe('EvaluationService', () => {
  let service: EvaluationService;
  let prismaService: PrismaService;
  let mockQueue: any;

  const mockSubmission = {
    id: 1,
    challengeId: 1,
    repoUrl: 'https://github.com/test/repo',
    pitchDeck: 'https://example.com/deck.pdf',
    demoVideo: 'https://example.com/video.mp4',
    challenge: {
      id: 1,
      title: 'Test Challenge',
      rubric: 'Test rubric',
      dataset: 'https://example.com/dataset.zip',
      deadline: new Date('2025-12-31'),
    },
  };

  beforeEach(async () => {
    mockQueue = {
      add: jest.fn().mockResolvedValue({}),
      getJobs: jest.fn().mockResolvedValue([]),
      getWaiting: jest.fn().mockResolvedValue([]),
      getActive: jest.fn().mockResolvedValue([]),
      getCompleted: jest.fn().mockResolvedValue([]),
      getFailed: jest.fn().mockResolvedValue([]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EvaluationService,
        {
          provide: PrismaService,
          useValue: {
            submission: {
              findUnique: jest.fn(),
              update: jest.fn(),
            },
          },
        },
        {
          provide: getQueueToken('evaluation'),
          useValue: mockQueue,
        },
      ],
    }).compile();

    service = module.get<EvaluationService>(EvaluationService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('queueEvaluation', () => {
    it('should queue evaluation for valid submission', async () => {
      const mockFindUnique = jest.spyOn(prismaService.submission, 'findUnique')
        .mockResolvedValue(mockSubmission as any);
      const mockUpdate = jest.spyOn(prismaService.submission, 'update')
        .mockResolvedValue(mockSubmission as any);

      await service.queueEvaluation(1);

      expect(mockFindUnique).toHaveBeenCalledWith({
        where: { id: 1 },
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

      expect(mockUpdate).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { status: SubmissionStatus.UNDER_REVIEW },
      });

      expect(mockQueue.add).toHaveBeenCalledWith(
        'evaluate-submission',
        {
          submissionId: 1,
          challengeId: 1,
          repoUrl: 'https://github.com/test/repo',
          pitchDeck: 'https://example.com/deck.pdf',
          demoVideo: 'https://example.com/video.mp4',
          challengePackUrl: 'https://example.com/dataset.zip',
        },
        expect.any(Object)
      );
    });

    it('should throw NotFoundException for invalid submission', async () => {
      jest.spyOn(prismaService.submission, 'findUnique')
        .mockResolvedValue(null);

      await expect(service.queueEvaluation(999)).rejects.toThrow(NotFoundException);
    });

    it('should handle null dataset properly', async () => {
      const submissionWithoutDataset = {
        ...mockSubmission,
        challenge: { ...mockSubmission.challenge, dataset: null },
      };

      jest.spyOn(prismaService.submission, 'findUnique')
        .mockResolvedValue(submissionWithoutDataset as any);
      jest.spyOn(prismaService.submission, 'update')
        .mockResolvedValue(submissionWithoutDataset as any);

      await service.queueEvaluation(1);

      expect(mockQueue.add).toHaveBeenCalledWith(
        'evaluate-submission',
        expect.objectContaining({
          challengePackUrl: undefined,
        }),
        expect.any(Object)
      );
    });
  });

  describe('updateEvaluationResult', () => {
    it('should update submission with evaluation result', async () => {
      const mockUpdate = jest.spyOn(prismaService.submission, 'update')
        .mockResolvedValue(mockSubmission as any);

      const result: EvaluationResult = {
        submissionId: 1,
        score: 85,
        status: SubmissionStatus.SCORED,
        feedback: 'Great work!',
        metrics: {
          technicalScore: 35,
          presentationScore: 20,
          innovationScore: 18,
          usabilityScore: 12,
        },
        executionLogs: 'Build successful',
        buildSuccess: true,
        testResults: { tests: 'passed' },
      };

      await service.updateEvaluationResult(result);

      expect(mockUpdate).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          score: 85,
          status: SubmissionStatus.SCORED,
          updatedAt: expect.any(Date),
        },
      });
    });
  });

  describe('getEvaluationStatus', () => {
    it('should return processing status for active job', async () => {
      const mockJob = {
        data: { submissionId: 1 },
        progress: jest.fn().mockReturnValue(50),
        returnvalue: { logs: 'Processing...' },
      };

      mockQueue.getJobs.mockResolvedValue([mockJob]);

      const result = await service.getEvaluationStatus(1);

      expect(result).toEqual({
        submissionId: 1,
        status: 'processing',
        progress: 50,
        logs: 'Processing...',
      });
    });

    it('should return not_found status for unknown submission', async () => {
      mockQueue.getJobs.mockResolvedValue([]);

      const result = await service.getEvaluationStatus(999);

      expect(result).toEqual({
        submissionId: 999,
        status: 'not_found',
        progress: 0,
        logs: null,
      });
    });
  });

  describe('getQueueStats', () => {
    it('should return queue statistics', async () => {
      mockQueue.getWaiting.mockResolvedValue([1, 2]);
      mockQueue.getActive.mockResolvedValue([3]);
      mockQueue.getCompleted.mockResolvedValue([4, 5, 6]);
      mockQueue.getFailed.mockResolvedValue([7]);

      const result = await service.getQueueStats();

      expect(result).toEqual({
        waiting: 2,
        active: 1,
        completed: 3,
        failed: 1,
      });
    });
  });
}); 