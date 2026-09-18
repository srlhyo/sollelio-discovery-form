import { NextResponse } from 'next/server';
import { jsPDF } from 'jspdf';
import { getAllSubmissions } from '@/lib/db';
import { SURVEY_BLOCKS, SURVEY_QUESTIONS } from '@/lib/questions';
import { verifyAdminAuth } from '@/lib/adminAuth';

export async function GET(request: Request) {
  if (!verifyAdminAuth(request)) {
    return NextResponse.json({ success: false, error: 'Acesso não autorizado.' }, { status: 401 });
  }

  try {
    const submissions = await getAllSubmissions();
    const submittedOnly = submissions.filter(s => s.status === 'submitted');

    // Initialize jsPDF (A4 portrait)
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 18;
    const contentWidth = pageWidth - margin * 2;
    let yPos = margin;

    const checkNewPage = (neededHeight: number) => {
      if (yPos + neededHeight > pageHeight - margin) {
        doc.addPage();
        yPos = margin + 8;
        addPageHeaderFooter();
      }
    };

    const addPageHeaderFooter = () => {
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(155, 155, 155);
      doc.text('DO LUXO À MESA · Product Discovery (Ronda 3: Colaboradores) · Sollelio', margin, 10);
      const pageNum = doc.getNumberOfPages();
      doc.text(`Página ${pageNum}`, pageWidth - margin - 15, 10);
    };

    // Cover / First Page Header: Warm ink and gold
    doc.setFillColor(26, 26, 26); // Warm Ink #1A1A1A
    doc.rect(margin, yPos, contentWidth, 26, 'F');

    // Subtle gold accent hairline
    doc.setFillColor(201, 168, 76); // Gold #C9A84C
    doc.rect(margin, yPos + 25, contentWidth, 1, 'F');

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(245, 236, 215);
    doc.text('DO LUXO À MESA', margin + 6, yPos + 9);

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(217, 186, 103); // Warm Gold
    doc.text('Product Discovery — Ronda 3: Perspetiva dos Colaboradores', margin + 6, yPos + 16);

    doc.setFontSize(8);
    doc.setTextColor(176, 168, 153);
    doc.text('Iniciativa de Investigação de Operações · Parceria Técnica com a Sollelio', margin + 6, yPos + 21.5);

    yPos += 34;

    // Discovery Overview Box
    doc.setDrawColor(240, 230, 208);
    doc.setFillColor(251, 247, 239); // #FBF7EF
    doc.roundedRect(margin, yPos, contentWidth, 28, 2, 2, 'FD');

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(160, 120, 48); // #A07830 Gold-text
    doc.text('RESUMO CONSOLIDADO DA RECOLHA', margin + 5, yPos + 7);

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(40, 40, 40);
    doc.text(`• Total de sessões iniciadas: ${submissions.length}`, margin + 5, yPos + 13);
    doc.text(`• Questionários submetidos: ${submittedOnly.length}`, margin + 5, yPos + 18);
    doc.text(`• Respostas 100% Anónimas: ${submissions.filter(s => s.identity_mode === 'anonymous').length}`, margin + 80, yPos + 13);
    doc.text(`• Respostas Identificadas: ${submissions.filter(s => s.identity_mode === 'identified').length}`, margin + 80, yPos + 18);
    doc.text(`• Data de extração: ${new Date().toLocaleDateString('pt-PT')} às ${new Date().toLocaleTimeString('pt-PT')}`, margin + 5, yPos + 24);

    yPos += 36;

    // Loop through 5 Blocks
    for (const block of SURVEY_BLOCKS) {
      checkNewPage(24);

      // Block header
      doc.setFillColor(254, 249, 236); // #FEF9EC
      doc.setDrawColor(240, 230, 208);
      doc.roundedRect(margin, yPos, contentWidth, 10, 1, 1, 'FD');
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(160, 120, 48); // #A07830
      doc.text(`BLOCO ${block.letter} · ${block.title.toUpperCase()}`, margin + 4, yPos + 6.5);
      yPos += 14;

      doc.setFont('Helvetica', 'italic');
      doc.setFontSize(8.5);
      doc.setTextColor(107, 107, 107);
      const descLines = doc.splitTextToSize(block.theme, contentWidth);
      doc.text(descLines, margin + 2, yPos);
      yPos += descLines.length * 4.5 + 4;

      // Questions in this block
      const questionsInBlock = SURVEY_QUESTIONS.filter(q => q.blockId === block.id);

      for (const q of questionsInBlock) {
        checkNewPage(22);

        // Question Title
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(26, 26, 26);
        const qTitleLines = doc.splitTextToSize(`${q.id}. ${q.question}`, contentWidth);
        doc.text(qTitleLines, margin, yPos);
        yPos += qTitleLines.length * 4.5 + 2;

        // Collect answers for this question across submissions
        let hasAnswers = false;

        submittedOnly.forEach((sub, subIdx) => {
          let answers: Record<string, unknown> = {};
          try {
            answers = JSON.parse(sub.answers_json || '{}');
          } catch {
            answers = {};
          }

          const ans = answers[q.id];
          if (!ans) return;

          let textAnswer = '';
          let optionsAnswer: string[] = [];

          if (typeof ans === 'string') {
            textAnswer = ans.trim();
          } else if (typeof ans === 'object' && ans !== null) {
            const casted = ans as { selectedOptions?: string[]; text?: string };
            optionsAnswer = casted.selectedOptions || [];
            textAnswer = (casted.text || '').trim();
          }

          if (!textAnswer && optionsAnswer.length === 0) return;

          hasAnswers = true;
          const isAnon = sub.identity_mode === 'anonymous';
          const authorLabel = isAnon ? `Colaborador Anónimo #${submittedOnly.length - subIdx}` : (sub.respondent_name || 'Colaborador');

          const responseBlockHeight = (optionsAnswer.length > 0 ? 5 : 0) + (textAnswer ? 10 : 4) + 6;
          checkNewPage(responseBlockHeight);

          // Submitter badge
          doc.setFont('Helvetica', 'bold');
          doc.setFontSize(7.5);
          doc.setTextColor(isAnon ? 22 : 160, isAnon ? 101 : 120, isAnon ? 52 : 48); // Emerald for anon, Gold for identified
          doc.text(`[${authorLabel}]`, margin + 4, yPos);
          yPos += 4;

          if (optionsAnswer.length > 0) {
            doc.setFont('Helvetica', 'normal');
            doc.setFontSize(7.5);
            doc.setTextColor(146, 64, 14); // Warm amber
            doc.text(`Opções selecionadas: ${optionsAnswer.join(', ')}`, margin + 6, yPos);
            yPos += 4;
          }

          if (textAnswer) {
            doc.setFont('Helvetica', 'normal');
            doc.setFontSize(8.5);
            doc.setTextColor(26, 26, 26);
            const ansLines = doc.splitTextToSize(`"${textAnswer}"`, contentWidth - 8);
            doc.text(ansLines, margin + 6, yPos);
            yPos += ansLines.length * 4 + 2;
          }

          yPos += 2;
        });

        if (!hasAnswers) {
          doc.setFont('Helvetica', 'italic');
          doc.setFontSize(8);
          doc.setTextColor(155, 155, 155);
          doc.text('Ainda sem respostas registadas para esta pergunta.', margin + 4, yPos);
          yPos += 6;
        }

        // Thin divider
        doc.setDrawColor(240, 230, 208);
        doc.line(margin, yPos, margin + contentWidth, yPos);
        yPos += 6;
      }

      yPos += 6;
    }

    // Add page header/footer to all pages
    const totalPages = doc.getNumberOfPages();
    for (let p = 1; p <= totalPages; p++) {
      doc.setPage(p);
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(155, 155, 155);
      doc.text('DO LUXO À MESA · Confidencial para Product Discovery · Sollelio', margin, 10);
      doc.text(`Página ${p} de ${totalPages}`, pageWidth - margin - 20, 10);
      doc.text('Documento gerado automaticamente pela plataforma de Product Discovery', margin, pageHeight - 8);
    }

    const pdfBuffer = doc.output('arraybuffer');

    return new NextResponse(Buffer.from(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="do_luxo_a_mesa_discovery_relatorio_${new Date().toISOString().slice(0, 10)}.pdf"`
      }
    });
  } catch (error) {
    console.error('Failed to generate PDF:', error);
    return NextResponse.json({ success: false, error: 'Erro ao gerar relatório PDF.' }, { status: 500 });
  }
}
