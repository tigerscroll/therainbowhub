import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const quizRoot = path.join(root, "data", "quizzes");
const locales = ["fr", "de", "it", "nl", "es", "pt"];

async function edit(slug, locale, mutate) {
  const file = path.join(quizRoot, slug, `${locale}.json`);
  const content = JSON.parse(await fs.readFile(file, "utf8"));
  mutate(content);
  await fs.writeFile(file, `${JSON.stringify(content, null, 2)}\n`);
}

function question(content, id) {
  const match = content.stages.flatMap((stage) => stage.questions).find((item) => item.id === id);
  if (!match) throw new Error(`Missing question ${id}`);
  return match;
}

const scoreCopy = {
  fr: "Vous avez obtenu {score} bonnes réponses sur {total}. Votre profil pour cette tentative apparaît ci-dessous.",
  de: "Sie haben {score} von {total} Aufgaben richtig beantwortet. Ihr Profil für diesen Versuch sehen Sie unten.",
  it: "Hai risposto correttamente a {score} domande su {total}. Il profilo di questo tentativo è riportato qui sotto.",
  nl: "Je beantwoordde {score} van de {total} vragen goed. Hieronder staat je profiel voor deze poging.",
  es: "Acertaste {score} de {total} preguntas. A continuación aparece el perfil de este intento.",
  pt: "Foram acertadas {score} de {total} perguntas. O perfil desta tentativa aparece abaixo.",
};

const chefScoreCopy = {
  fr: "Vous avez obtenu {score} bonnes réponses sur {total}. Votre profil de cuisine pour cette tentative est {profile}.",
  de: "Sie haben {score} von {total} Aufgaben richtig beantwortet. Ihr Küchenprofil für diesen Versuch ist {profile}.",
  it: "Hai risposto correttamente a {score} domande su {total}. Il profilo culinario di questo tentativo è {profile}.",
  nl: "Je beantwoordde {score} van de {total} vragen goed. Je keukenprofiel voor deze poging is {profile}.",
  es: "Acertaste {score} de {total} preguntas. Tu perfil de cocina en este intento es {profile}.",
  pt: "Foram acertadas {score} de {total} perguntas. O perfil culinário desta tentativa é {profile}.",
};

for (const slug of ["grammar", "iq", "memory", "midwifery", "nursing", "paramedic", "vision"]) {
  for (const locale of locales) {
    await edit(slug, locale, (content) => {
      content.results.score.insights.details.finalCopy = scoreCopy[locale];
    });
  }
}
for (const locale of locales) {
  await edit("chef", locale, (content) => {
    content.results.score.insights.details.finalCopy = chefScoreCopy[locale];
  });
}

// Independent Dutch word and ordering puzzles. Literal English wordplay cannot survive translation.
await edit("iq", "nl", (content) => {
  Object.assign(question(content, "iq-s1q3"), {
    question: "Welk woord past in beide combinaties?",
    visual: {
      items: ["VOET ___", "___ ZAAL"],
      columns: 1,
      ariaLabel: "VOET, lege plek; lege plek, ZAAL",
    },
    answers: ["BAL", "DEUR", "SPEL", "DANS"],
  });
  Object.assign(question(content, "iq-s3q1"), {
    question: "Mara staat vóór Leo, en Leo staat vóór Nia. Welke volgorde klopt?",
    answers: ["Leo – Mara – Nia", "Mara – Nia – Leo", "Mara – Leo – Nia", "Nia – Leo – Mara"],
  });
});

// The Dutch translator dropped five complete workshop cases. Restore them as native fault-finding prompts.
await edit("mechanic", "nl", (content) => {
  const cases = {
    "mech-r9q1": {
      question: "De auto trekt alleen tijdens het remmen naar links en het linker voorwiel is opvallend heet. Wat is de waarschijnlijkste oorzaak?",
      answers: ["Een vastzittende remklauw linksvoor", "Een zwakke accu", "Een verstopt luchtfilter", "Een laag koelvloeistofpeil"],
    },
    "mech-r9q2": {
      question: "Een nieuwe accu raakt opnieuw leeg en het laadwaarschuwingslampje brandt. Wat moet als eerste worden gecontroleerd?",
      answers: ["De wieluitlijning", "Het laadsysteem en de aansluitingen", "De dikte van de remblokken", "De koelvloeistofconcentratie"],
    },
    "mech-r9q3": {
      question: "Een trilling volgt de rijsnelheid, niet het motortoerental, en blijft tijdens uitrollen bestaan. Waar zoek je eerst?",
      answers: ["De ontstekingstiming", "Het brandstofmengsel", "De wielen, banden of aandrijflijn", "De koelventilator"],
    },
    "mech-r9q4": {
      question: "Bij de overgang van optrekken naar afremmen op de motor klinkt één harde klonk. Welke onderdelen verdienen als eerste aandacht?",
      answers: ["De ruitensproeiers", "Het interieurfilter", "De radiateurdop", "De motorsteunen en aandrijfkoppelingen"],
    },
    "mech-r9q6": {
      question: "Bij één wiel ontstaat plots een hard schurend geluid. Wat is de veiligste eerste beslissing?",
      answers: ["De radio harder zetten", "Stoppen met rijden en het voertuig laten controleren", "Versnellen om eventueel vuil los te maken", "Smeermiddel op het wiel aanbrengen"],
    },
  };
  for (const [id, replacement] of Object.entries(cases)) Object.assign(question(content, id), replacement);

  Object.assign(question(content, "mech-r10q1"), {
    question: "De startmotor draait en er is brandstofdruk, maar geen enkele cilinder krijgt een vonk. Welk systeem moet nu worden onderzocht?",
    answers: ["De ontstekingsregeling en de voedings- of timingsignalen", "De bandenspanningscontrole", "Het hydraulische remsysteem", "De wieluitlijning"],
  });
  Object.assign(question(content, "mech-r10q3"), {
    question: "Bij een conventioneel 12V-laadsysteem meet de accu 12,5 V met de motor uit en 12,0 V met draaiende motor en verlichting aan. Wat is de beste conclusie?",
    answers: ["De accu wordt zeker overladen", "De remmen lopen aan", "Het laadsysteem levert onvoldoende spanning", "De koelvloeistof is te koud"],
  });
  Object.assign(question(content, "mech-r10q4"), {
    question: "De motor wordt alleen stationair te heet, de radiateur is vrij en de koelventilator draait nooit. Wat moet als eerste worden onderzocht?",
    answers: ["De wieluitlijning", "De afdichting van de tankdop", "De slijtplaat van de remblokken", "Het ventilatorcircuit, de motor en de aansturing"],
  });
});

await edit("nursing", "fr", (content) => {
  Object.assign(question(content, "nurse-r2q4"), {
    question: "Où la plupart des nutriments issus de la digestion sont-ils absorbés ?",
    answers: ["Le gros intestin", "L’œsophage", "L’intestin grêle", "La vésicule biliaire"],
  });
});

await edit("grammar", "es", (content) => {
  content.results.profiles[2].title = "Especialista en frases";
});

await edit("memory", "de", (content) => {
  content.results.profiles[1].title = "Messerscharfe Erinnerung";
});
await edit("memory", "nl", (content) => {
  const labels = ["📝 Woorden onthouden", "👀 Visueel geheugen", "🔢 Getallen onthouden", "🧠 Werkgeheugen", "🔗 Verbanden leggen", "🔍 Aandacht"];
  content.results.dimensions.forEach((dimension, index) => { dimension.label = labels[index]; });
});
await edit("years-left", "nl", (content) => {
  content.results.dimensions[0].label = "Rustige, duurzame energie";
});

await edit("iq", "es", (content) => {
  content.results.dimensions[2].label = "Lógica y espacio";
  content.results.score.insights.details.measuredAreas[2].title = "Lógica y espacio";
});

const startLabels = {fr:"DÉPART", de:"BEGINN", it:"INIZIO", nl:"BEGIN", es:"INICIO", pt:"INÍCIO"};
for (const locale of locales) {
  await edit("iq", locale, (content) => {
    const target = question(content, "iq-s5q5");
    target.visual.items[0] = `${startLabels[locale]} · B7Q-4M2-K9`;
  });
}
await edit("iq", "es", (content) => {
  question(content, "iq-s5q7").visual.ariaLabel = "A con Z, B con Y, C con X, incógnita";
});

await edit("midwifery", "es", (content) => {
  const refusal = content.stages.flatMap((stage) => stage.questions).find((item) => item.answers?.includes("Discuss her refusal in the corridor"));
  if (refusal) refusal.answers[refusal.answers.indexOf("Discuss her refusal in the corridor")] = "Hablar de su negativa en el pasillo";
  const flow = content.stages.flatMap((stage) => stage.questions).find((item) => item.visual?.items?.includes("MATERNAL BLOOD → PLACENTA → CORD → BABY"));
  if (flow) flow.visual.items[flow.visual.items.indexOf("MATERNAL BLOOD → PLACENTA → CORD → BABY")] = "SANGRE MATERNA → PLACENTA → CORDÓN → BEBÉ";
});
await edit("midwifery", "it", (content) => {
  const all = content.stages.flatMap((stage) => stage.questions);
  const flow = all.find((item) => item.visual?.items?.includes("MATERNAL BLOOD → PLACENTA → CORD → BABY"));
  if (flow) flow.visual.items[flow.visual.items.indexOf("MATERNAL BLOOD → PLACENTA → CORD → BABY")] = "SANGUE MATERNO → PLACENTA → CORDONE → NEONATO";
  const earlier = all.find((item) => item.visual?.items?.includes("EARLIER::Comfortable · alert"));
  if (earlier) earlier.visual.items[earlier.visual.items.indexOf("EARLIER::Comfortable · alert")] = "PRIMA::A proprio agio · vigile";
});

await edit("oxford", "nl", (content) => {
  const target = content.stages.flatMap((stage) => stage.questions).find((item) => item.answers?.includes("P is irrelevant"));
  if (target) target.answers[target.answers.indexOf("P is irrelevant")] = "P is niet relevant";
});

const skin = {
  es:"PIEL::TEMPLADA::TEMPLADA",
  it:"PELLE::CALDA::CALDA",
  nl:"HUID::WARM::WARM",
};
for (const [locale, value] of Object.entries(skin)) {
  await edit("paramedic", locale, (content) => {
    const target = content.stages.flatMap((stage) => stage.questions).find((item) => item.visual?.items?.includes("SKIN::WARM::WARM"));
    if (target) target.visual.items[target.visual.items.indexOf("SKIN::WARM::WARM")] = value;
  });
}
await edit("paramedic", "es", (content) => {
  const target = content.stages.flatMap((stage) => stage.questions).find((item) => item.visual?.items?.includes("THEN::Left ventricle"));
  if (target) target.visual.items[target.visual.items.indexOf("THEN::Left ventricle")] = "DESPUÉS::Ventrículo izquierdo";
});

await edit("nursing", "it", (content) => {
  const target = content.stages.flatMap((stage) => stage.questions).find((item) => item.visual?.items?.includes("CHART: RIGHT ARM"));
  if (target) target.visual.items[target.visual.items.indexOf("CHART: RIGHT ARM")] = "SCHEDA: BRACCIO DESTRO";
});

await edit("vision", "de", (content) => {
  const target = content.stages.flatMap((stage) => stage.questions).find((item) => item.context === "OFFICE FOCUS: FIND FIVE FLAGS FAST.");
  if (target) target.context = "BÜRO-FOKUS: FÜNF FLAGGEN SCHNELL FINDEN.";
});
const positions = {
  fr: {top:"EN HAUT À GAUCHE — ÉTOILE", bottom:"EN BAS À GAUCHE — CLÉ"},
  es: {top:"ARRIBA A LA IZQUIERDA — ESTRELLA", bottom:"ABAJO A LA IZQUIERDA — LLAVE"},
  it: {top:"IN ALTO A SINISTRA — STELLA", bottom:"IN BASSO A SINISTRA — CHIAVE"},
};
for (const [locale, labels] of Object.entries(positions)) {
  await edit("vision", locale, (content) => {
    const all = content.stages.flatMap((stage) => stage.questions);
    for (const target of all) {
      if (!target.study?.items) continue;
      target.study.items = target.study.items.map((item) => item === "TOP LEFT — STAR" ? labels.top : item === "BOTTOM LEFT — KEY" ? labels.bottom : item);
    }
  });
}
const baseCopy = {
  fr:["RÉFÉRENCE::M8Q2-K7P4-R6N3", "COPIE::M8Q2-K1P4-R6M3"],
  nl:["BASIS::M8Q2-K7P4-R6N3", "KOPIE::M8Q2-K1P4-R6M3"],
  pt:["REFERÊNCIA::M8Q2-K7P4-R6N3", "CÓPIA::M8Q2-K1P4-R6M3"],
};
for (const [locale, labels] of Object.entries(baseCopy)) {
  await edit("vision", locale, (content) => {
    const target = content.stages.flatMap((stage) => stage.questions).find((item) => item.visual?.items?.includes("BASE::M8Q2-K7P4-R6N3"));
    if (target) target.visual.items = labels;
  });
}

// Keep the single Portuguese pack natural across both Portugal and Brazil.
// These replacements are intentionally vocabulary-neutral and include object keys
// because weighted-profile answer maps use the visible answer text as keys.
const neutralPortuguese = [
  ["Estratégias de jogo simples para regressar com melhor preparação:", "Estratégias simples para voltar com melhor preparação:"],
  ["Regresse com um novo olhar", "Volte com um novo olhar"],
  ["regressar com melhor preparação", "voltar com melhor preparação"],
  ["factos apresentados", "informações apresentadas"],
  ["registos médicos", "dados médicos"],
  ["até ao resultado final", "antes da apresentação do resultado final"],
  ["custo do reparo aumente", "problema fique mais caro"],
];

function normalizePortuguese(value) {
  if (typeof value === "string") {
    return neutralPortuguese.reduce((text, [from, to]) => text.replaceAll(from, to), value);
  }
  if (Array.isArray(value)) return value.map(normalizePortuguese);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [normalizePortuguese(key), normalizePortuguese(entry)]),
    );
  }
  return value;
}

for (const slug of ["cambridge", "chef", "grammar", "harvard", "iq", "mechanic", "memory", "midwifery", "nursing", "oxford", "paramedic", "vision", "years-left"]) {
  const file = path.join(quizRoot, slug, "pt.json");
  const content = JSON.parse(await fs.readFile(file, "utf8"));
  await fs.writeFile(file, `${JSON.stringify(normalizePortuguese(content), null, 2)}\n`);
}

// Final native-language checkpoint pass. Memory previously retained an older
// "profile mapping" narrative after the English funnel moved to direct round
// progress. Keep the translated checkpoint and career copies in lockstep with
// the current five-stage experience.
const memoryCheckpointCopy = {
  fr: [
    ["Mémoire immédiate terminée", "La manche suivante ajoute des images et des détails."],
    ["Mémoire visuelle réussie", "Les nombres et la mémoire de travail viennent ensuite."],
    ["Vous avez dépassé la moitié", "Le piège de la mémoire vient ensuite."],
    ["Dernier défi mémoire à suivre", "Une dernière manche va tester ce qui est resté en mémoire."],
    ["TEST DE MÉMOIRE TERMINÉ", "Votre résultat de mémoire est prêt à être dévoilé."],
  ],
  de: [
    ["Sofortiges Erinnern abgeschlossen", "In der nächsten Runde kommen Bilder und Details hinzu."],
    ["Visuelles Erinnern geschafft", "Als Nächstes folgen Zahlen und Arbeitsgedächtnis."],
    ["Mehr als die Hälfte geschafft", "Als Nächstes kommt die Gedächtnisfalle."],
    ["Finale Gedächtnisaufgabe als Nächstes", "Eine letzte Runde prüft, was noch hängen geblieben ist."],
    ["GEDÄCHTNISTEST ABGESCHLOSSEN", "Ihr Gedächtnisergebnis kann jetzt angezeigt werden."],
  ],
  it: [
    ["Memoria immediata completata", "Il prossimo round aggiunge immagini e dettagli."],
    ["Memoria visiva superata", "Ora arrivano numeri e memoria di lavoro."],
    ["Hai superato la metà", "Ora arriva la trappola della memoria."],
    ["Ora arriva la sfida finale di memoria", "Un ultimo round verificherà che cosa è rimasto impresso."],
    ["TEST DI MEMORIA COMPLETATO", "Il risultato di memoria è pronto per essere svelato."],
  ],
  nl: [
    ["Snelle herinnering voltooid", "De volgende ronde voegt beelden en details toe."],
    ["Visuele herinnering gehaald", "Hierna volgen getallen en werkgeheugen."],
    ["Je bent over de helft", "De geheugenval komt hierna."],
    ["Hierna volgt de laatste geheugenuitdaging", "Nog één ronde test wat is blijven hangen."],
    ["GEHEUGENTEST VOLTOOID", "Je geheugenresultaat staat klaar om te bekijken."],
  ],
  es: [
    ["Recuerdo inmediato completado", "La siguiente ronda añade imágenes y detalles."],
    ["Recuerdo visual superado", "Ahora vienen los números y la memoria de trabajo."],
    ["Ya has superado la mitad", "Ahora viene la trampa de la memoria."],
    ["El desafío final de memoria viene a continuación", "Una última ronda pondrá a prueba lo que aún recuerdas."],
    ["PRUEBA DE MEMORIA COMPLETADA", "Tu resultado de memoria está listo para descubrirlo."],
  ],
  pt: [
    ["Memória imediata concluída", "A próxima etapa acrescenta imagens e detalhes."],
    ["Memória visual concluída", "Números e memória de trabalho vêm a seguir."],
    ["Mais de metade concluída", "A armadilha da memória vem a seguir."],
    ["O desafio final de memória vem a seguir", "Uma última etapa vai testar o que ainda ficou na memória."],
    ["TESTE DE MEMÓRIA CONCLUÍDO", "O resultado de memória está pronto para ser revelado."],
  ],
};

for (const locale of locales) {
  await edit("memory", locale, (content) => {
    memoryCheckpointCopy[locale].forEach(([title, message], index) => {
      Object.assign(content.checkpoint.reveals[index], { title, message });
      Object.assign(content.career.stages[index], {
        preAdTitle: title,
        preAdCopy: message,
      });
      for (const band of Object.values(content.career.stages[index].resultBands)) {
        Object.assign(band, { title, insight: message });
      }
    });
    const [, finalMessage] = memoryCheckpointCopy[locale][4];
    content.checkpoint.finalTitle = memoryCheckpointCopy[locale][4][0];
    content.checkpoint.finalCopy = finalMessage;
    content.checkpoint.finalBadge = memoryCheckpointCopy[locale][4][0];
  });
}

const grammarPronounCases = {
  fr: {
    question: "Quel pronom complète correctement la phrase ?",
    context: "Entre Lina et ___, cette décision doit rester confidentielle.",
    answers: ["moi", "je", "me", "le mien"],
  },
  de: {
    question: "Welches Pronomen ergänzt den Satz korrekt?",
    context: "Zwischen Lina und ___ bleibt diese Entscheidung vertraulich.",
    answers: ["mir", "ich", "mich", "mein"],
  },
  it: {
    question: "Quale pronome completa correttamente la frase?",
    context: "Tra Lina e ___, questa decisione deve restare riservata.",
    answers: ["me", "io", "mi", "mio"],
  },
  nl: {
    question: "Welk voornaamwoord maakt de zin correct af?",
    context: "Tussen Lina en ___ blijft deze beslissing vertrouwelijk.",
    answers: ["mij", "ik", "mijn", "ikzelf"],
  },
  es: {
    question: "¿Qué pronombre completa correctamente la oración?",
    context: "Entre Lina y ___, esta decisión debe quedar en privado.",
    answers: ["mí", "yo", "mi", "mío"],
  },
  pt: {
    question: "Qual pronome completa corretamente a frase?",
    context: "Entre Lina e ___, esta decisão deve ficar em privado.",
    answers: ["mim", "eu", "me", "meu"],
  },
};

for (const locale of locales) {
  await edit("grammar", locale, (content) => {
    Object.assign(question(content, "grammar-r5q4"), grammarPronounCases[locale], { correct: 0 });
  });
}

const grammarAgreementAnswers = {
  it: [
    "L’elenco degli ingredienti sono sul tavolo.",
    "L’elenco degli ingredienti è sul tavolo.",
    "L’elenco degli ingredienti erano sul tavolo.",
    "L’elenco degli ingredienti stanno sul tavolo.",
  ],
  es: [
    "La lista de ingredientes están sobre la mesa.",
    "La lista de ingredientes está sobre la mesa.",
    "La lista de ingredientes estaban sobre la mesa.",
    "La lista de ingredientes permanecen sobre la mesa.",
  ],
  pt: [
    "A lista de ingredientes estão sobre a mesa.",
    "A lista de ingredientes está sobre a mesa.",
    "A lista de ingredientes estavam sobre a mesa.",
    "A lista de ingredientes permanecem sobre a mesa.",
  ],
};

for (const [locale, answers] of Object.entries(grammarAgreementAnswers)) {
  await edit("grammar", locale, (content) => {
    Object.assign(question(content, "grammar-r10q1"), { answers, correct: 1 });
  });
}

await edit("mechanic", "pt", (content) => {
  const replaceEverywhere = (value) => {
    if (typeof value === "string") {
      return value
        .replaceAll("Travagem/frenagem e aderência", "Controlo e aderência")
        .replaceAll("Fluidos, travagem/frenagem e aderência", "Fluidos, controlo e aderência")
        .replaceAll("Vibração. Direção. Travagem/frenagem. Sistemas.", "Vibração. Direção. Controlo. Sistemas.")
        .replaceAll("travagem/frenagem", "sistema de controlo")
        .replaceAll("travão/freio", "sistema de controlo");
    }
    if (Array.isArray(value)) return value.map(replaceEverywhere);
    if (value && typeof value === "object") {
      return Object.fromEntries(Object.entries(value).map(([key, entry]) => [replaceEverywhere(key), replaceEverywhere(entry)]));
    }
    return value;
  };
  Object.assign(content, replaceEverywhere(content));

  const warning = question(content, "mech-r1q2");
  if (warning) {
    warning.question = "Uma luz vermelha de aviso permanece acesa depois de desativar o bloqueio de estacionamento. Qual é a opção mais segura?";
    warning.answers[warning.correct] = "Parar em segurança e mandar verificar o sistema";
  }
  question(content, "mech-r3q4").question = "O nível do fluido do sistema está abaixo da marca mínima. Qual é a resposta correta?";
  question(content, "mech-r3q6").question = "Este fluido pode danificar a pintura. O que deve ser feito depois de um derrame?";
  question(content, "mech-r5q2").question = "Qual é o efeito mais provável de um filtro de ar obstruído?";
  question(content, "mech-r5q4").question = "Qual é a função básica de um injetor de combustível?";

  const r9q1 = question(content, "mech-r9q1");
  r9q1.question = "O veículo puxa para a esquerda apenas ao reduzir a velocidade, e a roda dianteira esquerda fica anormalmente quente. Qual é a causa mais provável?";
  r9q1.answers[r9q1.correct] = "Uma pinça presa na roda dianteira esquerda";
});

await edit("grammar", "pt", (content) => {
  const replaceBadge = (value) => {
    if (typeof value === "string") return value.replaceAll("crachá", "cartão de identificação").replaceAll("Crachá", "Cartão de identificação");
    if (Array.isArray(value)) return value.map(replaceBadge);
    if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([key, entry]) => [replaceBadge(key), replaceBadge(entry)]));
    return value;
  };
  Object.assign(content, replaceBadge(content));
});

await edit("chef", "pt", (content) => {
  question(content, "chef-r3q3").question = "A receita pede que o recipiente de forno seja pré-aquecido antes de receber os legumes. O que se consegue com esse pré-aquecimento?";
  question(content, "chef-r5q3").question = "A receita pede que a massa folhada seja refrigerada até ficar firme, mas ainda flexível. Qual é a razão para parar nesse ponto?";
  question(content, "chef-r10q4").question = "Uma receita pede 100 g de manteiga, mas foram usados 200 g. O que explica que os biscoitos tenham ficado mais espalhados?";
});

await edit("vision", "pt", (content) => {
  question(content, "vision-r9q1").question = "Os quadrados centrais são idênticos. O que pode fazê-los parecer diferentes?";
});

const foldAssetCopy = {
  fr: {
    title: "Deux plis et une perforation",
    desc: "Un carré est plié de gauche à droite, puis de haut en bas. Un trou est perforé à travers le carré plié ; le résultat déplié reste à déterminer.",
    labels: ["PLIER DE GAUCHE À DROITE", "PLIER DE HAUT EN BAS", "PERFORER UNE FOIS", "DÉPLIER"],
  },
  de: {
    title: "Zweimal falten und einmal lochen",
    desc: "Ein Quadrat wird von links nach rechts und anschließend von oben nach unten gefaltet. Durch das gefaltete Quadrat wird einmal gelocht; das Ergebnis nach dem Auffalten ist unbekannt.",
    labels: ["VON LINKS NACH RECHTS FALTEN", "VON OBEN NACH UNTEN FALTEN", "EINMAL LOCHEN", "AUFFALTEN"],
  },
  it: {
    title: "Due pieghe e un foro",
    desc: "Un quadrato viene piegato da sinistra a destra e poi dall’alto verso il basso. Si pratica un foro nel quadrato piegato; il risultato dopo la riapertura è da determinare.",
    labels: ["PIEGA DA SINISTRA A DESTRA", "PIEGA DALL'ALTO VERSO IL BASSO", "FORA UNA VOLTA", "RIAPRI"],
  },
  nl: {
    title: "Twee vouwen en één gaatje",
    desc: "Een vierkant wordt van links naar rechts en daarna van boven naar beneden gevouwen. Er wordt één gaatje door het gevouwen vierkant gemaakt; het resultaat na het openvouwen is nog onbekend.",
    labels: ["VOUW VAN LINKS NAAR RECHTS", "VOUW VAN BOVEN NAAR BENEDEN", "MAAK ÉÉN GAATJE", "VOUW OPEN"],
  },
  es: {
    title: "Dos dobleces y un agujero",
    desc: "Un cuadrado se dobla de izquierda a derecha y después de arriba abajo. Se hace un agujero en el cuadrado doblado; el resultado al desdoblarlo es una incógnita.",
    labels: ["DOBLA DE IZQUIERDA A DERECHA", "DOBLA DE ARRIBA ABAJO", "HAZ UN SOLO AGUJERO", "DESDOBLA"],
  },
  pt: {
    title: "Duas dobras e um furo",
    desc: "Um quadrado é dobrado da esquerda para a direita e depois de cima para baixo. Faz-se um furo no quadrado dobrado; o resultado depois de o desdobrar é desconhecido.",
    labels: ["DOBRAR DA ESQUERDA PARA A DIREITA", "DOBRAR DE CIMA PARA BAIXO", "FAZER UM FURO", "DESDOBRAR"],
  },
};

const foldAssetDirectory = path.join(quizRoot, "vision", "assets", "icons");
const foldAssetSource = await fs.readFile(path.join(foldAssetDirectory, "paper-fold-punch.svg"), "utf8");
for (const [locale, copy] of Object.entries(foldAssetCopy)) {
  const escaped = (value) => value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
  let localizedSvg = foldAssetSource
    .replace("Two folds and one punch", escaped(copy.title))
    .replace("A square folds from left to right, the half-sheet folds down, one hole is punched through the folded square, and the unfolded result is unknown.", escaped(copy.desc))
    .replace("FOLD LEFT TO RIGHT", escaped(copy.labels[0]))
    .replace("FOLD TOP TO BOTTOM", escaped(copy.labels[1]))
    .replace("PUNCH ONCE", escaped(copy.labels[2]))
    .replace("UNFOLD", escaped(copy.labels[3]));

  // Long translated instructions should fit comfortably in the fixed card at
  // 320 px without character wrapping or clipping.
  localizedSvg = localizedSvg
    .replace(/font-size="19" font-weight="800" text-anchor="middle">/g, 'font-size="15" font-weight="800" text-anchor="middle">')
    .replace(/font-size="18" font-weight="800" text-anchor="middle">/g, 'font-size="16" font-weight="800" text-anchor="middle">');
  await fs.writeFile(path.join(foldAssetDirectory, `paper-fold-punch-${locale}.svg`), localizedSvg);

  await edit("vision", locale, (content) => {
    const target = question(content, "vision-r10q4");
    target.image.src = `/quizzes/vision/assets/icons/paper-fold-punch-${locale}.svg?v=20260823-1`;
  });
}

console.log("Repaired locale-specific question, placeholder, and visual-text defects.");
