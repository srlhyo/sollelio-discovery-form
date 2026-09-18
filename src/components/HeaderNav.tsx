'use client';

import React from 'react';
import Image from 'next/image';
import { ShieldCheck, User, Check, Loader2, AlertCircle } from 'lucide-react';
import { SURVEY_BLOCKS } from '@/lib/questions';
import { ThemeToggle } from './ThemeToggle';
import { useTheme } from '@/lib/theme';

interface HeaderNavProps {
  currentBlockIndex: number;
  totalBlocks: number;
  isReviewScreen: boolean;
  identityMode: 'anonymous' | 'identified';
  respondentName?: string | null;
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';
  onNavigateBlock?: (index: number) => void;
}

export function HeaderNav({
  currentBlockIndex,
  totalBlocks,
  isReviewScreen,
  identityMode,
  respondentName,
  saveStatus,
  onNavigateBlock
}: HeaderNavProps) {
  const { theme } = useTheme();
  const currentBlock = SURVEY_BLOCKS[currentBlockIndex] || SURVEY_BLOCKS[0];
  const progressPercent = isReviewScreen
    ? 100
    : Math.round(((currentBlockIndex) / totalBlocks) * 100);

  return (
    <header className="sticky top-0 z-40 bg-[var(--bg-surface)]/95 backdrop-blur border-b border-[var(--border-subtle)] shadow-xs transition-colors duration-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-2.5 sm:py-3">
        {/* Top row: Brand + Controls */}
        <div className="flex items-center justify-between gap-2">
          {/* Brand lockup */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 relative shrink-0 rounded-xl overflow-hidden bg-[var(--bg-warm)] border border-[var(--border-subtle)] p-1 flex items-center justify-center shadow-xs">
              <Image
                src={theme === 'dark' ? '/brand/partnership-seal-dark.png' : '/brand/partnership-seal-transparent.png'}
                alt="Do Luxo à Mesa × Sollelio"
                width={36}
                height={36}
                className="object-contain"
                priority
              />
            </div>
            <div>
              <span className="text-[10px] tracking-[0.14em] uppercase font-bold text-[var(--gold-text)] block">
                Do Luxo à Mesa
              </span>
              <div className="flex items-center gap-1.5">
                <span className="font-serif text-xs sm:text-sm font-semibold text-[var(--text-main)] tracking-tight">
                  Product Discovery
                </span>
                <span className="text-[10px] font-sans text-[var(--text-faint)] hidden sm:inline">
                  · com Sollelio
                </span>
              </div>
            </div>
          </div>

          {/* Right Controls: Save status + Identity + Theme Toggle */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Autosave feedback pill */}
            <div className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-[var(--bg-warm)] border border-[var(--border-subtle)] text-[var(--text-muted)]">
              {saveStatus === 'saving' && (
                <>
                  <Loader2 className="w-3 h-3 text-[var(--gold)] animate-spin" />
                  <span className="hidden sm:inline">A guardar...</span>
                </>
              )}
              {saveStatus === 'saved' && (
                <>
                  <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  <span className="hidden sm:inline">Guardado</span>
                </>
              )}
              {saveStatus === 'error' && (
                <>
                  <AlertCircle className="w-3 h-3 text-amber-600" />
                  <span className="hidden sm:inline">Modo offline</span>
                </>
              )}
              {saveStatus === 'idle' && (
                <>
                  <Check className="w-3 h-3 text-[var(--gold-text)]" />
                  <span className="hidden sm:inline">Sincronizado</span>
                </>
              )}
            </div>

            {/* Identity mode pill */}
            {identityMode === 'anonymous' ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">100%</span> Anónimo
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[var(--bg-selo)] text-[var(--gold-text)] border border-[var(--gold-soft)]">
                <User className="w-3.5 h-3.5" />
                <span className="truncate max-w-[90px] sm:max-w-[120px]">
                  {respondentName || 'Identificado'}
                </span>
              </span>
            )}

            {/* Theme Toggle Button */}
            <ThemeToggle />
          </div>
        </div>

        {/* Bottom row: Stepper info + Progress bar */}
        <div className="mt-2.5 pt-1">
          <div className="flex items-center justify-between text-xs font-medium mb-1.5">
            <span className="text-[var(--text-muted)] font-semibold">
              {isReviewScreen ? (
                <span className="text-[var(--gold-text)]">Revisão Final antes de Enviar</span>
              ) : (
                <>
                  <span className="text-[var(--gold-text)]">Bloco {currentBlock.letter}</span> de {totalBlocks} · {currentBlock.title}
                </>
              )}
            </span>
            <span className="text-[var(--text-faint)] text-[11px] font-mono">
              {isReviewScreen ? '100%' : `${progressPercent}%`}
            </span>
          </div>

          {/* Block Step Indicator Pills */}
          <div className="grid grid-cols-5 gap-1.5">
            {SURVEY_BLOCKS.map((b, idx) => {
              const isPast = idx < currentBlockIndex;
              const isCurrent = idx === currentBlockIndex && !isReviewScreen;
              return (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => onNavigateBlock && onNavigateBlock(idx)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    isCurrent
                      ? 'bg-[var(--gold)] shadow-xs'
                      : isPast || isReviewScreen
                      ? 'bg-[var(--gold-soft)]'
                      : 'bg-[var(--border-subtle)]'
                  }`}
                  title={`Bloco ${b.letter}: ${b.title}`}
                />
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
}
