import { PartialType } from '@nestjs/mapped-types';
import { CreateSubmissionDto } from './create-submission.dto';
import { IsOptional, IsNumber, IsEnum, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { SubmissionStatus } from '../types';

export class UpdateSubmissionDto extends PartialType(CreateSubmissionDto) {
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Score must be a valid number with at most 2 decimal places' })
  @Min(0, { message: 'Score must be at least 0' })
  @Max(100, { message: 'Score must not exceed 100' })
  score?: number;

  @IsOptional()
  @IsEnum(SubmissionStatus, { 
    message: `Status must be one of: ${Object.values(SubmissionStatus).join(', ')}` 
  })
  status?: SubmissionStatus;
} 