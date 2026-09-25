// Shared Portuguese prose, avoiding literal English idioms and national forms
// of address. These fields contain no question IDs or scoring information.
export function polishPortugueseInterface(slug, copy) {
  const summaries = {
    chef: 'Ponha à prova os seus conhecimentos de utensílios, ingredientes, técnicas e decisões na cozinha.',
    dentist: 'Explore os dentes e a saúde da boca com perguntas, situações práticas e novos desafios.',
    mechanic: 'Interprete o painel, relacione os sistemas do veículo e ponha à prova os seus conhecimentos de mecânica.',
    midwifery: 'Relacione a gravidez, o parto, os cuidados com recém-nascidos e a comunicação através de situações práticas.',
    motorbike: 'Explore a condução de motos com perguntas, situações práticas e novos desafios.',
    nursing: 'Relacione os sistemas do corpo, a observação, os cálculos e os cuidados através de situações práticas.',
    paramedic: 'Avalie as situações, identifique mudanças e relacione as informações em desafios de emergência.',
    pilot: 'Explore a aviação com perguntas, situações práticas e novos desafios.',
  };
  if (summaries[slug]) copy.summary = summaries[slug];
  const profileTitles = {
    dentist: ['Excelente resultado', 'Conhecimentos dentários sólidos', 'Bons conhecimentos dentários', 'Uma boa base', 'Primeiros passos no tema'],
    harvard: ['Raciocínio de destaque', 'Talento para a análise', 'Visão estratégica', 'Decisões ponderadas', 'Um começo promissor', 'Curiosidade para aprender'],
    iq: ['Domínio dos padrões', 'Raciocínio preciso', 'Facilidade com padrões', 'Pensamento versátil', 'Curiosidade e análise', 'Novos caminhos a explorar'],
    midwifery: ['Excelente resultado', 'Conhecimentos sólidos', 'Raciocínio sereno', 'Atenção aos detalhes', 'Um começo promissor', 'Primeiros passos no tema'],
    motorbike: ['Conhecimentos de destaque', 'Atenção na condução', 'Uma boa base', 'Conhecimentos em desenvolvimento', 'Primeiros passos no tema'],
    oxford: ['Raciocínio de destaque', 'Talento para a análise', 'Pensamento perspicaz', 'Análise cuidadosa', 'Um começo promissor', 'Curiosidade para aprender'],
    pilot: ['Conhecimentos de destaque', 'Talento para a aviação', 'Raciocínio atento', 'Um começo promissor', 'Primeiros passos no tema'],
    surgeon: ['Excelente resultado', 'Raciocínio cirúrgico apurado', 'Bons conhecimentos de cirurgia', 'Um começo promissor', 'Primeiros passos no tema'],
    train: ['Conhecimentos de destaque', 'Bom raciocínio ferroviário', 'Atenção ao percurso', 'Um começo promissor', 'Primeiros passos no tema'],
  };
  if (profileTitles[slug]) Object.values(copy.results.profiles).forEach((profile, i) => {profile.title = profileTitles[slug][i];});
  if (['harvard', 'oxford', 'cambridge'].includes(slug)) {
    const name = {harvard: 'Harvard', oxford: 'Oxford', cambridge: 'Cambridge'}[slug];
    copy.about.body = `${copy.summary}\n\nUse as informações, regras e quantidades de cada pergunta. Não são necessários conhecimentos universitários especializados e a rapidez não altera a pontuação. Cada pausa mostra o resultado do tema que acabou de concluir. No final, veja a pontuação geral e consulte a revisão das respostas, se desejar.\n\nEste desafio independente é apenas para entretenimento. Não é um exame oficial de admissão em ${name}, não avalia o potencial para os estudos nem prevê a admissão nessa universidade.`;
  }
  if (slug === 'chef') copy.about.body = 'Explore utensílios, ingredientes, técnicas de cozinha, cálculos de receitas e decisões práticas. Cada tema apresenta um novo desafio.\n\nEscolha uma resposta e veja como correu o tema antes de continuar. No final, descubra a pontuação geral e consulte a revisão das respostas, se desejar.\n\nTodas as medidas indicam as unidades. As perguntas de segurança alimentar usam princípios gerais, sem depender das regras de um país. O resultado descreve apenas esta tentativa; não é uma avaliação prática de cozinha.';
  if (slug === 'iq') copy.about.body = 'Explore sequências numéricas, relações entre palavras, lógica, direções e atenção aos detalhes. Cada tema propõe uma forma diferente de raciocinar.\n\nCada pergunta apresenta as regras ou pistas necessárias. Use o tempo que precisar: a rapidez não altera a pontuação. Em cada pausa, veja como correu o tema. No final, descubra o resultado geral e consulte a revisão das respostas, se desejar.\n\nEste desafio é apenas para entretenimento. A pontuação não corresponde a um QI e não constitui uma avaliação clínica ou profissional das capacidades cognitivas.';
  if (slug === 'mechanic') copy.about.body = 'Explore sistemas do veículo, sinais de alerta, medições e identificação de avarias através de situações práticas. Cada tema apresenta uma nova parte do automóvel ou um tipo diferente de pista.\n\nEscolha a resposta com base nas informações apresentadas. Em cada pausa, veja como correu o tema. No final, descubra o resultado geral e consulte a revisão das respostas, se desejar.\n\nAs perguntas não dependem das regras de trânsito de um país nem de uma marca ou modelo específico. As pistas indicam o que pode ser necessário investigar, mas não confirmam uma avaria sem testes. As orientações do fabricante variam conforme o veículo.';
  const clinicalTopics = {
    midwifery: 'Explore a gravidez, o parto, o bem-estar do recém-nascido, a observação e os cuidados respeitosos.',
    nursing: 'Explore os sistemas do corpo, a prevenção de doenças, a observação, a comunicação e o raciocínio em enfermagem.',
    paramedic: 'Explore os sistemas do corpo, a segurança no local, a observação e a comunicação em situações de emergência.',
  };
  if (clinicalTopics[slug]) copy.about.body = `${clinicalTopics[slug]} Cada tema apresenta um novo desafio.\n\nEscolha a resposta com base nas informações apresentadas. Em cada pausa, veja como correu o tema. No final, descubra a pontuação geral e consulte a revisão das respostas, se desejar.\n\nAs perguntas usam princípios gerais e não dependem das regras profissionais de um país. Este teste é apenas para entretenimento; não é um exame oficial, uma qualificação profissional ou uma fonte de instruções clínicas. Situações reais exigem orientação de profissionais com a qualificação adequada.`;
  if (slug === 'memory') {
    copy.summary = 'Guarde palavras, números e pequenos detalhes. Consegue atingir 80%?';
    copy.about.body = 'Ponha a memória à prova com palavras, números, pessoas, lugares e detalhes que voltam a aparecer mais tarde. Cada tema traz um novo desafio. No final, descubra a pontuação e os resultados por área de memória.\n\nObserve cada quadro pelo tempo que precisar e toque em «Já memorizei» para o ocultar e responder. Alguns detalhes voltam a ser pedidos mais tarde, por isso observe o quadro inteiro. A rapidez não altera a pontuação. Um anúncio abre o teste; há outro em cada pausa para continuar ou revelar o resultado. A revisão opcional das respostas também requer um anúncio. O progresso fica guardado neste dispositivo.\n\nEste desafio é apenas para entretenimento. A atenção, o cansaço, as interrupções e o acaso podem influenciar o resultado. Não é uma avaliação clínica da memória nem permite diagnosticar problemas de saúde.';
    copy.about.howToPlay.steps = [
      'Observe o quadro inteiro e toque em «Já memorizei». Alguns detalhes voltam a aparecer mais tarde.',
      'Escolha uma resposta em cada pergunta. A rapidez não altera a pontuação.',
      'Explore os diferentes desafios, descubra o resultado e consulte a revisão das respostas, se desejar.',
    ];
    copy.about.disclaimer = 'Apenas para entretenimento. Este teste não é uma avaliação médica, neurológica ou cognitiva. Se a memória ou a saúde forem motivo de preocupação, procure orientação de um profissional de saúde.';
    copy.results.name = 'O SEU RESULTADO DE MEMÓRIA';
    const profiles = [
      ['Mestre da memória', 'Recordou palavras, detalhes e sequências com grande precisão. Mesmo quando as pistas voltaram a aparecer mais tarde, acertou na grande maioria das respostas.'],
      ['Memória de destaque', 'Atingiu o objetivo de 80%. Recordou muitos detalhes ao longo do desafio e manteve a atenção mesmo entre perguntas diferentes.'],
      ['Recorda quase tudo', 'Recordou a maioria das pistas. A análise por tema mostra onde teve mais facilidade e quais os detalhes que escaparam.'],
      ['Talento para recordar', 'Recordou muitos detalhes em diferentes desafios. Consulte os resultados por tema para descobrir onde teve mais facilidade.'],
      ['Pistas na memória', 'Algumas pistas ficaram na memória e outras escaparam. A revisão das respostas ajuda a perceber quais os detalhes que fizeram a diferença.'],
      ['Há mais para descobrir', 'Alguns detalhes ficaram na memória; outros perderam-se entre as distrações. Este resultado descreve apenas esta tentativa e não avalia a saúde da memória.'],
    ];
    Object.values(copy.results.profiles).forEach((profile, i) => Object.assign(profile, {title: profiles[i][0], copy: profiles[i][1]}));
    copy.results.score.disclaimer = 'Apenas para entretenimento. Este teste não é uma avaliação médica ou cognitiva.';
    const studyTitles = [
      'Memorize estes quatro detalhes', 'Memorize a ordem das palavras', 'Guarde esta sequência na memória',
      'Uma nova sequência para memorizar', 'Memorize a sequência de números', 'Memorize a ordem das formas',
      'Quem tem cada objeto?', 'Conheça um novo grupo de pessoas', 'Memorize os detalhes da viagem de Maya',
      'Agora, memorize a viagem de Kai', 'Associe cada cor a um número', 'Observe os padrões dos objetos',
      'Memorize esta sequência mais longa', 'Memorize a rotina antes de sair de casa', 'Memorize os pedidos do café',
      'Memorize a lista de compras', 'Memorize os detalhes do evento', 'Memorize os detalhes do armário',
      'Memorize estes últimos pares',
    ];
    const studies = Object.values(copy.stages).flatMap(stage => Object.values(stage.questions)).filter(q => q.study);
    studies.forEach((q, i) => {
      q.study.title = studyTitles[i];
      q.study.instruction = 'Observe com atenção. Alguns detalhes voltam a ser pedidos mais tarde.';
    });
  }
  if (slug === 'vision') {
    copy.summary = 'Encontre pequenas diferenças, siga padrões e guarde os detalhes visuais. Quantos consegue identificar?';
    copy.about.body = 'Explore formas, padrões, cores, reflexos e pequenos detalhes visuais. Cada tema apresenta um novo tipo de desafio.\n\nObserve com atenção e escolha a resposta que corresponde à imagem. Nos desafios de memória, estude os símbolos e toque em «Já memorizei» para os ocultar. No final, descubra a pontuação e os temas em que acertou mais.\n\nEste é um jogo de observação para entretenimento. Não é um exame aos olhos nem uma avaliação médica.';
    copy.about.howToPlay.steps = [
      'Observe a imagem ou memorize os símbolos e escolha uma resposta.',
      'Em cada pausa, veja como correu o tema e avance para um novo desafio.',
      'Descubra a pontuação final e consulte as respostas às perguntas em que errou.',
    ];
    copy.about.disclaimer = 'Apenas para entretenimento. Este teste não é um exame aos olhos nem permite diagnosticar problemas de visão.';
    copy.results.name = 'O SEU RESULTADO NO DESAFIO VISUAL';
    const profiles = [
      ['Olho de águia', 'Identificou a grande maioria das diferenças, padrões e detalhes visuais. As respostas mostram muita precisão ao longo deste desafio.'],
      ['Olhar apurado', 'Atingiu o objetivo de 80%. Identificou a maioria dos padrões, das pequenas diferenças e das mudanças nas imagens.'],
      ['Talento para os padrões', 'Descobriu muitas das regras e dos detalhes visuais. A análise por tema mostra em que desafios acertou mais.'],
      ['Detetive dos detalhes', 'Encontrou muitos detalhes em diferentes desafios. Consulte os resultados por tema para descobrir onde teve mais facilidade.'],
      ['À procura das pistas', 'Encontrou pistas e resolveu vários desafios visuais. A revisão das respostas permite voltar às comparações mais difíceis.'],
      ['Olhar curioso', 'Havia muitos detalhes para explorar. Consulte as respostas para descobrir os padrões e as diferenças que escaparam. Esta pontuação não avalia a saúde dos olhos.'],
    ];
    Object.values(copy.results.profiles).forEach((profile, i) => Object.assign(profile, {title: profiles[i][0], copy: profiles[i][1]}));
    const prompts = {
      'vision-s1q2': 'Que seta aponta numa direção diferente?',
      'vision-s1q3': 'Que losango tem apenas o contorno?',
      'vision-s2q4': 'Quantos triângulos há neste quadro?',
      'vision-s3q1': 'O padrão de três formas repete-se. O que vem a seguir?',
      'vision-s3q2': 'A seta continua a rodar no sentido dos ponteiros do relógio. O que vem a seguir?',
      'vision-s3q4': 'O ponto passa pelos cantos no sentido dos ponteiros do relógio. Onde fica a seguir?',
      'vision-s3q6': 'Estas formas alternam. Qual preenche o espaço vazio?',
      'vision-s3q7': 'O triângulo roda e alterna entre preenchido e vazio. Qual vem a seguir?',
      'vision-s4q1': 'Reflita esta seta da esquerda para a direita, como num espelho. Para onde aponta?',
      'vision-s4q2': 'Rode esta seta 90° no sentido dos ponteiros do relógio. Para onde aponta?',
      'vision-s4q3': 'Rode esta seta 180°. Para onde aponta?',
      'vision-s4q4': 'Reflita o quadrado da esquerda para a direita, como num espelho. Onde fica o ponto?',
      'vision-s4q5': 'Inverta o quadrado de cima para baixo. Onde fica o ponto?',
      'vision-s4q6': 'Rode o quadrado 180°. Onde fica o ponto?',
      'vision-s4q7': 'Rode o anel 90° no sentido dos ponteiros do relógio. Onde fica a abertura?',
      'vision-s5q1': 'Que peça tem uma cor diferente?',
      'vision-s5q2': 'Que peça cinzenta tem o tom mais claro?',
      'vision-s5q3': 'Que peça azul tem o tom mais escuro?',
      'vision-s5q5': 'Que peça tem exatamente a cor do modelo?',
      'vision-s6q5': 'Que forma ocupava a terceira posição na imagem?',
      'vision-s6q7': 'Que símbolo NÃO aparecia na imagem?',
      'vision-s7q1': 'Que carácter (caractere) do código original foi substituído?',
      'vision-s7q3': 'Que linha é uma cópia exata do modelo?',
      'vision-s7q5': 'Que linha contém dois códigos diferentes?',
      'vision-s7q6': 'Que linha apresenta o código do modelo pela ordem inversa?',
      'vision-s7q7': 'Que duas posições foram trocadas entre estes códigos?',
      'vision-s8q2': 'Quantos quadrados de todos os tamanhos há neste quadro?',
      'vision-s8q7': 'Comece no ponto e siga as setas. Em que posição termina?',
      'vision-s9q3': 'Que peça reproduz exatamente o padrão do modelo?',
      'vision-s10q2': 'Rode esta seta diagonal 90° no sentido dos ponteiros do relógio. Para onde aponta?',
      'vision-s10q3': 'Que símbolo ocupava a quarta posição na imagem?',
      'vision-s10q5': 'Quantos quadrados cabem neste quadro retangular?',
      'vision-s10q6': 'Siga a linha de pontos a partir do ponto da esquerda. Onde termina?',
    };
    for (const stage of Object.values(copy.stages)) for (const [id, q] of Object.entries(stage.questions)) {
      if (prompts[id]) q.question = prompts[id];
      if (q.study) {
        q.study.title = 'Memorize esta imagem';
        q.study.instruction = 'Observe cada linha da esquerda para a direita. Quando terminar, toque em «Já memorizei» para ocultar os símbolos.';
      }
    }
  }
  if (slug === 'personality') {
    copy.summary = 'Explore as preferências do dia a dia e descubra o país que inspira o seu perfil.';
    copy.landing.intro = 'Siga as suas preferências.\nDescubra o país que combina com o seu estilo.';
    copy.about.body = 'Explore as relações com as pessoas, a rotina, a curiosidade e a forma de reagir quando os planos mudam. Escolha a resposta que mais se aproxima das suas preferências, sem tentar chegar a um resultado específico.\n\nCada pausa revela o estilo que mais se destacou naquele tema. O resultado final junta todas as respostas; a análise detalhada das preferências é opcional. Um anúncio abre o teste, há outro em cada pausa e um para ver a análise opcional. O progresso fica guardado neste dispositivo.\n\nItália, Japão, Austrália e Suécia dão nome a perfis de estilo de vida criados para este jogo. O resultado não determina nacionalidade, origem, identidade cultural ou o lugar onde alguém deve viver.';
    copy.about.howToPlay.steps = [
      'Escolha a resposta que melhor descreve as suas preferências. Não há respostas certas ou erradas.',
      'Em cada pausa, descubra o estilo que mais se destacou e explore um novo tema.',
      'Veja o país que inspira o seu perfil final e consulte a análise das preferências, se desejar.',
    ];
    copy.about.disclaimer = 'Apenas para entretenimento e reflexão pessoal. Este teste não determina nacionalidade, identidade cultural ou o lugar onde alguém deve viver.';
    copy.results.name = 'O SEU PERFIL';
    const profiles = [
      ['As suas escolhas dão valor à proximidade, à expressão e aos momentos em boa companhia. A beleza e a tradição têm lugar no seu dia a dia, tal como uma boa conversa e tempo à mesa com pessoas importantes.', 'Proximidade, expressão e prazer nas pequenas coisas', ['Sociável', 'Atenção à beleza', 'Afeto']],
      ['O cuidado, o significado e a atenção aos detalhes destacam-se nas suas respostas. Aprecia experiências que juntam tradição e novas ideias, espaços tranquilos e pequenos rituais que tornam o dia especial.', 'Atenção, cuidado e curiosidade', ['Observação', 'Respeito', 'Cuidado']],
      ['Espaços abertos, conversas descontraídas e vontade de experimentar marcam o seu resultado. Aprecia liberdade para explorar, boa companhia e planos que podem dar lugar a uma aventura.', 'Liberdade, aventura e boa disposição', ['Independência', 'Simpatia', 'Espontaneidade']],
      ['O equilíbrio, a simplicidade e o conforto destacam-se nas suas escolhas. Aprecia o espaço pessoal e as relações próximas, com tempo para a natureza e ambientes pensados com cuidado.', 'Equilíbrio, tranquilidade e simplicidade', ['Pés no chão', 'Atenção aos outros', 'Independência']],
    ];
    Object.values(copy.results.profiles).forEach((profile, i) => Object.assign(profile, {copy: profiles[i][0], aura: profiles[i][1], traits: profiles[i][2]}));
    copy.results.dimensions['dimension-2'].label = 'Atenção japonesa';
    copy.results.dimensions['dimension-4'].label = 'Equilíbrio sueco';
    Object.assign(copy.results.profileReveal, {
      eyebrow: 'O PAÍS QUE INSPIRA O SEU PERFIL', auraLabel: 'O SEU ESTILO', traitsLabel: 'TRÊS TRAÇOS DO PERFIL',
      strongestEnergy: 'O estilo que mais se destacou', hiddenEnergy: 'A segunda influência mais forte', consistency: 'AFINIDADE COM O PERFIL',
      consistencyLabels: {high: 'Afinidade muito forte', medium: 'Afinidade clara', mixed: 'Uma mistura de estilos'},
      breakdown: {
        eyebrow: 'AS SUAS PREFERÊNCIAS', title: 'O que está por trás do resultado',
        copy: 'Explore as preferências que formam o seu perfil e descubra qual foi o segundo estilo mais próximo.',
        button: 'Ver a análise do meu perfil', adNote: 'Veja um anúncio para abrir a análise das suas preferências.', heading: 'O SEU PERFIL EM DETALHE',
      },
      portraitAlt: 'Ilustração da paisagem associada a {profile}',
      disclaimer: 'Apenas para entretenimento e reflexão pessoal. Este perfil de estilo de vida não determina nacionalidade, identidade cultural ou o lugar onde alguém deve viver.',
    });
  }
}
