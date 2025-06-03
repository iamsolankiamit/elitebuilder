import { IsString, IsOptional, IsEnum, IsInt, IsUrl, MinLength, MaxLength, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { BadgeType } from '../types/badge.types';

export class CreateBadgeDto {
  @IsString()
  @MinLength(3, { message: 'Badge name must be at least 3 characters long' })
  @MaxLength(100, { message: 'Badge name must not exceed 100 characters' })
  name: string;

  @IsString()
  @MinLength(10, { message: 'Badge description must be at least 10 characters long' })
  @MaxLength(500, { message: 'Badge description must not exceed 500 characters' })
  description: string;

  @IsUrl({}, { message: 'Image URL must be a valid URL' })
  imageUrl: string;

  @IsEnum(BadgeType, { message: 'Invalid badge type' })
  type: BadgeType;

  @Type(() => Number)
  @IsInt({ message: 'User ID must be an integer' })
  @Min(1, { message: 'User ID must be a positive integer' })
  userId: number;
}

export class AwardSponsorBadgeDto {
  @Type(() => Number)
  @IsInt({ message: 'User ID must be an integer' })
  @Min(1, { message: 'User ID must be a positive integer' })
  userId: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Challenge ID must be an integer' })
  @Min(1, { message: 'Challenge ID must be a positive integer' })
  challengeId?: number;

  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Reason must not exceed 500 characters' })
  reason?: string;

  @IsOptional()
  @IsString()
  @MinLength(3, { message: 'Custom badge name must be at least 3 characters long' })
  @MaxLength(100, { message: 'Custom badge name must not exceed 100 characters' })
  customName?: string;

  @IsOptional()
  @IsString()
  @MinLength(10, { message: 'Custom badge description must be at least 10 characters long' })
  @MaxLength(500, { message: 'Custom badge description must not exceed 500 characters' })
  customDescription?: string;
}

export class BadgeQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Page must be an integer' })
  @Min(1, { message: 'Page must be at least 1' })
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Limit must be an integer' })
  @Min(1, { message: 'Limit must be at least 1' })
  limit?: number = 20;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'User ID must be an integer' })
  @Min(1, { message: 'User ID must be a positive integer' })
  userId?: number;

  @IsOptional()
  @IsEnum(BadgeType, { message: 'Invalid badge type' })
  type?: BadgeType;

  @IsOptional()
  @IsString()
  search?: string;
} 