'use client'

import React from 'react';
import { motion } from 'framer-motion';
import { useSponsorFavorites } from '@/hooks/use-badges';
import { BadgeDisplay } from './badge-display';
import { SponsorFavorite } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Star, MapPin, Github, ExternalLink, Crown, Medal, Award } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface SponsorFavoritesProps {
  limit?: number;
  className?: string;
  showHeader?: boolean;
  compact?: boolean;
}

export function SponsorFavorites({ 
  limit = 10, 
  className, 
  showHeader = true,
  compact = false 
}: SponsorFavoritesProps) {
  const { data: favorites, isLoading, error } = useSponsorFavorites(limit);

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

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Award className="w-5 h-5 text-amber-600" />;
      default:
        return (
          <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-semibold">
            {rank}
          </div>
        );
    }
  };

  const getRankColors = (rank: number) => {
    switch (rank) {
      case 1:
        return 'from-yellow-400 to-yellow-600';
      case 2:
        return 'from-gray-300 to-gray-500';
      case 3:
        return 'from-amber-400 to-amber-600';
      default:
        return 'from-blue-400 to-purple-500';
    }
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          <span>Loading sponsor favorites...</span>
        </CardContent>
      </Card>
    );
  }

  if (error || !favorites) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-8">
          <p className="text-red-500">Failed to load sponsor favorites.</p>
        </CardContent>
      </Card>
    );
  }

  if (favorites.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Star className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Sponsor Favorites Yet</h3>
          <p className="text-muted-foreground text-center">
            Be the first to earn a sponsor favorite badge by creating an outstanding submission!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      {showHeader && (
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-purple-500" />
            Sponsor Favorites
          </CardTitle>
        </CardHeader>
      )}

      <CardContent className={compact ? "p-4" : undefined}>
        <motion.div
          className="space-y-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {favorites.map((favorite) => (
            <motion.div
              key={`${favorite.user.id}-${favorite.badge.id}`}
              variants={itemVariants}
              className={cn(
                "relative p-4 rounded-lg border transition-all duration-200 hover:shadow-md",
                favorite.rank <= 3 && "border-2",
                favorite.rank === 1 && "border-yellow-300 bg-yellow-50/50 dark:bg-yellow-950/20",
                favorite.rank === 2 && "border-gray-300 bg-gray-50/50 dark:bg-gray-950/20",
                favorite.rank === 3 && "border-amber-300 bg-amber-50/50 dark:bg-amber-950/20"
              )}
            >
              {/* Rank Indicator */}
              <div className="absolute -left-2 -top-2">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg",
                  `bg-gradient-to-br ${getRankColors(favorite.rank)}`
                )}>
                  {favorite.rank <= 3 ? (
                    <div className="flex items-center justify-center">
                      {getRankIcon(favorite.rank)}
                    </div>
                  ) : (
                    favorite.rank
                  )}
                </div>
              </div>

              <div className="flex items-start gap-4 ml-4">
                {/* User Avatar & Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    {favorite.user.avatar && (
                      <img
                        src={favorite.user.avatar}
                        alt={favorite.user.username}
                        className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <h4 className="font-semibold text-sm truncate">
                        {favorite.user.name || favorite.user.username}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        @{favorite.user.username}
                      </p>
                    </div>
                  </div>

                  {/* User Details */}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    {favorite.user.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span>{favorite.user.location}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3" />
                      <span>{favorite.user.careerScore.toFixed(0)} pts</span>
                    </div>
                  </div>

                  {/* Badge Info */}
                  {!compact && (
                    <div className="mt-3">
                      <div className="text-xs text-muted-foreground mb-1">Badge Earned:</div>
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-medium text-purple-600 dark:text-purple-400">
                          {favorite.badge.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(favorite.badge.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      {favorite.badge.description && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {favorite.badge.description}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Badge Display */}
                <div className="flex flex-col items-center gap-2">
                  <BadgeDisplay
                    badge={favorite.badge}
                    size={compact ? "sm" : "md"}
                    interactive={true}
                  />
                  
                  {/* Action Buttons */}
                  <div className="flex gap-1">
                    {favorite.user.githubUrl && (
                      <Link href={favorite.user.githubUrl} target="_blank">
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                          <Github className="w-3 h-3" />
                        </Button>
                      </Link>
                    )}
                    <Link href={`/profile/${favorite.user.username}`}>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* View All Button */}
        {favorites.length >= limit && (
          <div className="mt-6 text-center">
            <Link href="/badges/sponsor-favorites">
              <Button variant="outline" className="hover-lift">
                View All Sponsor Favorites
                <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 