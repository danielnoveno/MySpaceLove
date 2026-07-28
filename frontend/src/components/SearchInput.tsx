'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X } from 'lucide-react';

interface SearchInputProps { value: string; onChange: (value: string) => void; placeholder?: string; debounceMs?: number }

export default function SearchInput({ value, onChange, placeholder = 'Search...', debounceMs = 300 }: SearchInputProps) {
  const [localValue, setLocalValue] = useState(value);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const timeout = setTimeout(() => setLocalValue(value), 0);
    return () => clearTimeout(timeout);
  }, [value]);

  const debouncedOnChange = useCallback((newValue: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => { onChange(newValue) }, debounceMs);
  }, [onChange, debounceMs]);

  useEffect(() => { return () => { if (timerRef.current) clearTimeout(timerRef.current) } }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => { const newValue = e.target.value; setLocalValue(newValue); debouncedOnChange(newValue) };
  const handleClear = () => { setLocalValue(''); onChange(''); if (timerRef.current) clearTimeout(timerRef.current) };

  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Search size={18} className="text-warm-400" /></div>
      <input type="text" value={localValue} onChange={handleChange} placeholder={placeholder}
        className="w-full pl-10 pr-10 py-2.5 text-sm border border-warm-100 rounded-2xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-400/20 focus:border-brand-400 transition-all placeholder:text-warm-400" />
      {localValue && (
        <button onClick={handleClear} className="absolute inset-y-0 right-0 pr-3 flex items-center text-warm-400 hover:text-warm-600 transition-colors" aria-label="Clear search"><X size={16} /></button>
      )}
    </div>
  );
}
