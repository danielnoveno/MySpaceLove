'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps { currentPage: number; totalPages: number; onPageChange: (page: number) => void }

function generatePageNumbers(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | '...')[] = [];
  if (current <= 3) pages.push(1, 2, 3, 4, '...', total);
  else if (current >= total - 2) pages.push(1, '...', total - 3, total - 2, total - 1, total);
  else pages.push(1, '...', current - 1, current, current + 1, '...', total);
  return pages;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;
  const pages = generatePageNumbers(currentPage, totalPages);

  return (
    <nav className="flex items-center justify-center gap-1" aria-label="Pagination">
      <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}
        className="p-2 rounded-lg text-warm-500 hover:bg-brand-50 hover:text-brand-600 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-warm-500 transition-colors"
        aria-label="Previous page"><ChevronLeft size={18} /></button>
      {pages.map((page, index) => {
        if (page === '...') return <span key={`ellipsis-${index}`} className="px-2 text-warm-400 text-sm">...</span>;
        return (
          <button key={page} onClick={() => onPageChange(page)}
            className={`min-w-[36px] h-9 rounded-lg text-sm font-medium transition-colors ${currentPage === page ? 'bg-brand-500 text-white shadow-sm' : 'text-warm-600 hover:bg-brand-50 hover:text-brand-600'}`}
            aria-current={currentPage === page ? 'page' : undefined}>{page}</button>
        );
      })}
      <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}
        className="p-2 rounded-lg text-warm-500 hover:bg-brand-50 hover:text-brand-600 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-warm-500 transition-colors"
        aria-label="Next page"><ChevronRight size={18} /></button>
    </nav>
  );
}
