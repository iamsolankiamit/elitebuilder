import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-github2';
import { Profile } from 'passport-github2';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

interface GitHubProfile extends Profile {
  id: string;
  username: string;
  displayName?: string;
  profileUrl?: string;
  location?: string;
  emails?: Array<{ value: string }>;
  photos?: Array<{ value: string }>;
}

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      clientID: configService.get('GITHUB_CLIENT_ID'),
      clientSecret: configService.get('GITHUB_CLIENT_SECRET'),
      callbackURL: configService.get('GITHUB_CALLBACK_URL'),
      scope: ['user:email', 'read:user', 'user:profile'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: GitHubProfile) {
    const { id, username, emails, photos, displayName, profileUrl, location } = profile;
    
    // Create or update user in database
    const user = await this.prisma.user.upsert({
      where: { githubId: id },
      update: {
        email: emails?.[0]?.value || `${username}@github.user`,
        username,
        name: displayName || username,
        avatar: photos?.[0]?.value,
        githubUrl: profileUrl,
        location: location || null,
      },
      create: {
        githubId: id,
        email: emails?.[0]?.value || `${username}@github.user`,
        username,
        name: displayName || username,
        avatar: photos?.[0]?.value,
        githubUrl: profileUrl,
        location: location || null,
      },
    });

    return {
      ...user,
      accessToken,
    };
  }
} 