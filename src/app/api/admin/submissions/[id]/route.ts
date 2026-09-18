import { NextResponse } from 'next/server';
import { getSubmissionById } from '@/lib/db';
import { verifyAdminAuth } from '@/lib/adminAuth';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!verifyAdminAuth(request)) {
    return NextResponse.json({ success: false, error: 'Acesso não autorizado.' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const sub = getSubmissionById(id);

    if (!sub) {
      return NextResponse.json({ success: false, error: 'Submissão não encontrada.' }, { status: 404 });
    }

    let parsedAnswers: Record<string, unknown> = {};
    try {
      parsedAnswers = JSON.parse(sub.answers_json || '{}');
    } catch {
      parsedAnswers = {};
    }

    const isAnon = sub.identity_mode === 'anonymous';

    return NextResponse.json({
      success: true,
      submission: {
        id: sub.id,
        identityMode: sub.identity_mode,
        displayName: isAnon ? 'Colaborador Anónimo' : (sub.respondent_name || 'Colaborador'),
        respondentName: isAnon ? null : sub.respondent_name,
        respondentContact: isAnon ? null : sub.respondent_contact,
        status: sub.status,
        currentBlock: sub.current_block,
        answers: parsedAnswers,
        createdAt: sub.created_at,
        updatedAt: sub.updated_at,
        submittedAt: sub.submitted_at
      }
    });
  } catch (error) {
    console.error('Failed to get submission details:', error);
    return NextResponse.json({ success: false, error: 'Erro ao obter submissão.' }, { status: 500 });
  }
}
