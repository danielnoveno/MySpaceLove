'use client';

import React, { useEffect, useCallback } from 'react';
import { AlertTriangle, Info, X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

const variantConfig = {
  danger: { icon: AlertTriangle, iconBg: 'bg-coral-100', iconColor: 'text-coral-600', confirmBg: 'bg-coral-500 hover:bg-coral-600', border: 'border-coral-200' },
  warning: { icon: AlertTriangle, iconBg: 'bg-amber-100', iconColor: 'text-amber-600', confirmBg: 'bg-amber-500 hover:bg-amber-600', border: 'border-amber-200' },
  info: { icon: Info, iconBg: 'bg-brand-100', iconColor: 'text-brand-600', confirmBg: 'bg-brand-500 hover:bg-brand-600', border: 'border-brand-200' },
};

export default function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', cancelText = 'Cancel', variant = 'info' }: ConfirmDialogProps) {
  const config = variantConfig[variant];
  const IconComponent = config.icon;

  const handleKeyDown = useCallback((e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }, [onClose]);

  useEffect(() => {
    if (isOpen) { document.addEventListener('keydown', handleKeyDown); document.body.style.overflow = 'hidden' }
    return () => { document.removeEventListener('keydown', handleKeyDown); document.body.style.overflow = 'unset' }
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-xl w-full max-w-md p-6 animate-in zoom-in-95 fade-in duration-200">
        <button onClick={onClose} className="absolute top-4 right-4 text-warm-400 hover:text-warm-600 transition-colors" aria-label="Close"><X size={18} /></button>
        <div className="flex flex-col items-center text-center">
          <div className={`w-14 h-14 rounded-full ${config.iconBg} flex items-center justify-center mb-4`}><IconComponent size={28} className={config.iconColor} /></div>
          <h3 className="text-lg font-semibold text-warm-900 mb-2">{title}</h3>
          <p className="text-warm-500 text-sm mb-6 max-w-xs">{message}</p>
          <div className="flex gap-3 w-full">
            <button onClick={onClose} className="flex-1 px-4 py-2.5 text-sm font-medium text-warm-700 bg-warm-100 hover:bg-warm-200 rounded-2xl transition-colors">{cancelText}</button>
            <button onClick={() => { onConfirm(); onClose() }} className={`flex-1 px-4 py-2.5 text-sm font-medium text-white ${config.confirmBg} rounded-2xl transition-colors`}>{confirmText}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
