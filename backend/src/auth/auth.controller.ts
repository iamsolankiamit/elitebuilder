import { Controller, Get, UseGuards, Req, Res, Post } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from './jwt-auth.guard';
import { CurrentUser } from './user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService, private configService: ConfigService) {}

  @Get('github')
  @UseGuards(AuthGuard('github'))
  async githubAuth() {
    // This route initiates the GitHub OAuth flow
  }

  @Get('github/callback')
  @UseGuards(AuthGuard('github'))
  async githubAuthCallback(@Req() req: any, @Res() res: Response) {
    const result = await this.authService.login(req.user);
    
    // Redirect to frontend with token
    res.redirect(`${this.configService.get('FRONTEND_URL')}/auth/callback?token=${result.access_token}`);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@CurrentUser() user: any) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      username: user.username,
      avatar: user.avatar,
      githubId: user.githubId,
      githubUrl: user.githubUrl,
      portfolioUrl: user.portfolioUrl,
      linkedinUrl: user.linkedinUrl,
      bio: user.bio,
      location: user.location,
      timezone: user.timezone,
      careerScore: user.careerScore || 0,
      isSponsor: user.isSponsor || false,
      isAdmin: user.isAdmin || false,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@CurrentUser() user: any) {
    // Since JWT is stateless, we just return success
    // The frontend will remove the token from storage
    return {
      success: true,
      message: 'Logged out successfully',
    };
  }
}