import { 
  Controller, 
  Get, 
  Query, 
  Param, 
  ParseIntPipe
} from '@nestjs/common';
import { LeaderboardService } from './leaderboard.service';
import { LeaderboardQueryDto, UserRankingQueryDto } from './dto/leaderboard-query.dto';
import { 
  LeaderboardResponse, 
  LeaderboardEntry, 
  UserRankingInfo,
  LeaderboardPeriod,
  LeaderboardCategory
} from './types/leaderboard.types';

@Controller('leaderboard')
export class LeaderboardController {
  constructor(private readonly leaderboardService: LeaderboardService) {}

  @Get('stats')
  async getLeaderboardStats() {
    // Get dashboard statistics for the leaderboard overview
    return this.leaderboardService.getDashboardStats();
  }

  @Get('test-stats')
  async getTestStats() {
    // Force reload
    return { message: 'Test endpoint working', timestamp: new Date() };
  }

  @Get()
  async getLeaderboard(
    @Query() query: LeaderboardQueryDto
  ): Promise<LeaderboardResponse> {
    return this.leaderboardService.getLeaderboard(query);
  }

  @Get('global')
  async getGlobalLeaderboard(
    @Query() query: LeaderboardQueryDto
  ): Promise<LeaderboardResponse> {
    // Force global/all-time settings
    const globalQuery = {
      ...query,
      period: LeaderboardPeriod.ALL_TIME,
      category: LeaderboardCategory.OVERALL
    };
    return this.leaderboardService.getLeaderboard(globalQuery);
  }

  @Get('monthly')
  async getMonthlyLeaderboard(
    @Query() query: LeaderboardQueryDto
  ): Promise<LeaderboardResponse> {
    // Force monthly settings
    const monthlyQuery = {
      ...query,
      period: LeaderboardPeriod.MONTHLY
    };
    return this.leaderboardService.getLeaderboard(monthlyQuery);
  }

  @Get('top-performers')
  async getTopPerformers(
    @Query('limit') limitStr?: string
  ): Promise<LeaderboardEntry[]> {
    const limit = limitStr ? parseInt(limitStr, 10) : undefined;
    return this.leaderboardService.getTopPerformers(limit);
  }

  @Get('monthly-champions')
  async getMonthlyChampions(
    @Query('limit') limitStr?: string
  ): Promise<LeaderboardEntry[]> {
    const limit = limitStr ? parseInt(limitStr, 10) : undefined;
    return this.leaderboardService.getMonthlyChampions(limit);
  }

  @Get('sponsor-favorites')
  async getSponsorFavorites(
    @Query('limit') limitStr?: string
  ): Promise<LeaderboardEntry[]> {
    const limit = limitStr ? parseInt(limitStr, 10) : undefined;
    return this.leaderboardService.getSponsorFavorites(limit);
  }

  @Get('categories/:category')
  async getCategoryLeaderboard(
    @Param('category') category: string,
    @Query() query: LeaderboardQueryDto
  ): Promise<LeaderboardResponse> {
    // Set the category from the URL parameter
    const categoryQuery = {
      ...query,
      category: category as any
    };
    return this.leaderboardService.getLeaderboard(categoryQuery);
  }

  @Get('user/:userId/ranking')
  async getUserRanking(
    @Param('userId', ParseIntPipe) userId: number,
    @Query() query: Omit<UserRankingQueryDto, 'userId'>
  ): Promise<UserRankingInfo> {
    const rankingQuery: UserRankingQueryDto = {
      userId,
      ...query
    };
    return this.leaderboardService.getUserRanking(rankingQuery);
  }
} 