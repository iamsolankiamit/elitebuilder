import { IsOptional, IsEnum, IsNumber, IsString, IsBoolean, Min, Max } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { LeaderboardPeriod, LeaderboardCategory, SortBy } from '../types/leaderboard.types';

export class LeaderboardQueryDto {
  @IsOptional()
  @IsEnum(LeaderboardPeriod)
  period?: LeaderboardPeriod = LeaderboardPeriod.ALL_TIME;

  @IsOptional()
  @IsEnum(LeaderboardCategory)
  category?: LeaderboardCategory = LeaderboardCategory.OVERALL;

  @IsOptional()
  @IsEnum(SortBy)
  sortBy?: SortBy = SortBy.CAREER_SCORE;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 50;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  search?: string;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  badgedOnly?: boolean = false;
}

export class UserRankingQueryDto {
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  userId: number;

  @IsOptional()
  @IsEnum(LeaderboardCategory)
  category?: LeaderboardCategory = LeaderboardCategory.OVERALL;
} 