'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ShieldCheck, User, Clock, ArrowRight, CheckCircle2, RotateCcw } from 'lucide-react';

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
  const [identityMode, setIdentityMode] = useState<'identified' | 'anonymous'>('identified');
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBegin = () => {
    if (identityMode === 'identified' && !name.trim()) {
      alert('Por favor, indica o teu nome ou escolhe responder anonimamente.');
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6">
      <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Header Branding Banner */}
        <div className="bg-gradient-to-br from-[#1E2063] via-[#3030A8] to-[#2457F5] p-6 sm:p-8 text-white relative">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center border border-white/20 p-2">
                <Image
                  src="/brand/sollelio-symbol-color.svg"
                  alt="Sollelio"
                  width={28}
                  height={28}
                  className="brightness-200"
                />
              </div>
              <div>
                <p className="text-xs tracking-widest uppercase font-semibold text-blue-200">
                  Do Luxo à Mesa · Sollelio
                </p>
                <h1 className="text-lg sm:text-xl font-bold tracking-tight">
                  Product Discovery · Colaboradores
                </h1>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-white/15 backdrop-blur text-white border border-white/20">
              <Clock className="w-3.5 h-3.5" />
              12–15 min
            </span>
          </div>

          <p className="text-blue-100 text-sm sm:text-base leading-relaxed mt-2">
            A tua experiência prática em eventos é essencial para melhorarmos a organização, o apoio dado no terreno e as oportunidades para a equipa.
          </p>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          {/* Resume Draft Banner if exists */}
          {savedDraft && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                  <RotateCcw className="w-4 h-4 text-amber-700" />
                  Rascunho anterior encontrado
                </p>
                <p className="text-xs text-amber-800 mt-0.5">
                  Estavas no Bloco {savedDraft.currentBlock + 1} ({savedDraft.identityMode === 'anonymous' ? 'Anónimo' : savedDraft.respondentName || 'Identificado'}).
                </p>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={onDiscardDraft}
                  className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-800 transition"
                >
                  Começar do zero
                </button>
                <button
                  type="button"
                  onClick={onResumeDraft}
                  className="flex-1 sm:flex-none px-4 py-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-sm transition"
                >
                  Continuar rascunho
                </button>
              </div>
            </div>
          )}

          {/* Privacy & Psychological Safety Commitment */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Escolhe como queres responder:
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Option 1: Identified */}
              <div
                onClick={() => setIdentityMode('identified')}
                className={`cursor-pointer rounded-2xl p-4 border-2 transition-all relative ${
                  identityMode === 'identified'
                    ? 'border-[#3030A8] bg-blue-50/40 shadow-md ring-1 ring-[#3030A8]/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-[#3030A8] flex items-center justify-center font-bold">
                    <User className="w-4 h-4" />
                  </div>
                  {identityMode === 'identified' && (
                    <CheckCircle2 className="w-5 h-5 text-[#3030A8]" />
                  )}
                </div>
                <h3 className="text-sm font-bold text-slate-900 mt-3">Identificado</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  A Nádia saberá quem respondeu. Ideal se quiseres que as tuas respostas fiquem associadas ao teu percurso na equipa.
                </p>
              </div>

              {/* Option 2: Anonymous */}
              <div
                onClick={() => setIdentityMode('anonymous')}
                className={`cursor-pointer rounded-2xl p-4 border-2 transition-all relative ${
                  identityMode === 'anonymous'
                    ? 'border-emerald-600 bg-emerald-50/40 shadow-md ring-1 ring-emerald-600/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  {identityMode === 'anonymous' && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  )}
                </div>
                <h3 className="text-sm font-bold text-slate-900 mt-3">100% Anónimo</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Total sigilo garantido. A tua identidade nunca é recolhida nem partilhada com ninguém. Responde com total franqueza.
                </p>
              </div>
            </div>
          </div>

          {/* Form fields if identified */}
          {identityMode === 'identified' ? (
            <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/80 animate-in fade-in duration-150">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  O teu nome completo ou primeiro nome: <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Pedro Santos"
                  className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3030A8] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Contacto ou WhatsApp (opcional):
                </label>
                <input
                  type="text"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="Ex: 912 345 678"
                  className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3030A8] focus:border-transparent"
                />
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200 flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              <p className="text-xs text-emerald-900 leading-relaxed">
                <strong>Garantia de Anonimato:</strong> Nenhum dado de identificação pessoal, endereço IP ou conta é associado a estas respostas.
              </p>
            </div>
          )}

          {/* Trust Guarantees Summary */}
          <div className="pt-1">
            <ul className="text-xs text-slate-500 space-y-1.5">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Autosave contínuo: se fechares a página, não perdes o que escreveste.
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Sem perguntas com pegadinhas: factos e relatos reais são o mais importante.
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Podes rever e alterar qualquer resposta antes de submeter.
              </li>
            </ul>
          </div>

          {/* Action Button */}
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleBegin}
            className="w-full py-3.5 px-6 rounded-2xl bg-[#3030A8] hover:bg-[#252588] text-white font-semibold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20 active:scale-[0.99] transition disabled:opacity-50"
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
