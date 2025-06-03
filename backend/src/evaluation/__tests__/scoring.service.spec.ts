import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { ScoringService, ScoringResult } from '../scoring.service';

describe('ScoringService', () => {
  let service: ScoringService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScoringService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const config = {
                'LLM_API_KEY': 'test-api-key',
                'LLM_MODEL': 'gpt-4',
              };
              return config[key];
            }),
          },
        },
      ],
    }).compile();

    service = module.get<ScoringService>(ScoringService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('scoreSubmission', () => {
    const mockTestResults = {
      testsPass: true,
      testsCovered: 10,
      hasReadme: true,
      hasTests: true,
      hasDependencies: true,
      followsProjectStructure: true,
      hasUserInterface: true,
      codeQuality: {
        score: 8,
      },
      userExperience: {
        score: 4,
      },
    };

    it('should calculate total score correctly for excellent submission', async () => {
      const result = await service.scoreSubmission(
        'https://github.com/test/repo',
        'https://example.com/deck.pdf',
        'https://example.com/video.mp4',
        'Test rubric for scoring',
        mockTestResults,
        true
      );

      expect(result.totalScore).toBeGreaterThan(80);
      expect(result.breakdown.technical).toBeGreaterThan(30);
      expect(result.breakdown.presentation).toBeGreaterThan(20);
      expect(result.breakdown.innovation).toBeGreaterThan(10);
      expect(result.breakdown.usability).toBeGreaterThan(10);
      expect(result.feedback).toContain('Evaluation Summary');
      expect(result.recommendations).toBeInstanceOf(Array);
    });

    it('should penalize failed builds appropriately', async () => {
      const result = await service.scoreSubmission(
        'https://github.com/test/repo',
        'https://example.com/deck.pdf',
        'https://example.com/video.mp4',
        'Test rubric',
        {},
        false // Build failed
      );

      expect(result.breakdown.technical).toBe(5); // Minimum score for build failure
      expect(result.totalScore).toBeLessThan(60); // Adjusted expectation
    });

    it('should handle missing presentation materials', async () => {
      const result = await service.scoreSubmission(
        'https://github.com/test/repo',
        '', // No pitch deck
        '', // No demo video
        'Test rubric',
        mockTestResults,
        true
      );

      expect(result.breakdown.presentation).toBeLessThan(15);
      expect(result.breakdown.usability).toBeLessThan(15); // Adjusted expectation
    });

    it('should validate URL formats properly', async () => {
      const result = await service.scoreSubmission(
        'invalid-url',
        'also-invalid',
        'not-a-url',
        'Test rubric',
        mockTestResults,
        true
      );

      expect(result.breakdown.presentation).toBeLessThan(15);
      expect(result.breakdown.innovation).toBe(5); // Minimum for invalid repo URL
    });

    it('should cap scores at maximum values', async () => {
      // Create test results that would exceed maximum scores
      const excellentResults = {
        ...mockTestResults,
        testsCovered: 100, // Very high test coverage
        codeQuality: { score: 20 }, // Very high quality score
        userExperience: { score: 10 }, // High UX score
      };

      const result = await service.scoreSubmission(
        'https://github.com/test/repo',
        'https://example.com/deck.pdf',
        'https://example.com/video.mp4',
        'Test rubric',
        excellentResults,
        true
      );

      expect(result.breakdown.technical).toBeLessThanOrEqual(40);
      expect(result.breakdown.presentation).toBeLessThanOrEqual(25);
      expect(result.breakdown.innovation).toBeLessThanOrEqual(20);
      expect(result.breakdown.usability).toBeLessThanOrEqual(15);
      expect(result.totalScore).toBeLessThanOrEqual(100);
    });
  });

  describe('calculateTechnicalScore', () => {
    it('should reward successful builds with tests', async () => {
      const testResults = {
        testsPass: true,
        testsCovered: 15,
        codeQuality: { score: 10 },
        hasReadme: true,
        hasTests: true,
        hasDependencies: true,
        followsProjectStructure: true,
      };

      const score = await (service as any).calculateTechnicalScore(testResults, true);

      expect(score).toBeLessThanOrEqual(40); // Should be capped at maximum
      expect(score).toBeGreaterThan(35); // Should get high score
    });

    it('should give partial credit for failed tests', async () => {
      const testResults = {
        testsPass: false,
        testsCovered: 5,
        codeQuality: { score: 6 },
        hasReadme: false,
        hasTests: false,
        hasDependencies: true,
        followsProjectStructure: false,
      };

      const score = await (service as any).calculateTechnicalScore(testResults, true);

      expect(score).toBeGreaterThan(15); // Base + partial credits
      expect(score).toBeLessThan(30); // But less than full credit
    });

    it('should give minimum score for build failures', async () => {
      const score = await (service as any).calculateTechnicalScore({}, false);

      expect(score).toBe(5); // Minimum score
    });
  });

  describe('calculatePresentationScore', () => {
    it('should reward both pitch deck and demo video', async () => {
      const score = await (service as any).calculatePresentationScore(
        'https://example.com/deck.pdf',
        'https://example.com/video.mp4',
        'Test rubric'
      );

      expect(score).toBeGreaterThan(20); // Should get bonus for both
    });

    it('should give partial credit for invalid URLs', async () => {
      const score = await (service as any).calculatePresentationScore(
        'invalid-deck-url',
        'invalid-video-url',
        'Test rubric'
      );

      expect(score).toBeGreaterThan(5); // Base score
      expect(score).toBeLessThan(15); // But less than full credit
    });

    it('should handle missing materials gracefully', async () => {
      const score = await (service as any).calculatePresentationScore(
        '',
        '',
        'Test rubric'
      );

      expect(score).toBe(5); // Just base score
    });
  });

  describe('calculateInnovationScore', () => {
    it('should give points for valid repository', async () => {
      const score = await (service as any).calculateInnovationScore(
        'https://github.com/test/repo',
        'Test rubric'
      );

      expect(score).toBeGreaterThan(8); // Base + repository points
      expect(score).toBeLessThanOrEqual(20);
    });

    it('should give minimum score for invalid repository', async () => {
      const score = await (service as any).calculateInnovationScore(
        'invalid-url',
        'Test rubric'
      );

      expect(score).toBe(5); // Minimum score
    });

    it('should handle missing repository URL', async () => {
      const score = await (service as any).calculateInnovationScore(
        '',
        'Test rubric'
      );

      expect(score).toBe(5); // Minimum score
    });
  });

  describe('calculateUsabilityScore', () => {
    it('should reward demo video and good UX', async () => {
      const testResults = {
        userExperience: { score: 5 },
        hasUserInterface: true,
        responsiveDesign: true,
      };

      const score = await (service as any).calculateUsabilityScore(
        'https://example.com/video.mp4',
        testResults
      );

      expect(score).toBeGreaterThan(10);
      expect(score).toBeLessThanOrEqual(15);
    });

    it('should handle missing demo video', async () => {
      const testResults = {
        userExperience: { score: 3 },
        hasUserInterface: false,
      };

      const score = await (service as any).calculateUsabilityScore(
        '',
        testResults
      );

      expect(score).toBeGreaterThan(6); // Base + some UX points
      expect(score).toBeLessThan(12);
    });
  });

  describe('generateFeedback', () => {
    it('should provide appropriate feedback for excellent scores', async () => {
      const breakdown = {
        technical: 38,
        presentation: 23,
        innovation: 18,
        usability: 14,
      };

      const feedback = await (service as any).generateFeedback(breakdown, 'Test rubric');

      expect(feedback).toContain('Excellent technical execution');
      expect(feedback).toContain('Outstanding presentation');
      expect(feedback).toContain('Highly innovative');
      expect(feedback).toContain('Excellent user experience');
      expect(feedback).toContain('Outstanding submission');
    });

    it('should provide constructive feedback for poor scores', async () => {
      const breakdown = {
        technical: 8,
        presentation: 6,
        innovation: 4,
        usability: 3,
      };

      const feedback = await (service as any).generateFeedback(breakdown, 'Test rubric');

      expect(feedback).toContain('requires major improvements');
      expect(feedback).toContain('needs significant improvement');
      expect(feedback).toContain('Very little innovation');
      expect(feedback).toContain('substantial improvements');
    });
  });

  describe('generateRecommendations', () => {
    it('should provide specific recommendations for low technical scores', async () => {
      const breakdown = {
        technical: 15,
        presentation: 20,
        innovation: 15,
        usability: 12,
      };

      const recommendations = await (service as any).generateRecommendations(breakdown);

      expect(recommendations.some(r => r.includes('Improve code quality'))).toBe(true);
      expect(recommendations.some(r => r.includes('error handling'))).toBe(true);
    });

    it('should provide recommendations for low presentation scores', async () => {
      const breakdown = {
        technical: 35,
        presentation: 10,
        innovation: 15,
        usability: 12,
      };

      const recommendations = await (service as any).generateRecommendations(breakdown);

      expect(recommendations.some(r => r.includes('presentation clarity'))).toBe(true);
      expect(recommendations.some(r => r.includes('demo video quality'))).toBe(true);
    });

    it('should provide positive feedback for excellent scores', async () => {
      const breakdown = {
        technical: 38,
        presentation: 23,
        innovation: 18,
        usability: 14,
      };

      const recommendations = await (service as any).generateRecommendations(breakdown);

      expect(recommendations.some(r => r.includes('Great work'))).toBe(true);
      expect(recommendations.length).toBe(1);
    });
  });

  describe('URL validation', () => {
    it('should validate proper URLs', () => {
      const isValid = (service as any).isValidUrl('https://example.com/file.pdf');
      expect(isValid).toBe(true);
    });

    it('should reject invalid URLs', () => {
      const isValid = (service as any).isValidUrl('not-a-url');
      expect(isValid).toBe(false);
    });

    it('should handle empty strings', () => {
      const isValid = (service as any).isValidUrl('');
      expect(isValid).toBe(false);
    });
  });
}); 