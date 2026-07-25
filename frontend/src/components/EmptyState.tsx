'use client';

import React from 'react';
import { Heart } from 'lucide-react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-20 h-20 rounded-full bg-pink-50 flex items-center justify-center mb-6">
        {icon || <Heart size={36} className="text-pink-400" />}
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>

      {description && (
        <p className="text-gray-500 text-sm max-w-sm mb-6">{description}</p>
      )}

      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-6 py-2.5 bg-pink-500 hover:bg-pink-600 text-white text-sm font-medium rounded-xl transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
