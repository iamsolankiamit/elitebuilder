import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface ScoringCriteria {
  technical: number;      // /40
  presentation: number;   // /25
  innovation: number;     // /20
  usability: number;      // /15
}

export interface ScoringResult {
  totalScore: number;
  breakdown: ScoringCriteria;
  feedback: string;
  recommendations: string[];
}

@Injectable()
export class ScoringService {
  private readonly logger = new Logger(ScoringService.name);

  constructor(private configService: ConfigService) {}

  async scoreSubmission(
    repoUrl: string,
    pitchDeck: string,
    demoVideo: string,
    rubric: string,
    testResults: any,
    buildSuccess: boolean,
  ): Promise<ScoringResult> {
    
    // 1. Technical Score (40 points) - Based on automated tests and code analysis
    const technicalScore = await this.calculateTechnicalScore(testResults, buildSuccess);
    
    // 2. Presentation Score (25 points) - Based on LLM analysis of pitch deck and demo
    const presentationScore = await this.calculatePresentationScore(pitchDeck, demoVideo, rubric);
    
    // 3. Innovation Score (20 points) - LLM analysis of uniqueness and creativity
    const innovationScore = await this.calculateInnovationScore(repoUrl, rubric);
    
    // 4. Usability Score (15 points) - Based on UX analysis and demo quality
    const usabilityScore = await this.calculateUsabilityScore(demoVideo, testResults);

    const breakdown: ScoringCriteria = {
      technical: Math.min(40, Math.max(0, technicalScore)),
      presentation: Math.min(25, Math.max(0, presentationScore)),
      innovation: Math.min(20, Math.max(0, innovationScore)),
      usability: Math.min(15, Math.max(0, usabilityScore)),
    };

    const totalScore = breakdown.technical + breakdown.presentation + breakdown.innovation + breakdown.usability;

    const feedback = await this.generateFeedback(breakdown, rubric);
    const recommendations = await this.generateRecommendations(breakdown);

    return {
      totalScore,
      breakdown,
      feedback,
      recommendations,
    };
  }

  private async calculateTechnicalScore(testResults: any, buildSuccess: boolean): Promise<number> {
    if (!buildSuccess) return 5; // Minimum points for attempt

    let score = 15; // Base score for successful build

    // Add points based on test results
    if (testResults?.testsPass) {
      const testCoverage = testResults.testsCovered || 0;
      // Scale test coverage points (0-20 points based on coverage)
      score += Math.min(20, testCoverage * 2);
    } else if (testResults?.testsPass === false) {
      // Some tests ran but failed - partial credit
      score += 5;
    }

    // Code quality metrics (0-15 points)
    if (testResults?.codeQuality) {
      const qualityScore = testResults.codeQuality.score || 0;
      score += Math.min(15, qualityScore);
    } else {
      // No quality metrics available - give basic score
      score += 8;
    }

    // Additional technical checks
    if (testResults?.hasReadme) score += 2;
    if (testResults?.hasTests) score += 3;
    if (testResults?.hasDependencies) score += 2;
    if (testResults?.followsProjectStructure) score += 3;

    return Math.min(40, score);
  }

  private async calculatePresentationScore(pitchDeck: string, demoVideo: string, rubric: string): Promise<number> {
    let score = 5; // Base score
    
    // Check if resources are provided and accessible
    if (pitchDeck && this.isValidUrl(pitchDeck)) {
      score += 12; // Points for pitch deck (12/15 possible)
      // TODO: Add LLM analysis of pitch deck content
    } else if (pitchDeck) {
      score += 5; // Points for attempting to provide pitch deck
    }
    
    if (demoVideo && this.isValidUrl(demoVideo)) {
      score += 8; // Points for demo video (8/10 possible)
      // TODO: Add video analysis for UX quality
    } else if (demoVideo) {
      score += 3; // Points for attempting to provide demo video
    }

    // Bonus points for both materials
    if (pitchDeck && demoVideo && this.isValidUrl(pitchDeck) && this.isValidUrl(demoVideo)) {
      score += 5;
    }

    return Math.min(25, score);
  }

  private async calculateInnovationScore(repoUrl: string, rubric: string): Promise<number> {
    let score = 8; // Base innovation score
    
    if (!repoUrl || !this.isValidUrl(repoUrl)) {
      return 5; // Minimum score if no repo
    }

    // TODO: Implement actual repository analysis
    // For now, use heuristics that would be replaced with LLM analysis
    
    // Repository analysis would check:
    // - README quality and innovation description
    // - Use of modern frameworks/technologies
    // - Creative problem-solving approaches
    // - Unique features or approaches
    
    // Placeholder scoring based on availability
    score += 7; // Points for having a valid repository
    
    // TODO: Add these checks:
    // - Analyze README for innovation markers
    // - Check for unique dependencies/technologies
    // - Evaluate code structure for creative patterns
    // - Look for novel AI/ML implementations
    
    return Math.min(20, score);
  }

  private async calculateUsabilityScore(demoVideo: string, testResults: any): Promise<number> {
    let score = 6; // Base usability score
    
    // Check for demo video presence and quality
    if (demoVideo && this.isValidUrl(demoVideo)) {
      score += 6; // Points for demo video showing UX
      // TODO: Extract frames and analyze UI elements
    } else if (demoVideo) {
      score += 2; // Points for attempting demo
    }

    // UX checks from test results
    if (testResults?.userExperience) {
      const uxScore = testResults.userExperience.score || 0;
      score += Math.min(5, uxScore);
    }

    // Additional UX indicators
    if (testResults?.hasUserInterface) score += 2;
    if (testResults?.responsiveDesign) score += 1;
    
    return Math.min(15, score);
  }

  private async generateFeedback(breakdown: ScoringCriteria, rubric: string): Promise<string> {
    const feedback = `
**Evaluation Summary:**

**Technical Implementation (${breakdown.technical}/40):**
${breakdown.technical >= 30 ? 'Excellent technical execution with robust implementation.' :
  breakdown.technical >= 20 ? 'Good technical foundation with room for improvement.' :
  breakdown.technical >= 10 ? 'Decent technical attempt but needs significant work.' :
  'Technical implementation requires major improvements.'}

**Presentation Quality (${breakdown.presentation}/25):**
${breakdown.presentation >= 20 ? 'Outstanding presentation with clear communication.' :
  breakdown.presentation >= 15 ? 'Good presentation quality overall.' :
  breakdown.presentation >= 10 ? 'Adequate presentation with some clarity issues.' :
  'Presentation needs significant improvement in clarity and structure.'}

**Innovation (${breakdown.innovation}/20):**
${breakdown.innovation >= 15 ? 'Highly innovative approach with creative solutions.' :
  breakdown.innovation >= 10 ? 'Some innovative elements present.' :
  breakdown.innovation >= 5 ? 'Limited innovation demonstrated.' :
  'Very little innovation shown in the approach.'}

**Usability (${breakdown.usability}/15):**
${breakdown.usability >= 12 ? 'Excellent user experience design.' :
  breakdown.usability >= 8 ? 'Good usability with minor issues.' :
  breakdown.usability >= 5 ? 'Acceptable usability but needs improvement.' :
  'Usability needs significant enhancement.'}

**Overall Performance:**
${this.getOverallPerformanceMessage(breakdown.technical + breakdown.presentation + breakdown.innovation + breakdown.usability)}
`;

    return feedback.trim();
  }

  private async generateRecommendations(breakdown: ScoringCriteria): Promise<string[]> {
    const recommendations: string[] = [];

    if (breakdown.technical < 25) {
      recommendations.push('Improve code quality and test coverage');
      recommendations.push('Add more robust error handling and validation');
      recommendations.push('Ensure your application builds and runs successfully');
    }

    if (breakdown.presentation < 18) {
      recommendations.push('Enhance presentation clarity and structure');
      recommendations.push('Improve demo video quality and narration');
      recommendations.push('Create a more comprehensive pitch deck explaining your solution');
    }

    if (breakdown.innovation < 12) {
      recommendations.push('Explore more creative approaches to the problem');
      recommendations.push('Add unique features that differentiate your solution');
      recommendations.push('Consider novel applications of AI/ML techniques');
    }

    if (breakdown.usability < 10) {
      recommendations.push('Focus on user experience improvements');
      recommendations.push('Simplify the user interface and navigation');
      recommendations.push('Ensure your demo showcases clear user workflows');
    }

    // General recommendations
    if (recommendations.length === 0) {
      recommendations.push('Great work! Consider minor polish and additional features for even higher scores.');
    }

    return recommendations;
  }

  private getOverallPerformanceMessage(totalScore: number): string {
    if (totalScore >= 90) return 'Outstanding submission! This demonstrates exceptional skill and creativity.';
    if (totalScore >= 80) return 'Excellent work! This is a strong submission with minor areas for improvement.';
    if (totalScore >= 70) return 'Good submission with solid fundamentals and room for enhancement.';
    if (totalScore >= 60) return 'Decent attempt with several areas needing improvement.';
    if (totalScore >= 50) return 'Basic submission that meets minimum requirements but needs significant work.';
    return 'This submission requires substantial improvements across multiple areas.';
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  // TODO: Implement LLM integration methods
  // private async analyzePresentationWithLLM(pitchDeck: string, demoVideo: string, rubric: string): Promise<number> {
  //   // Integration with OpenAI, Anthropic, or other LLM services
  //   // This would analyze the content and return a score based on the rubric
  // }
} 