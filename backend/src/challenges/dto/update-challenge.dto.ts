import { PartialType } from '@nestjs/mapped-types';
import { CreateChallengeDto } from './create-challenge.dto';

export class UpdateChallengeDto {
  title?: string;
  description?: string;
  dataset?: string;
  rubric?: string;
  deadline?: string;
  prize?: number;
} 