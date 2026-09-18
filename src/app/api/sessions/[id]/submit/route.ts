import { NextResponse } from 'next/server';
import { submitSession } from '@/lib/db';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const token = request.headers.get('x-session-token') || body.sessionToken;

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token de sessão ausente.' },
        { status: 401 }
      );
    }

    const finalAnswers = body.answers;
    const submitted = submitSession(id, token, finalAnswers);

    if (!submitted) {
      return NextResponse.json(
        { success: false, error: 'Questionário já submetido ou sessão inválida.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      submittedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to submit session:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao submeter questionário.' },
      { status: 500 }
    );
  }
}
