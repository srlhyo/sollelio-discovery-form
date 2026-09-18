'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import {
  ShieldCheck,
  User,
  Download,
  FileSpreadsheet,
  FileText,
  Lock,
  Search,
  Eye,
  ArrowLeft,
  Calendar,
  Layers,
  RefreshCw,
  Clock,
  KeyRound
} from 'lucide-react';
import { SURVEY_BLOCKS, SURVEY_QUESTIONS } from '@/lib/questions';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useTheme } from '@/lib/theme';

interface SubmissionSummaryItem {
  id: string;
  identityMode: 'anonymous' | 'identified';
  displayName: string;
  respondentName: string | null;
  respondentContact: string | null;
  status: 'draft' | 'submitted';
  currentBlock: number;
  answersCount: number;
  createdAt: string;
  updatedAt: string;
  submittedAt: string | null;
}

interface QuestionAnswerEntry {
  submissionId: string;
  respondent: string;
  identityMode: 'anonymous' | 'identified';
  selectedOptions?: string[];
  text?: string;
  submittedAt: string | null;
}

interface SummaryData {
  totalSessions: number;
  submittedCount: number;
  draftCount: number;
  anonymousCount: number;
  identifiedCount: number;
  questionAnswersMap: Record<number, QuestionAnswerEntry[]>;
}

export default function AdminDashboardPage() {
  const { theme } = useTheme();
  const [adminKey, setAdminKey] = useState('sollelio-discovery-2026');
  const [keyInput, setKeyInput] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<'matrix' | 'submissions' | 'drafts' | 'export'>('matrix');
  const [submissions, setSubmissions] = useState<SubmissionSummaryItem[]>([]);
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedQuestionId, setSelectedQuestionId] = useState<number>(1);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(null);
  const [singleSubmissionData, setSingleSubmissionData] = useState<{
    id: string;
    identityMode: string;
    displayName: string;
    respondentName: string | null;
    respondentContact: string | null;
    status: string;
    answers: Record<number, { text?: string; selectedOptions?: string[] }>;
    submittedAt: string | null;
  } | null>(null);

  // Check stored admin key
  useEffect(() => {
    const storedKey = sessionStorage.getItem('sollelio_admin_key');
    if (storedKey) {
      setAdminKey(storedKey);
      setIsAuthenticated(true);
    }
  }, []);

  const loadData = useCallback(async (keyToUse: string) => {
    setIsLoading(true);
    try {
      // 1. Load submissions list
      const subRes = await fetch('/api/admin/submissions', {
        headers: { 'x-admin-key': keyToUse }
      });
      if (subRes.ok) {
        const subData = await subRes.json();
        setSubmissions(subData.submissions || []);
      }

      // 2. Load aggregated summary
      const sumRes = await fetch('/api/admin/summary', {
        headers: { 'x-admin-key': keyToUse }
      });
      if (sumRes.ok) {
        const sumData = await sumRes.json();
        setSummary(sumData.summary || null);
      }
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadData(adminKey);
    }
  }, [isAuthenticated, adminKey, loadData]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyInput.trim()) return;
    sessionStorage.setItem('sollelio_admin_key', keyInput.trim());
    setAdminKey(keyInput.trim());
    setIsAuthenticated(true);
  };

  const handleViewSingleSubmission = async (subId: string) => {
    setSelectedSubmissionId(subId);
    try {
      const res = await fetch(`/api/admin/submissions/${subId}`, {
        headers: { 'x-admin-key': adminKey }
      });
      if (res.ok) {
        const data = await res.json();
        setSingleSubmissionData(data.submission);
      }
    } catch (err) {
      console.error('Failed to fetch single submission:', err);
    }
  };

  // If not authenticated, show passcode modal
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[var(--bg-page)] text-[var(--text-main)] flex items-center justify-center p-4 transition-colors">
        <div className="bg-[var(--bg-surface)] rounded-3xl p-8 max-w-md w-full shadow-2xl border border-[var(--border-subtle)] space-y-6">
          <div className="text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-[var(--bg-warm)] border border-[var(--border-subtle)] p-2 mx-auto flex items-center justify-center shadow-xs">
              <Image
                src={theme === 'dark' ? '/brand/partnership-seal-dark.png' : '/brand/partnership-seal-transparent.png'}
                alt="Do Luxo à Mesa × Sollelio"
                width={48}
                height={48}
                className="object-contain"
              />
            </div>
            <div>
              <span className="text-[10px] tracking-[0.16em] uppercase font-bold text-[var(--gold-text)] block">
                Do Luxo à Mesa · Gestão
              </span>
              <h1 className="font-serif text-2xl font-normal text-[var(--text-main)] mt-1 tracking-tight">
                Painel de Product Discovery
              </h1>
            </div>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              Área reservada para consulta das respostas de campo recolhidas junto da equipa.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--gold-text)] mb-1.5">
                Chave de Acesso Administrativo
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value)}
                  placeholder="Insere a chave de acesso..."
                  className="w-full px-4 py-2.5 text-sm bg-[var(--bg-warm)] border border-[var(--border-subtle)] rounded-xl focus:outline-none focus:border-[var(--gold)] text-[var(--text-main)] transition"
                />
                <KeyRound className="w-4 h-4 text-[var(--text-faint)] absolute right-3.5 top-3" />
              </div>
              <p className="text-[11px] text-[var(--text-faint)] mt-1.5 font-mono">
                Chave padrão: <span className="text-[var(--gold-text)]">sollelio-discovery-2026</span>
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-[var(--gold)] hover:bg-[var(--gold-hover)] text-[var(--text-on-gold)] font-bold text-sm transition-all duration-200 shadow-md shadow-amber-900/10 active:scale-[0.985]"
            >
              Entrar no Painel
            </button>
          </form>
        </div>
      </div>
    );
  }

  const selectedQuestion = SURVEY_QUESTIONS.find(q => q.id === selectedQuestionId) || SURVEY_QUESTIONS[0];
  const questionAnswers = summary?.questionAnswersMap?.[selectedQuestionId] || [];

  const completedSubmissions = submissions.filter(s => s.status === 'submitted');
  const draftSubmissions = submissions.filter(s => s.status === 'draft');

  return (
    <div className="min-h-screen bg-[var(--bg-page)] text-[var(--text-main)] font-sans transition-colors duration-200">
      {/* Top Header */}
      <header className="bg-[var(--bg-surface)] border-b border-[var(--border-subtle)] sticky top-0 z-30 shadow-xs backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--bg-warm)] border border-[var(--border-subtle)] p-1.5 flex items-center justify-center shadow-xs">
              <Image
                src={theme === 'dark' ? '/brand/partnership-seal-dark.png' : '/brand/partnership-seal-transparent.png'}
                alt="Do Luxo à Mesa × Sollelio"
                width={36}
                height={36}
                className="object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold tracking-[0.16em] uppercase text-[var(--gold-text)]">
                  Do Luxo à Mesa
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[var(--bg-selo)] text-[var(--gold-text)] border border-[var(--gold-soft)]">
                  Ronda 3 · Colaboradores
                </span>
              </div>
              <h1 className="font-serif text-base sm:text-lg font-normal text-[var(--text-main)] leading-tight">
                Product Discovery & Análise de Campo
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-2.5">
            <ThemeToggle />

            <button
              type="button"
              onClick={() => loadData(adminKey)}
              disabled={isLoading}
              className="px-3 py-1.5 rounded-xl border border-[var(--border-subtle)] text-[var(--text-muted)] hover:bg-[var(--bg-warm)] text-xs font-medium flex items-center gap-1.5 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[var(--gold)]' : ''}`} />
              <span className="hidden sm:inline">Atualizar</span>
            </button>

            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 rounded-xl bg-[var(--gold)] text-[var(--text-on-gold)] text-xs font-semibold hover:bg-[var(--gold-hover)] transition-all duration-180 shadow-xs"
            >
              Ver Formulário
            </a>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* KPI Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="bg-[var(--bg-surface)] p-4 rounded-2xl border border-[var(--border-subtle)] shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--text-faint)]">
              Total Iniciadas
            </span>
            <p className="font-serif text-2xl font-normal text-[var(--text-main)] mt-1">
              {submissions.length}
            </p>
          </div>

          <div className="bg-[var(--bg-surface)] p-4 rounded-2xl border border-[var(--border-subtle)] shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-700 dark:text-emerald-400">
              Submetidas
            </span>
            <p className="font-serif text-2xl font-normal text-emerald-700 dark:text-emerald-400 mt-1">
              {completedSubmissions.length}
            </p>
          </div>

          <div className="bg-[var(--bg-surface)] p-4 rounded-2xl border border-[var(--border-subtle)] shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--gold-text)]">
              Em Aberto / Rascunhos
            </span>
            <p className="font-serif text-2xl font-normal text-[var(--gold-text)] mt-1">
              {draftSubmissions.length}
            </p>
          </div>

          <div className="bg-[var(--bg-surface)] p-4 rounded-2xl border border-[var(--border-subtle)] shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-600 dark:text-emerald-400">
              100% Anónimas
            </span>
            <p className="font-serif text-2xl font-normal text-[var(--text-main)] mt-1">
              {summary?.anonymousCount || 0}
            </p>
          </div>

          <div className="bg-[var(--bg-surface)] p-4 rounded-2xl border border-[var(--border-subtle)] shadow-xs col-span-2 sm:col-span-1">
            <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--gold-text)]">
              Identificadas
            </span>
            <p className="font-serif text-2xl font-normal text-[var(--text-main)] mt-1">
              {summary?.identifiedCount || 0}
            </p>
          </div>
        </div>

        {/* View Tabs */}
        <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] pb-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => { setActiveTab('matrix'); setSelectedSubmissionId(null); }}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-180 whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'matrix' && !selectedSubmissionId
                ? 'bg-[var(--gold)] text-[var(--text-on-gold)] shadow-xs'
                : 'text-[var(--text-muted)] hover:bg-[var(--bg-warm)]'
            }`}
          >
            <Layers className="w-4 h-4" />
            Síntese Temática por Pergunta
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('submissions'); setSelectedSubmissionId(null); }}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-180 whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'submissions' && !selectedSubmissionId
                ? 'bg-[var(--gold)] text-[var(--text-on-gold)] shadow-xs'
                : 'text-[var(--text-muted)] hover:bg-[var(--bg-warm)]'
            }`}
          >
            <User className="w-4 h-4" />
            Submissões Concluídas ({completedSubmissions.length})
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('drafts'); setSelectedSubmissionId(null); }}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-180 whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'drafts' && !selectedSubmissionId
                ? 'bg-[var(--gold)] text-[var(--text-on-gold)] shadow-xs'
                : 'text-[var(--text-muted)] hover:bg-[var(--bg-warm)]'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Rascunhos em Curso ({draftSubmissions.length})
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('export'); setSelectedSubmissionId(null); }}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-180 whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'export' && !selectedSubmissionId
                ? 'bg-[var(--gold)] text-[var(--text-on-gold)] shadow-xs'
                : 'text-[var(--text-muted)] hover:bg-[var(--bg-warm)]'
            }`}
          >
            <Download className="w-4 h-4" />
            Relatório PDF & Dados CSV
          </button>
        </div>

        {/* TAB 1: THEMATIC MATRIX */}
        {activeTab === 'matrix' && !selectedSubmissionId && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Questions Selector Column */}
            <div className="bg-[var(--bg-surface)] rounded-3xl p-4 border border-[var(--border-subtle)] shadow-xs space-y-4 lg:h-[calc(100vh-250px)] lg:overflow-y-auto">
              <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--gold-text)] block px-2">
                22 Perguntas de Discovery
              </span>

              <div className="space-y-4">
                {SURVEY_BLOCKS.map(block => {
                  const blockQuestions = SURVEY_QUESTIONS.filter(q => q.blockId === block.id);
                  return (
                    <div key={block.id} className="space-y-1.5">
                      <div className="px-2 py-1 bg-[var(--bg-warm)] rounded-lg text-[10.5px] font-bold text-[var(--gold-text)] uppercase tracking-wider">
                        Bloco {block.letter} · {block.title}
                      </div>

                      {blockQuestions.map(q => {
                        const isSelected = q.id === selectedQuestionId;
                        const count = summary?.questionAnswersMap?.[q.id]?.length || 0;

                        return (
                          <button
                            key={q.id}
                            type="button"
                            onClick={() => setSelectedQuestionId(q.id)}
                            className={`w-full text-left p-2.5 rounded-xl text-xs transition-all duration-180 flex items-start justify-between gap-2 ${
                              isSelected
                                ? 'bg-[var(--gold)] text-[var(--text-on-gold)] font-semibold shadow-xs'
                                : 'text-[var(--text-main)] hover:bg-[var(--bg-warm)] border border-transparent'
                            }`}
                          >
                            <span className="line-clamp-2">
                              {q.id}. {q.question}
                            </span>
                            <span className={`px-1.5 py-0.5 rounded-md text-[10px] shrink-0 font-mono ${
                              isSelected ? 'bg-black/20 text-white' : 'bg-[var(--bg-warm)] text-[var(--text-muted)] border border-[var(--border-subtle)]'
                            }`}>
                              {count}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Answer Feed Column */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-[var(--bg-surface)] rounded-3xl p-6 border border-[var(--border-subtle)] shadow-xs space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-md bg-[var(--bg-selo)] text-[var(--gold-text)] border border-[var(--gold-soft)] text-xs font-bold">
                    Pergunta {selectedQuestion.id} · Bloco {selectedQuestion.blockId}
                  </span>
                  <span className="text-xs text-[var(--text-faint)] font-mono">
                    {questionAnswers.length} respostas recolhidas
                  </span>
                </div>
                <h2 className="font-serif text-lg sm:text-xl font-normal text-[var(--text-main)]">
                  {selectedQuestion.question}
                </h2>
                {selectedQuestion.subprompt && (
                  <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                    {selectedQuestion.subprompt}
                  </p>
                )}
              </div>

              {/* List of answers */}
              {questionAnswers.length === 0 ? (
                <div className="bg-[var(--bg-surface)] rounded-3xl p-12 text-center border border-[var(--border-subtle)] space-y-2">
                  <p className="text-sm font-semibold text-[var(--text-main)]">
                    Ainda não existem respostas submetidas para esta pergunta.
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">
                    As respostas aparecerão aqui em tempo real assim que os colaboradores concluírem os questionários.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {questionAnswers.map((ans, idx) => {
                    const isAnon = ans.identityMode === 'anonymous';
                    return (
                      <div
                        key={idx}
                        className="bg-[var(--bg-surface)] rounded-3xl p-5 border border-[var(--border-subtle)] shadow-xs space-y-3"
                      >
                        <div className="flex items-center justify-between gap-2 border-b border-[var(--border-subtle)] pb-2.5">
                          <div className="flex items-center gap-2">
                            {isAnon ? (
                              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800/50">
                                <ShieldCheck className="w-3.5 h-3.5" />
                                {ans.respondent}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-xs font-bold text-[var(--gold-text)] bg-[var(--bg-selo)] px-2.5 py-1 rounded-full border border-[var(--gold-soft)]">
                                <User className="w-3.5 h-3.5" />
                                {ans.respondent}
                              </span>
                            )}
                          </div>

                          {ans.submittedAt && (
                            <span className="text-[11px] text-[var(--text-faint)] font-mono">
                              {new Date(ans.submittedAt).toLocaleDateString('pt-PT')}
                            </span>
                          )}
                        </div>

                        {ans.selectedOptions && ans.selectedOptions.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {ans.selectedOptions.map(opt => (
                              <span
                                key={opt}
                                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-[var(--bg-selo)] text-[var(--gold-text)] border border-[var(--gold-soft)]"
                              >
                                {opt}
                              </span>
                            ))}
                          </div>
                        )}

                        {ans.text && (
                          <p className="text-sm text-[var(--text-main)] leading-relaxed bg-[var(--bg-warm)]/70 p-3.5 rounded-2xl border border-[var(--border-subtle)] italic">
                            &ldquo;{ans.text}&rdquo;
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: COMPLETED SUBMISSIONS LIST */}
        {activeTab === 'submissions' && !selectedSubmissionId && (
          <div className="bg-[var(--bg-surface)] rounded-3xl border border-[var(--border-subtle)] shadow-xs overflow-hidden">
            <div className="p-5 border-b border-[var(--border-subtle)] flex items-center justify-between">
              <div>
                <h2 className="font-serif text-base sm:text-lg font-normal text-[var(--text-main)]">
                  Questionários Submetidos ({completedSubmissions.length})
                </h2>
                <p className="text-xs text-[var(--text-muted)]">
                  Submissões finalizadas e prontas para análise individual.
                </p>
              </div>
            </div>

            {completedSubmissions.length === 0 ? (
              <div className="p-12 text-center text-[var(--text-muted)] text-sm">
                Nenhum questionário submetido até ao momento.
              </div>
            ) : (
              <div className="divide-y divide-[var(--border-subtle)]">
                {completedSubmissions.map((sub) => {
                  const isAnon = sub.identityMode === 'anonymous';
                  return (
                    <div
                      key={sub.id}
                      className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-[var(--bg-warm)] transition-colors duration-150"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold ${
                          isAnon
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                            : 'bg-[var(--bg-selo)] text-[var(--gold-text)] border border-[var(--gold-soft)]'
                        }`}>
                          {isAnon ? <ShieldCheck className="w-5 h-5" /> : <User className="w-5 h-5" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-bold text-[var(--text-main)]">
                              {sub.displayName}
                            </p>
                            {isAnon ? (
                              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/50">
                                Anónimo
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--gold-text)] bg-[var(--bg-selo)] px-2 py-0.5 rounded-full border border-[var(--gold-soft)]">
                                Identificado
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-[var(--text-muted)] mt-0.5 font-mono">
                            Submetido em {sub.submittedAt ? new Date(sub.submittedAt).toLocaleString('pt-PT') : 'Recente'} · {sub.answersCount} respostas
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleViewSingleSubmission(sub.id)}
                        className="px-4 py-2 rounded-xl border border-[var(--border-subtle)] text-xs font-semibold text-[var(--text-main)] hover:bg-[var(--bg-surface)] hover:border-[var(--gold)] hover:text-[var(--gold-text)] transition-all duration-180 flex items-center gap-1.5 shadow-xs"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Ver Respostas
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: DRAFTS IN PROGRESS */}
        {activeTab === 'drafts' && !selectedSubmissionId && (
          <div className="bg-[var(--bg-surface)] rounded-3xl border border-[var(--border-subtle)] shadow-xs overflow-hidden">
            <div className="p-5 border-b border-[var(--border-subtle)]">
              <h2 className="font-serif text-base sm:text-lg font-normal text-[var(--text-main)]">
                Sessões em Aberto / Rascunhos ({draftSubmissions.length})
              </h2>
              <p className="text-xs text-[var(--text-muted)]">
                Colaboradores que iniciaram o formulário e ainda estão a responder ou pausaram.
              </p>
            </div>

            {draftSubmissions.length === 0 ? (
              <div className="p-12 text-center text-[var(--text-muted)] text-sm">
                Não existem rascunhos em aberto no momento.
              </div>
            ) : (
              <div className="divide-y divide-[var(--border-subtle)]">
                {draftSubmissions.map((sub) => {
                  return (
                    <div
                      key={sub.id}
                      className="p-4 sm:p-5 flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[var(--bg-selo)] text-[var(--gold-text)] border border-[var(--gold-soft)] flex items-center justify-center font-bold text-xs">
                          B{sub.currentBlock + 1}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[var(--text-main)]">
                            {sub.displayName}
                          </p>
                          <p className="text-xs text-[var(--text-muted)] font-mono">
                            Última atualização: {new Date(sub.updatedAt).toLocaleString('pt-PT')} · Bloco {sub.currentBlock + 1} ({sub.answersCount} campos)
                          </p>
                        </div>
                      </div>

                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[var(--bg-selo)] text-[var(--gold-text)] border border-[var(--gold-soft)]">
                        Em curso
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: EXPORTS & PDF REPORT */}
        {activeTab === 'export' && !selectedSubmissionId && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* PDF Report Card */}
            <div className="bg-[var(--bg-surface)] rounded-3xl p-6 sm:p-8 border border-[var(--border-subtle)] shadow-xs space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[var(--bg-selo)] text-[var(--gold-text)] border border-[var(--gold-soft)] flex items-center justify-center shadow-xs">
                <FileText className="w-6 h-6 text-[var(--gold)]" />
              </div>
              <div>
                <h3 className="font-serif text-lg sm:text-xl font-normal text-[var(--text-main)]">
                  Relatório Executivo em PDF (A4)
                </h3>
                <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1.5 leading-relaxed">
                  Gera o documento formal de Product Discovery com cabeçalhos Do Luxo à Mesa, paleta editorial, métricas consolidadas e respostas estruturadas por bloco.
                </p>
              </div>

              <a
                href={`/api/admin/export/pdf?key=${encodeURIComponent(adminKey)}`}
                download
                className="w-full py-3.5 px-5 rounded-2xl bg-[var(--gold)] hover:bg-[var(--gold-hover)] text-[var(--text-on-gold)] font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-md shadow-amber-900/10 active:scale-[0.985]"
              >
                <Download className="w-4 h-4" />
                Descarregar Relatório PDF
              </a>
            </div>

            {/* CSV Data Export Card */}
            <div className="bg-[var(--bg-surface)] rounded-3xl p-6 sm:p-8 border border-[var(--border-subtle)] shadow-xs space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center shadow-xs">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-serif text-lg sm:text-xl font-normal text-[var(--text-main)]">
                  Exportar Base de Dados em CSV
                </h3>
                <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1.5 leading-relaxed">
                  Exporta todas as submissões com codificação UTF-8 e colunas detalhadas para Excel, Google Sheets, Python ou ferramentas de visualização.
                </p>
              </div>

              <a
                href={`/api/admin/export/csv?key=${encodeURIComponent(adminKey)}`}
                download
                className="w-full py-3.5 px-5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-md shadow-emerald-950/10 active:scale-[0.985]"
              >
                <Download className="w-4 h-4" />
                Descarregar Ficheiro CSV
              </a>
            </div>
          </div>
        )}

        {/* SINGLE SUBMISSION DETAIL VIEW */}
        {selectedSubmissionId && singleSubmissionData && (
          <div className="space-y-6">
            <button
              type="button"
              onClick={() => { setSelectedSubmissionId(null); setSingleSubmissionData(null); }}
              className="inline-flex items-center gap-2 text-xs font-bold text-[var(--gold-text)] hover:underline"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar à lista de submissões
            </button>

            <div className="bg-[var(--bg-surface)] rounded-3xl p-6 sm:p-8 border border-[var(--border-subtle)] shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      singleSubmissionData.identityMode === 'anonymous'
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                        : 'bg-[var(--bg-selo)] text-[var(--gold-text)] border border-[var(--gold-soft)]'
                    }`}>
                      {singleSubmissionData.identityMode === 'anonymous' ? '100% Anónimo' : 'Identificado'}
                    </span>
                    <span className="text-xs text-[var(--text-faint)] font-mono">
                      ID: {singleSubmissionData.id.slice(0, 8)}...
                    </span>
                  </div>
                  <h2 className="font-serif text-xl sm:text-2xl font-normal text-[var(--text-main)] mt-1.5">
                    {singleSubmissionData.displayName}
                  </h2>
                  {singleSubmissionData.respondentContact && (
                    <p className="text-xs text-[var(--text-muted)] mt-0.5 font-mono">
                      Contacto: {singleSubmissionData.respondentContact}
                    </p>
                  )}
                </div>

                <div className="text-right">
                  <span className="text-xs text-[var(--text-faint)] block">Data de Submissão:</span>
                  <span className="text-xs font-semibold text-[var(--text-main)] font-mono">
                    {singleSubmissionData.submittedAt
                      ? new Date(singleSubmissionData.submittedAt).toLocaleString('pt-PT')
                      : 'Em rascunho'}
                  </span>
                </div>
              </div>

              {/* Answers list */}
              <div className="mt-6 space-y-6">
                {SURVEY_BLOCKS.map(block => {
                  const blockQuestions = SURVEY_QUESTIONS.filter(q => q.blockId === block.id);
                  return (
                    <div key={block.id} className="space-y-3">
                      <div className="bg-[var(--bg-warm)] px-3.5 py-1.5 rounded-xl text-xs font-bold text-[var(--gold-text)] uppercase tracking-wider">
                        Bloco {block.letter} · {block.title}
                      </div>

                      <div className="space-y-3 pl-2 sm:pl-4">
                        {blockQuestions.map(q => {
                          const ans = singleSubmissionData.answers[q.id];
                          const hasAns = ans && (ans.text?.trim() || (ans.selectedOptions && ans.selectedOptions.length > 0));

                          return (
                            <div key={q.id} className="p-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-xs sm:text-sm">
                              <p className="font-semibold text-[var(--text-main)]">
                                {q.id}. {q.question}
                              </p>

                              {hasAns ? (
                                <div className="mt-2.5 space-y-1.5">
                                  {ans.selectedOptions && ans.selectedOptions.length > 0 && (
                                    <div className="flex flex-wrap gap-1">
                                      {ans.selectedOptions.map(opt => (
                                        <span
                                          key={opt}
                                          className="px-2.5 py-0.5 rounded-md bg-[var(--bg-selo)] text-[var(--gold-text)] font-semibold text-[11px] border border-[var(--gold-soft)]"
                                        >
                                          {opt}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                  {ans.text?.trim() && (
                                    <p className="text-[var(--text-main)] bg-[var(--bg-warm)]/70 p-3 rounded-xl border border-[var(--border-subtle)] italic leading-relaxed">
                                      &ldquo;{ans.text.trim()}&rdquo;
                                    </p>
                                  )}
                                </div>
                              ) : (
                                <p className="text-[var(--text-faint)] italic mt-1 text-xs">
                                  (Sem resposta)
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
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
