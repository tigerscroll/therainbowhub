// Local adaptations of the playful result: avoid literal translations of
// "long game", "living for the plot", "wildcard" and "clock personality".
const about = {
  fr: 'Découvre ce que tes habitudes racontent de toi. Choisis ce que tu fais vraiment : chaque étape donne un aperçu du profil qui ressort de tes réponses. Le résultat final associe ce profil à un âge estimé pour le plaisir.\n\nUne courte publicité avec récompense ouvre le quiz. Une autre est proposée à chaque étape pour continuer ou voir le résultat. Le détail facultatif des réponses a sa propre publicité. Ta progression est enregistrée sur cet appareil.\n\nCet âge est un score de jeu, pas une prévision. Le quiz n’utilise ni ton âge actuel, ni ton dossier médical, ni tes antécédents familiaux, ni une évaluation individuelle des risques. Ton dernier choix peut modifier l’âge affiché d’un an au maximum.',
  de: 'Entdecke, was deine Gewohnheiten über deinen Alltag verraten. Wähle, was du tatsächlich tust. Nach jedem Thema siehst du, welcher Typ sich in deinen Antworten zeigt. Das Endergebnis verbindet dein Profil mit einer spielerischen Altersschätzung.\n\nEine kurze Werbung mit Belohnung öffnet das Quiz. Nach jedem Thema wird eine weitere angeboten, um fortzufahren oder das Ergebnis zu sehen. Die freiwillige Antwortauswertung hat eine eigene Werbung. Dein Fortschritt wird auf diesem Gerät gespeichert.\n\nDas Alter ist ein Spielwert, keine Vorhersage. Das Quiz nutzt weder dein tatsächliches Alter noch medizinische Unterlagen, Familiengeschichte oder eine individuelle Risikobewertung. Deine letzte Wahl kann die Anzeige höchstens um ein Jahr verändern.',
  it: 'Scopri che cosa raccontano di te le abitudini quotidiane. Scegli ciò che fai davvero: dopo ogni tema vedrai un’anteprima del profilo che emerge dalle risposte. Il risultato finale unisce quel profilo a una stima dell’età, solo per gioco.\n\nUn breve annuncio con ricompensa apre il quiz. Un altro viene proposto a ogni passaggio per continuare o vedere il risultato. Il dettaglio facoltativo delle risposte ha un annuncio separato. I progressi vengono salvati su questo dispositivo.\n\nL’età è un punteggio di gioco, non una previsione. Il quiz non usa l’età reale, dati clinici, storia familiare o una valutazione individuale del rischio. L’ultima scelta può modificare l’età mostrata di un anno al massimo.',
  nl: 'Ontdek wat je gewoontes over je dagelijkse stijl vertellen. Kies wat je echt doet. Na elk onderwerp zie je welk profiel in je antwoorden naar voren komt. Het eindresultaat combineert dat profiel met een leeftijdsschatting, gewoon voor de lol.\n\nEen korte advertentie met beloning opent de quiz. Na elk onderwerp wordt er nog een aangeboden om verder te gaan of het resultaat te zien. Het optionele antwoordoverzicht heeft een eigen advertentie. Je voortgang wordt op dit apparaat opgeslagen.\n\nDe leeftijd is een spelscore, geen voorspelling. De quiz gebruikt je echte leeftijd, medische gegevens, familiegeschiedenis of een persoonlijke risicoanalyse niet. Je laatste keuze kan de getoonde leeftijd hoogstens één jaar veranderen.',
  es: 'Descubre qué cuentan de ti tus hábitos cotidianos. Elige lo que haces de verdad: después de cada tema verás un avance del perfil que reflejan tus respuestas. El resultado final combina ese perfil con una edad estimada, solo por diversión.\n\nUn anuncio breve con recompensa abre el test. En cada pausa se ofrece otro para continuar o ver el resultado. El análisis opcional de respuestas tiene su propio anuncio. El progreso se guarda en este dispositivo.\n\nLa edad es una puntuación de juego, no una predicción. El test no usa tu edad real, datos médicos, antecedentes familiares ni una evaluación individual del riesgo. La última elección puede cambiar la edad mostrada en un año como máximo.',
  pt: 'Descubra o que os hábitos do dia a dia revelam sobre o seu estilo. Escolha o que realmente faz. Depois de cada tema, aparece uma indicação do perfil que se destaca nas respostas. O resultado final reúne esse perfil e uma estimativa de idade, apenas por diversão.\n\nUm anúncio curto com recompensa abre o teste. Em cada pausa, outro anúncio permite continuar ou ver o resultado. A análise opcional das respostas tem um anúncio próprio. O progresso fica guardado neste dispositivo.\n\nA idade é uma pontuação de jogo, não uma previsão. O teste não utiliza a idade real, dados médicos, antecedentes familiares ou uma avaliação individual de risco. A última escolha pode alterar a idade apresentada em, no máximo, um ano.',
  ar: 'اكتشف ما تعكسه عاداتك اليومية عن أسلوبك في الحياة. اختر ما تفعله فعلًا. بعد كل موضوع يظهر النمط الأبرز في إجاباتك، وتجمع النتيجة النهائية هذا النمط مع عمر تقديري للترفيه.\n\nيفتح إعلان قصير بمكافأة الاختبار. وعند كل استراحة يُعرض إعلان آخر للمتابعة أو رؤية النتيجة. ولتحليل الإجابات الاختياري إعلان مستقل. يُحفظ تقدمك على هذا الجهاز.\n\nالعمر المعروض نتيجة لعبة، وليس توقعًا. لا يستخدم الاختبار عمرك الحقيقي أو بياناتك الطبية أو تاريخك العائلي أو تقييمًا فرديًا للمخاطر. ولا يغيّر اختيارك الأخير العمر المعروض بأكثر من سنة واحدة.',
};
const rows = {
  fr: {
    summary: 'Des habitudes bien ancrées ou l’envie d’improviser ? Découvre ton profil et un âge estimé, juste pour le plaisir.',
    final: 'Ton profil et ton âge estimé sont prêts. Découvre les choix qui ont façonné ce résultat, à prendre comme un jeu.',
    checks: ['Habitudes comparées', 'Profil identifié', 'Âge ludique calculé'],
    profiles: [
      'Tu tiens les petites promesses que tu te fais. Tes réponses privilégient les habitudes durables et le temps de récupérer : tu prépares demain sans oublier aujourd’hui.',
      'Tes rituels et les personnes de confiance donnent un rythme à tes journées. On peut compter sur toi, sans que tu aies besoin de le rappeler.',
      'Tu sais faire une place aux choix raisonnables comme aux petits plaisirs. Tu adaptes ta routine à la journée, plutôt que de chercher la perfection.',
      'Tes meilleurs souvenirs commencent souvent sans programme précis. Spontanéité et bonne compagnie transforment une soirée ordinaire en histoire à raconter.',
      'Tu fais avancer les choses, souvent avant de penser à la prochaine pause. Un peu de marge pourrait t’aider à choisir ton rythme plus librement.',
      'Tu sais ce qui te fait du bien : des lieux familiers, tes proches et du temps pour déconnecter. Tu as le talent de rendre le quotidien accueillant.',
      'La curiosité guide souvent tes choix. Un lieu inconnu ou une idée inattendue peut devenir le début d’une nouvelle aventure.',
      'Tes réponses expriment une envie de souffler et de repartir sur des bases qui te ressemblent. Ce profil décrit tes choix du moment, pas une étiquette définitive.',
    ],
    dimensions: ['🌿 Régularité et constance','⚖️ Équilibre et récupération','✨ Curiosité et aventure','⚡ Pression et rythme'],
    name: 'TON PROFIL AU QUOTIDIEN', eyebrow: 'TON ÂGE LUDIQUE', wildcard: 'Ta tendance inattendue',
    review: ['Quels choix ont influencé ton résultat ?', 'Découvre quelles réponses ont fait monter ou descendre l’âge ludique, et lesquelles l’ont laissé stable.', 'Voir mes réponses', 'Une courte publicité, puis le détail de tes réponses.'],
  },
  de: {
    summary: 'Feste Gewohnheiten oder lieber spontan? Entdecke deinen Alltagstyp und eine spielerische Altersschätzung.',
    final: 'Dein Alltagstyp und die spielerische Altersschätzung stehen fest. Entdecke, welche Entscheidungen dein Ergebnis geprägt haben.',
    checks: ['Gewohnheiten verglichen', 'Alltagstyp zugeordnet', 'Spielerisches Alter berechnet'],
    profiles: [
      'Du hältst die kleinen Versprechen an dich selbst. Deine Antworten setzen auf beständige Gewohnheiten und Erholung, die auch morgen noch zu dir passen.',
      'Vertraute Rituale und verlässliche Menschen geben deinem Tag Struktur. Auf dich kann man zählen, ohne dass du viel Aufhebens darum machst.',
      'Du verbindest vernünftige Entscheidungen mit kleinen Freuden. Deine Routine darf sich dem Tag anpassen; perfekt muss sie nicht sein.',
      'Deine besten Geschichten beginnen selten mit einem festen Plan. Spontane Ideen und gute Gesellschaft machen aus einem gewöhnlichen Abend etwas Besonderes.',
      'Du bringst Dinge in Bewegung und denkst oft zuerst an die nächste Aufgabe. Etwas mehr Freiraum könnte dir helfen, dein Tempo bewusster zu wählen.',
      'Du weißt, was dir guttut: vertraute Orte, Lieblingsmenschen und Zeit zum Abschalten. Du machst den Alltag auf deine Art angenehm.',
      'Neugier hat bei deinen Entscheidungen ein Mitspracherecht. Neue Orte und unerwartete Ideen werden bei dir schnell zu einem kleinen Abenteuer.',
      'Deine Antworten zeigen den Wunsch nach Luft zum Durchatmen und einem passenden Neustart. Dieser Typ beschreibt deine heutigen Entscheidungen, keine feste Eigenschaft.',
    ],
    dimensions: ['🌿 Beständigkeit und Ausdauer','⚖️ Balance und Erholung','✨ Neugier und Abenteuer','⚡ Druck und Tempo'],
    name: 'DEIN ALLTAGSTYP', eyebrow: 'DEIN SPIELERISCHES ALTER', wildcard: 'Deine überraschende Seite',
    review: ['Welche Entscheidungen prägen dein Ergebnis?', 'Sieh nach, welche Antworten das spielerische Alter erhöht, gesenkt oder kaum verändert haben.', 'Meine Antworten ansehen', 'Eine kurze Werbung, dann die Auswertung deiner Antworten.'],
  },
  it: {
    summary: 'Abitudini stabili o voglia di improvvisare? Scopri il tuo profilo e una stima dell’età, solo per gioco.',
    final: 'Il tuo profilo e la stima dell’età sono pronti. Scopri quali scelte hanno formato questo risultato, da prendere come un gioco.',
    checks: ['Abitudini confrontate', 'Profilo individuato', 'Età del gioco calcolata'],
    profiles: [
      'Mantieni le piccole promesse che fai a te stesso. Le tue risposte privilegiano abitudini sostenibili e tempo per recuperare, con uno sguardo al domani.',
      'Rituali familiari e persone affidabili danno forma alle tue giornate. Gli altri possono contare su di te, senza bisogno di grandi annunci.',
      'Sai lasciare spazio sia alle scelte ragionevoli sia ai piccoli piaceri. Adatti la routine alla giornata, invece di inseguire la perfezione.',
      'I tuoi ricordi migliori nascono spesso senza un programma preciso. Spontaneità e buona compagnia trasformano una serata qualsiasi in una storia da raccontare.',
      'Metti in moto le cose e pensi spesso al prossimo impegno prima della prossima pausa. Un po’ di spazio in più potrebbe aiutarti a scegliere meglio il ritmo.',
      'Sai che cosa ti fa stare bene: luoghi familiari, persone care e tempo per staccare. Hai il talento di rendere accogliente la vita quotidiana.',
      'La curiosità conta nelle tue decisioni. Un posto nuovo o un’idea inattesa possono diventare l’inizio di un’avventura.',
      'Le tue risposte esprimono il desiderio di respirare e ripartire con più spazio. Questo profilo descrive le scelte di oggi, non un’etichetta permanente.',
    ],
    dimensions: ['🌿 Costanza e continuità','⚖️ Equilibrio e recupero','✨ Curiosità e avventura','⚡ Pressione e ritmo'],
    name: 'IL TUO PROFILO QUOTIDIANO', eyebrow: 'LA TUA ETÀ NEL GIOCO', wildcard: 'Il tuo lato inatteso',
    review: ['Quali scelte hanno formato il risultato?', 'Scopri quali risposte hanno alzato o abbassato l’età del gioco e quali l’hanno lasciata stabile.', 'Vedi le mie risposte', 'Un breve annuncio, poi il dettaglio delle tue risposte.'],
  },
  nl: {
    summary: 'Vaste gewoontes of liever spontaan? Ontdek jouw dagelijkse stijl en een leeftijdsschatting, gewoon voor de lol.',
    final: 'Je profiel en speelse leeftijdsschatting zijn klaar. Ontdek welke keuzes jouw resultaat hebben gevormd.',
    checks: ['Gewoontes vergeleken', 'Profiel gevonden', 'Speelse leeftijd berekend'],
    profiles: [
      'Je houdt je aan de kleine beloftes die je jezelf doet. Je antwoorden passen bij vaste gewoontes en tijd om bij te komen, met oog voor morgen.',
      'Vertrouwde rituelen en betrouwbare mensen geven je dagen vorm. Anderen kunnen op je rekenen, zonder dat je daar veel aandacht voor vraagt.',
      'Je maakt ruimte voor verstandige keuzes én kleine pleziertjes. Je past je routine aan de dag aan; perfect hoeft het niet te zijn.',
      'Je beste verhalen beginnen zelden met een strak plan. Spontane ideeën en goed gezelschap maken van een gewone avond iets om te onthouden.',
      'Je krijgt dingen in beweging en denkt vaak eerst aan de volgende taak. Wat meer ademruimte kan helpen om je tempo bewuster te kiezen.',
      'Je weet wat je prettig vindt: vertrouwde plekken, fijne mensen en tijd om te ontspannen. Je maakt het dagelijks leven op jouw manier aangenaam.',
      'Nieuwsgierigheid weegt mee in je keuzes. Een onbekende plek of onverwacht idee kan zomaar een nieuw avontuur worden.',
      'Je antwoorden laten zien dat je behoefte hebt aan ruimte en een frisse start. Dit profiel past bij je keuzes van nu en is geen vast etiket.',
    ],
    dimensions: ['🌿 Regelmaat en volhouden','⚖️ Balans en herstel','✨ Nieuwsgierigheid en avontuur','⚡ Druk en tempo'],
    name: 'JOUW DAGELIJKSE STIJL', eyebrow: 'JOUW SPEELSE LEEFTIJD', wildcard: 'Je verrassende kant',
    review: ['Welke keuzes vormden jouw resultaat?', 'Bekijk welke antwoorden de speelse leeftijd verhoogden, verlaagden of vrijwel gelijk lieten.', 'Bekijk mijn antwoorden', 'Een korte advertentie, daarna de uitleg bij je antwoorden.'],
  },
  es: {
    summary: '¿Hábitos estables o ganas de improvisar? Descubre tu perfil y una edad estimada, solo por diversión.',
    final: 'Tu perfil y tu edad estimada están listos. Descubre qué decisiones han dado forma a este resultado, pensado como un juego.',
    checks: ['Hábitos comparados', 'Perfil identificado', 'Edad del juego calculada'],
    profiles: [
      'Cumples las pequeñas promesas que te haces. Tus respuestas favorecen hábitos sostenibles y tiempo para recuperarte, con la mirada puesta en el mañana.',
      'Los rituales conocidos y las personas de confianza dan forma a tus días. Los demás pueden contar contigo sin que tengas que anunciarlo.',
      'Dejas espacio para las decisiones sensatas y los pequeños placeres. Adaptas tu rutina al día, en lugar de buscar la perfección.',
      'Tus mejores recuerdos suelen empezar sin un plan rígido. La espontaneidad y la buena compañía convierten una noche cualquiera en una historia.',
      'Pones las cosas en marcha y a menudo piensas en la siguiente tarea antes que en la próxima pausa. Un poco de margen puede ayudarte a elegir tu ritmo.',
      'Sabes qué te hace sentir bien: lugares conocidos, personas queridas y tiempo para desconectar. Tienes facilidad para hacer agradable lo cotidiano.',
      'La curiosidad cuenta en tus decisiones. Un lugar nuevo o una idea inesperada pueden convertirse en el inicio de una aventura.',
      'Tus respuestas expresan ganas de respirar y empezar de nuevo con más espacio. Este perfil refleja tus decisiones de hoy, no una etiqueta permanente.',
    ],
    dimensions: ['🌿 Constancia y continuidad','⚖️ Equilibrio y recuperación','✨ Curiosidad y aventura','⚡ Presión y ritmo'],
    name: 'TU PERFIL COTIDIANO', eyebrow: 'TU EDAD EN ESTE JUEGO', wildcard: 'Tu faceta inesperada',
    review: ['¿Qué decisiones han formado tu resultado?', 'Descubre qué respuestas han subido o bajado la edad del juego y cuáles la han mantenido estable.', 'Ver mis respuestas', 'Un anuncio breve y después el detalle de tus respuestas.'],
  },
  pt: {
    summary: 'Hábitos constantes ou vontade de improvisar? Descubra o seu perfil e uma estimativa de idade, apenas por diversão.',
    final: 'O seu perfil e a estimativa de idade estão prontos. Descubra as escolhas por trás deste resultado, criado apenas por diversão.',
    checks: ['Hábitos comparados', 'Perfil identificado', 'Idade do jogo calculada'],
    profiles: [
      'Cumpre as pequenas promessas que faz a si mesmo. As suas respostas dão valor a hábitos duradouros e ao tempo para recuperar, com atenção ao amanhã.',
      'Os rituais conhecidos e as pessoas de confiança dão forma aos seus dias. Os outros sabem que podem contar consigo, sem grandes anúncios.',
      'Há espaço para escolhas sensatas e pequenos prazeres. A sua rotina adapta-se ao dia, em vez de procurar a perfeição.',
      'As melhores histórias nem sempre começam com um plano. A espontaneidade e a boa companhia transformam uma noite comum numa boa memória.',
      'Faz as coisas avançar e pensa muitas vezes na próxima tarefa antes da próxima pausa. Um pouco mais de espaço pode ajudar a escolher o ritmo.',
      'Sabe o que torna um dia agradável: lugares conhecidos, pessoas queridas e tempo para desligar. Tem jeito para tornar o quotidiano acolhedor.',
      'A curiosidade participa nas suas decisões. Um lugar novo ou uma ideia inesperada podem dar início a uma aventura.',
      'As suas respostas mostram vontade de respirar e recomeçar com mais espaço. Este perfil retrata as escolhas de hoje, sem criar um rótulo permanente.',
    ],
    dimensions: ['🌿 Constância e continuidade','⚖️ Equilíbrio e recuperação','✨ Curiosidade e aventura','⚡ Pressão e ritmo'],
    name: 'O SEU PERFIL NO DIA A DIA', eyebrow: 'A SUA IDADE NESTE JOGO', wildcard: 'O seu lado inesperado',
    review: ['Que escolhas influenciaram o resultado?', 'Descubra as respostas que aumentaram, reduziram ou mantiveram a idade calculada neste jogo.', 'Ver as minhas respostas', 'Um anúncio curto, seguido da análise das respostas.'],
  },
  ar: {
    summary: 'عادات ثابتة أم حب للتجارب العفوية؟ اكتشف نمطك اليومي وعمرًا تقديريًا للترفيه فقط.',
    final: 'نمطك اليومي والعمر التقديري جاهزان. اكتشف الاختيارات التي شكّلت نتيجتك في هذه اللعبة الترفيهية.',
    checks: ['تمت مقارنة العادات', 'تم تحديد النمط', 'تم حساب عمر اللعبة'],
    profiles: [
      'تفي بالوعود الصغيرة التي تقطعها لنفسك. تميل إجاباتك إلى عادات يمكنك الاستمرار عليها ووقت تستعيد فيه طاقتك، مع اهتمام بما يفيدك غدًا.',
      'تمنح العادات المألوفة والأشخاص الموثوقون أيامك إيقاعًا ثابتًا. يستطيع الآخرون الاعتماد عليك دون أن تحتاج إلى لفت الأنظار.',
      'تفسح مجالًا للاختيارات المتوازنة والمتع الصغيرة معًا. تكيّف روتينك مع يومك بدلًا من السعي إلى الكمال.',
      'أفضل حكاياتك لا تبدأ دائمًا بخطة دقيقة. العفوية والصحبة الطيبة تحولان أمسية عادية إلى ذكرى جميلة.',
      'تدفع الأمور إلى الأمام، وغالبًا ما تفكر في المهمة التالية قبل الاستراحة التالية. مساحة إضافية للتنفس قد تساعدك على اختيار إيقاعك براحة أكبر.',
      'تعرف ما يجعل يومك مريحًا: أماكن مألوفة وأشخاص تحبهم ووقت للهدوء. لديك قدرة على جعل الحياة اليومية أكثر دفئًا.',
      'للفضول دور في قراراتك. مكان جديد أو فكرة غير متوقعة قد يكونان بداية مغامرة بالنسبة لك.',
      'تعكس إجاباتك رغبة في التقاط الأنفاس وبداية تمنحك مساحة أكبر. هذا النمط يصف اختياراتك الحالية، ولا يضع لك صفة دائمة.',
    ],
    dimensions: ['🌿 الثبات والاستمرارية','⚖️ التوازن واستعادة الطاقة','✨ الفضول والمغامرة','⚡ الضغط والإيقاع'],
    name: 'نمطك في الحياة اليومية', eyebrow: 'عمرك الترفيهي في هذه اللعبة', wildcard: 'جانبك غير المتوقع',
    review: ['أي اختيارات شكّلت نتيجتك؟', 'اكتشف الإجابات التي رفعت عمر اللعبة أو خفضته، والإجابات التي لم تغيّره كثيرًا.', 'عرض تحليل إجاباتي', 'إعلان قصير، ثم تفاصيل تأثير إجاباتك.'],
  },
};

export function polishYearsLeftResults(copy, locale) {
  const row = rows[locale];
  copy.about.body = about[locale];
  copy.summary = row.summary;
  const last = Object.values(copy.career.stages).at(-1);
  last.preAdCopy = row.final;
  last.preAdChecks = row.checks;
  Object.values(copy.results.profiles).forEach((profile, index) => { profile.copy = row.profiles[index]; });
  Object.values(copy.results.dimensions).forEach((dimension, index) => { dimension.label = row.dimensions[index]; });
  copy.results.name = row.name;
  copy.results.estimate.eyebrow = row.eyebrow;
  copy.results.estimate.wildcard = row.wildcard;
  const [title, body, button, adNote] = row.review;
  Object.assign(copy.results.estimate.reviewUnlock, {title, copy: body, button, adNote});
  if (locale === 'pt') {
    copy.results.profiles.balanced_realist.tier = 'Equilíbrio e prazer';
    copy.results.estimate.insights.breakdown = 'As tendências do seu estilo de vida';
  }
}
