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
  Filter,
  Eye,
  ArrowLeft,
  Calendar,
  Layers,
  ChevronRight,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { SURVEY_BLOCKS, SURVEY_QUESTIONS, Question } from '@/lib/questions';

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
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-[#3030A8] text-white flex items-center justify-center mx-auto shadow-md">
              <Lock className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">
              Painel de Gestão & Product Discovery
            </h1>
            <p className="text-xs text-slate-500">
              Área reservada para análise das respostas dos colaboradores.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Chave de Acesso Administrativo
              </label>
              <input
                type="password"
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                placeholder="Insere a chave de acesso..."
                className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3030A8]"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Chave padrão de teste: <code className="text-[#3030A8] font-mono">sollelio-discovery-2026</code>
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-[#3030A8] hover:bg-[#252588] text-white font-bold text-sm transition shadow-md"
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
    <div className="min-h-screen bg-[#F5F6FA] text-slate-900 font-sans">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#3030A8] flex items-center justify-center p-2 shadow-xs">
              <Image
                src="/brand/sollelio-symbol-color.svg"
                alt="Sollelio"
                width={20}
                height={20}
                className="brightness-200"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold tracking-widest uppercase text-slate-400">
                  Sollelio · Do Luxo à Mesa
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-[#3030A8] border border-blue-200">
                  Ronda 3 · Colaboradores
                </span>
              </div>
              <h1 className="text-base font-bold text-slate-900">
                Dashboard de Product Discovery & Insights
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => loadData(adminKey)}
              disabled={isLoading}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-medium flex items-center gap-1.5 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              Atualizar
            </button>

            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-xl bg-[#3030A8] text-white text-xs font-medium hover:bg-[#252588] transition flex items-center gap-1.5"
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
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Total Iniciadas
            </span>
            <p className="text-2xl font-black text-slate-900 mt-1">
              {submissions.length}
            </p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">
              Submetidas
            </span>
            <p className="text-2xl font-black text-emerald-700 mt-1">
              {completedSubmissions.length}
            </p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600">
              Em Progresso / Drafts
            </span>
            <p className="text-2xl font-black text-amber-700 mt-1">
              {draftSubmissions.length}
            </p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">
              100% Anónimas
            </span>
            <p className="text-2xl font-black text-[#3030A8] mt-1">
              {summary?.anonymousCount || 0}
            </p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs col-span-2 sm:col-span-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">
              Identificadas
            </span>
            <p className="text-2xl font-black text-blue-600 mt-1">
              {summary?.identifiedCount || 0}
            </p>
          </div>
        </div>

        {/* View Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => { setActiveTab('matrix'); setSelectedSubmissionId(null); }}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'matrix' && !selectedSubmissionId
                ? 'bg-[#3030A8] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Layers className="w-4 h-4" />
            Síntese Temática por Pergunta
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('submissions'); setSelectedSubmissionId(null); }}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'submissions' && !selectedSubmissionId
                ? 'bg-[#3030A8] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <User className="w-4 h-4" />
            Submissões Concluídas ({completedSubmissions.length})
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('drafts'); setSelectedSubmissionId(null); }}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'drafts' && !selectedSubmissionId
                ? 'bg-[#3030A8] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Rascunhos em Aberto ({draftSubmissions.length})
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('export'); setSelectedSubmissionId(null); }}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'export' && !selectedSubmissionId
                ? 'bg-[#3030A8] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Download className="w-4 h-4" />
            Exportações & Relatório PDF
          </button>
        </div>

        {/* TAB 1: THEMATIC MATRIX */}
        {activeTab === 'matrix' && !selectedSubmissionId && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Questions Selector Column */}
            <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-xs space-y-4 lg:h-[calc(100vh-250px)] lg:overflow-y-auto">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block px-2">
                22 Perguntas de Discovery
              </span>

              <div className="space-y-4">
                {SURVEY_BLOCKS.map(block => {
                  const blockQuestions = SURVEY_QUESTIONS.filter(q => q.blockId === block.id);
                  return (
                    <div key={block.id} className="space-y-1.5">
                      <div className="px-2 py-1 bg-slate-50 rounded-lg text-[11px] font-bold text-[#3030A8] uppercase tracking-wider">
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
                            className={`w-full text-left p-2.5 rounded-xl text-xs transition flex items-start justify-between gap-2 ${
                              isSelected
                                ? 'bg-[#3030A8] text-white font-semibold shadow-xs'
                                : 'text-slate-700 hover:bg-slate-50 border border-transparent'
                            }`}
                          >
                            <span className="line-clamp-2">
                              {q.id}. {q.question}
                            </span>
                            <span className={`px-1.5 py-0.5 rounded-md text-[10px] shrink-0 ${
                              isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
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
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-md bg-[#3030A8]/10 text-[#3030A8] text-xs font-bold">
                    Pergunta {selectedQuestion.id} · Bloco {selectedQuestion.blockId}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    {questionAnswers.length} respostas recolhidas
                  </span>
                </div>
                <h2 className="text-lg font-bold text-slate-900">
                  {selectedQuestion.question}
                </h2>
                {selectedQuestion.subprompt && (
                  <p className="text-xs text-slate-500">
                    {selectedQuestion.subprompt}
                  </p>
                )}
              </div>

              {/* List of answers */}
              {questionAnswers.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-2">
                  <p className="text-sm font-semibold text-slate-600">
                    Ainda não existem respostas submetidas para esta pergunta.
                  </p>
                  <p className="text-xs text-slate-400">
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
                        className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3"
                      >
                        <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                          <div className="flex items-center gap-2">
                            {isAnon ? (
                              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                                <ShieldCheck className="w-3.5 h-3.5" />
                                {ans.respondent}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-xs font-bold text-[#3030A8] bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                                <User className="w-3.5 h-3.5" />
                                {ans.respondent}
                              </span>
                            )}
                          </div>

                          {ans.submittedAt && (
                            <span className="text-[11px] text-slate-400">
                              {new Date(ans.submittedAt).toLocaleDateString('pt-PT')}
                            </span>
                          )}
                        </div>

                        {ans.selectedOptions && ans.selectedOptions.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {ans.selectedOptions.map(opt => (
                              <span
                                key={opt}
                                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200"
                              >
                                {opt}
                              </span>
                            ))}
                          </div>
                        )}

                        {ans.text && (
                          <p className="text-sm text-slate-800 leading-relaxed bg-slate-50/70 p-3.5 rounded-2xl border border-slate-100">
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
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Questionários Submetidos ({completedSubmissions.length})
                </h2>
                <p className="text-xs text-slate-500">
                  Submissões finalizadas e prontas para análise individual.
                </p>
              </div>
            </div>

            {completedSubmissions.length === 0 ? (
              <div className="p-12 text-center text-slate-500 text-sm">
                Nenhum questionário submetido até ao momento.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {completedSubmissions.map((sub) => {
                  const isAnon = sub.identityMode === 'anonymous';
                  return (
                    <div
                      key={sub.id}
                      className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-slate-50/80 transition"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold ${
                          isAnon ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-[#3030A8]'
                        }`}>
                          {isAnon ? <ShieldCheck className="w-5 h-5" /> : <User className="w-5 h-5" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-bold text-slate-900">
                              {sub.displayName}
                            </p>
                            {isAnon ? (
                              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                Anónimo
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold uppercase tracking-wider text-[#3030A8] bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                                Identificado
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5">
                            Submetido em {sub.submittedAt ? new Date(sub.submittedAt).toLocaleString('pt-PT') : 'Recente'} · {sub.answersCount} respostas
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleViewSingleSubmission(sub.id)}
                        className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-white hover:border-[#3030A8] hover:text-[#3030A8] transition flex items-center gap-1.5 shadow-xs"
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
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">
                Sessões em Aberto / Rascunhos ({draftSubmissions.length})
              </h2>
              <p className="text-xs text-slate-500">
                Colaboradores que iniciaram o formulário e ainda estão a responder ou pausaram.
              </p>
            </div>

            {draftSubmissions.length === 0 ? (
              <div className="p-12 text-center text-slate-500 text-sm">
                Não existem rascunhos em aberto no momento.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {draftSubmissions.map((sub) => {
                  const isAnon = sub.identityMode === 'anonymous';
                  return (
                    <div
                      key={sub.id}
                      className="p-4 sm:p-5 flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs">
                          B{sub.currentBlock + 1}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-800">
                            {sub.displayName}
                          </p>
                          <p className="text-xs text-slate-400">
                            Última atualização: {new Date(sub.updatedAt).toLocaleString('pt-PT')} · Bloco {sub.currentBlock + 1} ({sub.answersCount} campos preenchidos)
                          </p>
                        </div>
                      </div>

                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                        Em progresso
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
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#3030A8] text-white flex items-center justify-center shadow-md">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Relatório Executivo em PDF
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
                  Gera o documento formal de Product Discovery com cabeçalhos Sollelio, métricas consolidadas e todas as respostas estruturadas por bloco temático.
                </p>
              </div>

              <a
                href={`/api/admin/export/pdf?key=${encodeURIComponent(adminKey)}`}
                download
                className="w-full py-3.5 px-5 rounded-2xl bg-[#3030A8] hover:bg-[#252588] text-white font-bold text-sm transition flex items-center justify-center gap-2 shadow-md shadow-blue-900/15"
              >
                <Download className="w-4 h-4" />
                Descarregar Relatório PDF (A4)
              </a>
            </div>

            {/* CSV Data Export Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Exportar Base de Dados em CSV
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
                  Exporta todas as submissões com codificação UTF-8 e colunas detalhadas para Excel, Google Sheets, Python ou ferramentas de visualização.
                </p>
              </div>

              <a
                href={`/api/admin/export/csv?key=${encodeURIComponent(adminKey)}`}
                download
                className="w-full py-3.5 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition flex items-center justify-center gap-2 shadow-md shadow-emerald-800/15"
              >
                <Download className="w-4 h-4" />
                Descarregar Ficheiro CSV
              </a>
            </div>
          </div>
        )}

        {/* SINGLE SUBMISSION DETAIL MODAL/VIEW */}
        {selectedSubmissionId && singleSubmissionData && (
          <div className="space-y-6">
            <button
              type="button"
              onClick={() => { setSelectedSubmissionId(null); setSingleSubmissionData(null); }}
              className="inline-flex items-center gap-2 text-xs font-bold text-[#3030A8] hover:underline"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar à lista de submissões
            </button>

            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      singleSubmissionData.identityMode === 'anonymous'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-blue-50 text-[#3030A8] border border-blue-200'
                    }`}>
                      {singleSubmissionData.identityMode === 'anonymous' ? '100% Anónimo' : 'Identificado'}
                    </span>
                    <span className="text-xs text-slate-400">
                      ID: {singleSubmissionData.id.slice(0, 8)}...
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 mt-1.5">
                    {singleSubmissionData.displayName}
                  </h2>
                  {singleSubmissionData.respondentContact && (
                    <p className="text-xs text-slate-500 mt-0.5">
                      Contacto: {singleSubmissionData.respondentContact}
                    </p>
                  )}
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-400 block">Data de Submissão:</span>
                  <span className="text-xs font-semibold text-slate-700">
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
                      <div className="bg-slate-50 px-3.5 py-1.5 rounded-xl text-xs font-bold text-[#3030A8] uppercase tracking-wider">
                        Bloco {block.letter} · {block.title}
                      </div>

                      <div className="space-y-3 pl-2 sm:pl-4">
                        {blockQuestions.map(q => {
                          const ans = singleSubmissionData.answers[q.id];
                          const hasAns = ans && (ans.text?.trim() || (ans.selectedOptions && ans.selectedOptions.length > 0));

                          return (
                            <div key={q.id} className="p-3.5 rounded-2xl bg-white border border-slate-200 text-xs sm:text-sm">
                              <p className="font-semibold text-slate-800">
                                {q.id}. {q.question}
                              </p>

                              {hasAns ? (
                                <div className="mt-2 space-y-1.5">
                                  {ans.selectedOptions && ans.selectedOptions.length > 0 && (
                                    <div className="flex flex-wrap gap-1">
                                      {ans.selectedOptions.map(opt => (
                                        <span
                                          key={opt}
                                          className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 font-medium text-[11px] border border-amber-200"
                                        >
                                          {opt}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                  {ans.text?.trim() && (
                                    <p className="text-slate-900 bg-slate-50 p-3 rounded-xl border border-slate-100 italic leading-relaxed">
                                      &ldquo;{ans.text.trim()}&rdquo;
                                    </p>
                                  )}
                                </div>
                              ) : (
                                <p className="text-slate-400 italic mt-1 text-xs">
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
