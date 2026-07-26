'use client'

import { motion, useReducedMotion } from 'motion/react'
import { ReactNode } from 'react'

type ParallaxProps = {
  children: ReactNode
  speed?: number
  className?: string
}

export default function Parallax({
  children,
  speed = 0.3,
  className = '',
}: ParallaxProps) {
  const reduce = useReducedMotion()

  if (reduce) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      initial={{ y: 0 }}
      whileInView={{ y: -50 * speed }}
      viewport={{ once: false, amount: 0.1 }}
      transition={{
        duration: 0.1,
        ease: 'linear',
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
