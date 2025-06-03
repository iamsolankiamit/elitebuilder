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
import { SubmissionsService } from './submissions.service';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { UpdateSubmissionDto } from './dto/update-submission.dto';
import { SubmissionQueryDto } from './dto/submission-query.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/user.decorator';

interface User {
  id: number;
  email: string;
  name?: string;
  username: string;
  avatar?: string;
  isAdmin: boolean;
}

@Controller('submissions')
export class SubmissionsController {
  constructor(private readonly submissionsService: SubmissionsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @Body() createSubmissionDto: CreateSubmissionDto,
    @CurrentUser() user: User,
  ) {
    return this.submissionsService.create(createSubmissionDto, user.id);
  }

  @Get()
  findAll(@Query() query: SubmissionQueryDto) {
    return this.submissionsService.findAll(query);
  }

  @Get('my-submissions')
  @UseGuards(JwtAuthGuard)
  getMySubmissions(@CurrentUser() user: User) {
    return this.submissionsService.getUserSubmissions(user.id);
  }

  @Get('challenge/:challengeId')
  getSubmissionsByChallenge(
    @Param('challengeId', ParseIntPipe) challengeId: number,
  ) {
    return this.submissionsService.getSubmissionsByChallenge(challengeId);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user?: User,
  ) {
    return this.submissionsService.findOne(id, user?.id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSubmissionDto: UpdateSubmissionDto,
    @CurrentUser() user: User,
  ) {
    return this.submissionsService.update(
      id,
      updateSubmissionDto,
      user.id,
      user.isAdmin,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User,
  ) {
    return this.submissionsService.remove(id, user.id, user.isAdmin);
  }
} 