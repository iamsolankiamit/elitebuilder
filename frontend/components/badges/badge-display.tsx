'use client'

import React from 'react';
import { motion } from 'framer-motion';
import { Badge, BadgeType } from '@/lib/types';
import { cn } from '@/lib/utils';

interface BadgeDisplayProps {
  badge: Badge;
  size?: 'sm' | 'md' | 'lg';
  showUser?: boolean;
  showDescription?: boolean;
  className?: string;
  interactive?: boolean;
  onClick?: () => void;
}

const badgeTypeColors = {
  [BadgeType.TOP_10_PERCENT]: 'from-emerald-400 to-cyan-400',
  [BadgeType.CATEGORY_WINNER]: 'from-yellow-400 to-orange-400',
  [BadgeType.SPONSOR_FAVORITE]: 'from-purple-400 to-pink-400',
  [BadgeType.FIRST_SUBMISSION]: 'from-blue-400 to-indigo-400',
  [BadgeType.PERFECT_SCORE]: 'from-red-400 to-pink-500',
  [BadgeType.SEASON_CHAMPION]: 'from-amber-400 to-yellow-500',
};

const badgeTypeIcons = {
  [BadgeType.TOP_10_PERCENT]: '🏆',
  [BadgeType.CATEGORY_WINNER]: '🥇',
  [BadgeType.SPONSOR_FAVORITE]: '⭐',
  [BadgeType.FIRST_SUBMISSION]: '🚀',
  [BadgeType.PERFECT_SCORE]: '💯',
  [BadgeType.SEASON_CHAMPION]: '👑',
};

const sizeClasses = {
  sm: {
    container: 'w-16 h-16',
    icon: 'text-lg',
    title: 'text-xs',
    description: 'text-xs',
  },
  md: {
    container: 'w-20 h-20',
    icon: 'text-xl',
    title: 'text-sm',
    description: 'text-sm',
  },
  lg: {
    container: 'w-24 h-24',
    icon: 'text-2xl',
    title: 'text-base',
    description: 'text-sm',
  },
};

export function BadgeDisplay({ 
  badge, 
  size = 'md', 
  showUser = false, 
  showDescription = false,
  className,
  interactive = false,
  onClick
}: BadgeDisplayProps) {
  const gradientColor = badgeTypeColors[badge.type] || 'from-gray-400 to-gray-600';
  const icon = badgeTypeIcons[badge.type] || '🏅';
  const sizeConfig = sizeClasses[size];

  const BadgeIcon = () => (
    <motion.div
      className={cn(
        'relative rounded-full flex items-center justify-center text-white font-bold shadow-lg',
        `bg-gradient-to-br ${gradientColor}`,
        sizeConfig.container,
        interactive && 'cursor-pointer hover:scale-105 transition-transform',
        className
      )}
      whileHover={interactive ? { scale: 1.05 } : undefined}
      whileTap={interactive ? { scale: 0.95 } : undefined}
      onClick={onClick}
    >
      {/* Glow effect */}
      <div className={cn(
        'absolute inset-0 rounded-full blur-sm opacity-60',
        `bg-gradient-to-br ${gradientColor}`
      )} />
      
      {/* Badge content */}
      <div className="relative z-10 flex flex-col items-center justify-center">
        <span className={sizeConfig.icon}>{icon}</span>
        {size === 'lg' && (
          <span className="text-xs font-medium mt-1 text-center leading-tight">
            {badge.name.split(' ').slice(0, 2).join(' ')}
          </span>
        )}
      </div>

      {/* Sparkle animation for special badges */}
      {badge.type === BadgeType.SPONSOR_FAVORITE && (
        <motion.div
          className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-300 rounded-full"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.8, 1, 0.8],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      )}
    </motion.div>
  );

  if (!showDescription && !showUser) {
    return <BadgeIcon />;
  }

  return (
    <div className="flex flex-col items-center space-y-2">
      <BadgeIcon />
      
      <div className="text-center space-y-1">
        <h4 className={cn('font-semibold text-foreground', sizeConfig.title)}>
          {badge.name}
        </h4>
        
        {showDescription && (
          <p className={cn('text-muted-foreground max-w-xs', sizeConfig.description)}>
            {badge.description}
          </p>
        )}
        
        {showUser && badge.user && (
          <div className="flex items-center justify-center space-x-2">
            {badge.user.avatar && (
              <img
                src={badge.user.avatar}
                alt={badge.user.username}
                className="w-4 h-4 rounded-full"
              />
            )}
            <span className="text-xs text-muted-foreground">
              {badge.user.name || badge.user.username}
            </span>
          </div>
        )}
        
        <p className="text-xs text-muted-foreground">
          {new Date(badge.createdAt).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
} 