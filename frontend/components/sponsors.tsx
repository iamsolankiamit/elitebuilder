'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

// In a real implementation, you would replace these with actual sponsor logos
const sponsors = [
  {
    name: "TechCorp",
    logo: "/sponsors/placeholder.svg",
    tier: "platinum"
  },
  {
    name: "AI Ventures",
    logo: "/sponsors/placeholder.svg",
    tier: "platinum"
  },
  {
    name: "DataSphere",
    logo: "/sponsors/placeholder.svg",
    tier: "gold"
  },
  {
    name: "Neural Systems",
    logo: "/sponsors/placeholder.svg",
    tier: "gold"
  },
  {
    name: "Quantum Labs",
    logo: "/sponsors/placeholder.svg",
    tier: "silver"
  },
  {
    name: "Future AI",
    logo: "/sponsors/placeholder.svg",
    tier: "silver"
  }
];

export function Sponsors() {
  return (
    <section className="py-20 bg-white dark:bg-black">
      <div className="container px-4 md:px-6">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Our Sponsors</h2>
          <p className="text-gray-500 dark:text-gray-400 text-xl max-w-2xl mx-auto">
            Leading companies that provide real-world challenges and opportunities
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center justify-items-center">
          {sponsors.map((sponsor, index) => (
            <motion.div
              key={index}
              className={`w-full max-w-[160px] h-20 relative flex items-center justify-center
                ${sponsor.tier === 'platinum' ? 'col-span-2 md:col-span-1' : ''}
              `}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
            >
              <Image
                src={sponsor.logo}
                alt={`${sponsor.name} logo`}
                width={160}
                height={80}
                className="object-contain"
              />
              <span className="sr-only">{sponsor.name}</span>
            </motion.div>
          ))}
        </div>

        <motion.div 
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          viewport={{ once: true }}
        >
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Want to sponsor challenges and connect with top AI talent?
          </p>
          <a 
            href="#" 
            className="inline-flex items-center justify-center h-10 px-6 font-medium rounded-md bg-purple-600 text-white hover:bg-purple-700 transition-colors"
          >
            Become a Sponsor
          </a>
        </motion.div>
      </div>
    </section>
  );
} 