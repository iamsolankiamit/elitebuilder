import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ChallengesService } from './challenges.service';
import { CreateChallengeDto } from './dto/create-challenge.dto';
import { UpdateChallengeDto } from './dto/update-challenge.dto';
import { ChallengeQueryDto } from './dto/challenge-query.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';
import { CurrentUser } from '../auth/user.decorator';

interface User {
  id: number;
  email: string;
  name?: string;
  username: string;
  avatar?: string;
  isAdmin: boolean;
}

@Controller('challenges')
export class ChallengesController {
  constructor(private readonly challengesService: ChallengesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @Body() createChallengeDto: CreateChallengeDto,
    @CurrentUser() user: User,
  ) {
    return this.challengesService.create(createChallengeDto, user.id);
  }

  @Get()
  findAll(@Query() query: ChallengeQueryDto) {
    return this.challengesService.findAll(query);
  }

  @Get(':id')
  @UseGuards(OptionalJwtAuthGuard)
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user?: User,
  ) {
    return this.challengesService.findOne(id, user?.id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateChallengeDto: UpdateChallengeDto,
    @CurrentUser() user: User,
  ) {
    return this.challengesService.update(id, updateChallengeDto, user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User,
  ) {
    return this.challengesService.remove(id, user.id);
  }

  @Post(':id/participate')
  @UseGuards(JwtAuthGuard)
  participate(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User,
  ) {
    return this.challengesService.participate(id, user.id);
  }

  @Delete(':id/participate')
  @UseGuards(JwtAuthGuard)
  leave(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User,
  ) {
    return this.challengesService.leave(id, user.id);
  }

  @Get(':id/leaderboard')
  getLeaderboard(@Param('id', ParseIntPipe) id: number) {
    return this.challengesService.getLeaderboard(id);
  }
} 