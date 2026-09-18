'use client';

import React from 'react';
import Image from 'next/image';
import { ShieldCheck, User, Check, Loader2, AlertCircle } from 'lucide-react';
import { SURVEY_BLOCKS } from '@/lib/questions';

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
  const currentBlock = SURVEY_BLOCKS[currentBlockIndex] || SURVEY_BLOCKS[0];
  const progressPercent = isReviewScreen
    ? 100
    : Math.round(((currentBlockIndex) / totalBlocks) * 100);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200/80 shadow-xs">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3">
        {/* Top row: Brand + Status */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#3030A8] flex items-center justify-center p-1.5 shadow-xs">
              <Image
                src="/brand/sollelio-symbol-color.svg"
                alt="Sollelio"
                width={20}
                height={20}
                className="brightness-200"
              />
            </div>
            <div>
              <span className="text-[10px] tracking-widest uppercase font-bold text-slate-400 block">
                Do Luxo à Mesa · Sollelio
              </span>
              <span className="text-xs sm:text-sm font-semibold text-slate-800 tracking-tight">
                Product Discovery
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Autosave feedback pill */}
            <div className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200 text-slate-600">
              {saveStatus === 'saving' && (
                <>
                  <Loader2 className="w-3 h-3 text-blue-600 animate-spin" />
                  <span className="hidden sm:inline">A guardar...</span>
                </>
              )}
              {saveStatus === 'saved' && (
                <>
                  <Check className="w-3 h-3 text-emerald-600" />
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
                  <Check className="w-3 h-3 text-slate-400" />
                  <span className="hidden sm:inline">Sincronizado</span>
                </>
              )}
            </div>

            {/* Identity mode pill */}
            {identityMode === 'anonymous' ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">100%</span> Anónimo
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-[#3030A8] border border-blue-200">
                <User className="w-3.5 h-3.5" />
                <span className="truncate max-w-[100px]">
                  {respondentName || 'Identificado'}
                </span>
              </span>
            )}
          </div>
        </div>

        {/* Bottom row: Stepper info + Progress bar */}
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs font-medium mb-1.5">
            <span className="text-slate-600 font-semibold">
              {isReviewScreen ? (
                'Revisão Final antes de Submeter'
              ) : (
                <>
                  <span className="text-[#3030A8]">Bloco {currentBlock.letter}</span> de {totalBlocks} · {currentBlock.title}
                </>
              )}
            </span>
            <span className="text-slate-500 text-[11px]">
              {isReviewScreen ? '100%' : `${progressPercent}% concluído`}
            </span>
          </div>

          {/* Block Step Indicator Pills */}
          <div className="grid grid-cols-5 gap-1.5 mb-1">
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
                      ? 'bg-[#3030A8]'
                      : isPast || isReviewScreen
                      ? 'bg-emerald-500'
                      : 'bg-slate-200'
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
