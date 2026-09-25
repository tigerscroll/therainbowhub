// Reviewed shared copy for the standard chapter experience. Matching source
// meanings keeps these corrections independent of question order and IDs.
import {reviewedDomain} from './reviewed-domain.mjs';
import {correctTerm} from './corrections.mjs';
import {polishPortugueseDomain} from './portuguese-domain.mjs';
const languages = ['fr','de','it','nl','es','pt','ar'];
const terms = {
  Diaphragm: 'Diaphragme|Zwerchfell|Diaframma|Middenrif|Diafragma|Diafragma|الحجاب الحاجز',
  Radius: 'Radius|Speiche|Radio|Spaakbeen|Radio|Rádio|الكعبرة',
  Appendix: 'Appendice|Wurmfortsatz|Appendice|Wormvormig aanhangsel|Apéndice|Apêndice|الزائدة الدودية',
};
const scoreRows = {
  passed: 'Vous avez atteint 80 % !|80 % erreicht!|Hai raggiunto l’80%!|Je hebt 80% gehaald!|¡Has alcanzado el 80 %!|Atingiu 80%!|لقد بلغت 80٪!',
  finished: 'Défi terminé|Herausforderung abgeschlossen|Sfida completata|Uitdaging voltooid|Reto completado|Desafio concluído|اكتمل التحدي',
  bestRound: 'Votre meilleur thème|Bestes Themengebiet|Il tuo tema migliore|Je beste onderwerp|Tu mejor tema|O seu melhor tema|أفضل موضوع لديك',
  overview: 'Votre score en un coup d’œil|Die Punktzahl auf einen Blick|Il tuo punteggio a colpo d’occhio|Je score in één oogopslag|Tu puntuación de un vistazo|A sua pontuação num relance|نتيجتك في لمحة',
  correct: 'Réponses correctes|Richtige Antworten|Risposte corrette|Goede antwoorden|Respuestas correctas|Respostas corretas|الإجابات الصحيحة',
  missed: 'Réponses incorrectes|Falsche Antworten|Risposte errate|Foute antwoorden|Respuestas incorrectas|Respostas incorretas|الإجابات غير الصحيحة',
  target: 'Bonnes réponses pour atteindre 80 %|Richtige Antworten für 80 %|Risposte corrette per raggiungere l’80%|Goede antwoorden voor 80%|Respuestas correctas para llegar al 80 %|Respostas corretas para atingir 80%|الإجابات الصحيحة اللازمة لبلوغ 80٪',
  breakdown: 'Vos résultats par thème|Ergebnisse nach Themengebiet|I tuoi risultati per tema|Je resultaten per onderwerp|Tus resultados por tema|Os seus resultados por tema|نتائجك حسب الموضوع',
  snapshot: 'Ce que révèle ce résultat|Was das Ergebnis zeigt|Cosa rivela il risultato|Wat je resultaat laat zien|Lo que muestra tu resultado|O que o resultado revela|ما الذي تظهره نتيجتك',
  targetReached: 'Objectif de 80 % atteint|80-%-Ziel erreicht|Obiettivo dell’80% raggiunto|Doel van 80% gehaald|Objetivo del 80 % alcanzado|Objetivo de 80% atingido|تم بلوغ هدف 80٪',
  targetRemaining: 'Il manque encore des bonnes réponses pour atteindre 80 %.|Bis zu 80 % fehlen noch richtige Antworten.|Servono altre risposte corrette per raggiungere l’80%.|Er zijn nog goede antwoorden nodig om 80% te halen.|Faltan más respuestas correctas para llegar al 80 %.|Faltam mais respostas corretas para atingir 80%.|تحتاج إلى مزيد من الإجابات الصحيحة لبلوغ 80٪.',
};
const steps = [
  'Lisez les indices et choisissez une réponse.|Lesen Sie die Hinweise und wählen Sie eine Antwort.|Leggi gli indizi e scegli una risposta.|Lees de aanwijzingen en kies een antwoord.|Lee las pistas y elige una respuesta.|Leia as pistas e escolha uma resposta.|اقرأ الأدلة واختر إجابة.',
  'Découvrez votre profil pour ce thème, puis passez à un nouveau défi.|Sehen Sie sich Ihr Profil zum aktuellen Thema an und entdecken Sie die nächste Herausforderung.|Scopri il tuo profilo per questo tema, poi passa alla prossima sfida.|Bekijk je profiel voor dit onderwerp en ga verder met een nieuwe uitdaging.|Descubre tu perfil en este tema y pasa al siguiente reto.|Descubra o seu perfil neste tema e avance para um novo desafio.|اكتشف نمط أدائك في هذا الموضوع، ثم انتقل إلى تحدٍّ جديد.',
  'Découvrez votre résultat final et consultez, si vous le souhaitez, les réponses aux questions manquées.|Sehen Sie Ihr Endergebnis an und prüfen Sie auf Wunsch die richtigen Lösungen zu den falsch beantworteten Fragen.|Scopri il risultato finale e, se vuoi, rivedi le risposte alle domande sbagliate.|Bekijk je eindresultaat en bekijk desgewenst de goede antwoorden bij vragen die je fout had.|Descubre tu resultado final y, si quieres, repasa las respuestas de las preguntas que fallaste.|Veja o resultado final e, se quiser, consulte as respostas corretas às perguntas em que errou.|اعرض نتيجتك النهائية، ويمكنك مراجعة الإجابات الصحيحة للأسئلة التي أخطأت فيها.',
];
const genericBodies = 'Reliez les faits, repérez les détails et mettez vos connaissances à l’épreuve. Chaque série aborde un nouveau thème. À la fin de chaque série, découvrez le profil qui se dessine dans vos réponses avant de poursuivre le défi.|Verknüpfen Sie Fakten, erkennen Sie Details und stellen Sie Ihr Wissen auf die Probe. Jede Fragerunde greift ein neues Thema auf. Anschließend zeigt ein Themenprofil, wie Sie abgeschnitten haben, bevor die nächste Herausforderung beginnt.|Collega i fatti, cogli i dettagli e metti alla prova le tue conoscenze. Ogni gruppo di domande esplora un nuovo tema. Alla fine scopri il profilo che emerge dalle tue risposte, prima di passare alla prossima sfida.|Leg verbanden, ontdek details en test je kennis. Elke reeks vragen verkent een nieuw onderwerp. Daarna zie je welk profiel bij je antwoorden past, voordat je verdergaat met een nieuwe uitdaging.|Relaciona los hechos, fíjate en los detalles y pon a prueba tus conocimientos. Cada grupo de preguntas explora un nuevo tema. Al terminar, descubre el perfil que reflejan tus respuestas antes de seguir con el reto.|Relacione as informações, observe os detalhes e teste os seus conhecimentos. Cada grupo de perguntas explora um novo tema. No fim de cada grupo, descubra o perfil que as suas respostas revelam antes de continuar o desafio.|اربط بين المعلومات، وانتبه إلى التفاصيل، واختبر معرفتك. تستكشف كل مجموعة من الأسئلة موضوعًا جديدًا. وفي نهايتها، اكتشف نمط أدائك من خلال إجاباتك قبل الانتقال إلى التحدي التالي.';
const germanProfileCopies = [
  'Sie haben fast alle Fragen richtig beantwortet. In der Auswertung sehen Sie, wie sich Ihre Stärken auf die einzelnen Themen verteilen.',
  'Sie haben viele Zusammenhänge richtig erkannt. Die Auswertung zeigt, welche Themen Ihnen besonders gut lagen.',
  'Sie konnten viele Fakten und Hinweise miteinander verbinden. Die Auswertung zeigt Ihre Stärken und die Themen, bei denen sich ein zweiter Blick lohnt.',
  'Bei mehreren Themen haben Sie die richtigen Hinweise erkannt. In der Antwortübersicht können Sie die Fragen nachlesen, die Sie überrascht haben.',
  'Einige Themen waren Ihnen vertrauter als andere. Die Antwortübersicht zeigt die richtigen Lösungen und gibt Ihnen Anregungen für einen neuen Versuch.',
];
const column = (row, locale) => row?.split('|')[languages.indexOf(locale)];
function walk(value, callback, parts = []) {
  if (typeof value === 'string') return callback(value, parts);
  if (Array.isArray(value)) return value.map((item, index) => walk(item, callback, [...parts, String(index)]));
  if (value && typeof value === 'object') for (const [key, item] of Object.entries(value)) value[key] = walk(item, callback, [...parts, key]);
  return value;
}

export function polishCatalogue(slug, locale, copy, source, manifest) {
  walk(copy, (value, parts) => {
    // Preserve the user's existing headlines and landing subtitles.
    if (parts[0] === 'title' || (parts[0] === 'landing' && parts[1] === 'intro')) return value;
    const original = parts.reduce((object, key) => object?.[key], source);
    value = reviewedDomain(slug, locale, value, original, parts);
    if (slug === 'nun' && parts.includes('questions')) value = correctTerm(slug, locale, original) ?? value;
    if (parts.includes('answers') && terms[original]) value = column(terms[original], locale);
    if (locale === 'nl') value = value.replaceAll('akkoordlijn', 'koorde').replaceAll('entertainmentuitdaging', 'quiz voor ontspanning').replaceAll('entertainmentquiz', 'quiz voor ontspanning').replaceAll('antwoordbeoordeling', 'antwoordenoverzicht').replaceAll('controlepunten', 'tussenresultaten').replaceAll('Controlepunten', 'Tussenresultaten').replaceAll('controlepunt', 'tussenresultaat').replaceAll('tussenresultaaten', 'tussenresultaten').replaceAll('een optionele antwoordenoverzicht', 'een optioneel antwoordenoverzicht');
    if (locale === 'de') {
      value = value.replaceAll('Was erkennst du wieder?', 'Welche Details sind vertraut?');
      if (original?.startsWith('You answered almost every question correctly.')) value = germanProfileCopies[0];
      if (slug === 'vision' && original?.startsWith('You cleared the 80% challenge.')) value = 'Sie haben die 80-%-Marke erreicht. Die meisten Muster, Vergleiche und kleinen visuellen Veränderungen haben Sie richtig erkannt.';
    }
    return value;
  });
  if (locale === 'nl' && /APTITUDE/.test(copy.results.name)) copy.results.name = 'JOUW RESULTAAT';
  if (manifest.engine.scoring === 'correct-answer') {
    const score = copy.results.score;
    for (const key of ['passed','finished','bestRound']) if (score[key]) score[key] = column(scoreRows[key], locale);
    for (const key of Object.keys(score.insights ?? {})) if (scoreRows[key]) score.insights[key] = column(scoreRows[key], locale);
    if (!['memory','vision'].includes(slug)) copy.about.howToPlay.steps = steps.map(row => column(row, locale));
    if (source.about.body.startsWith('Connect the facts, notice the details')) copy.about.body = column(genericBodies, locale);
    if (locale === 'de' && Object.keys(copy.results.profiles).length === 5 && !['vision','treatments'].includes(slug)) {
      Object.values(copy.results.profiles).forEach((profile, index) => {profile.copy = germanProfileCopies[index];});
    }
  }
  if (locale === 'de' && slug === 'memory') polishGermanMemory(copy);
  if (locale === 'pt') polishPortugueseDomain(slug, copy, manifest);
  if (locale === 'de' && slug === 'personality') polishGermanPersonality(copy);
  if (locale === 'nl' && slug === 'personality') copy.about.body = 'Ontdek hoe je contact maakt, je dag indeelt, je nieuwsgierigheid volgt en omgaat met veranderingen. Kies wat natuurlijk voelt, zonder naar een bepaald resultaat toe te werken.\n\nNa elk onderwerp zie je welke op een land geïnspireerde stijl bij je antwoorden past. Je eindresultaat combineert al je keuzes. Je kunt daarna een uitgebreid overzicht van je voorkeuren bekijken. Een korte advertentie opent de quiz; bij elk tussenresultaat en voor het optionele overzicht krijg je opnieuw een advertentie aangeboden. Je voortgang wordt op dit apparaat bewaard.\n\nItalië, Japan, Australië en Zweden staan in deze quiz voor speelse levensstijlen. Het resultaat zegt niets over je nationaliteit, afkomst of culturele identiteit en bepaalt niet waar je zou moeten wonen.';
  if (locale === 'nl' && slug === 'memory') {
    copy.about.body = 'Onthoud woorden, cijferreeksen, mensen, plaatsen en kleine details. Sommige daarvan komen later terug. Elke reeks vragen daagt je geheugen op een andere manier uit. Tussendoor zie je je profiel voor het onderwerp; aan het einde ontdek je je totaalscore en je sterke punten.\n\nBekijk elke geheugenkaart zo lang als je nodig hebt en tik op ‘Ik heb het onthouden’. De kaart verdwijnt voordat je antwoord geeft. Sommige details worden pas later opnieuw gevraagd. Snelheid heeft geen invloed op je score. Een korte advertentie opent de quiz. Na elk onderwerp wordt een nieuwe advertentie aangeboden om verder te gaan of je resultaat te bekijken. Het optionele antwoordenoverzicht heeft een eigen advertentie. Je voortgang blijft op dit apparaat bewaard.\n\nDit is een quiz voor ontspanning, geen gestandaardiseerde geheugentest. Aandacht, vermoeidheid, afleiding, vertrouwdheid en toeval kunnen het resultaat beïnvloeden. De quiz beoordeelt geen hersengezondheid en stelt geen geheugenproblemen vast.';
    copy.about.howToPlay.steps = ['Bekijk de hele geheugenkaart en tik op ‘Ik heb het onthouden’. Sommige details worden later opnieuw gevraagd.', 'Kies telkens één antwoord. Je snelheid heeft geen invloed op je score.', 'Ontdek de verschillende geheugenopdrachten, je eindresultaat en desgewenst de goede antwoorden.'];
  }
}

function polishGermanMemory(copy) {
  copy.about.body = 'Merke dir Wörter, Zahlenfolgen, Personen, Orte und kleine Details. Manche davon tauchen später wieder auf. Jede Fragerunde stellt dein Gedächtnis auf eine andere Art auf die Probe. Zwischendurch siehst du dein Profil zum jeweiligen Thema; am Ende erfährst du deine Gesamtpunktzahl und deine Stärken.\n\nPräge dir jede Merktafel in Ruhe ein und tippe dann auf „Ich bin bereit“. Die Tafel wird ausgeblendet, bevor du antwortest. Manche Details werden erst später abgefragt. Deine Geschwindigkeit beeinflusst die Punktzahl nicht. Eine kurze Werbung öffnet das Quiz. Nach jedem Thema wird eine weitere angeboten, um fortzufahren oder das Ergebnis zu sehen. Für die freiwillige Antwortübersicht gibt es eine eigene Werbung. Dein Fortschritt wird auf diesem Gerät gespeichert.\n\nDies ist ein Unterhaltungsquiz und kein standardisierter Gedächtnistest. Aufmerksamkeit, Müdigkeit, Ablenkungen, Vertrautheit und Zufall können das Ergebnis beeinflussen. Das Quiz beurteilt weder die Gesundheit des Gehirns noch mögliche Gedächtnisstörungen.';
  copy.about.howToPlay.steps = ['Präge dir die ganze Merktafel ein und tippe dann auf „Ich bin bereit“. Einige Details werden später erneut abgefragt.', 'Wähle jeweils eine Antwort. Deine Geschwindigkeit beeinflusst die Punktzahl nicht.', 'Entdecke die verschiedenen Gedächtnisaufgaben, dein Endergebnis und auf Wunsch die richtigen Antworten.'];
  copy.about.disclaimer = 'Nur zur Unterhaltung und Selbstreflexion. Kein medizinischer, neurologischer oder kognitiver Test. Bei Sorgen um dein Gedächtnis oder deine Gesundheit ist ärztlicher Rat sinnvoll.';
  const copies = ['Du hast dir Wörter, Details und Reihenfolgen sehr genau gemerkt. Auch die späteren Rückfragen konnten dich kaum aus dem Konzept bringen.', 'Du hast die 80-%-Marke erreicht. Aufmerksamkeit und Erinnerung haben bei diesem Versuch gut zusammengespielt.', 'Du hast dir vieles gemerkt. Einige ähnlich klingende Antworten und kleine Ablenkungen haben den Unterschied gemacht.', 'Einige Details blieben besonders gut hängen. Die Auswertung zeigt, welche Arten von Aufgaben dir am besten lagen.', 'Du hast dir manche Einzelheiten gut gemerkt, andere sind unterwegs verloren gegangen. In der Antwortübersicht kannst du nachsehen, welche es waren.', 'Einige Details blieben hängen, andere gingen zwischen den Ablenkungen verloren. Das ist eine Momentaufnahme dieses Versuchs. Mit mehr Ruhe kann ein neuer Versuch anders ausfallen.'];
  Object.values(copy.results.profiles).forEach((profile, index) => {profile.copy = copies[index];});
  copy.results.score.strongest = 'Dein stärkster Gedächtnisbereich';
  copy.results.score.trickiest = 'Dein schwierigster Gedächtnisbereich';
  copy.results.score.insights.breakdown = 'Deine Ergebnisse nach Gedächtnisbereich';
}

function polishGermanPersonality(copy) {
  copy.about.body = 'Entdecke, wie du auf Menschen zugehst, deinen Tag gestaltest, deiner Neugier folgst und auf neue Pläne reagierst. Wähle, was sich für dich natürlich anfühlt. Es gibt kein Ergebnis, auf das du hinarbeiten musst.\n\nNach jedem Thema siehst du, welche von einem Land inspirierte Lebensart zu deinen Antworten passt. Das Endergebnis verbindet alle deine Entscheidungen. Eine kurze Werbung öffnet das Quiz; weitere werden nach jedem Thema und vor der freiwilligen Detailauswertung angeboten. Dein Fortschritt bleibt auf diesem Gerät gespeichert.\n\nItalien, Japan, Australien und Schweden stehen hier für spielerische Lebensstile. Das Ergebnis bestimmt weder deine Nationalität noch deine Herkunft, kulturelle Identität oder deinen Wohnort.';
  copy.about.howToPlay.steps = ['Wähle die Antwort, die am besten zu dir passt. Es gibt kein Richtig oder Falsch.', 'Entdecke nach jedem Thema, welche Lebensart sich in deinen Antworten zeigt.', 'Sieh dir dein Länderergebnis an und erkunde auf Wunsch die Vorlieben dahinter.'];
  const countries = ['Italien','Japan','Australien','Schweden'];
  const copies = ['Du schätzt Herzlichkeit, Ausdruck und gemeinsame Momente. Gute Gespräche, schönes Essen und Zeit mit wichtigen Menschen geben deinem Alltag Farbe.', 'Aufmerksamkeit, Sorgfalt und Neugier prägen deine Antworten. Du schätzt kleine Rituale und Erlebnisse, die Vertrautes mit neuen Ideen verbinden.', 'Freiraum, unkomplizierte Gespräche und Lust auf Neues prägen deine Antworten. Du magst Pläne, aus denen auch einmal ein Abenteuer werden darf.', 'Du schätzt Ausgewogenheit, Einfachheit und durchdachte Details. Zeit für dich, Nähe zur Natur und gute Beziehungen passen für dich zusammen.'];
  Object.values(copy.results.profiles).forEach((profile, index) => {profile.title = `Du passt zu ${countries[index]}`; profile.copy = copies[index];});
  const reveal = copy.results.profileReveal;
  Object.assign(reveal, {eyebrow:'DEIN LÄNDERERGEBNIS',auraLabel:'DEINE AUSSTRAHLUNG',strongestEnergy:'Dein stärkster Ländereinfluss',hiddenEnergy:'Dein zweitstärkster Einfluss',consistency:'SO KLAR IST DEIN PROFIL'});
  Object.assign(reveal.breakdown,{eyebrow:'DEINE LÄNDEREINFLÜSSE',title:'Entdecke, wie dein Ergebnis entsteht',copy:'Sieh dir die Vorlieben hinter deinem Ergebnis an und erfahre, welches weitere Land am ehesten dazu passt.',button:'Meine Auswertung ansehen',adNote:'Eine kurze Werbung, dann öffnet sich deine Auswertung.',heading:'DEIN LÄNDERPROFIL'});
}
