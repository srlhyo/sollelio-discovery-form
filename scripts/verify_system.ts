// Script de teste e validação de concorrência e integridade da arquitetura
async function runVerification() {
  console.log('=== INICIANDO TESTES DE ARQUITETURA E CONCORRÊNCIA (com @libsql/client) ===\n');

  const { createSession, getSession, autosaveSession, submitSession, getAggregatedSummary } = await import('../src/lib/db');

  // 1. Teste de Garantia de Anonimato
  console.log('1. A testar Garantia Arquitetural de Anonimato...');
  const anonSession = await createSession({
    identityMode: 'anonymous',
    name: 'Nome Que Não Deve Ser Gravado',
    contact: '999999999'
  });

  const anonDbRecord = await getSession(anonSession.id, anonSession.sessionToken);
  if (!anonDbRecord) throw new Error('Falha ao recuperar sessão anónima');
  if (anonDbRecord.respondent_name !== null) throw new Error('VIOLAÇÃO DE PRIVACIDADE: Nome gravado em sessão anónima!');
  if (anonDbRecord.respondent_contact !== null) throw new Error('VIOLAÇÃO DE PRIVACIDADE: Contacto gravado em sessão anónima!');
  if (anonDbRecord.identity_mode !== 'anonymous') throw new Error('identity_mode incorreto');
  console.log('✔ Garantia de anonimato validada: nome e contacto foram rejeitados e registados estritamente como NULL.');

  // 2. Teste de Sessão Identificada
  console.log('\n2. A testar Sessão Identificada...');
  const identifiedSession = await createSession({
    identityMode: 'identified',
    name: 'Catarina Silva',
    contact: '912345678'
  });
  const idRecord = await getSession(identifiedSession.id, identifiedSession.sessionToken);
  if (!idRecord || idRecord.respondent_name !== 'Catarina Silva') throw new Error('Falha na sessão identificada');
  console.log('✔ Sessão identificada gravada corretamente com associação autorizada.');

  // 3. Teste de Concorrência Real: 10 Colaboradores em simultâneo
  console.log('\n3. A testar Concorrência com 10 Colaboradores em Simultâneo...');
  const workers = Array.from({ length: 10 }).map((_, i) => ({
    name: i % 2 === 0 ? `Colaborador Identificado ${i}` : undefined,
    identityMode: i % 2 === 0 ? ('identified' as const) : ('anonymous' as const),
    answers: {
      1: { text: `Resposta única do Colaborador ${i} à pergunta 1`, selectedOptions: ['Recomendação de amigo/colega'] },
      2: { text: `Experiência do Colaborador ${i}`, selectedOptions: ['Já tinha experiência na área'] },
      18: { text: `Opinião sobre WhatsApp vs Plataforma do Colaborador ${i}`, selectedOptions: [] },
      22: { text: `Visão de carreira do Colaborador ${i}`, selectedOptions: ['Gostaria de transformar em atividade frequente / carreira'] }
    }
  }));

  // Simular inicializações paralelas
  const sessions = await Promise.all(workers.map(w => createSession({
    identityMode: w.identityMode,
    name: w.name
  })));

  // Simular autosaves paralelos cruzados
  await Promise.all(sessions.map((s, i) => {
    return autosaveSession(s.id, s.sessionToken, 2, workers[i].answers);
  }));

  // Simular submissões finais paralelas
  await Promise.all(sessions.map((s, i) => {
    return submitSession(s.id, s.sessionToken);
  }));

  // Verificar isolamento e ausência de contaminação cruzada
  for (let i = 0; i < 10; i++) {
    const record = await getSession(sessions[i].id);
    if (!record) throw new Error(`Sessão ${i} perdida!`);
    if (record.status !== 'submitted') throw new Error(`Sessão ${i} não ficou submetida!`);
    
    const parsed = JSON.parse(record.answers_json);
    if (parsed[1].text !== `Resposta única do Colaborador ${i} à pergunta 1`) {
      throw new Error(`CONTAMINAÇÃO DE DADOS: A sessão ${i} tem respostas de outro colaborador!`);
    }
  }
  console.log('✔ Concorrência validada: 10 colaboradores submeteram respostas simultaneamente sem qualquer contaminação, sobrescrita ou perda.');

  // 4. Teste de Idempotência e Prevenção de Double-Submit
  console.log('\n4. A testar Idempotência e Prevenção de Alteração Pós-Submissão...');
  const firstSession = sessions[0];
  const postSubmitAutosave = await autosaveSession(firstSession.id, firstSession.sessionToken, 3, { 1: { text: 'Tentativa de alteração pós-submissão' } });
  if (postSubmitAutosave) throw new Error('Falha de idempotência: permitiu alterar questionário já submetido!');
  console.log('✔ Idempotência validada: registos submetidos estão selados e imutáveis contra cliques repetidos.');

  // 5. Teste de Agregação e Matriz Temática
  console.log('\n5. A testar Agregação Temática para Product Discovery...');
  const summary = await getAggregatedSummary();
  if (summary.submittedCount < 10) throw new Error('Contagem de submissões divergente');
  const q18Answers = summary.questionAnswersMap[18];
  if (!q18Answers || q18Answers.length < 10) throw new Error('Agregação por pergunta falhou para Q18');
  console.log(`✔ Resumo compilado com sucesso: ${summary.submittedCount} submissões finalizadas, ${q18Answers.length} opiniões consolidadas na Pergunta 18.`);

  console.log('\n=============================================');
  console.log('TODOS OS TESTES DE ARQUITETURA PASSARAM COM SUCESSO!');
  console.log('=============================================\n');
}

runVerification().catch(err => {
  console.error('ERRO NA VERIFICAÇÃO:', err);
  process.exit(1);
});
