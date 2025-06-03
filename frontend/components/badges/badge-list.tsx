'use client'

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Badge, BadgeType, BadgeQueryParams } from '@/lib/types';
import { useBadges } from '@/hooks/use-badges';
import { BadgeDisplay } from './badge-display';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Search, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BadgeListProps {
  userId?: number;
  showFilters?: boolean;
  showPagination?: boolean;
  limit?: number;
  title?: string;
  className?: string;
  badgeSize?: 'sm' | 'md' | 'lg';
  showUserInfo?: boolean;
}

const badgeTypeLabels = {
  [BadgeType.TOP_10_PERCENT]: 'Top 10%',
  [BadgeType.CATEGORY_WINNER]: 'Category Winner',
  [BadgeType.SPONSOR_FAVORITE]: 'Sponsor Favorite',
  [BadgeType.FIRST_SUBMISSION]: 'First Submission',
  [BadgeType.PERFECT_SCORE]: 'Perfect Score',
  [BadgeType.SEASON_CHAMPION]: 'Season Champion',
};

export function BadgeList({ 
  userId,
  showFilters = true,
  showPagination = true,
  limit = 20,
  title = "Badges",
  className,
  badgeSize = 'md',
  showUserInfo = true
}: BadgeListProps) {
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [page, setPage] = useState(1);

  const queryParams: BadgeQueryParams = {
    page,
    limit,
    ...(userId && { userId }),
    ...(search && { search }),
    ...(selectedType !== 'all' && { type: selectedType as BadgeType }),
  };

  const { data, isLoading, error } = useBadges(queryParams);

  const badges = data?.badges || [];
  const pagination = data?.pagination;

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

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-8">
          <p className="text-red-500">Failed to load badges. Please try again.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {title}
          {pagination && (
            <span className="text-sm font-normal text-muted-foreground">
              {pagination.total} total
            </span>
          )}
        </CardTitle>

        {showFilters && (
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search badges..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {Object.entries(badgeTypeLabels).map(([type, label]) => (
                  <SelectItem key={type} value={type}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="ml-2">Loading badges...</span>
          </div>
        ) : badges.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">🏅</div>
            <h3 className="text-lg font-semibold mb-2">No badges found</h3>
            <p className="text-muted-foreground">
              {search || selectedType !== 'all' 
                ? 'Try adjusting your filters to see more badges.'
                : 'No badges have been awarded yet.'
              }
            </p>
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {badges.map((badge) => (
              <motion.div
                key={badge.id}
                variants={itemVariants}
                className="flex justify-center"
              >
                <BadgeDisplay
                  badge={badge}
                  size={badgeSize}
                  showUser={showUserInfo && !!badge.user}
                  showDescription={true}
                  interactive={true}
                />
              </motion.div>
            ))}
          </motion.div>
        )}

        {showPagination && pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page - 1)}
              disabled={page <= 1}
            >
              Previous
            </Button>
            
            <div className="flex items-center gap-2">
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <Button
                    key={pageNum}
                    variant={page === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPage(pageNum)}
                    className="w-10"
                  >
                    {pageNum}
                  </Button>
                );
              })}
              
              {pagination.totalPages > 5 && (
                <>
                  <span className="text-muted-foreground">...</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(pagination.totalPages)}
                    className="w-10"
                  >
                    {pagination.totalPages}
                  </Button>
                </>
              )}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={page >= pagination.totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 