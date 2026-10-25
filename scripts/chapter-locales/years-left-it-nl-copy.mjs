function checkpoints(titles, rows, labels, final) {
  return Object.fromEntries(titles.map((title, i) => [`stage-${i + 1}`, {
    difficulty: title.toLocaleUpperCase(labels.locale),
    ...(i < 9 ? {preAdTitle: rows[i][0], preAdCopy: rows[i][1], next: {eyebrow: labels.next, tagline: rows[i][2]}, preAdButton: labels.continue}
      : {preAdTitle: final.title, preAdCopy: final.copy, preAdChecks: final.checks, preAdButton: labels.result}),
  }]));
}

export const italianYearsStageTitles = ['Il tuo risveglio', 'Ciò che ti dà energia', 'Il tuo ritmo quotidiano', 'Il tuo modo di staccare', 'Tu sotto pressione', 'Le tue relazioni', 'Le tue abitudini automatiche', 'Ciò che ti accende', 'Il tuo io futuro', 'La lettura finale del tuo orologio'];
export const dutchYearsStageTitles = ['Jouw ochtendritme', 'Wat jou energie geeft', 'Jouw dagelijkse tempo', 'Hoe jij tot rust komt', 'Jij onder druk', 'De mensen om je heen', 'Jouw automatische gewoonten', 'Wat jou enthousiast maakt', 'Jouw toekomstige ik', 'De eindstand van jouw klok'];

export const italianYearsCopy = {
  title: 'Quanto tempo ti resta da vivere?',
  eyebrow: 'L’orologio della tua vita',
  summary: 'Pensi al lungo periodo o vivi per collezionare storie? Scopri il profilo del tuo orologio e una stima dell’età solo per divertimento.',
  landing: {intro: 'Le tue scelte quotidiane lasciano indizi.\nQuale età nascondono?', cta: 'Inizia il test'},
  about: {
    body: 'Scopri cosa raccontano le tue abitudini quotidiane sull’orologio della tua vita. Dieci tappe esplorano routine, energia, ritmo, riposo, pressione, relazioni, abitudini, curiosità, programmi e istinto. Alla fine scoprirai il tuo profilo e una stima dell’età solo per divertimento.\n\nL’età mostrata è un risultato ludico basato sulle tue scelte, non una previsione. Il quiz non usa la tua età attuale, la tua storia clinica, i precedenti familiari o una valutazione individuale del rischio.',
    howToPlay: {steps: ['Scegli la risposta che ti descrive davvero. Non ci sono risposte giuste o sbagliate.', 'Completa dieci tappe rapide, ciascuna dedicata a un aspetto diverso della tua vita quotidiana.', 'Scopri il tratto che emerge dopo ogni tappa, poi rivela il profilo del tuo orologio e una stima dell’età solo per divertimento.']},
    disclaimer: 'Solo per intrattenimento e riflessione personale. Questo quiz non prevede la durata della vita, la salute, il rischio di morte o gli esiti medici. Se hai dubbi sulla tua salute, rivolgiti a un professionista sanitario qualificato.',
  },
  career: {
    resultProgressLabel: 'La lettura del tuo orologio',
    stages: checkpoints(italianYearsStageTitles, [
      ['È arrivato il primo indizio', 'In questa tappa emerge questo profilo: {profile}. Le tue scelte a tavola racconteranno la stessa storia?', 'Che cosa dà davvero energia alla tua giornata?'],
      ['I tuoi gusti hanno personalità', 'Nelle tue scelte a tavola prevale questo profilo: {profile}. Ora entrano in gioco comodità e voglia di muoversi.', 'Anche il tuo ritmo quotidiano ha una firma.'],
      ['Il tuo ritmo prende forma', 'Le tue scelte sul movimento indicano questo profilo: {profile}. Ma cosa succede quando è ora di staccare?', 'Ora tocca al tuo modo di concludere la giornata.'],
      ['Ecco come sei a fine giornata', 'In questa tappa emerge questo profilo: {profile}. Scopri quale lato di te compare quando la pressione aumenta.', 'Giornata piena. Un altro favore. Cosa fai?'],
      ['La tua reazione alla pressione emerge', 'Sotto pressione, le tue risposte indicano questo profilo: {profile}. Ora passiamo alle persone che fanno emergere un altro lato di te.', 'I tuoi amici potrebbero riconoscere queste risposte.'],
      ['Il tuo lato sociale ha un profilo', 'Nelle tue relazioni prevale questo profilo: {profile}. Ora arrivano le piccole abitudini che quasi non noti.', 'Che cosa fai quando agisci in automatico?'],
      ['Le tue abitudini rivelano un filo comune', 'Le tue abitudini indicano questo profilo: {profile}. Ora qualcosa di più leggero: cosa rende memorabile una giornata normale?', 'Comfort, curiosità o una storia del tutto nuova?'],
      ['Il tuo entusiasmo ha una firma', 'In questa tappa emerge questo profilo: {profile}. Scopri cosa raccontano le tue scelte sulla vita che vuoi costruire.', 'Per cosa ti ringrazierebbe il tuo io futuro?'],
      ['La tua visione del futuro prende forma', 'Pensando al futuro, le tue scelte indicano questo profilo: {profile}. Ora segui l’istinto e completa il quadro.', 'Che cosa ti dice l’istinto quando guardi il quadro completo?'],
    ], {locale: 'it', next: 'PROSSIMA SFIDA', continue: 'Continua', result: 'Vedi il risultato'}, {
      title: 'La lettura del tuo orologio è pronta', copy: 'Hai completato tutte le tappe. Scopri il profilo del tuo orologio e la stima dell’età solo per divertimento. Poi esplora le scelte che hanno formato il risultato.', checks: ['Scelte quotidiane collegate', 'Profilo dell’orologio individuato', 'Stima dell’età pronta da scoprire'],
    }),
  },
  results: {
    name: 'IL PROFILO DEL TUO OROLOGIO',
    profiles: {
      centenarian_energy: {tier: 'Con lo sguardo al futuro', title: 'Lungimiranza quotidiana', copy: 'Fai piccole promesse e le mantieni davvero. Le tue risposte danno valore ad abitudini sostenibili, spazio per recuperare e scelte che il tuo io di domani apprezzerà. La tua firma: costruire con calma pensando al lungo periodo.'},
      steady_long_game: {tier: 'Costanza senza clamore', title: 'Costanza naturale', copy: 'Conosci il valore di una routine che senti tua. Rituali familiari e persone affidabili danno forma alle tue giornate. La tua firma: essere la persona su cui gli altri possono contare, senza farne un grande evento.'},
      balanced_realist: {tier: 'Spazio per entrambe le cose', title: 'Equilibrio realistico', copy: 'Fai spazio alle scelte sensate e a una vita da godersi. Le tue risposte si adattano alla giornata anziché inseguire una routine perfetta. La tua firma: sapere quando seguire il piano e quando ordinare una fetta di torta.'},
      weekend_chaos: {tier: 'Belle storie incluse', title: 'Un weekend imprevedibile', copy: 'Le tue storie migliori raramente iniziano con un programma rigido. Le risposte favoriscono spontaneità, buona compagnia e qualche trattativa con il tuo io di domani. La tua firma: trasformare una serata normale in una storia da raccontare.'},
      stress_sprinter: {tier: 'C’è sempre un’altra cosa', title: 'Sempre a tutta velocità', copy: 'Porti slancio in quasi tutto quello che fai. Nelle tue risposte, il prossimo impegno arriva spesso prima della prossima pausa. La tua firma: far muovere le cose. Un po’ più di respiro potrebbe aiutarti a sentire quel ritmo come una scelta, non come un obbligo.'},
      comfort_creature: {tier: 'Il comfort è un’arte', title: 'L’arte del comfort', copy: 'Sai cosa rende piacevole una giornata: luoghi familiari, persone care e una vera occasione per staccare. La tua firma: rendere accogliente la vita di tutti i giorni. Saper riconoscere ciò che fa per te è una capacità.'},
      adventure_fuse: {tier: 'In cerca di una nuova storia', title: 'Spirito d’avventura', copy: 'La curiosità conta nelle tue decisioni. Le risposte vedono possibilità nei posti nuovi, nelle idee insolite e nei giorni che prendono una piega inattesa. La tua firma: tornare con una storia che nessuno si aspettava.'},
      reset_needed: {tier: 'Una nuova fase ti aspetta', title: 'Un nuovo inizio', copy: 'Le tue risposte chiedono spesso più spazio, meno richieste e un’occasione per riprendere fiato. Quello che cerchi adesso: un nuovo inizio adatto alla vita reale. Il profilo del tuo orologio riflette queste scelte, non è un’etichetta permanente.'},
    },
    dimensions: {'dimension-1': {label: '🌿 Costanza e visione a lungo termine'}, 'dimension-2': {label: '⚖️ Equilibrio e recupero'}, 'dimension-3': {label: '✨ Entusiasmo e avventura'}, 'dimension-4': {label: '⚡ Pressione e ritmo'}},
    estimate: {
      eyebrow: 'L’ETÀ DEL TUO OROLOGIO, SOLO PER DIVERTIMENTO', ageSuffix: 'ANNI', strongestSignal: 'Il tratto più evidente del tuo stile di vita', wildcard: 'Il tuo lato imprevedibile', consistency: 'Coerenza delle risposte', consistencyLabels: {high: 'Alta', medium: 'Media', mixed: 'Variabile'},
      reviewUnlock: {title: 'Quali scelte hanno formato il tuo risultato?', copy: 'Vai oltre il numero: scopri quali risposte hanno fatto salire, scendere o restare invariata questa stima dell’età solo per divertimento.', button: 'Vedi le mie risposte', adNote: 'Tocca per scoprire cosa ha influito sulla stima.', reviewTitle: 'Cosa ha influito sulla tua stima', yourChoice: 'La tua scelta', raised: 'Ha aumentato la stima', lowered: 'Ha ridotto la stima', neutral: 'Nessuna variazione', raisedCopy: 'Questa scelta ha aumentato la stima.', loweredCopy: 'Questa scelta ha ridotto la stima.', neutralCopy: 'Questa risposta ha aggiunto contesto senza modificare in modo significativo la stima.'},
      insights: {overview: 'La tua stima a colpo d’occhio', estimate: 'La tua stima', signal: 'Il tratto principale del tuo stile di vita', consistency: 'Coerenza delle risposte', breakdown: 'I tratti del tuo stile di vita', snapshot: 'Cosa suggerisce il tuo profilo'},
      disclaimer: 'Solo per intrattenimento. Questo risultato non è una previsione medica né dell’aspettativa di vita.',
    },
  },
};

export const dutchYearsCopy = {
  title: 'Hoelang heb jij nog te leven?',
  eyebrow: 'Jouw levensklok',
  summary: 'Denk jij aan de lange termijn of verzamel je liever nieuwe verhalen? Ontdek je klokprofiel en een leeftijdsschatting, puur voor het plezier.',
  landing: {intro: 'Je dagelijkse keuzes geven iets prijs.\nWelke leeftijd komt er bij jou uit?', cta: 'Start de test'},
  about: {
    body: 'Ontdek wat je dagelijkse gewoonten vertellen over je levensklok. Tien gerichte rondes verkennen je routine, energie, tempo, rust, druk, relaties, gewoonten, nieuwsgierigheid, plannen en instinct. Daarna ontdek je je profiel en een speelse leeftijdsschatting.\n\nDe leeftijd is een speluitkomst op basis van je keuzes, geen voorspelling. De quiz gebruikt niet je huidige leeftijd, medische gegevens, familiegeschiedenis of een persoonlijke risicobeoordeling.',
    howToPlay: {steps: ['Kies het antwoord dat echt bij je past. Er zijn geen goede of foute antwoorden.', 'Doorloop tien snelle rondes die elk een ander deel van je dagelijkse patroon verkennen.', 'Bekijk na elke ronde welk patroon opvalt en ontdek daarna je klokprofiel en speelse leeftijdsschatting.']},
    disclaimer: 'Alleen voor vermaak en zelfreflectie. Deze quiz voorspelt geen levensduur, gezondheid, overlijdensrisico of medische uitkomsten. Neem bij gezondheidsvragen contact op met een gekwalificeerde zorgverlener.',
  },
  career: {
    resultProgressLabel: 'De stand van jouw klok',
    stages: checkpoints(dutchYearsStageTitles, [
      ['De eerste aanwijzing is binnen', 'In deze ronde komt dit profiel naar voren: {profile}. Vertellen je eetkeuzes hetzelfde verhaal?', 'Wat geeft jouw dag echt energie?'],
      ['Je eetkeuzes hebben karakter', 'Bij je eetkeuzes komt dit profiel naar voren: {profile}. Nu draait het om comfort en in beweging komen.', 'Jouw dagelijkse tempo heeft ook een eigen karakter.'],
      ['Jouw tempo wordt zichtbaar', 'Je keuzes over bewegen wijzen op dit profiel: {profile}. Maar wat gebeurt er als het tijd is om te ontspannen?', 'Nu staat jouw manier om de dag af te sluiten centraal.'],
      ['Zo ben jij aan het eind van de dag', 'In deze ronde komt dit profiel naar voren: {profile}. Ontdek nu welke kant van jou verschijnt als de druk oploopt.', 'Drukke dag. Nog een verzoek. Wat doe je?'],
      ['Je reactie op druk wordt zichtbaar', 'Onder druk wijzen je antwoorden op dit profiel: {profile}. Nu komen de mensen aan bod die een andere kant van je laten zien.', 'Je vrienden herkennen deze antwoorden misschien.'],
      ['Je sociale kant krijgt een profiel', 'In je relaties komt dit profiel naar voren: {profile}. Nu volgen de kleine gewoonten die je nauwelijks opmerkt.', 'Wat doe je wanneer je op de automatische piloot leeft?'],
      ['Je gewoonten laten een patroon zien', 'Je gewoonten wijzen op dit profiel: {profile}. Nu iets luchtigers: wat maakt een gewone dag de moeite waard?', 'Comfort, nieuwsgierigheid of een heel nieuw verhaal?'],
      ['Jouw enthousiasme krijgt een gezicht', 'In deze ronde komt dit profiel naar voren: {profile}. Ontdek wat je keuzes zeggen over het leven dat je wilt opbouwen.', 'Waar zou je toekomstige ik je voor bedanken?'],
      ['Je toekomstbeeld krijgt vorm', 'Je toekomstkeuzes wijzen op dit profiel: {profile}. Volg nu je instinct en maak het beeld compleet.', 'Wat zegt je gevoel als je naar het hele plaatje kijkt?'],
    ], {locale: 'nl', next: 'HIERNA', continue: 'Verder', result: 'Bekijk mijn resultaat'}, {
      title: 'De stand van jouw klok is bekend', copy: 'Alle rondes zijn afgerond. Ontdek je klokprofiel en speelse leeftijdsschatting. Bekijk daarna welke keuzes je resultaat hebben gevormd.', checks: ['Dagelijkse keuzes met elkaar verbonden', 'Klokprofiel bepaald', 'Speelse leeftijdsschatting klaar'],
    }),
  },
  results: {
    name: 'JOUW KLOKPROFIEL',
    profiles: {
      centenarian_energy: {tier: 'Gericht op de lange termijn', title: 'De lange adem', copy: 'Je doet kleine beloften en komt ze ook echt na. Je antwoorden geven de voorkeur aan herhaalbare gewoonten, tijd om te herstellen en keuzes waar je jezelf morgen dankbaar voor bent. Jouw kenmerk: rustig bouwen aan de lange termijn.'},
      steady_long_game: {tier: 'Rustig en betrouwbaar', title: 'Van nature standvastig', copy: 'Je kent de waarde van een routine die bij je past. Vertrouwde rituelen en betrouwbare mensen geven je dagen vorm. Jouw kenmerk: de persoon zijn op wie anderen kunnen rekenen, zonder daar veel drukte over te maken.'},
      balanced_realist: {tier: 'Ruimte voor allebei', title: 'De evenwichtige realist', copy: 'Je maakt ruimte voor verstandige keuzes én een leven om van te genieten. Je antwoorden passen zich aan de dag aan, in plaats van een perfecte routine na te jagen. Jouw kenmerk: weten wanneer je het plan volgt en wanneer je de taart bestelt.'},
      weekend_chaos: {tier: 'Mooie verhalen inbegrepen', title: 'Een weekend vol verrassingen', copy: 'Je beste verhalen beginnen zelden met een strak plan. Je antwoorden kiezen voor spontane momenten, goed gezelschap en af en toe wat overleg met je ik van morgen. Jouw kenmerk: van een gewone avond een verhaal maken.'},
      stress_sprinter: {tier: 'Altijd nog één ding', title: 'In de hoogste versnelling', copy: 'Je brengt vaart in bijna alles. In je antwoorden komt de volgende taak vaak vóór de volgende pauze. Jouw kenmerk: dingen in beweging brengen. Met iets meer ademruimte kan dat tempo meer als een keuze voelen.'},
      comfort_creature: {tier: 'Comfort is een kunst', title: 'De kunst van ontspannen', copy: 'Je weet wat een dag fijn maakt: vertrouwde plekken, dierbare mensen en echt even kunnen ontspannen. Jouw kenmerk: het gewone leven aangenaam maken. Weten wat bij je past is ook een vaardigheid.'},
      adventure_fuse: {tier: 'Op zoek naar een nieuw verhaal', title: 'De avonturenzoeker', copy: 'Nieuwsgierigheid telt mee in je beslissingen. Je antwoorden zien mogelijkheden in nieuwe plekken, vreemde ideeën en dagen die onverwacht anders lopen. Jouw kenmerk: thuiskomen met een verhaal dat niemand zag aankomen.'},
      reset_needed: {tier: 'Een nieuwe fase wacht', title: 'Tijd voor een frisse start', copy: 'Je antwoorden vragen vaak om meer ruimte, minder verplichtingen en even op adem komen. Wat je nu zoekt: een frisse start die bij het echte leven past. Je klokprofiel is een momentopname van deze keuzes, geen blijvend etiket.'},
    },
    dimensions: {'dimension-1': {label: '🌿 Constante energie voor de lange termijn'}, 'dimension-2': {label: '⚖️ Balans en herstel'}, 'dimension-3': {label: '✨ Enthousiasme en avontuur'}, 'dimension-4': {label: '⚡ Druk en tempo'}},
    estimate: {
      eyebrow: 'JOUW SPEELSE LEEFTIJDSSCHATTING', ageSuffix: 'JAAR', strongestSignal: 'Het opvallendste kenmerk van je leefstijl', wildcard: 'Jouw onverwachte kant', consistency: 'Samenhang in je antwoorden', consistencyLabels: {high: 'Hoog', medium: 'Gemiddeld', mixed: 'Wisselend'},
      reviewUnlock: {title: 'Welke keuzes vormden jouw resultaat?', copy: 'Kijk achter het getal: welke antwoorden brachten de speelse schatting omhoog, omlaag of hielden die gelijk?', button: 'Bekijk mijn antwoorden', adNote: 'Tik om te zien wat je schatting heeft beïnvloed.', reviewTitle: 'Wat je schatting heeft beïnvloed', yourChoice: 'Jouw keuze', raised: 'Schatting verhoogd', lowered: 'Schatting verlaagd', neutral: 'Geen verandering', raisedCopy: 'Deze keuze verhoogde de schatting.', loweredCopy: 'Deze keuze verlaagde de schatting.', neutralCopy: 'Dit antwoord gaf extra context zonder de schatting wezenlijk te veranderen.'},
      insights: {overview: 'Je schatting in één oogopslag', estimate: 'Jouw schatting', signal: 'Het belangrijkste patroon in je leefstijl', consistency: 'Samenhang in je antwoorden', breakdown: 'De patronen in je leefstijl', snapshot: 'Wat je profiel suggereert'},
      disclaimer: 'Alleen voor vermaak. Dit resultaat is geen medische voorspelling of voorspelling van je levensverwachting.',
    },
  },
};
