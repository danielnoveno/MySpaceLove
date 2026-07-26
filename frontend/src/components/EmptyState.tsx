'use client'

import React from 'react'
import { Heart } from 'lucide-react'
import { FadeIn } from '@/components/motion'

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
}

export default function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <FadeIn>
      <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
        <div className="w-20 h-20 rounded-full bg-brand-50 flex items-center justify-center mb-6">
          {icon || <Heart size={36} className="text-brand-400" />}
        </div>

        <h3 className="text-lg font-semibold text-warm-900 mb-2">{title}</h3>

        {description && (
          <p className="text-warm-500 text-sm max-w-sm mb-6">{description}</p>
        )}

        {actionLabel && onAction && (
          <button
            onClick={onAction}
            className="px-6 py-2.5 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold rounded-xl transition-all hover:shadow-lg hover:shadow-brand-500/25 active:scale-[0.98]"
          >
            {actionLabel}
          </button>
        )}
      </div>
    </FadeIn>
  )
}
