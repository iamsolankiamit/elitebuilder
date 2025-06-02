'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Code, Trophy, Users } from 'lucide-react';

const steps = [
  {
    icon: <Code className="h-10 w-10" />,
    title: "Choose a Challenge",
    description: "Browse through company-authored and sponsored challenges with clear deadlines and evaluation rubrics.",
    color: "bg-purple-100 dark:bg-purple-950/30",
    textColor: "text-purple-600 dark:text-purple-400",
    borderColor: "border-purple-200 dark:border-purple-800"
  },
  {
    icon: <Users className="h-10 w-10" />,
    title: "Build Your Solution",
    description: "Craft an AI-powered MVP complete with a prototype, pitch deck, and demo video.",
    color: "bg-cyan-100 dark:bg-cyan-950/30",
    textColor: "text-cyan-600 dark:text-cyan-400",
    borderColor: "border-cyan-200 dark:border-cyan-800"
  },
  {
    icon: <Trophy className="h-10 w-10" />,
    title: "Get Recognized",
    description: "Earn badges, cash prizes, and connect with hiring partners who can directly engage with top talent.",
    color: "bg-amber-100 dark:bg-amber-950/30",
    textColor: "text-amber-600 dark:text-amber-400",
    borderColor: "border-amber-200 dark:border-amber-800"
  }
];

export function HowItWorks() {
  return (
    <section className="py-24 bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-black">
      <div className="container px-4 md:px-6">
        <div className="text-center mb-16">
          <motion.h2 
            className="text-3xl md:text-4xl font-bold tracking-tight mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            How It Works
          </motion.h2>
          <motion.p 
            className="text-gray-500 dark:text-gray-400 text-xl max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
          >
            Our platform connects talented builders with real-world AI challenges
          </motion.p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {steps.map((step, index) => (
            <motion.div 
              key={index}
              className={`relative rounded-xl p-8 border ${step.borderColor} ${step.color} flex flex-col items-center text-center`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <div className={`p-3 rounded-full ${step.color} ${step.textColor} mb-6`}>
                {step.icon}
              </div>
              <h3 className="text-xl font-bold mb-3">{step.title}</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">{step.description}</p>
              
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2 z-10">
                  <ArrowRight className="h-8 w-8 text-gray-300 dark:text-gray-700" />
                </div>
              )}
            </motion.div>
          ))}
        </div>

        <motion.div 
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <a 
            href="#" 
            className="inline-flex items-center text-purple-600 dark:text-purple-400 font-medium hover:underline"
          >
            Learn more about our process
            <ArrowRight className="ml-2 h-4 w-4" />
          </a>
        </motion.div>
      </div>
    </section>
  );
} 