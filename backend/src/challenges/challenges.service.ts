import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateChallengeDto } from './dto/create-challenge.dto';
import { UpdateChallengeDto } from './dto/update-challenge.dto';
import { ChallengeQueryDto } from './dto/challenge-query.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ChallengesService {
  constructor(private prisma: PrismaService) {}

  async create(createChallengeDto: CreateChallengeDto, creatorId: number) {
    try {
      return await this.prisma.challenge.create({
        data: {
          ...createChallengeDto,
          deadline: new Date(createChallengeDto.deadline),
          creatorId,
        },
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              username: true,
              avatar: true,
            },
          },
          _count: {
            select: {
              participants: true,
              submissions: true,
            },
          },
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new BadRequestException('Failed to create challenge');
      }
      throw error;
    }
  }

  async findAll(query: ChallengeQueryDto) {
    const { page = 1, limit = 10, search, creatorId, includeExpired = false, sortBy = 'createdAt', sortOrder = 'desc' } = query;
    
    const skip = (page - 1) * limit;
    
    const where: Prisma.ChallengeWhereInput = {
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(creatorId && { creatorId }),
      ...(!includeExpired && {
        deadline: {
          gte: new Date(),
        },
      }),
    };

    const [challenges, total] = await Promise.all([
      this.prisma.challenge.findMany({
        where,
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              username: true,
              avatar: true,
            },
          },
          _count: {
            select: {
              participants: true,
              submissions: true,
            },
          },
        },
        orderBy: {
          [sortBy]: sortOrder,
        },
        skip,
        take: limit,
      }),
      this.prisma.challenge.count({ where }),
    ]);

    return {
      challenges,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number, userId?: number) {
    const challenge = await this.prisma.challenge.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
          },
        },
        participants: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
          },
        },
        submissions: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                username: true,
                avatar: true,
              },
            },
          },
          orderBy: {
            score: 'desc',
          },
        },
        _count: {
          select: {
            participants: true,
            submissions: true,
          },
        },
      },
    });

    if (!challenge) {
      throw new NotFoundException('Challenge not found');
    }

    // Add user participation status if userId is provided
    const isParticipating = userId 
      ? challenge.participants.some(p => p.id === userId)
      : false;

    const hasSubmitted = userId
      ? challenge.submissions.some(s => s.userId === userId)
      : false;

    return {
      ...challenge,
      isParticipating,
      hasSubmitted,
      isExpired: new Date() > challenge.deadline,
    };
  }

  async update(id: number, updateChallengeDto: UpdateChallengeDto, userId: number) {
    const challenge = await this.prisma.challenge.findUnique({
      where: { id },
      select: { creatorId: true, deadline: true },
    });

    if (!challenge) {
      throw new NotFoundException('Challenge not found');
    }

    if (challenge.creatorId !== userId) {
      throw new ForbiddenException('Only the challenge creator can update this challenge');
    }

    // Check if challenge has already expired
    if (new Date() > challenge.deadline) {
      throw new BadRequestException('Cannot update an expired challenge');
    }

    const updateData: any = { ...updateChallengeDto };
    if (updateChallengeDto.deadline) {
      updateData.deadline = new Date(updateChallengeDto.deadline);
    }

    try {
      return await this.prisma.challenge.update({
        where: { id },
        data: updateData,
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              username: true,
              avatar: true,
            },
          },
          _count: {
            select: {
              participants: true,
              submissions: true,
            },
          },
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new BadRequestException('Failed to update challenge');
      }
      throw error;
    }
  }

  async remove(id: number, userId: number) {
    const challenge = await this.prisma.challenge.findUnique({
      where: { id },
      select: { creatorId: true, _count: { select: { submissions: true } } },
    });

    if (!challenge) {
      throw new NotFoundException('Challenge not found');
    }

    if (challenge.creatorId !== userId) {
      throw new ForbiddenException('Only the challenge creator can delete this challenge');
    }

    if (challenge._count.submissions > 0) {
      throw new BadRequestException('Cannot delete a challenge that has submissions');
    }

    try {
      await this.prisma.challenge.delete({
        where: { id },
      });
      return { message: 'Challenge deleted successfully' };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new BadRequestException('Failed to delete challenge');
      }
      throw error;
    }
  }

  async participate(challengeId: number, userId: number) {
    const challenge = await this.prisma.challenge.findUnique({
      where: { id: challengeId },
      include: {
        participants: {
          where: { id: userId },
        },
      },
    });

    if (!challenge) {
      throw new NotFoundException('Challenge not found');
    }

    if (new Date() > challenge.deadline) {
      throw new BadRequestException('Cannot participate in an expired challenge');
    }

    if (challenge.participants.length > 0) {
      throw new BadRequestException('Already participating in this challenge');
    }

    try {
      await this.prisma.challenge.update({
        where: { id: challengeId },
        data: {
          participants: {
            connect: { id: userId },
          },
        },
      });

      return { message: 'Successfully joined the challenge' };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new BadRequestException('Failed to join challenge');
      }
      throw error;
    }
  }

  async leave(challengeId: number, userId: number) {
    const challenge = await this.prisma.challenge.findUnique({
      where: { id: challengeId },
      include: {
        participants: {
          where: { id: userId },
        },
        submissions: {
          where: { userId },
        },
      },
    });

    if (!challenge) {
      throw new NotFoundException('Challenge not found');
    }

    if (challenge.participants.length === 0) {
      throw new BadRequestException('Not participating in this challenge');
    }

    if (challenge.submissions.length > 0) {
      throw new BadRequestException('Cannot leave a challenge after submitting');
    }

    try {
      await this.prisma.challenge.update({
        where: { id: challengeId },
        data: {
          participants: {
            disconnect: { id: userId },
          },
        },
      });

      return { message: 'Successfully left the challenge' };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new BadRequestException('Failed to leave challenge');
      }
      throw error;
    }
  }

  async getLeaderboard(challengeId: number) {
    const challenge = await this.prisma.challenge.findUnique({
      where: { id: challengeId },
    });

    if (!challenge) {
      throw new NotFoundException('Challenge not found');
    }

    const submissions = await this.prisma.submission.findMany({
      where: { 
        challengeId,
        status: 'SCORED',
        score: { not: null },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        score: 'desc',
      },
    });

    return {
      challenge: {
        id: challenge.id,
        title: challenge.title,
        deadline: challenge.deadline,
      },
      leaderboard: submissions.map((submission, index) => ({
        rank: index + 1,
        user: submission.user,
        score: submission.score,
        submittedAt: submission.createdAt,
      })),
    };
  }
} 