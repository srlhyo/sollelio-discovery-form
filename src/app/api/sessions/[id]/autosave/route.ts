import { NextResponse } from 'next/server';
import { autosaveSession } from '@/lib/db';

export async function PUT(
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

    const currentBlock = typeof body.currentBlock === 'number' ? body.currentBlock : 0;
    const answers = body.answers || {};

    const saved = await autosaveSession(id, token, currentBlock, answers);

    if (!saved) {
      return NextResponse.json(
        { success: false, error: 'Sessão inválida, expirada ou já submetida.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      savedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to autosave session:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao guardar dados.' },
      { status: 500 }
    );
  }
}
