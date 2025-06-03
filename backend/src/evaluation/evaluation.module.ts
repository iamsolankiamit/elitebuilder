import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { EvaluationService } from './evaluation.service';
import { EvaluationController } from './evaluation.controller';
import { EvaluationProcessor } from './evaluation.processor';
import { ScoringService } from './scoring.service';
import { DockerService } from './docker.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    BullModule.registerQueue({
      name: 'evaluation',
      defaultJobOptions: {
        removeOnComplete: 10,
        removeOnFail: 5,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      },
    }),
  ],
  controllers: [EvaluationController],
  providers: [
    EvaluationService,
    EvaluationProcessor,
    ScoringService,
    DockerService,
  ],
  exports: [EvaluationService],
})
export class EvaluationModule {} 