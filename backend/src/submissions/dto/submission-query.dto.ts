import { IsOptional, IsInt, IsEnum, IsString, IsIn, Min } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { SubmissionStatus } from '../types';

export class SubmissionQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Page must be an integer' })
  @Min(1, { message: 'Page must be at least 1' })
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Limit must be an integer' })
  @Min(1, { message: 'Limit must be at least 1' })
  limit?: number = 10;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'User ID must be an integer' })
  @Min(1, { message: 'User ID must be a positive integer' })
  userId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Challenge ID must be an integer' })
  @Min(1, { message: 'Challenge ID must be a positive integer' })
  challengeId?: number;

  @IsOptional()
  @IsEnum(SubmissionStatus, { 
    message: `Status must be one of: ${Object.values(SubmissionStatus).join(', ')}` 
  })
  status?: SubmissionStatus;

  @IsOptional()
  @IsString({ message: 'Search term must be a string' })
  search?: string;

  @IsOptional()
  @IsIn(['createdAt', 'updatedAt', 'score'], { 
    message: 'Sort field must be one of: createdAt, updatedAt, score' 
  })
  sortBy?: 'createdAt' | 'updatedAt' | 'score' = 'createdAt';

  @IsOptional()
  @IsIn(['asc', 'desc'], { 
    message: 'Sort order must be either asc or desc' 
  })
  sortOrder?: 'asc' | 'desc' = 'desc';
} 