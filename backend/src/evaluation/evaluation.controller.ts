import { Controller, Get, Post, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { EvaluationService } from './evaluation.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('evaluation')
@UseGuards(JwtAuthGuard)
export class EvaluationController {
  constructor(private readonly evaluationService: EvaluationService) {}

  @Get('status/:submissionId')
  async getEvaluationStatus(@Param('submissionId', ParseIntPipe) submissionId: number) {
    return this.evaluationService.getEvaluationStatus(submissionId);
  }

  @Get('queue/stats')
  async getQueueStats() {
    return this.evaluationService.getQueueStats();
  }

  @Post('retry/:submissionId')
  async retryEvaluation(@Param('submissionId', ParseIntPipe) submissionId: number) {
    await this.evaluationService.queueEvaluation(submissionId);
    return { message: 'Evaluation queued successfully' };
  }
} 