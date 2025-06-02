'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

const tiers = [
  {
    name: "Free",
    price: "$0",
    description: "Perfect for getting started and exploring challenges",
    features: [
      "Access to public challenges",
      "Basic profile",
      "Community forum access",
      "Limited submissions (3/month)"
    ],
    cta: "Get Started",
    popular: false,
    color: "border-gray-200 dark:border-gray-800"
  },
  {
    name: "Pro",
    price: "$29",
    period: "/month",
    description: "For serious builders looking to showcase their skills",
    features: [
      "All Free features",
      "Unlimited submissions",
      "Enhanced profile with portfolio",
      "Early access to new challenges",
      "Priority feedback from judges"
    ],
    cta: "Upgrade to Pro",
    popular: true,
    color: "border-purple-500"
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For companies looking to sponsor challenges and hire talent",
    features: [
      "All Pro features",
      "Create custom challenges",
      "Direct access to top performers",
      "Branded company profile",
      "Talent acquisition dashboard",
      "API access"
    ],
    cta: "Contact Sales",
    popular: false,
    color: "border-gray-200 dark:border-gray-800"
  }
];

export function Pricing() {
  return (
    <section className="py-24 bg-gray-50 dark:bg-gray-950">
      <div className="container px-4 md:px-6">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Simple, Transparent Pricing</h2>
          <p className="text-gray-500 dark:text-gray-400 text-xl max-w-2xl mx-auto">
            Choose the plan that's right for you
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {tiers.map((tier, index) => (
            <motion.div
              key={index}
              className={`relative rounded-xl p-8 border-2 ${tier.color} bg-white dark:bg-gray-900 flex flex-col h-full ${
                tier.popular ? 'md:-mt-8 md:mb-8' : ''
              }`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-purple-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </div>
              )}
              
              <div className="mb-6">
                <h3 className="text-xl font-bold mb-2">{tier.name}</h3>
                <div className="flex items-baseline mb-2">
                  <span className="text-3xl font-bold">{tier.price}</span>
                  {tier.period && <span className="text-gray-500 dark:text-gray-400 ml-1">{tier.period}</span>}
                </div>
                <p className="text-gray-500 dark:text-gray-400">{tier.description}</p>
              </div>
              
              <ul className="space-y-3 mb-8 flex-1">
                {tier.features.map((feature, i) => (
                  <li key={i} className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              
              <a
                href="#"
                className={`inline-flex items-center justify-center h-10 px-6 font-medium rounded-md w-full ${
                  tier.popular
                    ? 'bg-purple-600 text-white hover:bg-purple-700'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700'
                } transition-colors`}
              >
                {tier.cta}
              </a>
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
          <p className="text-gray-500 dark:text-gray-400">
            All plans include a 14-day free trial. No credit card required.
          </p>
        </motion.div>
      </div>
    </section>
  );
} 