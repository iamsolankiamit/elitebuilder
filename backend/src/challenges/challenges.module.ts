import { Module } from '@nestjs/common';
import { ChallengesController } from './challenges.controller';
import { ChallengesService } from './challenges.service';
import { PrismaModule } from '../prisma/prisma.module';
import { SubmissionsModule } from '../submissions/submissions.module';

@Module({
  imports: [PrismaModule, SubmissionsModule],
  controllers: [ChallengesController],
  providers: [ChallengesService],
  exports: [ChallengesService],
})
export class ChallengesModule {} 