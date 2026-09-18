'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import confetti from 'canvas-confetti';
import { Heart, ShieldCheck } from 'lucide-react';

interface SuccessScreenProps {
  identityMode: 'anonymous' | 'identified';
  respondentName?: string | null;
  onNewSession?: () => void;
}

export function SuccessScreen({
  identityMode,
  respondentName,
  onNewSession
}: SuccessScreenProps) {

  useEffect(() => {
    // Fire gentle gold confetti burst on success
    try {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (!prefersReducedMotion) {
        confetti({
          particleCount: 45,
          spread: 70,
          origin: { y: 0.55 },
          colors: ['#C9A84C', '#E8D5A3', '#D9BA67', '#F1ECE1', '#A07830']
        });
      }
    } catch {
      // Ignore if canvas not supported
    }
  }, []);

  return (
    <div className="max-w-xl mx-auto py-12 px-4 text-center space-y-6 animate-in fade-in zoom-in-95 duration-300">
      {/* Brand logo */}
      <div className="relative inline-block mx-auto mb-2">
        <Image
          src="/brand/do-luxo-a-mesa-clean.png"
          alt="Do Luxo à Mesa"
          width={80}
          height={100}
          className="h-20 sm:h-24 w-auto object-contain mx-auto select-none drop-shadow-md"
          priority
        />
      </div>

      <div className="space-y-3">
        <span className="text-[10.5px] font-bold uppercase tracking-[0.16em] text-[var(--gold-text)] bg-[var(--bg-selo)] px-3.5 py-1 rounded-full border border-[var(--gold-soft)] inline-block">
          Questionário Concluído com Sucesso
        </span>
        <h1 className="font-serif text-2xl sm:text-3xl font-normal text-[var(--text-main)] tracking-tight">
          Muito obrigada pela tua partilha.
        </h1>
        <p className="text-sm sm:text-base text-[var(--text-muted)] leading-relaxed max-w-md mx-auto">
          {identityMode === 'anonymous' ? (
            <>
              As tuas respostas foram guardadas de forma <strong>100% anónima</strong>. A tua franqueza sobre a realidade dos eventos é o contributo mais valioso para melhorar a operação.
            </>
          ) : (
            <>
              Obrigada, <strong>{respondentName || 'Colaborador'}</strong>! As tuas respostas foram registadas e permitirão à equipa e à Nádia apoiar melhor o teu percurso.
            </>
          )}
        </p>
      </div>

      {/* Confirmation Callout Box */}
      <div className="p-6 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-[var(--shadow-card)] text-left space-y-3 text-xs sm:text-sm text-[var(--text-muted)]">
        <div className="flex items-center gap-2 font-bold text-[var(--text-main)]">
          <Heart className="w-4 h-4 text-[var(--gold)] fill-[var(--gold)]" />
          O que acontece a seguir?
        </div>
        <p className="leading-relaxed">
          As tuas respostas serão analisadas no âmbito do <strong>Product Discovery da Do Luxo à Mesa</strong> com apoio tecnológico da <strong>Sollelio</strong>, para desenhar processos mais humanos, transparentes e previsíveis para quem está no terreno.
        </p>
        <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center gap-2 text-xs text-[var(--text-faint)]">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          Submissão finalizada. Podes fechar esta janela com segurança.
        </div>
      </div>

      {/* Optional restart button */}
      {onNewSession && (
        <div className="pt-4">
          <button
            type="button"
            onClick={onNewSession}
            className="text-xs text-[var(--text-faint)] hover:text-[var(--text-main)] underline transition"
          >
            Submeter outra resposta ou mudar de colaborador
          </button>
        </div>
      )}
    </div>
  );
}
