'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'

export function Hero() {
  return (
    <div className="relative overflow-hidden">
      {/* Background gradient and noise effect */}
      <div className="absolute inset-0 gradient-bg-2 noise-bg" />
      
      {/* Animated background shapes */}
      <motion.div
        className="absolute top-1/4 -right-16 w-64 h-64 bg-primary/5 rounded-full blur-3xl"
        animate={{
          y: [0, 30, 0],
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{
          duration: 8,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />
      
      <motion.div
        className="absolute bottom-1/4 -left-16 w-72 h-72 bg-secondary/10 rounded-full blur-3xl"
        animate={{
          y: [0, -20, 0],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 10,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
          delay: 1,
        }}
      />
      
      <motion.div
        className="absolute top-1/2 left-1/3 w-48 h-48 bg-accent/5 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.4, 0.7, 0.4],
        }}
        transition={{
          duration: 12,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
          delay: 2,
        }}
      />
      
      <div className="container relative z-10 mx-auto px-4 py-32 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6"
          >
            <span className="inline-block px-4 py-1 mb-4 text-sm font-medium rounded-full bg-primary/10 text-primary">
              The Future of AI Development Competitions
            </span>
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
              <span className="block">Prove Your Skills.</span>
              <span className="block gradient-text">
                Build Your Career.
              </span>
            </h1>
          </motion.div>
          
          <motion.p
            className="mt-6 max-w-2xl mx-auto text-xl text-muted-foreground"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            EliteBuilders is the competitive arena where solo developers craft and submit
            AI-powered MVPs against real-world challenges from top companies.
          </motion.p>
          
          <motion.div
            className="mt-10 flex flex-col sm:flex-row justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Button size="pill-lg" variant="glow" className="glow-on-hover">
              Join the Competition
            </Button>
            <Button variant="glass" size="pill-lg">
              Browse Challenges
            </Button>
          </motion.div>
          
          {/* Stats preview */}
          <motion.div 
            className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <div className="flex flex-col items-center p-6 rounded-lg bg-background/30 backdrop-blur-sm border border-border/50 card-hover">
              <span className="text-3xl font-bold text-foreground">100+</span>
              <span className="text-sm text-muted-foreground">Active Challenges</span>
            </div>
            <div className="flex flex-col items-center p-6 rounded-lg bg-background/30 backdrop-blur-sm border border-border/50 card-hover">
              <span className="text-3xl font-bold text-foreground">5,000+</span>
              <span className="text-sm text-muted-foreground">Registered Builders</span>
            </div>
            <div className="flex flex-col items-center p-6 rounded-lg bg-background/30 backdrop-blur-sm border border-border/50 card-hover">
              <span className="text-3xl font-bold text-foreground">$250K+</span>
              <span className="text-sm text-muted-foreground">Prize Pool</span>
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
    </div>
  )
} 