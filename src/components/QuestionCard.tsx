'use client';

import React, { useRef, useEffect } from 'react';
import { Mic, MicOff, ShieldAlert, Sparkles, Check } from 'lucide-react';
import { Question } from '@/lib/questions';
import { useSpeechRecognition } from '@/lib/useSpeechRecognition';

export interface QuestionAnswerValue {
  selectedOptions?: string[];
  text?: string;
}

interface QuestionCardProps {
  question: Question;
  value: QuestionAnswerValue | string;
  onChange: (val: QuestionAnswerValue) => void;
}

export function QuestionCard({
  question,
  value,
  onChange
}: QuestionCardProps) {
  // Normalize answer value
  const currentValue: QuestionAnswerValue = typeof value === 'string'
    ? { text: value, selectedOptions: [] }
    : (value || { text: '', selectedOptions: [] });

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Auto-resize textarea as user types
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.max(100, textareaRef.current.scrollHeight)}px`;
    }
  }, [currentValue.text]);

  // Voice dictation hook
  const handleTranscript = (transcript: string) => {
    const existing = currentValue.text ? currentValue.text.trim() + ' ' : '';
    onChange({
      ...currentValue,
      text: existing + transcript
    });
  };

  const { isSupported: isVoiceSupported, isListening, toggleListening } = useSpeechRecognition({
    onTranscript: handleTranscript
  });

  const handleOptionToggle = (opt: string) => {
    if (question.type === 'choice_with_text') {
      const isSelected = currentValue.selectedOptions?.includes(opt);
      onChange({
        ...currentValue,
        selectedOptions: isSelected ? [] : [opt]
      });
    } else {
      const currentOpts = currentValue.selectedOptions || [];
      const newOpts = currentOpts.includes(opt)
        ? currentOpts.filter(o => o !== opt)
        : [...currentOpts, opt];
      onChange({
        ...currentValue,
        selectedOptions: newOpts
      });
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange({
      ...currentValue,
      text: e.target.value
    });
  };

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/90 shadow-xs transition hover:border-slate-300">
      {/* Question Header */}
      <div className="flex items-start gap-3">
        <span className="flex-shrink-0 w-7 h-7 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center border border-slate-200 mt-0.5">
          {question.id}
        </span>
        <div className="space-y-1">
          <h3 className="text-base sm:text-lg font-semibold text-slate-900 leading-snug">
            {question.question}
          </h3>
          {question.subprompt && (
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              {question.subprompt}
            </p>
          )}
        </div>
      </div>

      {/* Psychological Safety Reassurance Banner */}
      {question.reassuranceNotice && (
        <div className="mt-4 p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-900 leading-relaxed font-medium">
            {question.reassuranceNotice}
          </p>
        </div>
      )}

      {/* Quick Option Selection Chips */}
      {question.quickOptions && question.quickOptions.length > 0 && (
        <div className="mt-4">
          <div className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            <Sparkles className="w-3 h-3 text-amber-500" />
            Sugestões de clique rápido (opcional):
          </div>
          <div className="flex flex-wrap gap-2">
            {question.quickOptions.map((opt) => {
              const isSelected = currentValue.selectedOptions?.includes(opt);
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => handleOptionToggle(opt)}
                  className={`text-xs px-3.5 py-2 rounded-xl font-medium border transition-all text-left flex items-center gap-2 ${
                    isSelected
                      ? 'bg-[#3030A8] text-white border-[#3030A8] shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5" />}
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Narrative Response Area */}
      <div className="mt-4 relative">
        <textarea
          ref={textareaRef}
          value={currentValue.text || ''}
          onChange={handleTextChange}
          placeholder={question.placeholder}
          rows={3}
          className="w-full text-sm sm:text-base p-4 pb-12 bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#3030A8]/30 focus:border-[#3030A8] transition resize-none placeholder:text-slate-400 text-slate-800 leading-relaxed"
        />

        {/* Bottom controls inside textarea: Speech-to-text dictation & character hint */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          {/* Voice dictation button */}
          <div className="pointer-events-auto">
            {isVoiceSupported && (
              <button
                type="button"
                onClick={toggleListening}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold shadow-xs transition ${
                  isListening
                    ? 'bg-red-500 text-white animate-pulse'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                }`}
                title={isListening ? 'A ouvir... Clica para parar' : 'Ditar resposta por voz (pt-PT)'}
              >
                {isListening ? (
                  <>
                    <MicOff className="w-3.5 h-3.5" />
                    <span>A ouvir...</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-3.5 h-3.5 text-[#3030A8]" />
                    <span>Ditar resposta</span>
                  </>
                )}
              </button>
            )}
          </div>

          <span className="text-[11px] text-slate-400 font-medium">
            {currentValue.text ? `${currentValue.text.trim().split(/\s+/).filter(Boolean).length} palavras` : 'Opcional mas valorizado'}
          </span>
        </div>
      </div>
    </div>
  );
}
