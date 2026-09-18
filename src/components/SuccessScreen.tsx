'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import confetti from 'canvas-confetti';
import { CheckCircle2, Heart, ShieldCheck } from 'lucide-react';

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
    // Fire festive confetti on success
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {
      // Ignore if canvas not supported
    }
  }, []);

  return (
    <div className="max-w-xl mx-auto py-12 px-4 text-center space-y-6 animate-in fade-in zoom-in-95 duration-300">
      {/* Brand icon & Success badge */}
      <div className="relative inline-block mx-auto">
        <div className="w-20 h-20 rounded-3xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shadow-lg mx-auto">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-[#3030A8] text-white flex items-center justify-center shadow-md p-1.5">
          <Image
            src="/brand/sollelio-symbol-color.svg"
            alt="Sollelio"
            width={16}
            height={16}
            className="brightness-200"
          />
        </div>
      </div>

      <div className="space-y-3">
        <span className="text-xs font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 inline-block">
          Questionário Submetido com Sucesso
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Muito obrigado pela tua partilha!
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-md mx-auto">
          {identityMode === 'anonymous' ? (
            <>
              As tuas respostas foram guardadas de forma <strong>100% anónima</strong>. A tua franqueza sobre a realidade dos eventos é o contributo mais valioso que podíamos receber.
            </>
          ) : (
            <>
              Obrigado, <strong>{respondentName || 'Colaborador'}</strong>! As tuas respostas foram registadas e permitirão à equipa e à Nádia apoiar melhor o teu percurso.
            </>
          )}
        </p>
      </div>

      {/* Confirmation Callout Box */}
      <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs text-left space-y-3 text-xs sm:text-sm text-slate-600">
        <div className="flex items-center gap-2 font-bold text-slate-800">
          <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
          O que acontece a seguir?
        </div>
        <p className="leading-relaxed">
          As respostas serão analisadas no âmbito do <strong>Product Discovery da Sollelio</strong> para desenhar processos mais humanos, transparentes e organizados para toda a equipa de eventos.
        </p>
        <div className="pt-2 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          Submissão finalizada. Podes fechar esta janela com segurança.
        </div>
      </div>

      {/* Optional restart button */}
      {onNewSession && (
        <div className="pt-4">
          <button
            type="button"
            onClick={onNewSession}
            className="text-xs text-slate-400 hover:text-slate-700 underline transition"
          >
            Submeter outra resposta ou mudar de colaborador
          </button>
        </div>
      )}
    </div>
  );
}
