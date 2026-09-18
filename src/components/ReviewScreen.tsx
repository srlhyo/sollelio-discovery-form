'use client';

import React from 'react';
import { ShieldCheck, User, ArrowLeft, Send, CheckCircle2, Edit3, AlertCircle } from 'lucide-react';
import { SURVEY_BLOCKS, SURVEY_QUESTIONS } from '@/lib/questions';

interface ReviewScreenProps {
  answers: Record<number, { selectedOptions?: string[]; text?: string }>;
  identityMode: 'anonymous' | 'identified';
  respondentName?: string | null;
  onEditBlock: (blockIndex: number) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export function ReviewScreen({
  answers,
  identityMode,
  respondentName,
  onEditBlock,
  onSubmit,
  isSubmitting
}: ReviewScreenProps) {
  // Count how many questions have answers
  const totalQuestions = SURVEY_QUESTIONS.length;
  const answeredCount = Object.keys(answers).filter(k => {
    const val = answers[Number(k)];
    if (!val) return false;
    return Boolean(val.text?.trim() || (val.selectedOptions && val.selectedOptions.length > 0));
  }).length;

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-16">
      {/* Review Header Banner */}
      <div className="bg-[var(--bg-surface)] rounded-3xl p-6 sm:p-8 border border-[var(--border-subtle)] shadow-[var(--shadow-card)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10.5px] font-bold uppercase tracking-[0.16em] text-[var(--gold-text)]">
              Quase a concluir
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-normal text-[var(--text-main)] mt-1 tracking-tight">
              Revê as tuas reflexões com calma
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1.5 leading-relaxed">
              Podes conferir o que partilhaste ou tocar em &ldquo;Editar&rdquo; para ajustar qualquer detalhe.
            </p>
          </div>

          <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 border-t sm:border-t-0 pt-3 sm:pt-0 border-[var(--border-subtle)]">
            <span className="text-xs text-[var(--text-muted)]">Respondidas:</span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[var(--bg-selo)] text-[var(--gold-text)] border border-[var(--gold-soft)]">
              <CheckCircle2 className="w-3.5 h-3.5 text-[var(--gold)]" />
              {answeredCount} de {totalQuestions} perguntas
            </span>
          </div>
        </div>

        {/* Identity confirmation badge */}
        <div className="mt-5 p-4 rounded-2xl bg-[var(--bg-warm)] border border-[var(--border-subtle)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            {identityMode === 'anonymous' ? (
              <div className="w-9 h-9 rounded-xl bg-emerald-100/70 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-200 dark:border-emerald-800">
                <ShieldCheck className="w-5 h-5" />
              </div>
            ) : (
              <div className="w-9 h-9 rounded-xl bg-[var(--bg-selo)] text-[var(--gold-text)] flex items-center justify-center shrink-0 border border-[var(--gold-soft)]">
                <User className="w-5 h-5" />
              </div>
            )}
            <div>
              <p className="text-[10px] font-bold text-[var(--gold-text)] uppercase tracking-wider">
                Modo de Envio
              </p>
              <p className="text-sm font-semibold text-[var(--text-main)]">
                {identityMode === 'anonymous'
                  ? '100% Anónimo (sem registo de nome ou identificadores)'
                  : `Identificado: ${respondentName || 'Colaborador'}`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Blocks list */}
      <div className="space-y-4">
        {SURVEY_BLOCKS.map((block, bIdx) => {
          const blockQuestions = SURVEY_QUESTIONS.filter(q => q.blockId === block.id);
          const blockAnsweredCount = blockQuestions.filter(q => {
            const val = answers[q.id];
            return val && (val.text?.trim() || (val.selectedOptions && val.selectedOptions.length > 0));
          }).length;

          return (
            <div
              key={block.id}
              className="bg-[var(--bg-surface)] rounded-3xl p-5 sm:p-6 border border-[var(--border-subtle)] shadow-[var(--shadow-card)]"
            >
              <div className="flex items-center justify-between gap-3 border-b border-[var(--border-subtle)] pb-3 mb-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--gold-text)]">
                    Bloco {block.letter}
                  </span>
                  <h3 className="font-serif text-base sm:text-lg font-normal text-[var(--text-main)]">
                    {block.title}
                  </h3>
                </div>

                <div className="flex items-center gap-2.5">
                  <span className="text-xs text-[var(--text-muted)] font-mono">
                    {blockAnsweredCount}/{blockQuestions.length}
                  </span>
                  <button
                    type="button"
                    onClick={() => onEditBlock(bIdx)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[var(--gold-text)] hover:bg-[var(--bg-selo)] border border-[var(--gold-soft)] transition-all duration-180"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-[var(--gold)]" />
                    Editar
                  </button>
                </div>
              </div>

              {/* Question previews inside this block */}
              <div className="space-y-3">
                {blockQuestions.map((q) => {
                  const val = answers[q.id];
                  const hasAnswer = val && (val.text?.trim() || (val.selectedOptions && val.selectedOptions.length > 0));

                  return (
                    <div
                      key={q.id}
                      className="p-3.5 rounded-2xl bg-[var(--bg-warm)]/70 border border-[var(--border-subtle)] text-xs sm:text-sm"
                    >
                      <p className="font-semibold text-[var(--text-main)]">
                        {q.id}. {q.question}
                      </p>

                      {hasAnswer ? (
                        <div className="mt-2 space-y-1.5">
                          {val.selectedOptions && val.selectedOptions.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {val.selectedOptions.map(opt => (
                                <span
                                  key={opt}
                                  className="px-2.5 py-0.5 rounded-lg bg-[var(--bg-selo)] text-[var(--gold-text)] font-semibold text-[11px] border border-[var(--gold-soft)]"
                                >
                                  {opt}
                                </span>
                              ))}
                            </div>
                          )}
                          {val.text?.trim() && (
                            <p className="text-[var(--text-main)] italic bg-[var(--bg-surface)] p-3 rounded-xl border border-[var(--border-subtle)] text-xs sm:text-sm leading-relaxed">
                              &ldquo;{val.text.trim()}&rdquo;
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="text-[var(--text-faint)] italic mt-1.5 text-xs flex items-center gap-1">
                          <AlertCircle className="w-3 h-3 text-[var(--text-faint)]" />
                          Deixado em branco (opcional)
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Final Action Bar */}
      <div className="bg-[var(--bg-surface)] rounded-3xl p-5 sm:p-6 border border-[var(--border-subtle)] shadow-[var(--shadow-card)] flex flex-col sm:flex-row items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => onEditBlock(SURVEY_BLOCKS.length - 1)}
          className="w-full sm:w-auto px-5 py-3 rounded-2xl border border-[var(--border-subtle)] text-[var(--text-main)] font-semibold text-sm hover:bg-[var(--bg-warm)] transition-all duration-180 flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-4 h-4 text-[var(--gold-text)]" />
          Voltar ao Bloco E
        </button>

        <button
          type="button"
          disabled={isSubmitting}
          onClick={onSubmit}
          className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-[var(--gold)] hover:bg-[var(--gold-hover)] text-[var(--text-on-gold)] font-bold text-sm sm:text-base transition-all duration-200 shadow-md shadow-amber-900/15 active:scale-[0.985] flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isSubmitting ? (
            'A submeter questionário...'
          ) : (
            <>
              <Send className="w-4 h-4" />
              Submeter Respostas Finais
            </>
          )}
        </button>
      </div>
    </div>
  );
}
