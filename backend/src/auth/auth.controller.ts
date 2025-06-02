import { Controller, Get, UseGuards, Req, Res } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';

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
}