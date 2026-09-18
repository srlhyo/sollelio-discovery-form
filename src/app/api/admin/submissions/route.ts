import { NextResponse } from 'next/server';
import { getAllSubmissions } from '@/lib/db';
import { verifyAdminAuth } from '@/lib/adminAuth';

export async function GET(request: Request) {
  if (!verifyAdminAuth(request)) {
    return NextResponse.json({ success: false, error: 'Acesso não autorizado.' }, { status: 401 });
  }

  try {
    const rawSubmissions = await getAllSubmissions();
    const safeSubmissions = rawSubmissions.map((sub, index) => {
      let parsedAnswers: Record<string, unknown> = {};
      try {
        parsedAnswers = JSON.parse(sub.answers_json || '{}');
      } catch {
        parsedAnswers = {};
      }

      const isAnon = sub.identity_mode === 'anonymous';
      const displayName = isAnon 
        ? `Colaborador Anónimo #${rawSubmissions.length - index}`
        : (sub.respondent_name || 'Colaborador Identificado');

      return {
        id: sub.id,
        identityMode: sub.identity_mode,
        displayName,
        respondentName: isAnon ? null : sub.respondent_name,
        respondentContact: isAnon ? null : sub.respondent_contact,
        status: sub.status,
        currentBlock: sub.current_block,
        answersCount: Object.keys(parsedAnswers).length,
        createdAt: sub.created_at,
        updatedAt: sub.updated_at,
        submittedAt: sub.submitted_at
      };
    });

    return NextResponse.json({
      success: true,
      submissions: safeSubmissions
    });
  } catch (error) {
    console.error('Failed to get submissions:', error);
    return NextResponse.json({ success: false, error: 'Erro ao listar submissões.' }, { status: 500 });
  }
}
