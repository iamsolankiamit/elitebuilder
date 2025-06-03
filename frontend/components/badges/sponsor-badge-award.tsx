'use client'

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAwardSponsorBadge } from '@/hooks/use-badges';
import { useAuth } from '@/hooks/use-auth';
import { AwardSponsorBadgeDto } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Star, Award, Users, AlertCircle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SponsorBadgeAwardProps {
  userId?: number;
  challengeId?: number;
  userInfo?: {
    username: string;
    name?: string;
    avatar?: string;
  };
  challengeInfo?: {
    title: string;
  };
  className?: string;
  triggerText?: string;
  triggerVariant?: 'default' | 'premium' | 'outline' | 'ghost';
}

export function SponsorBadgeAward({
  userId,
  challengeId,
  userInfo,
  challengeInfo,
  className,
  triggerText = "Award Sponsor Badge",
  triggerVariant = 'premium'
}: SponsorBadgeAwardProps) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    userId: userId || 0,
    challengeId: challengeId,
    reason: '',
    customName: '',
    customDescription: '',
  });

  const awardBadgeMutation = useAwardSponsorBadge();

  // Check if user is sponsor
  const canAwardBadges = user?.isSponsor || user?.isAdmin;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.userId) {
      return;
    }

    const awardData: AwardSponsorBadgeDto = {
      userId: formData.userId,
      ...(formData.challengeId && { challengeId: formData.challengeId }),
      ...(formData.reason && { reason: formData.reason }),
      ...(formData.customName && { customName: formData.customName }),
      ...(formData.customDescription && { customDescription: formData.customDescription }),
    };

    try {
      await awardBadgeMutation.mutateAsync(awardData);
      setIsOpen(false);
      setFormData({
        userId: userId || 0,
        challengeId: challengeId,
        reason: '',
        customName: '',
        customDescription: '',
      });
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  if (!canAwardBadges) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant={triggerVariant}
          className={cn("hover-lift glow-on-hover", className)}
          onClick={() => setIsOpen(true)}
        >
          <Star className="w-4 h-4 mr-2" />
          {triggerText}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-purple-500" />
            Award Sponsor Badge
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* User Info Display */}
          {userInfo && (
            <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
              {userInfo.avatar && (
                <img
                  src={userInfo.avatar}
                  alt={userInfo.username}
                  className="w-10 h-10 rounded-full"
                />
              )}
              <div>
                <p className="font-medium">{userInfo.name || userInfo.username}</p>
                <p className="text-sm text-muted-foreground">@{userInfo.username}</p>
              </div>
            </div>
          )}

          {/* Challenge Info Display */}
          {challengeInfo && (
            <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  Challenge
                </span>
              </div>
              <p className="text-sm text-blue-600 dark:text-blue-400">
                {challengeInfo.title}
              </p>
            </div>
          )}

          {/* User ID Input (if not provided) */}
          {!userId && (
            <div className="space-y-2">
              <Label htmlFor="userId">User ID</Label>
              <Input
                id="userId"
                type="number"
                value={formData.userId || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  userId: parseInt(e.target.value) || 0 
                }))}
                required
                placeholder="Enter user ID to award badge"
              />
            </div>
          )}

          {/* Custom Badge Name */}
          <div className="space-y-2">
            <Label htmlFor="customName">Badge Name (Optional)</Label>
            <Input
              id="customName"
              value={formData.customName}
              onChange={(e) => setFormData(prev => ({ ...prev, customName: e.target.value }))}
              placeholder="e.g., AI Innovation Excellence"
              maxLength={100}
            />
            <p className="text-xs text-muted-foreground">
              Leave empty to use default "Sponsor Favorite"
            </p>
          </div>

          {/* Custom Description */}
          <div className="space-y-2">
            <Label htmlFor="customDescription">Badge Description (Optional)</Label>
            <Textarea
              id="customDescription"
              value={formData.customDescription}
              onChange={(e) => setFormData(prev => ({ ...prev, customDescription: e.target.value }))}
              placeholder="Describe why this badge is being awarded..."
              className="min-h-[80px]"
              maxLength={500}
            />
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">Reason (Optional)</Label>
            <Textarea
              id="reason"
              value={formData.reason}
              onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
              placeholder="Why are you awarding this badge?"
              className="min-h-[60px]"
              maxLength={500}
            />
          </div>

          {/* Error Display */}
          {awardBadgeMutation.error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {awardBadgeMutation.error.message || 'Failed to award badge. Please try again.'}
              </AlertDescription>
            </Alert>
          )}

          {/* Success Display */}
          {awardBadgeMutation.isSuccess && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800"
            >
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-800 dark:text-green-200">
                  Badge awarded successfully!
                </span>
              </div>
            </motion.div>
          )}

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={awardBadgeMutation.isPending || !formData.userId}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              {awardBadgeMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Awarding...
                </>
              ) : (
                <>
                  <Star className="w-4 h-4 mr-2" />
                  Award Badge
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Quick Award Component for use in leaderboards/submission cards
export function QuickSponsorAward({ 
  userId, 
  challengeId, 
  userInfo, 
  className 
}: {
  userId: number;
  challengeId?: number;
  userInfo?: { username: string; name?: string; avatar?: string };
  className?: string;
}) {
  return (
    <SponsorBadgeAward
      userId={userId}
      challengeId={challengeId}
      userInfo={userInfo}
      triggerText="⭐"
      triggerVariant="ghost"
      className={cn("h-8 w-8 p-0", className)}
    />
  );
} 