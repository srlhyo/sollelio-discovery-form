import { NextResponse } from 'next/server';
import { getAllSubmissions } from '@/lib/db';
import { SURVEY_QUESTIONS } from '@/lib/questions';
import { verifyAdminAuth } from '@/lib/adminAuth';

function escapeCsvCell(val: unknown): string {
  if (val === null || val === undefined) return '""';
  let str = String(val);
  str = str.replace(/"/g, '""');
  return `"${str}"`;
}

export async function GET(request: Request) {
  if (!verifyAdminAuth(request)) {
    return NextResponse.json({ success: false, error: 'Acesso não autorizado.' }, { status: 401 });
  }

  try {
    const submissions = await getAllSubmissions();

    // Headers
    const headers = [
      'ID_Submissao',
      'Modo_Identidade',
      'Nome_Colaborador',
      'Contacto',
      'Estado',
      'Criado_Em',
      'Submetido_Em',
      ...SURVEY_QUESTIONS.map(q => `Q${q.id}_${q.blockId}${q.numberInBlock}`)
    ];

    const rows: string[] = [headers.map(escapeCsvCell).join(',')];

    submissions.forEach((sub, index) => {
      let answers: Record<string, unknown> = {};
      try {
        answers = JSON.parse(sub.answers_json || '{}');
      } catch {
        answers = {};
      }

      const isAnon = sub.identity_mode === 'anonymous';
      const respondentName = isAnon ? `Colaborador Anónimo #${submissions.length - index}` : (sub.respondent_name || '');
      const respondentContact = isAnon ? '' : (sub.respondent_contact || '');

      const row = [
        sub.id,
        sub.identity_mode,
        respondentName,
        respondentContact,
        sub.status,
        sub.created_at,
        sub.submitted_at || '',
        ...SURVEY_QUESTIONS.map(q => {
          const ans = answers[q.id];
          if (!ans) return '';
          if (typeof ans === 'string') return ans;
          if (typeof ans === 'object' && ans !== null) {
            const anyAns = ans as { selectedOptions?: string[]; text?: string };
            const opts = (anyAns.selectedOptions || []).join('; ');
            const txt = anyAns.text || '';
            if (opts && txt) return `[Opções: ${opts}] ${txt}`;
            return opts || txt;
          }
          return String(ans);
        })
      ];

      rows.push(row.map(escapeCsvCell).join(','));
    });

    const csvContent = '\uFEFF' + rows.join('\r\n');

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="sollelio_product_discovery_ronda3_${new Date().toISOString().slice(0, 10)}.csv"`
      }
    });
  } catch (error) {
    console.error('Failed to export CSV:', error);
    return NextResponse.json({ success: false, error: 'Erro ao gerar CSV.' }, { status: 500 });
  }
}
