import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const quizRoot = path.join(root, "data", "quizzes");
const locales = ["fr", "de", "it", "nl", "es", "pt"];

const common = {
  fr: {
    continue: "Continuer",
    startTest: "Commencer le test",
    startQuiz: "Commencer le quiz",
    start: "Commencer",
    seeResult: "Voir mon résultat",
    shortAdContinue: "Une courte publicité, puis continuez.",
    shortAdResult: "Une courte publicité, puis découvrez votre résultat.",
    difficulties: ["Fondamentaux", "Intermédiaire", "Confirmé", "Avancé", "Évaluation finale"],
    challengeEyebrows: ["PROCHAIN DÉFI · INTERMÉDIAIRE", "PROCHAIN DÉFI · CONFIRMÉ", "PROCHAIN DÉFI · AVANCÉ", "PROCHAIN DÉFI · ÉVALUATION FINALE"],
    examEyebrows: ["PROCHAINE ÉPREUVE · INTERMÉDIAIRE", "PROCHAINE ÉPREUVE · CONFIRMÉ", "PROCHAINE ÉPREUVE · AVANCÉ", "PROCHAINE ÉPREUVE · ÉVALUATION FINALE"],
    examGates: ["Première épreuve terminée", "Deuxième épreuve terminée", "Vous avez dépassé la moitié", "Évaluation finale en vue"],
    examCopies: ["Bon départ. L’épreuve suivante est prête.", "La difficulté augmente à l’épreuve suivante.", "L’épreuve avancée vous attend.", "Il ne reste plus que l’évaluation finale."],
    finalExamCopy: "Votre résultat est prêt à être dévoilé.",
  },
  de: {
    continue: "Weiter",
    startTest: "Test starten",
    startQuiz: "Quiz starten",
    start: "Starten",
    seeResult: "Mein Ergebnis ansehen",
    shortAdContinue: "Kurze Werbung, dann geht es weiter.",
    shortAdResult: "Kurze Werbung, dann sehen Sie Ihr Ergebnis.",
    difficulties: ["Grundlagen", "Aufbau", "Fortgeschritten", "Anspruchsvoll", "Abschlussprüfung"],
    challengeEyebrows: ["NÄCHSTE HERAUSFORDERUNG · AUFBAU", "NÄCHSTE HERAUSFORDERUNG · FORTGESCHRITTEN", "NÄCHSTE HERAUSFORDERUNG · ANSPRUCHSVOLL", "NÄCHSTE HERAUSFORDERUNG · ABSCHLUSSPRÜFUNG"],
    examEyebrows: ["NÄCHSTER PRÜFUNGSABSCHNITT · AUFBAU", "NÄCHSTER PRÜFUNGSABSCHNITT · FORTGESCHRITTEN", "NÄCHSTER PRÜFUNGSABSCHNITT · ANSPRUCHSVOLL", "NÄCHSTER PRÜFUNGSABSCHNITT · ABSCHLUSSPRÜFUNG"],
    examGates: ["Erster Prüfungsabschnitt abgeschlossen", "Zweiter Prüfungsabschnitt abgeschlossen", "Mehr als die Hälfte geschafft", "Als Nächstes: die Abschlussprüfung"],
    examCopies: ["Guter Start. Der nächste Abschnitt ist bereit.", "Im nächsten Abschnitt steigt die Schwierigkeit.", "Als Nächstes folgt der anspruchsvolle Abschnitt.", "Nur die Abschlussprüfung steht noch aus."],
    finalExamCopy: "Ihr Ergebnis kann jetzt angezeigt werden.",
  },
  it: {
    continue: "Continua",
    startTest: "Inizia il test",
    startQuiz: "Inizia il quiz",
    start: "Inizia",
    seeResult: "Vedi il mio risultato",
    shortAdContinue: "Un breve annuncio, poi si continua.",
    shortAdResult: "Un breve annuncio, poi vedrai il risultato.",
    difficulties: ["Fondamenti", "Intermedio", "Competente", "Avanzato", "Prova finale"],
    challengeEyebrows: ["PROSSIMA SFIDA · INTERMEDIO", "PROSSIMA SFIDA · COMPETENTE", "PROSSIMA SFIDA · AVANZATO", "PROSSIMA SFIDA · PROVA FINALE"],
    examEyebrows: ["PROSSIMA SEZIONE D’ESAME · INTERMEDIO", "PROSSIMA SEZIONE D’ESAME · COMPETENTE", "PROSSIMA SEZIONE D’ESAME · AVANZATO", "PROSSIMA SEZIONE D’ESAME · PROVA FINALE"],
    examGates: ["Prima sezione completata", "Seconda sezione completata", "Hai superato la metà", "Ora manca solo la prova finale"],
    examCopies: ["Buon inizio. La sezione successiva è pronta.", "La prossima sezione alza la difficoltà.", "Ora arriva la sezione avanzata.", "Resta soltanto la prova finale."],
    finalExamCopy: "Il risultato è pronto per essere svelato.",
  },
  nl: {
    continue: "Verder",
    startTest: "Start de test",
    startQuiz: "Start de quiz",
    start: "Start",
    seeResult: "Bekijk mijn resultaat",
    shortAdContinue: "Eerst een korte advertentie, daarna ga je verder.",
    shortAdResult: "Eerst een korte advertentie, daarna zie je je resultaat.",
    difficulties: ["Basis", "In ontwikkeling", "Gevorderd", "Uitdagend", "Eindtoets"],
    challengeEyebrows: ["VOLGENDE UITDAGING · IN ONTWIKKELING", "VOLGENDE UITDAGING · GEVORDERD", "VOLGENDE UITDAGING · UITDAGEND", "VOLGENDE UITDAGING · EINDTOETS"],
    examEyebrows: ["VOLGEND EXAMENONDERDEEL · IN ONTWIKKELING", "VOLGEND EXAMENONDERDEEL · GEVORDERD", "VOLGEND EXAMENONDERDEEL · UITDAGEND", "VOLGEND EXAMENONDERDEEL · EINDTOETS"],
    examGates: ["Eerste examenonderdeel voltooid", "Tweede examenonderdeel voltooid", "Je bent over de helft", "Hierna volgt de eindtoets"],
    examCopies: ["Goede start. Het volgende onderdeel staat klaar.", "Het volgende onderdeel wordt moeilijker.", "Het gevorderde onderdeel komt eraan.", "Alleen de eindtoets resteert nog."],
    finalExamCopy: "Je resultaat staat klaar om te bekijken.",
  },
  es: {
    continue: "Continuar",
    startTest: "Empezar el test",
    startQuiz: "Empezar el quiz",
    start: "Empezar",
    seeResult: "Ver mi resultado",
    shortAdContinue: "Primero, un anuncio breve; después, continúa.",
    shortAdResult: "Primero, un anuncio breve; después, verás tu resultado.",
    difficulties: ["Fundamentos", "En desarrollo", "Competente", "Avanzado", "Evaluación final"],
    challengeEyebrows: ["SIGUIENTE DESAFÍO · EN DESARROLLO", "SIGUIENTE DESAFÍO · COMPETENTE", "SIGUIENTE DESAFÍO · AVANZADO", "SIGUIENTE DESAFÍO · EVALUACIÓN FINAL"],
    examEyebrows: ["SIGUIENTE SECCIÓN DEL EXAMEN · EN DESARROLLO", "SIGUIENTE SECCIÓN DEL EXAMEN · COMPETENTE", "SIGUIENTE SECCIÓN DEL EXAMEN · AVANZADO", "SIGUIENTE SECCIÓN DEL EXAMEN · EVALUACIÓN FINAL"],
    examGates: ["Primera sección completada", "Segunda sección completada", "Ya has superado la mitad", "La evaluación final es la siguiente"],
    examCopies: ["Buen comienzo. La siguiente sección está lista.", "La próxima sección aumenta la dificultad.", "La sección avanzada viene a continuación.", "Solo queda la evaluación final."],
    finalExamCopy: "Tu resultado está listo para descubrirlo.",
  },
  pt: {
    continue: "Continuar",
    startTest: "Iniciar o teste",
    startQuiz: "Iniciar o quiz",
    start: "Iniciar",
    seeResult: "Ver o resultado",
    shortAdContinue: "Primeiro, um anúncio breve; depois, continue.",
    shortAdResult: "Primeiro, um anúncio breve; depois, veja o resultado.",
    difficulties: ["Fundamentos", "Em progressão", "Experiente", "Avançado", "Avaliação final"],
    challengeEyebrows: ["PRÓXIMO DESAFIO · EM PROGRESSÃO", "PRÓXIMO DESAFIO · EXPERIENTE", "PRÓXIMO DESAFIO · AVANÇADO", "PRÓXIMO DESAFIO · AVALIAÇÃO FINAL"],
    examEyebrows: ["PRÓXIMA PARTE DO EXAME · EM PROGRESSÃO", "PRÓXIMA PARTE DO EXAME · EXPERIENTE", "PRÓXIMA PARTE DO EXAME · AVANÇADO", "PRÓXIMA PARTE DO EXAME · AVALIAÇÃO FINAL"],
    examGates: ["Primeira parte do exame concluída", "Segunda parte do exame concluída", "Mais de metade concluída", "A avaliação final vem a seguir"],
    examCopies: ["Bom começo. A parte seguinte está pronta.", "A próxima parte aumenta a dificuldade.", "A parte avançada vem a seguir.", "Falta apenas a avaliação final."],
    finalExamCopy: "O resultado está pronto para ser revelado.",
  },
};

const entranceLabels = {
  cambridge: "CAMBRIDGE",
  chef: "CHEF",
  harvard: "HARVARD",
  midwifery: "MIDWIFERY",
  nursing: "NURSING",
  oxford: "OXFORD",
  paramedic: "PARAMEDIC",
};

const entranceTaglines = {
  fr: {
    cambridge: ["Suites. Relations. Déductions nettes.", "Variables. Preuves. Cause et effet.", "Données trompeuses. Étalonnage. Systèmes.", "Raisonnement en plusieurs étapes. Verdict scientifique."],
    chef: ["Outils. Temps. Organisation.", "Chaleur. Saveurs. Pâtisserie. Maîtrise.", "Outils. Saveurs. Cuisson. Précision.", "Toutes vos compétences culinaires réunies."],
    harvard: ["Preuves. Comparaisons. Arguments solides.", "Taux. Compromis. Ressources.", "Priorités concurrentes. Hypothèses cachées.", "Preuves croisées. Décision stratégique finale."],
    midwifery: ["Physiologie. Bien-être. Bases de la naissance.", "Consentement. Prévention des infections. Soutien.", "Évolutions. Premiers soins. Priorités.", "Indices multiples. Escalade sûre. Décision finale."],
    nursing: ["Systèmes. Mesures. Changements importants.", "Prévention des infections. Dignité. Clarté.", "Priorités concurrentes. Décisions réfléchies.", "Tendances. Sécurité. Jugement clinique intégré."],
    oxford: ["Preuves. Hypothèses. Arguments solides.", "Contraintes. Suites. Inférences précises.", "Affirmations plausibles. Informations manquantes.", "Raisonnement en plusieurs étapes. Sans hypothèses non étayées."],
    paramedic: ["Systèmes. Tendances. Signes vitaux.", "Dangers. Dignité. Communication claire.", "Indices concurrents. Priorités réfléchies.", "Tendances. Sécurité. Jugement intégré."],
  },
  de: {
    cambridge: ["Folgen. Zusammenhänge. Klare Schlüsse.", "Variablen. Belege. Ursache und Wirkung.", "Irreführende Daten. Kalibrierung. Systeme.", "Mehrstufiges Denken. Wissenschaftliches Urteil."],
    chef: ["Werkzeuge. Timing. Organisation.", "Hitze. Geschmack. Backen. Kontrolle.", "Werkzeuge. Aroma. Garpunkte. Präzision.", "Alle Küchenfertigkeiten in einer Prüfung."],
    harvard: ["Belege. Vergleiche. Starke Argumente.", "Kennzahlen. Zielkonflikte. Ressourcen.", "Konkurrierende Prioritäten. Verdeckte Annahmen.", "Verknüpfte Belege. Letzte Strategieentscheidung."],
    midwifery: ["Physiologie. Wohlbefinden. Grundlagen der Geburt.", "Einwilligung. Infektionsschutz. Unterstützung.", "Veränderungen. Frühe Versorgung. Prioritäten.", "Mehrere Hinweise. Sichere Eskalation. Letztes Urteil."],
    nursing: ["Körpersysteme. Messwerte. Wichtige Veränderungen.", "Infektionsschutz. Würde. Klare Kommunikation.", "Konkurrierende Prioritäten. Ruhige Entscheidungen.", "Trends. Sicherheit. Vernetztes Pflegeurteil."],
    oxford: ["Belege. Annahmen. Starke Argumente.", "Vorgaben. Folgen. Präzise Schlüsse.", "Plausible Behauptungen. Fehlende Informationen.", "Mehrstufiges Denken. Keine unbelegten Annahmen."],
    paramedic: ["Körpersysteme. Trends. Vitalzeichen.", "Gefahren. Würde. Klare Kommunikation.", "Konkurrierende Hinweise. Sichere Priorisierung.", "Trends. Sicherheit. Vernetztes Einsatzurteil."],
  },
  it: {
    cambridge: ["Sequenze. Relazioni. Deduzioni rigorose.", "Variabili. Prove. Causa ed effetto.", "Dati ingannevoli. Calibrazione. Sistemi.", "Ragionamento in più passaggi. Verdetto scientifico."],
    chef: ["Strumenti. Tempi. Organizzazione.", "Calore. Sapori. Pasticceria. Controllo.", "Strumenti. Sapori. Cottura. Precisione.", "Tutte le abilità di cucina in un’unica prova."],
    harvard: ["Prove. Confronti. Argomenti solidi.", "Tassi. Compromessi. Risorse.", "Priorità in conflitto. Ipotesi nascoste.", "Prove incrociate. Decisione strategica finale."],
    midwifery: ["Fisiologia. Benessere. Fondamenti della nascita.", "Consenso. Prevenzione delle infezioni. Sostegno.", "Cambiamenti. Prime cure. Priorità.", "Più indizi. Segnalazione sicura. Giudizio finale."],
    nursing: ["Sistemi corporei. Misurazioni. Cambiamenti importanti.", "Prevenzione delle infezioni. Dignità. Chiarezza.", "Priorità in conflitto. Decisioni calme.", "Andamenti. Sicurezza. Giudizio assistenziale integrato."],
    oxford: ["Prove. Ipotesi. Argomenti solidi.", "Vincoli. Sequenze. Deduzioni precise.", "Affermazioni plausibili. Informazioni mancanti.", "Ragionamento in più passaggi. Nessuna ipotesi priva di fondamento."],
    paramedic: ["Sistemi corporei. Andamenti. Parametri vitali.", "Pericoli. Dignità. Comunicazione chiara.", "Indizi in conflitto. Priorità lucide.", "Andamenti. Sicurezza. Giudizio integrato."],
  },
  nl: {
    cambridge: ["Reeksen. Verbanden. Heldere conclusies.", "Variabelen. Bewijs. Oorzaak en gevolg.", "Misleidende gegevens. Kalibratie. Systemen.", "Redeneren in stappen. Wetenschappelijk oordeel."],
    chef: ["Gereedschap. Timing. Organisatie.", "Hitte. Smaak. Bakken. Beheersing.", "Gereedschap. Smaak. Garing. Precisie.", "Alle keukenvaardigheden in één proef."],
    harvard: ["Bewijs. Vergelijkingen. Sterke argumenten.", "Percentages. Afwegingen. Middelen.", "Botsende prioriteiten. Verborgen aannames.", "Gekoppeld bewijs. Laatste strategische keuze."],
    midwifery: ["Fysiologie. Welzijn. Basis van de geboorte.", "Toestemming. Infectiepreventie. Ondersteuning.", "Veranderingen. Eerste zorg. Prioriteiten.", "Meerdere aanwijzingen. Veilige opschaling. Eindoordeel."],
    nursing: ["Lichaamssystemen. Metingen. Belangrijke veranderingen.", "Infectiepreventie. Waardigheid. Duidelijkheid.", "Botsende prioriteiten. Rustige beslissingen.", "Trends. Veiligheid. Geïntegreerd zorgoordeel."],
    oxford: ["Bewijs. Aannames. Sterke argumenten.", "Voorwaarden. Reeksen. Precieze conclusies.", "Aannemelijke beweringen. Ontbrekende informatie.", "Redeneren in stappen. Geen ongefundeerde aannames."],
    paramedic: ["Lichaamssystemen. Trends. Vitale functies.", "Gevaren. Waardigheid. Heldere communicatie.", "Botsende aanwijzingen. Rustig prioriteren.", "Trends. Veiligheid. Geïntegreerd oordeel."],
  },
  es: {
    cambridge: ["Secuencias. Relaciones. Deducciones claras.", "Variables. Pruebas. Causa y efecto.", "Datos engañosos. Calibración. Sistemas.", "Razonamiento en varios pasos. Veredicto científico."],
    chef: ["Herramientas. Tiempos. Organización.", "Calor. Sabores. Repostería. Control.", "Herramientas. Sabor. Cocción. Precisión.", "Todas tus habilidades culinarias reunidas."],
    harvard: ["Pruebas. Comparaciones. Argumentos sólidos.", "Porcentajes. Disyuntivas. Recursos.", "Prioridades enfrentadas. Supuestos ocultos.", "Pruebas cruzadas. Decisión estratégica final."],
    midwifery: ["Fisiología. Bienestar. Fundamentos del nacimiento.", "Consentimiento. Prevención de infecciones. Apoyo.", "Cambios. Primeros cuidados. Prioridades.", "Varias pistas. Aviso al equipo adecuado. Decisión final."],
    nursing: ["Sistemas corporales. Mediciones. Cambios importantes.", "Prevención de infecciones. Dignidad. Claridad.", "Prioridades enfrentadas. Decisiones serenas.", "Tendencias. Seguridad. Juicio asistencial integrado."],
    oxford: ["Pruebas. Supuestos. Argumentos sólidos.", "Restricciones. Secuencias. Deducciones precisas.", "Afirmaciones plausibles. Información ausente.", "Razonamiento en varios pasos. Sin supuestos no justificados."],
    paramedic: ["Sistemas corporales. Tendencias. Signos vitales.", "Peligros. Dignidad. Comunicación clara.", "Pistas enfrentadas. Prioridades serenas.", "Tendencias. Seguridad. Juicio integrado."],
  },
  pt: {
    cambridge: ["Sequências. Relações. Deduções claras.", "Variáveis. Evidências. Causa e efeito.", "Dados enganosos. Calibração. Sistemas.", "Raciocínio em vários passos. Veredito científico."],
    chef: ["Utensílios. Tempo. Organização.", "Calor. Sabores. Pastelaria. Domínio.", "Utensílios. Sabor. Ponto certo. Precisão.", "Todas as competências de cozinha reunidas."],
    harvard: ["Evidências. Comparações. Argumentos sólidos.", "Taxas. Dilemas. Recursos.", "Prioridades concorrentes. Pressupostos escondidos.", "Evidências cruzadas. Decisão estratégica final."],
    midwifery: ["Fisiologia. Bem-estar. Fundamentos do nascimento.", "Consentimento. Prevenção de riscos infecciosos. Apoio.", "Mudanças. Primeiros cuidados. Prioridades.", "Várias pistas. Encaminhamento seguro. Decisão final."],
    nursing: ["Sistemas do corpo. Medições. Mudanças importantes.", "Prevenção de riscos infecciosos. Dignidade. Clareza.", "Prioridades concorrentes. Decisões serenas.", "Tendências. Segurança. Avaliação integrada."],
    oxford: ["Evidências. Pressupostos. Argumentos sólidos.", "Restrições. Sequências. Deduções precisas.", "Afirmações plausíveis. Informação em falta.", "Raciocínio em vários passos. Sem pressupostos sem fundamento."],
    paramedic: ["Sistemas do corpo. Tendências. Sinais vitais.", "Perigos. Dignidade. Comunicação clara.", "Pistas concorrentes. Prioridades serenas.", "Tendências. Segurança. Avaliação integrada."],
  },
};

const localizedQuizCopy = {
  fr: {
    cambridge: ["Seuls 7 % réussissent ce test d’entrée à Cambridge", "Motifs, preuves scientifiques, données et mécanismes cachés testent la rigueur avec laquelle vous contrôlez chaque variable.", "Expériences, motifs et données se croisent : repérerez-vous la variable cachée avant qu’elle ne fausse votre conclusion ?", ["Fondamentaux de Cambridge", "Motifs et démonstrations", "Raisonnement scientifique", "Défi Cambridge", "Évaluation finale"]],
    chef: ["Seuls 12 % réussissent ce test d’entrée en cuisine", "Saveurs, cuisson, pâtisserie et pression du service testent votre sang-froid en cuisine.", "Saveurs, flammes, pâtisserie, gestion du temps et pression du service : prouvez que vous savez raisonner comme un chef quand la cuisine s’anime.", ["Initiation en cuisine", "Plan de travail", "Maîtrise culinaire", "Épreuve en cuisine", "Table du chef"]],
    grammar: ["Seuls 10 % réussissent ce quiz de grammaire", "Phrases bancales, pièges de ponctuation et formulations presque justes mettent votre œil à l’épreuve.", "Votre grammaire est-elle vraiment irréprochable ? Réparez les phrases, déjouez les pièges de ponctuation et repérez la faute avant qu’elle ne vous échappe.", ["Premier contrôle", "Construction des phrases", "Épreuve de précision", "Pièges grammaticaux", "Révision finale"]],
    harvard: ["Seuls 7 % réussissent ce test d’entrée à Harvard", "Preuves, chiffres, priorités et compromis testent la solidité de vos décisions.", "Preuves, données, compromis et logique se confrontent. Saurez-vous choisir la meilleure option avant qu’un détail oublié ne change tout ?", ["Dossier d’admission", "Preuves et analyse", "Décisions quantitatives", "Étude de cas", "Comité final"]],
    iq: ["Seuls 7 % réussissent ce test d’intelligence", "Motifs, règles numériques, liens entre les mots et pièges spatiaux testent votre raisonnement.", "Motifs, codes, liens entre les mots et pièges logiques s’enchaînent : combien de temps garderez-vous une longueur d’avance ?", ["Réflexion express", "Décodeur de motifs", "Logique sous pression", "Pièges de raisonnement", "Le coffre de l’intelligence"]],
    mechanic: ["Seuls 7 % réussissent ce quiz de mécanique automobile", "Voyants, pannes cachées et symptômes étranges testent votre diagnostic.", "Voyants allumés, bruits suspects et pannes cachées : trouvez le problème avant que la facture n’arrive.", ["Tableau de bord et moteur", "Fluides, freins et adhérence", "Air, carburant et allumage", "Diagnostic d’atelier", "Diagnostic final"]],
    memory: ["La plupart des adultes n’atteignent pas 80 % à ce test de mémoire", "Mots, images, nombres et rappels différés révèlent ce que votre mémoire conserve.", "Vous pensez avoir une mémoire infaillible ? Certains défis sont simples. D’autres sont conçus pour vous piéger.", ["Mémoire immédiate", "Images et détails", "Nombres et motifs", "Le piège de la mémoire", "Défi mémoire final"]],
    midwifery: ["Seuls 7 % réussissent ce test d’entrée en maïeutique", "Grossesse, naissance, soins du nouveau-né et jugement calme mettent votre attention à l’épreuve.", "Grossesse, travail et soins du nouveau-né : saurez-vous garder votre calme et repérer le détail essentiel ?", ["Premier rendez-vous", "Grossesse et naissance", "Respect et sécurité", "Décisions pendant le travail et après la naissance", "Épreuve finale de maïeutique"]],
    nursing: ["Seuls 7 % réussissent ce test d’entrée en soins infirmiers", "Anatomie, signes vitaux et décisions de soins testent votre jugement sous pression.", "Systèmes du corps, signes vitaux et soins : saurez-vous repérer l’essentiel et prendre la décision la plus sûre ?", ["Briefing dans le service", "Corps et observations", "Sécurité et communication", "Priorités sous pression", "Transmission finale"]],
    oxford: ["Seuls 7 % réussissent ce test d’entrée à Oxford", "Arguments, hypothèses et déductions précises testent votre résistance aux pièges logiques.", "Arguments, motifs et pièges logiques se croisent. Saurez-vous défendre la bonne réponse quand toutes semblent plausibles ?", ["Fondamentaux du tutorat", "Preuves et arguments", "Logique au tableau", "Pièges de l’entretien", "Tutorat final"]],
    paramedic: ["Seuls 8 % réussissent ce test d’entrée pour ambulanciers paramédicaux", "Dangers, signes vitaux et décisions rapides testent votre clarté d’esprit.", "Dangers sur les lieux, signes vitaux, calculs d’urgence et jugement calme : saurez-vous réfléchir clairement quand chaque indice compte ?", ["Briefing d’intervention", "Corps et signaux", "Sécurité et communication", "Décisions sous pression", "Intervention finale"]],
    vision: ["Seuls 7 % réussissent ce test visuel", "Différences minuscules, motifs changeants et illusions testent ce que vos yeux remarquent.", "Votre regard est-il vraiment affûté ? Repérez les infimes différences, suivez les motifs et déjouez les pièges visuels.", ["Premier regard", "Formes et détails", "Suivi des motifs", "Pièges optiques", "Mise au point finale"]],
    "years-left": ["Combien de temps vous reste-t-il à vivre ?", "Votre rythme, votre sommeil, votre stress et vos choix alimentent une prédiction étonnante.", "Dites à l’IA comment vous vivez vraiment et elle calculera combien de temps il vous reste.", ["Rythme quotidien", "Alimentation et mouvement", "Repos et résilience", "Liens et choix", "Prédiction finale"]],
  },
  de: {
    cambridge: ["Nur 7 % bestehen diesen Cambridge-Aufnahmetest", "Muster, wissenschaftliche Belege, Daten und verborgene Mechanismen prüfen, wie konsequent Sie jede Variable kontrollieren können.", "Experimente, Muster und Daten treffen aufeinander: Erkennen Sie die versteckte Variable, bevor sie das Ergebnis verfälscht?", ["Cambridge-Grundlagen", "Muster und Beweise", "Wissenschaftliches Denken", "Cambridge-Aufgabe", "Abschlussprüfung"]],
    chef: ["Nur 12 % bestehen diesen Koch-Aufnahmetest", "Geschmack, Hitze, Backen und Servicedruck testen, wie klar Sie in der Küche denken.", "Von Geschmack und Hitze bis zu Gebäck, Timing und Servicedruck: Beweisen Sie, dass Sie auch dann wie ein Küchenprofi denken, wenn es hektisch wird.", ["Kücheneinweisung", "Vorbereitungsplatz", "Küchenhandwerk", "Küchenparcours", "Chef’s Table"]],
    grammar: ["Nur 10 % bestehen dieses Grammatikquiz", "Fehlerhafte Sätze, Zeichensetzungsfallen und fast richtige Formulierungen testen Ihren Blick fürs Detail.", "Ist Ihre Grammatik wirklich fehlerfrei? Reparieren Sie Sätze, erkennen Sie winzige Zeichensetzungsfallen und finden Sie den Fehler, bevor er Ihnen entgeht.", ["Grammatik-Check", "Satzbau", "Präzisionsrunde", "Grammatikfallen", "Endkorrektur"]],
    harvard: ["Nur 7 % bestehen diesen Harvard-Aufnahmetest", "Belege, Zahlen, Prioritäten und Zielkonflikte prüfen die Stärke Ihrer Entscheidungen.", "Belege, Daten, Zielkonflikte und Logik prallen aufeinander. Treffen Sie die beste Entscheidung, bevor ein übersehenes Detail alles verändert?", ["Zulassungsbriefing", "Belege und Analyse", "Quantitative Entscheidungen", "Fallstudie", "Abschlusskommission"]],
    iq: ["Nur 7 % bestehen diesen Intelligenztest", "Muster, Zahlenregeln, Wortverbindungen und Raumfallen testen Ihr Schlussvermögen.", "Muster, Codes, Wortverbindungen und Logikfallen treffen aufeinander: Wie lange bleibt Ihr Denken einen Schritt voraus?", ["Schnelldenken", "Mustercode", "Logik unter Druck", "Denkfallen", "Der Intelligenztresor"]],
    mechanic: ["Nur 7 % bestehen dieses Automechanik-Quiz", "Warnleuchten, versteckte Fehler und seltsame Fahrsymptome testen Ihre Diagnose.", "Von Warnleuchten bis zu verdächtigen Geräuschen: Finden Sie den Fehler, bevor die Reparatur teuer wird.", ["Armaturenbrett und Motorraum", "Flüssigkeiten, Bremsen und Traktion", "Luft, Kraftstoff und Zündung", "Fehlersuche in der Werkstatt", "Abschlussdiagnose"]],
    memory: ["Die meisten Erwachsenen erreichen bei diesem Gedächtnistest keine 80 %", "Wörter, Bilder, Zahlen und spätere Erinnerungen zeigen, was Ihr Gedächtnis behält.", "Halten Sie Ihr Gedächtnis noch für messerscharf? Manche Aufgaben sind leicht. Andere wollen Sie bewusst täuschen.", ["Sofortiges Erinnern", "Bilder und Details", "Zahlen und Muster", "Die Gedächtnisfalle", "Finale Gedächtnisaufgabe"]],
    midwifery: ["Nur 7 % bestehen diesen Hebammen-Aufnahmetest", "Schwangerschaft, Geburt, Neugeborenenversorgung und ruhiges Urteilsvermögen prüfen Ihren Blick fürs Wesentliche.", "Schwangerschaft, Wehen und Neugeborenenversorgung: Bleiben Sie ruhig und erkennen Sie das wichtigste Detail?", ["Erster Termin", "Schwangerschaft und Geburt", "Respekt und Sicherheit", "Entscheidungen bei Geburt und Neugeborenenversorgung", "Abschlussprüfung Geburtshilfe"]],
    nursing: ["Nur 7 % bestehen diesen Pflege-Aufnahmetest", "Anatomie, Vitalzeichen und Pflegeentscheidungen testen Ihr Urteil unter Druck.", "Körpersysteme, Vitalzeichen und Pflege: Erkennen Sie, was zählt, und treffen Sie die sicherste Entscheidung?", ["Stationsbriefing", "Körper und Beobachtungen", "Sicherheit und Kommunikation", "Prioritäten unter Druck", "Abschlussübergabe"]],
    oxford: ["Nur 7 % bestehen diesen Oxford-Aufnahmetest", "Argumente, Annahmen und präzise Schlüsse prüfen, ob Ihr Denken jeder Falle standhält.", "Argumente, Muster und Logikfallen treffen aufeinander. Können Sie die richtige Antwort verteidigen, wenn jede Option plausibel wirkt?", ["Tutoriumsgrundlagen", "Belege und Argumente", "Logik an der Tafel", "Interviewfallen", "Abschlusstutorium"]],
    paramedic: ["Nur 8 % bestehen diesen Rettungsdienst-Aufnahmetest", "Gefahren am Einsatzort, Vitalzeichen und schnelle Entscheidungen testen Ihre Klarheit unter Druck.", "Gefahren am Einsatzort, Vitalzeichen, Einsatzmathematik und ruhiges Urteilsvermögen: Denken Sie klar, wenn jeder Hinweis zählt?", ["Einsatzbriefing", "Körper und Signale", "Einsatzort und Kommunikation", "Entscheidungen unter Druck", "Finaler Einsatz"]],
    vision: ["Nur 7 % bestehen diesen Sehtest", "Winzige Unterschiede, wechselnde Muster und optische Fallen testen Ihren Blick.", "Wie scharf ist Ihr Blick? Erkennen Sie kleinste Unterschiede, verfolgen Sie wechselnde Muster und entlarven Sie optische Fallen.", ["Erster Fokus", "Formen und Details", "Muster verfolgen", "Optische Fallen", "Finaler Fokus"]],
    "years-left": ["Wie lange haben Sie noch zu leben?", "Alltag, Schlaf, Stress und Gewohnheiten fließen in eine überraschende Prognose ein.", "Erzählen Sie der KI, wie Sie wirklich leben, und sie berechnet, wie lange Sie noch zu leben haben.", ["Alltagsrhythmus", "Ernährung und Bewegung", "Erholung und Widerstandskraft", "Beziehungen und Entscheidungen", "Abschlussprognose"]],
  },
  it: {
    cambridge: ["Solo il 7% supera questo test d’ammissione a Cambridge", "Schemi, prove scientifiche, dati e meccanismi nascosti mettono alla prova la precisione con cui controlli ogni variabile.", "Esperimenti, schemi e dati si intrecciano: saprai individuare la variabile nascosta prima che falsi la conclusione?", ["Fondamenti di Cambridge", "Schemi e dimostrazioni", "Ragionamento scientifico", "Sfida Cambridge", "Valutazione finale"]],
    chef: ["Solo il 12% supera questa prova d’ingresso per chef", "Sapori, calore, pasticceria e pressione del servizio mettono alla prova la lucidità in cucina.", "Dai sapori al fuoco, dalla pasticceria ai tempi di servizio: dimostra di saper ragionare da chef quando la cucina si fa frenetica.", ["Ingresso in cucina", "Banco di preparazione", "Tecnica di cucina", "Prova in cucina", "Tavolo dello chef"]],
    grammar: ["Solo il 10% supera questo quiz di grammatica", "Frasi traballanti, trappole di punteggiatura e formule quasi corrette sfidano il tuo occhio.", "La tua grammatica è davvero impeccabile? Ripara le frasi, evita le trappole di punteggiatura e trova l’errore prima che sfugga.", ["Controllo iniziale", "Costruzione della frase", "Prova di precisione", "Trappole grammaticali", "Revisione finale"]],
    harvard: ["Solo il 7% supera questo test d’ammissione ad Harvard", "Prove, numeri, priorità e compromessi mettono alla prova la solidità delle tue decisioni.", "Prove, dati, compromessi e logica si scontrano. Saprai scegliere l’opzione migliore prima che un dettaglio trascurato cambi tutto?", ["Dossier di ammissione", "Prove e analisi", "Decisioni quantitative", "Caso di studio", "Commissione finale"]],
    iq: ["Solo il 7% supera questo test d’intelligenza", "Schemi, regole numeriche, legami tra parole e trappole spaziali sfidano il tuo ragionamento.", "Schemi, codici, legami tra parole e trappole logiche si susseguono: per quanto riuscirai a restare un passo avanti?", ["Scatto mentale", "Decodifica degli schemi", "Logica sotto pressione", "Trappole di ragionamento", "La cassaforte dell’intelligenza"]],
    mechanic: ["Solo il 7% supera questo quiz di meccanica auto", "Spie, guasti nascosti e sintomi insoliti mettono alla prova la tua diagnosi.", "Spie accese, rumori sospetti e guasti nascosti: trova il problema prima che il conto dell’officina salga.", ["Cruscotto e motore", "Liquidi, freni e aderenza", "Aria, carburante e accensione", "Diagnosi in officina", "Diagnosi finale"]],
    memory: ["La maggior parte degli adulti non raggiunge l’80% in questo test di memoria", "Parole, immagini, numeri e richiami a distanza rivelano ciò che la memoria trattiene.", "Pensi che la tua memoria sia ancora infallibile? Alcune sfide sono facili. Altre sono pensate per trarti in inganno.", ["Memoria immediata", "Immagini e dettagli", "Numeri e schemi", "La trappola della memoria", "Sfida finale di memoria"]],
    midwifery: ["Solo il 7% supera questo test d’ingresso in ostetricia", "Gravidanza, nascita, cura del neonato e lucidità mettono alla prova la tua attenzione.", "Gravidanza, travaglio e cura del neonato: saprai mantenere la calma e cogliere il dettaglio essenziale?", ["Primo incontro", "Gravidanza e nascita", "Rispetto e sicurezza", "Decisioni durante il travaglio e dopo la nascita", "Prova finale di ostetricia"]],
    nursing: ["Solo il 7% supera questo test d’ingresso in infermieristica", "Anatomia, parametri vitali e decisioni assistenziali mettono alla prova il tuo giudizio sotto pressione.", "Sistemi del corpo, parametri vitali e assistenza: saprai cogliere ciò che conta e scegliere l’azione più sicura?", ["Briefing di reparto", "Corpo e osservazioni", "Sicurezza e comunicazione", "Priorità sotto pressione", "Consegna finale"]],
    oxford: ["Solo il 7% supera questo test d’ammissione a Oxford", "Argomenti, ipotesi e deduzioni precise verificano quanto il tuo pensiero resista alle trappole logiche.", "Argomenti, schemi e trappole logiche si intrecciano. Saprai difendere la risposta giusta quando tutte sembrano plausibili?", ["Fondamenti del tutorato", "Prove e argomenti", "Logica alla lavagna", "Trappole del colloquio", "Tutorato finale"]],
    paramedic: ["Solo l’8% supera questo test d’ingresso per paramedici", "Pericoli sulla scena, parametri vitali e decisioni rapide mettono alla prova la tua lucidità.", "Pericoli sulla scena, parametri vitali, calcoli d’emergenza e giudizio: saprai pensare con chiarezza quando ogni indizio conta?", ["Briefing d’intervento", "Corpo e segnali", "Sicurezza e comunicazione", "Decisioni sotto pressione", "Intervento finale"]],
    vision: ["Solo il 7% supera questo test visivo", "Differenze minuscole, schemi mutevoli e illusioni mettono alla prova il tuo sguardo.", "Quanto è davvero allenato il tuo occhio? Trova le differenze minime, segui gli schemi e supera le trappole visive.", ["Primo sguardo", "Forme e dettagli", "Segui lo schema", "Trappole ottiche", "Messa a fuoco finale"]],
    "years-left": ["Quanto ti resta da vivere?", "Ritmo quotidiano, sonno, stress e abitudini alimentano una previsione sorprendente.", "Racconta all’IA come vivi davvero e calcolerà quanto tempo ti resta.", ["Ritmo quotidiano", "Alimentazione e movimento", "Riposo e resilienza", "Relazioni e scelte", "Previsione finale"]],
  },
  nl: {
    cambridge: ["Slechts 7% slaagt voor deze Cambridge-toelatingstest", "Patronen, wetenschappelijk bewijs, gegevens en verborgen mechanismen testen hoe zorgvuldig je elke variabele beheerst.", "Experimenten, patronen en gegevens komen samen: zie jij de verborgen variabele voordat die de conclusie vertekent?", ["Cambridge-basis", "Patronen en bewijzen", "Wetenschappelijk redeneren", "Cambridge-uitdaging", "Eindbeoordeling"]],
    chef: ["Slechts 12% slaagt voor deze toelatingstest voor chefs", "Smaak, hitte, patisserie en servicedruk testen hoe helder je in de keuken denkt.", "Van smaak en vuur tot patisserie, timing en servicedruk: bewijs dat je als een chef denkt wanneer de keuken op volle toeren draait.", ["Keukenintroductie", "Voorbereidingsbank", "Keukentechniek", "Keukenproef", "Chef’s Table"]],
    grammar: ["Slechts 10% slaagt voor deze grammaticaquiz", "Haperende zinnen, leestekenvallen en bijna juiste formuleringen testen je taalgevoel.", "Is je grammatica echt foutloos? Repareer zinnen, ontwijk kleine leestekenvallen en vind de fout voordat die jou vindt.", ["Eerste taalcheck", "Zinsbouw", "Precisieronde", "Grammaticavallen", "Eindredactie"]],
    harvard: ["Slechts 7% slaagt voor deze Harvard-toelatingstest", "Bewijs, cijfers, prioriteiten en afwegingen testen de kracht van je beslissingen.", "Bewijs, gegevens, afwegingen en logica botsen. Kies jij de beste optie voordat één gemist detail alles verandert?", ["Toelatingsbriefing", "Bewijs en analyse", "Kwantitatieve beslissingen", "Casestudy", "Eindcommissie"]],
    iq: ["Slechts 7% slaagt voor deze intelligentietest", "Patronen, getalregels, woordverbanden en ruimtelijke vallen testen je redeneervermogen.", "Patronen, codes, woordverbanden en logicavallen volgen elkaar op: hoelang blijf jij een stap voor?", ["Snelle denkkracht", "Patronen ontcijferen", "Logica onder druk", "Denkvallen", "De intelligentiekluis"]],
    mechanic: ["Slechts 7% slaagt voor deze automonteursquiz", "Waarschuwingslampjes, verborgen storingen en vreemde symptomen testen je diagnose.", "Waarschuwingslampjes, verdachte geluiden en verborgen storingen: vind het probleem voordat de rekening oploopt.", ["Dashboard en motor", "Vloeistoffen, remmen en grip", "Lucht, brandstof en ontsteking", "Werkplaatsdiagnose", "Einddiagnose"]],
    memory: ["De meeste volwassenen halen geen 80% op deze geheugentest", "Woorden, beelden, getallen en herinneringen van eerder tonen wat je geheugen vasthoudt.", "Denk je dat je geheugen nog messcherp is? Sommige uitdagingen zijn eenvoudig. Andere zijn gemaakt om je te misleiden.", ["Snelle herinnering", "Beelden en details", "Getallen en patronen", "De geheugenval", "Laatste geheugenuitdaging"]],
    midwifery: ["Slechts 7% slaagt voor deze toelatingstest verloskunde", "Zwangerschap, geboorte, zorg voor de pasgeborene en kalm oordelen testen je aandacht.", "Zwangerschap, bevalling en zorg voor de pasgeborene: blijf jij rustig en zie je het detail dat ertoe doet?", ["Eerste afspraak", "Zwangerschap en geboorte", "Respect en veiligheid", "Beslissingen rond bevalling en kraamzorg", "Eindtoets verloskunde"]],
    nursing: ["Slechts 7% slaagt voor deze toelatingstest verpleegkunde", "Anatomie, vitale waarden en zorgbeslissingen testen je oordeel onder druk.", "Lichaamssystemen, vitale waarden en zorg: zie jij wat telt en kies je de veiligste aanpak?", ["Afdelingsbriefing", "Lichaam en observaties", "Veiligheid en communicatie", "Prioriteiten onder druk", "Eindoverdracht"]],
    oxford: ["Slechts 7% slaagt voor deze Oxford-toelatingstest", "Argumenten, aannames en nauwkeurige gevolgtrekkingen testen hoe goed je logicavallen weerstaat.", "Argumenten, patronen en logicavallen komen samen. Verdedig jij het juiste antwoord wanneer alles aannemelijk lijkt?", ["Tutorialbasis", "Bewijs en argumenten", "Logica op het bord", "Interviewvallen", "Eindtutorial"]],
    paramedic: ["Slechts 8% slaagt voor deze toelatingstest ambulancezorg", "Gevaren ter plaatse, vitale waarden en snelle beslissingen testen je helderheid onder druk.", "Veiligheid ter plaatse, vitale waarden, spoedrekenen en kalm oordeel: denk jij helder wanneer elke aanwijzing telt?", ["Inzetbriefing", "Lichaam en signalen", "Veiligheid en communicatie", "Beslissingen onder druk", "Eindinzet"]],
    vision: ["Slechts 7% slaagt voor deze visuele test", "Minuscule verschillen, veranderende patronen en optische vallen testen je blik.", "Hoe scherp kijk jij echt? Vind de kleinste verschillen, volg de patronen en doorzie de visuele vallen.", ["Eerste blik", "Vormen en details", "Patronen volgen", "Optische vallen", "Laatste focus"]],
    "years-left": ["Hoelang heb je nog te leven?", "Dagritme, slaap, stress en gewoonten voeden een verrassende voorspelling.", "Vertel AI hoe je echt leeft en laat berekenen hoelang je nog te leven hebt.", ["Dagelijks ritme", "Voeding en beweging", "Herstel en veerkracht", "Contact en keuzes", "Eindvoorspelling"]],
  },
  es: {
    cambridge: ["Solo el 7% supera esta prueba de ingreso a Cambridge", "Patrones, pruebas científicas, datos y mecanismos ocultos ponen a prueba lo bien que controlas cada variable.", "Experimentos, patrones y datos se cruzan: ¿detectarás la variable oculta antes de que altere la conclusión?", ["Fundamentos de Cambridge", "Patrones y demostraciones", "Razonamiento científico", "Desafío Cambridge", "Evaluación final"]],
    chef: ["Solo el 12% supera esta prueba de ingreso para chefs", "Sabor, calor, repostería y presión del servicio ponen a prueba tu claridad en la cocina.", "Del sabor y el fuego a la repostería, el tiempo y la presión del servicio: demuestra que piensas como chef cuando la cocina se acelera.", ["Iniciación en cocina", "Mesa de preparación", "Técnica culinaria", "Prueba de cocina", "Mesa del chef"]],
    grammar: ["Solo el 10% supera este test de gramática", "Frases defectuosas, trampas de puntuación y expresiones casi correctas ponen a prueba tu ojo.", "¿Tu gramática es realmente impecable? Repara frases, evita pequeñas trampas de puntuación y encuentra el error antes de que se te escape.", ["Primera revisión", "Construcción de frases", "Prueba de precisión", "Trampas gramaticales", "Revisión final"]],
    harvard: ["Solo el 7% supera esta prueba de ingreso a Harvard", "Pruebas, cifras, prioridades y disyuntivas ponen a prueba la solidez de tus decisiones.", "Pruebas, datos, disyuntivas y lógica chocan. ¿Elegirás la mejor opción antes de que un detalle ignorado lo cambie todo?", ["Expediente de admisión", "Pruebas y análisis", "Decisiones cuantitativas", "Estudio de caso", "Comité final"]],
    iq: ["Solo el 7% supera esta prueba de inteligencia", "Patrones, reglas numéricas, conexiones verbales y trampas espaciales ponen a prueba tu razonamiento.", "Patrones, códigos, conexiones verbales y trampas lógicas se suceden: ¿cuánto tiempo podrás mantenerte un paso por delante?", ["Agilidad mental", "Descifrar patrones", "Lógica bajo presión", "Trampas de razonamiento", "La bóveda de la inteligencia"]],
    mechanic: ["Solo el 7% supera este test de mecánica del automóvil", "Testigos, averías ocultas y síntomas extraños ponen a prueba tu diagnóstico.", "Testigos encendidos, ruidos sospechosos y averías ocultas: encuentra el problema antes de que aumente la factura.", ["Tablero y motor", "Líquidos, frenos y agarre", "Aire, combustible y encendido", "Diagnóstico de taller", "Diagnóstico final"]],
    memory: ["La mayoría de los adultos no alcanza el 80% en esta prueba de memoria", "Palabras, imágenes, números y recuerdos diferidos revelan lo que retiene tu memoria.", "¿Crees que tu memoria sigue siendo infalible? Algunos desafíos son fáciles. Otros están diseñados para engañarte.", ["Recuerdo inmediato", "Imágenes y detalles", "Números y patrones", "La trampa de la memoria", "Desafío final de memoria"]],
    midwifery: ["Solo el 7% supera esta prueba de ingreso en obstetricia", "Embarazo, nacimiento, cuidado del recién nacido y criterio sereno ponen a prueba tu atención.", "Embarazo, parto y cuidado del recién nacido: ¿mantendrás la calma y detectarás el detalle esencial?", ["Primera cita", "Embarazo y nacimiento", "Respeto y seguridad", "Decisiones durante el parto y el posparto", "Evaluación final de obstetricia"]],
    nursing: ["Solo el 7% supera esta prueba de ingreso en enfermería", "Anatomía, signos vitales y decisiones de cuidado ponen a prueba tu criterio bajo presión.", "Sistemas del cuerpo, signos vitales y cuidados: ¿detectarás lo esencial y elegirás la opción más segura?", ["Inicio de turno", "Cuerpo y observaciones", "Seguridad y comunicación", "Prioridades bajo presión", "Informe final"]],
    oxford: ["Solo el 7% supera esta prueba de ingreso a Oxford", "Argumentos, supuestos y deducciones precisas ponen a prueba tu capacidad para esquivar trampas lógicas.", "Argumentos, patrones y trampas lógicas se cruzan. ¿Defenderás la respuesta correcta cuando todas parezcan posibles?", ["Fundamentos de la tutoría", "Pruebas y argumentos", "Lógica en la pizarra", "Trampas de la entrevista", "Tutoría final"]],
    paramedic: ["Solo el 8% supera esta prueba de ingreso para paramédicos", "Peligros en la escena, signos vitales y decisiones rápidas ponen a prueba tu claridad bajo presión.", "Seguridad en la escena, signos vitales, cálculos de emergencia y criterio sereno: ¿pensarás con claridad cuando cada pista importa?", ["Aviso de emergencia", "Cuerpo y señales", "Seguridad y comunicación", "Decisiones bajo presión", "Respuesta final"]],
    vision: ["Solo el 7% supera esta prueba visual", "Diferencias mínimas, patrones cambiantes e ilusiones ponen a prueba tu mirada.", "¿De verdad tienes una vista tan aguda? Encuentra diferencias diminutas, sigue los patrones y supera las trampas visuales.", ["Primera mirada", "Formas y detalles", "Seguir el patrón", "Trampas ópticas", "Enfoque final"]],
    "years-left": ["¿Cuánto tiempo te queda de vida?", "Rutina, sueño, estrés y hábitos alimentan una predicción sorprendente.", "Cuéntale a la IA cómo vives de verdad y calculará cuánto tiempo te queda.", ["Ritmo diario", "Alimentación y movimiento", "Descanso y resiliencia", "Conexiones y decisiones", "Predicción final"]],
  },
  pt: {
    cambridge: ["Apenas 7% passam neste teste de admissão a Cambridge", "Padrões, evidência científica, dados e mecanismos ocultos testam até que ponto controla cada variável com rigor.", "Experiências, padrões e dados cruzam-se: será possível identificar a variável escondida antes que altere a conclusão?", ["Fundamentos de Cambridge", "Padrões e demonstrações", "Raciocínio científico", "Desafio Cambridge", "Avaliação final"]],
    chef: ["Apenas 12% passam neste teste de admissão para chefs", "Sabor, calor, pastelaria e pressão do serviço põem à prova a clareza na cozinha.", "Do sabor e do fogo à pastelaria, ao tempo e à pressão do serviço: prove que consegue pensar como chef quando a cozinha acelera.", ["Entrada na cozinha", "Bancada de preparação", "Técnica culinária", "Prova de cozinha", "Mesa do chef"]],
    grammar: ["Apenas 10% passam neste teste de gramática", "Frases defeituosas, armadilhas de pontuação e formulações quase certas põem a atenção à prova.", "A gramática está mesmo impecável? Corrija frases, evite pequenas armadilhas de pontuação e encontre o erro antes que passe despercebido.", ["Primeira revisão", "Construção de frases", "Prova de precisão", "Armadilhas gramaticais", "Revisão final"]],
    harvard: ["Apenas 7% passam neste teste de admissão a Harvard", "Evidência, números, prioridades e dilemas põem à prova a solidez das decisões.", "Evidência, dados, dilemas e lógica entram em conflito. Será possível escolher a melhor opção antes que um detalhe ignorado mude tudo?", ["Processo de admissão", "Evidência e análise", "Decisões quantitativas", "Estudo de caso", "Comissão final"]],
    iq: ["Apenas 7% passam neste teste de inteligência", "Padrões, regras numéricas, ligações entre palavras e armadilhas espaciais testam o raciocínio.", "Padrões, códigos, ligações entre palavras e armadilhas lógicas sucedem-se: até onde conseguirá manter-se um passo à frente?", ["Raciocínio rápido", "Interpretar padrões", "Lógica sob pressão", "Armadilhas de raciocínio", "O cofre da inteligência"]],
    mechanic: ["Apenas 7% passam neste teste de mecânica de veículos", "Luzes de alerta, falhas escondidas e sintomas estranhos põem o diagnóstico à prova.", "Luzes de alerta, ruídos suspeitos e falhas escondidas: encontre o problema antes que fique mais caro.", ["Painel e motor", "Fluidos, travagem/frenagem e aderência", "Ar, combustível e ignição", "Diagnóstico na oficina", "Diagnóstico final"]],
    memory: ["A maioria dos adultos não chega aos 80% neste teste de memória", "Palavras, imagens, números e recordações recuperadas mais tarde revelam o que a memória retém.", "A memória continua mesmo afiada? Alguns desafios são fáceis. Outros foram criados para enganar.", ["Memória imediata", "Imagens e detalhes", "Números e padrões", "A armadilha da memória", "Desafio final de memória"]],
    midwifery: ["Apenas 7% passam neste teste de admissão em obstetrícia", "Gravidez, nascimento, cuidados ao recém-nascido e avaliação serena põem a atenção à prova.", "Gravidez, parto e cuidados ao recém-nascido: será possível manter a calma e reconhecer o detalhe essencial?", ["Primeiro encontro", "Gravidez e nascimento", "Respeito e segurança", "Decisões no parto e após o nascimento", "Avaliação final em obstetrícia"]],
    nursing: ["Apenas 7% passam neste teste de admissão em enfermagem", "Anatomia, sinais vitais e decisões de cuidados põem à prova o discernimento sob pressão.", "Sistemas do corpo, sinais vitais e cuidados: será possível reconhecer o essencial e escolher a opção mais segura?", ["Orientação inicial", "Corpo e observações", "Segurança e comunicação", "Prioridades sob pressão", "Passagem final de informações"]],
    oxford: ["Apenas 7% passam neste teste de admissão a Oxford", "Argumentos, pressupostos e deduções precisas testam a resistência do raciocínio às armadilhas lógicas.", "Argumentos, padrões e armadilhas lógicas cruzam-se. Conseguirá defender a resposta certa quando todas parecem possíveis?", ["Fundamentos da tutoria", "Evidência e argumentos", "Lógica no quadro", "Armadilhas da entrevista", "Tutoria final"]],
    paramedic: ["Apenas 8% passam neste teste de admissão para paramédicos", "Perigos no local, sinais vitais e decisões rápidas põem à prova a clareza sob pressão.", "Segurança no local, sinais vitais, cálculos de emergência e avaliação serena: será possível pensar com clareza quando cada pista conta?", ["Informações da ocorrência", "Corpo e sinais", "Segurança e comunicação", "Decisões sob pressão", "Resposta final"]],
    vision: ["Apenas 7% passam neste teste visual", "Diferenças mínimas, padrões em mudança e ilusões põem o olhar à prova.", "Até que ponto o olhar está atento? Encontre diferenças mínimas, siga os padrões e supere as armadilhas visuais.", ["Primeiro olhar", "Formas e detalhes", "Seguir o padrão", "Armadilhas visuais", "Foco final"]],
    "years-left": ["Quanto tempo resta de vida?", "Rotina, sono, níveis de tensão e hábitos alimentam uma previsão surpreendente.", "Conte à IA como vive realmente e ela calculará quanto tempo lhe resta.", ["Ritmo diário", "Alimentação e movimento", "Descanso e resiliência", "Relações e escolhas", "Previsão final"]],
  },
};

const completedBadge = {
  fr: "ÉTAPE TERMINÉE",
  de: "RUNDE ABGESCHLOSSEN",
  it: "FASE COMPLETATA",
  nl: "RONDE VOLTOOID",
  es: "ETAPA COMPLETADA",
  pt: "ETAPA CONCLUÍDA",
};

const examBadge = {
  fr: "SECTION D’EXAMEN TERMINÉE",
  de: "PRÜFUNGSABSCHNITT ABGESCHLOSSEN",
  it: "SEZIONE D’ESAME COMPLETATA",
  nl: "EXAMENONDERDEEL VOLTOOID",
  es: "SECCIÓN DEL EXAMEN COMPLETADA",
  pt: "PARTE DO EXAME CONCLUÍDA",
};

const examComplete = {
  fr: "TEST D’ENTRÉE TERMINÉ",
  de: "AUFNAHMETEST ABGESCHLOSSEN",
  it: "TEST D’INGRESSO COMPLETATO",
  nl: "TOELATINGSTEST VOLTOOID",
  es: "PRUEBA DE INGRESO COMPLETADA",
  pt: "TESTE DE ADMISSÃO CONCLUÍDO",
};

const entranceCareerRanks = {
  fr: ["Test d’entrée commencé", "Test d’entrée terminé"],
  de: ["Aufnahmetest begonnen", "Aufnahmetest abgeschlossen"],
  it: ["Test d’ingresso iniziato", "Test d’ingresso completato"],
  nl: ["Toelatingstest gestart", "Toelatingstest voltooid"],
  es: ["Prueba de ingreso iniciada", "Prueba de ingreso completada"],
  pt: ["Teste de admissão iniciado", "Teste de admissão concluído"],
};

const themedCareerRanks = {
  grammar: {
    fr: ["Défi lancé", "Défi terminé"],
    de: ["Herausforderung gestartet", "Herausforderung abgeschlossen"],
    it: ["Sfida iniziata", "Sfida completata"],
    nl: ["Uitdaging gestart", "Uitdaging voltooid"],
    es: ["Desafío iniciado", "Desafío completado"],
    pt: ["Desafio iniciado", "Desafio concluído"],
  },
  iq: {
    fr: ["Défi d’intelligence lancé", "Défi d’intelligence terminé"],
    de: ["Intelligenztest gestartet", "Intelligenztest abgeschlossen"],
    it: ["Sfida di intelligenza iniziata", "Sfida di intelligenza completata"],
    nl: ["Intelligentie-uitdaging gestart", "Intelligentie-uitdaging voltooid"],
    es: ["Prueba de inteligencia iniciada", "Prueba de inteligencia completada"],
    pt: ["Teste de inteligência iniciado", "Teste de inteligência concluído"],
  },
  mechanic: {
    fr: ["Défi mécanique lancé", "Défi mécanique terminé"],
    de: ["Werkstatttest gestartet", "Werkstatttest abgeschlossen"],
    it: ["Prova d’officina iniziata", "Prova d’officina completata"],
    nl: ["Werkplaatstest gestart", "Werkplaatstest voltooid"],
    es: ["Desafío de mecánica iniciado", "Desafío de mecánica completado"],
    pt: ["Desafio de mecânica iniciado", "Desafio de mecânica concluído"],
  },
  memory: {
    fr: ["Défi mémoire lancé", "Défi mémoire terminé"],
    de: ["Gedächtnistest gestartet", "Gedächtnistest abgeschlossen"],
    it: ["Sfida di memoria iniziata", "Sfida di memoria completata"],
    nl: ["Geheugentest gestart", "Geheugentest voltooid"],
    es: ["Desafío de memoria iniciado", "Desafío de memoria completado"],
    pt: ["Desafio de memória iniciado", "Desafio de memória concluído"],
  },
  vision: {
    fr: ["Défi visuel lancé", "Défi visuel terminé"],
    de: ["Sehtest gestartet", "Sehtest abgeschlossen"],
    it: ["Sfida visiva iniziata", "Sfida visiva completata"],
    nl: ["Visuele uitdaging gestart", "Visuele uitdaging voltooid"],
    es: ["Desafío visual iniciado", "Desafío visual completado"],
    pt: ["Desafio visual iniciado", "Desafio visual concluído"],
  },
  "years-left": {
    fr: ["Estimation lancée", "Estimation terminée"],
    de: ["Schätzung gestartet", "Schätzung abgeschlossen"],
    it: ["Stima avviata", "Stima completata"],
    nl: ["Schatting gestart", "Schatting voltooid"],
    es: ["Estimación iniciada", "Estimación completada"],
    pt: ["Estimativa iniciada", "Estimativa concluída"],
  },
};

const sharedUi = {
  fr: {progress:"Progression", progressComplete:"{value} % terminé", currentScore:"SCORE ACTUEL", examScore:"SCORE ACTUEL À L’EXAMEN", level:"ÉTAPE", section:"SECTION", correct:"bonnes réponses", journey:"PARCOURS DU QUIZ", examJourney:"TEST D’ENTRÉE", clearedOne:"{value} étape terminée", clearedTwo:"{value} / {total} étapes terminées", examClearedOne:"{value} section d’examen terminée", examClearedTwo:"{value} / {total} sections d’examen terminées", currentProgress:"PROGRESSION ACTUELLE", update:"MISE À JOUR DU RÉSULTAT", nextReady:"La prochaine étape est prête", readyCopy:"Continuez lorsque vous êtes prêt.", finalEyebrow:"VOTRE RÉSULTAT", strongest:"Votre point fort", finalCopy:"Vous avez obtenu {score} bonnes réponses sur {total}. Votre profil pour cette tentative est « {profile} »."},
  de: {progress:"Fortschritt", progressComplete:"{value} % abgeschlossen", currentScore:"AKTUELLER PUNKTSTAND", examScore:"AKTUELLER PRÜFUNGSSTAND", level:"RUNDE", section:"ABSCHNITT", correct:"richtig", journey:"QUIZVERLAUF", examJourney:"AUFNAHMETEST", clearedOne:"{value} Runde abgeschlossen", clearedTwo:"{value} / {total} Runden abgeschlossen", examClearedOne:"{value} Prüfungsabschnitt abgeschlossen", examClearedTwo:"{value} / {total} Prüfungsabschnitte abgeschlossen", currentProgress:"AKTUELLER FORTSCHRITT", update:"ERGEBNISUPDATE", nextReady:"Die nächste Runde ist bereit", readyCopy:"Fahren Sie fort, sobald Sie bereit sind.", finalEyebrow:"IHR ERGEBNIS", strongest:"Stärkster Bereich", finalCopy:"Sie haben {score} von {total} Aufgaben richtig beantwortet. Ihr Profil für diesen Versuch ist „{profile}“."},
  it: {progress:"Avanzamento", progressComplete:"{value}% completato", currentScore:"PUNTEGGIO ATTUALE", examScore:"PUNTEGGIO D’ESAME ATTUALE", level:"FASE", section:"SEZIONE", correct:"corrette", journey:"PERCORSO DEL QUIZ", examJourney:"TEST D’INGRESSO", clearedOne:"{value} fase completata", clearedTwo:"{value} / {total} fasi completate", examClearedOne:"{value} sezione d’esame completata", examClearedTwo:"{value} / {total} sezioni d’esame completate", currentProgress:"AVANZAMENTO ATTUALE", update:"AGGIORNAMENTO DEL RISULTATO", nextReady:"La fase successiva è pronta", readyCopy:"Continua quando vuoi.", finalEyebrow:"IL TUO RISULTATO", strongest:"Area migliore", finalCopy:"Hai risposto correttamente a {score} domande su {total}. Il profilo di questo tentativo è «{profile}»."},
  nl: {progress:"Voortgang", progressComplete:"{value}% voltooid", currentScore:"HUIDIGE SCORE", examScore:"HUIDIGE EXAMENSCORE", level:"RONDE", section:"ONDERDEEL", correct:"goed", journey:"QUIZTRAJECT", examJourney:"TOELATINGSTEST", clearedOne:"{value} ronde voltooid", clearedTwo:"{value} / {total} rondes voltooid", examClearedOne:"{value} examenonderdeel voltooid", examClearedTwo:"{value} / {total} examenonderdelen voltooid", currentProgress:"HUIDIGE VOORTGANG", update:"RESULTAATUPDATE", nextReady:"De volgende ronde staat klaar", readyCopy:"Ga verder wanneer je klaar bent.", finalEyebrow:"JOUW RESULTAAT", strongest:"Sterkste onderdeel", finalCopy:"Je beantwoordde {score} van de {total} vragen goed. Je profiel voor deze poging is ‘{profile}’."},
  es: {progress:"Progreso", progressComplete:"{value}% completado", currentScore:"PUNTUACIÓN ACTUAL", examScore:"PUNTUACIÓN ACTUAL DEL EXAMEN", level:"ETAPA", section:"SECCIÓN", correct:"correctas", journey:"RECORRIDO DEL QUIZ", examJourney:"PRUEBA DE INGRESO", clearedOne:"{value} etapa completada", clearedTwo:"{value} / {total} etapas completadas", examClearedOne:"{value} sección del examen completada", examClearedTwo:"{value} / {total} secciones del examen completadas", currentProgress:"PROGRESO ACTUAL", update:"ACTUALIZACIÓN DEL RESULTADO", nextReady:"La siguiente etapa está lista", readyCopy:"Continúa cuando quieras.", finalEyebrow:"TU RESULTADO", strongest:"Área más sólida", finalCopy:"Acertaste {score} de {total} preguntas. El perfil de este intento es «{profile}»."},
  pt: {progress:"Progresso", progressComplete:"{value}% concluído", currentScore:"RESULTADO ATUAL", examScore:"RESULTADO ATUAL DO EXAME", level:"ETAPA", section:"PARTE", correct:"certas", journey:"PERCURSO DO QUIZ", examJourney:"TESTE DE ADMISSÃO", clearedOne:"{value} etapa concluída", clearedTwo:"{value} / {total} etapas concluídas", examClearedOne:"{value} parte do exame concluída", examClearedTwo:"{value} / {total} partes do exame concluídas", currentProgress:"PROGRESSO ATUAL", update:"ATUALIZAÇÃO DO RESULTADO", nextReady:"A próxima etapa está pronta", readyCopy:"Continue quando estiver tudo pronto.", finalEyebrow:"O RESULTADO", strongest:"Área mais forte", finalCopy:"Foram acertadas {score} de {total} perguntas. O perfil desta tentativa é «{profile}»."},
};

const finalCopyWithoutProfilePlaceholder = {
  fr: "Vous avez obtenu {score} bonnes réponses sur {total}. Votre profil détaillé pour cette tentative apparaît ci-dessous.",
  de: "Sie haben {score} von {total} Aufgaben richtig beantwortet. Ihr ausführliches Profil für diesen Versuch sehen Sie unten.",
  it: "Hai risposto correttamente a {score} domande su {total}. Il profilo dettagliato di questo tentativo è riportato qui sotto.",
  nl: "Je beantwoordde {score} van de {total} vragen goed. Hieronder staat je uitgebreide profiel voor deze poging.",
  es: "Acertaste {score} de {total} preguntas. A continuación aparece el perfil detallado de este intento.",
  pt: "Foram acertadas {score} de {total} perguntas. O perfil detalhado desta tentativa aparece abaixo.",
};

const scoreProfileCopy = {
  fr: {
    tiers: ["90–100 %", "80–89 %", "70–79 %", "60–69 %", "50–59 %", "Moins de 50 %"],
    copies: [
      "Vous avez traversé ce défi avec une précision remarquable. Même les questions les plus exigeantes vous ont rarement échappé.",
      "Votre résultat révèle une excellente maîtrise des compétences évaluées. Votre raisonnement est resté sûr jusque dans les pièges les plus subtils.",
      "Vous avez obtenu un résultat solide et régulier. Quelques détails difficiles vous ont freiné, mais l’ensemble reste convaincant.",
      "Vous disposez de bonnes bases. En affinant les points les plus délicats, votre prochain résultat pourrait nettement progresser.",
      "Vous avez repéré plusieurs éléments essentiels. Les questions manquées indiquent clairement les domaines à consolider.",
      "Ce défi a révélé des pistes de progression. Votre curiosité et les bonnes réponses obtenues constituent un excellent point de départ.",
    ],
    disclaimer: "Pour le divertissement et la culture générale uniquement. Ce quiz n’est ni un examen officiel, ni une qualification, ni un avis professionnel.",
  },
  de: {
    tiers: ["90–100 %", "80–89 %", "70–79 %", "60–69 %", "50–59 %", "Unter 50 %"],
    copies: [
      "Sie haben diese Herausforderung mit bemerkenswerter Präzision gemeistert. Selbst die anspruchsvollsten Aufgaben brachten Sie kaum aus dem Konzept.",
      "Ihr Ergebnis zeigt eine sehr sichere Beherrschung der geprüften Fähigkeiten. Auch bei subtilen Fallen blieb Ihr Denken zuverlässig.",
      "Sie erzielten ein solides und ausgeglichenes Ergebnis. Einige schwierige Details kosteten Punkte, der Gesamteindruck bleibt jedoch stark.",
      "Sie verfügen über eine gute Grundlage. Wenn Sie die kniffligsten Bereiche schärfen, kann das nächste Ergebnis deutlich steigen.",
      "Sie erkannten mehrere wichtige Zusammenhänge. Die falsch beantworteten Fragen zeigen klar, welche Bereiche sich noch festigen lassen.",
      "Diese Herausforderung zeigte einige Entwicklungsmöglichkeiten. Ihre Neugier und die gelösten Aufgaben sind ein guter Ausgangspunkt.",
    ],
    disclaimer: "Nur zur Unterhaltung und allgemeinen Wissensvermittlung. Dieses Quiz ist weder eine offizielle Prüfung noch eine Qualifikation oder fachliche Beratung.",
  },
  it: {
    tiers: ["90–100%", "80–89%", "70–79%", "60–69%", "50–59%", "Meno del 50%"],
    copies: [
      "Hai affrontato questa sfida con una precisione notevole. Persino le domande più impegnative ti hanno messo raramente in difficoltà.",
      "Il risultato dimostra un’ottima padronanza delle capacità valutate. Il tuo ragionamento è rimasto sicuro anche davanti alle trappole più sottili.",
      "Hai ottenuto un risultato solido ed equilibrato. Qualche dettaglio difficile ti ha rallentato, ma il quadro complessivo resta convincente.",
      "Hai buone basi. Rafforzando i punti più delicati, il prossimo risultato può migliorare nettamente.",
      "Hai riconosciuto diversi elementi essenziali. Le domande mancate indicano con chiarezza gli aspetti da consolidare.",
      "Questa sfida ha mostrato alcuni margini di crescita. La curiosità e le risposte corrette sono un ottimo punto di partenza.",
    ],
    disclaimer: "Solo per intrattenimento e cultura generale. Questo quiz non è un esame ufficiale, una qualifica né un parere professionale.",
  },
  nl: {
    tiers: ["90–100%", "80–89%", "70–79%", "60–69%", "50–59%", "Onder 50%"],
    copies: [
      "Je doorliep deze uitdaging met opvallende precisie. Zelfs de lastigste vragen brachten je nauwelijks uit balans.",
      "Je resultaat toont een zeer sterke beheersing van de geteste vaardigheden. Ook bij subtiele valkuilen bleef je redenering betrouwbaar.",
      "Je behaalde een solide en evenwichtig resultaat. Enkele lastige details kostten punten, maar het totaalbeeld blijft sterk.",
      "Je hebt een goede basis. Als je de lastigste onderdelen aanscherpt, kan je volgende resultaat flink stijgen.",
      "Je herkende meerdere belangrijke verbanden. De gemiste vragen laten duidelijk zien wat je nog kunt versterken.",
      "Deze uitdaging liet enkele groeikansen zien. Je nieuwsgierigheid en de opgeloste vragen vormen een uitstekend vertrekpunt.",
    ],
    disclaimer: "Alleen voor entertainment en algemene kennis. Deze quiz is geen officieel examen, kwalificatie of professioneel advies.",
  },
  es: {
    tiers: ["90–100%", "80–89%", "70–79%", "60–69%", "50–59%", "Menos del 50%"],
    copies: [
      "Has superado este desafío con una precisión notable. Incluso las preguntas más exigentes apenas lograron frenarte.",
      "El resultado demuestra un gran dominio de las habilidades evaluadas. Tu razonamiento se mantuvo firme incluso ante las trampas más sutiles.",
      "Has conseguido un resultado sólido y equilibrado. Algunos detalles difíciles restaron puntos, pero el conjunto sigue siendo convincente.",
      "Tienes una buena base. Si refuerzas los puntos más delicados, tu próximo resultado puede mejorar mucho.",
      "Has reconocido varios elementos esenciales. Las preguntas falladas señalan con claridad qué conviene reforzar.",
      "Este desafío ha revelado oportunidades de mejora. Tu curiosidad y los aciertos logrados son un excelente punto de partida.",
    ],
    disclaimer: "Solo para entretenimiento y cultura general. Este quiz no es un examen oficial, una titulación ni asesoramiento profesional.",
  },
  pt: {
    tiers: ["90–100%", "80–89%", "70–79%", "60–69%", "50–59%", "Menos de 50%"],
    copies: [
      "O desempenho nesta prova revelou uma precisão notável. Até as perguntas mais exigentes foram resolvidas com segurança.",
      "O resultado demonstra um excelente domínio das competências avaliadas. O raciocínio manteve-se seguro mesmo perante as armadilhas mais discretas.",
      "Foi alcançado um resultado sólido e equilibrado. Alguns detalhes difíceis retiraram pontos, mas o desempenho global continua convincente.",
      "Existe uma boa base. Ao reforçar os pontos mais delicados, o próximo resultado poderá melhorar bastante.",
      "Foram reconhecidos vários elementos essenciais. As perguntas falhadas mostram com clareza o que ainda pode ser reforçado.",
      "Esta prova revelou oportunidades de evolução. A curiosidade e as respostas certas são um excelente ponto de partida.",
    ],
    disclaimer: "Apenas para entretenimento e cultura geral. Este quiz não é um exame oficial, uma qualificação nem aconselhamento profissional.",
  },
};

const aboutCopy = {
  fr: (areas) => [
    `Cette expérience indépendante propose cinq étapes de difficulté croissante. Les domaines abordés sont : ${areas}. Elle a été conçue pour le divertissement et ne reproduit aucun examen officiel.`,
    "Chaque question possède une seule réponse soutenue par les informations affichées. Prenez le temps de lire tous les indices : la vitesse n’influence jamais le score et la difficulté vient du raisonnement, pas de connaissances obscures.",
    "Le pourcentage final correspond au nombre de bonnes réponses parmi 40 questions. Il décrit uniquement cette tentative et ne constitue ni une qualification, ni un diagnostic, ni une prédiction de réussite.",
  ],
  de: (areas) => [
    `Diese unabhängige Herausforderung besteht aus fünf zunehmend anspruchsvollen Abschnitten. Geprüft werden: ${areas}. Sie dient der Unterhaltung und bildet keine offizielle Prüfung nach.`,
    "Jede Frage hat genau eine Antwort, die durch die gezeigten Informationen gestützt wird. Lesen Sie alle Hinweise in Ruhe: Die Geschwindigkeit beeinflusst das Ergebnis nicht, und die Schwierigkeit entsteht durch das Denken, nicht durch Spezialwissen.",
    "Der Endwert entspricht den richtigen Antworten aus 40 Fragen. Er beschreibt nur diesen Versuch und ist weder eine Qualifikation noch eine Diagnose oder Erfolgsprognose.",
  ],
  it: (areas) => [
    `Questa esperienza indipendente comprende cinque fasi di difficoltà crescente. Le aree esplorate sono: ${areas}. È pensata per l’intrattenimento e non riproduce alcun esame ufficiale.`,
    "Ogni domanda ha una sola risposta sostenuta dalle informazioni mostrate. Leggi con calma tutti gli indizi: la velocità non influisce sul punteggio e la difficoltà nasce dal ragionamento, non da conoscenze oscure.",
    "La percentuale finale corrisponde alle risposte corrette su 40 domande. Descrive soltanto questo tentativo e non costituisce una qualifica, una diagnosi o una previsione di successo.",
  ],
  nl: (areas) => [
    `Deze onafhankelijke uitdaging bestaat uit vijf steeds moeilijkere onderdelen. Aan bod komen: ${areas}. De quiz is bedoeld als entertainment en bootst geen officieel examen na.`,
    "Elke vraag heeft precies één antwoord dat door de getoonde informatie wordt ondersteund. Lees alle aanwijzingen rustig: snelheid beïnvloedt de score nooit en de moeilijkheid komt uit het redeneren, niet uit obscure kennis.",
    "Het eindpercentage is het aantal juiste antwoorden op 40 vragen. Het beschrijft alleen deze poging en is geen kwalificatie, diagnose of voorspelling van succes.",
  ],
  es: (areas) => [
    `Esta experiencia independiente incluye cinco etapas de dificultad creciente. Las áreas evaluadas son: ${areas}. Está pensada como entretenimiento y no reproduce ningún examen oficial.`,
    "Cada pregunta tiene una sola respuesta respaldada por la información mostrada. Lee todas las pistas con calma: la velocidad no influye en el resultado y la dificultad proviene del razonamiento, no de conocimientos rebuscados.",
    "El porcentaje final corresponde a las respuestas correctas de 40 preguntas. Describe únicamente este intento y no constituye una titulación, un diagnóstico ni una predicción de éxito.",
  ],
  pt: (areas) => [
    `Esta experiência independente inclui cinco etapas de dificuldade crescente. As áreas avaliadas são: ${areas}. Foi criada para entretenimento e não reproduz qualquer exame oficial.`,
    "Cada pergunta tem uma única resposta apoiada pelas informações apresentadas. Leia todas as pistas com calma: a velocidade não afeta o resultado e a dificuldade vem do raciocínio, não de conhecimentos obscuros.",
    "O resultado final corresponde às respostas certas em 40 perguntas. Descreve apenas esta tentativa e não representa uma qualificação, um diagnóstico ou uma previsão de sucesso.",
  ],
};

const analysisCopy = {
  fr: "Ce résultat rassemble 40 questions réparties entre plusieurs domaines. La répartition ci-dessous montre les points les plus solides de cette tentative.",
  de: "Dieses Ergebnis fasst 40 Fragen aus mehreren Bereichen zusammen. Die folgende Auswertung zeigt, welche Bereiche in diesem Versuch am sichersten waren.",
  it: "Questo risultato riunisce 40 domande distribuite tra più aree. La ripartizione seguente mostra i punti più solidi di questo tentativo.",
  nl: "Dit resultaat bundelt 40 vragen uit verschillende onderdelen. De verdeling hieronder laat zien welke onderdelen in deze poging het sterkst waren.",
  es: "Este resultado reúne 40 preguntas de varias áreas. El desglose muestra qué aspectos fueron más sólidos en este intento.",
  pt: "Este resultado reúne 40 perguntas de várias áreas. A distribuição abaixo mostra os pontos mais fortes desta tentativa.",
};

const portugueseProfileTitles = {
  cambridge: ["Talento para sistemas", "Mente Cambridge", "Especialista em supervisão", "Mente metódica", "Potencial promissor", "Curiosidade científica"],
  chef: ["Domínio do passe", "Talento natural na cozinha", "Precisão de sous-chef", "Confiança na linha", "Potencial culinário", "Paixão pela cozinha"],
  grammar: ["Mestria na revisão", "Talento natural para a gramática", "Especialista em frases", "Comunicação cuidadosa", "Talento linguístico em evolução", "Detetive da gramática"],
  harvard: ["Destaque nos estudos de caso", "Talento natural de Harvard", "Análise estratégica", "Decisão ponderada", "Potencial promissor", "Curiosidade estratégica"],
  iq: ["Estratégia de sistemas", "Mente de precisão", "Navegação de padrões", "Resolução versátil", "Análise curiosa", "Raciocínio em evolução"],
  mechanic: ["Mestria no diagnóstico", "Talento natural na oficina", "Especialista em falhas", "Resolução prática", "Aprendizagem na oficina", "Curiosidade por veículos"],
  memory: ["Mestria da memória", "Memória apurada", "Quase inesquecível", "Mente seletiva", "Memória criteriosa", "Distração encantadora"],
  midwifery: ["Destaque na maternidade", "Vocação para a obstetrícia", "Calma em ação", "Observação atenta", "Potencial promissor", "Defesa atenta dos cuidados"],
  nursing: ["Talento para a admissão", "Vocação para a enfermagem", "Calma em ação", "Resolução cuidadosa", "Potencial promissor", "Cuidado compassivo"],
  oxford: ["Destaque no tutorial", "Mente Oxford", "Raciocínio de destaque", "Raciocínio cuidadoso", "Potencial promissor", "Curiosidade desafiadora"],
  paramedic: ["Talento para emergências", "Talento natural em resposta rápida", "Calma em ação", "Resposta segura", "Potencial promissor", "Curiosidade em primeiros socorros"],
  vision: ["Olhar de águia", "Virtuosismo visual", "Observação de padrões", "Detetive de detalhes", "Foco em progressão", "Observação curiosa"],
};

const portugueseReplacements = new Map([
  ["Iniciar o quiz", "Iniciar o teste"],
  ["PERCURSO DO QUIZ", "PERCURSO DO TESTE"],
  ["QUIZ DE GRAMÁTICA CONCLUÍDO", "TESTE DE GRAMÁTICA CONCLUÍDO"],
  ["quiz de gramática", "teste de gramática"],
  ["quiz de mecânica de automóveis", "teste de mecânica de veículos"],
  ["Que gás foi captado pelo sangue quando este regressa dos pulmões?", "Que gás o sangue transporta quando retorna dos pulmões?"],
  ["Oxigénio", "O₂"],
  ["sangue rico em oxigénio", "sangue rico em O₂"],
  ["menos oxigénio", "menos O₂"],
  ["Quatro embalagens fechadas contêm cinco pensos cada uma. Quantos pensos existem no total?", "Quatro embalagens fechadas contêm cinco compressas cada uma. Quantas compressas existem no total?"],
  ["Retiram resíduos do sangue e ajudam a regular o equilíbrio de água", "Retiram resíduos do sangue e ajudam a regular o equilíbrio hídrico"],
  ["A respiração está a piorar enquanto a capacidade de resposta diminui", "A respiração piora enquanto a capacidade de resposta diminui"],
  ["alertar a ajuda adequada", "alertar os serviços adequados"],
  ["onde outras conseguem ouvir", "onde outras pessoas podem ouvir"],
  ["Calor e métodos de confeção", "Calor e métodos culinários"],
  ["Padaria e pastelaria", "Panificação e pastelaria"],
  ["preparação, sabores, confeção, pastelaria, cálculos, segurança e serviço", "preparação, sabores, métodos culinários, pastelaria, cálculos, segurança e serviço"],
  ["que passo geral prepara melhor a confeção?", "que passo geral deixa tudo pronto para cozinhar?"],
  ["Abranda a confeção", "Retarda o processo"],
  ["tempo de confeção", "tempo do processo"],
  ["Arrefecer e interromper a confeção", "Baixar a temperatura e interromper o processo"],
  ["Qual é o aspeto habitual de uma fervura suave?", "Qual é o sinal habitual de uma fervura suave?"],
  ["Travões e aderência", "Travagem/frenagem e aderência"],
  ["A luz vermelha dos travões continua acesa depois de soltar o travão de estacionamento.", "A luz vermelha do sistema de frenagem continua acesa depois de desativar o sistema de estacionamento."],
  ["Líquido dos travões", "Fluido do sistema de frenagem"],
  ["Líquido de travões", "Fluido do sistema de frenagem"],
  ["líquido dos travões", "fluido do sistema de frenagem"],
  ["líquido de travões", "fluido do sistema de frenagem"],
  ["Sistema hidráulico dos travões", "Sistema hidráulico de frenagem"],
  ["Os travões estão presos", "O sistema de frenagem está bloqueado"],
  ["Segurança e prevenção de infeções", "Segurança e prevenção de riscos infecciosos"],
  ["Comunicação e transmissão", "Comunicação e passagem de informações"],
  ["processo de controlo de infeção indicado", "processo indicado de prevenção de riscos infecciosos"],
  ["O lado registado é diferente", "O lado anotado é diferente"],
  ["800 mL registados", "800 mL anotados"],
  ["próxima ronda prevista", "próxima avaliação prevista"],
  ["Que total deve ser registado em mililitros?", "Que total deve ser anotado em mililitros?"],
  ["Os visitantes devem registar-se", "Os visitantes devem identificar-se"],
  ["Experiências, padrões e dados cruzam-se: será possível detetar a variável escondida antes que altere a conclusão?", "Experiências, padrões e dados cruzam-se: será possível identificar a variável escondida antes que altere a conclusão?"],
  ["Que aspeto da função corporal mudou?", "Que elemento da função corporal mudou?"],
  ["quase não é detetado movimento de ar", "quase não se percebe movimento de ar"],
  ["Parar em segurança, desligar e deixar o sistema arrefecer", "Parar em segurança, desligar e deixar a temperatura do sistema baixar"],
  ["O radiador não consegue arrefecer", "O radiador não consegue reduzir a temperatura"],
  ["Arrefecer os discos", "Reduzir a temperatura dos discos"],
  ["mas arrefece à velocidade de estrada", "mas a temperatura baixa em velocidade de estrada"],
  ["Motor arrefece em andamento", "Temperatura do motor baixa em andamento"],
  ["e encurtou ao arrefecer", "e encurtou quando a temperatura baixou"],
  ["Arrefecer rapidamente", "Reduzir rapidamente a temperatura"],
  ["depois de o molho sair do lume", "depois de retirar o molho da fonte de calor"],
  ["Baixar o lume para uma fervura suave", "Reduzir o calor até obter uma fervura suave"],
  ["manter o lume", "manter o mesmo calor"],
  ["Aumentar o lume", "Aumentar o calor"],
  ["frigideiras e tabuleiros", "frigideiras e recipientes de forno"],
  ["Um pequeno-almoço tranquilo e um plano que parece realmente possível", "Uma primeira refeição tranquila e um plano que parece realmente possível"],
  ["Ao pequeno-almoço, a sua personalidade é…", "Na primeira refeição do dia, qual opção combina mais com a sua personalidade?"],
  ["Pequeno-almoço? Prefiro uma entrada triunfal ao almoço", "Primeira refeição? Prefiro começar em grande mais tarde"],
  ["Surge uma noite livre. Que plano combina mais consigo?", "Surge uma noite livre. Qual plano descreve melhor a sua preferência?"],
  ["Que lema sobre comida combina mais consigo?", "Qual lema sobre comida melhor descreve a sua preferência?"],
  ["Que risco combina mais consigo?", "Qual risco mais se aproxima da sua escolha?"],
  ["Comparar o mês consigo mesmo", "Comparar o mês aos próprios dados"],
  ["Uma pequena quantidade de acidez", "Um toque de acidez"],
  ["Cozedura a vapor", "Cozinhar a vapor"],
  ["Uma receita usa 300 g de farinha por dose. Quanta farinha é necessária para duas doses?", "Uma receita usa 300 g de farinha por preparo. Quanta farinha é necessária para dois preparos?"],
  ["Uma sopa está a ferver intensamente e a reduzir demasiado depressa.", "Uma sopa ferve intensamente e reduz depressa demais."],
  ["Um prato está a dourar depressa por fora", "Um prato doura depressa por fora"],
  ["Uma encomenda passa", "Um pedido passa"],
  ["a zona de empratamento", "a área de montagem dos pratos"],
  ["Lata de óleo", "Símbolo do óleo"],
  ["sistema de travagem", "sistema de frenagem"],
  ["discos de travão", "discos do sistema de frenagem"],
  ["Pinça de travão", "Pinça do sistema de frenagem"],
  ["Embraiagem ou transmissão", "Sistema de acoplamento do motor ou transmissão"],
  ["a centralina", "o módulo de gestão do motor"],
  ["ao ralenti", "com o motor parado e funcionando"],
  ["Ao ralenti", "Com o motor parado e funcionando"],
  ["a respetiva linha pontilhada", "a linha pontilhada ligada a ele"],
  ["O segundo caráter", "O segundo símbolo"],
  ["Que dois carateres mudaram?", "Que dois símbolos mudaram?"],
  ["numa grelha 3×3", "num quadro 3×3"],
  ["Grelha de três por três", "Quadro de três por três"],
  ["uma observação invulgar", "uma observação incomum"],
  ["Que planificação pode ser dobrada para formar um cubo?", "Que desenho pode ser dobrado para formar um cubo?"],
  ["Um padrão roda 90°", "Um padrão faz uma rotação de 90°"],
  ["Depois de rodar 90° no sentido horário", "Depois de uma rotação de 90° no sentido horário"],
  ["Rodar 90° no sentido horário", "Rotação de 90° no sentido horário"],
  ["Para que serve um grupo de controlo?", "Para que serve um grupo que não recebe a alteração testada?"],
  ["Um inquérito entre voluntários", "Uma pesquisa com voluntários"],
  ["O inquérito tem respostas", "A pesquisa tem respostas"],
  ["Um inquérito indica", "Uma pesquisa indica"],
  ["A procura crescerá", "O interesse do público crescerá"],
  ["A procura caiu", "O interesse do público caiu"],
  ["como mudam as conclusões?", "como muda o número de pessoas que concluem o processo?"],
  ["de 50 inquiridos", "de 50 participantes"],
  ["um único comentário anónimo", "um único comentário sem identificação"],
  ["Peça de puzzle", "Peça de encaixe"],
  ["peça de puzzle", "peça de encaixe"],
  ["Recorde o início:", "Pense no início:"],
  ["Subtraia o número associado a SUL ao número associado a OESTE.", "Subtraia do número associado a OESTE o número associado a SUL."],
  ["A que horas era a partida de Sarah?", "A que horas estava marcada a partida de Sarah?"],
  ["a meio do dia", "no meio do dia"],
  ["É exatamente o que estou a fazer agora", "É exatamente o que acontece agora"],
  ["Fatias de maçã, frutos secos e um pouco de chocolate negro", "Fatias de maçã, nozes e um pouco de chocolate amargo"],
  ["Húmus, azeitonas e legumes crocantes", "Pasta de grão-de-bico, azeitonas e legumes crocantes"],
  ["Algo suficientemente fiável", "Algo suficientemente seguro"],
  ["Algures em casa, tecnicamente", "Em algum lugar da casa, em teoria"],
  ["Substituída por café até nova indicação", "Substituída por café por tempo indeterminado"],
  ["Uma corrida a sério", "Uma corrida de verdade"],
  ["Quando o stress entra na sala", "Quando a pressão aparece"],
  ["à segunda-feira normalmente estou", "na segunda-feira normalmente estou"],
  ["A recomeçar com uma rotina reconfortante", "De volta a uma rotina reconfortante"],
  ["A fazer parte de uma história", "Numa história"],
  ["A passar entre conversas e depois a fazer uma pausa tranquila", "A circular entre conversas e depois fazer uma pausa tranquila"],
  ["Fiável de uma forma agradavelmente normal", "Confiável de uma forma agradavelmente normal"],
  ["Confiável de uma forma agradavelmente normal", "De confiança, de uma forma agradavelmente normal"],
  ["Uma história absurda a acontecer em tempo real", "Uma história absurda que acontece em tempo real"],
  ["Fazer uma pausa a sério", "Fazer uma pausa de verdade"],
  ["uma tarefa aborrecida", "uma tarefa tediosa"],
  ["Imagino-me a chegar…", "Imagino que vou chegar…"],
  ["que a procura crescerá", "que o interesse do público crescerá"],
  ["Invulgar", "Incomum"],
  ["sem controlo fiável de tempo e temperatura", "sem verificação segura de tempo e temperatura"],
  ["Travão de estacionamento", "Sistema de estacionamento"],
  ["Pedal da embraiagem", "Pedal que desacopla o motor"],
  ["se a travagem parecer normal", "se a frenagem parecer normal"],
  ["Pedal do travão mais firme", "Pedal do sistema de frenagem mais firme"],
  ["de forma fiável", "com consistência"],
  ["Interruptor das luzes de travão", "Interruptor das luzes do sistema de frenagem"],
  ["Controlo de ignição, alimentação e sinais de sincronização", "Gestão da ignição, alimentação e sinais de sincronização"],
  ["Controlo da pressão dos pneus", "Verificação da pressão dos pneus"],
  ["Travagem. Sistemas.", "Frenagem. Sistemas."],
  ["de uma grelha 3×3", "de um quadro 3×3"],
  ["Variável de controlo", "Variável mantida constante"],
  ["Há uma tarefa a fazer aqui perto.", "Há uma tarefa aqui perto."],
  ["Começa mentalmente a fazer as malas", "Já prepara as malas mentalmente"],
  ["Precisamos de ajuda algures perto da estrada", "Precisamos de ajuda em algum lugar perto da estrada"],
  ["Esperar até ao próximo controlo previsto", "Esperar pela próxima avaliação prevista"],
  ["Memory Challenger", "Desafiante da memória"],
  ["Challenger", "Desafiante"],
]);

const localeReplacements = {
  de: new Map([
    ["Acht endgültige Entscheidungen stehen nun zwischen Ihnen und Ihrem vollständigen Chef-Bericht.", "Nur noch acht Entscheidungen bis zu Ihrem vollständigen Küchenbericht."],
    ["Nicht als steril betrachten; ersetzen oder angemessen Unterstützung hinzuziehen", "Nicht als steril betrachten; ersetzen oder angemessene Unterstützung hinzuziehen"],
    ["Eine Schreibkraft und eine analysierende Person, die präsentiert", "Eine schreibstarke Person und eine analytische Person mit Präsentationsstärke"],
    ["Noch stärker drücken, bis der Druck endlich nachlässt", "Noch mehr Tempo machen, bis der Druck endlich nachlässt"],
    ["Einem langsamen Frühstück", "Einem ruhigen Frühstück"],
    ["Zwischen Gesprächen unterwegs und dann kurz in ruhiger Pause", "Zwischen Gesprächen unterwegs und danach bei einer ruhigen Pause"],
    ["Meine Siebziger", "Über 70"],
    ["Meine Achtziger", "Über 80"],
    ["Meine Neunziger", "Über 90"],
    ["Zwischen Gesprächen unterwegs und danach bei einer ruhigen Pause", "Im Gespräch mit verschiedenen Gruppen, bevor Sie sich eine ruhige Pause gönnen"],
    ["Memory Challenger", "Gedächtnis-Herausforderer"],
    ["Challenger", "Herausforderer"],
    ["MATCH:", "VERGLEICH:"],
    ["REFERENCE:", "VORLAGE:"],
  ]),
  it: new Map([
    ["Otto decisioni finali ora si trovano tra voi e il vostro rapporto completo Chef.", "Mancano otto decisioni al tuo rapporto culinario completo."],
    ["Quale gas ha raccolto il sangue quando torna dai polmoni?", "Di quale gas si è arricchito il sangue quando torna dai polmoni?"],
    ["Ottenere rapidamente una valutazione da un professionista qualificato della maternità", "Ottenere rapidamente una valutazione da un professionista sanitario qualificato"],
    ["Quale cambiamento nella consegna merita più attenzione?", "Quale cambiamento nel passaggio di consegne merita più attenzione?"],
    ["Quale apertura rende più chiara la consegna?", "Quale apertura rende più chiaro il passaggio di consegne?"],
    ["Quale dettaglio deve essere riportato con maggiore urgenza durante la consegna?", "Quale dettaglio deve essere comunicato con maggiore urgenza durante il passaggio di consegne?"],
    ["Quale frase è la consegna concisa più chiara?", "Quale frase offre il passaggio di consegne più chiaro e conciso?"],
    ["Stare alla larga, guidare gli altri verso un percorso più sicuro e avvertire l’assistenza appropriata", "Stare alla larga, guidare gli altri verso un percorso più sicuro e allertare i soccorsi adeguati"],
    ["Una piccola quantità di acidità", "Un tocco di acidità"],
    ["Oliatore", "Simbolo dell’olio"],
    ["Misuratore massa aria", "Sensore di massa d’aria"],
    ["Sono ammessi entrambi o nessuno dei due.", "Alcuni possono usare entrambi i servizi oppure nessuno dei due."],
    ["Una colazione lenta", "Una colazione tranquilla"],
    ["Challenger", "Sfidante"],
    ["MATCH:", "CONFRONTO:"],
    ["REFERENCE:", "REFERENZA:"],
  ]),
  nl: new Map([
    ["Acht besluiten staan nu tussen jou en je volledige Chef rapport.", "Nog acht beslissingen en je volledige keukenrapport is klaar."],
    ["Een recept gebruikt 300 g bloem per hoeveelheid. Hoeveel is nodig voor twee hoeveelheden?", "Een recept gebruikt 300 g bloem per batch. Hoeveel is nodig voor twee batches?"],
    ["Blauwe kop", "Blauwe mok"],
    ["Welk bouwplaat kan tot een kubus worden gevouwen?", "Welke bouwplaat kan tot een kubus worden gevouwen?"],
    ["Een behoorlijke afbouw die meestal werkt", "Een rustige afsluiting van de dag die meestal werkt"],
    ["Challenger", "Uitdager"],
    ["MATCH:", "VERGELIJK:"],
    ["REFERENCE:", "VOORBEELD:"],
  ]),
  es: new Map([
    ["Ocho decisiones finales ahora están entre usted y su informe completo del Chef.", "Solo ocho decisiones finales te separan de tu informe culinario completo."],
    ["Eliminan desechos de la sangre y ayudan a regular el equilibrio de agua", "Eliminan desechos de la sangre y ayudan a regular el equilibrio hídrico"],
    ["Hay un deterioro claro que requiere una evaluación cualificada rápida", "Hay un deterioro claro que requiere una evaluación rápida por personal cualificado"],
    ["Mantenerse alejado, guiar a los demás hacia una ruta más segura y avisar a la ayuda adecuada", "Mantenerse alejado, guiar a los demás hacia una ruta más segura y alertar a los servicios adecuados"],
    ["Una pequeña cantidad de acidez", "Un toque de acidez"],
    ["Aceitera", "Símbolo del aceite"],
    ["Se permiten ambos o ninguno.", "Es posible que algunos usen ambos servicios o ninguno de los dos."],
    ["Memory Challenger", "Aspirante de memoria"],
    ["Challenger", "Aspirante"],
    ["MATCH:", "COINCIDENCIA:"],
    ["REFERENCE:", "MODELO:"],
  ]),
  fr: new Map([
    ["Huit décisions finales se situent maintenant entre vous et votre rapport complet du Chef.", "Plus que huit décisions avant de découvrir votre rapport culinaire complet."],
    ["Repati avec une petite habitude réconfortante", "Reparti avec une petite habitude réconfortante"],
    ["Challenger", "Candidat"],
    ["MATCH:", "CORRESPONDANCE :"],
    ["REFERENCE:", "MODÈLE :"],
  ]),
  pt: new Map([
    ["MATCH:", "CORRESPONDÊNCIA:"],
    ["REFERENCE:", "MODELO:"],
  ]),
};

function applyReplacementMap(value, replacements) {
  if (typeof value === "string") {
    let output = value;
    for (const [source, replacement] of replacements) output = output.replaceAll(source, replacement);
    return output;
  }
  if (Array.isArray(value)) return value.map((item) => applyReplacementMap(item, replacements));
  if (value && typeof value === "object") {
    const entries = Object.entries(value).map(([key, item]) => [
      applyReplacementMap(key, replacements),
      applyReplacementMap(item, replacements),
    ]);
    for (const key of Object.keys(value)) delete value[key];
    for (const [key, item] of entries) value[key] = item;
  }
  return value;
}

function neutralizePortuguese(value) {
  if (typeof value === "string") {
    // Keep the two deliberately inclusive PT-BR/PT-PT automotive pairs stable
    // when this migration is run more than once. Without placeholders,
    // replacements such as "sistema de travagem" can turn an already-neutral
    // "travagem/frenagem" pair into "frenagem/frenagem".
    let output = value
      .replaceAll("frenagem/frenagem", "travagem/frenagem")
      .replaceAll("Frenagem/frenagem", "Travagem/frenagem")
      .replaceAll("travagem/frenagem", "__PT_BRAKING_NOUN__")
      .replaceAll("Travagem/frenagem", "__PT_BRAKING_NOUN_CAP__")
      .replaceAll("travão/freio", "__PT_BRAKE_NOUN__")
      .replaceAll("Travão/freio", "__PT_BRAKE_NOUN_CAP__");
    for (const [source, replacement] of portugueseReplacements) output = output.replaceAll(source, replacement);
    return output
      .replaceAll("__PT_BRAKING_NOUN_CAP__", "Travagem/frenagem")
      .replaceAll("__PT_BRAKING_NOUN__", "travagem/frenagem")
      .replaceAll("__PT_BRAKE_NOUN_CAP__", "Travão/freio")
      .replaceAll("__PT_BRAKE_NOUN__", "travão/freio");
  }
  if (Array.isArray(value)) return value.map(neutralizePortuguese);
  if (value && typeof value === "object") {
    const entries = Object.entries(value).map(([key, item]) => [neutralizePortuguese(key), neutralizePortuguese(item)]);
    for (const key of Object.keys(value)) delete value[key];
    for (const [key, item] of entries) value[key] = item;
  }
  return value;
}

function polishScoreProfiles(content, locale, slug) {
  const profiles = content.results?.profiles;
  const copy = scoreProfileCopy[locale];
  if (!Array.isArray(profiles) || !content.results?.score || profiles.length !== 6) return;
  profiles.forEach((profile, index) => {
    profile.tier = copy.tiers[index];
    profile.copy = copy.copies[index];
    if (locale === "pt" && portugueseProfileTitles[slug]) profile.title = portugueseProfileTitles[slug][index];
  });
  content.results.score.disclaimer = copy.disclaimer;
  const areas = (content.results.dimensions ?? []).map((dimension) => dimension.label).join(" · ");
  if (content.about?.body && areas) content.about.body = aboutCopy[locale](areas).join("\n\n");
  if (content.about?.disclaimer) content.about.disclaimer = copy.disclaimer;
  if (content.results.score.insights?.details?.analysisCopy) {
    content.results.score.insights.details.analysisCopy = analysisCopy[locale];
  }
  if (locale === "pt" && content.about?.howToPlay?.steps?.[1]) {
    content.about.howToPlay.steps[1] = "Escolha uma resposta por pergunta; a correção só aparece no resultado final.";
  }
  if (locale === "pt" && content.results.score.insights) {
    const insights = content.results.score.insights;
    insights.missed = "Perguntas não acertadas";
    if (insights.details) {
      insights.details.roadmapItems = (insights.details.roadmapItems ?? []).map((item) => item === "Respostas falhadas" ? "Respostas incorretas" : item);
      insights.details.positionTitle = "Rumo ao objetivo de 80%";
      insights.details.positionCopy = "O objetivo é acertar 32 de 40 perguntas. O indicador mostra a distância desta tentativa em relação aos 80%, sem comparação com outras pessoas.";
      if (insights.details.tips?.[2]) {
        insights.details.tips[2].title = "Tente novamente com outro olhar";
        insights.details.tips[2].copy = "Outra tentativa permite verificar se uma área diferente se torna a mais forte.";
      }
    }
  }
}

const nextJobPrefixes = {
  fr: "PROCHAINE MISSION",
  de: "NÄCHSTER AUFTRAG",
  it: "PROSSIMO INTERVENTO",
  nl: "VOLGENDE OPDRACHT",
  es: "SIGUIENTE TRABAJO",
  pt: "PRÓXIMO SERVIÇO",
};

const eyebrowCopy = {
  fr: {cambridge:"LE DÉFI CAMBRIDGE",chef:"LE PASS CULINAIRE",grammar:"LE DÉFI DE RELECTURE",harvard:"LE COMITÉ D’ADMISSION",iq:"LE COFFRE DE L’INTELLIGENCE",mechanic:"L’ATELIER DE DIAGNOSTIC",memory:"DÉFI MÉMOIRE",midwifery:"CENTRE DE NAISSANCE",nursing:"DÉFI D’ENTRÉE EN SOINS",oxford:"LE DÉFI DU TUTORAT",paramedic:"DÉFI D’INTERVENTION D’URGENCE",vision:"LABORATOIRE D’OBSERVATION"},
  de: {cambridge:"DIE CAMBRIDGE-AUFGABE",chef:"DIE KÜCHENPRÜFUNG",grammar:"DIE KORREKTURAUFGABE",harvard:"DIE ZULASSUNGSKOMMISSION",iq:"DER INTELLIGENZTRESOR",mechanic:"DIE DIAGNOSEWERKSTATT",memory:"GEDÄCHTNISAUFGABE",midwifery:"RUHIGES GEBURTSZENTRUM",nursing:"PFLEGE-AUFNAHMEPRÜFUNG",oxford:"DIE TUTORIUMSAUFGABE",paramedic:"RETTUNGSDIENST-AUFNAHMEPRÜFUNG",vision:"LABOR FÜR VISUELLE WAHRNEHMUNG"},
  it: {cambridge:"LA SFIDA CAMBRIDGE",chef:"LA PROVA CULINARIA",grammar:"LA SFIDA DI REVISIONE",harvard:"LA COMMISSIONE DI AMMISSIONE",iq:"LA CASSAFORTE DELL’INTELLIGENZA",mechanic:"L’OFFICINA DI DIAGNOSI",memory:"SFIDA DI MEMORIA",midwifery:"CENTRO NASCITA",nursing:"PROVA D’INGRESSO IN INFERMIERISTICA",oxford:"LA SFIDA DEL TUTORATO",paramedic:"PROVA D’INGRESSO PER PARAMEDICI",vision:"LABORATORIO DI OSSERVAZIONE"},
  nl: {cambridge:"DE CAMBRIDGE-UITDAGING",chef:"DE KEUKENPROEF",grammar:"DE REDACTIE-UITDAGING",harvard:"DE TOELATINGSCOMMISSIE",iq:"DE INTELLIGENTIEKLUIS",mechanic:"DE DIAGNOSEWERKPLAATS",memory:"GEHEUGENUITDAGING",midwifery:"RUSTIG GEBOORTECENTRUM",nursing:"TOELATINGSPROEF VERPLEEGKUNDE",oxford:"DE TUTORIALUITDAGING",paramedic:"TOELATINGSPROEF AMBULANCEZORG",vision:"LAB VOOR VISUELE FOCUS"},
  es: {cambridge:"EL DESAFÍO CAMBRIDGE",chef:"LA PRUEBA CULINARIA",grammar:"EL DESAFÍO DE CORRECCIÓN",harvard:"EL COMITÉ DE ADMISIÓN",iq:"LA BÓVEDA DE LA INTELIGENCIA",mechanic:"EL TALLER DE DIAGNÓSTICO",memory:"DESAFÍO DE MEMORIA",midwifery:"CENTRO DE NACIMIENTO",nursing:"PRUEBA DE INGRESO EN ENFERMERÍA",oxford:"EL DESAFÍO DE LA TUTORÍA",paramedic:"PRUEBA DE INGRESO PARA PARAMÉDICOS",vision:"LABORATORIO DE ENFOQUE VISUAL"},
  pt: {cambridge:"O DESAFIO CAMBRIDGE",chef:"A PROVA CULINÁRIA",grammar:"O DESAFIO DE REVISÃO",harvard:"A COMISSÃO DE ADMISSÃO",iq:"O COFRE DA INTELIGÊNCIA",mechanic:"A OFICINA DE DIAGNÓSTICO",memory:"DESAFIO DE MEMÓRIA",midwifery:"CENTRO DE NASCIMENTO",nursing:"PROVA DE ADMISSÃO EM ENFERMAGEM",oxford:"O DESAFIO DA TUTORIA",paramedic:"PROVA DE ADMISSÃO PARA PARAMÉDICOS",vision:"LABORATÓRIO DE FOCO VISUAL"},
};

const journeyCopy = {
  fr: {
    grammar: {
      titles: ["Première révision terminée", "Construction maîtrisée", "Vous avez dépassé la moitié", "Révision finale en vue", "QUIZ DE GRAMMAIRE TERMINÉ"],
      copies: ["Les premières phrases sont corrigées. La suite demande plus de précision.", "Accords, verbes et ponctuation entrent maintenant en jeu.", "Les pièges les plus subtils vous attendent.", "Il ne reste plus que la révision finale.", "Votre résultat de grammaire est prêt à être dévoilé."],
      taglines: ["Propositions. Accords. Clarté.", "Verbes. Ponctuation. Précision.", "Erreurs plausibles. Indices minuscules.", "Relecture complète. Jugement final."],
    },
    iq: {
      titles: ["Premier défi terminé", "Le coffre se complique", "Vous avez dépassé la moitié", "Le coffre final vous attend", "TEST D’INTELLIGENCE TERMINÉ"],
      copies: ["La difficulté augmente dès maintenant.", "Les prochains casse-têtes exigent un raisonnement plus affûté.", "Les énigmes avancées vous attendent.", "Il ne reste plus qu’un dernier défi.", "Votre résultat est prêt à être dévoilé."],
      taglines: ["Suites. Codes. Règles cachées.", "Relations. Déductions. Logique rapide.", "Réponses plausibles. Indices minuscules.", "Plusieurs étapes. Précision. Déduction finale."],
    },
    mechanic: {
      titles: ["Premier diagnostic terminé", "L’atelier se complique", "Vous avez dépassé la moitié", "Diagnostic final en vue", "DÉFI MÉCANIQUE TERMINÉ"],
      copies: ["Bon départ. La prochaine panne sera plus difficile à isoler.", "Air, carburant et allumage entrent maintenant en jeu.", "Le diagnostic devient plus exigeant.", "Il ne reste plus qu’un dernier passage à l’atelier.", "Votre résultat d’atelier est prêt à être dévoilé."],
      taglines: ["Pression. Sécurité. Adhérence.", "Combustion. Puissance. Cause et effet.", "Vibrations. Direction. Freinage. Systèmes.", "Indices du conducteur. Décisions finales."],
    },
    memory: {
      titles: ["Premiers souvenirs captés", "Mémoire visuelle enregistrée", "Mémoire de travail cartographiée", "Votre profil mémoire se précise", "TEST DE MÉMOIRE TERMINÉ"],
      copies: ["Les premiers indices sont enregistrés. La suite affine le résultat.", "Couleurs, positions et détails façonnent maintenant votre résultat.", "Les nombres, l’ordre et la manipulation ont été ajoutés.", "Il ne reste plus que le défi mémoire final.", "Votre résultat au test de mémoire est prêt à être dévoilé."],
      taglines: ["Couleurs. Positions. Changements.", "Chiffres. Ordre. Mémoire de travail.", "Interférences. Indices proches. Souvenirs anciens.", "Rappel différé. Manipulation. Derniers souvenirs."],
    },
    vision: {
      titles: ["Premier regard validé", "Détails visuels captés", "Vous avez dépassé la moitié", "Mise au point finale en vue", "TEST VISUEL TERMINÉ"],
      copies: ["Bon départ. Les prochains écarts seront plus discrets.", "Formes, positions et différences entrent maintenant en jeu.", "Les pièges optiques vous attendent.", "Il ne reste plus qu’un dernier défi visuel.", "Votre résultat visuel est prêt à être dévoilé."],
      taglines: ["Formes. Différences. Ordre visuel.", "Suites. Rotation. Direction.", "Interférences. Suivi. Changements subtils.", "Indices mêlés. Dernière mise au point."],
    },
    "years-left": {
      titles: ["Votre rythme quotidien est enregistré", "Votre mode de vie se précise", "Vos habitudes de récupération sont ajoutées", "Votre estimation est presque prête", "VOTRE ESTIMATION EST PRÊTE"],
      copies: ["Vos habitudes quotidiennes commencent à façonner l’estimation.", "Alimentation et mouvement font maintenant partie du calcul.", "Sommeil, stress et récupération ont affiné la prédiction.", "Il ne reste plus qu’une dernière phase de calcul.", "Votre prédiction est terminée."],
      taglines: ["Alimentation. Énergie. Mouvement quotidien.", "Sommeil. Stress. Récupération.", "Relations. Projets. Choix quotidiens.", "Perspective. Priorités. Dernier calibrage."],
    },
  },
  de: {
    grammar: {titles:["Erste Korrektur abgeschlossen","Satzbau gemeistert","Mehr als die Hälfte geschafft","Als Nächstes: die Endkorrektur","GRAMMATIKQUIZ ABGESCHLOSSEN"],copies:["Die ersten Sätze sind korrigiert. Jetzt wird es genauer.","Nun kommen Kongruenz, Verbformen und Zeichensetzung hinzu.","Die feinsten Sprachfallen warten als Nächstes.","Nur die Endkorrektur steht noch aus.","Ihr Grammatikergebnis kann jetzt angezeigt werden."],taglines:["Satzteile. Kongruenz. Klarheit.","Verben. Zeichensetzung. Präzision.","Plausible Fehler. Winzige Hinweise.","Gesamtkorrektur. Letztes Urteil."]},
    iq: {titles:["Erste Herausforderung geschafft","Der Tresor wird schwieriger","Mehr als die Hälfte geschafft","Der Intelligenztresor wartet","INTELLIGENZTEST ABGESCHLOSSEN"],copies:["Ab jetzt steigt die Schwierigkeit.","Die nächsten Rätsel verlangen schärferes Denken.","Als Nächstes folgen anspruchsvolle Aufgaben.","Nur eine letzte Herausforderung bleibt.","Ihr Ergebnis kann jetzt angezeigt werden."],taglines:["Folgen. Codes. Versteckte Regeln.","Beziehungen. Schlüsse. Schnelle Logik.","Plausible Antworten. Winzige Hinweise.","Mehrere Schritte. Präzision. Letzte Schlüsse."]},
    mechanic: {titles:["Erste Diagnose abgeschlossen","Die Werkstatt wird anspruchsvoller","Mehr als die Hälfte geschafft","Als Nächstes: die Enddiagnose","MECHANIK-HERAUSFORDERUNG ABGESCHLOSSEN"],copies:["Guter Start. Der nächste Fehler ist schwerer einzugrenzen.","Nun kommen Luft, Kraftstoff und Zündung hinzu.","Die Fehlersuche wird ab jetzt anspruchsvoll.","Nur eine letzte Werkstattaufgabe bleibt.","Ihr Werkstattergebnis kann jetzt angezeigt werden."],taglines:["Druck. Sicherheit. Straßenkontakt.","Verbrennung. Leistung. Ursache und Wirkung.","Vibrationen. Lenkung. Bremsen. Systeme.","Fahrerhinweise. Letzte Entscheidungen."]},
    memory: {titles:["Erste Erinnerungen erfasst","Visuelle Muster erfasst","Arbeitsgedächtnis ermittelt","Ihr Gedächtnisprofil nimmt Form an","GEDÄCHTNISTEST ABGESCHLOSSEN"],copies:["Die ersten Hinweise sind erfasst. Die nächste Runde schärft das Ergebnis.","Farben, Positionen und Details prägen nun Ihr Ergebnis.","Zahlen, Reihenfolge und Verarbeitung sind jetzt berücksichtigt.","Nur die finale Gedächtnisaufgabe bleibt.","Ihr Gedächtnisergebnis kann jetzt angezeigt werden."],taglines:["Farben. Positionen. Veränderungen.","Ziffern. Reihenfolge. Arbeitsgedächtnis.","Ablenkung. Ähnliche Hinweise. Ältere Erinnerungen.","Verzögerter Abruf. Verarbeitung. Letzte Erinnerungen."]},
    vision: {titles:["Erster Fokus geschafft","Visuelle Details erfasst","Mehr als die Hälfte geschafft","Als Nächstes: der finale Fokus","SEHTEST ABGESCHLOSSEN"],copies:["Guter Start. Die nächsten Unterschiede werden feiner.","Formen, Positionen und Unterschiede kommen jetzt hinzu.","Als Nächstes warten optische Fallen.","Nur eine letzte visuelle Aufgabe bleibt.","Ihr visuelles Ergebnis kann jetzt angezeigt werden."],taglines:["Formen. Unterschiede. Visuelle Ordnung.","Folgen. Drehung. Richtung.","Ablenkung. Verfolgen. Kleine Änderungen.","Gemischte Hinweise. Letzte Fokusprüfung."]},
    "years-left": {titles:["Ihr Alltagsrhythmus ist erfasst","Ihr Lebensstil wird deutlicher","Erholungsmuster hinzugefügt","Ihre Schätzung ist fast fertig","IHRE SCHÄTZUNG IST BEREIT"],copies:["Ihre Alltagsgewohnheiten formen nun die Schätzung.","Ernährung und Bewegung sind jetzt Teil der Berechnung.","Schlaf, Stress und Erholung haben die Prognose verfeinert.","Nur eine letzte Berechnungsphase bleibt.","Ihre Prognose ist abgeschlossen."],taglines:["Ernährung. Energie. Alltagsbewegung.","Schlaf. Stress. Erholung.","Beziehungen. Pläne. Alltagsentscheidungen.","Ausblick. Prioritäten. Letzte Kalibrierung."]},
  },
  it: {
    grammar: {titles:["Prima revisione completata","Costruzione padroneggiata","Hai superato la metà","Ora manca la revisione finale","QUIZ DI GRAMMATICA COMPLETATO"],copies:["Le prime frasi sono corrette. Ora serve più precisione.","Entrano in gioco concordanze, verbi e punteggiatura.","Le trappole linguistiche più sottili sono le prossime.","Resta soltanto la revisione finale.","Il risultato di grammatica è pronto per essere svelato."],taglines:["Proposizioni. Concordanze. Chiarezza.","Verbi. Punteggiatura. Precisione.","Errori plausibili. Indizi minimi.","Revisione completa. Giudizio finale."]},
    iq: {titles:["Prima sfida completata","La cassaforte si complica","Hai superato la metà","La cassaforte finale ti aspetta","TEST D’INTELLIGENZA COMPLETATO"],copies:["Da qui la difficoltà aumenta.","I prossimi enigmi richiedono un ragionamento più acuto.","Ora arrivano gli enigmi avanzati.","Resta una sola sfida.","Il risultato è pronto per essere svelato."],taglines:["Sequenze. Codici. Regole nascoste.","Relazioni. Deduzioni. Logica rapida.","Risposte plausibili. Indizi minimi.","Più passaggi. Precisione. Deduzioni finali."]},
    mechanic: {titles:["Prima diagnosi completata","L’officina si fa più impegnativa","Hai superato la metà","Ora manca la diagnosi finale","SFIDA MECCANICA COMPLETATA"],copies:["Buon inizio. Il prossimo guasto sarà più difficile da isolare.","Ora entrano in gioco aria, carburante e accensione.","La ricerca dei guasti diventa più impegnativa.","Resta un solo passaggio in officina.","Il risultato dell’officina è pronto per essere svelato."],taglines:["Pressione. Sicurezza. Aderenza.","Combustione. Potenza. Causa ed effetto.","Vibrazioni. Sterzo. Freni. Sistemi.","Indizi del conducente. Decisioni finali."]},
    memory: {titles:["Primi ricordi acquisiti","Schemi visivi acquisiti","Memoria di lavoro rilevata","Il profilo della memoria prende forma","TEST DI MEMORIA COMPLETATO"],copies:["I primi indizi sono stati acquisiti. La prossima fase affina il risultato.","Colori, posizioni e dettagli stanno formando il risultato.","Numeri, ordine e manipolazione sono ora inclusi.","Resta soltanto la sfida finale di memoria.","Il risultato del test di memoria è pronto per essere svelato."],taglines:["Colori. Posizioni. Cambiamenti.","Cifre. Ordine. Memoria di lavoro.","Interferenze. Indizi simili. Ricordi lontani.","Richiamo differito. Manipolazione. Ultimi richiami."]},
    vision: {titles:["Primo sguardo superato","Dettagli visivi acquisiti","Hai superato la metà","Ora manca la messa a fuoco finale","TEST VISIVO COMPLETATO"],copies:["Buon inizio. Le prossime differenze saranno più sottili.","Ora entrano in gioco forme, posizioni e differenze.","Le trappole ottiche sono le prossime.","Resta una sola sfida visiva.","Il risultato visivo è pronto per essere svelato."],taglines:["Forme. Differenze. Ordine visivo.","Sequenze. Rotazione. Direzione.","Interferenze. Tracciamento. Piccoli cambiamenti.","Indizi combinati. Ultima messa a fuoco."]},
    "years-left": {titles:["Il ritmo quotidiano è acquisito","Il quadro dello stile di vita si precisa","Schemi di recupero aggiunti","La stima è quasi pronta","LA STIMA È PRONTA"],copies:["Le abitudini quotidiane stanno iniziando a formare la stima.","Alimentazione e movimento fanno ora parte del calcolo.","Sonno, stress e recupero hanno affinato la previsione.","Resta una sola fase di calcolo.","La previsione è completa."],taglines:["Alimentazione. Energia. Movimento quotidiano.","Sonno. Stress. Recupero.","Relazioni. Progetti. Scelte quotidiane.","Prospettiva. Priorità. Calibrazione finale."]},
  },
  nl: {
    grammar: {titles:["Eerste correctie voltooid","Zinsbouw onder controle","Je bent over de helft","Hierna volgt de eindredactie","GRAMMATICAQUIZ VOLTOOID"],copies:["De eerste zinnen zijn hersteld. Nu telt elk detail.","Overeenkomst, werkwoorden en leestekens komen nu samen.","De subtielste taalvallen volgen hierna.","Alleen de eindredactie resteert nog.","Je grammaticaresultaat staat klaar."],taglines:["Zinsdelen. Overeenkomst. Helderheid.","Werkwoorden. Leestekens. Precisie.","Aannemelijke fouten. Kleine aanwijzingen.","Volledige redactie. Laatste oordeel."]},
    iq: {titles:["Eerste uitdaging voltooid","De kluis wordt moeilijker","Je bent over de helft","De intelligentiekluis wacht","INTELLIGENTIETEST VOLTOOID"],copies:["Vanaf hier loopt de moeilijkheid op.","De volgende puzzels vragen scherper denkwerk.","Geavanceerde puzzels volgen hierna.","Er resteert nog één uitdaging.","Je resultaat staat klaar."],taglines:["Reeksen. Codes. Verborgen regels.","Relaties. Afleidingen. Snelle logica.","Aannemelijke antwoorden. Kleine aanwijzingen.","Meerdere stappen. Precisie. Laatste afleidingen."]},
    mechanic: {titles:["Eerste diagnose voltooid","De werkplaats wordt lastiger","Je bent over de helft","Hierna volgt de einddiagnose","MONTEURSUITDAGING VOLTOOID"],copies:["Goede start. De volgende storing is moeilijker te isoleren.","Nu komen lucht, brandstof en ontsteking erbij.","De foutopsporing wordt vanaf hier serieus.","Er resteert nog één werkplaatsopdracht.","Je werkplaatsresultaat staat klaar."],taglines:["Druk. Veiligheid. Wegcontact.","Verbranding. Vermogen. Oorzaak en gevolg.","Trillingen. Sturen. Remmen. Systemen.","Bestuurderssignalen. Laatste beslissingen."]},
    memory: {titles:["Eerste herinneringen vastgelegd","Visuele patronen vastgelegd","Werkgeheugen in kaart gebracht","Je geheugenprofiel krijgt vorm","GEHEUGENTEST VOLTOOID"],copies:["De eerste aanwijzingen zijn vastgelegd. De volgende ronde verfijnt het resultaat.","Kleuren, posities en details vormen nu je resultaat.","Getallen, volgorde en bewerking zijn toegevoegd.","Alleen de laatste geheugenuitdaging resteert.","Je geheugenresultaat staat klaar."],taglines:["Kleuren. Posities. Veranderingen.","Cijfers. Volgorde. Werkgeheugen.","Afleiding. Vergelijkbare aanwijzingen. Oudere herinneringen.","Uitgestelde herinnering. Bewerking. Laatste terugblik."]},
    vision: {titles:["Eerste blik voltooid","Visuele details vastgelegd","Je bent over de helft","Hierna volgt de laatste focus","VISUELE TEST VOLTOOID"],copies:["Goede start. De volgende verschillen worden subtieler.","Vormen, posities en verschillen komen nu samen.","Optische vallen volgen hierna.","Er resteert nog één visuele uitdaging.","Je visuele resultaat staat klaar."],taglines:["Vormen. Verschillen. Visuele volgorde.","Reeksen. Rotatie. Richting.","Afleiding. Volgen. Kleine veranderingen.","Gemengde aanwijzingen. Laatste focus."]},
    "years-left": {titles:["Je dagritme is vastgelegd","Je leefstijl wordt duidelijker","Herstelpatronen toegevoegd","Je schatting is bijna klaar","JE SCHATTING STAAT KLAAR"],copies:["Je dagelijkse gewoonten beginnen de schatting te vormen.","Voeding en beweging tellen nu mee in de berekening.","Slaap, stress en herstel hebben de voorspelling verfijnd.","Er resteert nog één berekeningsfase.","Je voorspelling is voltooid."],taglines:["Voeding. Energie. Dagelijkse beweging.","Slaap. Stress. Herstel.","Contact. Plannen. Dagelijkse keuzes.","Vooruitblik. Prioriteiten. Laatste ijking."]},
  },
  es: {
    grammar: {titles:["Primera revisión completada","Construcción dominada","Ya has superado la mitad","La revisión final es la siguiente","QUIZ DE GRAMÁTICA COMPLETADO"],copies:["Las primeras frases están corregidas. Ahora cuenta cada detalle.","Concordancia, verbos y puntuación entran ahora en juego.","Las trampas lingüísticas más sutiles vienen a continuación.","Solo queda la revisión final.","Tu resultado de gramática está listo."],taglines:["Cláusulas. Concordancia. Claridad.","Verbos. Puntuación. Precisión.","Errores plausibles. Pistas mínimas.","Revisión completa. Juicio final."]},
    iq: {titles:["Primer desafío completado","La bóveda se complica","Ya has superado la mitad","La bóveda final te espera","PRUEBA DE INTELIGENCIA COMPLETADA"],copies:["A partir de aquí aumenta la dificultad.","Los próximos acertijos exigen un razonamiento más preciso.","Los acertijos avanzados vienen a continuación.","Solo queda un desafío.","Tu resultado está listo."],taglines:["Secuencias. Códigos. Reglas ocultas.","Relaciones. Deducciones. Lógica rápida.","Respuestas plausibles. Pistas mínimas.","Varios pasos. Precisión. Deducciones finales."]},
    mechanic: {titles:["Primer diagnóstico completado","El taller se complica","Ya has superado la mitad","El diagnóstico final es el siguiente","DESAFÍO MECÁNICO COMPLETADO"],copies:["Buen comienzo. La próxima avería será más difícil de aislar.","Ahora entran en juego aire, combustible y encendido.","El diagnóstico se vuelve más exigente.","Solo queda una prueba de taller.","Tu resultado de taller está listo."],taglines:["Presión. Seguridad. Agarre.","Combustión. Potencia. Causa y efecto.","Vibraciones. Dirección. Frenado. Sistemas.","Pistas del conductor. Decisiones finales."]},
    memory: {titles:["Primeros recuerdos captados","Patrones visuales captados","Memoria de trabajo registrada","Tu perfil de memoria toma forma","PRUEBA DE MEMORIA COMPLETADA"],copies:["Las primeras pistas están registradas. La siguiente ronda afina el resultado.","Colores, posiciones y detalles ya están formando tu resultado.","Números, orden y manipulación ya están incluidos.","Solo queda el desafío final de memoria.","Tu resultado de memoria está listo."],taglines:["Colores. Posiciones. Cambios.","Dígitos. Orden. Memoria de trabajo.","Interferencia. Pistas parecidas. Recuerdos antiguos.","Recuerdo diferido. Manipulación. Últimos recuerdos."]},
    vision: {titles:["Primera mirada completada","Detalles visuales captados","Ya has superado la mitad","El enfoque final es el siguiente","PRUEBA VISUAL COMPLETADA"],copies:["Buen comienzo. Las próximas diferencias serán más sutiles.","Formas, posiciones y diferencias entran ahora en juego.","Las trampas ópticas vienen a continuación.","Solo queda un desafío visual.","Tu resultado visual está listo."],taglines:["Formas. Diferencias. Orden visual.","Secuencias. Rotación. Dirección.","Interferencia. Seguimiento. Cambios mínimos.","Pistas combinadas. Enfoque final."]},
    "years-left": {titles:["Tu ritmo diario está registrado","Tu estilo de vida se define","Patrones de recuperación añadidos","Tu estimación está casi lista","TU ESTIMACIÓN ESTÁ LISTA"],copies:["Tus hábitos diarios empiezan a formar la estimación.","La alimentación y el movimiento ya cuentan en el cálculo.","El sueño, el estrés y la recuperación han afinado la predicción.","Solo queda una fase de cálculo.","Tu predicción está completa."],taglines:["Alimentación. Energía. Movimiento diario.","Sueño. Estrés. Recuperación.","Conexiones. Planes. Decisiones diarias.","Perspectiva. Prioridades. Calibración final."]},
  },
  pt: {
    grammar: {titles:["Primeira revisão concluída","Construção dominada","Mais de metade concluída","A revisão final vem a seguir","QUIZ DE GRAMÁTICA CONCLUÍDO"],copies:["As primeiras frases estão corrigidas. Agora, cada detalhe conta.","Concordância, verbos e pontuação entram agora em jogo.","As armadilhas linguísticas mais discretas vêm a seguir.","Falta apenas a revisão final.","O resultado de gramática está pronto."],taglines:["Orações. Concordância. Clareza.","Verbos. Pontuação. Precisão.","Erros plausíveis. Pistas mínimas.","Revisão completa. Avaliação final."]},
    iq: {titles:["Primeiro desafio concluído","O cofre fica mais difícil","Mais de metade concluída","O cofre final vem a seguir","TESTE DE INTELIGÊNCIA CONCLUÍDO"],copies:["A dificuldade aumenta a partir daqui.","Os próximos enigmas exigem um raciocínio mais apurado.","Os enigmas avançados vêm a seguir.","Falta apenas um desafio.","O resultado está pronto."],taglines:["Sequências. Códigos. Regras escondidas.","Relações. Deduções. Lógica rápida.","Respostas plausíveis. Pistas mínimas.","Vários passos. Precisão. Deduções finais."]},
    mechanic: {titles:["Primeiro diagnóstico concluído","A oficina fica mais exigente","Mais de metade concluída","O diagnóstico final vem a seguir","DESAFIO MECÂNICO CONCLUÍDO"],copies:["Bom começo. O próximo problema será mais difícil de isolar.","Agora entram em jogo ar, combustível e ignição.","O diagnóstico torna-se mais exigente.","Falta apenas uma prova de oficina.","O resultado da oficina está pronto."],taglines:["Pressão. Segurança. Aderência.","Combustão. Potência. Causa e efeito.","Vibração. Direção. Travagem/frenagem. Sistemas.","Pistas ao volante. Decisões finais."]},
    memory: {titles:["Primeiras memórias captadas","Padrões visuais captados","Memória de trabalho analisada","O perfil de memória ganha forma","TESTE DE MEMÓRIA CONCLUÍDO"],copies:["As primeiras pistas estão guardadas. A próxima etapa afina o resultado.","Cores, posições e detalhes já ajudam a formar o resultado.","Números, ordem e manipulação já fazem parte do resultado.","Falta apenas o desafio final de memória.","O resultado do teste de memória está pronto."],taglines:["Cores. Posições. Mudanças.","Algarismos. Ordem. Memória de trabalho.","Interferência. Pistas semelhantes. Memórias antigas.","Recordação diferida. Manipulação. Últimas recordações."]},
    vision: {titles:["Primeiro olhar concluído","Detalhes visuais captados","Mais de metade concluída","O foco final vem a seguir","TESTE VISUAL CONCLUÍDO"],copies:["Bom começo. As próximas diferenças serão mais discretas.","Formas, posições e diferenças entram agora em jogo.","As armadilhas visuais vêm a seguir.","Falta apenas um desafio visual.","O resultado visual está pronto."],taglines:["Formas. Diferenças. Ordem visual.","Sequências. Rotação. Direção.","Interferência. Acompanhamento. Pequenas mudanças.","Pistas combinadas. Foco final."]},
    "years-left": {titles:["O ritmo diário foi analisado","O estilo de vida ganha definição","Padrões de recuperação adicionados","A estimativa está quase pronta","A ESTIMATIVA ESTÁ PRONTA"],copies:["Os hábitos diários começam a formar a estimativa.","A alimentação e o movimento já fazem parte do cálculo.","O sono, a pressão e a recuperação afinaram a previsão.","Falta apenas uma fase de cálculo.","A previsão está concluída."],taglines:["Alimentação. Energia. Movimento diário.","Sono. Pressão. Recuperação.","Relações. Planos. Escolhas diárias.","Visão de futuro. Prioridades. Calibração final."]},
  },
};

function polishShared(content, locale, slug) {
  const words = common[locale];
  const sourceCta = content.landing.cta;
  if (slug in entranceLabels) content.landing.cta = words.startTest;
  else if (/quiz/i.test(sourceCta)) content.landing.cta = words.startQuiz;
  else if (/test/i.test(sourceCta)) content.landing.cta = words.startTest;
  else content.landing.cta = words.start;

  for (const [index, stage] of (content.career?.stages ?? []).entries()) {
    stage.difficulty = words.difficulties[index] ?? stage.difficulty;
    if (index < 4) {
      stage.preAdButton = words.continue;
      if (stage.next) {
        stage.next.button = words.continue;
        stage.next.eyebrow = slug in entranceLabels ? words.examEyebrows[index] : words.challengeEyebrows[index];
        if (stage.next.difficulty !== undefined) stage.next.difficulty = words.difficulties[index + 1];
      }
    } else {
      stage.preAdButton = words.seeResult;
    }
  }
  if (content.checkpoint) {
    content.checkpoint.finalButton = words.seeResult;
    content.checkpoint.adNote = words.shortAdContinue;
    content.checkpoint.finalAdNote = words.shortAdResult;
  }
}

function applyLocalizedQuizCopy(content, locale, slug) {
  const copy = localizedQuizCopy[locale]?.[slug];
  if (!copy) throw new Error(`Missing curated ${locale} copy for ${slug}`);
  const [title, summary, intro, stageTitles] = copy;
  content.title = title;
  content.summary = summary;
  if (content.eyebrow !== undefined && eyebrowCopy[locale]?.[slug]) content.eyebrow = eyebrowCopy[locale][slug];
  content.landing.intro = intro;
  (content.stages ?? []).forEach((stage, index) => {
    stage.title = stageTitles[index];
  });
  (content.career?.stages ?? []).forEach((stage, index) => {
    if (stage.next && stageTitles[index + 1]) stage.next.title = stageTitles[index + 1];
  });
}

function applyJourneyCopy(content, locale, slug) {
  const journey = journeyCopy[locale]?.[slug];
  if (!journey) return;
  const stages = content.career?.stages ?? [];
  stages.forEach((stage, index) => {
    stage.preAdBadge = index === 4 ? journey.titles[index] : completedBadge[locale];
    stage.preAdTitle = journey.titles[index];
    stage.preAdCopy = journey.copies[index];
    stage.resultLabel = stage.preAdBadge;
    for (const band of Object.values(stage.resultBands ?? {})) {
      band.title = journey.titles[index];
      band.insight = journey.copies[index];
    }
    if (stage.next && journey.taglines[index]) stage.next.tagline = journey.taglines[index];
  });
  (content.checkpoint?.reveals ?? []).forEach((reveal, index) => {
    reveal.badge = stages[index]?.preAdBadge ?? reveal.badge;
    reveal.title = journey.titles[index];
    reveal.message = journey.copies[index];
  });
}

function applySharedUi(content, locale, slug) {
  const ui = sharedUi[locale];
  const entrance = slug in entranceLabels;
  const career = content.career ?? {};
  const setCareer = (key, value) => { if (key in career) career[key] = value; };
  setCareer("resultProgressLabel", entrance ? ui.examJourney : ui.progress);
  setCareer("resultProgressComplete", ui.progressComplete);
  setCareer("currentScoreLabel", slug === "years-left" ? ui.progress.toUpperCase() : entrance ? ui.examScore : ui.currentScore);
  setCareer("levelLabel", entrance ? ui.section : ui.level);
  setCareer("scoreSuffix", slug === "years-left" ? ui.progress.toLowerCase() : ui.correct);
  setCareer("journeyLabel", entrance ? ui.examJourney : ui.journey);
  const needsTotal = String(career.kitchensCleared ?? "").includes("{total}");
  setCareer("kitchensCleared", entrance
    ? (needsTotal ? ui.examClearedTwo : ui.examClearedOne)
    : (needsTotal ? ui.clearedTwo : ui.clearedOne));
  setCareer("currentRank", ui.currentProgress);
  setCareer("unlockEyebrow", ui.update);
  setCareer("unlockTitle", ui.nextReady);
  setCareer("unlockCopy", ui.readyCopy);
  setCareer("finalEyebrow", ui.finalEyebrow);
  setCareer("strongestLabel", ui.strongest);

  const stages = career.stages ?? [];
  if (stages[4]) setCareer("finalCareerTitle", stages[4].preAdBadge);
  stages.forEach((stage) => {
    if (stage.preAdEyebrow !== undefined) stage.preAdEyebrow = stage.preAdBadge;
  });

  if (content.checkpoint) {
    if ("nextPrefix" in content.checkpoint) content.checkpoint.nextPrefix = slug === "mechanic"
      ? nextJobPrefixes[locale]
      : entrance ? ui.examJourney : common[locale].challengeEyebrows[0].split(" · ")[0];
    if (stages[4]) {
      if ("finalBadge" in content.checkpoint) content.checkpoint.finalBadge = stages[4].preAdBadge;
      if ("finalTitle" in content.checkpoint) content.checkpoint.finalTitle = stages[4].preAdTitle;
      if ("finalCopy" in content.checkpoint) content.checkpoint.finalCopy = stages[4].preAdCopy;
    }
  }

  const finalCopy = content.results?.score?.insights?.details?.finalCopy;
  if (typeof finalCopy === "string" && finalCopy.includes("{score}")) {
    content.results.score.insights.details.finalCopy = slug === "chef"
      ? ui.finalCopy
      : finalCopyWithoutProfilePlaceholder[locale];
  }
  if (slug === "mechanic") {
    for (let index = 0; index < 4; index += 1) {
      if (stages[index]?.next) {
        stages[index].next.eyebrow = `${nextJobPrefixes[locale]} · ${common[locale].difficulties[index + 1].toUpperCase()}`;
      }
    }
    for (const reveal of content.checkpoint?.reveals ?? []) {
      // Mechanic's source reveal objects intentionally have no badge/icon keys.
      delete reveal.badge;
      delete reveal.icon;
    }
  }
}

function polishEntranceJourney(content, locale, slug) {
  const words = common[locale];
  const stages = content.career?.stages ?? [];
  stages.slice(0, 4).forEach((stage, index) => {
    stage.preAdBadge = examBadge[locale];
    stage.resultLabel = examBadge[locale];
    stage.preAdTitle = words.examGates[index];
    stage.preAdCopy = words.examCopies[index];
    for (const band of Object.values(stage.resultBands ?? {})) {
      band.title = stage.preAdTitle;
      band.insight = stage.preAdCopy;
    }
    if (stage.next) stage.next.tagline = entranceTaglines[locale][slug][index];
  });
  if (stages[4]) {
    stages[4].preAdBadge = examComplete[locale];
    stages[4].resultLabel = examComplete[locale];
    stages[4].preAdTitle = examComplete[locale];
    stages[4].preAdCopy = words.finalExamCopy;
    for (const band of Object.values(stages[4].resultBands ?? {})) {
      band.title = stages[4].preAdTitle;
      band.insight = stages[4].preAdCopy;
    }
  }
  (content.checkpoint?.reveals ?? []).forEach((reveal, index) => {
    reveal.badge = stages[index].preAdBadge;
    reveal.title = stages[index].preAdTitle;
    reveal.message = stages[index].preAdCopy;
  });
}

for (const slug of Object.keys(entranceLabels).concat(["grammar", "iq", "mechanic", "memory", "vision", "years-left"])) {
  for (const locale of locales) {
    const file = path.join(quizRoot, slug, `${locale}.json`);
    const content = JSON.parse(await fs.readFile(file, "utf8"));
    applyLocalizedQuizCopy(content, locale, slug);
    polishShared(content, locale, slug);
    if (slug in entranceLabels) polishEntranceJourney(content, locale, slug);
    else applyJourneyCopy(content, locale, slug);
    applySharedUi(content, locale, slug);
    if (slug === "years-left" && locale === "es" && content.career) {
      content.career.journeyLabel = "RECORRIDO DEL TEST";
    }
    polishScoreProfiles(content, locale, slug);
    if (localeReplacements[locale]) applyReplacementMap(content, localeReplacements[locale]);
    const rankLabels = slug in entranceLabels
      ? entranceCareerRanks[locale]
      : themedCareerRanks[slug]?.[locale];
    if (rankLabels && Array.isArray(content.career?.ranks)) {
      content.career.ranks.forEach((rank, index) => {
        if (rankLabels[index]) rank.label = rankLabels[index];
      });
    }
    if (locale === "pt") neutralizePortuguese(content);
    await fs.writeFile(file, `${JSON.stringify(content, null, 2)}\n`);
  }
}

console.log("Applied native shared-flow terminology to every localized quiz.");
