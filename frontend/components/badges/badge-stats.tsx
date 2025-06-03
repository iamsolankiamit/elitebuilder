'use client'

import React from 'react';
import { motion } from 'framer-motion';
import { useBadgeStats } from '@/hooks/use-badges';
import { BadgeDisplay } from './badge-display';
import { BadgeType } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Loader2, TrendingUp, Award, Users, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BadgeStatsProps {
  className?: string;
  showRecentBadges?: boolean;
}

const badgeTypeLabels = {
  [BadgeType.TOP_10_PERCENT]: 'Top 10%',
  [BadgeType.CATEGORY_WINNER]: 'Category Winner',
  [BadgeType.SPONSOR_FAVORITE]: 'Sponsor Favorite',
  [BadgeType.FIRST_SUBMISSION]: 'First Submission',
  [BadgeType.PERFECT_SCORE]: 'Perfect Score',
  [BadgeType.SEASON_CHAMPION]: 'Season Champion',
};

const badgeTypeColors = {
  [BadgeType.TOP_10_PERCENT]: 'from-emerald-400 to-cyan-400',
  [BadgeType.CATEGORY_WINNER]: 'from-yellow-400 to-orange-400',
  [BadgeType.SPONSOR_FAVORITE]: 'from-purple-400 to-pink-400',
  [BadgeType.FIRST_SUBMISSION]: 'from-blue-400 to-indigo-400',
  [BadgeType.PERFECT_SCORE]: 'from-red-400 to-pink-500',
  [BadgeType.SEASON_CHAMPION]: 'from-amber-400 to-yellow-500',
};

export function BadgeStats({ className, showRecentBadges = true }: BadgeStatsProps) {
  const { data: stats, isLoading, error } = useBadgeStats();

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          <span>Loading badge statistics...</span>
        </CardContent>
      </Card>
    );
  }

  if (error || !stats) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-8">
          <p className="text-red-500">Failed to load badge statistics.</p>
        </CardContent>
      </Card>
    );
  }

  const totalBadges = stats.totalBadges;
  const badgesByType = stats.badgesByType;
  const recentBadges = stats.recentBadges;

  // Calculate percentages for progress bars
  const getPercentage = (count: number) => (totalBadges > 0 ? (count / totalBadges) * 100 : 0);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Overview Cards */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants}>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Award className="w-8 h-8 text-blue-500" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Badges</p>
                  <p className="text-2xl font-bold">{totalBadges.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Star className="w-8 h-8 text-purple-500" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Sponsor Favorites</p>
                  <p className="text-2xl font-bold">
                    {(badgesByType[BadgeType.SPONSOR_FAVORITE] || 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-8 h-8 text-green-500" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Top Performers</p>
                  <p className="text-2xl font-bold">
                    {(badgesByType[BadgeType.TOP_10_PERCENT] || 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Users className="w-8 h-8 text-orange-500" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Category Winners</p>
                  <p className="text-2xl font-bold">
                    {(badgesByType[BadgeType.CATEGORY_WINNER] || 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Badge Distribution */}
      <motion.div variants={itemVariants} initial="hidden" animate="visible">
        <Card>
          <CardHeader>
            <CardTitle>Badge Distribution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(badgeTypeLabels).map(([type, label]) => {
              const count = badgesByType[type as BadgeType] || 0;
              const percentage = getPercentage(count);
              const gradient = badgeTypeColors[type as BadgeType];

              return (
                <div key={type} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{label}</span>
                    <span className="text-sm text-muted-foreground">
                      {count} ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="relative">
                    <Progress value={percentage} className="h-2" />
                    <div 
                      className={cn(
                        "absolute inset-0 h-2 rounded-full bg-gradient-to-r opacity-80",
                        `bg-gradient-to-r ${gradient}`
                      )}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Badges */}
      {showRecentBadges && recentBadges.length > 0 && (
        <motion.div variants={itemVariants} initial="hidden" animate="visible">
          <Card>
            <CardHeader>
              <CardTitle>Recent Badges</CardTitle>
            </CardHeader>
            <CardContent>
              <motion.div
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-4"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {recentBadges.slice(0, 12).map((badge) => (
                  <motion.div key={badge.id} variants={itemVariants}>
                    <BadgeDisplay
                      badge={badge}
                      size="sm"
                      showUser={true}
                      interactive={true}
                    />
                  </motion.div>
                ))}
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
} 