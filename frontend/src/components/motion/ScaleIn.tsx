'use client'

import { motion, useReducedMotion } from 'motion/react'
import { ReactNode } from 'react'

type ScaleInProps = {
  children: ReactNode
  delay?: number
  className?: string
}

export default function ScaleIn({
  children,
  delay = 0,
  className = '',
}: ScaleInProps) {
  const reduce = useReducedMotion()

  if (reduce) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{
        duration: 0.5,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
