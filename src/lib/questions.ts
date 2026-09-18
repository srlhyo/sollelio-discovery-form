export interface QuestionOption {
  id: string;
  label: string;
}

export interface Question {
  id: number;
  blockId: 'A' | 'B' | 'C' | 'D' | 'E';
  numberInBlock: number;
  question: string;
  subprompt?: string;
  type: 'open_text' | 'choice_with_text' | 'chips_with_text';
  quickOptions?: string[];
  placeholder: string;
  reassuranceNotice?: string;
}

export interface Block {
  id: 'A' | 'B' | 'C' | 'D' | 'E';
  letter: string;
  title: string;
  theme: string;
  description: string;
  questionCount: number;
  estimatedMinutes: string;
}

export const SURVEY_BLOCKS: Block[] = [
  {
    id: 'A',
    letter: 'A',
    title: 'Como Começou',
    theme: 'Primeira oportunidade e entrada no trabalho de eventos',
    description: 'Começamos pela tua memória do primeiro contacto e primeiro dia de trabalho.',
    questionCount: 4,
    estimatedMinutes: '2-3 min'
  },
  {
    id: 'B',
    letter: 'B',
    title: 'Aprender e Ganhar Autonomia',
    theme: 'Como se aprende na prática e o que ajuda uma pessoa a evoluir',
    description: 'Queremos compreender como foste ganhando segurança e quem te apoiou.',
    questionCount: 5,
    estimatedMinutes: '3-4 min'
  },
  {
    id: 'C',
    letter: 'C',
    title: 'O que Torna um Trabalho Bom ou Mau',
    theme: 'Valor, fricções, previsibilidade e razões para aceitar ou recusar',
    description: 'Fala-nos das tuas maiores facilidades e das dores ou cansaços reais.',
    questionCount: 5,
    estimatedMinutes: '3-4 min'
  },
  {
    id: 'D',
    letter: 'D',
    title: 'Disponibilidade e Relação Recorrente',
    theme: 'Como geres a tua disponibilidade e a relação com as empresas',
    description: 'A tua conciliação com a vida pessoal e como preferes comunicar.',
    questionCount: 4,
    estimatedMinutes: '2-3 min'
  },
  {
    id: 'E',
    letter: 'E',
    title: 'Progressão e Futuro',
    theme: 'Interesse em aprender, especializar-se e ambições futuras',
    description: 'O teu olhar sobre o desenvolvimento de competências e futuro.',
    questionCount: 4,
    estimatedMinutes: '2-3 min'
  }
];

export const SURVEY_QUESTIONS: Question[] = [
  // BLOCO A · COMO COMEÇOU
  {
    id: 1,
    blockId: 'A',
    numberInBlock: 1,
    question: 'Como surgiu a primeira oportunidade de trabalhares num evento com a Do Luxo à Mesa? Quem te contactou e porque aceitaste?',
    subprompt: 'Conta-nos um pouco como tudo começou e o que te motivou na altura.',
    type: 'chips_with_text',
    quickOptions: [
      'Recomendação de amigo/colega',
      'Contacto direto da Nádia',
      'Anúncio / Redes sociais',
      'À procura de rendimento extra',
      'Curiosidade por eventos'
    ],
    placeholder: 'Ex: Um amigo que já trabalhava com a equipa falou de mim à Nádia... Aceitei porque precisava de conciliar com os estudos...'
  },
  {
    id: 2,
    blockId: 'A',
    numberInBlock: 2,
    question: 'Antes desse primeiro evento, já tinhas experiência semelhante? Se não, o que te deixou mais inseguro ou com mais dúvidas?',
    subprompt: 'Podes selecionar uma opção rápida antes de detalhares:',
    type: 'choice_with_text',
    quickOptions: [
      'Já tinha experiência na área',
      'Foi a minha primeira experiência'
    ],
    placeholder: 'Conta-nos o que sentias antes de começar e se houve dúvidas...'
  },
  {
    id: 3,
    blockId: 'A',
    numberInBlock: 3,
    question: 'No primeiro evento, o que te explicaram antes de começares? Houve alguma coisa que gostarias de ter sabido antecipadamente?',
    subprompt: 'Pensa no briefing que recebeste, vestuário, horários ou funções.',
    type: 'open_text',
    placeholder: 'Ex: Explicaram-me onde pôr as coisas, mas teria ajudado saber com antecedência a que horas o serviço terminava exatamente...'
  },
  {
    id: 4,
    blockId: 'A',
    numberInBlock: 4,
    question: 'O que te fez aceitar voltar a trabalhar num segundo evento?',
    subprompt: 'O que funcionou bem no primeiro dia que te deu vontade de regressar?',
    type: 'chips_with_text',
    quickOptions: [
      'Bom ambiente de equipa',
      'Pagamento correto / a tempo',
      'Gostei da função',
      'Boa liderança da Nádia',
      'Trabalho organizado'
    ],
    placeholder: 'Partilha o motivo que te fez querer repetir a experiência...'
  },

  // BLOCO B · APRENDER E GANHAR AUTONOMIA
  {
    id: 5,
    blockId: 'B',
    numberInBlock: 1,
    question: 'Conta-me uma tarefa que no início precisavas que te explicassem e que hoje consegues fazer sozinho. O que mudou?',
    subprompt: 'Pode ser algo simples ou complexo (ex: montagem de mesas, protocolo de serviço, gestão de louças).',
    type: 'open_text',
    placeholder: 'Ex: No início não sabia a ordem correta dos talheres e copos... hoje faço a montagem sem precisar de perguntar a ninguém...'
  },
  {
    id: 6,
    blockId: 'B',
    numberInBlock: 2,
    question: 'Quem te ensinou mais no início: a Nádia, outro colaborador, observação do trabalho ou tentativa e erro? Dá um exemplo concreto.',
    subprompt: 'Podes selecionar a fonte principal e explicar a seguir:',
    type: 'choice_with_text',
    quickOptions: [
      'A Nádia',
      'Outro colega mais experiente',
      'Observar os outros a trabalhar',
      'Tentativa e erro'
    ],
    placeholder: 'Dá um exemplo concreto de uma situação em que aprendeste dessa forma...'
  },
  {
    id: 7,
    blockId: 'B',
    numberInBlock: 3,
    question: 'Quando recebes uma função nova, o que precisas para te sentires preparado para a executar bem?',
    subprompt: 'O que te dá segurança quando enfrentas uma responsabilidade diferente?',
    type: 'chips_with_text',
    quickOptions: [
      'Demonstração prática primeiro',
      'Checklist ou instruções claras',
      'Apoio de um colega ao lado',
      'Saber a quem recorrer em caso de dúvida'
    ],
    placeholder: 'Descreve o que mais te ajuda a começar uma nova tarefa com o pé direito...'
  },
  {
    id: 8,
    blockId: 'B',
    numberInBlock: 4,
    question: 'Já cometeste algum erro num evento que te tenha ensinado algo importante? O que aconteceu e o que fizeste diferente depois?',
    subprompt: 'Lembra-te: errar faz parte de qualquer aprendizagem.',
    reassuranceNotice: 'Esta pergunta serve apenas para melhorar o apoio e formação que damos à equipa. Ninguém é julgado por situações passadas.',
    type: 'open_text',
    placeholder: 'Ex: Certa vez esqueci-me de confirmar... aprendi que verificar duas vezes poupa muito stress...'
  },
  {
    id: 9,
    blockId: 'B',
    numberInBlock: 5,
    question: 'Como percebes que a empresa começou a confiar mais em ti ou a dar-te mais responsabilidade?',
    subprompt: 'Que sinais ou atitudes te fizeram sentir reconhecido?',
    type: 'open_text',
    placeholder: 'Ex: Começaram a deixar-me fechar o evento sozinho, a pedir-me para apoiar novatos, ou a chamar-me para serviços mais exigentes...'
  },

  // BLOCO C · O QUE TORNA UM TRABALHO BOM OU MAU
  {
    id: 10,
    blockId: 'C',
    numberInBlock: 1,
    question: 'Quando és convidado para trabalhar num evento, o que pesa mais na decisão de aceitar ou não?',
    subprompt: 'Quais são os teus critérios prioritários?',
    type: 'chips_with_text',
    quickOptions: [
      'Valor hora / remuneração',
      'Horário e duração do evento',
      'Localização / facilidade de transporte',
      'Ambiente e colegas de trabalho',
      'Previsibilidade da folga'
    ],
    placeholder: 'Explica o que costuma fazer a balança pender para um sim ou para um não...'
  },
  {
    id: 11,
    blockId: 'C',
    numberInBlock: 2,
    question: 'O que costuma ser mais difícil ou cansativo neste tipo de trabalho?',
    subprompt: 'Sê honesto(a) sobre as maiores fontes de cansaço físico ou mental.',
    type: 'chips_with_text',
    quickOptions: [
      'Muitas horas seguidas em pé',
      'Falta de pausas regulares',
      'Mudanças de planos à última hora',
      'Pressão com clientes exigentes',
      'Horários que se prolongam além do previsto'
    ],
    placeholder: 'Conta-nos onde sentes mais desgaste nos dias de serviço...'
  },
  {
    id: 12,
    blockId: 'C',
    numberInBlock: 3,
    question: 'Já recusaste ou quase recusaste algum trabalho porque recebeste a informação demasiado tarde, o horário era incompatível ou faltava clareza? Conta um caso.',
    subprompt: 'A transparência ajuda-nos a definir briefings com tempo suficiente.',
    type: 'choice_with_text',
    quickOptions: [
      'Sim, já me aconteceu',
      'Não, nunca passei por isso'
    ],
    placeholder: 'Se já aconteceu, partilha o que falhou na comunicação na altura...'
  },
  {
    id: 13,
    blockId: 'C',
    numberInBlock: 4,
    question: 'Que informação gostarias de saber sempre antes de confirmares que vais trabalhar num evento?',
    subprompt: 'Qual seria o teu briefing ideal antes de dizeres "sim"?',
    type: 'chips_with_text',
    quickOptions: [
      'Horário exato de início e fim',
      'Valor a receber e prazo de pagamento',
      'Local exato e estacionamento / transportes',
      'Função detalhada que vou desempenhar',
      'Roupa / dress code obrigatório',
      'Refeição incluída no turno'
    ],
    placeholder: 'Enumera ou descreve os dados que não deveriam faltar no convite...'
  },
  {
    id: 14,
    blockId: 'C',
    numberInBlock: 5,
    question: 'O que faz uma empresa tornar-se uma empresa para a qual tens vontade de voltar a trabalhar?',
    subprompt: 'O que diferencia uma boa empresa de eventos de uma comum?',
    type: 'open_text',
    placeholder: 'Ex: Respeito pelas pessoas, pagamento pontual, elogiar quando corre bem, boa disposição na equipa...'
  },

  // BLOCO D · DISPONIBILIDADE E RELAÇÃO RECORRENTE
  {
    id: 15,
    blockId: 'D',
    numberInBlock: 1,
    question: 'Como geres hoje a tua disponibilidade para extras? Tens de conciliar com trabalho, estudos, família ou outras atividades?',
    subprompt: 'Ajuda-nos a perceber o teu quotidiano fora dos eventos.',
    type: 'chips_with_text',
    quickOptions: [
      'Concilio com estudos / faculdade',
      'Tenho outro emprego a tempo inteiro',
      'Dedico-me exclusivamente a extras / freelance',
      'Concilio com responsabilidades familiares'
    ],
    placeholder: 'Conta-nos como geres a tua agenda e com quanta antecedência costumas saber os teus dias livres...'
  },
  {
    id: 16,
    blockId: 'D',
    numberInBlock: 2,
    question: 'Se várias empresas te convidassem para trabalhar na mesma data, como escolherias entre elas?',
    subprompt: 'Imagina que tens dois convites em cima da mesa para o mesmo dia.',
    type: 'open_text',
    placeholder: 'Ex: Quem me avisou primeiro? Quem paga melhor? Onde o ambiente é mais leve? Onde conheço melhor as pessoas?...'
  },
  {
    id: 17,
    blockId: 'D',
    numberInBlock: 3,
    question: 'Preferes receber convites de empresas que já conheces ou estarias confortável em trabalhar para uma empresa nova? O que precisarias de saber para aceitar uma empresa desconhecida?',
    subprompt: 'O que te transmite segurança antes de arriscares numa equipa nova?',
    type: 'choice_with_text',
    quickOptions: [
      'Prefiro quase sempre empresas conhecidas',
      'Estou aberto(a) a novas empresas se as condições forem boas'
    ],
    placeholder: 'O que precisarias de saber para aceitar um convite de quem nunca viste...'
  },
  {
    id: 18,
    blockId: 'D',
    numberInBlock: 4,
    question: 'Depois de trabalhares bem com uma empresa, o que te faria preferir continuar a receber oportunidades através de um sistema/plataforma em vez de tratar tudo apenas por WhatsApp? Se nada te faria preferir isso, diz porquê.',
    subprompt: 'Sê 100% sincero(a): adoramos WhatsApp e queremos saber os prós e contras reais.',
    type: 'open_text',
    placeholder: 'Podes dizer que preferes WhatsApp e porquê, ou o que uma ferramenta teria de ter para valer a pena (ex: ver calendário, registo de horas, pagamentos)...'
  },

  // BLOCO E · PROGRESSÃO
  {
    id: 19,
    blockId: 'E',
    numberInBlock: 1,
    question: 'Há funções nos eventos que gostarias de aprender ou assumir no futuro? Quais e porquê?',
    subprompt: 'Ex: coordenação de equipa, bar, protocolo, apoio a noivos, montagem cénica...',
    type: 'open_text',
    placeholder: 'Descreve as tarefas que achas estimulantes e nas quais gostarias de ganhar experiência...'
  },
  {
    id: 20,
    blockId: 'E',
    numberInBlock: 2,
    question: 'Gostarias de saber claramente em que tarefas já és considerado autónomo e em quais ainda precisas de desenvolver experiência? Isso teria valor para ti? Porquê?',
    subprompt: 'Pensa em receber feedback estruturado sobre o teu nível prático.',
    type: 'choice_with_text',
    quickOptions: [
      'Sim, teria muito valor',
      'Seria indiferente',
      'Não teria especial interesse'
    ],
    placeholder: 'Explica o porquê da tua resposta e como isso te ajudaria (ou não)...'
  },
  {
    id: 21,
    blockId: 'E',
    numberInBlock: 3,
    question: 'Ter um histórico comprovado dos eventos em que trabalhaste, funções desempenhadas e experiência adquirida seria útil para ti fora da Do Luxo à Mesa? Em que situação?',
    subprompt: 'Uma espécie de portefólio ou registo oficial de experiência comprovada.',
    type: 'open_text',
    placeholder: 'Ex: Sim, para apresentar a novos clientes, incluir no currículo, ou demonstrar anos de prática em hospitalidade...'
  },
  {
    id: 22,
    blockId: 'E',
    numberInBlock: 4,
    question: 'Vês estes trabalhos apenas como rendimento ocasional ou existe algum cenário em que gostarias de os transformar numa atividade mais frequente, especialização ou carreira?',
    subprompt: 'A tua visão de longo prazo sobre o setor dos eventos.',
    type: 'choice_with_text',
    quickOptions: [
      'Apenas rendimento ocasional / extra',
      'Gostaria de transformar em atividade frequente / carreira',
      'Indeciso(a) / depende das oportunidades'
    ],
    placeholder: 'Partilha a tua perspetiva para o futuro próximo...'
  }
];
