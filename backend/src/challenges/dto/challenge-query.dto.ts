import { IsOptional, IsString, IsNumber, IsBoolean, IsIn, Min } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class ChallengeQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  creatorId?: number;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  includeExpired?: boolean = false;

  @IsOptional()
  @IsIn(['createdAt', 'deadline', 'prize'])
  sortBy?: 'createdAt' | 'deadline' | 'prize' = 'createdAt';

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';
} 