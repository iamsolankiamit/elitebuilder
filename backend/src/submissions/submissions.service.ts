import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { UpdateSubmissionDto } from './dto/update-submission.dto';
import { SubmissionQueryDto } from './dto/submission-query.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class SubmissionsService {
  constructor(private prisma: PrismaService) {}

  async create(createSubmissionDto: CreateSubmissionDto, userId: number) {
    // Check if challenge exists and is still open
    const challenge = await this.prisma.challenge.findUnique({
      where: { id: createSubmissionDto.challengeId },
    });

    if (!challenge) {
      throw new NotFoundException('Challenge not found');
    }

    if (challenge.deadline < new Date()) {
      throw new BadRequestException('Challenge deadline has passed');
    }

    // Check if user is participating in the challenge
    const participation = await this.prisma.challenge.findFirst({
      where: {
        id: createSubmissionDto.challengeId,
        participants: {
          some: { id: userId },
        },
      },
    });

    if (!participation) {
      throw new BadRequestException('You must participate in the challenge before submitting');
    }

    // Check if user already has a submission for this challenge
    const existingSubmission = await this.prisma.submission.findUnique({
      where: {
        userId_challengeId: {
          userId,
          challengeId: createSubmissionDto.challengeId,
        },
      },
    });

    if (existingSubmission) {
      throw new BadRequestException('You have already submitted to this challenge');
    }

    return this.prisma.submission.create({
      data: {
        ...createSubmissionDto,
        userId,
      },
      include: {
        challenge: {
          select: {
            id: true,
            title: true,
            deadline: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
          },
        },
      },
    });
  }

  async findAll(query: SubmissionQueryDto) {
    const {
      page = 1,
      limit = 10,
      userId,
      challengeId,
      status,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = query;

    const skip = (page - 1) * limit;
    const where: Prisma.SubmissionWhereInput = {};
    
    if (userId) {
      where.userId = userId;
    }
    
    if (challengeId) {
      where.challengeId = challengeId;
    }

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        {
          challenge: {
            title: {
              contains: search,
              mode: 'insensitive',
            },
          },
        },
        {
          user: {
            OR: [
              {
                name: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
              {
                username: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
            ],
          },
        },
      ];
    }

    const orderBy: Prisma.SubmissionOrderByWithRelationInput = {};
    if (sortBy === 'score') {
      orderBy.score = sortOrder;
    } else {
      orderBy[sortBy] = sortOrder;
    }

    const [submissions, total] = await Promise.all([
      this.prisma.submission.findMany({
        where,
        include: {
          challenge: {
            select: {
              id: true,
              title: true,
              deadline: true,
              prize: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              username: true,
              avatar: true,
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.submission.count({ where }),
    ]);

    return {
      data: submissions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    };
  }

  async findOne(id: number, requestingUserId?: number) {
    const submission = await this.prisma.submission.findUnique({
      where: { id },
      include: {
        challenge: {
          select: {
            id: true,
            title: true,
            description: true,
            deadline: true,
            prize: true,
            rubric: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
            bio: true,
            githubUrl: true,
            portfolioUrl: true,
          },
        },
      },
    });

    if (!submission) {
      throw new NotFoundException('Submission not found');
    }

    // Only allow viewing own submissions or public submissions (after deadline or scored)
    const canView = 
      submission.userId === requestingUserId ||
      submission.challenge.deadline < new Date() ||
      submission.score !== null;

    if (!canView && requestingUserId) {
      throw new ForbiddenException('You cannot view this submission yet');
    }

    return submission;
  }

  async update(id: number, updateSubmissionDto: UpdateSubmissionDto, requestingUserId: number, isAdmin = false) {
    const submission = await this.prisma.submission.findUnique({
      where: { id },
      include: {
        challenge: true,
      },
    });

    if (!submission) {
      throw new NotFoundException('Submission not found');
    }

    // Only submission owner can update repo/deck/video before deadline
    // Only admins can update score/status
    const isOwner = submission.userId === requestingUserId;
    const beforeDeadline = submission.challenge.deadline > new Date();

    if (!isAdmin && !isOwner) {
      throw new ForbiddenException('You can only update your own submissions');
    }

    if (!isAdmin && !beforeDeadline) {
      throw new ForbiddenException('You cannot update submissions after the deadline');
    }

    // Separate admin fields from user fields
    const { score, status, ...userFields } = updateSubmissionDto;
    const updateData: any = {};

    if (isAdmin) {
      // Admins can update everything
      Object.assign(updateData, updateSubmissionDto);
    } else if (isOwner && beforeDeadline) {
      // Users can only update content fields before deadline
      Object.assign(updateData, userFields);
    }

    return this.prisma.submission.update({
      where: { id },
      data: updateData,
      include: {
        challenge: {
          select: {
            id: true,
            title: true,
            deadline: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
          },
        },
      },
    });
  }

  async remove(id: number, requestingUserId: number, isAdmin = false) {
    const submission = await this.prisma.submission.findUnique({
      where: { id },
      include: {
        challenge: true,
      },
    });

    if (!submission) {
      throw new NotFoundException('Submission not found');
    }

    const isOwner = submission.userId === requestingUserId;
    const beforeDeadline = submission.challenge.deadline > new Date();

    if (!isAdmin && (!isOwner || !beforeDeadline)) {
      throw new ForbiddenException('You can only delete your own submissions before the deadline');
    }

    await this.prisma.submission.delete({
      where: { id },
    });

    return { message: 'Submission deleted successfully' };
  }

  async getSubmissionsByChallenge(challengeId: number) {
    const challenge = await this.prisma.challenge.findUnique({
      where: { id: challengeId },
    });

    if (!challenge) {
      throw new NotFoundException('Challenge not found');
    }

    return this.prisma.submission.findMany({
      where: { challengeId },
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
      orderBy: [
        { score: 'desc' },
        { createdAt: 'desc' },
      ],
    });
  }

  async getUserSubmissions(userId: number) {
    return this.prisma.submission.findMany({
      where: { userId },
      include: {
        challenge: {
          select: {
            id: true,
            title: true,
            deadline: true,
            prize: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
} 