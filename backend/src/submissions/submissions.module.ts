import { Module } from '@nestjs/common';
import { SubmissionsService } from './submissions.service';
import { SubmissionsController } from './submissions.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { EvaluationModule } from '../evaluation/evaluation.module';

@Module({
  imports: [PrismaModule, EvaluationModule],
  controllers: [SubmissionsController],
  providers: [SubmissionsService],
  exports: [SubmissionsService],
})
export class SubmissionsModule {} 