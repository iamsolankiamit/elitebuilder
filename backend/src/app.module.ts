import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { BullModule } from '@nestjs/bull';
import { AuthModule } from './auth/auth.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ChallengesModule } from './challenges/challenges.module';
import { SubmissionsModule } from './submissions/submissions.module';
import { EvaluationModule } from './evaluation/evaluation.module';
import { LeaderboardModule } from './leaderboard/leaderboard.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6380', 10),
      },
    }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '1d' },
    }),
    AuthModule,
    PrismaModule,
    ChallengesModule,
    SubmissionsModule,
    EvaluationModule,
    LeaderboardModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
