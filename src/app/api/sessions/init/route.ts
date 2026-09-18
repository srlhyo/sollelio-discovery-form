import { NextResponse } from 'next/server';
import { createSession } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const identityMode = body.identityMode === 'identified' ? 'identified' : 'anonymous';

    const session = await createSession({
      identityMode,
      name: body.name,
      contact: body.contact
    });

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      sessionToken: session.sessionToken,
      identityMode: session.identityMode
    });
  } catch (error) {
    console.error('Failed to initialize session:', error);
    return NextResponse.json(
      { success: false, error: 'Não foi possível iniciar a sessão.' },
      { status: 500 }
    );
  }
}
