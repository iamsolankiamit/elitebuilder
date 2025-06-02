'use client'

import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef, useState, useEffect } from 'react'

interface CounterProps {
  from: number
  to: number
  duration: number
  delay?: number
  formatter?: (value: number) => string
}

function Counter({ from, to, duration, delay = 0, formatter = (value) => `${value}` }: CounterProps) {
  const nodeRef = useRef(null)
  const isInView = useInView(nodeRef, { once: true })
  const [count, setCount] = useState(from)
  
  useEffect(() => {
    if (!isInView) return
    
    let startTime: number
    let animationFrame: number
    
    const startAnimation = (timestamp: number) => {
      startTime = timestamp
      animate(timestamp)
    }
    
    const animate = (timestamp: number) => {
      const runtime = timestamp - startTime
      const relativeProgress = runtime / duration
      
      if (relativeProgress < 1) {
        const currentCount = Math.floor(from + (to - from) * relativeProgress)
        setCount(currentCount)
        animationFrame = requestAnimationFrame(animate)
      } else {
        setCount(to)
        cancelAnimationFrame(animationFrame)
      }
    }
    
    const timeoutId = setTimeout(() => {
      animationFrame = requestAnimationFrame(startAnimation)
    }, delay)
    
    return () => {
      clearTimeout(timeoutId)
      cancelAnimationFrame(animationFrame)
    }
  }, [from, to, duration, delay, isInView])
  
  return <span ref={nodeRef}>{formatter(count)}</span>
}

const stats = [
  { id: 1, name: 'Active Challenges', value: 50, prefix: '', suffix: '+' },
  { id: 2, name: 'Registered Builders', value: 2500, prefix: '', suffix: '+' },
  { id: 3, name: 'Hiring Partners', value: 75, prefix: '', suffix: '' },
  { id: 4, name: 'Success Rate', value: 92, prefix: '', suffix: '%' },
]

export function Stats() {
  return (
    <div className="relative py-24 sm:py-32 overflow-hidden">
      <div className="absolute inset-0 gradient-bg-2 noise-bg opacity-50" />
      
      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div 
          className="mx-auto max-w-2xl lg:max-w-none"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Trusted by builders and companies worldwide
            </h2>
            <p className="mt-4 text-lg leading-8 text-muted-foreground">
              Join thousands of developers who are showcasing their skills and landing their dream jobs.
            </p>
          </div>
          <dl className="mt-16 grid grid-cols-1 gap-0.5 overflow-hidden rounded-2xl text-center sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <motion.div
                key={stat.id}
                className="flex flex-col bg-background/50 backdrop-blur-sm p-8 hover-lift"
                whileHover={{ scale: 1.02 }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: stat.id * 0.1 }}
              >
                <dt className="text-sm font-medium leading-6 text-muted-foreground">
                  {stat.name}
                </dt>
                <dd className="order-first text-3xl font-semibold tracking-tight text-foreground">
                  {stat.prefix}
                  <Counter 
                    from={0} 
                    to={stat.value} 
                    duration={2000} 
                    delay={stat.id * 100} 
                  />
                  {stat.suffix}
                </dd>
              </motion.div>
            ))}
          </dl>
        </motion.div>
      </div>
    </div>
  )
} 