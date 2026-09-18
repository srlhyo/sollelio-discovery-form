'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ShieldCheck, User, Clock, ArrowRight, CheckCircle2, RotateCcw } from 'lucide-react';
import { useTheme } from '@/lib/theme';

interface OnboardingModalProps {
  onStart: (params: {
    identityMode: 'anonymous' | 'identified';
    name?: string;
    contact?: string;
  }) => void;
  savedDraft: {
    sessionId: string;
    identityMode: string;
    currentBlock: number;
    respondentName?: string;
    updatedAt: string;
  } | null;
  onResumeDraft: () => void;
  onDiscardDraft: () => void;
}

export function OnboardingModal({
  onStart,
  savedDraft,
  onResumeDraft,
  onDiscardDraft
}: OnboardingModalProps) {
  const { theme } = useTheme();
  const [identityMode, setIdentityMode] = useState<'identified' | 'anonymous'>('identified');
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBegin = () => {
    if (identityMode === 'identified' && !name.trim()) {
      alert('Por favor, indica o teu primeiro nome ou seleciona a opção "100% Anónimo".');
      return;
    }
    setIsSubmitting(true);
    onStart({
      identityMode,
      name: identityMode === 'identified' ? name.trim() : undefined,
      contact: identityMode === 'identified' ? contact.trim() : undefined
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 dark:bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6">
      <div className="bg-[var(--bg-surface)] text-[var(--text-main)] rounded-3xl shadow-2xl max-w-xl w-full overflow-hidden border border-[var(--border-subtle)] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Branding Banner: Warm, calm, dignified */}
        <div className="bg-[var(--bg-warm)] p-6 sm:p-8 border-b border-[var(--border-subtle)] relative">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-3.5">
              {/* Joint Brand Partnership Seal */}
              <div className="w-14 h-14 sm:w-16 sm:h-16 relative shrink-0 rounded-2xl overflow-hidden p-1 bg-white/60 dark:bg-white/5 border border-[var(--border-subtle)] shadow-xs flex items-center justify-center">
                <Image
                  src={theme === 'dark' ? '/brand/partnership-seal-dark.png' : '/brand/partnership-seal-transparent.png'}
                  alt="Sollelio × Do Luxo à Mesa"
                  width={60}
                  height={60}
                  className="object-contain"
                  priority
                />
              </div>

              <div>
                <span className="text-[10.5px] tracking-[0.16em] uppercase font-bold text-[var(--gold-text)] block">
                  Do Luxo à Mesa · Pesquisa de Operação
                </span>
                <h1 className="font-serif text-xl sm:text-2xl font-normal text-[var(--text-main)] tracking-tight leading-snug mt-0.5">
                  A perspetiva de quem faz os eventos acontecerem
                </h1>
              </div>
            </div>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[var(--bg-selo)] text-[var(--gold-text)] border border-[var(--gold-soft)] shrink-0">
              <Clock className="w-3.5 h-3.5 text-[var(--gold)]" />
              ≈ 12–15 min
            </span>
          </div>

          <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed mt-2">
            A tua experiência prática no terreno é o ponto de partida para melhorarmos a organização, o apoio à equipa e a transparência no trabalho. Desenvolvido em parceria com a <strong>Sollelio</strong>.
          </p>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          {/* Resume Draft Banner if exists */}
          {savedDraft && (
            <div className="p-4 rounded-2xl bg-[var(--bg-selo)] border border-[var(--gold-soft)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[var(--gold-text)] flex items-center gap-1.5">
                  <RotateCcw className="w-4 h-4 text-[var(--gold)]" />
                  Rascunho anterior guardado
                </p>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  Estavas no Bloco {savedDraft.currentBlock + 1} ({savedDraft.identityMode === 'anonymous' ? 'Anónimo' : savedDraft.respondentName || 'Identificado'}).
                </p>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={onDiscardDraft}
                  className="px-3 py-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text-main)] transition"
                >
                  Começar de novo
                </button>
                <button
                  type="button"
                  onClick={onResumeDraft}
                  className="flex-1 sm:flex-none px-4 py-2 text-xs font-semibold text-[var(--text-on-gold)] bg-[var(--gold)] hover:bg-[var(--gold-hover)] rounded-xl shadow-xs transition"
                >
                  Continuar rascunho
                </button>
              </div>
            </div>
          )}

          {/* Privacy & Psychological Safety Choice */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--gold-text)] mb-2.5">
              Escolhe como preferes partilhar a tua opinião:
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Option 1: Identified */}
              <div
                onClick={() => setIdentityMode('identified')}
                className={`cursor-pointer rounded-2xl p-4 border-[1.5px] transition-all duration-200 relative ${
                  identityMode === 'identified'
                    ? 'border-[var(--gold)] bg-[var(--bg-selo)] shadow-xs'
                    : 'border-[var(--border-subtle)] hover:border-[var(--gold-soft)] bg-[var(--bg-surface)]'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="w-8 h-8 rounded-xl bg-[var(--bg-warm)] text-[var(--gold-text)] flex items-center justify-center font-bold border border-[var(--border-subtle)]">
                    <User className="w-4 h-4" />
                  </div>
                  {identityMode === 'identified' && (
                    <CheckCircle2 className="w-5 h-5 text-[var(--gold)]" />
                  )}
                </div>
                <h3 className="text-sm font-bold text-[var(--text-main)] mt-3">Identificado</h3>
                <p className="text-xs text-[var(--text-muted)] mt-1 leading-relaxed">
                  A Nádia saberá quem respondeu. Ideal se quiseres que as tuas reflexões e ambições fiquem associadas ao teu percurso.
                </p>
              </div>

              {/* Option 2: Anonymous */}
              <div
                onClick={() => setIdentityMode('anonymous')}
                className={`cursor-pointer rounded-2xl p-4 border-[1.5px] transition-all duration-200 relative ${
                  identityMode === 'anonymous'
                    ? 'border-emerald-600 dark:border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 shadow-xs'
                    : 'border-[var(--border-subtle)] hover:border-emerald-600/40 bg-[var(--bg-surface)]'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100/70 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold border border-emerald-200/60 dark:border-emerald-800/40">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  {identityMode === 'anonymous' && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  )}
                </div>
                <h3 className="text-sm font-bold text-[var(--text-main)] mt-3">100% Anónimo</h3>
                <p className="text-xs text-[var(--text-muted)] mt-1 leading-relaxed">
                  Total sigilo garantido. A tua identidade nunca é recolhida nem partilhada com ninguém. Responde com total franqueza.
                </p>
              </div>
            </div>
          </div>

          {/* Form fields if identified */}
          {identityMode === 'identified' ? (
            <div className="space-y-3 bg-[var(--bg-warm)] p-4 rounded-2xl border border-[var(--border-subtle)] animate-in fade-in duration-150">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                  O teu nome: <span className="text-[var(--danger-text)]">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="ex: Inês Sousa"
                  className="w-full px-3.5 py-2.5 text-sm bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl focus:outline-none focus:border-[var(--gold)] text-[var(--text-main)] transition"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1">
                  Contacto ou WhatsApp (opcional):
                </label>
                <input
                  type="text"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="ex: 912 345 678"
                  className="w-full px-3.5 py-2.5 text-sm bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl focus:outline-none focus:border-[var(--gold)] text-[var(--text-main)] transition"
                />
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <p className="text-xs text-emerald-900 dark:text-emerald-200 leading-relaxed">
                <strong>Garantia de Anonimato:</strong> Nenhum dado de identificação pessoal, endereço IP ou conta é associado a estas respostas.
              </p>
            </div>
          )}

          {/* Trust points */}
          <div className="pt-1">
            <ul className="text-xs text-[var(--text-muted)] space-y-1.5">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold)]"></span>
                Guardado contínuo: se fechares a página, não perdes o que escreveste.
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold)]"></span>
                Sem respostas certas ou erradas: exemplos reais do teu dia a dia são o mais valioso.
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold)]"></span>
                Podes rever e alterar qualquer resposta antes de enviar.
              </li>
            </ul>
          </div>

          {/* Action Button: Primary Gold CTA */}
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleBegin}
            className="w-full py-3.5 px-6 rounded-2xl bg-[var(--gold)] hover:bg-[var(--gold-hover)] text-[var(--text-on-gold)] font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-md shadow-amber-900/10 active:scale-[0.985] transition-all duration-200 disabled:opacity-50"
          >
            {isSubmitting ? (
              'A preparar questionário...'
            ) : (
              <>
                Começar Questionário
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
