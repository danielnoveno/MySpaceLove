'use client';

import React, { useEffect, useCallback, useState } from 'react';
import { X, ZoomIn, ZoomOut, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import AppImage from '@/components/AppImage';

interface ImagePreviewProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  alt?: string;
  images?: string[];
  currentIndex?: number;
  onNavigate?: (index: number) => void;
}

export default function ImagePreview({
  isOpen,
  onClose,
  imageUrl,
  alt = '',
  images = [],
  currentIndex = 0,
  onNavigate,
}: ImagePreviewProps) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const hasMultipleImages = images.length > 1;

  const resetTransforms = useCallback(() => {
    setZoom(1);
    setRotation(0);
  }, []);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          if (hasMultipleImages && onNavigate && currentIndex > 0) {
            onNavigate(currentIndex - 1);
            resetTransforms();
          }
          break;
        case 'ArrowRight':
          if (
            hasMultipleImages &&
            onNavigate &&
            currentIndex < images.length - 1
          ) {
            onNavigate(currentIndex + 1);
            resetTransforms();
          }
          break;
        case '+':
        case '=':
          setZoom((prev) => Math.min(prev + 0.25, 3));
          break;
        case '-':
          setZoom((prev) => Math.max(prev - 0.25, 0.5));
          break;
        case 'r':
          setRotation((prev) => prev + 90);
          break;
      }
    },
    [onClose, onNavigate, currentIndex, images.length, hasMultipleImages, resetTransforms]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
      const timeout = setTimeout(resetTransforms, 0);
      return () => {
        clearTimeout(timeout);
        document.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'unset';
      };
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, handleKeyDown, resetTransforms]);

  if (!isOpen) return null;

  const currentImageUrl = hasMultipleImages ? images[currentIndex] : imageUrl;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black/90 animate-in fade-in duration-200"
        onClick={onClose}
      />

      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors z-10 p-2 rounded-full hover:bg-white/10"
        aria-label="Close"
      >
        <X size={24} />
      </button>

      {hasMultipleImages && currentIndex > 0 && onNavigate && (
        <button
          onClick={() => {
            onNavigate(currentIndex - 1);
            resetTransforms();
          }}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors z-10 p-3 rounded-full bg-black/30 hover:bg-black/50"
          aria-label="Previous image"
        >
          <ChevronLeft size={24} />
        </button>
      )}

      {hasMultipleImages && currentIndex < images.length - 1 && onNavigate && (
        <button
          onClick={() => {
            onNavigate(currentIndex + 1);
            resetTransforms();
          }}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors z-10 p-3 rounded-full bg-black/30 hover:bg-black/50"
          aria-label="Next image"
        >
          <ChevronRight size={24} />
        </button>
      )}

      <div className="relative z-10 flex flex-col items-center max-w-[90vw] max-h-[90vh]">
        <div className="overflow-hidden flex items-center justify-center">
          <AppImage
            src={currentImageUrl}
            alt={alt}
            className="max-w-full max-h-[80vh] object-contain transition-transform duration-200"
            style={{
              transform: `scale(${zoom}) rotate(${rotation}deg)`,
            }}
            onClick={(e) => e.stopPropagation()}
          />
        </div>

        <div className="flex items-center gap-2 mt-4 bg-black/50 rounded-xl px-4 py-2">
          <button
            onClick={() => setZoom((prev) => Math.max(prev - 0.25, 0.5))}
            className="text-white/70 hover:text-white transition-colors p-1"
            aria-label="Zoom out"
          >
            <ZoomOut size={18} />
          </button>
          <span className="text-white/70 text-sm min-w-[3rem] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom((prev) => Math.min(prev + 0.25, 3))}
            className="text-white/70 hover:text-white transition-colors p-1"
            aria-label="Zoom in"
          >
            <ZoomIn size={18} />
          </button>
          <div className="w-px h-4 bg-white/30 mx-1" />
          <button
            onClick={() => setRotation((prev) => prev + 90)}
            className="text-white/70 hover:text-white transition-colors p-1"
            aria-label="Rotate"
          >
            <RotateCcw size={18} />
          </button>
          <button
            onClick={resetTransforms}
            className="text-white/70 hover:text-white transition-colors text-xs px-2 py-1"
          >
            Reset
          </button>
        </div>

        {hasMultipleImages && (
          <p className="text-white/50 text-sm mt-2">
            {currentIndex + 1} / {images.length}
          </p>
        )}
      </div>
    </div>
  );
}
