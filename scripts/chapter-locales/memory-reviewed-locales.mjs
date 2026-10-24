import assert from 'node:assert/strict';

// Editorial corrections for the current English general-knowledge edition.
// Keep source quizzes untouched: these revisions belong specifically to /memory.
export const reviewedMemoryLocales = ['de', 'es', 'fr', 'pt'];

const interfaceCopy = {
  de: {
    intro: 'Du hältst dich für schlau? Stell dich auf die Probe.',
    summary: 'Wissenschaft, Geografie, Geschichte, Essen, Sprache und logisches Denken: Schaffst du 80 %?',
    steps: ['Lies jede Frage und wähle eine Antwort.', 'Entdecke nach jedem Thema dein Zwischenprofil und mach mit dem nächsten Thema weiter.', 'Sieh dir dein Gesamtergebnis an und schau auf Wunsch die Antworten nach, die du verpasst hast.'],
    stageTitles: ['Zum Einstieg', 'Grundlagen des Körpers', 'Gerichte erkennen', 'Rund um die Welt', 'Im Inneren der Zelle', 'Geschichte und Kultur', 'Kräfte beim Fliegen', 'Wörter verknüpfen', 'Messen und Rechnen', 'Das Wissensfinale'],
    checkpointTitles: ['Dein Einstieg ist geschafft', 'Dein Körperwissen im Überblick', 'Dein kulinarisches Profil', 'Deine Weltreise ist geschafft', 'Dein Zellwissen im Überblick', 'Dein Geschichtswissen im Überblick', 'Dein Flugwissen im Überblick', 'Dein Wortwissen im Überblick', 'Deine Rechnungen sind geprüft', 'Dein Ergebnis steht fest'],
    checkpointCopy: 'Dein Profil in diesem Thema: {profile}.',
    teasers: ['Jetzt geht es um den menschlichen Körper. Was weißt du darüber?', 'Erkennst du die Gerichte und ihre Zutaten?', 'Von Ozeanen bis zu Hauptstädten: Wie gut kennst du die Welt?', 'Jetzt wird es winzig: Was passiert im Inneren einer Zelle?', 'Kunst, Geschichte und Entdeckungen: Was ist dir vertraut?', 'Welche Kräfte halten ein Flugzeug in der Luft?', 'Jetzt zählen die Verbindungen zwischen den Wörtern.', 'Einheiten, Messwerte und kleine Rechnungen: Wie sicher bist du?', 'Zum Schluss kommt ein bunter Mix. Achte genau auf die Fragen.'],
    finalCopy: 'Hast du 80 % erreicht? Entdecke deine Gesamtpunktzahl und deine stärksten Themen.',
    progress: 'Deine Herausforderung',
    profiles: [
      ['Quiz-Profi', 'Du hast fast jede Frage richtig beantwortet. Die Auswertung zeigt, wie sich deine Treffsicherheit über die verschiedenen Themen verteilt.'],
      ['Vielseitiges Wissen', 'Du hast in vielen Bereichen die richtigen Zusammenhänge erkannt. In der Auswertung siehst du, welche Themen dir besonders gut lagen.'],
      ['Gut kombiniert', 'Du hast viele Hinweise und Fakten richtig verbunden. Die Auswertung zeigt deine stärksten Themen und die Bereiche, die einen zweiten Blick verdienen.'],
      ['Du findest deinen Rhythmus', 'Du hast in mehreren Themen nützliche Hinweise erkannt. Die Antwortübersicht hilft dir bei den Fragen, die dich überrascht haben.'],
      ['Neugierig unterwegs', 'Manche Themen waren dir vertrauter als andere. Die Antwortübersicht zeigt die richtigen Lösungen und gibt dir einen Ausgangspunkt für einen neuen Versuch.'],
      ['Ein neuer Anfang', 'Dieses Quiz hat vertraute und neue Ideen gemischt. In der Antwortübersicht kannst du die Hinweise entdecken, die du übersehen hast.'],
    ],
    score: {strongest: 'Dein stärkstes Themengebiet', trickiest: 'Dein schwierigstes Themengebiet', bestRound: 'Deine beste Runde'},
  },
  fr: {
    intro: 'Vous pensez avoir l’esprit vif ? Mettez-vous à l’épreuve.',
    summary: 'Sciences, géographie, histoire, cuisine, mots et logique : atteindrez-vous 80 % ?',
    steps: ['Lisez chaque question et choisissez une réponse.', 'Découvrez votre profil après chaque thème, puis passez au défi suivant.', 'Découvrez votre résultat global et consultez, si vous le souhaitez, les bonnes réponses aux questions manquées.'],
    stageTitles: ['Pour commencer', 'Les bases du corps', 'Reconnaître le plat', 'Autour du monde', 'À l’intérieur de la cellule', 'Histoire et culture', 'Les forces du vol', 'Les liens entre les mots', 'Mesures et calculs', 'Le défi final'],
    checkpointTitles: ['Le premier défi est terminé', 'Le défi du corps est terminé', 'Votre profil culinaire est prêt', 'Votre tour du monde est terminé', 'Le défi de la cellule est terminé', 'Votre profil en histoire est prêt', 'Le défi du vol est terminé', 'Le défi des mots est terminé', 'Vos mesures et calculs sont vérifiés', 'Votre résultat est prêt'],
    checkpointCopy: 'Votre profil pour ce thème : {profile}.',
    teasers: ['Place au corps humain. Que savez-vous de son fonctionnement ?', 'Saurez-vous reconnaître les plats et leurs ingrédients ?', 'Des océans aux capitales : connaissez-vous bien le monde ?', 'Changement d’échelle : que se passe-t-il dans une cellule ?', 'Art, histoire et découvertes : quels sont vos repères ?', 'Quelles forces permettent à un avion de voler ?', 'À vous de trouver les liens entre les mots.', 'Unités, mesures et petits calculs : gardez l’œil ouvert.', 'Un dernier mélange de thèmes vous attend. Lisez bien les questions.'],
    finalCopy: 'Avez-vous atteint 80 % ? Découvrez votre score global et les thèmes où vous avez le mieux réussi.',
    progress: 'Votre défi',
    profiles: [
      ['Maître du quiz', 'Vous avez répondu correctement à presque toutes les questions. Le détail des résultats montre comment cette réussite se répartit entre les thèmes.'],
      ['À l’aise sur tous les terrains', 'Vous avez fait de nombreux rapprochements justes tout au long du défi. Consultez le détail des résultats pour découvrir vos points forts.'],
      ['Un esprit affûté', 'Vous avez relié de nombreux indices et faits. Le détail des résultats met en lumière les thèmes les mieux maîtrisés et ceux qui méritent un second regard.'],
      ['Vous trouvez votre rythme', 'Vous avez repéré des indices utiles dans plusieurs thèmes. La correction vous aide à comprendre les questions qui vous ont posé problème.'],
      ['Une belle curiosité', 'Certains thèmes vous étaient plus familiers que d’autres. La correction vous donne les bonnes réponses et un point de départ pour une nouvelle tentative.'],
      ['Un nouveau point de départ', 'Ce défi mêlait des idées connues et nouvelles. Consultez la correction pour découvrir les indices qui vous ont échappé.'],
    ],
  },
  es: {
    intro: '¿Crees que eres inteligente? Ponte a prueba.',
    summary: 'Ciencia, geografía, historia, comida, palabras y lógica: ¿llegarás al 80%?',
    steps: ['Lee cada pregunta y elige una respuesta.', 'Descubre tu perfil después de cada tema y pasa al siguiente reto.', 'Descubre tu resultado general y, si quieres, repasa las respuestas de las preguntas que fallaste.'],
    stageTitles: ['Para empezar', 'Las bases del cuerpo', 'Reconocer el plato', 'La vuelta al mundo', 'Dentro de la célula', 'Historia y cultura', 'Las fuerzas del vuelo', 'Relaciones entre palabras', 'Medidas y cálculos', 'El reto final'],
    checkpointTitles: ['Ya completaste el primer reto', 'El reto del cuerpo está completo', 'Tu perfil de cocina está listo', 'Ya completaste la vuelta al mundo', 'El reto de la célula está completo', 'Tu perfil de historia está listo', 'El reto del vuelo está completo', 'El reto de palabras está completo', 'Tus medidas y cálculos están revisados', 'Tu resultado está listo'],
    checkpointCopy: 'Tu perfil en este tema: {profile}.',
    teasers: ['Ahora toca el cuerpo humano. ¿Cuánto sabes de él?', '¿Reconocerás los platos y sus ingredientes?', 'De océanos a capitales: ¿cuánto sabes del mundo?', 'Cambiamos de escala: ¿qué pasa dentro de una célula?', 'Arte, historia y descubrimientos: ¿qué recuerdas?', '¿Qué fuerzas permiten volar a un avión?', 'Ahora importan las relaciones entre las palabras.', 'Unidades, medidas y pequeños cálculos: presta atención.', 'Te espera una mezcla final de temas. Lee bien cada pregunta.'],
    finalCopy: '¿Llegaste al 80%? Descubre tu puntuación general y los temas en los que más destacaste.',
    progress: 'Tu reto',
    profiles: [
      ['Dominio del test', 'Respondiste correctamente a casi todas las preguntas. El desglose muestra cómo se repartieron tus aciertos entre los distintos temas.'],
      ['Talento en muchos temas', 'Relacionaste correctamente muchas ideas a lo largo del reto. Explora el desglose para descubrir tus temas más fuertes.'],
      ['Una mente despierta', 'Conectaste muchas pistas y datos. El desglose destaca los temas que mejor resolviste y los que merecen otra mirada.'],
      ['Encontrando el ritmo', 'Encontraste pistas útiles en varios temas. Repasar las respuestas te ayudará a entender las preguntas que te sorprendieron.'],
      ['Curiosidad en marcha', 'Algunos temas te resultaron más familiares que otros. La revisión muestra las respuestas correctas y te da un punto de partida para otro intento.'],
      ['Un nuevo punto de partida', 'Este reto combinó ideas conocidas y nuevas. Repasa las respuestas para descubrir las pistas que se te escaparon.'],
    ],
  },
  pt: {
    intro: 'Acha que tem uma mente brilhante? Faça o teste.',
    summary: 'Ciência, geografia, história, culinária, palavras e lógica: consegue chegar aos 80%?',
    steps: ['Leia cada pergunta e escolha uma resposta.', 'Descubra o seu perfil no fim de cada tema e avance para o próximo desafio.', 'Veja o resultado final e, se quiser, consulte as respostas corretas às perguntas em que errou.'],
    stageTitles: ['Para começar', 'O corpo humano', 'Reconheça o prato', 'Pelo mundo', 'Dentro da célula', 'História e cultura', 'As forças do voo', 'Relações entre palavras', 'Medidas e cálculos', 'O desafio final'],
    checkpointTitles: ['O primeiro desafio está completo', 'O desafio do corpo está completo', 'O seu perfil de culinária está pronto', 'A sua viagem pelo mundo está completa', 'O desafio da célula está completo', 'O seu perfil de história está pronto', 'O desafio do voo está completo', 'O desafio de palavras está completo', 'As suas medidas e cálculos foram verificados', 'O seu resultado está pronto'],
    checkpointCopy: 'O seu perfil neste tema: {profile}.',
    teasers: ['Agora, o corpo humano. Quanto sabe sobre o seu funcionamento?', 'Consegue reconhecer os pratos e os seus ingredientes?', 'Dos oceanos às capitais: quanto sabe sobre o mundo?', 'Mudamos de escala: o que acontece dentro de uma célula?', 'Arte, história e descobertas: o que vai reconhecer?', 'Que forças permitem que um avião voe?', 'Agora, o desafio é encontrar relações entre palavras.', 'Unidades, medidas e pequenos cálculos: atenção aos detalhes.', 'Uma mistura final de temas vem a seguir. Leia cada pergunta com atenção.'],
    finalCopy: 'Chegou aos 80%? Descubra a sua pontuação total e os temas em que mais se destacou.',
    progress: 'O seu desafio',
    profiles: [
      ['Domínio do desafio', 'Acertou quase todas as perguntas. A análise por tema mostra como os seus acertos se distribuíram pelas diferentes áreas deste desafio.'],
      ['Conhecimentos de destaque', 'Estabeleceu muitas relações corretas ao longo do desafio. Explore a análise por tema para descobrir os seus pontos fortes.'],
      ['Bom raciocínio', 'Relacionou muitas pistas e informações. A análise destaca os temas que melhor resolveu e aqueles que merecem uma nova leitura.'],
      ['Passo a passo', 'Encontrou pistas úteis em vários temas. A revisão das respostas ajuda a esclarecer as perguntas que causaram mais dificuldade.'],
      ['Curiosidade em ação', 'Alguns temas foram mais familiares do que outros. A revisão mostra as respostas corretas e oferece um ponto de partida para uma nova tentativa.'],
      ['Um novo ponto de partida', 'Este desafio reuniu ideias conhecidas e novas. Consulte as respostas para descobrir as pistas que passaram despercebidas.'],
    ],
    score: {strongest: 'O seu tema mais forte', trickiest: 'O tema com mais dificuldades', bestRound: 'O seu melhor tema'},
  },
};

// Partial, ID-keyed visible-copy fixes; correctness and order stay in quiz.json.
const questionCopy = {
  de: {
    'memory-gk-s2q3': {answers: {a3: 'Die beiden Lungenflügel'}},
    'memory-gk-s5q6': {answers: {a1: 'Die zuvor verdoppelten Chromosomen werden auf zwei Zellkerne verteilt'}},
    'memory-gk-s7q4': {answers: {a3: 'Eine Form, die bei umströmender Luft eine aerodynamische Kraft erzeugt'}},
    'memory-gk-s8q2': {question: 'Ein Thermometer misst die Temperatur. Eine Uhr misst …'},
    'memory-gk-s9q1': {question: 'Beim Eintauchen eines Gegenstands steigt der Messwert für das Wasser von 40 mL auf 55 mL. Welches Volumen wird verdrängt?'},
    'memory-gk-s9q4': {question: 'Eine Probe hat eine Masse von 24 g und ein Volumen von 8 cm³. Mit der Formel Dichte = Masse ÷ Volumen: Wie groß ist ihre Dichte?'},
  },
  fr: {
    'memory-gk-s3q3': {question: 'Quel plat se compose de couches de pâtes alternant avec une garniture ou une sauce ?'},
    'memory-gk-s3q4': {answers: {a1: 'Une soupe de légumes dont la recette varie selon les régions'}},
    'memory-gk-s3q5': {answers: {a2: 'Du pain grillé'}},
    'memory-gk-s5q3': {answers: {a1: 'Transporter l’air dans les poumons', a3: 'Fabriquer l’émail des dents en dehors des cellules'}},
    'memory-gk-s7q3': {question: 'En vol rectiligne et horizontal à vitesse constante, quelle relation existe entre la portance et le poids ?'},
    'memory-gk-s7q4': {answers: {a3: 'Une forme conçue pour produire une force aérodynamique lorsque l’air circule autour d’elle'}},
    'memory-gk-s7q5': {question: 'Quelle partie d’un avion est son fuselage ?'},
    'memory-gk-s7q7': {answers: {a1: 'L’avion et tout ce qu’il transporte'}},
    'memory-gk-s8q2': {question: 'Un thermomètre mesure la température. Une horloge mesure…'},
    'memory-gk-s9q1': {question: 'Le volume lu sur une éprouvette passe de 40 mL à 55 mL lorsqu’un objet est immergé. Quel volume d’eau est déplacé ?'},
  },
  es: {
    'memory-gk-s2q6': {question: '¿Qué órgano mezcla los alimentos con ácido durante la digestión?'},
    'memory-gk-s3q2': {answers: {a1: 'Almidón de papa'}},
    'memory-gk-s3q4': {answers: {a1: 'Una sopa de verduras con variaciones regionales'}},
    'memory-gk-s7q4': {answers: {a3: 'Una forma diseñada para producir una fuerza aerodinámica cuando el aire fluye a su alrededor'}},
    'memory-gk-s7q7': {answers: {a1: 'El avión y todo lo que lleva', a2: 'Solo la estructura vacía', a3: 'Solo el combustible'}},
    'memory-gk-s8q2': {question: 'Un termómetro mide la temperatura. Un reloj mide…'},
    'memory-gk-s9q1': {question: 'Al sumergir un objeto, la lectura del volumen de agua pasa de 40 mL a 55 mL. ¿Qué volumen de agua se desplaza?'},
    'memory-gk-s9q6': {question: 'Una balanza siempre marca 2 g de más. Indica 18 g. ¿Cuál es la masa real?', answers: {a1: '36 g', a2: '20 g', a3: '16 g'}},
  },
  pt: {
    'memory-gk-s1q1': {answers: {a1: 'Vénus'}},
    'memory-gk-s1q2': {answers: {a1: 'Leste'}},
    'memory-gk-s2q3': {question: 'Que par de órgãos faz as trocas gasosas durante a respiração?'},
    'memory-gk-s3q1': {question: 'Que cereal é a base do risoto?'},
    'memory-gk-s3q6': {question: 'Que prato costuma combinar tomate, queijo mozzarella e manjericão?'},
    'memory-gk-s3q7': {answers: {a2: 'Uma sobremesa gelada de limão'}},
    'memory-gk-s4q4': {answers: {a3: 'Tamisa'}},
    'memory-gk-s4q5': {question: 'Os Andes ficam no lado ocidental de que continente?'},
    'memory-gk-s4q6': {question: 'Perto da costa de que país fica a Grande Barreira de Coral?'},
    'memory-gk-s5q1': {question: 'Que estrutura contém a maior parte do DNA de uma célula humana típica?', answers: {a1: 'Lisossoma', a2: 'Ribossoma'}},
    'memory-gk-s5q2': {question: 'Que estruturas produzem proteínas?', answers: {a2: 'Ribossomas', a3: 'Apenas os cromossomas'}},
    'memory-gk-s5q5': {answers: {a3: 'A cópia de todos os cromossomas'}},
    'memory-gk-s5q6': {question: 'O que acontece durante a mitose numa célula típica do corpo humano?', answers: {a1: 'Os cromossomas duplicados são separados em dois núcleos', a2: 'Dois óvulos fundem-se'}},
    'memory-gk-s5q7': {question: 'Que molécula contém as instruções genéticas herdadas?', answers: {a3: 'DNA'}},
    'memory-gk-s7q1': {answers: {a2: 'Pressão no interior do avião'}},
    'memory-gk-s7q3': {question: 'Durante um voo em linha reta, nivelado e a velocidade constante, qual é a relação entre a sustentação e o peso?'},
    'memory-gk-s7q4': {answers: {a3: 'Uma forma concebida para produzir uma força aerodinâmica quando o ar passa à sua volta'}},
    'memory-gk-s7q5': {question: 'Que parte de uma aeronave é a fuselagem?'},
    'memory-gk-s7q6': {answers: {a1: 'O bordo traseiro', a2: 'Toda a superfície inferior', a3: 'O bordo dianteiro'}},
    'memory-gk-s7q7': {answers: {a1: 'A aeronave e tudo o que transporta'}},
    'memory-gk-s8q1': {question: 'Um pássaro vive num ninho. Onde vive um grupo de abelhas?'},
    'memory-gk-s8q2': {question: 'Um sensor mede a temperatura. Um relógio mede…'},
    'memory-gk-s8q3': {question: 'A mão está para a luva assim como o pé está para…'},
    'memory-gk-s8q4': {question: 'Um livro serve para ler. A música serve para…'},
    'memory-gk-s8q5': {question: 'Uma faca serve para cortar. Uma caneta serve para…'},
    'memory-gk-s9q1': {question: 'Ao submergir um objeto, a leitura do volume de água passa de 40 mL para 55 mL. Que volume de água foi deslocado?'},
    'memory-gk-s9q4': {question: 'Uma amostra tem massa de 24 g e volume de 8 cm³. Com a fórmula densidade = massa ÷ volume, qual é a sua densidade?'},
    'memory-gk-s9q6': {question: 'Uma balança indica sempre 2 g acima do valor real. Mostra 18 g. Qual é a massa real?'},
  },
};

function typography(value, locale) {
  if (typeof value === 'string') {
    if (locale === 'fr') return value.replace(/[ \u00a0\u202f]+(?=[?!;])/g, '\u202f').replace(/[ \u00a0\u202f]+(?=[:%])/g, '\u00a0');
    if (locale === 'es' || locale === 'de') return value.replace(/([0-9])[ \u00a0\u202f]*(?=%)/g, '$1\u00a0');
    return value;
  }
  if (Array.isArray(value)) return value.map(item => typography(item, locale));
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, typography(item, locale)]));
  return value;
}

export function reviewMemoryLocale(copy, manifest, locale) {
  const reviewed = interfaceCopy[locale];
  assert.ok(reviewed, `${locale}: no reviewed memory edition`);
  copy.summary = reviewed.summary;
  copy.landing.intro = reviewed.intro;
  copy.about.howToPlay.steps = [...reviewed.steps];
  copy.about.body = `${copy.summary}\n\n${reviewed.steps.join(' ')}\n\n${copy.about.disclaimer}`;
  copy.career.resultProgressLabel = reviewed.progress;
  for (const [i, stage] of manifest.structure.stages.entries()) {
    const words = copy.stages[stage.id];
    words.title = reviewed.stageTitles[i];
    const checkpoint = copy.career.stages[stage.id];
    checkpoint.difficulty = words.title.toLocaleUpperCase(locale);
    checkpoint.preAdTitle = reviewed.checkpointTitles[i];
    checkpoint.preAdCopy = i === 9 ? reviewed.finalCopy : reviewed.checkpointCopy;
    if (i < 9) checkpoint.next.tagline = reviewed.teasers[i];
    for (const [id, question] of Object.entries(words.questions)) {
      question.headerLabel = checkpoint.difficulty;
      const fix = questionCopy[locale]?.[id];
      if (fix?.question) question.question = fix.question;
      for (const [answerId, text] of Object.entries(fix?.answers ?? {})) {
        assert.ok(manifest.structure.questions[id].answerIds.includes(answerId), `${id}/${answerId}: unknown answer`);
        question.answers[answerId] = text;
      }
      if (locale === 'es') for (const [answerId, text] of Object.entries(question.answers)) {
        question.answers[answerId] = `${text[0].toLocaleUpperCase('es')}${text.slice(1)}`.replace(/\.$/, '');
      }
    }
  }
  for (const [i, [title, description]] of reviewed.profiles.entries()) Object.assign(copy.results.profiles[`profile-${i + 1}`], {title, copy: description});
  Object.assign(copy.results.score, reviewed.score ?? {});
  return typography(copy, locale);
}
