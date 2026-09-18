import { NextResponse } from 'next/server';
import { getAggregatedSummary } from '@/lib/db';
import { verifyAdminAuth } from '@/lib/adminAuth';

export async function GET(request: Request) {
  if (!verifyAdminAuth(request)) {
    return NextResponse.json({ success: false, error: 'Acesso não autorizado.' }, { status: 401 });
  }

  try {
    const summary = await getAggregatedSummary();
    return NextResponse.json({
      success: true,
      summary
    });
  } catch (error) {
    console.error('Failed to get aggregated summary:', error);
    return NextResponse.json({ success: false, error: 'Erro ao compilar resumo.' }, { status: 500 });
  }
}
