import { BadgeType as PrismaBadgeType } from '@prisma/client';

export { PrismaBadgeType as BadgeType };

export interface Badge {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  type: PrismaBadgeType;
  userId: number;
  createdAt: Date;
}

export interface BadgeStats {
  totalBadges: number;
  badgesByType: Record<PrismaBadgeType, number>;
  recentBadges: Badge[];
}

export interface SponsorBadgeRequest {
  userId: number;
  challengeId?: number;
  reason?: string;
}

export interface SponsorBadgeActivity {
  badgeId: number;
  badge: Badge;
  awardedBy: {
    id: number;
    name: string;
    username: string;
  };
  awardedTo: {
    id: number;
    name: string;
    username: string;
  };
  challengeId?: number;
  challenge?: {
    id: number;
    title: string;
  };
  reason?: string;
  createdAt: Date;
} 