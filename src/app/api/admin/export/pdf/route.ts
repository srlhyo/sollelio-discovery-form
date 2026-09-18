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
      doc.setTextColor(140, 140, 140);
      doc.text('SOLLELIO · DO LUXO À MESA — Product Discovery Ronda 3', margin, 10);
      const pageNum = doc.getNumberOfPages();
      doc.text(`Página ${pageNum}`, pageWidth - margin - 15, 10);
    };

    // Cover / First Page Header
    doc.setFillColor(48, 48, 168); // Mineral Indigo
    doc.rect(margin, yPos, contentWidth, 24, 'F');

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.text('SOLLELIO · DO LUXO À MESA', margin + 6, yPos + 9);

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(230, 235, 255);
    doc.text('Product Discovery — Ronda 3: Perspetiva dos Colaboradores', margin + 6, yPos + 17);

    yPos += 32;

    // Discovery Overview Box
    doc.setDrawColor(220, 225, 235);
    doc.setFillColor(247, 248, 252);
    doc.roundedRect(margin, yPos, contentWidth, 28, 2, 2, 'FD');

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(40, 40, 50);
    doc.text('RESUMO DA RECOLHA DE CAMPO', margin + 5, yPos + 7);

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(80, 85, 95);
    doc.text(`• Total de sessões iniciadas: ${submissions.length}`, margin + 5, yPos + 13);
    doc.text(`• Questionários submetidos: ${submittedOnly.length}`, margin + 5, yPos + 18);
    doc.text(`• Respostas Anónimas: ${submissions.filter(s => s.identity_mode === 'anonymous').length}`, margin + 80, yPos + 13);
    doc.text(`• Respostas Identificadas: ${submissions.filter(s => s.identity_mode === 'identified').length}`, margin + 80, yPos + 18);
    doc.text(`• Data de emissão: ${new Date().toLocaleDateString('pt-PT')} às ${new Date().toLocaleTimeString('pt-PT')}`, margin + 5, yPos + 24);

    yPos += 36;

    // Loop through 5 Blocks
    for (const block of SURVEY_BLOCKS) {
      checkNewPage(24);

      // Block header
      doc.setFillColor(235, 238, 248);
      doc.rect(margin, yPos, contentWidth, 10, 'F');
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(48, 48, 168);
      doc.text(`BLOCO ${block.letter} · ${block.title.toUpperCase()}`, margin + 4, yPos + 6.5);
      yPos += 14;

      doc.setFont('Helvetica', 'italic');
      doc.setFontSize(8.5);
      doc.setTextColor(100, 100, 110);
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
        doc.setTextColor(30, 30, 35);
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
          doc.setTextColor(isAnon ? 120 : 35, isAnon ? 120 : 80, isAnon ? 130 : 180);
          doc.text(`[${authorLabel}]`, margin + 4, yPos);
          yPos += 4;

          if (optionsAnswer.length > 0) {
            doc.setFont('Helvetica', 'normal');
            doc.setFontSize(7.5);
            doc.setTextColor(110, 80, 20);
            doc.text(`Opções selecionadas: ${optionsAnswer.join(', ')}`, margin + 6, yPos);
            yPos += 4;
          }

          if (textAnswer) {
            doc.setFont('Helvetica', 'normal');
            doc.setFontSize(8.5);
            doc.setTextColor(45, 45, 50);
            const ansLines = doc.splitTextToSize(`"${textAnswer}"`, contentWidth - 8);
            doc.text(ansLines, margin + 6, yPos);
            yPos += ansLines.length * 4 + 2;
          }

          yPos += 2;
        });

        if (!hasAnswers) {
          doc.setFont('Helvetica', 'italic');
          doc.setFontSize(8);
          doc.setTextColor(160, 160, 160);
          doc.text('Ainda sem respostas registadas para esta pergunta.', margin + 4, yPos);
          yPos += 6;
        }

        // Thin divider
        doc.setDrawColor(240, 240, 245);
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
      doc.setTextColor(150, 150, 150);
      doc.text('SOLLELIO · DO LUXO À MESA — Confidencial para Product Discovery', margin, 10);
      doc.text(`Página ${p} de ${totalPages}`, pageWidth - margin - 20, 10);
      doc.text('Documento gerado automaticamente pelo motor de Discovery', margin, pageHeight - 8);
    }

    const pdfBuffer = doc.output('arraybuffer');

    return new NextResponse(Buffer.from(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="sollelio_product_discovery_relatorio_${new Date().toISOString().slice(0, 10)}.pdf"`
      }
    });
  } catch (error) {
    console.error('Failed to generate PDF:', error);
    return NextResponse.json({ success: false, error: 'Erro ao gerar relatório PDF.' }, { status: 500 });
  }
}
