import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  ForbiddenException,
} from '@nestjs/common';
import { BadgesService } from './badges.service';
import { CreateBadgeDto, AwardSponsorBadgeDto, BadgeQueryDto } from './dto/badge.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/user.decorator';

interface User {
  id: number;
  email: string;
  name?: string;
  username: string;
  avatar?: string;
  isSponsor: boolean;
  isAdmin: boolean;
}

@Controller('badges')
export class BadgesController {
  constructor(private readonly badgesService: BadgesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async createBadge(@Body() createBadgeDto: CreateBadgeDto, @CurrentUser() user: User) {
    // Only admins can create general badges
    if (!user.isAdmin) {
      throw new ForbiddenException('Only admins can create badges');
    }
    return this.badgesService.createBadge(createBadgeDto);
  }

  @Post('sponsor/award')
  @UseGuards(JwtAuthGuard)
  async awardSponsorBadge(
    @Body() awardSponsorBadgeDto: AwardSponsorBadgeDto,
    @CurrentUser() user: User
  ) {
    // Only sponsors and admins can award sponsor badges
    if (!user.isSponsor && !user.isAdmin) {
      throw new ForbiddenException('Only sponsors can award sponsor badges');
    }
    return this.badgesService.awardSponsorBadge(awardSponsorBadgeDto, user.id);
  }

  @Get()
  async getBadges(@Query() query: BadgeQueryDto) {
    return this.badgesService.getBadges(query);
  }

  @Get('stats')
  async getBadgeStats() {
    return this.badgesService.getBadgeStats();
  }

  @Get('sponsor/favorites')
  async getSponsorFavorites(@Query('limit') limitStr?: string) {
    const limit = limitStr ? parseInt(limitStr, 10) : undefined;
    return this.badgesService.getSponsorFavorites(limit);
  }

  @Get('sponsor/activity')
  @UseGuards(JwtAuthGuard)
  async getSponsorBadgeActivity(
    @CurrentUser() user: User,
    @Query('limit') limitStr?: string
  ) {
    const limit = limitStr ? parseInt(limitStr, 10) : undefined;
    return this.badgesService.getSponsorBadgeActivity(user.id, limit);
  }

  @Get('user/:userId')
  async getUserBadges(@Param('userId', ParseIntPipe) userId: number) {
    return this.badgesService.getUserBadges(userId);
  }

  @Delete(':badgeId')
  @UseGuards(JwtAuthGuard)
  async deleteBadge(
    @Param('badgeId', ParseIntPipe) badgeId: number,
    @CurrentUser() user: User
  ) {
    return this.badgesService.deleteBadge(badgeId, user.id);
  }
} 