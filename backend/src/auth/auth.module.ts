import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { GithubStrategy } from './github.strategy';
import { JwtStrategy } from './jwt.strategy';
import { OptionalJwtAuthGuard } from './optional-jwt-auth.guard';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    PassportModule,
    ConfigModule,
    PrismaModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: '7d' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, GithubStrategy, JwtStrategy, OptionalJwtAuthGuard],
  exports: [AuthService, JwtStrategy, OptionalJwtAuthGuard],
})
export class AuthModule {} 