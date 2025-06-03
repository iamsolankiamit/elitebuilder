import { Injectable, NotFoundException, ForbiddenException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBadgeDto, AwardSponsorBadgeDto, BadgeQueryDto } from './dto/badge.dto';
import { BadgeType, Badge, BadgeStats, SponsorBadgeActivity } from './types/badge.types';

@Injectable()
export class BadgesService {
  private readonly logger = new Logger(BadgesService.name);

  constructor(private prisma: PrismaService) {}

  async createBadge(createBadgeDto: CreateBadgeDto): Promise<any> {
    try {
      // Check if user exists
      const user = await this.prisma.user.findUnique({
        where: { id: createBadgeDto.userId }
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Check for duplicate badge for same user
      const existingBadge = await this.prisma.badge.findUnique({
        where: {
          userId_name: {
            userId: createBadgeDto.userId,
            name: createBadgeDto.name
          }
        }
      });

      if (existingBadge) {
        throw new BadRequestException('User already has this badge');
      }

      return await this.prisma.badge.create({
        data: createBadgeDto
      });
    } catch (error) {
      this.logger.error('Failed to create badge', error);
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to create badge');
    }
  }

  async awardSponsorBadge(awardSponsorBadgeDto: AwardSponsorBadgeDto, sponsorId: number): Promise<any> {
    try {
      // Verify sponsor permissions
      const sponsor = await this.prisma.user.findUnique({
        where: { id: sponsorId },
        select: { isSponsor: true, isAdmin: true }
      });

      if (!sponsor || (!sponsor.isSponsor && !sponsor.isAdmin)) {
        throw new ForbiddenException('Only sponsors can award sponsor badges');
      }

      // Check if target user exists
      const targetUser = await this.prisma.user.findUnique({
        where: { id: awardSponsorBadgeDto.userId },
        select: { id: true, username: true, name: true }
      });

      if (!targetUser) {
        throw new NotFoundException('Target user not found');
      }

      // If challengeId is provided, verify it exists and user participated
      let challenge: { title: string } | null = null;
      if (awardSponsorBadgeDto.challengeId) {
        const challengeData = await this.prisma.challenge.findUnique({
          where: { id: awardSponsorBadgeDto.challengeId },
          select: { 
            title: true,
            submissions: {
              where: { userId: awardSponsorBadgeDto.userId },
              select: { id: true }
            }
          }
        });

        if (!challengeData) {
          throw new NotFoundException('Challenge not found');
        }

        if (challengeData.submissions.length === 0) {
          throw new BadRequestException('User did not participate in this challenge');
        }

        challenge = { title: challengeData.title };
      }

      // Create sponsor favorite badge
      const badgeName = awardSponsorBadgeDto.customName || 'Sponsor Favorite';
      const badgeDescription = awardSponsorBadgeDto.customDescription || 
        `Recognized as a sponsor favorite${challenge ? ` for challenge: ${challenge.title}` : ''}`;

      // Check for existing sponsor favorite badge for this user
      const existingBadge = await this.prisma.badge.findFirst({
        where: {
          userId: awardSponsorBadgeDto.userId,
          type: 'SPONSOR_FAVORITE',
          name: badgeName
        }
      });

      if (existingBadge) {
        throw new BadRequestException('User already has this sponsor badge');
      }

      const badge = await this.prisma.badge.create({
        data: {
          name: badgeName,
          description: badgeDescription,
          imageUrl: 'https://cdn.elitebuilders.dev/badges/sponsor-favorite.png', // Default sponsor badge image
          type: 'SPONSOR_FAVORITE',
          userId: awardSponsorBadgeDto.userId
        }
      });

      // Log the activity for tracking
      this.logger.log(`Sponsor ${sponsorId} awarded badge "${badgeName}" to user ${awardSponsorBadgeDto.userId}`);

      return badge;
    } catch (error) {
      this.logger.error('Failed to award sponsor badge', error);
      if (error instanceof NotFoundException || error instanceof ForbiddenException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to award sponsor badge');
    }
  }

  async getBadges(query: BadgeQueryDto) {
    const { page = 1, limit = 20, userId, type, search } = query;
    const skip = (page - 1) * limit;

    const whereClause: any = {};

    if (userId) {
      whereClause.userId = userId;
    }

    if (type) {
      whereClause.type = type;
    }

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [badges, total] = await Promise.all([
      this.prisma.badge.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              name: true,
              avatar: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      this.prisma.badge.count({ where: whereClause })
    ]);

    return {
      badges,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async getSponsorFavorites(limit: number = 10) {
    const badges = await this.prisma.badge.findMany({
      where: {
        type: 'SPONSOR_FAVORITE'
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            name: true,
            avatar: true,
            location: true,
            githubUrl: true,
            careerScore: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    });

    return badges.map((badge, index) => ({
      rank: index + 1,
      badge,
      user: badge.user
    }));
  }

  async getBadgeStats(): Promise<BadgeStats> {
    const totalBadges = await this.prisma.badge.count();

    // Get count by badge type
    const badgeTypeCounts = await this.prisma.badge.groupBy({
      by: ['type'],
      _count: {
        id: true
      }
    });

    const badgesByType = badgeTypeCounts.reduce((acc, item) => {
      acc[item.type] = item._count.id;
      return acc;
    }, {} as Record<string, number>);

    // Ensure all badge types are represented
    const allBadgeTypes = ['TOP_10_PERCENT', 'CATEGORY_WINNER', 'SPONSOR_FAVORITE', 'FIRST_SUBMISSION', 'PERFECT_SCORE', 'SEASON_CHAMPION'];
    allBadgeTypes.forEach(type => {
      if (!badgesByType[type]) {
        badgesByType[type] = 0;
      }
    });

    // Get recent badges
    const recentBadges = await this.prisma.badge.findMany({
      include: {
        user: {
          select: {
            id: true,
            username: true,
            name: true,
            avatar: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    return {
      totalBadges,
      badgesByType: badgesByType as any,
      recentBadges: recentBadges as Badge[]
    };
  }

  async getSponsorBadgeActivity(sponsorId: number, limit: number = 20): Promise<SponsorBadgeActivity[]> {
    // Verify sponsor permissions
    const sponsor = await this.prisma.user.findUnique({
      where: { id: sponsorId },
      select: { isSponsor: true, isAdmin: true, name: true, username: true }
    });

    if (!sponsor || (!sponsor.isSponsor && !sponsor.isAdmin)) {
      throw new ForbiddenException('Only sponsors can view sponsor badge activity');
    }

    // For now, we'll return sponsor favorite badges as activity
    // In a full implementation, you might want a separate audit table
    const badges = await this.prisma.badge.findMany({
      where: {
        type: 'SPONSOR_FAVORITE'
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            name: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    });

    return badges.map(badge => ({
      badgeId: badge.id,
      badge: badge as Badge,
      awardedBy: {
        id: sponsorId,
        name: sponsor.name || '',
        username: sponsor.username
      },
      awardedTo: {
        id: badge.user.id,
        name: badge.user.name || '',
        username: badge.user.username
      },
      createdAt: badge.createdAt
    }));
  }

  async deleteBadge(badgeId: number, requestingUserId: number): Promise<void> {
    const badge = await this.prisma.badge.findUnique({
      where: { id: badgeId },
      include: {
        user: true
      }
    });

    if (!badge) {
      throw new NotFoundException('Badge not found');
    }

    // Check permissions - only admins or the badge owner can delete
    const requestingUser = await this.prisma.user.findUnique({
      where: { id: requestingUserId },
      select: { isAdmin: true }
    });

    if (!requestingUser?.isAdmin && badge.userId !== requestingUserId) {
      throw new ForbiddenException('You can only delete your own badges');
    }

    await this.prisma.badge.delete({
      where: { id: badgeId }
    });

    this.logger.log(`Badge ${badgeId} deleted by user ${requestingUserId}`);
  }

  async getUserBadges(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const badges = await this.prisma.badge.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    const stats = await this.getUserBadgeStats(userId);

    return {
      badges,
      stats
    };
  }

  private async getUserBadgeStats(userId: number) {
    const totalBadges = await this.prisma.badge.count({
      where: { userId }
    });

    const badgeTypeCounts = await this.prisma.badge.groupBy({
      by: ['type'],
      where: { userId },
      _count: {
        id: true
      }
    });

    const badgesByType = badgeTypeCounts.reduce((acc, item) => {
      acc[item.type] = item._count.id;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalBadges,
      badgesByType
    };
  }
} 