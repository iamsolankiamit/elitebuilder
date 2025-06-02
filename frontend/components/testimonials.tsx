'use client'

import { motion } from 'framer-motion'

const testimonials = [
  {
    id: 1,
    content: "EliteBuilders helped me land a job at a top AI startup. The challenges pushed me to think beyond algorithms and focus on real product development.",
    author: "Alex Chen",
    role: "AI Engineer at Anthropic",
    image: "https://randomuser.me/api/portraits/men/1.jpg",
  },
  {
    id: 2,
    content: "As a hiring manager, I've found exceptional talent through EliteBuilders. The platform's evaluation system helps us identify candidates with practical skills.",
    author: "Sarah Johnson",
    role: "CTO at TechVision",
    image: "https://randomuser.me/api/portraits/women/2.jpg",
  },
  {
    id: 3,
    content: "The feedback from automated scoring and human judges helped me improve my AI development skills tremendously. Now I'm confident in building end-to-end solutions.",
    author: "Michael Rodriguez",
    role: "ML Engineer at Google",
    image: "https://randomuser.me/api/portraits/men/3.jpg",
  },
]

export function Testimonials() {
  return (
    <section className="py-24 sm:py-32 relative overflow-hidden">
      <div className="absolute inset-0 gradient-bg-2 noise-bg opacity-30" />
      
      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-xl text-center">
          <motion.h2
            className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Hear from our community
          </motion.h2>
          <motion.p
            className="mt-4 text-lg leading-8 text-muted-foreground"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Builders and companies share their experiences with EliteBuilders
          </motion.p>
        </div>
        
        <motion.div
          className="mx-auto mt-16 grid max-w-2xl grid-cols-1 grid-rows-1 gap-8 text-sm leading-6 sm:mt-20 sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-3"
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1,
              },
            },
          }}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          {testimonials.map((testimonial) => (
            <motion.figure
              key={testimonial.id}
              className="rounded-2xl bg-background p-6 shadow-lg ring-1 ring-border/10 hover-lift glow-on-hover"
              variants={{
                hidden: { opacity: 0, y: 20 },
                show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
              }}
            >
              <blockquote className="text-foreground">
                <p>{`"${testimonial.content}"`}</p>
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-x-4">
                <img
                  className="h-10 w-10 rounded-full"
                  src={testimonial.image}
                  alt={testimonial.author}
                />
                <div>
                  <div className="font-semibold text-foreground">{testimonial.author}</div>
                  <div className="text-muted-foreground">{testimonial.role}</div>
                </div>
              </figcaption>
            </motion.figure>
          ))}
        </motion.div>
      </div>
    </section>
  )
} 