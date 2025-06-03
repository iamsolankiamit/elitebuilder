'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Search, Filter, Plus, Calendar, DollarSign, Users, Trophy } from 'lucide-react';

import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useChallenges } from '@/hooks/use-challenges';
import { useAuth } from '@/hooks/use-auth';
import type { Challenge } from '@/lib/types';

function ChallengeCard({ challenge }: { challenge: Challenge }) {
  const isExpired = new Date(challenge.deadline) < new Date();
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="card-hover h-full">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-xl mb-2 hover:text-primary transition-colors">
                <Link href={`/challenges/${challenge.id}`}>
                  {challenge.title}
                </Link>
              </CardTitle>
              <CardDescription className="line-clamp-2">
                {challenge.description}
              </CardDescription>
            </div>
            {isExpired && (
              <Badge variant="destructive">Expired</Badge>
            )}
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            {/* Challenge Stats */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>{challenge._count.participants} participants</span>
              </div>
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-muted-foreground" />
                <span>{challenge._count.submissions} submissions</span>
              </div>
            </div>

            {/* Prize and Deadline */}
            <div className="space-y-2">
              {challenge.prize && (
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-500" />
                  <span className="text-green-500 font-semibold">
                    ${challenge.prize.toLocaleString()} Prize
                  </span>
                </div>
              )}
              
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className={isExpired ? 'text-destructive' : 'text-muted-foreground'}>
                  {isExpired ? 'Ended' : 'Ends'} {new Date(challenge.deadline).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Creator */}
            <div className="flex items-center gap-2 pt-2 border-t">
              {challenge.creator.avatar && (
                <img
                  src={challenge.creator.avatar}
                  alt={challenge.creator.username}
                  className="w-6 h-6 rounded-full"
                />
              )}
              <span className="text-sm text-muted-foreground">
                by {challenge.creator.name || challenge.creator.username}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function ChallengesPage() {
  const { isAuthenticated } = useAuth();
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'createdAt' | 'deadline' | 'prize'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  
  const { data, isLoading, error } = useChallenges({
    search: search || undefined,
    sortBy,
    sortOrder,
    page,
    limit: 12,
  });

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-background via-background to-primary/5 py-20">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-4xl mx-auto text-center"
            >
              <h1 className="text-4xl md:text-6xl font-bold mb-6 gradient-text">
                AI Challenges
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Test your skills, build amazing AI products, and compete with the best builders worldwide.
              </p>
              
              {isAuthenticated && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <Button asChild size="lg" className="hover-lift glow-on-hover">
                    <Link href="/challenges/create">
                      <Plus className="mr-2 h-5 w-5" />
                      Create Challenge
                    </Link>
                  </Button>
                </motion.div>
              )}
            </motion.div>
          </div>
        </section>

        {/* Filters and Search */}
        <section className="py-8 border-b">
          <div className="container">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex items-center gap-4 w-full md:w-auto">
                <div className="relative flex-1 md:w-80">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search challenges..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSortBy('deadline')}
                  className={sortBy === 'deadline' ? 'bg-primary text-primary-foreground' : ''}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  Deadline
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSortBy('prize')}
                  className={sortBy === 'prize' ? 'bg-primary text-primary-foreground' : ''}
                >
                  <DollarSign className="mr-2 h-4 w-4" />
                  Prize
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                >
                  <Filter className="mr-2 h-4 w-4" />
                  {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Challenges Grid */}
        <section className="py-12">
          <div className="container">
            {isLoading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="h-6 bg-muted rounded w-3/4"></div>
                      <div className="h-4 bg-muted rounded w-full"></div>
                      <div className="h-4 bg-muted rounded w-2/3"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="h-4 bg-muted rounded w-1/2"></div>
                        <div className="h-4 bg-muted rounded w-3/4"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {error && (
              <div className="text-center py-12">
                <p className="text-destructive">Failed to load challenges. Please try again.</p>
              </div>
            )}

            {data && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {data.challenges.map((challenge) => (
                    <ChallengeCard key={challenge.id} challenge={challenge} />
                  ))}
                </div>

                {data.challenges.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No challenges found. Try adjusting your search.</p>
                  </div>
                )}

                {/* Pagination */}
                {data.pagination.totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-12">
                    <Button
                      variant="outline"
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                    >
                      Previous
                    </Button>
                    <span className="px-4 py-2 text-sm">
                      Page {page} of {data.pagination.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      onClick={() => setPage(page + 1)}
                      disabled={page === data.pagination.totalPages}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
} 