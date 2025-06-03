'use client'

import React from 'react';
import { motion } from 'framer-motion';
import { Header } from '@/components/header';
import { BadgeList } from '@/components/badges/badge-list';
import { BadgeStats } from '@/components/badges/badge-stats';
import { SponsorFavorites } from '@/components/badges/sponsor-favorites';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Award, Star, Trophy, Users, Target, Zap } from 'lucide-react';

export default function BadgesPage() {
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

  const badgeCategories = [
    {
      icon: Trophy,
      name: "Top 10%",
      color: "from-emerald-400 to-cyan-400",
      description: "Awarded to builders who consistently perform in the top 10% of challenge participants.",
      count: 156
    },
    {
      icon: Award,
      name: "Category Winner",
      color: "from-yellow-400 to-orange-400",
      description: "Recognizes excellence in specific challenge categories like AI/ML, Web Dev, or Data Science.",
      count: 89
    },
    {
      icon: Star,
      name: "Sponsor Favorite",
      color: "from-purple-400 to-pink-400",
      description: "Special recognition from challenge sponsors for outstanding innovation and execution.",
      count: 234
    },
    {
      icon: Target,
      name: "First Submission",
      color: "from-blue-400 to-indigo-400",
      description: "Celebrates your first successful submission to any challenge on the platform.",
      count: 1247
    },
    {
      icon: Zap,
      name: "Perfect Score",
      color: "from-red-400 to-pink-500",
      description: "Awarded for achieving a perfect score on a challenge submission.",
      count: 43
    },
    {
      icon: Users,
      name: "Season Champion",
      color: "from-amber-400 to-yellow-500",
      description: "The ultimate achievement - awarded to the highest-performing builder each season.",
      count: 12
    }
  ];

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <Award className="w-8 h-8 text-purple-500" />
              <h1 className="text-4xl font-bold gradient-text">
                Badges & Recognition
              </h1>
            </div>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Discover and earn badges that showcase your achievements in AI development, innovation, and excellence on EliteBuilders.
            </p>
          </motion.div>

          <motion.div
            className="space-y-16"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Badge Statistics */}
            <motion.div variants={itemVariants}>
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-4">Badge Overview</h2>
                <p className="text-muted-foreground">
                  Track your progress and see what badges you can earn
                </p>
              </div>
              <BadgeStats />
            </motion.div>

            {/* Sponsor Favorites */}
            <motion.div variants={itemVariants}>
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-4">Sponsor Favorites</h2>
                <p className="text-muted-foreground">
                  Recent badges awarded by our sponsor partners
                </p>
              </div>
              <SponsorFavorites limit={8} />
            </motion.div>

            {/* Badge Categories */}
            <motion.section variants={itemVariants}>
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-4">Badge Categories</h2>
                <p className="text-muted-foreground">
                  Learn about different types of badges and how to earn them
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {badgeCategories.map((category, index) => (
                  <motion.div
                    key={category.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Card className="h-full hover:shadow-lg transition-shadow duration-200 hover-lift">
                      <CardHeader>
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${category.color} flex items-center justify-center`}>
                            <category.icon className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{category.name}</CardTitle>
                            <p className="text-sm text-muted-foreground">{category.count} awarded</p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          {category.description}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.section>

            {/* All Badges */}
            <motion.div variants={itemVariants}>
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-4">All Badges</h2>
                <p className="text-muted-foreground">
                  Browse all available badges across our platform
                </p>
              </div>
              <BadgeList 
                title=""
                showFilters={true}
                showPagination={true}
                limit={24}
                badgeSize="md"
              />
            </motion.div>

            {/* Call to Action */}
            <motion.div variants={itemVariants}>
              <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-200 dark:border-purple-800">
                <CardContent className="p-12 text-center">
                  <Star className="w-16 h-16 text-purple-500 mx-auto mb-6" />
                  <h3 className="text-3xl font-bold mb-4">Start Earning Badges Today</h3>
                  <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                    Join challenges, submit innovative AI solutions, and build your reputation in the EliteBuilders community. 
                    Each badge you earn showcases your skills to potential employers and collaborators.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button size="lg" className="px-8" asChild>
                      <a href="/challenges">
                        Browse Challenges
                      </a>
                    </Button>
                    <Button size="lg" variant="outline" className="px-8" asChild>
                      <a href="/leaderboard">
                        View Leaderboard
                      </a>
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mt-6">
                    New to EliteBuilders? Check out our getting started guide to learn how to participate in challenges.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </>
  );
} 