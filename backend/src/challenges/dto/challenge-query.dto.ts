export class ChallengeQueryDto {
  page?: number = 1;
  limit?: number = 10;
  search?: string;
  creatorId?: number;
  includeExpired?: boolean = false;
  sortBy?: 'createdAt' | 'deadline' | 'prize' = 'createdAt';
  sortOrder?: 'asc' | 'desc' = 'desc';
} 