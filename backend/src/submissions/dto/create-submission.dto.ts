import { IsString, IsUrl, IsInt, IsNotEmpty, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateSubmissionDto {
  @IsNotEmpty({ message: 'Repository URL is required' })
  @IsUrl({}, { message: 'Repository URL must be a valid URL' })
  repoUrl: string;

  @IsNotEmpty({ message: 'Pitch deck URL is required' })
  @IsUrl({}, { message: 'Pitch deck URL must be a valid URL' })
  pitchDeck: string;

  @IsNotEmpty({ message: 'Demo video URL is required' })
  @IsUrl({}, { message: 'Demo video URL must be a valid URL' })
  demoVideo: string;

  @IsNotEmpty({ message: 'Challenge ID is required' })
  @Type(() => Number)
  @IsInt({ message: 'Challenge ID must be an integer' })
  @Min(1, { message: 'Challenge ID must be a positive integer' })
  challengeId: number;
}

export class CreateNestedSubmissionDto {
  @IsNotEmpty({ message: 'Repository URL is required' })
  @IsUrl({}, { message: 'Repository URL must be a valid URL' })
  repoUrl: string;

  @IsNotEmpty({ message: 'Pitch deck URL is required' })
  @IsUrl({}, { message: 'Pitch deck URL must be a valid URL' })
  pitchDeck: string;

  @IsNotEmpty({ message: 'Demo video URL is required' })
  @IsUrl({}, { message: 'Demo video URL must be a valid URL' })
  demoVideo: string;
} 