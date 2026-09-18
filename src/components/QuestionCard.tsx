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
    <div className="bg-[var(--bg-surface)] rounded-3xl p-5 sm:p-7 border border-[var(--border-subtle)] shadow-[var(--shadow-card)] transition-all duration-200 hover:border-[var(--gold-soft)]">
      {/* Question Header */}
      <div className="flex items-start gap-3">
        <span className="flex-shrink-0 w-7 h-7 rounded-xl bg-[var(--bg-warm)] text-[var(--gold-text)] font-serif text-xs font-bold flex items-center justify-center border border-[var(--border-subtle)] mt-0.5 shadow-xs">
          {question.id}
        </span>
        <div className="space-y-1 flex-1">
          <h3 className="text-base sm:text-lg font-semibold text-[var(--text-main)] leading-snug tracking-tight">
            {question.question}
          </h3>
          {question.subprompt && (
            <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
              {question.subprompt}
            </p>
          )}
        </div>
      </div>

      {/* Psychological Safety Reassurance Banner */}
      {question.reassuranceNotice && (
        <div className="mt-4 p-3.5 rounded-2xl bg-[var(--warning-bg)] border border-[var(--warning-border)] flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-[var(--warning-text)] shrink-0 mt-0.5" />
          <p className="text-xs text-[var(--warning-text)] leading-relaxed font-medium">
            {question.reassuranceNotice}
          </p>
        </div>
      )}

      {/* Quick Option Selection Chips */}
      {question.quickOptions && question.quickOptions.length > 0 && (
        <div className="mt-4">
          <div className="flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-[0.14em] text-[var(--gold-text)] mb-2">
            <Sparkles className="w-3 h-3 text-[var(--gold)]" />
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
                  className={`text-xs px-3.5 py-2 rounded-xl font-medium border-[1.5px] transition-all duration-200 text-left flex items-center gap-2 ${
                    isSelected
                      ? 'bg-[var(--gold)] text-[var(--text-on-gold)] border-[var(--gold)] shadow-xs font-semibold'
                      : 'bg-[var(--bg-warm)] hover:bg-[var(--bg-selo)] text-[var(--text-main)] border-[var(--border-subtle)] hover:border-[var(--gold-soft)]'
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
          className="w-full text-sm sm:text-base p-4 pb-12 bg-[var(--bg-warm)]/60 hover:bg-[var(--bg-warm)] focus:bg-[var(--bg-surface)] border-[1.5px] border-[var(--border-subtle)] rounded-2xl focus:outline-none focus:border-[var(--gold)] transition-all duration-200 resize-none placeholder:text-[var(--text-faint)] text-[var(--text-main)] leading-relaxed"
        />

        {/* Bottom controls inside textarea: Speech-to-text dictation & word count hint */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          {/* Voice dictation button */}
          <div className="pointer-events-auto">
            {isVoiceSupported && (
              <button
                type="button"
                onClick={toggleListening}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold shadow-xs transition-all duration-200 ${
                  isListening
                    ? 'bg-amber-600 text-white animate-pulse'
                    : 'bg-[var(--bg-surface)] hover:bg-[var(--bg-selo)] text-[var(--text-main)] border border-[var(--border-subtle)] hover:border-[var(--gold-soft)]'
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
                    <Mic className="w-3.5 h-3.5 text-[var(--gold)]" />
                    <span>Ditar resposta</span>
                  </>
                )}
              </button>
            )}
          </div>

          <span className="text-[11px] text-[var(--text-faint)] font-mono">
            {currentValue.text ? `${currentValue.text.trim().split(/\s+/).filter(Boolean).length} palavras` : 'Opcional mas valorizado'}
          </span>
        </div>
      </div>
    </div>
  );
}
