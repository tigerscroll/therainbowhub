// /memory keeps its URL and visual theme, but now tests general knowledge.
// Reuse reviewed, locale-adapted questions where possible. The two new rounds
// below are authored in every active language; no translation service is used.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {checkpointTitles, checkpointProfile} from './chapter-locales/checkpoints.mjs';
import {nativeNextTopic} from './chapter-locales/remaining-native.mjs';
import {applyEntryLabel} from './three-choice-entry.mjs';
import {reviewMemoryLocale, reviewedMemoryLocales} from './chapter-locales/memory-reviewed-locales.mjs';

const read = (slug, locale) => JSON.parse(fs.readFileSync(`data/quizzes/${slug}/${locale}.json`, 'utf8'));
const facts = {
  en: [
    'Which is the largest ocean on Earth?|Pacific Ocean|Atlantic Ocean|Indian Ocean',
    'On which continent is Japan?|Asia|Europe|Africa',
    'What is the capital of Australia?|Canberra|Sydney|Melbourne',
    'Which river flows through Cairo?|Nile|Amazon|Thames',
    'The Andes run along the western side of which continent?|South America|North America|Africa',
    'The Great Barrier Reef lies off the coast of which country?|Australia|Brazil|South Africa',
    'Rome is the capital of which country?|Italy|Greece|Spain',
    'Who painted the Mona Lisa?|Leonardo da Vinci|Vincent van Gogh|Pablo Picasso',
    'Who was the first person to walk on the Moon?|Neil Armstrong|Yuri Gagarin|Buzz Aldrin',
    'In which country are the pyramids of Giza?|Egypt|Mexico|Greece',
    'Who wrote Hamlet?|William Shakespeare|Charles Dickens|Jane Austen',
    'Who composed the Ninth Symphony featuring the Ode to Joy?|Ludwig van Beethoven|Wolfgang Amadeus Mozart|Johann Sebastian Bach',
    'Machu Picchu was built by which civilisation?|Inca|Ancient Egyptian|Viking',
    'Johannes Gutenberg is best known for developing which technology in 15th-century Europe?|Movable-type printing|The telephone|The steam engine',
  ],
  fr: [
    'Quel est le plus grand océan de la Terre ?|L’océan Pacifique|L’océan Atlantique|L’océan Indien',
    'Sur quel continent se trouve le Japon ?|L’Asie|L’Europe|L’Afrique',
    'Quelle est la capitale de l’Australie ?|Canberra|Sydney|Melbourne',
    'Quel fleuve traverse Le Caire ?|Le Nil|L’Amazone|La Tamise',
    'Les Andes longent la côte ouest de quel continent ?|L’Amérique du Sud|L’Amérique du Nord|L’Afrique',
    'Au large de quel pays se trouve la Grande Barrière de corail ?|L’Australie|Le Brésil|L’Afrique du Sud',
    'De quel pays Rome est-elle la capitale ?|L’Italie|La Grèce|L’Espagne',
    'Qui a peint La Joconde ?|Léonard de Vinci|Vincent van Gogh|Pablo Picasso',
    'Qui a été la première personne à marcher sur la Lune ?|Neil Armstrong|Youri Gagarine|Buzz Aldrin',
    'Dans quel pays se trouvent les pyramides de Gizeh ?|L’Égypte|Le Mexique|La Grèce',
    'Qui a écrit Hamlet ?|William Shakespeare|Charles Dickens|Jane Austen',
    'Qui a composé la Neuvième Symphonie, qui comprend l’Ode à la joie ?|Ludwig van Beethoven|Wolfgang Amadeus Mozart|Johann Sebastian Bach',
    'Quelle civilisation a construit le Machu Picchu ?|Les Incas|Les Égyptiens de l’Antiquité|Les Vikings',
    'Quelle technique Johannes Gutenberg a-t-il développée dans l’Europe du XVe siècle ?|L’imprimerie à caractères mobiles|Le téléphone|La machine à vapeur',
  ],
  de: [
    'Welcher ist der größte Ozean der Erde?|Pazifischer Ozean|Atlantischer Ozean|Indischer Ozean',
    'Auf welchem Kontinent liegt Japan?|Asien|Europa|Afrika',
    'Wie heißt die Hauptstadt Australiens?|Canberra|Sydney|Melbourne',
    'Welcher Fluss fließt durch Kairo?|Nil|Amazonas|Themse',
    'An der Westseite welches Kontinents verlaufen die Anden?|Südamerika|Nordamerika|Afrika',
    'Vor der Küste welches Landes liegt das Great Barrier Reef?|Australien|Brasilien|Südafrika',
    'Von welchem Land ist Rom die Hauptstadt?|Italien|Griechenland|Spanien',
    'Wer malte die Mona Lisa?|Leonardo da Vinci|Vincent van Gogh|Pablo Picasso',
    'Wer betrat als erster Mensch den Mond?|Neil Armstrong|Juri Gagarin|Buzz Aldrin',
    'In welchem Land stehen die Pyramiden von Gizeh?|Ägypten|Mexiko|Griechenland',
    'Wer schrieb Hamlet?|William Shakespeare|Charles Dickens|Jane Austen',
    'Wer komponierte die Neunte Sinfonie mit der Ode an die Freude?|Ludwig van Beethoven|Wolfgang Amadeus Mozart|Johann Sebastian Bach',
    'Welche Kultur errichtete Machu Picchu?|Die Inka|Die alten Ägypter|Die Wikinger',
    'Welche Technik entwickelte Johannes Gutenberg im Europa des 15. Jahrhunderts?|Buchdruck mit beweglichen Lettern|Das Telefon|Die Dampfmaschine',
  ],
  es: [
    '¿Cuál es el océano más grande de la Tierra?|Océano Pacífico|Océano Atlántico|Océano Índico',
    '¿En qué continente está Japón?|Asia|Europa|África',
    '¿Cuál es la capital de Australia?|Canberra|Sídney|Melbourne',
    '¿Qué río atraviesa El Cairo?|Nilo|Amazonas|Támesis',
    '¿Por el oeste de qué continente se extienden los Andes?|América del Sur|América del Norte|África',
    '¿Frente a las costas de qué país está la Gran Barrera de Coral?|Australia|Brasil|Sudáfrica',
    '¿De qué país es capital Roma?|Italia|Grecia|España',
    '¿Quién pintó la Mona Lisa?|Leonardo da Vinci|Vincent van Gogh|Pablo Picasso',
    '¿Quién fue la primera persona en caminar sobre la Luna?|Neil Armstrong|Yuri Gagarin|Buzz Aldrin',
    '¿En qué país están las pirámides de Guiza?|Egipto|México|Grecia',
    '¿Quién escribió Hamlet?|William Shakespeare|Charles Dickens|Jane Austen',
    '¿Quién compuso la Novena Sinfonía, que incluye el Himno a la Alegría?|Ludwig van Beethoven|Wolfgang Amadeus Mozart|Johann Sebastian Bach',
    '¿Qué civilización construyó Machu Picchu?|Inca|Egipcia antigua|Vikinga',
    '¿Qué tecnología desarrolló Johannes Gutenberg en la Europa del siglo XV?|La imprenta de tipos móviles|El teléfono|La máquina de vapor',
  ],
  it: [
    'Qual è l’oceano più grande della Terra?|Oceano Pacifico|Oceano Atlantico|Oceano Indiano',
    'In quale continente si trova il Giappone?|Asia|Europa|Africa',
    'Qual è la capitale dell’Australia?|Canberra|Sydney|Melbourne',
    'Quale fiume attraversa Il Cairo?|Nilo|Rio delle Amazzoni|Tamigi',
    'Lungo il lato occidentale di quale continente si estendono le Ande?|America del Sud|America del Nord|Africa',
    'Al largo di quale paese si trova la Grande Barriera Corallina?|Australia|Brasile|Sudafrica',
    'Di quale paese è capitale Roma?|Italia|Grecia|Spagna',
    'Chi ha dipinto la Gioconda?|Leonardo da Vinci|Vincent van Gogh|Pablo Picasso',
    'Chi è stata la prima persona a camminare sulla Luna?|Neil Armstrong|Jurij Gagarin|Buzz Aldrin',
    'In quale paese si trovano le piramidi di Giza?|Egitto|Messico|Grecia',
    'Chi ha scritto Amleto?|William Shakespeare|Charles Dickens|Jane Austen',
    'Chi ha composto la Nona Sinfonia, che comprende l’Inno alla gioia?|Ludwig van Beethoven|Wolfgang Amadeus Mozart|Johann Sebastian Bach',
    'Quale civiltà ha costruito Machu Picchu?|Inca|Antichi Egizi|Vichinghi',
    'Quale tecnologia sviluppò Johannes Gutenberg nell’Europa del XV secolo?|La stampa a caratteri mobili|Il telefono|La macchina a vapore',
  ],
  nl: [
    'Wat is de grootste oceaan op aarde?|Stille Oceaan|Atlantische Oceaan|Indische Oceaan',
    'Op welk continent ligt Japan?|Azië|Europa|Afrika',
    'Wat is de hoofdstad van Australië?|Canberra|Sydney|Melbourne',
    'Welke rivier stroomt door Caïro?|Nijl|Amazone|Theems',
    'Langs de westkant van welk continent liggen de Andes?|Zuid-Amerika|Noord-Amerika|Afrika',
    'Voor de kust van welk land ligt het Groot Barrièrerif?|Australië|Brazilië|Zuid-Afrika',
    'Van welk land is Rome de hoofdstad?|Italië|Griekenland|Spanje',
    'Wie schilderde de Mona Lisa?|Leonardo da Vinci|Vincent van Gogh|Pablo Picasso',
    'Wie was de eerste mens die op de maan liep?|Neil Armstrong|Joeri Gagarin|Buzz Aldrin',
    'In welk land staan de piramides van Gizeh?|Egypte|Mexico|Griekenland',
    'Wie schreef Hamlet?|William Shakespeare|Charles Dickens|Jane Austen',
    'Wie componeerde de Negende symfonie met de Ode an die Freude?|Ludwig van Beethoven|Wolfgang Amadeus Mozart|Johann Sebastian Bach',
    'Welke beschaving bouwde Machu Picchu?|De Inca’s|De oude Egyptenaren|De Vikingen',
    'Welke techniek ontwikkelde Johannes Gutenberg in het Europa van de vijftiende eeuw?|Boekdruk met losse letters|De telefoon|De stoommachine',
  ],
  pt: [
    'Qual é o maior oceano da Terra?|Oceano Pacífico|Oceano Atlântico|Oceano Índico',
    'Em que continente fica o Japão?|Ásia|Europa|África',
    'Qual é a capital da Austrália?|Camberra|Sydney|Melbourne',
    'Que rio atravessa o Cairo?|Nilo|Amazonas|Tamisa (Tâmisa)',
    'Os Andes estendem-se pelo lado ocidental de que continente?|América do Sul|América do Norte|África',
    'Ao largo de que país fica a Grande Barreira de Coral?|Austrália|Brasil|África do Sul',
    'Roma é a capital de que país?|Itália|Grécia|Espanha',
    'Quem pintou a Mona Lisa?|Leonardo da Vinci|Vincent van Gogh|Pablo Picasso',
    'Quem foi a primeira pessoa a caminhar na Lua?|Neil Armstrong|Yuri Gagarin|Buzz Aldrin',
    'Em que país ficam as pirâmides de Gizé?|Egito|México|Grécia',
    'Quem escreveu Hamlet?|William Shakespeare|Charles Dickens|Jane Austen',
    'Quem compôs a Nona Sinfonia, que inclui a Ode à Alegria?|Ludwig van Beethoven|Wolfgang Amadeus Mozart|Johann Sebastian Bach',
    'Que civilização construiu Machu Picchu?|Inca|Egípcia antiga|Viking',
    'Que tecnologia desenvolveu Johannes Gutenberg na Europa do século XV?|A impressão com tipos móveis|O telefone|A máquina a vapor',
  ],
  ar: [
    'ما أكبر محيط على الأرض؟|المحيط الهادئ|المحيط الأطلسي|المحيط الهندي',
    'في أي قارة تقع اليابان؟|آسيا|أوروبا|أفريقيا',
    'ما عاصمة أستراليا؟|كانبرا|سيدني|ملبورن',
    'أي نهر يمر عبر القاهرة؟|النيل|الأمازون|التايمز',
    'تمتد جبال الأنديز على الجانب الغربي من أي قارة؟|أمريكا الجنوبية|أمريكا الشمالية|أفريقيا',
    'قبالة سواحل أي دولة يقع الحاجز المرجاني العظيم؟|أستراليا|البرازيل|جنوب أفريقيا',
    'روما عاصمة أي دولة؟|إيطاليا|اليونان|إسبانيا',
    'من رسم لوحة الموناليزا؟|ليوناردو دا فينشي|فنسنت فان غوخ|بابلو بيكاسو',
    'من أول إنسان مشى على سطح القمر؟|نيل آرمسترونغ|يوري غاغارين|باز ألدرين',
    'في أي دولة تقع أهرامات الجيزة؟|مصر|المكسيك|اليونان',
    'من كتب مسرحية هاملت؟|ويليام شكسبير|تشارلز ديكنز|جين أوستن',
    'من ألّف السيمفونية التاسعة التي تتضمن نشيد الفرح؟|لودفيغ فان بيتهوفن|فولفغانغ أماديوس موزارت|يوهان سباستيان باخ',
    'أي حضارة بنت ماتشو بيتشو؟|الإنكا|المصريون القدماء|الفايكنغ',
    'ما التقنية التي طوّرها يوهانس غوتنبرغ في أوروبا خلال القرن الخامس عشر؟|الطباعة بالحروف المتحركة|الهاتف|المحرك البخاري',
  ],
};

// Fields: headline, eyebrow, intro, summary, disclaimer, three result dimensions,
// two new chapter titles, result name. Reuse the existing localized instructions,
// generic profile descriptions and shared rewarded UI rather than retranslating.
const interfaceCopy = {
  en: ['Most Adults Can’t Score 80% On This Test', 'General Knowledge Challenge', "Think you're smart? Put it to the test.", 'Explore science, geography, history, food, words and everyday reasoning. Can you reach 80%?', 'For entertainment and general learning only. This quiz is not a formal intelligence or educational assessment.', ['World & culture', 'Science & the body', 'Words & numbers'], ['Around the World', 'History & Culture'], 'YOUR QUIZ RESULTS'],
  fr: ['La plupart des adultes n’atteignent pas 80 % à ce test', 'Défi de culture générale', 'Vous pensez avoir l’esprit vif ? Mettez-vous à l’épreuve.', 'Sciences, géographie, histoire, cuisine, mots et logique : atteindrez-vous 80 % ?', 'Pour le divertissement et la culture générale uniquement. Ce quiz n’est pas une évaluation officielle de l’intelligence ou des connaissances scolaires.', ['Monde et culture', 'Sciences et corps humain', 'Mots et nombres'], ['Autour du monde', 'Histoire et culture'], 'VOS RÉSULTATS'],
  de: ['Die meisten Erwachsenen schaffen bei diesem Test keine 80 %', 'Allgemeinwissen-Challenge', 'Du hältst dich für schlau? Stell dich auf die Probe.', 'Wissenschaft, Geografie, Geschichte, Essen, Sprache und logisches Denken: Schaffst du 80 %?', 'Nur zur Unterhaltung und zum allgemeinen Lernen. Dieses Quiz ist kein formeller Intelligenz- oder Bildungstest.', ['Welt und Kultur', 'Wissenschaft und Körper', 'Wörter und Zahlen'], ['Rund um die Welt', 'Geschichte und Kultur'], 'DEIN QUIZERGEBNIS'],
  es: ['La mayoría de los adultos no llega al 80% en este test', 'Reto de cultura general', '¿Crees que eres inteligente? Ponte a prueba.', 'Ciencia, geografía, historia, comida, palabras y lógica: ¿llegarás al 80%?', 'Solo para entretenimiento y cultura general. Este cuestionario no es una evaluación formal de inteligencia ni de conocimientos académicos.', ['Mundo y cultura', 'Ciencia y cuerpo humano', 'Palabras y números'], ['La vuelta al mundo', 'Historia y cultura'], 'TUS RESULTADOS'],
  it: ['La maggior parte degli adulti non raggiunge l’80% in questo test', 'Sfida di cultura generale', 'Pensi di essere una mente brillante? Mettiti alla prova.', 'Scienza, geografia, storia, cucina, parole e logica: riuscirai a raggiungere l’80%?', 'Solo per intrattenimento e cultura generale. Questo quiz non è una valutazione formale dell’intelligenza o delle competenze scolastiche.', ['Mondo e cultura', 'Scienza e corpo umano', 'Parole e numeri'], ['Intorno al mondo', 'Storia e cultura'], 'I TUOI RISULTATI'],
  nl: ['De meeste volwassenen halen geen 80% op deze test', 'Algemene kennisquiz', 'Denk je dat je slim bent? Stel jezelf op de proef.', 'Wetenschap, aardrijkskunde, geschiedenis, eten, woorden en logisch denken: haal jij 80%?', 'Alleen voor vermaak en algemene kennis. Deze quiz is geen formele intelligentietest of onderwijstoets.', ['Wereld en cultuur', 'Wetenschap en het lichaam', 'Woorden en getallen'], ['Rond de wereld', 'Geschiedenis en cultuur'], 'JOUW QUIZRESULTATEN'],
  pt: ['A maioria dos adultos não atinge 80% neste teste', 'Desafio de cultura geral', 'Acha que tem uma mente brilhante? Ponha-se à prova.', 'Ciência, geografia, história, comida, palavras e lógica: consegue atingir 80%?', 'Apenas para entretenimento e cultura geral. Este teste não é uma avaliação formal da inteligência nem dos conhecimentos escolares.', ['Mundo e cultura', 'Ciência e corpo humano', 'Palavras e números'], ['À volta do mundo', 'História e cultura'], 'O SEU RESULTADO'],
  ar: ['معظم البالغين لا يحققون 80٪ في هذا الاختبار', 'تحدي المعلومات العامة', 'تعتقد أنك ذكي؟ اختبر نفسك.', 'علوم وجغرافيا وتاريخ وطعام وكلمات ومنطق. هل تستطيع تحقيق 80٪؟', 'للترفيه والمعرفة العامة فقط. هذا الاختبار ليس تقييمًا رسميًا للذكاء أو للتحصيل الدراسي.', ['العالم والثقافة', 'العلوم وجسم الإنسان', 'الكلمات والأرقام'], ['حول العالم', 'التاريخ والثقافة'], 'نتيجتك في الاختبار'],
};
const rounds = [
  ['challenge', 1, [1, 3, 4, 5, 6, 7, 8], 'world'],
  ['anatomy', 1, null, 'science'],
  ['italian', 1, null, 'world'],
  [null, 0, null, 'world'],
  ['medical', 2, null, 'science'],
  [null, 7, null, 'world'],
  ['airforce', 1, null, 'science'],
  ['iq', 3, null, 'reasoning'],
  ['cambridge', 2, null, 'reasoning'],
  ['challenge', 10, [1, 2, 3, 4, 5, 6, 8], 'reasoning'],
];

export function buildMemoryGeneralKnowledge() {
  const manifest = read('memory', 'quiz');
  const copies = {};
  const bank = [];
  manifest.structure.stages = [];
  manifest.structure.questions = {};
  manifest.structure.results.dimensions = ['world', 'science', 'reasoning'].map((category, i) => ({key: `dimension-${i + 1}`, categories: [category]}));
  manifest.template = 'ten-stage-seven-question-v1';
  const stagesByLocale = {};
  for (const locale of manifest.activeLocales) {
    assert.ok(interfaceCopy[locale] && facts[locale]?.length === 14);
    const old = read('memory', locale), shared = read('harvard', locale);
    const [title, eyebrow, intro, summary, disclaimer, dimensions, , resultName] = interfaceCopy[locale];
    // Generic instructions explicitly describe checkpoints and optional review.
    const steps = locale === 'de' ? [
      'Lies die Frage und wähle eine Antwort.',
      'Sieh dir nach jedem Thema dein Profil an und entdecke die nächste Herausforderung.',
      'Entdecke dein Gesamtergebnis und sieh dir auf Wunsch die richtigen Antworten an.',
    ] : shared.about.howToPlay.steps;
    const copy = { ...old, title, eyebrow, summary,
      about: {body: `${summary}\n\n${steps.join(' ')}\n\n${disclaimer}`, howToPlay: {steps: [...steps]}, disclaimer},
      landing: {intro, cta: old.landing.cta},
      career: {resultProgressLabel: shared.career.resultProgressLabel, stages: {}},
      results: structuredClone(shared.results), stages: {},
    };
    copy.results.name = resultName;
    copy.results.dimensions = Object.fromEntries(dimensions.map((label, i) => [`dimension-${i + 1}`, {label}]));
      // Generic localized score labels come from the existing reasoning quiz.
    const generic = read('iq', locale);
    for (const key of Object.keys(copy.results.profiles)) {
      copy.results.profiles[key].title = profileTitles[locale][Number(key.split('-')[1]) - 1];
    }
    copy.results.score = structuredClone(old.results.score);
    copy.results.score.passed = passLabels[locale];
    copy.results.score.finished = resultName;
    copy.results.score.strongest = generic.results.score.strongest;
    copy.results.score.trickiest = generic.results.score.trickiest;
    if (locale === 'en') {
      copy.results.score.strongest = 'Your strongest topic area';
      copy.results.score.trickiest = 'Your trickiest topic area';
    }
    copy.results.score.disclaimer = disclaimer;
    copy.results.score.insights.breakdown = resultName;
    delete copy.results.share;
    copies[locale] = copy;
    stagesByLocale[locale] = rounds.map(([source, stage, qs], index) => {
      if (!source) return {title: interfaceCopy[locale][6][index === 3 ? 0 : 1]};
      // Challenge is English-only. Its short factual questions are supplied below
      // in all languages rather than silently falling back to English.
      const sourceLocale = source === 'challenge' ? 'en' : locale;
      const sourceCopy = read(source, sourceLocale);
      return {title: source === 'challenge' ? mixedTitles[locale][index === 0 ? 0 : 1] : sourceCopy.stages[`stage-${stage}`].title, sourceCopy};
    });
  }
  for (const [index, [source, number, selected, category]] of rounds.entries()) {
    const stageId = `stage-${index + 1}`;
    const stage = {id: stageId, difficultyLevel: ['foundation','foundation','developing','developing','skilled','skilled','advanced','advanced','advanced','final'][index], questionIds: []};
    manifest.structure.stages.push(stage);
    const sourceManifest = source ? read(source, 'quiz') : undefined;
    const sourceIds = source ? selected?.map(q => `${source}-s${number}q${q}`) ?? sourceManifest.structure.stages[number - 1].questionIds : Array.from({length: 7}, (_, i) => i + number);
    assert.equal(sourceIds.length, 7);
    for (const locale of manifest.activeLocales) {
      const {title} = stagesByLocale[locale][index];
      copies[locale].stages[stageId] = {title, questions: {}};
    }
    for (const [qi, sourceId] of sourceIds.entries()) {
      const id = `memory-gk-s${index + 1}q${qi + 1}`;
      stage.questionIds.push(id);
      const ordinal = index * 7 + qi;
  // Balanced but non-cycling answer positions: 24 A, 23 B, 23 C.
      const position = answerPositions[ordinal];
      manifest.structure.questions[id] = {presentation: 'text', answerIds: ['a1','a2','a3'], correctAnswerId: `a${position + 1}`, category};
      for (const locale of manifest.activeLocales) {
        let prompt, correct, wrong;
        if (!source) {
          [prompt, correct, ...wrong] = facts[locale][sourceId].split('|');
        } else if (source === 'challenge') {
          [prompt, correct, ...wrong] = quickAndFinal[locale][index === 0 ? qi : qi + 7].split('|');
        } else {
          const words = stagesByLocale[locale][index].sourceCopy.stages[`stage-${number}`].questions[sourceId];
          const logic = sourceManifest.structure.questions[sourceId];
          prompt = words.question;
          correct = words.answers[logic.correctAnswerId];
          wrong = logic.answerIds.filter(a => a !== logic.correctAnswerId).slice(0, 2).map(a => words.answers[a]);
        }
        const answers = [...wrong];
        answers.splice(position, 0, correct);
        assert.equal(new Set(answers).size, 3, `${locale}/${id}`);
        const title = copies[locale].stages[stageId].title;
        copies[locale].stages[stageId].questions[id] = {question: prompt, headerLabel: title.toLocaleUpperCase(locale), answers: Object.fromEntries(answers.map((answer, i) => [`a${i + 1}`, answer]))};
        if (locale === 'en') bank.push({id, source: source && source !== 'challenge' ? `${source}/${sourceId}` : 'Authored general-knowledge question', correct});
      }
    }
  }
  for (const [locale, copy] of Object.entries(copies)) {
    const shared = read('harvard', locale);
    for (const [index, stage] of manifest.structure.stages.entries()) {
      const title = copy.stages[stage.id].title;
      const final = index === 9;
      const nextTitle = copy.stages[manifest.structure.stages[Math.min(index + 1, 9)].id].title;
      copy.career.stages[stage.id] = {
        difficulty: title.toLocaleUpperCase(locale),
        preAdTitle: locale === 'en' ? final ? 'Your result is ready' : `${title}: answers recorded` : checkpointTitles[locale][index],
        preAdCopy: final ? shared.career.stages['stage-10'].preAdCopy : locale === 'en' ? 'This topic: {profile}.' : checkpointProfile[locale](),
        preAdButton: final ? shared.career.stages['stage-10'].preAdButton : shared.career.stages['stage-1'].preAdButton,
        ...(final ? {preAdChecks: shared.career.stages['stage-10'].preAdChecks} : {next: {eyebrow: shared.career.stages['stage-1'].next.eyebrow, tagline: locale === 'en' ? `Next: ${nextTitle}. How much will you know?` : nativeNextTopic(locale, nextTitle, index)}}),
      };
    }
  }
  for (const locale of reviewedMemoryLocales) if (copies[locale]) copies[locale] = reviewMemoryLocale(copies[locale], manifest, locale);
  applyEntryLabel(manifest, copies);
  return {manifest, copies, bank};
}

// A deterministic shuffle is used once at authoring time, not at runtime.
let seed = 728031;
const answerPositions = Array.from({length: 70}, (_, i) => i < 24 ? 0 : i < 47 ? 1 : 2);
for (let i = answerPositions.length - 1; i > 0; i--) {
  seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  const j = Math.floor(seed / 4294967296 * (i + 1));
  [answerPositions[i], answerPositions[j]] = [answerPositions[j], answerPositions[i]];
}

// Two mixed rounds have locale-native equivalents instead of English wordplay.
const quickAndFinal = {
  en: [
    'Which planet is commonly known as the Red Planet?|Mars|Venus|Jupiter',
    'Which direction is opposite to north?|South|East|West',
    'Which of these animals is a mammal?|Dolphin|Shark|Octopus',
    'What time is 15 minutes after 2:30?|2:45|2:35|3:15',
    'Which of these is frozen water?|Ice|Steam|Rain',
    'How many days are in one week?|7|5|6',
    'Which letter comes immediately after Q in the English alphabet?|R|P|S',
    'At exactly 3:00, what is the smaller angle between the clock hands?|90 degrees|45 degrees|60 degrees',
    'You pass the person in second place during a race. What place are you now in?|Second|First|Third',
    'Which number is NOT a perfect square?|45|16|25',
    'If A = 1, B = 2 and C = 3, what is the total value of CAB?|6|4|5',
    'Which statement is always true?|A square has four sides|Every bird can fly|Every month has 31 days',
    'A farmer has 17 sheep. All but 9 wander away. How many remain?|9|8|17',
    'What is the capital of Canada?|Ottawa|Toronto|Vancouver',
  ],
  fr: [
    'Quelle planète est surnommée la planète rouge ?|Mars|Vénus|Jupiter',
    'Quelle direction est opposée au nord ?|Le sud|L’est|L’ouest',
    'Lequel de ces animaux est un mammifère ?|Le dauphin|Le requin|La pieuvre',
    'Quelle heure est-il 15 minutes après 2 h 30 ?|2 h 45|2 h 35|3 h 15',
    'Lequel de ces éléments est de l’eau gelée ?|La glace|La vapeur|La pluie',
    'Combien de jours compte une semaine ?|7|5|6',
    'Quelle lettre vient juste après Q dans l’alphabet anglais ?|R|P|S',
    'À 3 h précises, quel est le plus petit angle entre les aiguilles ?|90 degrés|45 degrés|60 degrés',
    'Vous dépassez la personne en deuxième position dans une course. Quelle place occupez-vous alors ?|La deuxième|La première|La troisième',
    'Quel nombre n’est PAS un carré parfait ?|45|16|25',
    'Si A = 1, B = 2 et C = 3, quelle est la somme des valeurs de CAB ?|6|4|5',
    'Quelle affirmation est toujours vraie ?|Un carré a quatre côtés|Tous les oiseaux peuvent voler|Tous les mois ont 31 jours',
    'Un berger a 17 moutons. Tous s’éloignent sauf 9. Combien en reste-t-il ?|9|8|17',
    'Quelle est la capitale du Canada ?|Ottawa|Toronto|Vancouver',
  ],
  de: [
    'Welcher Planet wird auch der Rote Planet genannt?|Mars|Venus|Jupiter',
    'Welche Himmelsrichtung liegt Norden gegenüber?|Süden|Osten|Westen',
    'Welches dieser Tiere ist ein Säugetier?|Delfin|Hai|Oktopus',
    'Wie spät ist es 15 Minuten nach 2:30 Uhr?|2:45 Uhr|2:35 Uhr|3:15 Uhr',
    'Was davon ist gefrorenes Wasser?|Eis|Dampf|Regen',
    'Wie viele Tage hat eine Woche?|7|5|6',
    'Welcher Buchstabe folgt im englischen Alphabet direkt auf Q?|R|P|S',
    'Wie groß ist um genau 3:00 Uhr der kleinere Winkel zwischen den Uhrzeigern?|90 Grad|45 Grad|60 Grad',
    'Du überholst in einem Rennen die Person auf Platz zwei. Auf welchem Platz bist du jetzt?|Auf Platz zwei|Auf Platz eins|Auf Platz drei',
    'Welche Zahl ist KEINE Quadratzahl?|45|16|25',
    'Wenn A = 1, B = 2 und C = 3 ist, wie groß ist die Summe der Werte von CAB?|6|4|5',
    'Welche Aussage ist immer richtig?|Ein Quadrat hat vier Seiten|Jeder Vogel kann fliegen|Jeder Monat hat 31 Tage',
    'Ein Bauer hat 17 Schafe. Alle bis auf 9 laufen weg. Wie viele bleiben übrig?|9|8|17',
    'Wie heißt die Hauptstadt Kanadas?|Ottawa|Toronto|Vancouver',
  ],
  es: [
    '¿Qué planeta se conoce como el planeta rojo?|Marte|Venus|Júpiter',
    '¿Qué dirección es opuesta al norte?|Sur|Este|Oeste',
    '¿Cuál de estos animales es un mamífero?|Delfín|Tiburón|Pulpo',
    '¿Qué hora es 15 minutos después de las 2:30?|2:45|2:35|3:15',
    '¿Cuál de estas opciones es agua congelada?|Hielo|Vapor|Lluvia',
    '¿Cuántos días tiene una semana?|7|5|6',
    '¿Qué letra va justo después de la Q en el alfabeto inglés?|R|P|S',
    'A las 3:00 en punto, ¿cuál es el ángulo menor entre las agujas del reloj?|90 grados|45 grados|60 grados',
    'Adelantas a la persona que va segunda en una carrera. ¿En qué posición estás ahora?|Segunda|Primera|Tercera',
    '¿Qué número NO es un cuadrado perfecto?|45|16|25',
    'Si A = 1, B = 2 y C = 3, ¿cuánto suman los valores de CAB?|6|4|5',
    '¿Qué afirmación es siempre cierta?|Un cuadrado tiene cuatro lados|Todas las aves pueden volar|Todos los meses tienen 31 días',
    'Un granjero tiene 17 ovejas. Se alejan todas menos 9. ¿Cuántas quedan?|9|8|17',
    '¿Cuál es la capital de Canadá?|Ottawa|Toronto|Vancouver',
  ],
  it: [
    'Quale pianeta è conosciuto come il pianeta rosso?|Marte|Venere|Giove',
    'Quale direzione è opposta al nord?|Sud|Est|Ovest',
    'Quale di questi animali è un mammifero?|Delfino|Squalo|Polpo',
    'Che ore sono 15 minuti dopo le 2:30?|2:45|2:35|3:15',
    'Quale di queste è acqua congelata?|Ghiaccio|Vapore|Pioggia',
    'Quanti giorni ci sono in una settimana?|7|5|6',
    'Quale lettera viene subito dopo la Q nell’alfabeto inglese?|R|P|S',
    'Alle 3:00 in punto, qual è l’angolo più piccolo tra le lancette?|90 gradi|45 gradi|60 gradi',
    'Durante una gara superi la persona al secondo posto. In che posizione sei ora?|Al secondo posto|Al primo posto|Al terzo posto',
    'Quale numero NON è un quadrato perfetto?|45|16|25',
    'Se A = 1, B = 2 e C = 3, qual è la somma dei valori di CAB?|6|4|5',
    'Quale affermazione è sempre vera?|Un quadrato ha quattro lati|Tutti gli uccelli possono volare|Tutti i mesi hanno 31 giorni',
    'Un contadino ha 17 pecore. Si allontanano tutte tranne 9. Quante ne rimangono?|9|8|17',
    'Qual è la capitale del Canada?|Ottawa|Toronto|Vancouver',
  ],
  nl: [
    'Welke planeet staat bekend als de rode planeet?|Mars|Venus|Jupiter',
    'Welke richting ligt tegenover het noorden?|Zuid|Oost|West',
    'Welk van deze dieren is een zoogdier?|Dolfijn|Haai|Octopus',
    'Hoe laat is het 15 minuten na 2:30 uur?|2:45 uur|2:35 uur|3:15 uur',
    'Wat hiervan is bevroren water?|IJs|Stoom|Regen',
    'Hoeveel dagen heeft een week?|7|5|6',
    'Welke letter komt direct na de Q in het Engelse alfabet?|R|P|S',
    'Hoe groot is om precies 3:00 uur de kleinste hoek tussen de wijzers?|90 graden|45 graden|60 graden',
    'Je haalt tijdens een race de persoon op de tweede plaats in. Op welke plaats sta je nu?|Tweede|Eerste|Derde',
    'Welk getal is GEEN kwadraat van een geheel getal?|45|16|25',
    'Als A = 1, B = 2 en C = 3, wat is dan de som van de waarden van CAB?|6|4|5',
    'Welke uitspraak is altijd waar?|Een vierkant heeft vier zijden|Elke vogel kan vliegen|Elke maand heeft 31 dagen',
    'Een boer heeft 17 schapen. Alle schapen op 9 na lopen weg. Hoeveel blijven er over?|9|8|17',
    'Wat is de hoofdstad van Canada?|Ottawa|Toronto|Vancouver',
  ],
  pt: [
    'Que planeta é conhecido como o planeta vermelho?|Marte|Vénus (Vênus)|Júpiter',
    'Que direção é oposta ao norte?|Sul|Este|Oeste',
    'Qual destes animais é um mamífero?|Golfinho|Tubarão|Polvo',
    'Que horas são 15 minutos depois das 2:30?|2:45|2:35|3:15',
    'Qual destas opções é água congelada?|Gelo|Vapor|Chuva',
    'Quantos dias tem uma semana?|7|5|6',
    'Que letra vem imediatamente depois do Q no alfabeto inglês?|R|P|S',
    'Às 3:00 em ponto, qual é o menor ângulo entre os ponteiros do relógio?|90 graus|45 graus|60 graus',
    'Numa corrida, ultrapassa a pessoa que está em segundo lugar. Em que posição fica?|Segundo lugar|Primeiro lugar|Terceiro lugar',
    'Que número NÃO é um quadrado perfeito?|45|16|25',
    'Se A = 1, B = 2 e C = 3, qual é a soma dos valores de CAB?|6|4|5',
    'Que afirmação é sempre verdadeira?|Um quadrado tem quatro lados|Todas as aves conseguem voar|Todos os meses têm 31 dias',
    'Uma pessoa tem 17 ovelhas. Todas se afastam, exceto 9. Quantas ficam?|9|8|17',
    'Qual é a capital do Canadá?|Otava|Toronto|Vancouver',
  ],
  ar: [
    'أي كوكب يُعرف بالكوكب الأحمر؟|المريخ|الزهرة|المشتري',
    'ما الاتجاه المعاكس للشمال؟|الجنوب|الشرق|الغرب',
    'أي هذه الحيوانات من الثدييات؟|الدلفين|القرش|الأخطبوط',
    'كم تصبح الساعة بعد مرور 15 دقيقة على 2:30؟|2:45|2:35|3:15',
    'أي هذه الخيارات ماء متجمد؟|الجليد|البخار|المطر',
    'كم يومًا في الأسبوع؟|7|5|6',
    'أي حرف يأتي مباشرة بعد Q في الأبجدية الإنجليزية؟|R|P|S',
    'عند الساعة 3:00 تمامًا، ما قياس الزاوية الأصغر بين عقربي الساعة؟|90 درجة|45 درجة|60 درجة',
    'تتجاوز الشخص الذي يحتل المركز الثاني في سباق. ما مركزك الآن؟|الثاني|الأول|الثالث',
    'أي عدد ليس مربعًا كاملًا؟|45|16|25',
    'إذا كانت A = 1 وB = 2 وC = 3، فما مجموع قيم حروف CAB؟|6|4|5',
    'أي عبارة صحيحة دائمًا؟|للمربع أربعة أضلاع|كل الطيور تستطيع الطيران|كل الأشهر فيها 31 يومًا',
    'لدى مزارع 17 خروفًا. ابتعدت كلها ما عدا 9. كم بقي؟|9|8|17',
    'ما عاصمة كندا؟|أوتاوا|تورونتو|فانكوفر',
  ],
};
const mixedTitles = {
  en: ['Quick Start', 'The Final Mix'], fr: ['Pour commencer', 'Le défi final'], de: ['Zum Einstieg', 'Die letzte Mischung'],
  es: ['Para empezar', 'El reto final'], it: ['Per cominciare', 'La sfida finale'], nl: ['Even opwarmen', 'De laatste mix'],
  pt: ['Para começar', 'O desafio final'], ar: ['البداية', 'التحدي الأخير'],
};
const profileTitles = {
  en: ['Quiz Master', 'All-Round Ace', 'Sharp Contender', 'Finding Your Rhythm', 'Curious Challenger', 'A Fresh Starting Point'],
  fr: ['Maître du quiz', 'À l’aise sur tous les terrains', 'Un esprit affûté', 'Le rythme se trouve', 'Une belle curiosité', 'Un nouveau point de départ'],
  de: ['Quiz-Profi', 'Vielseitiges Wissen', 'Gut kombiniert', 'Du findest deinen Rhythmus', 'Neugierig unterwegs', 'Ein neuer Anfang'],
  es: ['Dominio del quiz', 'Talento en muchos temas', 'Una mente despierta', 'Encontrando el ritmo', 'Curiosidad en marcha', 'Un nuevo punto de partida'],
  it: ['Maestria nel quiz', 'Talento a tutto campo', 'Una mente attenta', 'Il ritmo prende forma', 'Curiosità in gioco', 'Un nuovo punto di partenza'],
  nl: ['Quizmeester', 'Van alle markten thuis', 'Een scherpe blik', 'Je vindt je ritme', 'Nieuwsgierig op pad', 'Een nieuw begin'],
  pt: ['Domínio do desafio', 'Conhecimentos de destaque', 'Bom raciocínio', 'A ganhar ritmo', 'Curiosidade em ação', 'Um novo ponto de partida'],
  ar: ['خبير الاختبار', 'معرفة في مجالات متنوعة', 'ذهن متيقظ', 'بدأت تجد إيقاعك', 'فضول يدفعك للتحدي', 'نقطة انطلاق جديدة'],
};
const passLabels = {
  en: 'You reached the 80% target!', fr: 'Vous avez atteint l’objectif de 80 % !', de: 'Du hast die 80-%-Marke erreicht!',
  es: '¡Has alcanzado el objetivo del 80%!', it: 'Hai raggiunto l’obiettivo dell’80%!', nl: 'Je hebt de 80% gehaald!',
  pt: 'Atingiu a meta de 80%!', ar: 'حققت هدف 80٪!',
};

if (process.argv[1]?.endsWith('/memory-general-knowledge.mjs')) {
  const {manifest, copies, bank} = buildMemoryGeneralKnowledge();
  for (const [locale, copy] of Object.entries(copies)) fs.writeFileSync(`data/quizzes/memory/${locale}.json`, JSON.stringify(copy, null, 2) + '\n');
  fs.writeFileSync('data/quizzes/memory/quiz.json', JSON.stringify(manifest, null, 2) + '\n');
  fs.writeFileSync('data/quizzes/memory/ANSWER_KEY.md', '# General knowledge at /memory\n\n10 stages × 7 questions; 80% is 56/70. Three choices per question, balanced correct positions. Rebuild with `node scripts/memory-general-knowledge.mjs`. The URL and visual theme are retained; this is no longer a memory assessment. Existing translations are reused where suitable, including native-language equivalents for word relationships.\n\n| Question | Correct answer | Provenance |\n| --- | --- | --- |\n' + bank.map(q => `| ${q.id} | ${q.correct} | ${q.source} |`).join('\n') + '\n');
  console.log(`Memory: 10 × 7 general-knowledge questions in ${Object.keys(copies).length} languages.`);
}

