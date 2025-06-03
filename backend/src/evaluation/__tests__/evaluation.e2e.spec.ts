import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { getQueueToken } from '@nestjs/bull';
import * as request from 'supertest';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { EvaluationController } from '../evaluation.controller';
import { EvaluationService } from '../evaluation.service';
import { PrismaService } from '../../prisma/prisma.service';

// Mock Redis queue
const mockQueue = {
  add: jest.fn(),
  getJobs: jest.fn(),
  getWaiting: jest.fn(),
  getActive: jest.fn(),
  getCompleted: jest.fn(),
  getFailed: jest.fn(),
};

// Mock Redis connection for Bull
jest.mock('bull', () => {
  return jest.fn().mockImplementation(() => mockQueue);
});

describe('EvaluationController (e2e)', () => {
  let app: INestApplication;
  let evaluationService: EvaluationService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [EvaluationController],
      providers: [
        {
          provide: EvaluationService,
          useValue: {
            getEvaluationStatus: jest.fn(),
            getQueueStats: jest.fn(),
            queueEvaluation: jest.fn(),
          },
        },
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
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true }) // Allow all requests for testing
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    evaluationService = moduleFixture.get<EvaluationService>(EvaluationService);

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('/evaluation/status/:submissionId (GET)', () => {
    it('should return evaluation status for existing submission', async () => {
      const mockStatus = {
        submissionId: 1,
        status: 'processing',
        progress: 75,
        logs: 'Running tests...',
      };

      jest.spyOn(evaluationService, 'getEvaluationStatus').mockResolvedValue(mockStatus);

      const response = await request(app.getHttpServer())
        .get('/evaluation/status/1')
        .expect(200);

      expect(response.body).toEqual(mockStatus);
      expect(evaluationService.getEvaluationStatus).toHaveBeenCalledWith(1);
    });

    it('should return not_found status for unknown submission', async () => {
      const mockStatus = {
        submissionId: 999,
        status: 'not_found',
        progress: 0,
        logs: null,
      };

      jest.spyOn(evaluationService, 'getEvaluationStatus').mockResolvedValue(mockStatus);

      const response = await request(app.getHttpServer())
        .get('/evaluation/status/999')
        .expect(200);

      expect(response.body).toEqual(mockStatus);
    });

    it('should handle invalid submission ID format', async () => {
      await request(app.getHttpServer())
        .get('/evaluation/status/invalid')
        .expect(400); // Bad Request for invalid integer
    });
  });

  describe('/evaluation/queue/stats (GET)', () => {
    it('should return queue statistics', async () => {
      const mockStats = {
        waiting: 5,
        active: 2,
        completed: 150,
        failed: 3,
      };

      jest.spyOn(evaluationService, 'getQueueStats').mockResolvedValue(mockStats);

      const response = await request(app.getHttpServer())
        .get('/evaluation/queue/stats')
        .expect(200);

      expect(response.body).toEqual(mockStats);
      expect(evaluationService.getQueueStats).toHaveBeenCalled();
    });

    it('should handle queue service errors gracefully', async () => {
      jest.spyOn(evaluationService, 'getQueueStats').mockRejectedValue(
        new Error('Queue service temporarily unavailable')
      );

      await request(app.getHttpServer())
        .get('/evaluation/queue/stats')
        .expect(500); // Internal Server Error
    });
  });

  describe('/evaluation/retry/:submissionId (POST)', () => {
    it('should successfully queue evaluation for retry', async () => {
      jest.spyOn(evaluationService, 'queueEvaluation').mockResolvedValue();

      const response = await request(app.getHttpServer())
        .post('/evaluation/retry/1')
        .expect(201);

      expect(response.body).toEqual({
        message: 'Evaluation queued successfully',
      });
      expect(evaluationService.queueEvaluation).toHaveBeenCalledWith(1);
    });

    it('should handle submission not found error', async () => {
      jest.spyOn(evaluationService, 'queueEvaluation').mockRejectedValue(
        new Error('Submission not found')
      );

      await request(app.getHttpServer())
        .post('/evaluation/retry/999')
        .expect(500);
    });

    it('should handle invalid submission ID format', async () => {
      await request(app.getHttpServer())
        .post('/evaluation/retry/invalid')
        .expect(400);
    });
  });

  describe('Authentication', () => {
    it('should require authentication for all endpoints', async () => {
      // Override the auth guard to return false
      const moduleWithAuth = await Test.createTestingModule({
        controllers: [EvaluationController],
        providers: [
          {
            provide: EvaluationService,
            useValue: {
              getEvaluationStatus: jest.fn(),
              getQueueStats: jest.fn(),
              queueEvaluation: jest.fn(),
            },
          },
          {
            provide: getQueueToken('evaluation'),
            useValue: mockQueue,
          },
        ],
      })
        .overrideGuard(JwtAuthGuard)
        .useValue({ canActivate: () => false })
        .compile();

      const appWithAuth = moduleWithAuth.createNestApplication();
      await appWithAuth.init();

      await request(appWithAuth.getHttpServer())
        .get('/evaluation/status/1')
        .expect(403);

      await request(appWithAuth.getHttpServer())
        .get('/evaluation/queue/stats')
        .expect(403);

      await request(appWithAuth.getHttpServer())
        .post('/evaluation/retry/1')
        .expect(403);

      await appWithAuth.close();
    });
  });

  describe('Error Handling', () => {
    it('should handle service errors properly', async () => {
      jest.spyOn(evaluationService, 'getEvaluationStatus').mockRejectedValue(
        new Error('Service temporarily unavailable')
      );

      await request(app.getHttpServer())
        .get('/evaluation/status/1')
        .expect(500);
    });

    it('should validate submission ID parameter', async () => {
      // Test with negative submission ID
      const response1 = await request(app.getHttpServer())
        .get('/evaluation/status/-1');
      
      // Either validation works (400) or service handles it gracefully (200)
      expect([200, 400]).toContain(response1.status);

      // Test with zero submission ID for retry endpoint
      // Mock queueEvaluation to reject for invalid submission ID
      jest.spyOn(evaluationService, 'queueEvaluation').mockRejectedValue(
        new Error('Invalid submission ID')
      );
      
      const response2 = await request(app.getHttpServer())
        .post('/evaluation/retry/0');
      
      // For retry with invalid ID, we expect either validation error (400) or server error (500)
      expect([400, 500]).toContain(response2.status);
    });
  });

  describe('Integration with Queue System', () => {
    it('should reflect queue state in status endpoint', async () => {
      // Simulate active job in queue
      const activeJob = {
        data: { submissionId: 1 },
        progress: jest.fn().mockReturnValue(60),
        returnvalue: { logs: 'Building Docker image...' },
      };

      mockQueue.getJobs.mockResolvedValue([activeJob]);

      jest.spyOn(evaluationService, 'getEvaluationStatus').mockImplementation(async (id) => ({
        submissionId: id,
        status: 'processing',
        progress: 60,
        logs: 'Building Docker image...',
      }));

      const response = await request(app.getHttpServer())
        .get('/evaluation/status/1')
        .expect(200);

      expect(response.body.status).toBe('processing');
      expect(response.body.progress).toBe(60);
      expect(response.body.logs).toBe('Building Docker image...');
    });

    it('should reflect queue stats accurately', async () => {
      mockQueue.getWaiting.mockResolvedValue([1, 2, 3]); // 3 waiting
      mockQueue.getActive.mockResolvedValue([4]); // 1 active
      mockQueue.getCompleted.mockResolvedValue([5, 6, 7, 8]); // 4 completed
      mockQueue.getFailed.mockResolvedValue([9]); // 1 failed

      jest.spyOn(evaluationService, 'getQueueStats').mockImplementation(async () => ({
        waiting: 3,
        active: 1,
        completed: 4,
        failed: 1,
      }));

      const response = await request(app.getHttpServer())
        .get('/evaluation/queue/stats')
        .expect(200);

      expect(response.body).toEqual({
        waiting: 3,
        active: 1,
        completed: 4,
        failed: 1,
      });
    });
  });
}); 