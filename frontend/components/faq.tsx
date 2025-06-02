'use client';

import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

const faqs = [
  {
    question: "How does the challenge scoring work?",
    answer: "Challenges are scored using a hybrid approach: automated LLM-driven scoring based on predefined rubrics, plus human judge reviews. This ensures both objective technical assessment and subjective quality evaluation."
  },
  {
    question: "Can I participate in multiple challenges simultaneously?",
    answer: "Yes! You can participate in as many challenges as you'd like. Each challenge has its own deadline and requirements, so make sure to manage your time effectively."
  },
  {
    question: "How do I get noticed by hiring companies?",
    answer: "Perform well in challenges! Companies have access to leaderboards and can directly engage with top performers. Additionally, completing challenges earns you badges and improves your CareerScore, making your profile more attractive to potential employers."
  },
  {
    question: "What types of challenges are available?",
    answer: "We offer a diverse range of AI-focused challenges, from building conversational agents and recommendation systems to computer vision applications and multimodal solutions. Challenges are categorized by difficulty, domain, and required skills."
  },
  {
    question: "Do I need to be an AI expert to participate?",
    answer: "Not necessarily. We have challenges for all skill levels, from beginner to expert. Some challenges focus more on product thinking and UX design rather than deep technical implementation."
  },
  {
    question: "How are prizes distributed?",
    answer: "Prize distribution varies by challenge. Typically, the top 3 submissions receive cash prizes, with additional recognition for category winners (Best UX, Most Innovative, etc.). All details are specified in each challenge description."
  }
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-24 bg-white dark:bg-black">
      <div className="container px-4 md:px-6">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Frequently Asked Questions</h2>
          <p className="text-gray-500 dark:text-gray-400 text-xl max-w-2xl mx-auto">
            Everything you need to know about EliteBuilders
          </p>
        </motion.div>

        <div className="max-w-3xl mx-auto">
          {faqs.map((faq, index) => (
            <motion.div 
              key={index}
              className="border-b border-gray-200 dark:border-gray-800"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              viewport={{ once: true }}
            >
              <button
                className="flex justify-between items-center w-full py-6 text-left"
                onClick={() => toggleFAQ(index)}
              >
                <h3 className="text-lg font-medium">{faq.question}</h3>
                <ChevronDown 
                  className={`h-5 w-5 text-gray-500 transition-transform ${
                    openIndex === index ? 'transform rotate-180' : ''
                  }`} 
                />
              </button>
              <div 
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  openIndex === index ? 'max-h-96 pb-6' : 'max-h-0'
                }`}
              >
                <p className="text-gray-500 dark:text-gray-400">
                  {faq.answer}
                </p>
              </div>
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
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Still have questions?
          </p>
          <a 
            href="#" 
            className="inline-flex items-center justify-center h-10 px-6 font-medium rounded-md bg-purple-600 text-white hover:bg-purple-700 transition-colors"
          >
            Contact Support
          </a>
        </motion.div>
      </div>
    </section>
  );
} 