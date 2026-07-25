'use client';

import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  onRate?: (rating: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = {
  sm: 16,
  md: 20,
  lg: 28,
};

export default function StarRating({
  rating,
  onRate,
  readonly = false,
  size = 'md',
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState<number>(0);
  const starSize = sizeMap[size];

  const handleClick = (index: number, isHalf: boolean) => {
    if (readonly || !onRate) return;
    onRate(isHalf ? index + 0.5 : index + 1);
  };

  const handleMouseMove = (
    e: React.MouseEvent<HTMLButtonElement>,
    index: number
  ) => {
    if (readonly) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const isHalf = x < rect.width / 2;
    setHoverRating(isHalf ? index + 0.5 : index + 1);
  };

  const getStarFillState = (index: number): 'full' | 'half' | 'empty' => {
    const activeRating = hoverRating || rating;
    if (activeRating >= index + 1) return 'full';
    if (activeRating >= index + 0.5) return 'half';
    return 'empty';
  };

  return (
    <div
      className="flex items-center gap-0.5"
      onMouseLeave={() => !readonly && setHoverRating(0)}
    >
      {Array.from({ length: 5 }, (_, i) => {
        const fillState = getStarFillState(i);

        return (
          <button
            key={i}
            type="button"
            onClick={() => handleClick(i, fillState === 'half')}
            onMouseMove={(e) => handleMouseMove(e, i)}
            disabled={readonly}
            className={`relative ${readonly ? 'cursor-default' : 'cursor-pointer'} transition-transform ${!readonly && 'hover:scale-110'}`}
            aria-label={`${i + 1} star${i > 0 ? 's' : ''}`}
          >
            <Star
              size={starSize}
              className="text-gray-200"
              fill="currentColor"
              strokeWidth={0}
            />

            {fillState === 'full' && (
              <Star
                size={starSize}
                className="absolute inset-0 text-pink-500"
                fill="currentColor"
                strokeWidth={0}
              />
            )}

            {fillState === 'half' && (
              <div className="absolute inset-0 overflow-hidden" style={{ width: '50%' }}>
                <Star
                  size={starSize}
                  className="text-pink-500"
                  fill="currentColor"
                  strokeWidth={0}
                />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
