export class CreateChallengeDto {
  title: string;
  description: string;
  dataset?: string;
  rubric: string;
  deadline: string;
  prize?: number;
} 