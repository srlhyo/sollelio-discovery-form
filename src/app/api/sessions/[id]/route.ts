import { NextResponse } from 'next/server';
import { getSession } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const token = request.headers.get('x-session-token') || searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token de sessão ausente.' },
        { status: 401 }
      );
    }

    const session = await getSession(id, token);

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Sessão não encontrada.' },
        { status: 404 }
      );
    }

    let parsedAnswers = {};
    try {
      parsedAnswers = JSON.parse(session.answers_json || '{}');
    } catch {
      parsedAnswers = {};
    }

    return NextResponse.json({
      success: true,
      session: {
        id: session.id,
        identityMode: session.identity_mode,
        respondentName: session.respondent_name,
        status: session.status,
        currentBlock: session.current_block,
        answers: parsedAnswers,
        updatedAt: session.updated_at,
        submittedAt: session.submitted_at
      }
    });
  } catch (error) {
    console.error('Failed to get session:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao carregar sessão.' },
      { status: 500 }
    );
  }
}
