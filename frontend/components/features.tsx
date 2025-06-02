'use client'

import { motion } from 'framer-motion'
import { 
  Trophy, 
  Code, 
  Briefcase, 
  Award, 
  BarChart, 
  Users 
} from 'lucide-react'

const features = [
  {
    name: 'Real-World Challenges',
    description: 'Tackle company-authored problems with real datasets and evaluation rubrics.',
    icon: Code,
  },
  {
    name: 'Automated Scoring',
    description: 'Get instant feedback with our LLM-driven evaluation system.',
    icon: BarChart,
  },
  {
    name: 'Career Opportunities',
    description: 'Connect directly with hiring partners who sponsor challenges.',
    icon: Briefcase,
  },
  {
    name: 'Global Leaderboards',
    description: 'Compete with builders worldwide and climb the rankings.',
    icon: Trophy,
  },
  {
    name: 'Recognition System',
    description: 'Earn badges and awards that showcase your expertise.',
    icon: Award,
  },
  {
    name: 'Community Network',
    description: 'Join a community of elite AI builders and industry sponsors.',
    icon: Users,
  },
]

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

export function Features() {
  return (
    <div className="py-24 sm:py-32 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 gradient-bg-3 opacity-50" />
      <div className="absolute inset-0 noise-bg" />
      
      {/* Animated background shape */}
      <motion.div
        className="absolute -right-64 -top-64 w-96 h-96 bg-primary/5 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 15,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />
      
      <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
        <div className="mx-auto max-w-2xl lg:text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-block px-4 py-1 mb-4 text-sm font-medium rounded-full bg-primary/10 text-primary"
          >
            Platform Features
          </motion.div>
          <motion.h2 
            className="text-base font-semibold leading-7 text-primary"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Build. Compete. Get Hired.
          </motion.h2>
          <motion.p
            className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Everything you need to showcase your AI building skills
          </motion.p>
          <motion.p
            className="mt-6 text-lg leading-8 text-muted-foreground"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            EliteBuilders provides a comprehensive platform for AI developers to demonstrate their 
            end-to-end product thinking, from prompt design to UX flow and business framing.
          </motion.p>
        </div>
        <motion.div 
          className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-3 lg:gap-y-16">
            {features.map((feature, index) => (
              <motion.div 
                key={feature.name} 
                className="relative p-6 rounded-xl bg-background/30 backdrop-blur-sm border border-border/50 card-hover"
                variants={item}
                whileHover={{ 
                  y: -5, 
                  boxShadow: "0 10px 30px -15px rgba(0, 0, 0, 0.2)",
                  transition: { duration: 0.2 }
                }}
              >
                <dt className="text-base font-semibold leading-7 text-foreground flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <feature.icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  {feature.name}
                </dt>
                <dd className="mt-4 text-base leading-7 text-muted-foreground">{feature.description}</dd>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.div>
            ))}
          </dl>
        </motion.div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
    </div>
  )
} 