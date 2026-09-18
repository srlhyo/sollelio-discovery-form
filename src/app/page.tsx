'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { SURVEY_BLOCKS, SURVEY_QUESTIONS } from '@/lib/questions';
import { OnboardingModal } from '@/components/OnboardingModal';
import { HeaderNav } from '@/components/HeaderNav';
import { QuestionCard, QuestionAnswerValue } from '@/components/QuestionCard';
import { ReviewScreen } from '@/components/ReviewScreen';
import { SuccessScreen } from '@/components/SuccessScreen';
import { ArrowLeft, ArrowRight, CheckCircle, ShieldCheck } from 'lucide-react';

const LOCAL_STORAGE_KEY = 'sollelio_discovery_active_draft_v1';

interface LocalDraft {
  sessionId: string;
  sessionToken: string;
  identityMode: 'anonymous' | 'identified';
  respondentName?: string;
  respondentContact?: string;
  currentBlock: number;
  answers: Record<number, QuestionAnswerValue>;
  updatedAt: string;
}

export default function DiscoveryFormPage() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [identityMode, setIdentityMode] = useState<'anonymous' | 'identified'>('identified');
  const [respondentName, setRespondentName] = useState<string | null>(null);
  const [currentBlockIndex, setCurrentBlockIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, QuestionAnswerValue>>({});
  const [isReviewScreen, setIsReviewScreen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [savedDraft, setSavedDraft] = useState<LocalDraft | null>(null);
  const [isFinalSubmitting, setIsFinalSubmitting] = useState(false);

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Check for existing local draft on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as LocalDraft;
        if (parsed && parsed.sessionId && parsed.sessionToken) {
          setSavedDraft(parsed);
        }
      }
    } catch {
      // Ignore local storage error
    }
  }, []);

  // Autosave function (both localStorage and server)
  const triggerAutosave = useCallback((
    sId: string,
    sToken: string,
    blockIdx: number,
    currentAnswers: Record<number, QuestionAnswerValue>
  ) => {
    setSaveStatus('saving');

    // 1. Save to localStorage immediately
    try {
      const draftData: LocalDraft = {
        sessionId: sId,
        sessionToken: sToken,
        identityMode,
        respondentName: respondentName || undefined,
        currentBlock: blockIdx,
        answers: currentAnswers,
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(draftData));
    } catch (err) {
      console.warn('LocalStorage save error:', err);
    }

    // 2. Debounced save to server
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/sessions/${sId}/autosave`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'x-session-token': sToken
          },
          body: JSON.stringify({
            currentBlock: blockIdx,
            answers: currentAnswers
          })
        });

        if (res.ok) {
          setSaveStatus('saved');
          setTimeout(() => setSaveStatus('idle'), 2500);
        } else {
          setSaveStatus('error');
        }
      } catch (err) {
        console.warn('Server autosave error:', err);
        setSaveStatus('error');
      }
    }, 600);
  }, [identityMode, respondentName]);

  // Start fresh session from Onboarding
  const handleStartSession = async (params: {
    identityMode: 'anonymous' | 'identified';
    name?: string;
    contact?: string;
  }) => {
    try {
      const res = await fetch('/api/sessions/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });

      const data = await res.json();
      if (!data.success) {
        alert('Erro ao iniciar o questionário. Por favor, tenta novamente.');
        return;
      }

      setSessionId(data.sessionId);
      setSessionToken(data.sessionToken);
      setIdentityMode(params.identityMode);
      setRespondentName(params.name || null);
      setCurrentBlockIndex(0);
      setAnswers({});
      setIsReviewScreen(false);
      setShowOnboarding(false);

      // Store in localStorage
      const draftData: LocalDraft = {
        sessionId: data.sessionId,
        sessionToken: data.sessionToken,
        identityMode: params.identityMode,
        respondentName: params.name,
        respondentContact: params.contact,
        currentBlock: 0,
        answers: {},
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(draftData));
    } catch (err) {
      console.error('Failed to init session:', err);
      alert('Falha de rede. Por favor, verifica a tua ligação.');
    }
  };

  // Resume saved draft
  const handleResumeDraft = () => {
    if (!savedDraft) return;
    setSessionId(savedDraft.sessionId);
    setSessionToken(savedDraft.sessionToken);
    setIdentityMode(savedDraft.identityMode);
    setRespondentName(savedDraft.respondentName || null);
    setCurrentBlockIndex(savedDraft.currentBlock || 0);
    setAnswers(savedDraft.answers || {});
    setIsReviewScreen(false);
    setShowOnboarding(false);
  };

  // Discard draft
  const handleDiscardDraft = () => {
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch {
      // ignore
    }
    setSavedDraft(null);
  };

  // Handle answering a specific question
  const handleAnswerChange = (questionId: number, val: QuestionAnswerValue) => {
    const updated = {
      ...answers,
      [questionId]: val
    };
    setAnswers(updated);

    if (sessionId && sessionToken) {
      triggerAutosave(sessionId, sessionToken, currentBlockIndex, updated);
    }
  };

  // Navigation handlers
  const handleNextBlock = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (currentBlockIndex < SURVEY_BLOCKS.length - 1) {
      const nextIdx = currentBlockIndex + 1;
      setCurrentBlockIndex(nextIdx);
      if (sessionId && sessionToken) {
        triggerAutosave(sessionId, sessionToken, nextIdx, answers);
      }
    } else {
      setIsReviewScreen(true);
      if (sessionId && sessionToken) {
        triggerAutosave(sessionId, sessionToken, SURVEY_BLOCKS.length, answers);
      }
    }
  };

  const handlePrevBlock = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (isReviewScreen) {
      setIsReviewScreen(false);
    } else if (currentBlockIndex > 0) {
      const prevIdx = currentBlockIndex - 1;
      setCurrentBlockIndex(prevIdx);
      if (sessionId && sessionToken) {
        triggerAutosave(sessionId, sessionToken, prevIdx, answers);
      }
    }
  };

  const handleNavigateDirect = (targetIndex: number) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setIsReviewScreen(false);
    setCurrentBlockIndex(targetIndex);
    if (sessionId && sessionToken) {
      triggerAutosave(sessionId, sessionToken, targetIndex, answers);
    }
  };

  // Final Submit
  const handleFinalSubmit = async () => {
    if (!sessionId || !sessionToken) {
      alert('Erro de sessão. Por favor, recarrega a página.');
      return;
    }

    setIsFinalSubmitting(true);
    try {
      const res = await fetch(`/api/sessions/${sessionId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-session-token': sessionToken
        },
        body: JSON.stringify({ answers })
      });

      const data = await res.json();
      if (!data.success) {
        alert(data.error || 'Erro ao submeter questionário.');
        setIsFinalSubmitting(false);
        return;
      }

      // Clear local storage draft
      try {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      } catch {
        // ignore
      }

      setIsSubmitted(true);
    } catch (err) {
      console.error('Final submit failed:', err);
      alert('Ocorreu um erro de rede. As tuas respostas continuam guardadas. Tenta submeter novamente.');
      setIsFinalSubmitting(false);
    }
  };

  // If submitted, show success view
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] py-12 px-4 flex items-center justify-center">
        <SuccessScreen
          identityMode={identityMode}
          respondentName={respondentName}
          onNewSession={() => {
            setIsSubmitted(false);
            setShowOnboarding(true);
            setSessionId(null);
            setSessionToken(null);
            setAnswers({});
          }}
        />
      </div>
    );
  }

  const currentBlock = SURVEY_BLOCKS[currentBlockIndex] || SURVEY_BLOCKS[0];
  const currentQuestions = SURVEY_QUESTIONS.filter(q => q.blockId === currentBlock.id);

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-slate-900 flex flex-col font-sans selection:bg-[#3030A8] selection:text-white">
      {/* Onboarding / Identity selection modal */}
      {showOnboarding && (
        <OnboardingModal
          onStart={handleStartSession}
          savedDraft={savedDraft}
          onResumeDraft={handleResumeDraft}
          onDiscardDraft={handleDiscardDraft}
        />
      )}

      {/* Sticky Navigation Bar */}
      <HeaderNav
        currentBlockIndex={currentBlockIndex}
        totalBlocks={SURVEY_BLOCKS.length}
        isReviewScreen={isReviewScreen}
        identityMode={identityMode}
        respondentName={respondentName}
        saveStatus={saveStatus}
        onNavigateBlock={handleNavigateDirect}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {isReviewScreen ? (
          <ReviewScreen
            answers={answers}
            identityMode={identityMode}
            respondentName={respondentName}
            onEditBlock={handleNavigateDirect}
            onSubmit={handleFinalSubmit}
            isSubmitting={isFinalSubmitting}
          />
        ) : (
          <div className="space-y-6">
            {/* Block Intro Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs">
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#3030A8]/10 text-[#3030A8]">
                  Bloco {currentBlock.letter} · {currentBlock.estimatedMinutes}
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  {currentQuestions.length} perguntas neste bloco
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-2 tracking-tight">
                {currentBlock.title}
              </h2>
              <p className="text-xs sm:text-sm font-medium text-[#3030A8] mt-0.5">
                {currentBlock.theme}
              </p>
              <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
                {currentBlock.description}
              </p>
            </div>

            {/* Questions List for this Block */}
            <div className="space-y-5">
              {currentQuestions.map((q) => (
                <QuestionCard
                  key={q.id}
                  question={q}
                  value={answers[q.id] || { text: '', selectedOptions: [] }}
                  onChange={(val) => handleAnswerChange(q.id, val)}
                />
              ))}
            </div>

            {/* Navigation Buttons for this Block */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              {currentBlockIndex > 0 ? (
                <button
                  type="button"
                  onClick={handlePrevBlock}
                  className="w-full sm:w-auto px-5 py-3 rounded-2xl border border-slate-300 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Bloco anterior
                </button>
              ) : (
                <div />
              )}

              <button
                type="button"
                onClick={handleNextBlock}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-[#3030A8] hover:bg-[#252588] text-white font-bold text-sm sm:text-base transition shadow-lg shadow-blue-900/15 active:scale-[0.99] flex items-center justify-center gap-2"
              >
                {currentBlockIndex === SURVEY_BLOCKS.length - 1 ? (
                  <>
                    <span>Rever respostas</span>
                    <CheckCircle className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    <span>Continuar para o Bloco {SURVEY_BLOCKS[currentBlockIndex + 1]?.letter}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            {/* Subtle Psychological Safety Reassurance in Footer */}
            <div className="text-center pt-8 pb-4">
              <p className="text-xs text-slate-400 flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                {identityMode === 'anonymous'
                  ? 'Modo 100% Anónimo ativo · As tuas respostas não contêm identificadores'
                  : `Modo Identificado (${respondentName || 'Colaborador'})`}
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
