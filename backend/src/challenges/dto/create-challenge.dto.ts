import { IsString, IsOptional, IsNumber, IsDateString, Min } from 'class-validator';

export class CreateChallengeDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  dataset?: string;

  @IsString()
  rubric: string;

  @IsDateString()
  deadline: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  prize?: number;
} 