import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { 
  LeaderboardPeriod, 
  LeaderboardCategory, 
  SortBy, 
  LeaderboardEntry, 
  LeaderboardResponse,
  UserRankingInfo 
} from './types/leaderboard.types';
import { LeaderboardQueryDto, UserRankingQueryDto } from './dto/leaderboard-query.dto';

@Injectable()
export class LeaderboardService {
  constructor(private prisma: PrismaService) {}

  async getLeaderboard(query: LeaderboardQueryDto): Promise<LeaderboardResponse> {
    const { 
      period = LeaderboardPeriod.ALL_TIME, 
      category = LeaderboardCategory.OVERALL,
      sortBy = SortBy.CAREER_SCORE,
      page = 1, 
      limit = 50,
      search,
      badgedOnly = false
    } = query;

    const skip = (page - 1) * limit;
    const dateFilter = this.getDateFilter(period);

    // Build where clause
    const whereClause: any = {
      ...(search && {
        OR: [
          { username: { contains: search, mode: 'insensitive' } },
          { name: { contains: search, mode: 'insensitive' } }
        ]
      }),
      ...(badgedOnly && {
        badges: {
          some: {}
        }
      })
    };

    // Get total count for pagination
    const total = await this.prisma.user.count({
      where: whereClause
    });

    // Build order by clause
    const orderBy = this.getOrderByClause(sortBy, period);

    // Fetch users with their related data
    const users = await this.prisma.user.findMany({
      where: whereClause,
      orderBy,
      skip,
      take: limit,
      include: {
        badges: {
          select: {
            id: true,
            name: true,
            type: true,
            imageUrl: true
          }
        },
        submissions: {
          where: {
            ...(dateFilter && { createdAt: dateFilter }),
            status: 'SCORED'
          },
          include: {
            challenge: {
              select: {
                title: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 3
        },
        _count: {
          select: {
            submissions: {
              where: {
                ...(dateFilter && { createdAt: dateFilter }),
                status: 'SCORED'
              }
            }
          }
        }
      }
    });

    // Transform users to leaderboard entries
    const entries: LeaderboardEntry[] = await Promise.all(
      users.map(async (user, index) => {
        const submissionStats = await this.calculateSubmissionStats(user.id, period);
        
        return {
          rank: skip + index + 1,
          user: {
            id: user.id,
            username: user.username,
            name: user.name,
            avatar: user.avatar,
            location: user.location,
            githubUrl: user.githubUrl
          },
          careerScore: user.careerScore,
          submissionCount: user._count.submissions,
          averageScore: submissionStats.averageScore,
          winRate: submissionStats.winRate,
          badges: user.badges,
          recentSubmissions: user.submissions.map(submission => ({
            id: submission.id,
            challengeTitle: submission.challenge.title,
            score: submission.score,
            createdAt: submission.createdAt
          })),
          ...(period === LeaderboardPeriod.MONTHLY && { 
            monthlyScore: submissionStats.periodScore 
          }),
          ...(period === LeaderboardPeriod.WEEKLY && { 
            weeklyScore: submissionStats.periodScore 
          })
        };
      })
    );

    return {
      entries,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      period,
      category,
      lastUpdated: new Date()
    };
  }

  async getUserRanking(query: UserRankingQueryDto): Promise<UserRankingInfo> {
    const { userId, category = LeaderboardCategory.OVERALL } = query;

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { careerScore: true }
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Get global rank
    const globalRank = await this.prisma.user.count({
      where: {
        careerScore: {
          gt: user.careerScore
        }
      }
    }) + 1;

    // Get monthly rank (submissions in current month)
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const monthlyRank = await this.getUserRankForPeriod(userId, monthStart);

    // Get category rank (this would need challenge categorization)
    const categoryRank = globalRank; // Simplified for now

    // Get total users
    const totalUsers = await this.prisma.user.count();

    // Calculate percentile
    const percentile = Math.round(((totalUsers - globalRank + 1) / totalUsers) * 100);

    return {
      globalRank,
      monthlyRank,
      categoryRank,
      totalUsers,
      careerScore: user.careerScore,
      percentile
    };
  }

  async getTopPerformers(limit: number = 10): Promise<LeaderboardEntry[]> {
    const query: LeaderboardQueryDto = {
      period: LeaderboardPeriod.ALL_TIME,
      category: LeaderboardCategory.OVERALL,
      sortBy: SortBy.CAREER_SCORE,
      page: 1,
      limit
    };

    const result = await this.getLeaderboard(query);
    return result.entries;
  }

  async getMonthlyChampions(limit: number = 10): Promise<LeaderboardEntry[]> {
    const query: LeaderboardQueryDto = {
      period: LeaderboardPeriod.MONTHLY,
      category: LeaderboardCategory.OVERALL,
      sortBy: SortBy.CAREER_SCORE,
      page: 1,
      limit
    };

    const result = await this.getLeaderboard(query);
    return result.entries;
  }

  async getSponsorFavorites(limit: number = 10): Promise<LeaderboardEntry[]> {
    // Get users with SPONSOR_FAVORITE badges
    const query: LeaderboardQueryDto = {
      period: LeaderboardPeriod.ALL_TIME,
      category: LeaderboardCategory.OVERALL,
      sortBy: SortBy.CAREER_SCORE,
      page: 1,
      limit,
      badgedOnly: true
    };

    const result = await this.getLeaderboard(query);
    
    // Filter for users with sponsor favorite badges
    return result.entries.filter(entry => 
      entry.badges.some(badge => badge.type === 'SPONSOR_FAVORITE')
    );
  }

  async getDashboardStats() {
    console.log('🔥 getDashboardStats called!');
    // Get total users
    const totalUsers = await this.prisma.user.count();

    // Get total submissions
    const totalSubmissions = await this.prisma.submission.count();

    // Get average career score (only for users with non-zero scores)
    const usersWithScores = await this.prisma.user.findMany({
      where: {
        careerScore: { gt: 0 }
      },
      select: { careerScore: true }
    });

    const avgCareerScore = usersWithScores.length > 0 
      ? usersWithScores.reduce((sum, user) => sum + user.careerScore, 0) / usersWithScores.length
      : 0;

    // Get top performers count (users with career score > 80th percentile)
    const allScores = await this.prisma.user.findMany({
      where: { careerScore: { gt: 0 } },
      select: { careerScore: true },
      orderBy: { careerScore: 'desc' }
    });

    const percentile80Index = Math.floor(allScores.length * 0.2); // Top 20%
    const topPerformersThreshold = allScores[percentile80Index]?.careerScore || 500;
    
    const topPerformers = await this.prisma.user.count({
      where: { careerScore: { gte: topPerformersThreshold } }
    });

    return {
      totalUsers,
      totalSubmissions,
      avgCareerScore: Math.round(avgCareerScore * 100) / 100,
      topPerformers
    };
  }

  private getDateFilter(period: LeaderboardPeriod) {
    const now = new Date();
    
    switch (period) {
      case LeaderboardPeriod.WEEKLY:
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        weekStart.setHours(0, 0, 0, 0);
        return { gte: weekStart };
        
      case LeaderboardPeriod.MONTHLY:
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        return { gte: monthStart };
        
      case LeaderboardPeriod.YEARLY:
        const yearStart = new Date(now.getFullYear(), 0, 1);
        return { gte: yearStart };
        
      default:
        return null;
    }
  }

  private getOrderByClause(sortBy: SortBy, period: LeaderboardPeriod) {
    switch (sortBy) {
      case SortBy.CAREER_SCORE:
        return { careerScore: 'desc' as const };
      case SortBy.RECENT_ACTIVITY:
        return { updatedAt: 'desc' as const };
      default:
        return { careerScore: 'desc' as const };
    }
  }

  private async calculateSubmissionStats(userId: number, period: LeaderboardPeriod) {
    const dateFilter = this.getDateFilter(period);
    
    const submissions = await this.prisma.submission.findMany({
      where: {
        userId,
        status: 'SCORED',
        score: { not: null },
        ...(dateFilter && { createdAt: dateFilter })
      },
      select: {
        score: true,
        challenge: {
          select: {
            prize: true
          }
        }
      }
    });

    if (submissions.length === 0) {
      return {
        averageScore: 0,
        winRate: 0,
        periodScore: 0
      };
    }

    const scores = submissions.map(s => s.score).filter(score => score !== null) as number[];
    const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    
    // Win rate: percentage of submissions scoring above 80
    const wins = scores.filter(score => score >= 80).length;
    const winRate = (wins / scores.length) * 100;
    
    // Period score: weighted average based on prizes
    const weightedScores = submissions.map(s => ({
      score: s.score || 0,
      weight: s.challenge.prize || 1000 // Default weight if no prize
    }));
    
    const totalWeight = weightedScores.reduce((sum, item) => sum + item.weight, 0);
    const periodScore = weightedScores.reduce((sum, item) => 
      sum + (item.score * item.weight), 0
    ) / totalWeight;

    return {
      averageScore: Math.round(averageScore * 100) / 100,
      winRate: Math.round(winRate * 100) / 100,
      periodScore: Math.round(periodScore * 100) / 100
    };
  }

  private async getUserRankForPeriod(userId: number, fromDate: Date): Promise<number> {
    // Calculate user's score for the period
    const userSubmissions = await this.prisma.submission.findMany({
      where: {
        userId,
        status: 'SCORED',
        score: { not: null },
        createdAt: { gte: fromDate }
      },
      select: { score: true }
    });

    const userScore = userSubmissions.reduce((sum, s) => sum + (s.score || 0), 0);

    // Count users with better scores in the same period
    const betterUsers = await this.prisma.user.count({
      where: {
        submissions: {
          some: {
            status: 'SCORED',
            score: { not: null },
            createdAt: { gte: fromDate }
          }
        }
      }
    });

    // This is a simplified ranking - in production you'd want more sophisticated logic
    return betterUsers + 1;
  }
} 