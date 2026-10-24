// Neutral written Portuguese for both Portugal and Brazil. No tu/você switch,
// regional slang or paired national spellings are needed in this edition.
export const portugueseYearsStageTitles = [
  'O início do seu dia', 'A sua energia à mesa', 'O seu ritmo no dia a dia', 'A sua forma de relaxar', 'Como reage à pressão',
  'As suas relações', 'Os seus hábitos', 'O seu entusiasmo', 'A sua versão do futuro', 'O resultado do seu relógio',
];

export const portugueseYearsCopy = {
  title: 'Quanto tempo de vida lhe resta?',
  eyebrow: 'O seu relógio de vida',
  summary: 'Visão de longo prazo ou vontade de viver novas histórias? Descubra o perfil do seu relógio de vida e uma estimativa de idade só para diversão.',
  landing: {intro: 'As suas escolhas deixam pistas.\nQue idade se esconde nelas?', cta: 'Iniciar teste'},
  about: {
    body: 'Descubra o que os hábitos do dia a dia revelam sobre o seu relógio de vida. Dez etapas exploram a rotina, a energia, o ritmo, o descanso, a pressão, as relações, os hábitos, a curiosidade, os planos e os instintos. No fim, conheça o seu perfil e uma estimativa de idade apenas para diversão.\n\nEssa idade é um resultado lúdico baseado nas suas escolhas, não uma previsão. O teste não usa a sua idade atual, informações médicas, histórico de saúde familiar nem uma avaliação individual de risco.',
    howToPlay: {steps: [
      'Escolha a resposta que melhor descreve o seu jeito de ser. Não há respostas certas.',
      'Complete dez etapas rápidas, cada uma dedicada a uma parte diferente do seu dia a dia.',
      'Veja a tendência que mais se destaca em cada etapa e descubra o seu perfil com uma estimativa de idade apenas para diversão.',
    ]},
    disclaimer: 'Apenas para entretenimento e reflexão pessoal. Este teste não prevê a duração da vida, a saúde, o risco de morte nem resultados médicos. Se tiver preocupações com a saúde, procure um profissional de saúde com a qualificação adequada.',
  },
  career: {
    resultProgressLabel: 'O seu relógio de vida',
    stages: {
      'stage-1': {
        difficulty: 'O INÍCIO DO SEU DIA', preAdTitle: 'A primeira pista chegou',
        preAdCopy: 'Nesta etapa, o perfil que mais se destaca é: {profile}. Será que as escolhas à mesa contam a mesma história?',
        next: {eyebrow: 'A SEGUIR', tagline: 'O que realmente dá energia ao seu dia?'}, preAdButton: 'Continuar',
      },
      'stage-2': {
        difficulty: 'A SUA ENERGIA À MESA', preAdTitle: 'Os seus gostos têm personalidade',
        preAdCopy: 'O perfil que mais se destaca nas escolhas à mesa é: {profile}. A seguir, entram em cena o conforto e a vontade de movimento.',
        next: {eyebrow: 'A SEGUIR', tagline: 'O seu ritmo diário também tem uma marca própria.'}, preAdButton: 'Continuar',
      },
      'stage-3': {
        difficulty: 'O SEU RITMO NO DIA A DIA', preAdTitle: 'O seu ritmo começa a aparecer',
        preAdCopy: 'As escolhas sobre movimento apontam para: {profile}. Mas o que acontece quando chega a hora de relaxar?',
        next: {eyebrow: 'A SEGUIR', tagline: 'Agora, o foco está na sua forma de terminar o dia.'}, preAdButton: 'Continuar',
      },
      'stage-4': {
        difficulty: 'A SUA FORMA DE RELAXAR', preAdTitle: 'O seu perfil no fim do dia',
        preAdCopy: 'Nesta etapa, o perfil que mais se destaca é: {profile}. Agora, descubra como reage quando a pressão aumenta.',
        next: {eyebrow: 'A SEGUIR', tagline: 'Dia cheio. Mais um pedido. Como reage?'}, preAdButton: 'Continuar',
      },
      'stage-5': {
        difficulty: 'COMO REAGE À PRESSÃO', preAdTitle: 'A sua reação à pressão ganhou forma',
        preAdCopy: 'Sob pressão, as suas respostas apontam para: {profile}. A seguir, as pessoas que revelam outro lado do seu jeito de ser.',
        next: {eyebrow: 'A SEGUIR', tagline: 'Os seus amigos talvez reconheçam estas respostas.'}, preAdButton: 'Continuar',
      },
      'stage-6': {
        difficulty: 'AS SUAS RELAÇÕES', preAdTitle: 'O seu lado social ganhou um perfil',
        preAdCopy: 'Nas relações, o perfil que mais se destaca é: {profile}. Agora vêm os pequenos hábitos que quase passam despercebidos.',
        next: {eyebrow: 'A SEGUIR', tagline: 'O que acontece quando o dia segue no modo automático?'}, preAdButton: 'Continuar',
      },
      'stage-7': {
        difficulty: 'OS SEUS HÁBITOS', preAdTitle: 'Os seus hábitos revelam um padrão',
        preAdCopy: 'Nos hábitos, as suas escolhas apontam para: {profile}. Agora, algo mais leve: o que torna um dia comum memorável?',
        next: {eyebrow: 'A SEGUIR', tagline: 'Conforto, curiosidade ou uma história completamente nova?'}, preAdButton: 'Continuar',
      },
      'stage-8': {
        difficulty: 'O SEU ENTUSIASMO', preAdTitle: 'O seu entusiasmo tem uma marca própria',
        preAdCopy: 'Nesta etapa, o perfil que mais se destaca é: {profile}. O que dizem as suas escolhas sobre a vida que quer construir?',
        next: {eyebrow: 'A SEGUIR', tagline: 'Que escolhas de hoje terão mais valor no futuro?'}, preAdButton: 'Continuar',
      },
      'stage-9': {
        difficulty: 'A SUA VERSÃO DO FUTURO', preAdTitle: 'A sua visão do futuro ganhou forma',
        preAdCopy: 'Ao pensar no futuro, as suas escolhas apontam para: {profile}. Siga agora o primeiro impulso e complete o quadro geral.',
        next: {eyebrow: 'A SEGUIR', tagline: 'O que diz o seu instinto quando olha para o conjunto?'}, preAdButton: 'Continuar',
      },
      'stage-10': {
        difficulty: 'O RESULTADO DO SEU RELÓGIO', preAdTitle: 'O resultado do seu relógio está pronto',
        preAdCopy: 'Todas as etapas estão completas. Descubra o perfil do seu relógio e a estimativa de idade apenas para diversão. Depois, explore as escolhas que formaram o resultado.',
        preAdChecks: ['Escolhas do dia a dia relacionadas', 'Perfil do relógio identificado', 'Estimativa de idade pronta para descobrir'], preAdButton: 'Ver meu resultado',
      },
    },
  },
  results: {
    name: 'O PERFIL DO SEU RELÓGIO',
    profiles: {
      centenarian_energy: {tier: 'Construir para o longo prazo', title: 'Visão de longo prazo', copy: 'Faz pequenas promessas e procura cumprir cada uma. As suas respostas dão valor a hábitos consistentes, tempo para recuperar e escolhas que facilitam a vida no futuro. A sua marca: construir com calma, sem perder de vista o longo prazo.'},
      steady_long_game: {tier: 'A força da constância', title: 'Constância no dia a dia', copy: 'Conhece o valor de uma rotina que combina com o seu jeito de ser. Rituais familiares e pessoas de confiança dão forma aos seus dias. A sua marca: ser alguém com quem os outros podem contar, sem fazer disso um grande acontecimento.'},
      balanced_realist: {tier: 'Há espaço para os dois lados', title: 'Equilíbrio na vida real', copy: 'Há espaço para escolhas sensatas e para uma vida com prazer. As suas respostas acompanham as necessidades do dia, em vez de procurar uma rotina perfeita. A sua marca: saber quando seguir o plano e quando pedir uma fatia de bolo.'},
      weekend_chaos: {tier: 'Boas histórias incluídas', title: 'Um fim de semana imprevisível', copy: 'As suas melhores histórias raramente começam com um plano rígido. As respostas favorecem momentos espontâneos, boa companhia e pequenas negociações com a sua versão de amanhã. A sua marca: transformar uma noite comum numa história para contar.'},
      stress_sprinter: {tier: 'Há sempre mais uma coisa', title: 'No ritmo máximo', copy: 'Leva energia a quase tudo o que faz. Nas suas respostas, a próxima tarefa costuma aparecer antes da próxima pausa. A sua marca: fazer as coisas avançarem. Um pouco mais de espaço para respirar pode ajudar a escolher esse ritmo, em vez de sentir que não há alternativa.'},
      comfort_creature: {tier: 'O conforto é uma arte', title: 'A arte do conforto', copy: 'Sabe o que torna um dia agradável: lugares familiares, pessoas queridas e uma verdadeira oportunidade de relaxar. A sua marca: tornar o dia a dia acolhedor. Conhecer o que combina com o seu jeito de ser também é uma habilidade.'},
      adventure_fuse: {tier: 'Em busca de boas histórias', title: 'Espírito de aventura', copy: 'A curiosidade tem lugar nas suas decisões. As respostas encontram possibilidades em lugares novos, ideias diferentes e dias que mudam de rumo. A sua marca: voltar com uma história que ninguém esperava.'},
      reset_needed: {tier: 'Uma nova fase pela frente', title: 'Hora de recomeçar', copy: 'As suas respostas pedem muitas vezes mais espaço, menos exigências e uma oportunidade de respirar. A sua vontade neste momento: um recomeço que combine com a vida real. Este perfil reflete estas escolhas, não uma característica permanente.'},
    },
    dimensions: {
      'dimension-1': {label: '🌿 Constância e visão de longo prazo'}, 'dimension-2': {label: '⚖️ Equilíbrio e recuperação'},
      'dimension-3': {label: '✨ Entusiasmo e aventura'}, 'dimension-4': {label: '⚡ Pressão e ritmo'},
    },
    estimate: {
      eyebrow: 'A IDADE DO SEU RELÓGIO, SÓ PARA DIVERSÃO', ageSuffix: 'ANOS', strongestSignal: 'O traço que mais se destacou', wildcard: 'O seu lado inesperado', consistency: 'Coerência das respostas',
      consistencyLabels: {high: 'Alta', medium: 'Moderada', mixed: 'Variável'},
      reviewUnlock: {
        title: 'Que escolhas formaram o seu resultado?', copy: 'Veja além do número: que respostas aumentaram, reduziram ou mantiveram esta estimativa de idade apenas para diversão?',
        button: 'Ver as minhas respostas', adNote: 'Toque para descobrir o que influenciou a estimativa.', reviewTitle: 'O que influenciou a sua estimativa', yourChoice: 'A sua escolha',
        raised: 'Aumentou', lowered: 'Reduziu', neutral: 'Sem alteração', raisedCopy: 'Esta escolha aumentou a estimativa.', loweredCopy: 'Esta escolha reduziu a estimativa.', neutralCopy: 'Esta resposta acrescentou contexto sem alterar significativamente a estimativa.',
      },
      insights: {overview: 'A sua estimativa em resumo', estimate: 'A sua estimativa', signal: 'A principal tendência do seu estilo de vida', consistency: 'Coerência das respostas', breakdown: 'As tendências do seu estilo de vida', snapshot: 'O que o seu perfil sugere'},
      disclaimer: 'Apenas para entretenimento. Este resultado não é uma previsão médica nem da duração da vida.',
    },
  },
};
