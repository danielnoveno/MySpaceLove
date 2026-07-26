'use client'

import { motion, useReducedMotion } from 'motion/react'
import { ReactNode, useState } from 'react'

type MagneticButtonProps = {
  children: ReactNode
  className?: string
  strength?: number
  as?: 'button' | 'a'
  href?: string
  onClick?: () => void
}

export default function MagneticButton({
  children,
  className = '',
  strength = 0.3,
  as = 'button',
  href,
  onClick,
}: MagneticButtonProps) {
  const reduce = useReducedMotion()
  const [position, setPosition] = useState({ x: 0, y: 0 })

  const handleMouse = (e: React.MouseEvent<HTMLDivElement>) => {
    const { clientX, clientY } = e
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect()
    const centerX = left + width / 2
    const centerY = top + height / 2
    const deltaX = (clientX - centerX) * strength
    const deltaY = (clientY - centerY) * strength
    setPosition({ x: deltaX, y: deltaY })
  }

  const reset = () => setPosition({ x: 0, y: 0 })

  if (reduce) {
    if (as === 'a' && href) {
      return (
        <a href={href} className={className}>
          {children}
        </a>
      )
    }
    return (
      <button onClick={onClick} className={className}>
        {children}
      </button>
    )
  }

  return (
    <motion.div
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: 'spring', stiffness: 150, damping: 15, mass: 0.1 }}
      className="inline-block"
    >
      {as === 'a' && href ? (
        <a href={href} className={className}>
          {children}
        </a>
      ) : (
        <button onClick={onClick} className={className}>
          {children}
        </button>
      )}
    </motion.div>
  )
}
