'use client'

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building2, Trophy, Users, Zap, Target, Handshake, ChevronRight, Star, Award, Crown } from 'lucide-react';
import { Header } from '@/components/header';

// Mock sponsor data - in real app, this would come from an API
const sponsors = [
  {
    id: 1,
    name: "TechCorp",
    logo: "/sponsors/placeholder.svg",
    tier: "platinum",
    description: "Leading AI infrastructure provider powering next-generation applications.",
    website: "https://techcorp.example.com",
    challenges: 12,
    totalPrize: 150000,
    featured: true
  },
  {
    id: 2,
    name: "AI Ventures",
    logo: "/sponsors/placeholder.svg",
    tier: "platinum",
    description: "Venture capital firm investing in AI startups and talent.",
    website: "https://aiventures.example.com",
    challenges: 8,
    totalPrize: 120000,
    featured: true
  },
  {
    id: 3,
    name: "DataSphere",
    logo: "/sponsors/placeholder.svg",
    tier: "gold",
    description: "Enterprise data platform for machine learning at scale.",
    website: "https://datasphere.example.com",
    challenges: 6,
    totalPrize: 75000,
    featured: false
  },
  {
    id: 4,
    name: "Neural Systems",
    logo: "/sponsors/placeholder.svg",
    tier: "gold",
    description: "AI research lab developing cutting-edge neural networks.",
    website: "https://neuralsys.example.com",
    challenges: 5,
    totalPrize: 60000,
    featured: false
  },
  {
    id: 5,
    name: "Quantum Labs",
    logo: "/sponsors/placeholder.svg",
    tier: "silver",
    description: "Quantum computing solutions for AI acceleration.",
    website: "https://quantumlabs.example.com",
    challenges: 3,
    totalPrize: 30000,
    featured: false
  },
  {
    id: 6,
    name: "Future AI",
    logo: "/sponsors/placeholder.svg",
    tier: "silver",
    description: "Next-generation AI tools for developers and businesses.",
    website: "https://futureai.example.com",
    challenges: 4,
    totalPrize: 25000,
    featured: false
  }
];

const sponsorshipTiers = [
  {
    name: "Platinum",
    price: "$50,000",
    color: "from-slate-300 to-slate-500",
    icon: Crown,
    benefits: [
      "Featured placement on homepage",
      "Up to 6 challenges per year",
      "Direct access to top 100 builders",
      "Custom challenge design support",
      "Priority in leaderboard visibility",
      "Quarterly talent reports",
      "Co-branded marketing materials",
      "VIP networking events access"
    ]
  },
  {
    name: "Gold",
    price: "$25,000",
    color: "from-yellow-300 to-yellow-600",
    icon: Award,
    benefits: [
      "Premium sponsor page listing",
      "Up to 4 challenges per year",
      "Access to top 50 builders",
      "Challenge template library",
      "Monthly talent insights",
      "Marketing collaboration",
      "Networking events access"
    ]
  },
  {
    name: "Silver",
    price: "$10,000",
    color: "from-gray-300 to-gray-500",
    icon: Star,
    benefits: [
      "Standard sponsor page listing",
      "Up to 2 challenges per year",
      "Access to top 25 builders",
      "Basic challenge support",
      "Quarterly reports",
      "Community features access"
    ]
  }
];

const sponsorBenefits = [
  {
    icon: Target,
    title: "Access Top Talent",
    description: "Connect directly with skilled AI builders who have proven their abilities through real-world challenges."
  },
  {
    icon: Trophy,
    title: "Custom Challenges",
    description: "Create challenges that align with your business needs and technical requirements."
  },
  {
    icon: Users,
    title: "Build Your Brand",
    description: "Increase visibility in the AI community and position your company as an innovation leader."
  },
  {
    icon: Zap,
    title: "Fast Recruitment",
    description: "Identify and recruit top performers faster than traditional hiring methods."
  }
];

export default function SponsorsPage() {
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

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'platinum':
        return 'from-slate-300 to-slate-500';
      case 'gold':
        return 'from-yellow-300 to-yellow-600';
      case 'silver':
        return 'from-gray-300 to-gray-500';
      default:
        return 'from-gray-300 to-gray-500';
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'platinum':
        return Crown;
      case 'gold':
        return Award;
      case 'silver':
        return Star;
      default:
        return Star;
    }
  };

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
              <Building2 className="w-8 h-8 text-blue-500" />
              <h1 className="text-4xl font-bold gradient-text">
                Our Sponsors
              </h1>
            </div>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Leading companies that provide real-world challenges, fund prizes, and connect with top AI talent through our platform.
            </p>
          </motion.div>

          <motion.div
            className="space-y-16"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Current Sponsors */}
            <motion.section variants={itemVariants}>
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-4">Current Sponsors</h2>
                <p className="text-muted-foreground">
                  Meet the innovative companies driving AI talent development
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sponsors.map((sponsor, index) => {
                  const TierIcon = getTierIcon(sponsor.tier);
                  return (
                    <motion.div
                      key={sponsor.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <Card className="h-full hover:shadow-lg transition-shadow duration-200 hover-lift">
                        <CardHeader className="text-center">
                          <div className="relative w-24 h-24 mx-auto mb-4">
                            <Image
                              src={sponsor.logo}
                              alt={`${sponsor.name} logo`}
                              fill
                              className="object-contain"
                            />
                          </div>
                          <div className="flex items-center justify-center gap-2 mb-2">
                            <CardTitle className="text-xl">{sponsor.name}</CardTitle>
                            <Badge 
                              variant="outline" 
                              className={`bg-gradient-to-r ${getTierColor(sponsor.tier)} text-white border-0`}
                            >
                              <TierIcon className="w-3 h-3 mr-1" />
                              {sponsor.tier}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {sponsor.description}
                          </p>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Challenges:</span>
                              <span className="font-medium">{sponsor.challenges}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Total Prizes:</span>
                              <span className="font-medium">${sponsor.totalPrize.toLocaleString()}</span>
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="w-full mt-4"
                              asChild
                            >
                              <a href={sponsor.website} target="_blank" rel="noopener noreferrer">
                                Visit Website
                                <ChevronRight className="w-4 h-4 ml-1" />
                              </a>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </motion.section>

            {/* Sponsorship Benefits */}
            <motion.section variants={itemVariants}>
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-4">Why Sponsor EliteBuilders?</h2>
                <p className="text-muted-foreground">
                  Connect with top AI talent and build your brand in the developer community
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {sponsorBenefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Card className="text-center h-full hover:shadow-lg transition-shadow duration-200">
                      <CardContent className="p-6">
                        <benefit.icon className="w-12 h-12 mx-auto mb-4 text-primary" />
                        <h3 className="text-lg font-semibold mb-2">{benefit.title}</h3>
                        <p className="text-sm text-muted-foreground">{benefit.description}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.section>

            {/* Sponsorship Tiers */}
            <motion.section variants={itemVariants}>
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-4">Sponsorship Tiers</h2>
                <p className="text-muted-foreground">
                  Choose the sponsorship level that best fits your goals and budget
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {sponsorshipTiers.map((tier, index) => (
                  <motion.div
                    key={tier.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Card className={`h-full ${tier.name === 'Gold' ? 'ring-2 ring-primary scale-105' : ''} hover:shadow-lg transition-all duration-200`}>
                      <CardHeader className="text-center">
                        <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r ${tier.color} flex items-center justify-center`}>
                          <tier.icon className="w-8 h-8 text-white" />
                        </div>
                        <CardTitle className="text-2xl">{tier.name}</CardTitle>
                        <p className="text-3xl font-bold text-primary">{tier.price}</p>
                        <p className="text-sm text-muted-foreground">per year</p>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-3">
                          {tier.benefits.map((benefit, benefitIndex) => (
                            <li key={benefitIndex} className="flex items-start gap-2 text-sm">
                              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                              {benefit}
                            </li>
                          ))}
                        </ul>
                        <Button className="w-full mt-6" variant={tier.name === 'Gold' ? 'default' : 'outline'}>
                          Get Started
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.section>

            {/* CTA Section */}
            <motion.section variants={itemVariants}>
              <Card className="bg-gradient-to-r from-primary/10 to-blue-500/10 border-primary/20">
                <CardContent className="p-12 text-center">
                  <Handshake className="w-16 h-16 text-primary mx-auto mb-6" />
                  <h3 className="text-3xl font-bold mb-4">Ready to Sponsor?</h3>
                  <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                    Join leading companies in discovering and recruiting the next generation of AI talent. 
                    Create challenges, award prizes, and build your brand in the developer community.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button size="lg" className="px-8">
                      Become a Sponsor
                    </Button>
                    <Button size="lg" variant="outline" className="px-8">
                      Download Sponsor Kit
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mt-6">
                    Questions? Contact us at sponsors@elitebuilders.ai
                  </p>
                </CardContent>
              </Card>
            </motion.section>
          </motion.div>
        </div>
      </div>
    </>
  );
} 