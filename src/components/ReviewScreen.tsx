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
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#3030A8]">
              Quase a terminar
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
              Revê as tuas respostas antes de submeter
            </h2>
            <p className="text-sm text-slate-600 mt-1.5">
              Podes ler o teu resumo ou editar qualquer bloco se quiseres acrescentar algo.
            </p>
          </div>

          <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
            <span className="text-xs text-slate-500">Respondidas:</span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              {answeredCount} de {totalQuestions} perguntas
            </span>
          </div>
        </div>

        {/* Identity confirmation badge */}
        <div className="mt-5 p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {identityMode === 'anonymous' ? (
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
            ) : (
              <div className="w-9 h-9 rounded-xl bg-blue-100 text-[#3030A8] flex items-center justify-center shrink-0">
                <User className="w-5 h-5" />
              </div>
            )}
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Modo de Submissão
              </p>
              <p className="text-sm font-bold text-slate-900">
                {identityMode === 'anonymous'
                  ? '100% Anónimo (sem qualquer identificador pessoal)'
                  : `Identificado: ${respondentName || 'Colaborador'}`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Blocks accordion / review list */}
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
              className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs"
            >
              <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3 mb-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Bloco {block.letter}
                  </span>
                  <h3 className="text-base font-bold text-slate-900">
                    {block.title}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-medium">
                    {blockAnsweredCount}/{blockQuestions.length} respondidas
                  </span>
                  <button
                    type="button"
                    onClick={() => onEditBlock(bIdx)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#3030A8] hover:bg-blue-50 border border-blue-200 transition"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
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
                      className="p-3.5 rounded-2xl bg-slate-50/60 border border-slate-100 text-xs sm:text-sm"
                    >
                      <p className="font-semibold text-slate-700">
                        {q.id}. {q.question}
                      </p>

                      {hasAnswer ? (
                        <div className="mt-1.5 space-y-1">
                          {val.selectedOptions && val.selectedOptions.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {val.selectedOptions.map(opt => (
                                <span
                                  key={opt}
                                  className="px-2 py-0.5 rounded-md bg-blue-50 text-[#3030A8] font-medium text-[11px] border border-blue-200"
                                >
                                  {opt}
                                </span>
                              ))}
                            </div>
                          )}
                          {val.text?.trim() && (
                            <p className="text-slate-900 italic bg-white p-2 rounded-xl border border-slate-200/60 mt-1 text-xs sm:text-sm leading-relaxed">
                              &ldquo;{val.text.trim()}&rdquo;
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="text-slate-400 italic mt-1 text-xs flex items-center gap-1">
                          <AlertCircle className="w-3 h-3 text-slate-300" />
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
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => onEditBlock(SURVEY_BLOCKS.length - 1)}
          className="w-full sm:w-auto px-5 py-3 rounded-2xl border border-slate-300 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar ao Bloco E
        </button>

        <button
          type="button"
          disabled={isSubmitting}
          onClick={onSubmit}
          className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm sm:text-base transition shadow-lg shadow-emerald-700/20 active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-50"
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
