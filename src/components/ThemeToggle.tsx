'use client';

import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/lib/theme';

export function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`p-2 rounded-xl transition-all duration-200 border text-slate-500 hover:text-slate-900 dark:text-[#B0A899] dark:hover:text-[#F1ECE1] border-slate-200 dark:border-[#3A3427] bg-white/80 dark:bg-[#1D1A12]/80 hover:bg-slate-50 dark:hover:bg-[#272215] ${className}`}
      title={theme === 'dark' ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
      aria-label="Alternar tema de cor"
    >
      {theme === 'dark' ? (
        <Sun className="w-4 h-4 text-[#D9BA67]" />
      ) : (
        <Moon className="w-4 h-4 text-slate-600" />
      )}
    </button>
  );
}
